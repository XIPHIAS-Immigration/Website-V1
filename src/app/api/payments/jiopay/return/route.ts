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
import { createReportDownloadGrant } from "@/lib/payments/report-delivery";
import { recordJiopayPurchaseInCrm } from "@/lib/crm/save-payment";
import { fulfillJiopayOrder } from "@/lib/payments/fulfillment";
import { getProductConfig } from "@/lib/payments/product-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

function customerReturnPath(productType?: string) {
  return getProductConfig(productType)?.requiresIntake
    ? "/due-diligence-intelligence/paid"
    : "/payment/jiopay/return";
}

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
  let downloadGrant: ReturnType<typeof createReportDownloadGrant> | null = null;
  const initialOrder = merchantTxnNo ? getJiopayOrder(merchantTxnNo) : null;

  try {
    const config = getJiopayConfig(req);
    verified = verifyJiopaySecureHash(payload, config.secretKey);
    if (verified && isJiopaySuccess(payload)) status = "success";
    else if (verified && Object.keys(payload).length) status = "failed";
    if (verified && status === "success" && merchantTxnNo && !initialOrder?.crmPayment) {
      downloadGrant = createReportDownloadGrant(merchantTxnNo);
    }
  } catch {
    status = "pending";
  }

  if (merchantTxnNo) {
    const existingOrder = getJiopayOrder(merchantTxnNo);
    const orderStatus =
      existingOrder?.status === "paid" ||
      existingOrder?.status === "provisioned" ||
      existingOrder?.status === "report_sent"
        ? existingOrder.status
        : verified && status === "success"
          ? "paid"
        : status === "failed"
          ? "failed"
          : "returned";

    const redirectUrl = new URL(customerReturnPath(existingOrder?.productType), req.nextUrl.origin);
    redirectUrl.searchParams.set("status", status);
    redirectUrl.searchParams.set("verified", verified ? "1" : "0");
    redirectUrl.searchParams.set("order", merchantTxnNo);
    if (downloadGrant) {
      redirectUrl.searchParams.set("expires", String(downloadGrant.expires));
      redirectUrl.searchParams.set("token", downloadGrant.token);
    }
    if (existingOrder?.crmPayment) {
      redirectUrl.searchParams.set("crm", "1");
      redirectUrl.searchParams.set("back", existingOrder.crmPayment.returnUrl);
    }

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

    // The signed browser return is a delivery fallback if the S2S webhook is
    // delayed or a gateway retry is exhausted. Both CRM persistence and
    // fulfillment are idempotent, and the fulfillment lock prevents duplicate
    // emails when return + webhook arrive together.
    if (verified && status === "success" && existingOrder) {
      try {
        const crmRecord = await recordJiopayPurchaseInCrm(existingOrder, payload);
        updateJiopayOrder(merchantTxnNo, {}, {
          type: crmRecord.status === "inserted" ? "crm_payment_recorded" : "crm_payment_exists",
          at: new Date().toISOString(),
          data: {
            source: "browser_return",
            crmOnlinePaymentId: crmRecord.id,
            crmClientId: crmRecord.clientId,
          },
        });
      } catch (error) {
        updateJiopayOrder(merchantTxnNo, {}, {
          type: "crm_payment_failed",
          at: new Date().toISOString(),
          data: {
            source: "browser_return",
            error: error instanceof Error ? error.message : "CRM payment recording failed.",
          },
        });
      }

      await fulfillJiopayOrder(merchantTxnNo, {
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.nextUrl.origin,
        gatewayPayload: payload,
      });
    }
  }

  const redirectUrl = new URL(customerReturnPath(initialOrder?.productType), req.nextUrl.origin);
  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("verified", verified ? "1" : "0");
  if (merchantTxnNo) redirectUrl.searchParams.set("order", merchantTxnNo);
  if (initialOrder?.crmPayment) {
    redirectUrl.searchParams.set("crm", "1");
    redirectUrl.searchParams.set("back", initialOrder.crmPayment.returnUrl);
  }
  if (downloadGrant) {
    redirectUrl.searchParams.set("expires", String(downloadGrant.expires));
    redirectUrl.searchParams.set("token", downloadGrant.token);
  }
  return NextResponse.redirect(redirectUrl, 303);
}

export async function GET(req: NextRequest) {
  return handleReturn(req);
}

export async function POST(req: NextRequest) {
  return handleReturn(req);
}
