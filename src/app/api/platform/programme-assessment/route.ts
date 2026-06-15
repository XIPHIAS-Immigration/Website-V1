import { NextResponse, type NextRequest } from "next/server";

import { isTrack } from "@/lib/eligibility/types";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssessmentTopMatch = {
  title?: unknown;
  country?: unknown;
  track?: unknown;
  href?: unknown;
  score?: unknown;
  reasons?: unknown;
  warnings?: unknown;
};

type AssessmentInput = {
  mode?: unknown;
  track?: unknown;
  destination?: unknown;
  budget?: unknown;
  timeline?: unknown;
  family?: unknown;
  presence?: unknown;
  profile?: unknown;
  priority?: unknown;
  query?: unknown;
  age?: unknown;
  nationality?: unknown;
  currentResidence?: unknown;
  education?: unknown;
  yearsExperience?: unknown;
  languageScore?: unknown;
  netWorthUsd?: unknown;
  sourceOfFunds?: unknown;
  familyMembers?: unknown;
  previousRefusal?: unknown;
  admissibilityConcern?: unknown;
  businessOwnership?: unknown;
  jobOffer?: unknown;
  resumeFileName?: unknown;
  profileSummary?: unknown;
};

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolValue(value: unknown) {
  return value === true || value === "true" || value === "1" || value === "on";
}

function listFrom(value: unknown, max = 4) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item, 180)).filter(Boolean).slice(0, max);
}

function sanitizeTopMatches(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).map((item: AssessmentTopMatch) => ({
    title: normalizeText(item.title, 160),
    country: normalizeText(item.country, 80),
    track: normalizeText(item.track, 40),
    href: normalizeText(item.href, 240),
    score: numberValue(item.score),
    reasons: listFrom(item.reasons, 3),
    warnings: listFrom(item.warnings, 2),
  }));
}

function sanitizeInput(value: unknown) {
  const input = (value && typeof value === "object" ? value : {}) as AssessmentInput;
  return {
    mode: normalizeText(input.mode, 20) === "deep" ? "deep" : "quick",
    track: normalizeText(input.track, 40),
    destination: normalizeText(input.destination, 80),
    budget: numberValue(input.budget),
    timeline: numberValue(input.timeline),
    family: boolValue(input.family),
    presence: normalizeText(input.presence, 40),
    profile: normalizeText(input.profile, 60),
    priority: normalizeText(input.priority, 60),
    query: normalizeText(input.query, 360),
    age: numberValue(input.age),
    nationality: normalizeText(input.nationality, 80),
    currentResidence: normalizeText(input.currentResidence, 80),
    education: normalizeText(input.education, 60),
    yearsExperience: numberValue(input.yearsExperience),
    languageScore: numberValue(input.languageScore),
    netWorthUsd: numberValue(input.netWorthUsd),
    sourceOfFunds: normalizeText(input.sourceOfFunds, 80),
    familyMembers: numberValue(input.familyMembers, 1),
    previousRefusal: boolValue(input.previousRefusal),
    admissibilityConcern: boolValue(input.admissibilityConcern),
    businessOwnership: boolValue(input.businessOwnership),
    jobOffer: boolValue(input.jobOffer),
    resumeFileName: normalizeText(input.resumeFileName, 180),
    profileSummary: normalizeText(input.profileSummary, 700),
  };
}

