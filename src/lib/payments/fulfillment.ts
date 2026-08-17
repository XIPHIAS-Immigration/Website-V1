import "server-only";

import { getJiopayOrder, updateJiopayOrder, type JiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig, type ProductConfig } from "@/lib/payments/product-catalog";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { createReportDownloadGrant, ensurePaidReportArtifact, reportDownloadUrl } from "@/lib/payments/report-delivery";
import { finalizeCrmJiopayPayment } from "@/lib/payments/crm-jiopay";
import { provisionCrmPaidRegistration } from "@/lib/payments/crm-registration";

export type FulfillmentStatus =
  | "missing_order"
  | "unknown_product"
  | "already_fulfilled"
  | "report_sent"
  | "report_pending_intake"
  | "report_failed"
  | "registration_delegated"
  | "registration_skipped"
  | "custom_noted"
  | "crm_finalized"
  | "crm_failed";

export type FulfillmentResult = {
  status: FulfillmentStatus;
  detail?: string;
  mail?: unknown;
};

const fulfillmentState = globalThis as typeof globalThis & {
  xiphiasJiopayFulfillmentJobs?: Map<string, Promise<FulfillmentResult>>;
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
  amountInr: number;
  downloadUrl: string;
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
            <tr><td style="padding:10px;font-weight:800;">Amount paid</td><td style="padding:10px;">INR ${escapeHtml(args.amountInr.toLocaleString("en-IN"))}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Payment reference</td><td style="padding:10px;">${escapeHtml(args.reference)}</td></tr>
          </table>
          <p style="margin:22px 0 0;text-align:center;">
            <a href="${escapeHtml(args.downloadUrl)}" style="display:inline-block;border-radius:9px;background:#1f5fbc;color:#fff;text-decoration:none;font-weight:800;padding:13px 22px;">Download your PDF report</a>
          </p>
          <p style="margin:12px 0 0;text-align:center;color:#536277;font-size:12px;line-height:1.6;">The secure download link is valid for seven days. The PDF is also attached to this email.</p>
          <p style="margin:20px 0 0;color:#536277;font-size:13px;line-height:1.7;">This instant report is generated from the information supplied at checkout and is not advisor-reviewed unless the report explicitly says otherwise. Final eligibility, documentation, fees and timelines must be verified before filing or investment action.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fulfil a successfully-paid JioPay order based on its product type.
 *  - report products: generate the correct PDF and email it to the customer (report-only;
 *    no X-Hub account is created).
 *  - registration: create the paid India CRM client, receipt and secure client access;
 *    automatic provisioning is on unless operations explicitly set JIOPAY_AUTO_PROVISION=false.
 *  - custom: staff-created links — just record the payment.
 *
 * Idempotent: if the order already shows a delivered report or a completed registration
 * (detected via its event log), a replayed webhook is a no-op.
 */
export async function fulfillJiopayOrder(
  merchantTxnNo: string,
  opts: { siteUrl: string; gatewayPayload?: Record<string, unknown> },
): Promise<FulfillmentResult> {
  if (!fulfillmentState.xiphiasJiopayFulfillmentJobs) {
    fulfillmentState.xiphiasJiopayFulfillmentJobs = new Map();
  }
  const running = fulfillmentState.xiphiasJiopayFulfillmentJobs.get(merchantTxnNo);
  if (running) return running;

  const job = fulfillJiopayOrderOnce(merchantTxnNo, opts);
  fulfillmentState.xiphiasJiopayFulfillmentJobs.set(merchantTxnNo, job);
  try {
    return await job;
  } finally {
    fulfillmentState.xiphiasJiopayFulfillmentJobs.delete(merchantTxnNo);
  }
}

async function fulfillJiopayOrderOnce(
  merchantTxnNo: string,
  opts: { siteUrl: string; gatewayPayload?: Record<string, unknown> },
): Promise<FulfillmentResult> {
  const order = getJiopayOrder(merchantTxnNo);
  if (!order) return { status: "missing_order" };

  if (order.crmPayment) {
    try {
      await finalizeCrmJiopayPayment(merchantTxnNo, opts.gatewayPayload || {});
      return { status: "crm_finalized" };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "CRM payment finalization failed.";
      updateJiopayOrder(merchantTxnNo, {}, {
        type: "crm_payment_finalize_failed",
        at: new Date().toISOString(),
        data: { error: detail },
      });
      return { status: "crm_failed", detail };
    }
  }

  const product = getProductConfig(order.productType);
  if (!product) return { status: "unknown_product", detail: order.productType };

  // Idempotency via the event log (survives the webhook re-stamping status to "paid" on replay).
  const alreadyFulfilled = order.events?.some(
    (event) => event.type === "report_delivered" || event.type === "registration_provisioned",
  );
  if (alreadyFulfilled) return { status: "already_fulfilled" };

  if (product.fulfillment === "report") return fulfillReport(order, product, opts);
  if (product.fulfillment === "registration") return fulfillRegistration(order, opts);
  return fulfillCustom(order);
}

async function fulfillReport(
  order: JiopayOrder,
  product: ProductConfig,
  opts: { siteUrl: string },
): Promise<FulfillmentResult> {
  if (!product.reportKind) {
    return { status: "report_failed", detail: "No report template configured for this product." };
  }
  if (product.requiresIntake && order.answers?.paidIntakeCompleted !== true) {
    const invitationSent = order.events?.some((event) => event.type === "intake_invitation_sent");
    if (!invitationSent) {
      const grant = createReportDownloadGrant(order.merchantTxnNo);
      const url = new URL("/due-diligence-intelligence/paid", opts.siteUrl.replace(/\/+$/, ""));
      url.searchParams.set("order", order.merchantTxnNo);
      url.searchParams.set("expires", String(grant.expires));
      url.searchParams.set("token", grant.token);
      const mail = await sendPlatformEmail({
        to: order.customer.email,
        subject: "Continue your XIPHIAS Due Diligence Report",
        label: "XIPHIAS Immigration",
        html: `<p>Hi <strong>${escapeHtml(order.customer.name)}</strong>,</p><p>Your INR ${escapeHtml(order.amountInr)} payment is confirmed. Complete the secure paid due-diligence intake to generate your personalised report.</p><p><a href="${escapeHtml(url.toString())}">Continue due diligence</a></p><p>This link is valid for seven days. No report will be generated until the paid intake is submitted.</p>`,
      });
      updateJiopayOrder(order.merchantTxnNo, {}, {
        type: "intake_invitation_sent",
        at: new Date().toISOString(),
        data: { productType: order.productType, mail },
      });
    }
    return { status: "report_pending_intake", detail: "paid_intake_required" };
  }
  try {
    updateJiopayOrder(order.merchantTxnNo, { status: "processing" }, {
      type: "report_generation_started",
      at: new Date().toISOString(),
      data: { productType: order.productType, reportKind: product.reportKind },
    });
    const pdf = await ensurePaidReportArtifact(order, product);
    const filename = `XIPHIAS_${product.fileSlug}_${order.merchantTxnNo}.pdf`;
    const downloadUrl = reportDownloadUrl(opts.siteUrl, order.merchantTxnNo);

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
        amountInr: order.amountInr,
        downloadUrl,
      }),
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });
    if (mail.status !== "sent") {
      throw new Error(
        mail.status === "failed"
          ? `PDF email delivery failed: ${mail.reason}`
          : `PDF email delivery skipped: ${mail.reason}`,
      );
    }

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
    updateJiopayOrder(order.merchantTxnNo, { status: "paid" }, {
      type: "report_failed",
      at: new Date().toISOString(),
      data: { productType: order.productType, error: detail },
    });
    return { status: "report_failed", detail };
  }
}

