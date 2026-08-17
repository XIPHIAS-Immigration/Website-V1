import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";
import { getProductConfig } from "@/lib/payments/product-catalog";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { generateReportPdf } from "@/lib/payments/report-router";
import { beginCrmAssessmentEmail, completeCrmAssessmentEmail, failCrmAssessmentEmail } from "@/lib/reports/crm-assessment-idempotency";
import { calculateAustraliaPoints } from "@/lib/reports/australia-points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

const ALLOWED_PRODUCTS = new Set([
  "premium_report", "route_report", "deep_analysis_report", "us_visa_report",
  "cost_report", "compare_report", "docs_report",
]);
const ALLOWED_MODES = new Set(["preview", "download", "email", "internal-review"]);
const TEXT_LIMITS: Record<string, number> = {
  nationality: 100, currentCountry: 100, maritalStatus: 60, goal: 160, track: 40,
  targetCountries: 500, selectedProgrammes: 1000, fallbackProgrammes: 600, priority: 80,
  occupation: 180, occupationCode: 80, anzscoCode: 40, education: 100, languageTest: 80,
  languageDetails: 1000, skillsAssessment: 300, assessingBody: 240, cpa: 1000,
  professionalRecognition: 1500, pointsAssessment: 5000, employerOrBusiness: 240,
  sourceOfFunds: 1000, currentImmigrationStatus: 500, immigrationHistory: 2000,
  refusals: 1500, medicalNotes: 1500, characterNotes: 1500,
  proposedEndeavour: 2000, profileSummary: 6000,
  evidenceNotes: 3000, factualSources: 5000, executiveSummary: 5000,
  advisorRecommendation: 5000, customRisks: 4000, nextActions: 4000, advisorNotes: 5000,
  preparedBy: 140, dataSource: 200, reviewedAt: 60, reportFormat: 80,
  calculationMode: 40, visaSubclass: 20, dateOfBirth: 20, pointsTestDate: 20,
  englishProficiencyLevel: 40, qualificationLevel: 80, partnerCategory: 60,
  skillsAssessmentResult: 40, ruleSetVersion: 40, manualAssessmentReason: 1200,
};
const NUMBER_FIELDS = [
  "age", "dependants", "timelineMonths", "yearsExperience", "languageScore",
  "budgetUsd", "availableFundsUsd", "claimedPointsTotal",
  "agePoints", "englishPoints", "overseasExperiencePoints", "australianExperiencePoints",
  "professionalYearPoints", "qualificationPoints", "australianStudyPoints", "regionalStudyPoints",
  "stateNominationPoints", "regionalSponsorshipPoints", "partnerPoints", "communityLanguagePoints",
  "languageListening", "languageReading", "languageWriting", "languageSpeaking",
  "overseasExperienceMonths", "australianExperienceMonths", "basePointsTotal",
  "subclass189Points", "subclass190Points", "subclass491Points", "employmentPointsCapAdjustment",
  "specialistEducationPoints",
] as const;
const BOOLEAN_FIELDS = [
  "familyIncluded", "specialistEducation", "professionalYearCompleted", "australianStudyCompleted",
  "regionalStudyCompleted", "communityLanguageCredential",
] as const;

const replayState = globalThis as typeof globalThis & { xiphiasCrmAssessmentNonces?: Map<string, number> };

function requiredSecret() {
  const value = process.env.CRM_ASSESSMENT_REPORT_SECRET?.trim();
  if (!value) throw new Error("CRM_ASSESSMENT_REPORT_SECRET is required.");
  return value;
}

function secureHexEqual(expected: string, supplied: string) {
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifyRequest(req: NextRequest, rawBody: string) {
  const timestampText = req.headers.get("x-xiphias-crm-timestamp") || "";
  const nonce = req.headers.get("x-xiphias-crm-nonce") || "";
  const supplied = req.headers.get("x-xiphias-crm-signature") || "";
  if (!/^\d{10}$/.test(timestampText) || !/^[a-f0-9]{32}$/i.test(nonce)) return false;
  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) return false;

  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const expected = createHmac("sha256", requiredSecret())
    .update(`${timestampText}\n${nonce}\n${bodyHash}`, "utf8")
    .digest("hex");
  if (!secureHexEqual(expected, supplied)) return false;

  const nonces = replayState.xiphiasCrmAssessmentNonces ?? new Map<string, number>();
  replayState.xiphiasCrmAssessmentNonces = nonces;
  const now = Date.now();
  for (const [key, expires] of nonces) if (expires <= now) nonces.delete(key);
  if (nonces.has(nonce)) return false;
  nonces.set(nonce, now + 10 * 60 * 1000);
  return true;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalBoolean(value: unknown) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return undefined;
}

