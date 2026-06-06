import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/utils/validate";
import nodemailer from "nodemailer";
import { getEligibilityAdvisory } from "@/lib/platform/eligibility-advisor";
import { getPlatformRepository } from "@/lib/platform/repository";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import type { Track } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TRACKS = new Set(["residency", "citizenship", "corporate", "skilled"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const MAX_JSON_KB = 64;

const rlBucket: Map<string, number[]> =
  (global as any).__eligibilityRL__ ?? new Map<string, number[]>();
(global as any).__eligibilityRL__ = rlBucket;

function getClientIP(req: NextRequest) {
  const hdr =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip");
  if (hdr) return hdr.split(",")[0].trim();
  // @ts-ignore next dev
  return (req as any).ip || "0.0.0.0";
}

function normalizePhone(raw?: string) {
  if (!raw) return "";
  const only = raw.replace(/[^\d+]/g, "");
  return only.startsWith("+") ? only : only ? `+${only}` : "";
}

function sanitizeStr(v: unknown, max = 400) {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}

function escapeHtml(str: unknown): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeAnswers(input: unknown) {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof k !== "string") continue;
    const key = k.replace(/[^\w.-]/g, "").slice(0, 64);
    if (!key) continue;

    if (typeof v === "string") out[key] = v.slice(0, 1000);
    else if (typeof v === "number" || typeof v === "boolean" || v === null) out[key] = v;
    else out[key] = String(v).slice(0, 200);
  }
  return out;
}

function rateLimitHit(ip: string) {
  const now = Date.now();
  const arr = rlBucket.get(ip) ?? [];
  const fresh = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  rlBucket.set(ip, fresh);
  return fresh.length > RATE_LIMIT_MAX;
}

