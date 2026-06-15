import { NextResponse, type NextRequest } from "next/server";
import {
  extractJiopayMerchantTxnNo,
  getJiopayConfig,
  isJiopaySuccess,
  jiopayResponseCode,
  jiopayStatusLabel,
  publicJiopayPayload,
  verifyJiopaySecureHash,
} from "@/lib/payments/jiopay";
import { getJiopayOrder, updateJiopayOrder } from "@/lib/payments/jiopay-store";
import { getPlatformRepository } from "@/lib/platform/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

async function readPayload(req: NextRequest): Promise<Payload> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await req.json().catch(() => ({}))) as Payload;
  }
  if (contentType.includes("form")) {
    const form = await req.formData().catch(() => null);
    if (!form) return {};
    return Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)]));
  }
  const text = await req.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text) as Payload;
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

async function provisionAfterSuccess(orderId: string, req: NextRequest) {
  if (process.env.JIOPAY_AUTO_PROVISION !== "true") return { status: "skipped" as const };
  const order = getJiopayOrder(orderId);
  if (!order) return { status: "missing_order" as const };

  const secret = process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET;
  if (!secret) return { status: "missing_registration_secret" as const };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    req.nextUrl.origin;

  const response = await fetch(`${siteUrl.replace(/\/+$/, "")}/api/platform/registration/provision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-registration-secret": secret },
    body: JSON.stringify({
      secret,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      track: order.track,
      country: order.country,
      program: order.program || order.productName,
      amount: order.amountInr,
      paymentReference: order.merchantTxnNo,
      product: order.productName,
      answers: order.answers,
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) return { status: "failed" as const, data };
  updateJiopayOrder(orderId, { status: "provisioned" }, {
    type: "registration_provisioned",
    at: new Date().toISOString(),
    data,
  });
  return { status: "provisioned" as const, data };
}

export async function POST(req: NextRequest) {
  const payload = await readPayload(req);

  try {
    const config = getJiopayConfig(req);
    if (!verifyJiopaySecureHash(payload, config.secretKey)) {
      return NextResponse.json({ ok: false, error: "Invalid Jiopay secureHash." }, { status: 400 });
    }

    const merchantTxnNo = extractJiopayMerchantTxnNo(payload);
    if (!merchantTxnNo) {
      return NextResponse.json({ ok: false, error: "Missing merchantTxnNo." }, { status: 400 });
    }

    const success = isJiopaySuccess(payload);
    const order = getJiopayOrder(merchantTxnNo);
    const repo = getPlatformRepository();
    const matchingLead = order?.leadId
      ? repo.listLeads().find((lead) => lead.id === order.leadId)
      : repo.listLeads().find((lead) => lead.tags.includes(`payment:${merchantTxnNo}`));
    const nextStatus = success ? "paid" : "failed";

    updateJiopayOrder(
      merchantTxnNo,
      {
        status: nextStatus,
        lastResponseCode: jiopayResponseCode(payload),
        lastStatusLabel: jiopayStatusLabel(payload),
      },
      {
        type: "webhook",
        at: new Date().toISOString(),
        data: publicJiopayPayload(payload),
      },
    );

    if (matchingLead) {
      repo.updateLeadStatus(matchingLead.id, success ? "case_opened" : "qualified");
      repo.createConversation({
        leadId: matchingLead.id,
        channel: "portal",
        direction: "inbound",
        from: "Jiopay",
        to: "XIPHIAS",
        body: `Jiopay S2S webhook ${success ? "confirmed payment" : "reported non-success status"} for ${merchantTxnNo}. Status: ${jiopayStatusLabel(payload) || jiopayResponseCode(payload)}`,
        providerMessageId: merchantTxnNo,
      });
    }

    const provisioning = success ? await provisionAfterSuccess(merchantTxnNo, req) : { status: "not_success" as const };

    return NextResponse.json({
      ok: true,
      merchantTxnNo,
      paid: success,
      leadId: matchingLead?.id,
      provisioning,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Jiopay webhook failed." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "jiopay-webhook" });
}

