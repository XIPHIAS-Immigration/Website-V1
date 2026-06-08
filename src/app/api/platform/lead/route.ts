import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { sendLeadAlert } from "@/lib/platform/whatsapp";
import type { LeadSource } from "@/lib/platform/types";
import { isTrack } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCES = new Set<LeadSource>(["website", "chat", "whatsapp", "eligibility", "registration", "partner", "b2g"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const source = SOURCES.has(body.source) ? (body.source as LeadSource) : "website";
  const track = isTrack(body.track) ? body.track : undefined;

  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { ok: false, error: "Name and at least one contact channel are required." },
      { status: 400 },
    );
  }

  const repo = getPlatformRepository();
  const lead = repo.createLead({
    source,
    name,
    email: email || undefined,
    phone: phone || undefined,
    track,
    country: normalizeText(body.country, 80) || undefined,
    program: normalizeText(body.program, 120) || undefined,
    message: normalizeText(body.message, 1200) || undefined,
    page: normalizeText(body.page, 240) || req.headers.get("referer") || undefined,
    referrer: normalizeText(body.referrer, 240) || req.headers.get("referer") || undefined,
    consent: parseBoolean(body.consent),
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag: unknown) => normalizeText(tag, 40)).filter(Boolean).slice(0, 8)
      : [],
  });

  if (lead.message) {
    repo.createConversation({
      leadId: lead.id,
      channel: source === "chat" ? "website-chat" : "portal",
      direction: "inbound",
      from: lead.name,
      to: "XIPHIAS",
      body: lead.message,
    });
  }

  const whatsapp = await sendLeadAlert(lead);

  return NextResponse.json({
    ok: true,
    lead,
    notifications: { whatsapp },
  });
}
