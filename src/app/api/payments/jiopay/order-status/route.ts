import { NextResponse, type NextRequest } from "next/server";
import { fulfillJiopayOrder } from "@/lib/payments/fulfillment";
import { getJiopayOrder, updateJiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { verifyOrderStatusGrant } from "@/lib/payments/report-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function eventTime(order: NonNullable<ReturnType<typeof getJiopayOrder>>, type: string) {
  const value = order.events.find((event) => event.type === type)?.at;
  return value ? Date.parse(value) : 0;
}

export async function GET(req: NextRequest) {
  const merchantTxnNo = req.nextUrl.searchParams.get("order")?.trim() || "";
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const expires = Number(req.nextUrl.searchParams.get("expires"));

  if (!merchantTxnNo || !token || !verifyOrderStatusGrant(merchantTxnNo, expires, token)) {
    return NextResponse.json({ ok: false, error: "Invalid or expired order-status link." }, { status: 403 });
  }

  let order = getJiopayOrder(merchantTxnNo);
  if (!order) return NextResponse.json({ ok: false, error: "Payment order was not found." }, { status: 404 });

  const product = getProductConfig(order.productType);
  if (!product) return NextResponse.json({ ok: false, error: "Unknown purchased product." }, { status: 400 });

  const completed = order.events.some((event) => event.type === "report_delivered" || event.type === "registration_provisioned" || event.type === "consultation_confirmed");
  const registrationEvent = order.events.find((event) => event.type === "registration_provisioned");
  const crmAccessUrl = typeof registrationEvent?.data?.accessUrl === "string" ? registrationEvent.data.accessUrl : undefined;
  const waitingForIntake = product.requiresIntake && order.answers?.paidIntakeCompleted !== true;
  const failureEvents = order.events.filter((event) => event.type === "report_failed" || event.type === "registration_failed" || event.type === "consultation_confirmation_failed");
  const latestStart = Math.max(eventTime(order, "report_generation_started"), eventTime(order, "registration_provisioning_started"));
  const processingStale = order.status === "processing" && latestStart > 0 && Date.now() - latestStart > 2 * 60 * 1000;
  const retryEligible = !completed && !waitingForIntake && failureEvents.length < 3 && (order.status === "paid" || processingStale);

  if (retryEligible) {
    if (processingStale) {
      updateJiopayOrder(order.merchantTxnNo, { status: "paid" }, {
        type: "fulfillment_recovered_from_stale_processing",
        at: new Date().toISOString(),
      });
    }
    await fulfillJiopayOrder(order.merchantTxnNo, {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.nextUrl.origin,
    }).catch(() => undefined);
    order = getJiopayOrder(merchantTxnNo) || order;
  }

  const retryExhausted = failureEvents.length >= 3 && !completed;
  const stage = order.status === "report_sent" || order.status === "provisioned"
    ? "ready"
    : waitingForIntake
      ? "action_required"
      : retryExhausted
        ? "needs_support"
        : order.status === "failed"
          ? "payment_failed"
          : order.status === "paid" || order.status === "processing"
            ? "processing"
            : "pending";
  const message = stage === "ready"
    ? product.fulfillment === "registration"
      ? "Your India CRM client ID is registered, ₹5,000 including GST is recorded as paid, and secure access was sent to your checkout email."
      : product.fulfillment === "consultation"
        ? "Your senior-advisor consultation is confirmed. The appointment details and calendar invitation were sent to your checkout email."
      : "Your personalised PDF is ready and has been sent to your checkout email."
    : stage === "action_required"
      ? "Payment is confirmed. Complete the secure paid intake to generate the report."
      : stage === "needs_support"
        ? "Payment is confirmed, but automated fulfilment needs staff attention. Your order is preserved."
        : stage === "payment_failed"
          ? "The payment was not completed."
          : stage === "processing"
            ? product.fulfillment === "registration"
              ? "Payment is confirmed. Your India CRM client, paid receipt and secure access are being created."
              : product.fulfillment === "consultation"
                ? "Payment is confirmed. Your consultation slot and calendar invitation are being finalised."
              : "Payment is confirmed. Your personalised report is being generated."
            : "Waiting for verified payment confirmation.";

  return NextResponse.json({
    ok: true,
    stage,
    message,
    product: product.label,
    actionHref: stage === "ready" && product.fulfillment === "registration" ? crmAccessUrl : undefined,
  });
}
