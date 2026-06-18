import "server-only";

import { getJiopayOrder, updateJiopayOrder, type JiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig, type ProductConfig } from "@/lib/payments/product-catalog";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { generateReportPdf } from "@/lib/payments/report-router";

export type FulfillmentStatus =
  | "missing_order"
  | "unknown_product"
  | "already_fulfilled"
  | "report_sent"
  | "report_failed"
  | "registration_delegated"
  | "registration_skipped"
  | "custom_noted";

export type FulfillmentResult = {
  status: FulfillmentStatus;
  detail?: string;
  mail?: unknown;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reportDeliveryEmailHtml(args: {
  name: string;
  productName: string;
  country?: string;
  program?: string;
  reference: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
      <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,.14);">
        <div style="background:#071a3a;color:#fff;padding:28px;">
          <div style="font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#f6d86d;">XIPHIAS Immigration</div>
          <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;color:#fff;">Your report is ready</h1>
          <p style="margin:12px 0 0;color:#dbe7f3;font-size:15px;line-height:1.7;">Payment confirmed — your personalised report is attached to this email.</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hi <strong>${escapeHtml(args.name)}</strong>,</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">Thank you for your purchase. Please find your <strong>${escapeHtml(args.productName)}</strong> attached as a PDF.</p>
          <table style="width:100%;border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f3;border-radius:14px;overflow:hidden;">
            <tr><td style="padding:10px;font-weight:800;">Report</td><td style="padding:10px;">${escapeHtml(args.productName)}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Country focus</td><td style="padding:10px;">${escapeHtml(args.country || "Advisor shortlist")}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Programme</td><td style="padding:10px;">${escapeHtml(args.program || "Personalised recommendation")}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Payment reference</td><td style="padding:10px;">${escapeHtml(args.reference)}</td></tr>
          </table>
          <p style="margin:20px 0 0;color:#536277;font-size:13px;line-height:1.7;">This report is an advisor-prepared planning document. Final eligibility, documentation, fees and timelines must be verified by the XIPHIAS team before filing or investment action.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fulfil a successfully-paid JioPay order based on its product type.
 *  - report products: generate the correct PDF and email it to the customer (report-only;
 *    no X-Hub account is created).
 *  - registration: delegate to the existing /api/platform/registration/provision flow
 *    (still gated by JIOPAY_AUTO_PROVISION for backward compatibility).
 *  - custom: staff-created links — just record the payment.
 *
 * Idempotent: if the order already shows a delivered report or a completed registration
 * (detected via its event log), a replayed webhook is a no-op.
 */
export async function fulfillJiopayOrder(
  merchantTxnNo: string,
  opts: { siteUrl: string },
): Promise<FulfillmentResult> {
  const order = getJiopayOrder(merchantTxnNo);
  if (!order) return { status: "missing_order" };

  const product = getProductConfig(order.productType);
  if (!product) return { status: "unknown_product", detail: order.productType };

  // Idempotency via the event log (survives the webhook re-stamping status to "paid" on replay).
  const alreadyFulfilled = order.events?.some(
    (event) => event.type === "report_delivered" || event.type === "registration_provisioned",
  );
  if (alreadyFulfilled) return { status: "already_fulfilled" };

  if (product.fulfillment === "report") return fulfillReport(order, product);
  if (product.fulfillment === "registration") return fulfillRegistration(order, opts);
  return fulfillCustom(order);
}

async function fulfillReport(order: JiopayOrder, product: ProductConfig): Promise<FulfillmentResult> {
  if (!product.reportKind) {
    return { status: "report_failed", detail: "No report template configured for this product." };
  }
  try {
    const pdf = await generateReportPdf(product.reportKind, order);
    const filename = `XIPHIAS_${product.fileSlug}_${order.merchantTxnNo}.pdf`;

    const mail = await sendPlatformEmail({
      to: order.customer.email,
      subject: product.emailSubject,
      label: "XIPHIAS Immigration",
      html: reportDeliveryEmailHtml({
        name: order.customer.name,
        productName: product.label,
        country: order.country,
        program: order.program,
        reference: order.merchantTxnNo,
      }),
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });

    // Best-effort staff notification — never blocks or fails the customer delivery.
    await sendPlatformEmail({
      to: getPlatformRecipient("general"),
      subject: `Report delivered: ${order.customer.name} — ${product.label}`,
      label: "XIPHIAS Platform",
      html: `<p>Paid report <strong>${escapeHtml(product.label)}</strong> delivered to ${escapeHtml(order.customer.email)}. Ref: ${escapeHtml(order.merchantTxnNo)}, amount INR ${order.amountInr}.</p>`,
    }).catch(() => undefined);

    updateJiopayOrder(
      order.merchantTxnNo,
      { status: "report_sent" },
      {
        type: "report_delivered",
        at: new Date().toISOString(),
        data: { productType: order.productType, reportKind: product.reportKind, filename, mail },
      },
    );
    return { status: "report_sent", mail };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "report generation failed";
    updateJiopayOrder(order.merchantTxnNo, {}, {
      type: "report_failed",
      at: new Date().toISOString(),
      data: { productType: order.productType, error: detail },
    });
    return { status: "report_failed", detail };
  }
}

async function fulfillRegistration(order: JiopayOrder, opts: { siteUrl: string }): Promise<FulfillmentResult> {
  // Preserve legacy behavior: paid registration provisions a full X-Hub workspace.
  if (process.env.JIOPAY_AUTO_PROVISION !== "true") return { status: "registration_skipped", detail: "auto_provision_disabled" };
  const secret = process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET;
  if (!secret) return { status: "registration_skipped", detail: "missing_registration_secret" };

  const siteUrl = opts.siteUrl.replace(/\/+$/, "");
  const response = await fetch(`${siteUrl}/api/platform/registration/provision`, {
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
  if (!response.ok) {
    updateJiopayOrder(order.merchantTxnNo, {}, { type: "registration_failed", at: new Date().toISOString(), data });
    return { status: "registration_skipped", detail: "provision_failed" };
  }
  updateJiopayOrder(
    order.merchantTxnNo,
    { status: "provisioned" },
    { type: "registration_provisioned", at: new Date().toISOString(), data },
  );
  return { status: "registration_delegated" };
}

async function fulfillCustom(order: JiopayOrder): Promise<FulfillmentResult> {
  // Staff-created custom links: no automatic report; just record the confirmed payment.
  updateJiopayOrder(order.merchantTxnNo, {}, {
    type: "custom_payment_noted",
    at: new Date().toISOString(),
    data: { productType: order.productType, amountInr: order.amountInr },
  });
  return { status: "custom_noted" };
}
