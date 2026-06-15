// ============================
// FILE: src/app/api/newsletter/subscribe/route.ts
// Newsletter subscribe API + email templates (client + internal) in ONE file
// ============================

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

// If you want to be explicit:
export const runtime = "nodejs";

// -------- ENV CONFIG --------
//
// Add these to your .env.local:
//
// SMTP_HOST=smtp.yourprovider.com
// SMTP_PORT=587
// SMTP_SECURE=false        # true if using port 465
// SMTP_USER=your_smtp_username
// SMTP_PASS=your_smtp_password
//
// NEWSLETTER_FROM_EMAIL="XIPHIAS Immigration <no-reply@xiphias.in>"
// NEWSLETTER_TEAM_EMAIL="immigration@xiphias.in"
//
// ----------------------------

const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL || process.env.SMTP_USER || "";
const TEAM_EMAIL =
  process.env.NEWSLETTER_TEAM_EMAIL || "immigration@xiphias.in";

type SubscribePayload = {
  email: string;
  source?: string; // e.g. "footer", "popup", etc.
  hp?: string;
};

const ALLOWED_SOURCES = new Set(["footer", "popup", "sidebar"]);

// --------- utils ---------

function isValidEmail(email: string): boolean {
  // Very simple email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? undefined;
}

function normalizeSingleLine(value: unknown, max = 240): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

function sanitizeSource(value: unknown): string {
  const rawSource = normalizeSingleLine(value, 80).toLowerCase();
  if (ALLOWED_SOURCES.has(rawSource)) return rawSource;
  return "footer";
}

function isValidBotRequest(req: NextRequest, hp?: string) {
  const requestedWith = req.headers.get("x-requested-with") || "";
  const userAgent = req.headers.get("user-agent") || "";

  if (hp && hp.trim().length > 0) return true;
  if (requestedWith.toLowerCase() !== "xmlhttprequest") return true;
  if (!userAgent || userAgent.toLowerCase().includes("curl") || userAgent.toLowerCase().includes("postman")) {
    return true;
  }

  return false;
}

function escapeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function createTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP environment variables not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // optional: verify connection once in dev
  if (process.env.NODE_ENV !== "production") {
    try {
      await transporter.verify();
      // console.log("SMTP connected");
    } catch (err) {
      console.error("SMTP verification failed", err);
    }
  }

  return transporter;
}

// =======================================
//  EMAIL TEMPLATES  (EDIT ONLY THIS PART)
// =======================================

// -------- Client email (to subscriber) --------

function clientSubject(): string {
  return "Welcome to XIPHIAS Immigration Newsletter";
}

function clientText(email: string): string {
  return `
Hi there,

Thank you for subscribing to the XIPHIAS Immigration newsletter with ${email}.

You’ll receive updates on:
• Residency and citizenship programs
• Skilled migration and work visa pathways
• Corporate & investor immigration insights
• Important policy changes and timelines

If you didn’t request this subscription, you can ignore this email.

Warm regards,
XIPHIAS Immigration Team
https://www.xiphiasimmigration.com
  `.trim();
}