function assessmentMessage({
  input,
  topMatches,
  completion,
}: {
  input: ReturnType<typeof sanitizeInput>;
  topMatches: ReturnType<typeof sanitizeTopMatches>;
  completion: number;
}) {
  const best = topMatches[0];
  const lines = [
    "Programme AI assessment captured.",
    `Mode: ${input.mode === "deep" ? "Deep Assessment" : "Quick Explorer"}`,
    `Route focus: ${[input.track, input.destination].filter(Boolean).join(" / ") || "Open"}`,
    `Profile: ${input.profile || "Not specified"} | Priority: ${input.priority || "Not specified"}`,
    `Budget: USD ${input.budget || 0} | Timeline: ${input.timeline || 0} months | Family: ${input.familyMembers || (input.family ? 2 : 1)}`,
    best ? `Best match: ${best.title} (${best.country}) - ${best.score}/100` : "Best match: not available",
  ];

  if (input.mode === "deep") {
    lines.push(
      `Deep profile: ${completion}% complete | Age: ${input.age || "n/a"} | Education: ${input.education || "n/a"} | Experience: ${input.yearsExperience || 0} years`,
      `Funds: net worth USD ${input.netWorthUsd || 0}; source ${input.sourceOfFunds || "not specified"}`,
      `Risk flags: refusal ${input.previousRefusal ? "yes" : "no"}, admissibility ${input.admissibilityConcern ? "yes" : "no"}`,
    );
    if (input.resumeFileName) lines.push(`CV/reference file named by user: ${input.resumeFileName}`);
  }

  if (input.query) lines.push(`User request: ${input.query}`);
  if (input.profileSummary) lines.push(`Profile notes: ${input.profileSummary}`);

  return lines.join("\n").slice(0, 2400);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const input = sanitizeInput(body.input);
  const topMatches = sanitizeTopMatches(body.topMatches);
  const completion = Math.max(0, Math.min(100, numberValue(body.completion)));
  const eventMode = normalizeText(body.event, 20) === "lead" ? "lead" : "activity";
  const contact = body.contact && typeof body.contact === "object" ? body.contact : {};
  const name = normalizeText((contact as { name?: unknown }).name, 120);
  const email = normalizeEmail((contact as { email?: unknown }).email);
  const phone = normalizePhone((contact as { phone?: unknown }).phone);
  const hasContact = Boolean(name || email || phone);
  const best = topMatches[0];
  const track = isTrack(input.track) ? input.track : best && isTrack(best.track) ? best.track : undefined;
  const message = assessmentMessage({ input, topMatches, completion });
  const interests = [
    "programme ai",
    "assessment",
    input.mode === "deep" ? "deep assessment" : "quick explorer",
    input.track,
    input.destination,
    input.profile,
    input.priority,
    best?.country,
    best?.title,
  ].filter(Boolean) as string[];

  const event = await captureVisitorEvent(
    {
      type: "programme_assessment",
      visitorId: normalizeText(body.visitorId, 100) || undefined,
      sessionId: normalizeText(body.sessionId, 100) || undefined,
      path: normalizeText(body.path, 260) || "/programme-explorer",
      title: "Programme AI assessment",
      referrer: normalizeText(body.referrer, 500) || request.headers.get("referer") || undefined,
      label: eventMode === "lead" ? "Programme AI lead" : `Programme AI ${input.mode}`,
      query: input.query || `${input.profile} ${input.destination}`.trim(),
      interests,
      name,
      email,
      phone,
      metadata: {
        mode: input.mode,
        completion,
        input,
        topMatches,
        bestMatch: best,
        contactProvided: hasContact,
      },
    },
    request.headers,
  );

  let lead = null;
  if (eventMode === "lead" && hasContact) {
    const repo = getPlatformRepository();
    lead = repo.createLead({
      source: "programme_ai",
      name: name || email || phone || "Programme AI visitor",
      email: email || undefined,
      phone: phone || undefined,
      track,
      country: input.destination || best?.country || undefined,
      program: best?.title || undefined,
      message,
      page: "/programme-explorer",
      referrer: normalizeText(body.referrer, 240) || request.headers.get("referer") || undefined,
      consent: parseBoolean((contact as { consent?: unknown }).consent),
      score: best?.score || undefined,
      tags: interests.map((item) => normalizeText(item, 40)).filter(Boolean).slice(0, 10),
    });

    repo.createConversation({
      leadId: lead.id,
      channel: "portal",
      direction: "inbound",
      from: lead.name,
      to: "XIPHIAS advisor",
      body: message,
    });
  }

  return NextResponse.json({
    ok: true,
    eventId: event.id,
    leadId: lead?.id ?? null,
  });
}
