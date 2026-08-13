import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { generateReportPdf } from "@/lib/payments/report-router";
import { assessPersonalisation, buildClientCase } from "@/lib/reports/client-case";
import { saveReportCase } from "@/lib/reports/case-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

const ALLOWED_REVIEW_STATUS = new Set(["draft", "advisor-reviewed", "verified"]);
const TEXT_FIELDS: Record<string, number> = {
  nationality: 100,
  currentCountry: 100,
  maritalStatus: 60,
  portraitUrl: 500,
  goal: 160,
  track: 40,
  targetCountries: 500,
  selectedProgrammes: 1000,
  fallbackProgrammes: 600,
  priority: 80,
  presence: 80,
  goals: 2000,
  occupation: 180,
  field: 100,
  education: 100,
  languageTest: 80,
  skillsAssessment: 300,
  employerOrBusiness: 300,
  proposedEndeavour: 2000,
  profileSummary: 6000,
  familyMembers: 1000,
  sourceOfFunds: 2000,
  preferredCurrency: 20,
  currentImmigrationStatus: 500,
  immigrationHistory: 2500,
  refusals: 2000,
  medicalNotes: 1500,
  characterNotes: 1500,
  evidenceSelected: 1200,
  evidenceNotes: 3000,
  documentInventory: 12000,
  verifiedCosts: 12000,
  preparedBy: 140,
  verifiedAt: 60,
  factualSources: 5000,
  advisorNotes: 5000,
  executiveSummary: 5000,
  advisorRecommendation: 5000,
  customRisks: 4000,
  nextActions: 4000,
};

const NUMBER_FIELDS = [
  "age",
  "timelineMonths",
  "yearsExperience",
  "languageScore",
  "dependants",
  "budgetUsd",
  "availableFundsUsd",
  "citationCount",
  "publicationCount",
  "patentCount",
  "routeFitScore",
  "evidenceStrengthScore",
  "documentReadinessScore",
  "riskClarityScore",
  "familyReadinessScore",
] as const;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildAnswers(body: Payload, userEmail: string) {
  const reviewStatusRaw = normalizeText(body.reviewStatus, 30).toLowerCase();
  const answers: Record<string, unknown> = {
    manuallyPrepared: true,
    dataSource: "Advisor report desk",
    reviewStatus: ALLOWED_REVIEW_STATUS.has(reviewStatusRaw) ? reviewStatusRaw : "draft",
    preparedAt: new Date().toISOString(),
    preparedBy: normalizeText(body.preparedBy, 140) || userEmail,
    familyIncluded: String(body.familyIncluded ?? "").toLowerCase() === "true",
  };

  for (const [key, max] of Object.entries(TEXT_FIELDS)) {
    const value = normalizeText(body[key], max);
    if (value) answers[key] = value;
  }
  for (const key of NUMBER_FIELDS) {
    const value = optionalNumber(body[key]);
    if (value !== undefined) answers[key] = value;
  }

  if (answers.reviewStatus !== "draft") {
    answers.verifiedAt = answers.verifiedAt || new Date().toISOString();
  }
  return answers;
}

function buildOrder(args: {
  body: Payload;
  answers: Record<string, unknown>;
  productType: string;
  paymentReference: string;
  name: string;
  email: string;
  phone: string;
}): JiopayOrder {
  const config = getProductConfig(args.productType)!;
  const now = new Date().toISOString();
  const targets = normalizeText(args.body.targetCountries, 500).split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);
  const programmes = normalizeText(args.body.selectedProgrammes, 1000).split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);
  return {
    merchantTxnNo: args.paymentReference,
    amountInr: config.priceInr,
    productType: config.productType,
    productName: config.label,
    customer: { name: args.name, email: args.email, phone: args.phone || undefined },
    track: normalizeText(args.body.track, 40) || undefined,
    country: targets[0] || undefined,
    program: programmes[0] || undefined,
    answers: args.answers,
    status: "paid",
    createdAt: now,
    updatedAt: now,
    events: [{ type: "manual_report_prepared", at: now, data: { schemaVersion: 1 } }],
  };
}

