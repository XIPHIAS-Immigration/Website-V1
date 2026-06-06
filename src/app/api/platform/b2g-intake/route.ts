import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRecipient, keyValueHtml, sendPlatformEmail } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!["admin", "staff", "b2g"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, inquiries: getPlatformRepository().listB2GInquiries() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const organizationName = normalizeText(body.organizationName, 160);
  const contactName = normalizeText(body.contactName, 120);
  const contactEmail = normalizeEmail(body.contactEmail);
  const requirement = normalizeText(body.requirement, 2400);

  if (!organizationName || !contactName || !contactEmail || requirement.length < 20) {
    return NextResponse.json(
      { ok: false, error: "Organization, contact, valid email, and requirement summary are required." },
      { status: 400 },
    );
  }

  const inquiry = getPlatformRepository().createB2GInquiry({
    organizationName,
    contactName,
    contactEmail,
    contactPhone: normalizePhone(body.contactPhone) || undefined,
    requirement,
    region: normalizeText(body.region, 120) || undefined,
    volumeEstimate: normalizeText(body.volumeEstimate, 80) || undefined,
  });

  const adminEmail = await sendPlatformEmail({
    label: "XIPHIAS B2G Portal",
    to: getPlatformRecipient("b2g"),
    replyTo: inquiry.contactEmail,
    subject: `New B2G inquiry: ${inquiry.organizationName}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;margin:auto;">
        <h2>New B2G / institutional inquiry</h2>
        ${keyValueHtml([
          ["Organization", inquiry.organizationName],
          ["Contact", inquiry.contactName],
          ["Email", inquiry.contactEmail],
          ["Phone", inquiry.contactPhone],
          ["Region", inquiry.region],
          ["Volume estimate", inquiry.volumeEstimate],
          ["Requirement", inquiry.requirement],
          ["Inquiry ID", inquiry.id],
        ])}
      </div>
    `,
  });

  const acknowledgement = await sendPlatformEmail({
    label: "XIPHIAS Institutional Desk",
    to: inquiry.contactEmail,
    subject: "We received your XIPHIAS institutional inquiry",
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:680px;margin:auto;">
        <h2>Institutional inquiry received</h2>
        <p>Dear ${inquiry.contactName},</p>
        <p>We received the requirement from <strong>${inquiry.organizationName}</strong>. Our institutional desk will review the scope and respond with next steps.</p>
        <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, inquiry, email: { admin: adminEmail, acknowledgement } });
}
