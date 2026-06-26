import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/utils/validate";
import nodemailer from "nodemailer";
import { getEligibilityAdvisory } from "@/lib/platform/eligibility-advisor";
import { getPlatformRepository } from "@/lib/platform/repository";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";
import type { Track } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TRACKS = new Set(["residency", "citizenship", "corporate", "skilled"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const MAX_JSON_KB = 64;
const DEFAULT_SITE_URL = "https://www.xiphiasimmigration.com";
const DEFAULT_REPORT_PRICE_INR = "10000";

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

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function absoluteUrl(pathOrUrl: string, siteUrl = getSiteUrl()) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function formatInr(value: string) {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return `INR ${value}`;
  return `INR ${numeric.toLocaleString("en-IN")}`;
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
      await captureVisitorEvent(
        {
          type: "lead_capture",
          visitorId: sanitizeStr(body.visitorId, 100) || lead.id,
          sessionId: sanitizeStr(body.sessionId, 100) || undefined,
          path: req.headers.get("referer") || "/eligibility",
          referrer: req.headers.get("referer") || undefined,
          label: "eligibility-submit",
          name,
          email,
          phone,
          query: result.summary,
          interests: [track, result.countryFocus, result.programs[0]?.name].filter(Boolean),
          metadata: {
            leadId: lead.id,
            tier: result.tier,
            confidence: result.confidence,
            handoffRequired: result.handoffRequired,
          },
        },
        req.headers,
      );
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
      const siteUrl = getSiteUrl();
      const reportPaymentUrl = absoluteUrl(
        process.env.ASSESSMENT_REPORT_PAYMENT_URL ||
          process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PAYMENT_URL ||
          TOPMATE_REGISTRATION_URL,
        siteUrl
      );
      const reportPrice = formatInr(
        process.env.ASSESSMENT_REPORT_PRICE_INR ||
          process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PRICE_INR ||
          DEFAULT_REPORT_PRICE_INR
      );
      const logoUrl = `${siteUrl}/images/logo/xiphias-immigration.png`;
      const contactUrl = `${siteUrl}/contact`;
      const portalUrl = `${siteUrl}/x-hub/sign-in`;

      const programsHtml =
        result.programs?.slice(0, 3).map((program, index) => {
          const score =
            typeof program.score === "number"
              ? `<span style="float:right;background:#eefbf4;color:#047857;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:800;">${program.score}</span>`
              : "";
          return `
            <div style="border:1px solid #dbe7f3;border-radius:14px;padding:14px;margin-top:10px;background:#f8fbff;">
              ${score}
              <div style="font-size:12px;color:#0b4ea2;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">Option ${index + 1}</div>
              <div style="font-size:16px;color:#071a3a;font-weight:800;margin-top:4px;">${escapeHtml(program.name)}</div>
              <div style="font-size:13px;color:#536277;margin-top:2px;">${escapeHtml(program.country || "Global mobility route")}</div>
              <div style="font-size:13px;color:#34435a;line-height:1.6;margin-top:8px;">${escapeHtml(program.why || "Matched against your profile inputs and XIPHIAS route criteria.")}</div>
            </div>
          `;
        }).join("") ||
        `<div style="border:1px solid #dbe7f3;border-radius:14px;padding:14px;margin-top:10px;background:#f8fbff;color:#34435a;">Advisor review is recommended before a route is shortlisted.</div>`;

      const criteriaHtml =
        result.criteria?.slice(0, 4).map(
          (item) => `
            <li style="margin:8px 0;color:#34435a;">
              <span style="color:#d8b650;font-weight:900;">&#10003;</span>
              ${escapeHtml(item)}
            </li>`
        ).join("") ||
        `<li style="margin:8px 0;color:#34435a;"><span style="color:#d8b650;font-weight:900;">&#10003;</span> Profile, goal, timeline, budget, and family factors.</li>`;

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
            <p><strong>Trailer email:</strong> Sent to client with ${reportPrice} detailed report CTA.</p>
            <h3 style="margin-top:24px;margin-bottom:8px;font-size:18px;">Answers</h3>
            <table style="width:100%;border-collapse:collapse;">
              ${answersHtml}
            </table>
          </div>
        </div>
      `;

      const userHtml = `
        <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
          <div style="max-width:720px;margin:auto;background:#ffffff;border:1px solid #dbe7f3;border-radius:20px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,0.14);">
            <div style="background:#071a3a;color:#fff;padding:28px 28px 24px;position:relative;">
              <img src="${logoUrl}" alt="XIPHIAS Immigration" width="148" style="display:block;background:#fff;border-radius:10px;padding:8px;margin-bottom:22px;" />
              <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#f6d86d;">Assessment trailer</div>
              <h1 style="margin:8px 0 0;font-size:28px;line-height:1.18;color:#fff;">Your XIPHIAS route preview is ready</h1>
              <p style="margin:12px 0 0;color:#dbe7f3;font-size:15px;line-height:1.7;">This is a concise first look. The complete 20-30 page personal report is prepared after registration and advisor review.</p>
            </div>

            <div style="padding:28px;">
              <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hi <strong>${safeName}</strong>,</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">Thank you for completing the <strong>${safeTrack}</strong> assessment with <strong>XIPHIAS Immigration</strong>. We matched your answers against approved XIPHIAS program content and route-fit rules.</p>

              <div style="border:1px solid #d8b650;border-radius:16px;background:#fffaf0;padding:18px;margin:20px 0;">
                <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a6a00;">Your preview result</div>
                <div style="font-size:22px;font-weight:900;color:#071a3a;margin-top:5px;">${safeTier}</div>
                <div style="font-size:14px;line-height:1.7;color:#34435a;margin-top:8px;">${safeSummary}</div>
              </div>

              <h2 style="font-size:18px;margin:22px 0 8px;color:#071a3a;">Recommended directions</h2>
              ${programsHtml}

              <h2 style="font-size:18px;margin:24px 0 8px;color:#071a3a;">What this preview checked</h2>
              <ul style="padding-left:0;list-style:none;margin:0;">
                ${criteriaHtml}
              </ul>

              <div style="margin:28px 0 0;border-radius:18px;background:#071a3a;padding:22px;color:#fff;">
                <div style="font-size:12px;color:#f6d86d;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">Next step</div>
                <h2 style="margin:8px 0 8px;font-size:22px;color:#fff;">Unlock your detailed personal report</h2>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#dbe7f3;">Registration starts at <strong style="color:#fff;">${reportPrice}</strong>. The full report includes route comparison, country/product fit, document checklist, risk flags, timeline, advisor notes, and X-Hub onboarding. Payment is completed through the dedicated Topmate registration flow.</p>
                <a href="${reportPaymentUrl}" style="display:inline-block;background:#d8b650;color:#071a3a;text-decoration:none;font-weight:900;border-radius:12px;padding:13px 18px;">Register for detailed report</a>
                <a href="${contactUrl}" style="display:inline-block;margin-left:10px;color:#fff;text-decoration:none;font-weight:800;border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:12px 16px;">Speak to an advisor</a>
              </div>

              <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#607086;">After registration, your case can be organized in <a href="${portalUrl}" style="color:#0b4ea2;text-decoration:none;font-weight:800;">X-Hub</a> for documents, milestones, messages, and report workflow.</p>
            </div>
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
        subject: `Your XIPHIAS ${track} assessment preview`,
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
