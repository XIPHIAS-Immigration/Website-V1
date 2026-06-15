import { NextResponse, type NextRequest } from "next/server";

import { isTrack } from "@/lib/eligibility/types";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MatchInput = {
  title?: unknown;
  country?: unknown;
  track?: unknown;
  visaFamily?: unknown;
  href?: unknown;
  score?: unknown;
  tier?: unknown;
  reasons?: unknown;
  warnings?: unknown;
  gaps?: unknown;
  nextEvidence?: unknown;
};

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolValue(value: unknown) {
  return value === true || value === "true" || value === "1" || value === "on";
}

function listFrom(value: unknown, max = 5) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item, 180)).filter(Boolean).slice(0, max);
}

function sanitizeRouteInput(value: unknown) {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    goal: normalizeText(input.goal, 60),
    track: normalizeText(input.track, 40),
    destination: normalizeText(input.destination, 80),
    profile: normalizeText(input.profile, 60),
    budget: numberValue(input.budget),
    timeline: numberValue(input.timeline),
    family: boolValue(input.family),
    presence: normalizeText(input.presence, 40),
    priority: normalizeText(input.priority, 60),
    notes: normalizeText(input.notes, 700),
  };
}

function sanitizeHighSkillInput(value: unknown) {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const evidence = input.evidence && typeof input.evidence === "object" ? (input.evidence as Record<string, unknown>) : {};

  return {
    targetCountry: normalizeText(input.targetCountry, 40),
    goal: normalizeText(input.goal, 60),
    field: normalizeText(input.field, 60),
    role: normalizeText(input.role, 120),
    age: numberValue(input.age),
    education: normalizeText(input.education, 60),
    yearsExperience: numberValue(input.yearsExperience),
    languageScore: numberValue(input.languageScore),
    citationCount: numberValue(input.citationCount),
    publicationCount: numberValue(input.publicationCount),
    patentCount: numberValue(input.patentCount),
    resumeFileName: normalizeText(input.resumeFileName, 180),
    profileSummary: normalizeText(input.profileSummary, 900),
    evidence: Object.fromEntries(
      Object.entries(evidence)
        .slice(0, 24)
        .map(([key, selected]) => [normalizeText(key, 80), boolValue(selected)])
        .filter(([key]) => Boolean(key)),
    ),
  };
}

function sanitizeEngine(value: unknown) {
  const engine = normalizeText(value, 40);
  if (["high-skill", "investment", "documents", "workflow"].includes(engine)) return engine;
  return "route";
}

function sanitizeMatches(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 6).map((item: MatchInput) => ({
    title: normalizeText(item.title, 180),
    country: normalizeText(item.country, 80),
    track: normalizeText(item.track, 50),
    visaFamily: normalizeText(item.visaFamily, 80),
    href: normalizeText(item.href, 240),
    score: numberValue(item.score),
    tier: normalizeText(item.tier, 40),
    reasons: listFrom(item.reasons, 4),
    warnings: listFrom(item.warnings, 3),
    gaps: listFrom(item.gaps, 4),
    nextEvidence: listFrom(item.nextEvidence, 4),
  }));
}

