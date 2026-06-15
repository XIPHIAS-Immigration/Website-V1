import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";
import { sendPlatformEmail, keyValueHtml } from "@/lib/platform/email";
import { findWorkPermitCountry } from "@/lib/work-permits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESUME_BYTES = 6 * 1024 * 1024;
const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
]);

function uploadDir() {
  return process.env.WORK_PERMIT_UPLOAD_DIR
    ? path.resolve(process.env.WORK_PERMIT_UPLOAD_DIR)
    : path.join(process.cwd(), ".xiphias-platform", "work-permit-resumes");
}

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-").slice(0, 120);
}

function field(form: FormData, key: string, max = 500) {
  const value = form.get(key);
  return normalizeText(typeof value === "string" ? value : "", max);
}

function isResumeFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid form submission." }, { status: 400 });
  }

  const name = field(form, "name", 120);
  const email = normalizeEmail(field(form, "email", 180));
  const phone = normalizePhone(field(form, "phone", 60));
  const countrySlug = field(form, "countrySlug", 80);
  const countryName = field(form, "country", 80);
  const country = findWorkPermitCountry(countrySlug) || findWorkPermitCountry(countryName);
  const permitType = field(form, "permitType", 140);
  const currentRole = field(form, "currentRole", 140);
  const experience = field(form, "experience", 80);
  const notes = field(form, "notes", 1200);
  const page = field(form, "page", 240) || "/work-permits";
  const consent = parseBoolean(field(form, "consent", 20));
  const resume = form.get("resume");

  if (!name || !email || !phone || !country || !permitType) {
    return NextResponse.json(
      { ok: false, error: "Name, email, phone, country, and permit direction are required." },
      { status: 400 },
    );
  }

  if (!isResumeFile(resume)) {
    return NextResponse.json({ ok: false, error: "Please upload a resume/CV." }, { status: 400 });
  }

  if (resume.size > MAX_RESUME_BYTES) {
    return NextResponse.json({ ok: false, error: "Resume must be 6 MB or smaller." }, { status: 400 });
  }

  const contentType = resume.type || "application/octet-stream";
  const hasAcceptedExtension = /\.(pdf|doc|docx|txt)$/i.test(resume.name || "");
  if (!ACCEPTED_MIME.has(contentType) || (contentType === "application/octet-stream" && !hasAcceptedExtension)) {
    return NextResponse.json(
      { ok: false, error: "Resume must be PDF, DOC, DOCX, or TXT." },
      { status: 400 },
    );
  }

  const resumeBuffer = Buffer.from(await resume.arrayBuffer());
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const originalName = safeFilename(resume.name || "resume");
  const storedName = `${timestamp}-${safeFilename(name)}-${originalName}`;
  let storedPath = "";

  try {
    await fs.mkdir(uploadDir(), { recursive: true });
    storedPath = path.join(uploadDir(), storedName);
    await fs.writeFile(storedPath, resumeBuffer);
  } catch {
    storedPath = "";
  }

  const repo = getPlatformRepository();
  const message = [
    `Work permit resume review requested for ${country.country} - ${permitType}.`,
    currentRole ? `Current role: ${currentRole}.` : "",
    experience ? `Experience: ${experience}.` : "",
    notes ? `Notes: ${notes}` : "",
    storedPath ? `Resume stored at: ${storedPath}` : "Resume attached to email; local storage skipped.",
  ]
    .filter(Boolean)
    .join("\n");

  const lead = repo.createLead({
    source: "website",
    status: "qualified",
    name,
    email,
    phone,
    track: "skilled",
    country: country.country,
    program: permitType,
    message,
    page,
    referrer: req.headers.get("referer") || undefined,
    consent,
    tags: [
      "work-permit",
      `country:${country.slug}`,
      `permit:${safeFilename(permitType).toLowerCase()}`,
      currentRole ? "resume-review" : "resume-intake",
    ].slice(0, 8),
  });

  repo.createConversation({
    leadId: lead.id,
    channel: "portal",
    direction: "inbound",
    from: name,
    to: "XIPHIAS Work Permit Desk",
    body: message,
  });

  await captureVisitorEvent(
    {
      type: "lead_capture",
      visitorId: lead.id,
      path: page,
      referrer: req.headers.get("referer") || undefined,
      name,
      email,
      phone,
      label: "work-permit",
      query: `${country.country} ${permitType} ${currentRole} ${notes}`.trim(),
      interests: ["work permit", "skilled migration", country.country, permitType],
      metadata: {
        leadId: lead.id,
        country: country.country,
        permitType,
        currentRole,
        experience,
        resumeFileName: resume.name,
        resumeStored: Boolean(storedPath),
      },
    },
    req.headers,
  );

  const to = process.env.WORK_PERMIT_EMAIL_TO || "vishal@xiphias.in";
  const internalHtml = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827;">
      <div style="background:#0b2a6b;padding:28px 32px;border-radius:14px 14px 0 0;border-bottom:5px solid #e1b923;">
        <h2 style="margin:0;color:#fff;font-size:22px;">New Work Permit Resume Review</h2>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.78);font-size:13px;">Lead ID: ${lead.id}</p>
      </div>
      <div style="background:#f8fafc;padding:28px 32px;border:1px solid #dbe4f0;border-top:0;border-radius:0 0 14px 14px;">
        ${keyValueHtml([
          ["Name", name],
          ["Email", email],
          ["Phone", phone],
          ["Country", country.country],
          ["Permit direction", permitType],
          ["Current role", currentRole],
          ["Experience", experience],
          ["Notes", notes],
          ["Page", page],
          ["Saved resume path", storedPath],
        ])}
        <p style="margin:20px 0 0;color:#475569;font-size:13px;line-height:1.6;">
          Resume is attached to this email. This lead has also been saved in X-Hub under website/work-permit tags.
        </p>
      </div>
    </div>
  `;

  const clientHtml = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
      <div style="background:#0b2a6b;padding:30px;border-radius:14px 14px 0 0;text-align:center;border-bottom:5px solid #e1b923;">
        <img src="https://www.xiphiasimmigration.com/images/logo/xiphias-immigration-white.png" alt="XIPHIAS Immigration" height="38" style="height:38px;width:auto;display:block;margin:0 auto;" />
      </div>
      <div style="background:#fff;padding:30px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 14px 14px;">
        <h2 style="margin:0 0 10px;color:#0b2a6b;">We received your work permit review request</h2>
        <p style="margin:0 0 20px;color:#475569;line-height:1.7;">
          Thank you, ${name}. XIPHIAS will review your resume against the selected work permit direction and contact you with the next step.
        </p>
        ${keyValueHtml([
          ["Country", country.country],
          ["Permit direction", permitType],
          ["Current role", currentRole],
          ["Experience", experience],
        ])}
        <p style="font-size:12px;color:#64748b;line-height:1.6;margin-top:22px;">
          XIPHIAS provides permit and documentation advisory. This is not job placement and does not guarantee visa approval.
        </p>
      </div>
    </div>
  `;

  const [internalEmail, thankYouEmail, whatsapp] = await Promise.all([
    sendPlatformEmail({
      to,
      subject: `Work Permit Review: ${name} - ${country.country}`,
      html: internalHtml,
      replyTo: email,
      label: "XIPHIAS Work Permits",
      attachments: [
        {
          filename: resume.name || storedName,
          content: resumeBuffer,
          contentType,
        },
      ],
    }),
    sendPlatformEmail({
      to: email,
      subject: "Your work permit review request is received - XIPHIAS Immigration",
      html: clientHtml,
      label: "XIPHIAS Immigration",
    }),
    sendLeadAlert(lead),
  ]);

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    notifications: { internalEmail, thankYouEmail, whatsapp },
    resumeStored: Boolean(storedPath),
  });
}
