import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { getCurrentPortalUser, hashPassword } from "@/lib/platform/auth";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

const DEFAULT_SITE_URL = "https://www.xiphiasimmigration.com";
const DEFAULT_PRICE_INR = 10000;

function safeEqualSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getByPath(input: Payload, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Payload)[part];
  }, input);
}

function pickText(input: Payload, keys: string[], max = 240) {
  for (const key of keys) {
    const value = normalizeText(getByPath(input, key), max);
    if (value) return value;
  }
  return "";
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const siteUrl = getSiteUrl();
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatInr(value: unknown) {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  const amount = Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_PRICE_INR;
  return `INR ${amount.toLocaleString("en-IN")}`;
}

function safeAnswers(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const cleanKey = key.replace(/[^\w.-]/g, "").slice(0, 64);
    if (!cleanKey) continue;
    if (typeof value === "string") out[cleanKey] = value.slice(0, 1000);
    else if (typeof value === "number" || typeof value === "boolean" || value == null) out[cleanKey] = value;
    else out[cleanKey] = String(value).slice(0, 200);
  }
  return Object.keys(out).length ? out : null;
}

async function buildDetailedReportAttachment(args: {
  name: string;
  email: string;
  phone?: string;
  track: Track;
  answers: Record<string, unknown> | null;
}) {
  if (!args.answers) return null;
  try {
    const response = await fetch(absoluteUrl("/api/eligibility/report"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: args.name,
        email: args.email,
        phone: args.phone,
        track: args.track,
        answers: args.answers,
        reportType: "detailed",
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      filename: `XIPHIAS_Detailed_Personal_Report_${args.track}.pdf`,
      content: bytes,
      contentType: "application/pdf",
    };
  } catch (error) {
    console.warn("[registration] Could not generate detailed PDF attachment.", error);
    return null;
  }
}

function randomPassword() {
  return `XIP-${randomBytes(8).toString("base64url")}`;
}

function randomClientId() {
  return `cli_${randomBytes(5).toString("hex")}`;
}

function nextDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function resolveTrack(value: unknown): Track {
  return isTrack(value) ? value : "residency";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isAuthorized(req: NextRequest, body: Payload) {
  const configured = normalizeText(process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET, 240);
  const supplied =
    normalizeText(req.headers.get("x-registration-secret"), 240) ||
    normalizeText(req.headers.get("x-topmate-secret"), 240) ||
    normalizeText(body.secret, 240);

  if (configured) return Boolean(supplied && safeEqualSecret(supplied, configured));
  return process.env.NODE_ENV !== "production";
}

function credentialEmailHtml(args: {
  name: string;
  email: string;
  temporaryPassword?: string;
  loginUrl: string;
  accountUrl: string;
  paymentReference: string;
  track: Track;
  country: string;
  program: string;
  amount: string;
}) {
  const logoUrl = `${getSiteUrl()}/images/logo/xiphias-immigration.png`;
  const safeName = escapeHtml(args.name);
  const passwordBlock = args.temporaryPassword
    ? `
      <div style="margin:18px 0;border:1px solid #d8b650;border-radius:16px;background:#fffaf0;padding:16px;">
        <div style="font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8a6a00;">Temporary access</div>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;">
          <tr>
            <td style="padding:8px 0;color:#42526b;font-size:13px;">User ID</td>
            <td style="padding:8px 0;text-align:right;font-weight:900;color:#071a3a;">${escapeHtml(args.email)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#42526b;font-size:13px;">Password</td>
            <td style="padding:8px 0;text-align:right;font-weight:900;color:#071a3a;">${escapeHtml(args.temporaryPassword)}</td>
          </tr>
        </table>
        <p style="margin:10px 0 0;color:#536277;font-size:12px;line-height:1.6;">Please change this password from Account Settings after signing in.</p>
      </div>
    `
    : `
      <div style="margin:18px 0;border:1px solid #dbe7f3;border-radius:16px;background:#f8fbff;padding:16px;">
        <div style="font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#0b4ea2;">Portal access</div>
        <p style="margin:8px 0 0;color:#34435a;font-size:14px;line-height:1.7;">Your existing X-Hub account remains active. Sign in with your current password to view the new registration workspace.</p>
      </div>
    `;

  return `
    <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
      <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,.14);">
        <div style="background:#071a3a;color:#fff;padding:28px;">
          <img src="${logoUrl}" alt="XIPHIAS Immigration" width="150" style="display:block;background:#fff;border-radius:10px;padding:8px;margin-bottom:22px;" />
          <div style="font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#f6d86d;">Registration confirmed</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.18;color:#fff;">Welcome to X-Hub</h1>
          <p style="margin:12px 0 0;color:#dbe7f3;font-size:15px;line-height:1.7;">Your paid registration has been recorded and your secure case workspace is ready.</p>
        </div>

        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hi <strong>${safeName}</strong>,</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">We have opened your X-Hub workspace for the <strong>${escapeHtml(titleCase(args.track))}</strong> route. Your advisor workflow now starts with profile confirmation, document collection, detailed report preparation, and strategy review.</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0;">
            <div style="border:1px solid #dbe7f3;border-radius:14px;padding:14px;background:#f8fbff;">
              <div style="font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#536277;">Route focus</div>
              <div style="font-size:17px;font-weight:900;color:#071a3a;margin-top:5px;">${escapeHtml(args.country)}</div>
              <div style="font-size:13px;color:#536277;margin-top:4px;">${escapeHtml(args.program)}</div>
            </div>
            <div style="border:1px solid #dbe7f3;border-radius:14px;padding:14px;background:#f8fbff;">
              <div style="font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#536277;">Registration</div>
              <div style="font-size:17px;font-weight:900;color:#071a3a;margin-top:5px;">${escapeHtml(args.amount)}</div>
              <div style="font-size:13px;color:#536277;margin-top:4px;">Ref: ${escapeHtml(args.paymentReference)}</div>
            </div>
          </div>

          ${passwordBlock}

          <div style="margin:24px 0;border-radius:18px;background:#071a3a;padding:22px;color:#fff;">
            <div style="font-size:12px;color:#f6d86d;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">Next steps</div>
            <ol style="margin:12px 0 18px;padding-left:20px;color:#dbe7f3;line-height:1.8;font-size:14px;">
              <li>Sign in to X-Hub.</li>
              <li>Review your active case and next action.</li>
              <li>Upload requested documents in the document vault.</li>
              <li>Track report and advisor milestones online.</li>
            </ol>
            <a href="${args.loginUrl}" style="display:inline-block;background:#d8b650;color:#071a3a;text-decoration:none;font-weight:900;border-radius:12px;padding:13px 18px;">Open X-Hub</a>
            <a href="${args.accountUrl}" style="display:inline-block;margin-left:10px;color:#fff;text-decoration:none;font-weight:800;border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:12px 16px;">Account settings</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Payload;

  const portalUser = await getCurrentPortalUser();
  const isPortalAdmin = portalUser?.role === "admin" || portalUser?.role === "staff";

  if (!isPortalAdmin && !isAuthorized(req, body)) {
    return NextResponse.json(
      { ok: false, error: "Registration provisioning is not authorized." },
      { status: 401 },
    );
  }

  const name =
    pickText(body, ["name", "customerName", "clientName", "buyer.name", "customer.name"], 120) ||
    "XIPHIAS Client";
  const email = normalizeEmail(
    pickText(body, ["email", "customerEmail", "clientEmail", "buyer.email", "customer.email"], 160),
  );
  const phone = normalizePhone(
    pickText(body, ["phone", "customerPhone", "clientPhone", "buyer.phone", "customer.phone"], 40),
  );
  const track = resolveTrack(getByPath(body, "track") || getByPath(body, "pathway"));
  const country =
    pickText(body, ["country", "targetCountry", "routeCountry", "answers.country"], 80) ||
    "Advisor shortlist";
  const program =
    pickText(body, ["program", "targetProgram", "product", "route", "answers.program"], 140) ||
    "Detailed assessment and advisor report";
  const paymentReference =
    pickText(body, ["paymentReference", "paymentId", "transactionId", "bookingId", "orderId", "id"], 160) ||
    `registration_${Date.now()}`;
  const amountValue = getByPath(body, "amount") || getByPath(body, "price") || DEFAULT_PRICE_INR;
  const amountLabel = formatInr(amountValue);
  const resetPassword = parseBoolean(getByPath(body, "resetPassword"));
  const sendCredentialsEmail = getByPath(body, "sendEmail") === false ? false : !["false", "0", "off"].includes(String(getByPath(body, "sendEmail") ?? "").toLowerCase());
  const answers = safeAnswers(getByPath(body, "answers"));

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "A paid registration email is required." },
      { status: 400 },
    );
  }

  const repo = getPlatformRepository();
  const duplicateUser = repo.listUsers().find((user) => user.registrationPaymentRef === paymentReference);
  if (duplicateUser && !resetPassword) {
    return NextResponse.json({
      ok: true,
      idempotent: true,
      message: "Registration payment was already provisioned.",
      user: {
        email: duplicateUser.email,
        clientId: duplicateUser.clientId,
      },
    });
  }

  const existing = repo.getUserByEmail(email);
  if (existing && existing.role !== "client") {
    return NextResponse.json(
      { ok: false, error: "This email is already assigned to a non-client portal role." },
      { status: 409 },
    );
  }

  const temporaryPassword = !existing?.passwordSha256 || resetPassword ? randomPassword() : undefined;
  const clientId = existing?.clientId || randomClientId();
  const passwordPatch = temporaryPassword ? { passwordSha256: hashPassword(temporaryPassword) } : {};
  const user = existing
    ? repo.updateUser(existing.id, {
        name,
        role: "client",
        clientId,
        portalStatus: temporaryPassword ? "invited" : existing.portalStatus ?? "active",
        mustChangePassword: temporaryPassword ? true : existing.mustChangePassword,
        registrationPaymentRef: paymentReference,
        ...passwordPatch,
      })!
    : repo.createUser({
        email,
        name,
        role: "client",
        clientId,
        portalStatus: "invited",
        mustChangePassword: true,
        registrationPaymentRef: paymentReference,
        passwordSha256: hashPassword(temporaryPassword || randomPassword()),
      });

  const profile = repo.upsertClientProfile(
    {
      clientId,
      userId: user.id,
      fullName: name,
      email,
      phone: phone || undefined,
      preferredTrack: track,
      targetCountry: country,
      targetProgram: program,
      notes: `Paid registration captured for ${amountLabel}. Ref: ${paymentReference}`,
    },
    user.id,
  );

  const lead = repo.createLead({
    source: "registration",
    status: "case_opened",
    name,
    email,
    phone: phone || undefined,
    track,
    country,
    program,
    message: `Paid registration captured for ${amountLabel}. Ref: ${paymentReference}`,
    page: "/registration",
    consent: true,
    score: 100,
    tags: ["paid-registration", `track:${track}`, `payment:${paymentReference}`],
  });

  const migrationCase = repo.createCase({
    clientId,
    leadId: lead.id,
    track,
    country,
    program,
    stage: "intake",
    title: `${country} ${titleCase(track)} registration`,
    advisorName: "Senior Global Mobility Desk",
    nextAction: "Confirm profile details and upload the requested onboarding documents.",
    nextActionDue: nextDate(3),
    riskLevel: "medium",
    progress: 12,
  });

  const documents = [
    ["Primary applicant passport", "identity", nextDate(5)],
    ["Proof of address", "identity", nextDate(5)],
    ["Source of funds summary", "financial", nextDate(7)],
    ["Civil and family documents", "civil", nextDate(10)],
    ["Program-specific supporting documents", "investment", nextDate(12)],
  ] as const;

  for (const [label, category, dueAt] of documents) {
    repo.createDocument({
      caseId: migrationCase.id,
      label,
      category,
      status: "requested",
      dueAt,
      notes: "Requested after paid registration. Upload through X-Hub.",
    });
  }

  const milestones = [
    ["Registration received", "Payment event recorded and portal workspace opened.", "complete", nextDate(0)],
    ["Profile verification", "XIPHIAS team checks intake answers and route assumptions.", "active", nextDate(3)],
    ["Document collection", "Client uploads identity, civil, financial, and route-specific records.", "pending", nextDate(7)],
    ["Detailed report preparation", "Advisor-backed personal report is prepared for review.", "pending", nextDate(10)],
    ["Strategy call", "Client reviews the report and next product/service action with XIPHIAS.", "pending", nextDate(14)],
  ] as const;

  for (const [title, description, status, dueAt] of milestones) {
    repo.createMilestone({
      caseId: migrationCase.id,
      title,
      description,
      status,
      dueAt,
      completedAt: status === "complete" ? nextDate(0) : undefined,
    });
  }

  repo.addRiskProfile({
    caseId: migrationCase.id,
    level: "medium",
    requiresStaffReview: true,
    flags: [
      {
        code: "paid_registration_review_required",
        label: "Advisor review required",
        severity: "medium",
        detail: "Paid registration is received. Staff must verify intake answers, documents, and route suitability before final advice.",
      },
    ],
  });

  repo.createConversation({
    leadId: lead.id,
    caseId: migrationCase.id,
    channel: "portal",
    direction: "outbound",
    from: "XIPHIAS",
    to: name,
    body: "Your paid registration has been received. Please sign in, confirm your profile, and upload requested documents.",
  });

  repo.audit("registration.provisioned", "registration", paymentReference, user.id, {
    clientId,
    caseId: migrationCase.id,
    amount: amountLabel,
  });

  const loginUrl = absoluteUrl("/x-hub/sign-in");
  const accountUrl = absoluteUrl("/x-hub/account");
  const detailedReportAttachment = await buildDetailedReportAttachment({
    name,
    email,
    phone: phone || undefined,
    track,
    answers,
  });
  const clientEmail = sendCredentialsEmail
    ? await sendPlatformEmail({
        to: email,
        subject: "Your X-Hub registration is ready",
        label: "X-Hub",
        html: credentialEmailHtml({
          name,
          email,
          temporaryPassword,
          loginUrl,
          accountUrl,
          paymentReference,
          track,
          country,
          program,
          amount: amountLabel,
        }).replace(
          "</ol>",
          detailedReportAttachment
            ? "<li>Open the attached detailed personal report PDF.</li></ol>"
            : "<li>Your detailed PDF will be prepared by the advisor desk after profile verification.</li></ol>",
        ),
        attachments: detailedReportAttachment ? [detailedReportAttachment] : undefined,
      })
    : ({ status: "skipped", reason: "Admin chose not to send credentials email." } as const);

  const staffEmail = await sendPlatformEmail({
    to: getPlatformRecipient("general"),
    subject: `Paid registration provisioned: ${name}`,
    label: "XIPHIAS Platform",
    html: `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:680px;margin:auto;color:#071a3a;">
        <h2>Paid registration provisioned</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
        <p><strong>Track:</strong> ${escapeHtml(track)}</p>
        <p><strong>Country:</strong> ${escapeHtml(country)}</p>
        <p><strong>Program:</strong> ${escapeHtml(program)}</p>
        <p><strong>Amount:</strong> ${escapeHtml(amountLabel)}</p>
        <p><strong>Payment ref:</strong> ${escapeHtml(paymentReference)}</p>
        <p><strong>Case:</strong> ${escapeHtml(migrationCase.id)}</p>
      </div>
    `,
  });

  return NextResponse.json({
    ok: true,
    user: {
      email: user.email,
      clientId: user.clientId,
      portalStatus: user.portalStatus,
      mustChangePassword: user.mustChangePassword,
    },
    profileId: profile.id,
    leadId: lead.id,
    caseId: migrationCase.id,
    credentialsSent: clientEmail.status,
    staffNotification: staffEmail.status,
    ...(isPortalAdmin && temporaryPassword ? { temporaryPassword } : {}),
  });
}