function textList(value: unknown, max: number) {
  return normalizeText(value, max).split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);
}

function cleanFeeItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  const categories = new Set(["government", "assessing_body", "language_test", "professional", "third_party", "proof_of_funds", "other"]);
  return value.slice(0, 20).map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const category = normalizeText(row.category, 40).toLowerCase();
    const amount = optionalNumber(row.amount);
    return {
      category: categories.has(category) ? category : "other",
      label: normalizeText(row.label, 180),
      amount,
      currency: normalizeText(row.currency, 8).toUpperCase(),
      verifiedDate: normalizeText(row.verifiedDate, 20),
      source: normalizeText(row.source, 500),
    };
  }).filter((row) => row.label && row.amount !== undefined && row.amount >= 0 && row.currency);
}

function cleanAnswers(body: Payload, reviewStatus: "draft" | "advisor-reviewed") {
  const answers: Record<string, unknown> = {
    manuallyPrepared: true,
    reviewStatus,
    preparedAt: new Date().toISOString(),
  };
  for (const [key, max] of Object.entries(TEXT_LIMITS)) {
    const value = normalizeText(body[key], max);
    if (value) answers[key] = value;
  }
  for (const key of NUMBER_FIELDS) {
    const value = optionalNumber(body[key]);
    if (value !== undefined) answers[key] = value;
  }
  for (const key of BOOLEAN_FIELDS) {
    const value = optionalBoolean(body[key]);
    if (value !== undefined) answers[key] = value;
  }
  answers.feeItems = cleanFeeItems(body.feeItems);
  if (Array.isArray(body.documentInventory)) answers.documentInventory = body.documentInventory.slice(0, 200);
  if (reviewStatus === "advisor-reviewed") answers.verifiedAt = normalizeText(body.reviewedAt, 60) || new Date().toISOString();
  return answers;
}

