import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: unknown, max = 1000) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeEmail(value: unknown) {
  const email = normalizeText(value, 160).toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = normalizeText(body?.name, 120);
    const phone = normalizeText(body?.phone, 40);
    const email = normalizeEmail(body?.email);
    const message = normalizeText(body?.message, 4000);
    const country = normalizeText(body?.country, 120);
    const page = normalizeText(body?.page, 240);
    const referrer = normalizeText(body?.referrer, 500);
    const variant = normalizeText(body?.variant, 40);
    const consent = body?.consent === "yes" || body?.consent === true;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please provide your full name." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeCountry = escapeHtml(country || "Not specified");
    const safeMessage = escapeHtml(message || "No message provided");
    const safePage = escapeHtml(page || "Not provided");
    const safeReferrer = escapeHtml(referrer || "Not provided");
    const mailto = `mailto:${encodeURIComponent(email)}`;
    const lead = getPlatformRepository().createLead({
      source: "website",
      status: "new",
      name,
      email,
      phone,
      country,
      message,
      page,
      referrer,
      consent,
      tags: [variant || "contact", "contact-form"],
    });
    getPlatformRepository().createConversation({
      leadId: lead.id,
      channel: "portal",
      direction: "inbound",
      from: name,
      to: "XIPHIAS",
      body: message || `Consultation/enquiry form submitted from ${page || "website"}.`,
    });

    await captureVisitorEvent(
      {
        type: "lead_capture",
        visitorId: normalizeText(body?.visitorId, 100) || lead.id,
        sessionId: normalizeText(body?.sessionId, 100) || undefined,
        path: page || req.headers.get("referer") || "/",
        referrer,
        name,
        email,
        phone,
        label: variant || "contact-form",
        query: message,
        interests: [country, variant].filter(Boolean),
      },
      req.headers,
    );

    const userHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:linear-gradient(90deg,#002961,#004fa3);color:#fff;text-align:center;padding:20px;">
          <h2 style="margin:0;font-size:20px;">Thank You from XIPHIAS Immigration Pvt. Ltd.</h2>
        </div>
        <div style="padding:24px;color:#333;line-height:1.7;">
          <p style="font-size:16px;">Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for your enquiry with <strong>XIPHIAS Immigration</strong>. Our team will get back to you soon.</p>

          <div style="background:#f9f9f9;padding:16px 20px;border-left:4px solid #004fa3;margin-top:20px;border-radius:6px;">
            <p style="margin:0 0 8px 0;font-weight:600;">Your enquiry details:</p>
            <p style="margin:4px 0;"><strong>Email:</strong> <a href="${mailto}" style="color:#004fa3;text-decoration:none;">${safeEmail}</a></p>
            <p style="margin:4px 0;"><strong>Phone:</strong> ${safePhone}</p>
            <p style="margin:4px 0;"><strong>Message:</strong> ${safeMessage}</p>
          </div>

          <div style="text-align:center;margin-top:30px;">
            <a href="https://www.xiphiasimmigration.com" target="_blank" style="background:#004fa3;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Visit Our Website</a>
          </div>

          <div style="text-align:center;margin:25px 0;">
            <img src="https://www.xiphiasimmigration.com/images/2019-05-02.png" alt="rating" style="width:150px;margin-bottom:8px;">
            <p style="font-size:14px;margin:6px 0;">Please <a href="https://www.xiphiasimmigration.com/xiphias/userratings/Index" style="color:#004fa3;text-decoration:none;font-weight:600;">click here</a> to rate us or click the stars above.</p>
            <p style="font-size:14px;">Refer and earn vouchers worth Rs. 5,000/-. <a href="https://www.xiphiasimmigration.com/Client-Referrals.html" style="color:#004fa3;text-decoration:none;">Click to Refer</a></p>
          </div>

          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

          <div style="text-align:center;font-size:13px;color:#666;">
            <p style="margin:4px 0;"><strong>XIPHIAS Immigration Pvt. Ltd</strong></p>
            <p style="margin:4px 0;">Aurbis Prime, 11, Kaveri Regent Coronet, 80 Feet Road, 3rd Block,<br> Koramangala, Bangalore-560034</p>
            <p style="margin:4px 0;">+91-80-67601000 / 9021335577</p>
            <p style="margin:4px 0;"><a href="mailto:immigration@xiphias.in" style="color:#004fa3;">immigration@xiphias.in</a> | <a href="https://www.xiphiasimmigration.com" style="color:#004fa3;">www.xiphiasimmigration.com</a></p>
            <div style="margin-top:10px;">
              <a href="https://play.google.com/store/apps/details?id=com.xiphiasimmigration.app.android" target="_blank" style="margin-right:10px;">
                <img src="https://www.xiphiasimmigration.com/XIPHIAS/Content/images/android.png" height="28" />
              </a>
              <a href="https://itunes.apple.com/in/app/xiphias-immigration/id1376016286?mt=8" target="_blank">
                <img src="https://www.xiphiasimmigration.com/XIPHIAS/Content/images/ios.png" height="28" />
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    const adminHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:#004fa3;color:#fff;text-align:center;padding:20px;">
          <h2 style="margin:0;font-size:20px;">New enquiry from website</h2>
        </div>
        <div style="padding:24px;color:#333;line-height:1.7;">
          <p>Dear Admin,</p>
          <p>You have received a new enquiry from the XIPHIAS website.</p>

          <table style="width:100%;border-collapse:collapse;margin-top:15px;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${safeName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${mailto}" style="color:#004fa3;text-decoration:none;">${safeEmail}</a></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${safePhone}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Country</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${safeCountry}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Lead ID</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(lead.id)}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Page</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${safePage}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Referrer</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${safeReferrer}</td></tr>
            <tr><td style="padding:8px;"><strong>Message</strong></td><td style="padding:8px;">${safeMessage}</td></tr>
          </table>

          <div style="text-align:center;margin-top:30px;">
            <a href="https://www.xiphiasimmigration.com/admin" target="_blank" style="background:#004fa3;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Open Admin Portal</a>
          </div>

          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
          <p style="font-size:13px;color:#777;text-align:center;">This email was generated automatically by the XIPHIAS Website Enquiry System.</p>
        </div>
      </div>
    `;

    const userMail = {
      from: `"XIPHIAS Immigration" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thank you for your enquiry",
      html: userHtml,
    };

    const adminMail = {
      from: `"XIPHIAS Website" <${process.env.SMTP_USER}>`,
      to: "immigration@xiphias.in",
      subject: "New enquiry from website",
      html: adminHtml,
    };

    await Promise.all([transporter.sendMail(adminMail), transporter.sendMail(userMail)]);

    return NextResponse.json({ ok: true, message: "Lead captured and emails sent successfully", leadId: lead.id });
  } catch (err: any) {
    console.error("Error in /api/enquiry:", err);
    return NextResponse.json({ error: err?.message || "Request failed" }, { status: 500 });
  }
}