function assessmentMessage({
  engine,
  routeInput,
  highSkillInput,
  routeMatches,
  highSkillMatches,
  completion,
}: {
  engine: string;
  routeInput: ReturnType<typeof sanitizeRouteInput>;
  highSkillInput: ReturnType<typeof sanitizeHighSkillInput>;
  routeMatches: ReturnType<typeof sanitizeMatches>;
  highSkillMatches: ReturnType<typeof sanitizeMatches>;
  completion: number;
}) {
  const activeMatches = engine === "high-skill" ? highSkillMatches : routeMatches;
  const best = activeMatches[0];
  const engineLabel =
    engine === "high-skill"
      ? "High-Skill Visa Evaluator"
      : engine === "investment"
        ? "Investment & Residency Evaluator"
        : engine === "documents"
          ? "Document & Evidence Readiness"
          : engine === "workflow"
            ? "Report + Advisor Workflow"
            : "Best Visa / Route Evaluator";
  const lines = [
    "XIA Intelligence assessment captured.",
    `Engine: ${engineLabel}`,
    best ? `Best match: ${best.title} (${best.country}) - ${best.score}/100` : "Best match: not available",
    `Profile depth: ${completion}%`,
  ];

  if (engine === "high-skill") {
    lines.push(
      `Visa target: ${highSkillInput.targetCountry || "open"} | Goal: ${highSkillInput.goal || "not specified"}`,
      `Role: ${highSkillInput.role || "not specified"} | Field: ${highSkillInput.field || "not specified"}`,
      `Education: ${highSkillInput.education || "n/a"} | Experience: ${highSkillInput.yearsExperience || 0} years`,
      `Evidence: publications ${highSkillInput.publicationCount || 0}, citations ${highSkillInput.citationCount || 0}, patents ${highSkillInput.patentCount || 0}`,
    );
    if (highSkillInput.resumeFileName) lines.push(`CV/reference file named by user: ${highSkillInput.resumeFileName}`);
    if (highSkillInput.profileSummary) lines.push(`Profile notes: ${highSkillInput.profileSummary}`);
  } else {
    lines.push(
      `Goal: ${routeInput.goal || "not specified"}`,
      `Route focus: ${[routeInput.track, routeInput.destination].filter(Boolean).join(" / ") || "Open"}`,
      `Profile: ${routeInput.profile || "not specified"} | Priority: ${routeInput.priority || "not specified"}`,
      `Budget: USD ${routeInput.budget || 0} | Timeline: ${routeInput.timeline || 0} months | Family: ${routeInput.family ? "yes" : "no"}`,
    );
    if (routeInput.notes) lines.push(`Notes: ${routeInput.notes}`);
  }

  const next = activeMatches
    .slice(0, 3)
    .map((match, index) => `${index + 1}. ${match.title} - ${match.score}/100`)
    .join("\n");
  if (next) lines.push(`Shortlist:\n${next}`);

  return lines.join("\n").slice(0, 2600);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const engine = sanitizeEngine(body.engine);
  const routeInput = sanitizeRouteInput(body.routeInput);
  const highSkillInput = sanitizeHighSkillInput(body.highSkillInput);
  const routeMatches = sanitizeMatches(body.routeMatches);
  const highSkillMatches = sanitizeMatches(body.highSkillMatches);
  const completion = Math.max(0, Math.min(100, numberValue(body.completion, engine === "high-skill" ? 0 : 100)));
  const eventMode = normalizeText(body.event, 20) === "lead" ? "lead" : "activity";
  const contact = body.contact && typeof body.contact === "object" ? (body.contact as Record<string, unknown>) : {};
  const name = normalizeText(contact.name, 120);
  const email = normalizeEmail(contact.email);
  const phone = normalizePhone(contact.phone);
  const hasContact = Boolean(name || email || phone);
  const activeMatches = engine === "high-skill" ? highSkillMatches : routeMatches;
  const best = activeMatches[0];
  const track = isTrack(routeInput.track) ? routeInput.track : undefined;
  const message = assessmentMessage({
    engine,
    routeInput,
    highSkillInput,
    routeMatches,
    highSkillMatches,
    completion,
  });
  const interests = [
    "xia intelligence",
    engine,
    engine === "high-skill" ? "high skill visa" : "route intelligence",
    routeInput.goal,
    routeInput.track,
    routeInput.destination,
    routeInput.profile,
    highSkillInput.targetCountry,
    highSkillInput.goal,
    highSkillInput.field,
    best?.country,
    best?.title,
  ].filter(Boolean) as string[];

  const event = await captureVisitorEvent(
    {
      type: "programme_assessment",
      visitorId: normalizeText(body.visitorId, 100) || undefined,
      sessionId: normalizeText(body.sessionId, 100) || undefined,
      path: normalizeText(body.path, 260) || "/xia-intelligence",
      title: "XIA Intelligence assessment",
      referrer: normalizeText(body.referrer, 500) || request.headers.get("referer") || undefined,
      label: eventMode === "lead" ? "XIA Intelligence lead" : `XIA Intelligence ${engine}`,
      query:
        engine === "high-skill"
          ? `${highSkillInput.role} ${highSkillInput.targetCountry}`.trim()
          : `${routeInput.goal} ${routeInput.profile} ${routeInput.destination}`.trim(),
      interests,
      name,
      email,
      phone,
      metadata: {
        engine,
        completion,
        routeInput,
        highSkillInput,
        routeMatches,
        highSkillMatches,
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
      name: name || email || phone || "XIA Intelligence visitor",
      email: email || undefined,
      phone: phone || undefined,
      track,
      country:
        engine === "high-skill"
          ? highSkillInput.targetCountry || best?.country || undefined
          : routeInput.destination || best?.country || undefined,
      program: best?.title || undefined,
      message,
      page: "/xia-intelligence",
      referrer: normalizeText(body.referrer, 240) || request.headers.get("referer") || undefined,
      consent: parseBoolean(contact.consent),
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
