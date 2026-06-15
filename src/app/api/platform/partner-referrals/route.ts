import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRecipient, keyValueHtml, sendPlatformEmail } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!["admin", "staff", "partner"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const referrals = getPlatformRepository()
    .listPartnerReferrals()
    .filter((item) => user.role !== "partner" || item.partnerId === user.partnerId);
  return NextResponse.json({ ok: true, referrals });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  const body = await req.json().catch(() => ({}));
  const partnerName = normalizeText(body.partnerName, 120) || user?.name || "";
  const contactEmail = normalizeEmail(body.contactEmail) || user?.email || "";
  const clientName = normalizeText(body.clientName, 120);

  if (!partnerName || !contactEmail || !clientName) {
    return NextResponse.json(
      { ok: false, error: "Partner name, contact email, and client name are required." },
      { status: 400 },
    );
  }

  const repo = getPlatformRepository();
  const referral = repo.createPartnerReferral({
    partnerId: user?.partnerId,
    partnerName,
    companyName: normalizeText(body.companyName, 160) || undefined,
    contactEmail,
    contactPhone: normalizePhone(body.contactPhone) || undefined,
    clientName,
    clientEmail: normalizeEmail(body.clientEmail) || undefined,
    clientPhone: normalizePhone(body.clientPhone) || undefined,
    targetCountry: normalizeText(body.targetCountry, 80) || undefined,
    targetProgram: normalizeText(body.targetProgram, 120) || undefined,
    notes: normalizeText(body.notes, 1600) || undefined,
  });
  const lead = repo.createLead({
    source: "partner",
    status: "new",
    name: referral.clientName,
    email: referral.clientEmail || undefined,
    phone: referral.clientPhone || undefined,
    country: referral.targetCountry || undefined,
    program: referral.targetProgram || undefined,
    message: `Partner referral from ${referral.partnerName}${referral.notes ? `: ${referral.notes}` : ""}`,
    page: "/x-hub/partners",
    referrer: req.headers.get("referer") || undefined,
    consent: true,
    tags: ["partner-referral", referral.companyName].filter((tag): tag is string => Boolean(tag)),
  });
  repo.createConversation({
    leadId: lead.id,
    channel: "portal",
    direction: "inbound",
    from: referral.partnerName,
    to: "XIPHIAS",
    body: `Partner referral for ${referral.clientName}${referral.targetCountry ? ` - ${referral.targetCountry}` : ""}.`,
  });
  await captureVisitorEvent(
    {
      type: "lead_capture",
      visitorId: lead.id,
      path: "/x-hub/partners",
      referrer: req.headers.get("referer") || undefined,
      label: "partner-referral",
      name: referral.clientName,
      email: referral.clientEmail,
      phone: referral.clientPhone,
      query: referral.notes,
      interests: [referral.targetCountry, referral.targetProgram, "partner referral"].filter(Boolean),
      metadata: { leadId: lead.id, referralId: referral.id, partnerId: referral.partnerId },
    },
    req.headers,
  );

  const adminEmail = await sendPlatformEmail({
    label: "XIPHIAS Partner Portal",
    to: getPlatformRecipient("partner"),
    replyTo: referral.contactEmail,
    subject: `New partner referral: ${referral.clientName}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;margin:auto;">
        <h2>New partner referral</h2>
        ${keyValueHtml([
          ["Partner", referral.partnerName],
          ["Company", referral.companyName],
          ["Partner email", referral.contactEmail],
          ["Partner phone", referral.contactPhone],
          ["Client", referral.clientName],
          ["Client email", referral.clientEmail],
          ["Client phone", referral.clientPhone],
          ["Target country", referral.targetCountry],
          ["Target program", referral.targetProgram],
          ["Notes", referral.notes],
          ["Referral ID", referral.id],
        ])}
      </div>
    `,
  });

  const acknowledgement = await sendPlatformEmail({
    label: "XIPHIAS Partnerships",
    to: referral.contactEmail,
    subject: "We received your XIPHIAS partner referral",
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:680px;margin:auto;">
        <h2>Referral received</h2>
        <p>Dear ${referral.partnerName},</p>
        <p>We received your referral for <strong>${referral.clientName}</strong>. The XIPHIAS partnerships desk will review fit, timelines, and next steps.</p>
        <p><strong>Referral ID:</strong> ${referral.id}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, referral, lead, email: { admin: adminEmail, acknowledgement } });
}