function tooBig(req: NextRequest) {
  const len = req.headers.get("content-length");
  if (!len) return false;
  return Number(len) > MAX_JSON_KB * 1024;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (tooBig(req)) {
      return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 413 });
    }

    const ctype = req.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Unsupported content type" }, { status: 415 });
    }

    const ip = getClientIP(req);
    if (rateLimitHit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many submissions. Please try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();

    const { ok, error } = validateSubmission(body);
    if (!ok) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const name = sanitizeStr(body.name, 120);
    const email = sanitizeStr(body.email, 160).toLowerCase();
    const phone = normalizePhone(sanitizeStr(body.phone, 40));
    const track = String(body.track || "");
    const answers = safeAnswers(body.answers);
    const honeypot = sanitizeStr(body.honeypot || body.website || "");

    if (!name || name.length < 2) {
      return NextResponse.json({ ok: false, error: "Please provide your full name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
    }
    if (phone && !PHONE_RE.test(phone)) {
      return NextResponse.json({ ok: false, error: "Please provide a valid phone number." }, { status: 400 });
    }
    if (!ALLOWED_TRACKS.has(track)) {
      return NextResponse.json({ ok: false, error: "Invalid track." }, { status: 400 });
    }
    if (honeypot) {
      return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    const payload = {
      name,
      email,
      phone,
      track,
      answers,
      meta: {
        ip,
        ua: req.headers.get("user-agent") || "",
        referer: req.headers.get("referer") || "",
        ts: new Date().toISOString(),
      },
    };

    const result = getEligibilityAdvisory(track as Track, answers);
    let leadId: string | undefined;
    let whatsappStatus: "sent" | "skipped" | "failed" = "skipped";

    try {
      const repo = getPlatformRepository();
      const lead = repo.createLead({
        source: "eligibility",
        name,
        email,
        phone: phone || undefined,
        track: track as Track,
        country: result.countryFocus,
        program: result.programs[0]?.name,
        message: `${result.tier}: ${result.summary}`,
        page: req.headers.get("referer") || "/eligibility",
        referrer: req.headers.get("referer") || undefined,
        consent: true,
        score: result.confidence,
        tags: [
          "eligibility",
          result.handoffRequired ? "staff-review" : "auto-triaged",
          result.countryFocus ? `country:${result.countryFocus}` : "",
        ].filter(Boolean),
      });
      leadId = lead.id;
      repo.createConversation({
        leadId: lead.id,
        channel: "portal",
        direction: "inbound",
        from: name,
        to: "XIPHIAS",
        body: `Eligibility ${track}: ${result.summary}`,
      });
      const whatsapp = await sendLeadAlert(lead);
      whatsappStatus =
        whatsapp.status === "sent" ? "sent" : whatsapp.status === "failed" ? "failed" : "skipped";
    } catch (leadErr) {
      console.error("[eligibility:submit] Lead pipeline error:", leadErr);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone || "N/A");
      const safeTrack = escapeHtml(track);
      const safeTier = escapeHtml(result.tier);
      const safeSummary = escapeHtml(result.summary);
      const mailto = `mailto:${encodeURIComponent(email)}`;

      const answersHtml = Object.entries(answers)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px;border-bottom:1px solid #eee;"><strong>${escapeHtml(
              k
            )}</strong></td><td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(
              String(v)
            )}</td></tr>`
        )
        .join("");

      const adminHtml = `
        <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="background:#004fa3;color:#fff;text-align:center;padding:20px;">
            <h2 style="margin:0;font-size:20px;">New Eligibility Submission</h2>
          </div>
          <div style="padding:24px;color:#333;line-height:1.7;">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="${mailto}" style="color:#004fa3;text-decoration:none;">${safeEmail}</a></p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Track:</strong> ${safeTrack}</p>
            <p><strong>Tier:</strong> ${safeTier}</p>
            <p><strong>Summary:</strong> ${safeSummary}</p>
            <h3 style="margin-top:24px;margin-bottom:8px;font-size:18px;">Answers</h3>
            <table style="width:100%;border-collapse:collapse;">
              ${answersHtml}
            </table>
          </div>
        </div>
      `;

      const userHtml = `
        <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(90deg,#002961,#004fa3);color:#fff;text-align:center;padding:20px;">
            <h2 style="margin:0;font-size:20px;">Your Eligibility Assessment</h2>
          </div>
          <div style="padding:24px;color:#333;line-height:1.7;">
            <p>Hi <strong>${safeName}</strong>,</p>
            <p>Thank you for completing the ${safeTrack} eligibility assessment with <strong>XIPHIAS Immigration</strong>.</p>
            <p>Your result: <strong>${safeTier}</strong> - ${safeSummary}</p>
            <p>Our advisors will review your details and contact you soon.</p>
            <p>If you'd like to speak to an expert right away, please <a href="https://www.xiphiasimmigration.com/contact" style="color:#004fa3;text-decoration:none;">book a free consultation</a>.</p>
          </div>
        </div>
      `;

      const adminMail = {
        from: `"XIPHIAS Eligibility" <${process.env.SMTP_USER}>`,
        to: process.env.ELIGIBILITY_EMAIL_TO || process.env.EMAIL_TO || "immigration@xiphias.in",
        subject: "New Eligibility Lead",
        html: adminHtml,
      };
      const userMail = {
        from: `"XIPHIAS Immigration" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your ${track} eligibility results from XIPHIAS Immigration`,
        html: userHtml,
      };

      await Promise.all([transporter.sendMail(adminMail), transporter.sendMail(userMail)]);
    } catch (mailErr) {
      console.error("[eligibility:submit] Email error:", mailErr);
    }

    const redact = (e: string) => e.replace(/(.).+(@.+)/, (_m, a, b) => a + "***" + b);
    console.log("[eligibility:submit]", {
      ...payload,
      email: redact(email),
      meta: { ...payload.meta, ip: ip.replace(/\d+$/g, "x") },
    });

    return NextResponse.json(
      { ok: true, result, leadId, notifications: { whatsapp: whatsappStatus } },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e: any) {
    console.error("[eligibility:submit:error]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Invalid request" },
      { status: 400, headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } }
    );
  }
}
