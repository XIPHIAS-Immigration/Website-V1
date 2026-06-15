import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: unknown, max = 1000) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeEmail(value: unknown) {
  const email = normalizeText(value, 160).toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

function escapeHtml(str: string | undefined) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function line(label: string, value: string) {
  if (!value) return "";
  return `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>${escapeHtml(label)}</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const partnerName = normalizeText(body?.partnerName, 120);
    const companyName = normalizeText(body?.companyName, 160);
    const partnerType = normalizeText(body?.partnerType, 120);
    const partnerEmail = normalizeEmail(body?.partnerEmail);
    const partnerPhone = normalizeText(body?.partnerPhone, 40);
    const website = normalizeText(body?.website, 240);
    const marketsServed = normalizeText(body?.marketsServed, 220);
    const targetProgram = normalizeText(body?.targetProgram, 120);
    const partnershipGoal = normalizeText(body?.partnershipGoal, 4000);
    const inquiryName = normalizeText(body?.inquiryName, 120);
    const inquiryCountry = normalizeText(body?.inquiryCountry, 120);
    const rawInquiryEmail = normalizeText(body?.inquiryEmail, 160);
    const inquiryEmail = normalizeEmail(body?.inquiryEmail);
    const inquiryPhone = normalizeText(body?.inquiryPhone, 40);
    const page = normalizeText(body?.page, 120);
    const referrer = normalizeText(body?.referrer, 240);
    const consent = Boolean(body?.consent);
    const botTrap = normalizeText(body?.websiteField, 80);

    if (botTrap) {
      return NextResponse.json({ ok: true });
    }
    if (!partnerName || partnerName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please provide your full name." }, { status: 400 });
    }
    if (!partnerType) {
      return NextResponse.json({ ok: false, error: "Please choose the partnership type." }, { status: 400 });
    }
    if (!partnerEmail) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
    }
    if (!partnerPhone || !/^[0-9+()\-\s]{7,}$/i.test(partnerPhone)) {
      return NextResponse.json({ ok: false, error: "Please provide a valid phone number." }, { status: 400 });
    }
    if (website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(website)) {
      return NextResponse.json({ ok: false, error: "Please provide a valid website URL." }, { status: 400 });
    }
    if (!partnershipGoal || partnershipGoal.length < 20) {
      return NextResponse.json(
        { ok: false, error: "Please share a brief summary of the partnership opportunity." },
        { status: 400 }
      );
    }
    if (rawInquiryEmail && !inquiryEmail) {
      return NextResponse.json({ ok: false, error: "The opportunity email looks invalid." }, { status: 400 });
    }
    if (inquiryPhone && !/^[0-9+()\-\s]{7,}$/i.test(inquiryPhone)) {
      return NextResponse.json({ ok: false, error: "The opportunity phone number looks invalid." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ ok: false, error: "Consent is required to submit this form." }, { status: 400 });
    }

    let leadId: string | undefined;
    try {
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "partner",
        status: "new",
        name: partnerName,
        email: partnerEmail,
        phone: partnerPhone,
        country: inquiryCountry || marketsServed || undefined,
        program: targetProgram || partnerType || undefined,
        message: partnershipGoal,
        page: page || req.headers.get("referer") || "/partner-with-us",
        referrer: referrer || req.headers.get("referer") || undefined,
        consent,
        tags: ["partner-with-us", partnerType, companyName].filter(Boolean),
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: partnerName,
        to: "XIPHIAS",
        body: partnershipGoal,
      });
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: lead.id,
          path: page || req.headers.get("referer") || "/partner-with-us",
          referrer: referrer || req.headers.get("referer") || undefined,
          label: "partner-with-us",
          name: partnerName,
          email: partnerEmail,
          phone: partnerPhone,
          query: partnershipGoal,
          interests: [partnerType, targetProgram, inquiryCountry, marketsServed].filter(Boolean),
          metadata: {
            leadId: lead.id,
            companyName,
            website,
            inquiryName,
            inquiryEmail,
            inquiryPhone,
          },
        },
        req.headers,
      );
    } catch (leadError) {
      console.error("[partner-with-us] X-Hub lead capture failed:", leadError);
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail =
      process.env.EMAIL_FROM ||
      smtpUser ||
      "immigration@xiphias.in";
    const adminEmail =
      process.env.PARTNER_EMAIL_TO ||
      process.env.EMAIL_TO ||
      smtpUser ||
      "immigration@xiphias.in";

    if (!smtpHost || !fromEmail) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured for partnership enquiries." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    });

    const partnerHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:680px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:linear-gradient(90deg,#0f3a84,#2563eb);color:#fff;padding:22px 24px;">
          <h2 style="margin:0;font-size:22px;">Thank you for contacting the XIPHIAS partnerships desk</h2>
        </div>
        <div style="padding:24px;color:#1f2937;line-height:1.7;">
          <p>Dear <strong>${escapeHtml(partnerName)}</strong>,</p>
          <p>We have received your partnership request and our team will review the details shortly.</p>
          <div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;background:#f8fafc;">
            <p style="margin:0 0 10px 0;font-weight:600;">What we received</p>
            <p style="margin:4px 0;"><strong>Partnership type:</strong> ${escapeHtml(partnerType)}</p>
            ${companyName ? `<p style="margin:4px 0;"><strong>Company:</strong> ${escapeHtml(companyName)}</p>` : ""}
            ${targetProgram ? `<p style="margin:4px 0;"><strong>Primary demand:</strong> ${escapeHtml(targetProgram)}</p>` : ""}
            <p style="margin:8px 0 0 0;"><strong>Brief:</strong> ${escapeHtml(partnershipGoal)}</p>
          </div>
          <p style="margin-top:20px;">If there is a live client opportunity, we may ask for a quick discovery call so we can align on fit, timelines, and the right program strategy.</p>
          <div style="margin-top:28px;">
            <a href="https://www.xiphiasimmigration.com/partner-with-us" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">View partnership page</a>
          </div>
        </div>
      </div>
    `;

    const adminHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:720px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:#0f3a84;color:#fff;padding:22px 24px;">
          <h2 style="margin:0;font-size:22px;">New partner-with-us enquiry</h2>
        </div>
        <div style="padding:24px;color:#1f2937;line-height:1.7;">
          <table style="width:100%;border-collapse:collapse;">
            ${line("Partner name", partnerName)}
            ${line("Company", companyName)}
            ${line("Partner type", partnerType)}
            ${line("Email", partnerEmail)}
            ${line("Phone", partnerPhone)}
            ${line("Website", website)}
            ${line("Markets served", marketsServed)}
            ${line("Primary demand", targetProgram)}
            ${line("Opportunity name", inquiryName)}
            ${line("Opportunity country", inquiryCountry)}
            ${line("Opportunity email", inquiryEmail)}
            ${line("Opportunity phone", inquiryPhone)}
            ${line("Page", page)}
            ${line("Referrer", referrer)}
          </table>
          <div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;background:#f8fafc;">
            <p style="margin:0 0 10px 0;font-weight:600;">Partnership brief</p>
            <p style="margin:0;">${escapeHtml(partnershipGoal)}</p>
          </div>
          <p style="margin-top:18px;font-size:13px;color:#6b7280;">Consent confirmed by user: ${consent ? "Yes" : "No"}</p>
        </div>
      </div>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"XIPHIAS Partnerships" <${fromEmail}>`,
        to: adminEmail,
        replyTo: partnerEmail,
        subject: `New partner enquiry: ${partnerName}${companyName ? ` (${companyName})` : ""}`,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: `"XIPHIAS Immigration" <${fromEmail}>`,
        to: partnerEmail,
        subject: "We received your partnership request",
        html: partnerHtml,
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Partnership request submitted successfully.", leadId });
  } catch (err: any) {
    console.error("Error in /api/partner-with-us:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to submit partnership request." },
      { status: 500 }
    );
  }
}
