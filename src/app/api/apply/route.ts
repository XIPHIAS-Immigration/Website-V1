// src/app/api/apply/route.ts
export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function isValidLinkedInUrl(value: string) {
  const v = value.trim();
  if (!v) return false;

  let url: URL;
  try {
    url = new URL(v.startsWith("http") ? v : `https://${v}`);
  } catch {
    return false;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "linkedin.com") return false;

  const path = url.pathname.toLowerCase();
  return (
    path.startsWith("/in/") ||
    path.startsWith("/company/") ||
    path.startsWith("/pub/") ||
    path.startsWith("/profile/")
  );
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();

    // ✅ LinkedIn is now REQUIRED
    const linkedinRaw = String(form.get("linkedin") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    // Honeypot (spam)
    const company = String(form.get("company") ?? "").trim();
    if (company) {
      return redirectOrJson(req, { ok: true, spam: true }, "/careers?applied=1#apply");
    }

    const resume = form.get("resume");

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email and phone are required." },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const phoneOk = /^[0-9+()\-\s.]{7,}$/.test(phone);
    if (!phoneOk) {
      return NextResponse.json(
        { error: "Enter a valid phone number (digits, +, -, (), spaces allowed)." },
        { status: 400 }
      );
    }

    if (!linkedinRaw) {
      return NextResponse.json({ error: "LinkedIn is required." }, { status: 400 });
    }

    if (!isValidLinkedInUrl(linkedinRaw)) {
      return NextResponse.json(
        { error: "Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)." },
        { status: 400 }
      );
    }

    // Normalize LinkedIn URL (ensure protocol present)
    const linkedin = linkedinRaw.startsWith("http") ? linkedinRaw : `https://${linkedinRaw}`;

    if (!(resume instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    const okType =
      /pdf|msword|officedocument/.test(resume.type) || /\.(pdf|docx?)$/i.test(resume.name);

    if (!okType) {
      return NextResponse.json({ error: "Use PDF, DOC, or DOCX files only." }, { status: 400 });
    }

    if (resume.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max file size is 5MB." }, { status: 400 });
    }

    let leadId: string | undefined;
    try {
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "website",
        status: "new",
        name,
        email,
        phone,
        program: role || "Career application",
        message: `Career application${role ? ` for ${role}` : ""}. LinkedIn: ${linkedin}${message ? ` Message: ${message}` : ""}`,
        page: req.headers.get("referer") || "/careers",
        referrer: req.headers.get("referer") || undefined,
        consent: true,
        tags: ["career-application", role].filter(Boolean),
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: name,
        to: "XIPHIAS HR",
        body: `Career application${role ? ` for ${role}` : ""}. Resume: ${resume.name}.`,
      });
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: lead.id,
          path: req.headers.get("referer") || "/careers",
          referrer: req.headers.get("referer") || undefined,
          label: "career-application",
          name,
          email,
          phone,
          query: role || message || undefined,
          interests: ["careers", role].filter(Boolean),
          metadata: { leadId: lead.id, role, linkedin, resumeName: resume.name },
        },
        req.headers,
      );
    } catch (leadError) {
      console.error("[apply] X-Hub lead capture failed:", leadError);
    }

    // SMTP config
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      return NextResponse.json({ error: "SMTP env vars are missing." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    // Convert resume to Buffer for nodemailer attachment
    const resumeBuffer = Buffer.from(await resume.arrayBuffer());

    // ✅ Send to BOTH: HR + Immigration
    // Optional override via env:
    // CAREERS_TO=hr@xiphias.in,immigration@xiphias.in
    const recipients = (process.env.CAREERS_TO || "hr@xiphias.in,immigration@xiphias.in")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const from = `"XIPHIAS Careers" <${user}>`;

    const adminHtml = `
      <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #eaeaea;border-radius:12px;overflow:hidden">
        <div style="background:#004fa3;color:#fff;padding:18px 20px">
          <h2 style="margin:0;font-size:18px;">🧑‍💼 New Career Application</h2>
        </div>
        <div style="padding:20px;color:#222;line-height:1.6">
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          ${role ? `<p><strong>Role:</strong> ${escapeHtml(role)}</p>` : ""}
          <p><strong>LinkedIn:</strong> <a href="${escapeAttr(linkedin)}">${escapeHtml(linkedin)}</a></p>
          ${
            message
              ? `<p><strong>Message:</strong><br/>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>`
              : ""
          }
          <p><strong>Resume:</strong> ${escapeHtml(resume.name)} (${Math.round(resume.size / 1024)} KB)</p>
          <hr style="border:none;border-top:1px solid #eee;margin:18px 0" />
          <p style="font-size:12px;color:#666;margin:0">Sent from Careers → Quick Apply form.</p>
        </div>
      </div>
    `;

    // Admin mail (with attachment)
    await transporter.sendMail({
      from,
      to: recipients,
      replyTo: email,
      subject: `Career Application — ${name}${role ? ` (${role})` : ""}`,
      html: adminHtml,
      attachments: [
        {
          filename: resume.name,
          content: resumeBuffer,
          contentType: resume.type || "application/octet-stream",
        },
      ],
    });

    // Applicant acknowledgement (no attachment)
    await transporter.sendMail({
      from,
      to: email,
      subject: "We received your application — XIPHIAS Immigration",
      html: `
        <p>Dear ${escapeHtml(name)},</p>
        <p>Thanks for applying at XIPHIAS Immigration. Our HR team will review your profile and reach out if there’s a match.</p>
        <p>Warm regards,<br/>XIPHIAS HR Team</p>
      `,
    });

    return redirectOrJson(req, { ok: true, leadId }, "/careers?applied=1#apply");
  } catch (err: any) {
    console.error("❌ /api/apply error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

/** Redirect for normal form submits; JSON for fetch/AJAX */
function redirectOrJson(req: NextRequest, json: any, redirectTo: string) {
  const accept = req.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  if (wantsJson) return NextResponse.json(json, { status: 200 });

  const url = new URL(redirectTo, req.url);
  return NextResponse.redirect(url, { status: 303 });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/[\r\n]/g, "");
}
