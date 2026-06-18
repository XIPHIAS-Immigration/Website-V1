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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

async function readPayload(req: NextRequest): Promise<Payload> {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  if (req.method === "GET") return params;

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return { ...params, ...((await req.json().catch(() => ({}))) as Payload) };
  }
  if (contentType.includes("form")) {
    const form = await req.formData().catch(() => null);
    return {
      ...params,
      ...(form ? Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)])) : {}),
    };
  }
  const text = await req.text().catch(() => "");
  if (!text) return params;
  try {
    return { ...params, ...(JSON.parse(text) as Payload) };
  } catch {
    return { ...params, ...Object.fromEntries(new URLSearchParams(text).entries()) };
  }
}

async function handleReturn(req: NextRequest) {
  const payload = await readPayload(req);
  let verified = false;
  const merchantTxnNo = extractJiopayMerchantTxnNo(payload);
  let status = "pending";

  try {
    const config = getJiopayConfig(req);
    verified = verifyJiopaySecureHash(payload, config.secretKey);
    if (verified && isJiopaySuccess(payload)) status = "success";
    else if (verified && Object.keys(payload).length) status = "failed";
  } catch {
    status = "pending";
  }

  if (merchantTxnNo) {
    const existingOrder = getJiopayOrder(merchantTxnNo);
    const orderStatus =
      existingOrder?.status === "paid" || existingOrder?.status === "provisioned"
        ? existingOrder.status
        : status === "failed"
          ? "failed"
          : "returned";

    const redirectUrl = new URL("/payment/jiopay/return", req.nextUrl.origin);
    redirectUrl.searchParams.set("status", status);
    redirectUrl.searchParams.set("verified", verified ? "1" : "0");
    redirectUrl.searchParams.set("order", merchantTxnNo);

    updateJiopayOrder(
      merchantTxnNo,
      {
        status: orderStatus,
        lastResponseCode: jiopayResponseCode(payload),
        lastStatusLabel: jiopayStatusLabel(payload),
      },
      {
        type: "browser_return",
        at: new Date().toISOString(),
        data: {
          receivedPayload: auditJiopayPayload(payload),
          appResponse: { status: 303, location: redirectUrl.toString() },
        },
      },
    );

    const repo = getPlatformRepository();
    const lead = repo.listLeads().find((item) => item.tags.includes(`payment:${merchantTxnNo}`));
    if (lead) {
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: "Jiopay",
        to: "XIPHIAS",
        body: `Browser returned from Jiopay for ${merchantTxnNo}. Status: ${status}. Verified: ${verified ? "yes" : "no"}.`,
        providerMessageId: merchantTxnNo,
      });
    }
  }

  const redirectUrl = new URL("/payment/jiopay/return", req.nextUrl.origin);
  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("verified", verified ? "1" : "0");
  if (merchantTxnNo) redirectUrl.searchParams.set("order", merchantTxnNo);
  return NextResponse.redirect(redirectUrl, 303);
}

export async function GET(req: NextRequest) {
  return handleReturn(req);
}

export async function POST(req: NextRequest) {
  return handleReturn(req);
}