function structuredReportCompleteness(answers: Record<string, unknown>) {
  const has = (key: string) => Object.prototype.hasOwnProperty.call(answers, key)
    && answers[key] !== null && answers[key] !== undefined && String(answers[key]).trim() !== "";
  const calculationMode = normalizeText(answers.calculationMode, 40).toLowerCase();
  const verifiedCalculation = calculationMode === "australia_verified"
    && has("ruleSetVersion") && has("claimedPointsTotal") && has("subclass189Points")
    && has("subclass190Points") && has("subclass491Points");
  const manualCalculation = calculationMode === "manual_adviser"
    && has("manualAssessmentReason") && has("claimedPointsTotal");
  const checks = [
    has("selectedProgrammes") && has("targetCountries"),
    has("occupation") && (has("anzscoCode") || has("occupationCode")),
    calculationMode === "manual_adviser" || (has("dateOfBirth") && has("pointsTestDate")),
    calculationMode === "manual_adviser" || (["languageListening", "languageReading", "languageWriting", "languageSpeaking"].every(has)),
    calculationMode === "manual_adviser" || (has("overseasExperienceMonths") && has("australianExperienceMonths")),
    has("qualificationLevel") || has("education"),
    has("assessingBody") && has("skillsAssessmentResult"),
    Array.isArray(answers.feeItems) && answers.feeItems.length > 0,
    has("profileSummary") && has("advisorRecommendation") && has("nextActions"),
    has("factualSources") && (verifiedCalculation || manualCalculation),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function buildOrder(body: Payload, answers: Record<string, unknown>, productType: string, reference: string, name: string, email: string, phone: string): JiopayOrder {
  const config = getProductConfig(productType)!;
  const targets = textList(body.targetCountries, 500);
  const programmes = textList(body.selectedProgrammes, 1000);
  const now = new Date().toISOString();
  return {
    merchantTxnNo: reference,
    amountInr: 0,
    productType,
    productName: config.label,
    customer: { name, email, ...(phone ? { phone } : {}) },
    ...(normalizeText(body.track, 40) ? { track: normalizeText(body.track, 40) } : {}),
    ...(targets[0] ? { country: targets[0] } : {}),
    ...(programmes[0] ? { program: programmes[0] } : {}),
    answers,
    status: "initiated",
    createdAt: now,
    updatedAt: now,
    events: [{ type: "crm_assessment_report", at: now, data: { schemaVersion: 1 } }],
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function clientEmailHtml(name: string, reportName: string, reference: string) {
  return `<div style="margin:0;padding:26px;background:#eef3f9;font-family:Segoe UI,Arial,sans-serif;color:#071a3a">
    <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:20px;overflow:hidden">
      <div style="background:#071a3a;color:#fff;padding:28px"><div style="font-size:12px;font-weight:800;letter-spacing:.16em;color:#f6d86d">XIPHIAS IMMIGRATION</div><h1 style="margin:8px 0 0;color:#fff;font-size:27px">Your reviewed ${escapeHtml(reportName)}</h1></div>
      <div style="padding:28px"><p style="font-size:16px;line-height:1.7">Dear <strong>${escapeHtml(name)}</strong>,</p>
      <p style="font-size:15px;line-height:1.7">Please find your personalised, adviser-reviewed assessment report attached.</p>
      <p style="padding:12px 14px;background:#f8fbff;border-left:4px solid #1d73c9"><strong>Reference:</strong> ${escapeHtml(reference)}</p>
      <p style="font-size:13px;line-height:1.65;color:#536277">Immigration rules, fees and processing practices can change. The report records the information and sources reviewed on its preparation date and should be reconfirmed before filing.</p></div>
    </div></div>`;
}

function internalReviewEmailHtml(name: string, reportName: string, reference: string) {
  return `<div style="margin:0;padding:26px;background:#eef3f9;font-family:Segoe UI,Arial,sans-serif;color:#071a3a">
    <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:20px;overflow:hidden">
      <div style="background:#071a3a;color:#fff;padding:28px"><div style="font-size:12px;font-weight:800;letter-spacing:.16em;color:#f6d86d">XIPHIAS ASSESSMENT DESK</div><h1 style="margin:8px 0 0;color:#fff;font-size:27px">Internal review copy</h1></div>
      <div style="padding:28px"><p style="font-size:15px;line-height:1.7">A draft ${escapeHtml(reportName)} for <strong>${escapeHtml(name)}</strong> is attached for internal review.</p>
      <p style="padding:12px 14px;background:#fff7d6;border-left:4px solid #f0b429"><strong>Internal only:</strong> Do not forward this draft to the client. Review the facts, sources, points and recommendation in CRM before final client delivery.</p>
      <p><strong>Reference:</strong> ${escapeHtml(reference)}</p></div>
    </div></div>`;
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 25_000_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });
  const rawBody = await req.text();
  try {
    if (!verifyRequest(req, rawBody)) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Report integration is not configured." }, { status: 503 });
  }

  let body: Payload;
  try { body = JSON.parse(rawBody || "{}") as Payload; }
  catch { return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 }); }
  const mode = normalizeText(body.mode, 20).toLowerCase();
  const productType = normalizeText(body.productType, 80);
  if (!ALLOWED_MODES.has(mode) || !ALLOWED_PRODUCTS.has(productType))
    return NextResponse.json({ ok: false, error: "Unsupported report mode or template." }, { status: 400 });
  const config = getProductConfig(productType);
  if (!config?.reportKind || config.fulfillment !== "report")
    return NextResponse.json({ ok: false, error: "Report template is unavailable." }, { status: 400 });

  const reference = normalizeText(body.reference, 160);
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  if (!reference || !name || !email)
    return NextResponse.json({ ok: false, error: "Reference, client name and CRM email are required." }, { status: 400 });

  const reviewStatus = mode === "email" ? "advisor-reviewed" : "draft";
  const answers = cleanAnswers(body, reviewStatus);
  const calculationMode = normalizeText(answers.calculationMode, 40).toLowerCase();
  if (calculationMode === "australia_verified") {
    const calculated = calculateAustraliaPoints(answers);
    if (!calculated.ok) return NextResponse.json({ ok: false, error: calculated.errors.join(" ") }, { status: 400 });
    Object.assign(answers, calculated.values);
  } else if (calculationMode === "manual_adviser") {
    if (!normalizeText(answers.manualAssessmentReason, 1200))
      return NextResponse.json({ ok: false, error: "Manual adviser assessment requires an explanation." }, { status: 400 });
    const manualFields = ["agePoints", "englishPoints", "overseasExperiencePoints", "australianExperiencePoints",
      "professionalYearPoints", "qualificationPoints", "australianStudyPoints", "regionalStudyPoints",
      "stateNominationPoints", "regionalSponsorshipPoints", "partnerPoints", "communityLanguagePoints"];
    answers.claimedPointsTotal = manualFields.reduce((sum, key) => sum + Math.max(0, optionalNumber(answers[key]) ?? 0), 0);
    answers.ruleSetVersion = "MANUAL";
  } else {
    return NextResponse.json({ ok: false, error: "Select a supported calculation method." }, { status: 400 });
  }
  if (!Array.isArray(answers.feeItems) || answers.feeItems.length === 0)
    return NextResponse.json({ ok: false, error: "Add at least one fee or required-funds line with amount, currency and source." }, { status: 400 });
  const order = buildOrder(body, answers, productType, reference, name, email, phone);
  const completeness = structuredReportCompleteness(answers);
  if (mode === "email" && completeness < 60)
    return NextResponse.json({ ok: false, error: `Report completeness is ${completeness}%. At least 60% is required before email.` }, { status: 400 });

  let pdf: Buffer;
  let reviewedPdfHash = "";
  const isEmailDelivery = mode === "email" || mode === "internal-review";
  if (isEmailDelivery) {
    const base64 = typeof body.reviewedPdfBase64 === "string" ? body.reviewedPdfBase64 : "";
    reviewedPdfHash = normalizeText(body.reviewedPdfSha256, 64).toLowerCase();
    if (!base64 || !/^[a-f0-9]{64}$/.test(reviewedPdfHash))
      return NextResponse.json({ ok: false, error: "The reviewed PDF and its integrity hash are required." }, { status: 400 });
    pdf = Buffer.from(base64, "base64");
    const actualHash = createHash("sha256").update(pdf).digest("hex");
    if (!secureHexEqual(actualHash, reviewedPdfHash) || pdf.length < 1000 || pdf.subarray(0, 4).toString("ascii") !== "%PDF")
      return NextResponse.json({ ok: false, error: "The reviewed PDF failed its integrity check." }, { status: 400 });
  } else {
    pdf = await generateReportPdf(config.reportKind, order);
  }
  const filename = `XIPHIAS_${config.fileSlug}_${reference.replace(/[^a-z0-9_-]+/gi, "-")}.pdf`;
  if (isEmailDelivery) {
    const idempotencyKey = normalizeText(req.headers.get("idempotency-key"), 200);
    if (!idempotencyKey) return NextResponse.json({ ok: false, error: "Idempotency-Key is required for email." }, { status: 400 });
    const internalReview = mode === "internal-review";
    const deliveryEmail = internalReview ? normalizeEmail(body.deliveryRecipient) : email;
    if (!deliveryEmail) return NextResponse.json({ ok: false, error: "A valid internal review recipient is required." }, { status: 400 });
    const fingerprint = createHash("sha256").update(`${reference}\n${deliveryEmail}\n${mode}\n${productType}\n${reviewedPdfHash}`, "utf8").digest("hex");
    const delivery = beginCrmAssessmentEmail(idempotencyKey, fingerprint);
    if (delivery.status === "conflict") return NextResponse.json({ ok: false, error: "Idempotency key was already used for another report." }, { status: 409 });
    if (delivery.status === "sending") return NextResponse.json({ ok: false, error: "This report email is already being processed." }, { status: 409 });
    if (delivery.status === "sent") return NextResponse.json(delivery.result, { status: 200 });
    try {
      if (internalReview) {
        const internalEmail = await sendPlatformEmail({
          to: deliveryEmail,
          subject: `Internal review: ${config.label} - ${name}`,
          label: "XIPHIAS Assessment Desk",
          html: internalReviewEmailHtml(name, config.label, reference),
          attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
        });
        if (internalEmail.status !== "sent") {
          failCrmAssessmentEmail(idempotencyKey, internalEmail.reason);
          return NextResponse.json({ ok: false, error: internalEmail.reason, internalEmail }, { status: 502 });
        }
        const result = { ok: true, internalEmail, filename, completeness, schemaVersion: 1 };
        completeCrmAssessmentEmail(idempotencyKey, result);
        return NextResponse.json(result);
      }
      const clientEmail = await sendPlatformEmail({
        to: email,
        subject: config.emailSubject,
        label: "XIPHIAS Immigration",
        html: clientEmailHtml(name, config.label, reference),
        attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
      });
      if (clientEmail.status !== "sent") {
        failCrmAssessmentEmail(idempotencyKey, clientEmail.reason);
        return NextResponse.json({ ok: false, error: clientEmail.reason, clientEmail }, { status: 502 });
      }
      const staffEmail = await sendPlatformEmail({
        to: getPlatformRecipient("general"),
        subject: `${config.label} sent: ${name}`,
        label: "XIPHIAS Assessment Desk",
        html: `<p>A reviewed ${escapeHtml(config.label)} was sent to <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}).</p><p>Reference: ${escapeHtml(reference)}</p>`,
      });
      const result = { ok: true, clientEmail, staffEmail, filename, completeness, schemaVersion: 1 };
      completeCrmAssessmentEmail(idempotencyKey, result);
      return NextResponse.json(result);
    } catch (error) {
      failCrmAssessmentEmail(idempotencyKey, error instanceof Error ? error.message : "Email delivery failed.");
      throw error;
    }
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "preview" ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store, private",
      "X-Xiphias-Report-Schema": "1",
      "X-Xiphias-Completeness": String(completeness),
    },
  });
}
