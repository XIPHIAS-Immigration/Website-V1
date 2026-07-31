import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPlatformRepository } from "@/lib/platform/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validWebhookSignature(rawBody: string, suppliedSignature: string, secret: string) {
  if (!suppliedSignature.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const left = Buffer.from(suppliedSignature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, error: "Webhook verification failed." }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const appSecret = process.env.META_WABA_APP_SECRET || "";
  const signature = req.headers.get("x-hub-signature-256") || "";
  if (!appSecret) {
    return NextResponse.json({ ok: false, error: "WhatsApp app secret is not configured." }, { status: 503 });
  }
  if (!validWebhookSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid webhook payload." }, { status: 400 });
  }
  const repo = getPlatformRepository();
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const created: string[] = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const messages = Array.isArray(change?.value?.messages) ? change.value.messages : [];
      const contacts = Array.isArray(change?.value?.contacts) ? change.value.contacts : [];
      for (const message of messages) {
        const from = String(message.from ?? "");
        const providerMessageId = String(message.id ?? "");
        if (!from || (providerMessageId && repo.hasConversationProviderMessageId(providerMessageId))) {
          continue;
        }
        const contactName = String(contacts.find((item: any) => item?.wa_id === from)?.profile?.name ?? from);
        const body =
          String(message?.text?.body ?? "") ||
          String(message?.button?.text ?? "") ||
          String(message?.interactive?.button_reply?.title ?? "") ||
          "[non-text WhatsApp message]";

        const lead =
          repo.listLeads().find((item) => item.source === "whatsapp" && item.phone === from) ||
          repo.createLead({
            source: "whatsapp",
            name: contactName,
            phone: from,
            message: body,
            tags: ["whatsapp-inbound"],
            consent: true,
          });
        const conversation = repo.createConversation({
          leadId: lead.id,
          channel: "whatsapp",
          direction: "inbound",
          from,
          to: "XIPHIAS",
          body,
          providerMessageId,
        });
        created.push(conversation.id);
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}