function reportEmailHtml(args: { name: string; reportName: string; reviewStatus: string; paymentReference: string }) {
  return `
    <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
      <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,.14);">
        <div style="background:#071a3a;color:#fff;padding:28px;">
          <div style="font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#f6d86d;">XIPHIAS Immigration</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.18;color:#fff;">Your ${escapeHtml(args.reportName)} is ready</h1>
        </div>
        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hi <strong>${escapeHtml(args.name)}</strong>,</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">Please find your personalised XIPHIAS report attached.</p>
          <table style="width:100%;border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f3;">
            <tr><td style="padding:10px;font-weight:800;">Review status</td><td style="padding:10px;">${escapeHtml(args.reviewStatus)}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Reference</td><td style="padding:10px;">${escapeHtml(args.paymentReference)}</td></tr>
          </table>
          <p style="margin:20px 0 0;color:#536277;font-size:13px;line-height:1.7;">This is an advisory planning document. Final eligibility, documentation, fees and timelines must be confirmed against current rules before filing or investment action.</p>
        </div>
      </div>
    </div>`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "staff") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const productType = normalizeText(body.productType, 80) || "premium_report";
  const config = getProductConfig(productType);
  if (!config?.reportKind || config.fulfillment !== "report") {
    return NextResponse.json({ ok: false, error: "Select a valid report template." }, { status: 400 });
  }

  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const paymentReference = normalizeText(body.paymentReference, 160) || `manual_${Date.now()}`;
  const mode = normalizeText(body.mode, 20) || "download";
  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "Client name and email are required." }, { status: 400 });
  }

  const answers = buildAnswers(body, user.email);
  const order = buildOrder({ body, answers, productType, paymentReference, name, email, phone });
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  if (mode === "email" && (clientCase.reviewStatus === "draft" || personalisation.completeness < 50)) {
    return NextResponse.json({
      ok: false,
      error: clientCase.reviewStatus === "draft"
        ? "Review the report before emailing it. Draft reports can only be previewed or downloaded."
        : `Only ${personalisation.completeness}% of the core profile is complete. Reach at least 50% before emailing a reviewed report.`,
    }, { status: 400 });
  }
  const pdf = await generateReportPdf(config.reportKind, order);
  const savedCase = saveReportCase({
    reference: paymentReference,
    reportKind: config.reportKind,
    productType,
    customerEmail: email,
    customerName: name,
    status: clientCase.reviewStatus,
    createdBy: user.email,
    clientCase,
  });
  const filename = `XIPHIAS_${config.fileSlug}_${paymentReference.replace(/[^a-z0-9_-]+/gi, "-")}.pdf`;

  const repo = getPlatformRepository();
  repo.createConversation({
    channel: "portal",
    direction: "internal",
    from: user.email,
    to: "XIPHIAS",
    body: `${config.label} generated for ${name} (${email}). Review: ${String(answers.reviewStatus)}. Ref: ${paymentReference}.`,
  });
  repo.audit("registration.provisioned", "manual_report", paymentReference, user.id, {
    email,
    productType,
    reportKind: config.reportKind,
    reviewStatus: answers.reviewStatus,
    mode,
    schemaVersion: 1,
  });

  if (mode === "email") {
    const clientEmail = await sendPlatformEmail({
      to: email,
      subject: config.emailSubject,
      label: "XIPHIAS Immigration",
      html: reportEmailHtml({ name, reportName: config.label, reviewStatus: String(answers.reviewStatus), paymentReference }),
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });
    const staffEmail = await sendPlatformEmail({
      to: getPlatformRecipient("general"),
      subject: `${config.label} sent: ${name}`,
      label: "XIPHIAS Platform",
      html: `<p>${escapeHtml(config.label)} sent for <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}). Ref: ${escapeHtml(paymentReference)}</p>`,
    });
    return NextResponse.json({ ok: true, clientEmail, staffEmail, filename, schemaVersion: 1, reportVersion: savedCase.version });
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "preview" ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Xiphias-Report-Schema": "1",
      "X-Xiphias-Review-Status": String(answers.reviewStatus),
      "X-Xiphias-Report-Version": String(savedCase.version),
    },
  });
}
