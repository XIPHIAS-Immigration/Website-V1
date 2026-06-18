import { NextResponse, type NextRequest } from "next/server";
import {
  extractJiopayMerchantTxnNo,
  getJiopayConfig,
  isJiopaySuccess,
  jiopayResponseCode,
  jiopayStatusLabel,
  auditJiopayPayload,
  verifyJiopaySecureHash,
} from "@/lib/payments/jiopay";
import { getJiopayOrder, updateJiopayOrder } from "@/lib/payments/jiopay-store";
import { getPlatformRepository } from "@/lib/platform/repository";
import { fulfillJiopayOrder } from "@/lib/payments/fulfillment";

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

function resolveSiteUrl(req: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.nextUrl.origin).replace(/\/+$/, "");
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
    const nextStatus =
      order?.status === "report_sent" || order?.status === "provisioned"
        ? order.status
        : success
          ? "paid"
          : "failed";

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
        data: { receivedPayload: auditJiopayPayload(payload) },
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

    const fulfillment = success
      ? await fulfillJiopayOrder(merchantTxnNo, { siteUrl: resolveSiteUrl(req) })
      : { status: "not_success" as const };

    const responsePayload = {
      ok: true,
      merchantTxnNo,
      paid: success,
      leadId: matchingLead?.id,
      fulfillment,
    };

    updateJiopayOrder(merchantTxnNo, {}, {
      type: "webhook_response",
      at: new Date().toISOString(),
      data: responsePayload,
    });

    return NextResponse.json(responsePayload);
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
