import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import { sendPlatformEmail, getPlatformRecipient, keyValueHtml } from "@/lib/platform/email";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";
import type { LeadSource } from "@/lib/platform/types";
import { isTrack } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCES = new Set<LeadSource>(["website", "chat", "whatsapp", "eligibility", "registration", "programme_ai", "partner", "b2g"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const source = SOURCES.has(body.source) ? (body.source as LeadSource) : "website";
  const track = isTrack(body.track) ? body.track : undefined;

  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { ok: false, error: "Name and at least one contact channel are required." },
      { status: 400 },
    );
  }

  const repo = getPlatformRepository();
  const lead = repo.createLead({
    source,
    name,
    email: email || undefined,
    phone: phone || undefined,
    track,
    country: normalizeText(body.country, 80) || undefined,
    program: normalizeText(body.program, 120) || undefined,
    message: normalizeText(body.message, 1200) || undefined,
    page: normalizeText(body.page, 240) || req.headers.get("referer") || undefined,
    referrer: normalizeText(body.referrer, 240) || req.headers.get("referer") || undefined,
    consent: parseBoolean(body.consent),
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag: unknown) => normalizeText(tag, 40)).filter(Boolean).slice(0, 8)
      : [],
  });

  if (lead.message) {
    repo.createConversation({
      leadId: lead.id,
      channel: source === "chat" ? "website-chat" : "portal",
      direction: "inbound",
      from: lead.name,
      to: "XIPHIAS",
      body: lead.message,
    });
  }

  await captureVisitorEvent(
    {
      type: "lead_capture",
      visitorId: normalizeText(body.visitorId, 100) || lead.id,
      sessionId: normalizeText(body.sessionId, 100) || undefined,
      path: lead.page || req.headers.get("referer") || "/",
      referrer: lead.referrer,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      label: lead.source,
      interests: [lead.track, lead.country, lead.program].filter(Boolean),
      query: lead.message,
    },
    req.headers,
  );

  const whatsapp = await sendLeadAlert(lead);

  // ── Internal alert email to team ──────────────────────────────────────────
  const teamRecipient = getPlatformRecipient("general");
  const internalHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <div style="background:#1c57b4;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#fff;font-size:20px;">New Enquiry Received</h2>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
          ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
        </p>
      </div>
      <div style="background:#f8fafc;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
        ${keyValueHtml([
          ["Name",    lead.name],
          ["Email",   lead.email],
          ["Phone",   lead.phone],
          ["Source",  lead.source],
          ["Page",    lead.page],
          ["Track",   lead.track],
          ["Country", lead.country],
          ["Program", lead.program],
          ["Message", lead.message],
        ])}
      </div>
    </div>
  `;
  const internalEmail = sendPlatformEmail({
    to: teamRecipient,
    subject: `New Lead: ${lead.name} via ${lead.source}${lead.page ? ` / ${lead.page}` : ""}`,
    html: internalHtml,
    replyTo: lead.email,
    label: "XIPHIAS Leads",
  });

  // ── Thank-you confirmation email to enquirer ───────────────────────────────
  let thankYouEmail: ReturnType<typeof sendPlatformEmail> | null = null;
  if (lead.email) {
    const thankYouHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#1c57b4;padding:32px;border-radius:8px 8px 0 0;text-align:center;">
          <img src="https://www.xiphiasimmigration.com/images/logo/xiphias-immigration-white.png" alt="XIPHIAS Immigration" height="36" style="height:36px;width:auto;display:block;margin:0 auto;" />
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#1c57b4;">Thank you, ${escapeHtmlSimple(lead.name)}!</h2>
          <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">
            We've received your enquiry and one of our immigration advisors will reach out to you
            <strong>within 24 hours</strong> to discuss your options.
          </p>
          ${keyValueHtml([
            ["Your Name",  lead.name],
            ["Email",      lead.email],
            ["Phone",      lead.phone],
            ["Program",    lead.program],
            ["Country",    lead.country],
          ])}
          <div style="margin:28px 0;text-align:center;">
            <a href="https://xiphiasimmigration.com/eligibility"
               style="display:inline-block;background:#e1b923;color:#0b2a6b;font-weight:700;font-size:14px;padding:13px 28px;border-radius:999px;text-decoration:none;">
              Check Your Eligibility →
            </a>
          </div>
          <p style="font-size:12px;color:#9ca3af;line-height:1.5;border-top:1px solid #f3f4f6;padding-top:16px;margin:0;">
            XIPHIAS Immigration Consultancy &bull; India&apos;s Most Trusted Global Mobility Partner<br/>
            <a href="https://www.xiphiasimmigration.com" style="color:#1c57b4;">xiphiasimmigration.com</a>
            &nbsp;&bull;&nbsp;
            <a href="mailto:immigration@xiphias.in" style="color:#1c57b4;">immigration@xiphias.in</a>
          </p>
        </div>
      </div>
    `;
    thankYouEmail = sendPlatformEmail({
      to: lead.email,
      subject: "We've received your enquiry — XIPHIAS Immigration",
      html: thankYouHtml,
      label: "XIPHIAS Immigration",
    });
  }

  const [internalResult, thankYouResult] = await Promise.all([
    internalEmail,
    thankYouEmail ?? Promise.resolve(null),
  ]);

  return NextResponse.json({
    ok: true,
    lead,
    notifications: { whatsapp, internalEmail: internalResult, thankYouEmail: thankYouResult },
  });
}

function escapeHtmlSimple(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
