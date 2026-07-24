import { NextResponse, type NextRequest } from "next/server";
import {
  auditJiopayPayload,
  getJiopayConfig,
  initiateJiopaySale,
  makeJiopayTxnNo,
} from "@/lib/payments/jiopay";
import {
  loadCrmCheckout,
  verifyCrmCheckoutIntent,
  type CrmPaymentType,
} from "@/lib/payments/crm-jiopay";
import { saveJiopayOrder } from "@/lib/payments/jiopay-store";
import { getPlatformRepository } from "@/lib/platform/repository";
import { PAYMENTS_DISABLED } from "@/lib/payments/payments-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function crmReturnUrl() {
  return (
    process.env.CRM_CLIENT_RETURN_URL?.trim() ||
    "https://www.xiphiasimmigration.com/XIPHIAS/Client/MyAccounts"
  );
}

function errorRedirect(req: NextRequest, message: string) {
  const target = new URL("/payment/jiopay/return", req.nextUrl.origin);
  target.searchParams.set("status", "failed");
  target.searchParams.set("verified", "0");
  target.searchParams.set("crm", "1");
  target.searchParams.set("message", message.slice(0, 180));
  return NextResponse.redirect(target, 303);
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function gatewayHandoff(checkoutUrl: string, initiateSaleUrl: string) {
  const destination = new URL(checkoutUrl);
  const gateway = new URL(initiateSaleUrl);
  if (destination.protocol !== "https:" || destination.hostname !== gateway.hostname) {
    throw new Error("JioPay returned an unexpected checkout host.");
  }
  const safeJsonUrl = JSON.stringify(destination.toString())
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
  const safeAttributeUrl = escapeHtmlAttribute(destination.toString());
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="refresh" content="0;url=${safeAttributeUrl}">
    <title>Opening JioPay</title>
  </head>
  <body>
    <p>Opening secure JioPay checkout…</p>
    <p><a href="${safeAttributeUrl}" rel="noreferrer">Continue to JioPay</a></p>
    <script>window.location.replace(${safeJsonUrl});</script>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}

export async function POST(req: NextRequest) {
  if (PAYMENTS_DISABLED) return errorRedirect(req, "Online payments are temporarily unavailable.");

  const form = await req.formData().catch(() => null);
  if (!form) return errorRedirect(req, "Invalid payment request.");
  const paymentType = String(form.get("paymentType") || "").toLowerCase();
  const sourceId = Number(form.get("sourceId"));
  const timestamp = Number(form.get("timestamp"));
  const signature = String(form.get("signature") || "");

  try {
    if (!verifyCrmCheckoutIntent({ paymentType, sourceId, timestamp, signature })) {
      return errorRedirect(req, "The payment link expired. Return to CRM and click Pay with JioPay again.");
    }
    const checkout = await loadCrmCheckout(paymentType as CrmPaymentType, sourceId);
    if (!checkout) {
      return errorRedirect(req, "No unpaid CRM item was found for this payment request.");
    }

    const config = getJiopayConfig(req);
    const merchantTxnNo = makeJiopayTxnNo();
    const repo = getPlatformRepository();
    const lead = repo.createLead({
      source: "website",
      status: "qualified",
      name: checkout.customer.name,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      message: `CRM ${checkout.paymentType} JioPay checkout started. Ref: ${merchantTxnNo}`,
      page: "/XIPHIAS/Client/MyAccounts",
      consent: true,
      score: 100,
      tags: [
        "jiopay",
        "crm-payment",
        `crm-client:${checkout.clientId}`,
        `payment:${merchantTxnNo}`,
        `product:crm_${checkout.paymentType}`,
      ],
    });
    const result = await initiateJiopaySale(
      {
        merchantTxnNo,
        amountInr: checkout.amountInr,
        customerName: checkout.customer.name,
        customerEmail: checkout.customer.email,
        customerPhone: checkout.customer.phone,
        productType: `crm_${checkout.paymentType}`,
        productName: checkout.productName,
      },
      config,
    );

    saveJiopayOrder({
      merchantTxnNo,
      leadId: lead.id,
      amountInr: checkout.amountInr,
      productType: `crm_${checkout.paymentType}`,
      productName: checkout.productName,
      customer: checkout.customer,
      crmPayment: {
        paymentType: checkout.paymentType,
        sourceId: checkout.sourceId,
        clientId: checkout.clientId,
        returnUrl: crmReturnUrl(),
      },
      status: result.checkoutUrl ? "checkout_created" : "initiated",
      checkoutUrl: result.checkoutUrl || undefined,
      lastResponseCode: String(result.responsePayload.responseCode ?? result.status),
      lastStatusLabel: String(result.responsePayload.responseMessage ?? result.responsePayload.message ?? ""),
      events: [
        {
          type: "crm_initiate_sale",
          at: new Date().toISOString(),
          data: {
            paymentType: checkout.paymentType,
            sourceId: checkout.sourceId,
            clientId: checkout.clientId,
            amountInr: checkout.amountInr,
            request: auditJiopayPayload(result.requestPayload),
            response: auditJiopayPayload(result.responsePayload),
          },
        },
      ],
    });

    if (!result.ok || !result.checkoutUrl) {
      return errorRedirect(req, `JioPay checkout could not be created. Reference: ${merchantTxnNo}`);
    }
    // IIS ARR rewrites external Location headers back onto the public website
    // host. An HTML handoff keeps the absolute, validated JioPay destination
    // in the response body, where ARR does not alter it.
    return gatewayHandoff(result.checkoutUrl, config.initiateSaleUrl);
  } catch (error) {
    return errorRedirect(
      req,
      error instanceof Error ? error.message : "JioPay checkout could not be created.",
    );
  }
}

export async function GET(req: NextRequest) {
  return errorRedirect(req, "Open this payment from your signed-in CRM account.");
}
