import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

/**
 * API route to handle brochure download leads.
 *
 * Sends an email notification to admin. Now also accepts `email` from the form.
 */
export async function POST(req: Request) {
  console.log("📨 API /api/brochure-lead hit");

  try {
    const body = await req.json();
    const { name, phone, email, brochure } = body || {};

    const safeName = String(name || "").trim();
    const safePhone = String(phone || "").trim();
    const safeEmail = String(email || "").trim();
    const safeBrochure = String(brochure || "").trim();

    if (!safeName || !safePhone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 },
      );
    }

    // Email is required now (since you added it in UI)
    if (!safeEmail) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    // Basic validation (same spirit as UI)
    const phoneOk = /^[0-9+()\-\s]{7,}$/.test(safePhone);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(safeEmail);

    if (!phoneOk) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
        { status: 400 },
      );
    }

    if (!emailOk) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    console.log("✅ Brochure lead received:", {
      name: safeName,
      phone: safePhone,
      email: safeEmail,
      brochure: safeBrochure,
    });

    let leadId: string | undefined;
    try {
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "website",
        status: "new",
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        message: `Brochure download requested${safeBrochure ? `: ${safeBrochure}` : ""}.`,
        page: req.headers.get("referer") || "/",
        referrer: req.headers.get("referer") || undefined,
        consent: true,
        tags: ["brochure-download"],
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: safeName,
        to: "XIPHIAS",
        body: `Requested brochure download${safeBrochure ? `: ${safeBrochure}` : ""}.`,
      });
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: lead.id,
          path: req.headers.get("referer") || "/",
          referrer: req.headers.get("referer") || undefined,
          label: "brochure-download",
          href: safeBrochure || undefined,
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          query: safeBrochure || undefined,
          interests: ["brochure", safeBrochure].filter(Boolean),
          metadata: { leadId: lead.id, brochure: safeBrochure },
        },
        req.headers,
      );
    } catch (leadError) {
      console.error("[brochure-lead] X-Hub lead capture failed:", leadError);
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

    // ===== ADMIN EMAIL TEMPLATE =====
    const adminHtml = `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:#004fa3;color:#fff;text-align:center;padding:20px;">
          <h2 style="margin:0;font-size:20px;">📄 New Brochure Download Lead</h2>
        </div>
        <div style="padding:24px;color:#333;line-height:1.7;">
          <p>Dear Admin,</p>
          <p>You’ve received a new lead from a brochure download request on the XIPHIAS website.</p>

          <table style="width:100%;border-collapse:collapse;margin-top:15px;">
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                safeName,
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td>
              <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
                safePhone,
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td>
              <td style="padding:8px;border-bottom:1px solid #eee;">
                <a href="mailto:${encodeURIComponent(
                  safeEmail,
                )}" style="color:#004fa3;text-decoration:none;">${escapeHtml(
                  safeEmail,
                )}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px;"><strong>Brochure</strong></td>
              <td style="padding:8px;">
                ${
                  safeBrochure
                    ? `<a href="${escapeAttr(
                        safeBrochure,
                      )}" style="color:#004fa3;text-decoration:none;">${escapeHtml(
                        safeBrochure,
                      )}</a>`
                    : "-"
                }
              </td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
          <p style="font-size:13px;color:#777;text-align:center;">This email was generated automatically by the brochure lead form.</p>
        </div>
      </div>
    `;

    const adminMail = {
      from: `"XIPHIAS Website" <${process.env.SMTP_USER}>`,
      to: "immigration@xiphias.in",
      subject: "📄 New Brochure Download Lead",
      html: adminHtml,
    };

    await transporter.sendMail(adminMail);
    console.log("✅ Brochure lead email sent to admin");

    return NextResponse.json({ ok: true, message: "Lead received successfully", leadId });
  } catch (err: any) {
    console.error("❌ Error in /api/brochure-lead:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

/** Prevent HTML injection in email template */
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Escape attribute values (href etc.) */
function escapeAttr(input: string) {
  // keep it simple: reuse escapeHtml and also strip newlines
  return escapeHtml(input).replace(/[\r\n]/g, "");
}