async function fulfillRegistration(
  order: JiopayOrder,
  opts: { siteUrl: string; gatewayPayload?: Record<string, unknown> },
): Promise<FulfillmentResult> {
  // A verified registration purchase is owned by the India CRM. X-Hub is not
  // involved in client onboarding for this product.
  if (process.env.JIOPAY_AUTO_PROVISION === "false") return { status: "registration_skipped", detail: "auto_provision_disabled" };

  updateJiopayOrder(order.merchantTxnNo, { status: "processing" }, {
    type: "registration_provisioning_started",
    at: new Date().toISOString(),
  });

  try {
    const registration = await provisionCrmPaidRegistration(order, opts.gatewayPayload || {});
    const mail = await sendPlatformEmail({
      to: order.customer.email,
      subject: "Your XIPHIAS client CRM registration is ready",
      label: "XIPHIAS Immigration",
      html: `
        <div style="margin:0;padding:24px;background:#eef3f9;font-family:Segoe UI,Arial,sans-serif;color:#071a3a">
          <div style="max-width:700px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:20px;overflow:hidden">
            <div style="padding:28px;background:#071a3a;color:#fff">
              <div style="font-size:12px;font-weight:900;letter-spacing:.16em;color:#f6d86d">XIPHIAS IMMIGRATION</div>
              <h1 style="margin:8px 0 0;color:#fff;font-size:27px">Registration confirmed</h1>
            </div>
            <div style="padding:28px">
              <p>Dear <strong>${escapeHtml(order.customer.name)}</strong>,</p>
              <p>Your payment has been verified and client ID <strong>${registration.clientId}</strong> has been created in the XIPHIAS India CRM.</p>
              <table style="width:100%;border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f3">
                <tr><td style="padding:10px;font-weight:800">Registration and Deep Analysis</td><td style="padding:10px">INR 4,236.44</td></tr>
                <tr><td style="padding:10px;font-weight:800">GST (18%)</td><td style="padding:10px">INR 762.56</td></tr>
                <tr><td style="padding:10px;font-weight:800">Total paid</td><td style="padding:10px">INR 4,999.00</td></tr>
                <tr><td style="padding:10px;font-weight:800">CRM status</td><td style="padding:10px">REGISTERED / PAID</td></tr>
                <tr><td style="padding:10px;font-weight:800">Deep Analysis</td><td style="padding:10px">Included — pending profile intake and adviser review</td></tr>
                <tr><td style="padding:10px;font-weight:800">Payment reference</td><td style="padding:10px">${escapeHtml(order.merchantTxnNo)}</td></tr>
              </table>
              <p style="margin:22px 0;text-align:center"><a href="${escapeHtml(registration.accessUrl)}" style="display:inline-block;border-radius:10px;background:#d8b650;color:#071a3a;text-decoration:none;font-weight:900;padding:14px 22px">Set password and open Client CRM</a></p>
              <p style="font-size:12px;color:#536277">This is a single-use secure setup link. Complete your CRM profile after signing in so the assessment team can prepare the included Deep Analysis report.</p>
            </div>
          </div>
        </div>`,
    });
    if (mail.status !== "sent") throw new Error(`CRM access email was not sent: ${mail.reason}`);

    await sendPlatformEmail({
      to: getPlatformRecipient("general"),
      subject: `Paid CRM registration: ${order.customer.name} — client ${registration.clientId}`,
      label: "XIPHIAS Platform",
      html: `<p>India CRM client <strong>${registration.clientId}</strong> is REGISTERED and INR 4,999 including GST is PAID.</p><p>Deep Analysis is included and pending profile intake/adviser review. Payment ref: ${escapeHtml(order.merchantTxnNo)}.</p>`,
    }).catch(() => undefined);

    updateJiopayOrder(
      order.merchantTxnNo,
      { status: "provisioned" },
      { type: "registration_provisioned", at: new Date().toISOString(), data: { ...registration, mail } },
    );
    return { status: "registration_delegated", mail };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "CRM paid-registration provisioning failed.";
    updateJiopayOrder(order.merchantTxnNo, { status: "paid" }, {
      type: "registration_failed",
      at: new Date().toISOString(),
      data: { error: detail },
    });
    return { status: "registration_skipped", detail: "provision_failed" };
  }
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
