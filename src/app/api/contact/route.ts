// Always run in Node (required if/when you later enable Nodemailer)
export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

// ✅ This route never throws to the frontend (always 200).
// ✅ If Email/WhatsApp envs are missing, it SKIPS those sends.
// ✅ Uses non-literal dynamic import for "nodemailer" so TS won't require it.

export async function POST(req: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({} as any));

    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const variant = String(body?.variant ?? "contact");
    const page = String(body?.page ?? "");
    const referrer = String(body?.referrer ?? "");
    const consent = String(body?.consent ?? "");

    // Basic guard (still returns 200, just skips)
    if (!name || !phone) {
      return NextResponse.json(
        {
          ok: true,
          warning: "missing required fields (name/phone) – accepted and skipped",
          email: "skipped",
          whatsapp: "skipped",
        },
        { status: 200 }
      );
    }

    const platformLead = getPlatformRepository().createLead({
      source: "website",
      name,
      email: email || undefined,
      phone,
      message: message || undefined,
      page: page || undefined,
      referrer: referrer || undefined,
      consent: Boolean(consent),
      tags: [variant].filter(Boolean),
    });
    getPlatformRepository().createConversation({
      leadId: platformLead.id,
      channel: "portal",
      direction: "inbound",
      from: name,
      to: "XIPHIAS",
      body: message || `Consultation/enquiry form submitted from ${page || "website"}.`,
    });

    await captureVisitorEvent(
      {
        type: "lead_capture",
        visitorId: String(body?.visitorId || platformLead.id),
        sessionId: String(body?.sessionId || ""),
        path: page || req.headers.get("referer") || "/",
        referrer,
        name,
        email,
        phone,
        label: variant,
        query: message,
        interests: [variant],
      },
      req.headers,
    );

    // ---------- EMAIL (optional) ----------
    let emailStatus: "sent" | "skipped" | "failed" = "skipped";
    const fromEmail =
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      "immigration@xiphias.in";
    const toEmail =
      process.env.EMAIL_TO ||
      process.env.SMTP_USER ||
      "immigration@xiphias.in";
    const hasEmailCfg = !!process.env.SMTP_HOST && !!fromEmail && !!toEmail;

    if (hasEmailCfg) {
      try {
        // ⬇️ Non-literal dynamic import avoids TS2307 when nodemailer isn't installed
        const pkgName: string = "nodemailer";
        const nodemailerMod: any = await import(pkgName);
        const nodemailer = nodemailerMod.default ?? nodemailerMod;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465, // implicit TLS on 465
          auth: process.env.SMTP_USER
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
        });

        const subject = `New enquiry (${variant}) — ${name}`;
        const html = `
          <h2>New enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
          ${message ? `<p><strong>Message:</strong><br/>${escapeHtml(message)}</p>` : ""}
          <hr/>
          <p><strong>Consent:</strong> ${consent ? "Yes" : "No"}</p>
          ${page ? `<p><strong>Page:</strong> ${escapeHtml(page)}</p>` : ""}
          ${referrer ? `<p><strong>Referrer:</strong> ${escapeHtml(referrer)}</p>` : ""}
        `;

        await transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          replyTo: email || undefined,
          subject,
          html,
        });

        emailStatus = "sent";
      } catch {
        // nodemailer not installed or SMTP error → keep UI happy
        emailStatus = "failed";
      }
    }

    // ---------- WHATSAPP (optional, Meta Cloud API) ----------
    let whatsappStatus: "sent" | "skipped" | "failed" = "skipped";
    const whatsapp = await sendLeadAlert(platformLead);
    whatsappStatus = whatsapp.status === "sent" ? "sent" : whatsapp.status === "failed" ? "failed" : "skipped";

    return NextResponse.json(
      { ok: true, leadId: platformLead.id, email: emailStatus, whatsapp: whatsappStatus, tookMs: Date.now() - t0 },
      { status: 200 }
    );
  } catch {
    // Final safety net: never fail the client
    return NextResponse.json({ ok: true, email: "skipped", whatsapp: "skipped" }, { status: 200 });
  }
}

/* --------- helpers --------- */
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