function clientHtml(email: string): string {
  const safeEmail = escapeHtml(email);
  // Basic, mobile-friendly HTML email
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome to XIPHIAS Immigration Newsletter</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f7;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#0f3ea8,#1f76e0);color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">Welcome to XIPHIAS Immigration</h1>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">
                  Thanks for subscribing to our newsletter.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px 8px;color:#111827;font-size:14px;line-height:1.5;">
                <p style="margin-top:0;">Hi there,</p>
                <p>
                  Thank you for subscribing to the
                  <strong>XIPHIAS Immigration newsletter</strong> with
                  <strong>${safeEmail}</strong>.
                </p>

                <p>You’ll receive curated updates on:</p>
                <ul style="padding-left:18px;margin-top:6px;margin-bottom:12px;">
                  <li>Residency and citizenship by investment programs</li>
                  <li>Skilled migration and work visa opportunities</li>
                  <li>Corporate &amp; business immigration solutions</li>
                  <li>Policy changes, timelines, and process insights</li>
                </ul>

                <p style="margin-top:10px;">
                  You can unsubscribe at any time using the link in any future email.
                </p>

                <p style="margin-top:16px;font-size:13px;color:#4b5563;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 24px 18px;font-size:13px;color:#4b5563;">
                <p style="margin-top:0;margin-bottom:4px;">Warm regards,</p>
                <p style="margin:0;">
                  <strong>XIPHIAS Immigration</strong><br />
                  <a href="https://www.xiphiasimmigration.com" style="color:#1f76e0;text-decoration:none;">
                    www.xiphiasimmigration.com
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 24px 14px;background-color:#f9fafb;font-size:11px;color:#6b7280;">
                <p style="margin:0;">
                  This is an automated message. Please do not reply directly to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

// -------- Internal email (to your team) --------

function internalSubject(): string {
  return "New newsletter subscriber";
}

function internalText(opts: {
  email: string;
  source?: string;
  ip?: string;
  userAgent?: string | null;
}): string {
  const { email, source, ip, userAgent } = opts;

  return `
New newsletter subscriber captured.

Email: ${email}
Source: ${source || "unknown"}
IP: ${ip || "unknown"}
User Agent: ${userAgent || "unknown"}
Time (server): ${new Date().toISOString()}
  `.trim();
}

function internalHtml(opts: {
  email: string;
  source?: string;
  ip?: string;
  userAgent?: string | null;
}): string {
  const { email, source, ip, userAgent } = opts;
  const safeEmail = escapeHtml(email);
  const safeSource = escapeHtml(source || "unknown");
  const safeIp = escapeHtml(ip || "unknown");
  const safeUserAgent = escapeHtml(userAgent || "unknown");
  const sourceBadge = source ? `(source: ${safeSource})` : "";

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>New newsletter subscriber</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f7;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:16px 20px;background:#0f172a;color:#f9fafb;">
                <strong style="font-size:15px;">New newsletter subscriber</strong>
                <div style="font-size:12px;margin-top:4px;opacity:0.9;">
                  Captured via website
                  ${sourceBadge}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 20px;font-size:14px;color:#111827;">
                <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;">
                  <tr>
                    <td style="padding:4px 0;width:120px;color:#6b7280;">Email</td>
                    <td style="padding:4px 0;"><strong>${safeEmail}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;">Source</td>
                    <td style="padding:4px 0;">${safeSource}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;">IP</td>
                    <td style="padding:4px 0;">${safeIp}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;">User Agent</td>
                    <td style="padding:4px 0;">${safeUserAgent}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#6b7280;">Time</td>
                    <td style="padding:4px 0;">${new Date().toISOString()}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 20px 14px;background:#f9fafb;font-size:11px;color:#6b7280;">
                <p style="margin:0;">
                  This notification was generated by the XIPHIAS website footer newsletter form.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

// =========================
//  MAIN HANDLER (POST)
// =========================

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubscribePayload;
    const rawEmail = normalizeSingleLine(body?.email?.toString(), 160);
    const email = rawEmail?.toLowerCase();
    const source = sanitizeSource(body?.source || "footer");
    const honeypot = normalizeSingleLine(body?.hp, 80);

    if (isValidBotRequest(req, honeypot)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!FROM_EMAIL) {
      console.error("NEWSLETTER_FROM_EMAIL or SMTP_USER not configured");
      return NextResponse.json(
        {
          ok: false,
          message: "Configuration error. Please try again later.",
        },
        { status: 500 }
      );
    }

    const ipRaw = getClientIp(req);
    const ip = ipRaw ? normalizeSingleLine(ipRaw, 120) : undefined;
    const uaRaw = req.headers.get("user-agent");
    const userAgent = uaRaw ? normalizeSingleLine(uaRaw, 500) : undefined;

    let leadId: string | undefined;
    try {
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "website",
        status: "new",
        name: email.split("@")[0] || "Newsletter subscriber",
        email,
        message: `Newsletter subscription captured from ${source}.`,
        page: req.headers.get("referer") || "/",
        referrer: req.headers.get("referer") || undefined,
        consent: true,
        tags: ["newsletter", source].filter(Boolean),
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "email",
        direction: "inbound",
        from: email,
        to: "XIPHIAS",
        body: `Subscribed to newsletter from ${source}.`,
      });
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: lead.id,
          path: req.headers.get("referer") || "/",
          referrer: req.headers.get("referer") || undefined,
          label: `newsletter:${source}`,
          email,
          interests: ["newsletter", source],
          metadata: { leadId: lead.id, source: "newsletter" },
        },
        req.headers,
      );
    } catch (leadError) {
      console.error("[newsletter] X-Hub lead capture failed:", leadError);
    }

    const transporter = await createTransport();

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail({
        from: FROM_EMAIL,
        to: email,
        subject: clientSubject(),
        text: clientText(email),
        html: clientHtml(email),
      }),
      transporter.sendMail({
        from: FROM_EMAIL,
        to: TEAM_EMAIL,
        subject: internalSubject(),
        text: internalText({ email, source, ip, userAgent }),
        html: internalHtml({ email, source, ip, userAgent }),
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        message: "Subscribed",
        leadId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Unable to subscribe right now. Please try again in a little while.",
      },
      { status: 500 }
    );
  }
}
