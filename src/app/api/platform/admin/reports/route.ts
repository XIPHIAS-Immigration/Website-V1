import { NextResponse, type NextRequest } from "next/server";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { sendPlatformEmail, getPlatformRecipient } from "@/lib/platform/email";
import { generatePremiumReportPdf } from "@/lib/platform/premium-report";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resolveTrack(value: unknown): Track {
  return isTrack(value) ? value : "residency";
}

function answerMap(body: Payload) {
  const country = normalizeText(body.country, 80);
  const program = normalizeText(body.program, 140);
  const budget = normalizeText(body.budgetUsd, 40);
  const timeline = normalizeText(body.timelineMonths, 40);
  const goals = normalizeText(body.goals, 1000);
  const family = normalizeText(body.familyMembers, 300);
  const sourceOfFunds = normalizeText(body.sourceOfFunds, 800);
  const profile = normalizeText(body.profile, 180);
  const currentCountry = normalizeText(body.currentCountry, 100);

  return {
    country,
    targetCountry: country,
    program,
    budget,
    budgetUsd: budget,
    timeline,
    timelineMonths: timeline,
    family,
    familyMembers: family,
    sourceOfFunds,
    goals,
    profile,
    currentCountry,
    manuallyPrepared: true,
  };
}

function reportEmailHtml(args: {
  name: string;
  track: Track;
  country: string;
  program: string;
  paymentReference: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
      <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,.14);">
        <div style="background:#071a3a;color:#fff;padding:28px;">
          <div style="font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#f6d86d;">XIPHIAS Immigration</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.18;color:#fff;">Your detailed personal mobility report is ready</h1>
          <p style="margin:12px 0 0;color:#dbe7f3;font-size:15px;line-height:1.7;">Prepared after registration payment confirmation by the XIPHIAS advisory desk.</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hi <strong>${escapeHtml(args.name)}</strong>,</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">Please find attached your detailed personal report for the <strong>${escapeHtml(args.track)}</strong> pathway.</p>
          <table style="width:100%;border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f3;border-radius:14px;overflow:hidden;">
            <tr><td style="padding:10px;font-weight:800;">Country focus</td><td style="padding:10px;">${escapeHtml(args.country || "Advisor shortlist")}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Programme</td><td style="padding:10px;">${escapeHtml(args.program || "Detailed advisor report")}</td></tr>
            <tr><td style="padding:10px;font-weight:800;">Payment reference</td><td style="padding:10px;">${escapeHtml(args.paymentReference)}</td></tr>
          </table>
          <p style="margin:20px 0 0;color:#536277;font-size:13px;line-height:1.7;">This report is an advisor-prepared planning document. Final eligibility, documentation, fees, and timelines must be verified by the XIPHIAS team before filing or investment action.</p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "staff") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Payload;

  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const track = resolveTrack(body.track);
  const country = normalizeText(body.country, 80);
  const program = normalizeText(body.program, 140);
  const paymentReference = normalizeText(body.paymentReference, 160) || `manual_${Date.now()}`;
  const mode = normalizeText(body.mode, 20) || "download";

  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "Client name and email are required." }, { status: 400 });
  }

  const answers = answerMap(body);
  const pdfBytes = await generatePremiumReportPdf({
    name,
    email,
    phone,
    track,
    country,
    program,
    route: program,
    reportRef: paymentReference,
    objective: answers.goals || `${country || "Target country"} ${track} planning`,
    profile: answers.profile || answers.goals || "Advisor-reviewed client profile",
    currentCountry: answers.currentCountry,
    family: answers.family,
    timeline: answers.timeline ? `${answers.timeline} months planning window` : undefined,
    budget: answers.budget ? `USD ${answers.budget} planning budget` : undefined,
    sourceOfFunds: answers.sourceOfFunds,
    scores: {
      routeFit: Number(body.routeFitScore) || Number(body.score) || 82,
      evidenceStrength: Number(body.evidenceStrength) || 68,
      documentReadiness: Number(body.documentReadiness) || 56,
      riskClarity: Number(body.riskClarity) || 72,
      familyReadiness: answers.family ? 70 : 58,
    },
  });
  const pdf = Buffer.from(pdfBytes);
  const filename = `XIPHIAS_Detailed_Report_${track}_${Date.now()}.pdf`;

  const repo = getPlatformRepository();
  repo.createConversation({
    channel: "portal",
    direction: "internal",
    from: user.email,
    to: "XIPHIAS",
    body: `Manual detailed report generated for ${name} (${email}). Payment ref: ${paymentReference}.`,
  });
  repo.audit("registration.provisioned", "manual_report", paymentReference, user.id, {
    email,
    track,
    country,
    program,
    mode,
  });

  if (mode === "email") {
    const clientEmail = await sendPlatformEmail({
      to: email,
      subject: "Your detailed XIPHIAS personal report",
      label: "XIPHIAS Immigration",
      html: reportEmailHtml({ name, track, country, program, paymentReference }),
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });

    const staffEmail = await sendPlatformEmail({
      to: getPlatformRecipient("general"),
      subject: `Detailed report sent: ${name}`,
      label: "XIPHIAS Platform",
      html: `<p>Detailed report sent for <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}). Ref: ${escapeHtml(paymentReference)}</p>`,
    });

    return NextResponse.json({ ok: true, clientEmail, staffEmail, filename });
  }

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
