import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const payload = await req.json().catch(() => ({}));
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
        const contactName = String(contacts.find((item: any) => item?.wa_id === from)?.profile?.name ?? from);
        const body =
          String(message?.text?.body ?? "") ||
          String(message?.button?.text ?? "") ||
          String(message?.interactive?.button_reply?.title ?? "") ||
          "[non-text WhatsApp message]";

        const lead = repo.createLead({
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
          providerMessageId: String(message.id ?? ""),
        });
        created.push(conversation.id);
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}

