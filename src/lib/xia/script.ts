// src/lib/xia/script.ts
// -----------------------------------------------------------------------------
// The XIA script, shared by the chat and the three-tap Start page.
//
// One place for the three opening questions, the chips that re-rank a shortlist,
// how an engine question becomes a case patch, and the rule for when a
// conversation should end with the advisor rather than the routes.
//
// Pure module: no React, no server imports.
// -----------------------------------------------------------------------------

import type { CaseMatch, XiaCase } from "./case";

export type Chip = {
  label: string;
  value: string;
  emoji?: string;
  /** Refinement chips carry their own patch, so they never go via the model. */
  patch?: Partial<XiaCase>;
};

export type Question = {
  key: string;
  /** Short label for the progress rail. */
  rail: string;
  ask: string;
  chips: Chip[];
  /** The case field a free-text answer to this question fills. */
  field: keyof XiaCase;
  /** Turn a chip value into the patch. Defaults to a plain string field. */
  toPatch?: (value: string) => Partial<XiaCase>;
};

/** A computed key widens to a string index, so the cast has to go via unknown. */
export function setField(field: keyof XiaCase, value: string | number): Partial<XiaCase> {
  return { [field]: value } as unknown as Partial<XiaCase>;
}

/**
 * The three questions that identify WHICH track someone is on. Everything after
 * these comes from the matched programmes' own rules.
 */
export const OPENERS: Question[] = [
  {
    key: "profile",
    rail: "You",
    ask: "First — what do you do for a living?",
    field: "profile",
    chips: [
      { label: "Salaried professional", value: "professional", emoji: "💼" },
      { label: "Founder / business owner", value: "entrepreneur", emoji: "🚀" },
      { label: "Investor", value: "investor", emoji: "📈" },
      { label: "Researcher or academic", value: "researcher", emoji: "🔬" },
      { label: "Doctor or nurse", value: "professional", emoji: "🩺" },
      { label: "Student or recent graduate", value: "student", emoji: "🎓" },
      { label: "Remote worker / freelancer", value: "remote", emoji: "🌐" },
    ],
  },
  {
    key: "destination",
    rail: "Where",
    ask: "Where are you hoping to go? Pick one, or tell me you're open and I'll choose from what fits you.",
    field: "destination",
    chips: [
      { label: "Canada", value: "canada", emoji: "🇨🇦" },
      { label: "Australia", value: "australia", emoji: "🇦🇺" },
      { label: "United Kingdom", value: "united kingdom", emoji: "🇬🇧" },
      { label: "United States", value: "united states", emoji: "🇺🇸" },
      { label: "Portugal", value: "portugal", emoji: "🇵🇹" },
      { label: "Greece", value: "greece", emoji: "🇬🇷" },
      { label: "UAE", value: "uae", emoji: "🇦🇪" },
      // "not-sure" is the engine's word for an open destination (see match.ts).
      { label: "I'm open — you pick", value: "not-sure", emoji: "🌍" },
    ],
  },
  {
    key: "goal",
    rail: "Goal",
    ask: "And what do you want the move to actually achieve? This decides everything I ask you next.",
    field: "goal",
    chips: [
      { label: "Permanent residence", value: "pr", emoji: "🏠" },
      { label: "Work abroad", value: "work-visa", emoji: "💼" },
      { label: "A second passport", value: "citizenship", emoji: "🛂" },
      { label: "Invest for residency", value: "investment", emoji: "💰" },
      { label: "Start or move a business", value: "business-setup", emoji: "🏢" },
      { label: "Join or bring family", value: "family-migration", emoji: "👪" },
      { label: "Study, then settle", value: "study", emoji: "📚" },
    ],
  },
];

/** The label a chip value was chosen under, for "You: Salaried professional". */
export function openerLabel(key: string, value: string | undefined): string {
  const question = OPENERS.find((entry) => entry.key === key);
  if (!question) return "";
  const chip = question.chips.find((entry) => entry.value === (value ?? ""));
  if (chip) return key === "destination" && chip.value === "not-sure" ? "Open to suggestions" : chip.label;
  if (!value) return key === "destination" ? "Open to suggestions" : "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* -------------------------------------------------------------------------- */
/*  Questions that come back from the engine                                   */
/* -------------------------------------------------------------------------- */

/** What /api/xia/match returns. Data only — a function cannot cross the wire. */
export type WireAsk = {
  field: string;
  rail: string;
  question: string;
  chips: Array<{ label: string; value: string }>;
};

/**
 * Chip value to case patch, for the fields where the value is not just a string.
 * Mirrors the `toPatch` on the server-side Ask definitions; anything not listed
 * here is written to its field as plain text.
 */
export const ASK_PATCH: Record<string, (value: string) => Partial<XiaCase>> = {
  age: (value) => ({ age: Number(value) }),
  yearsExperience: (value) => ({ yearsExperience: Number(value) }),
  timelineMonths: (value) => ({ timelineMonths: Number(value) }),
  budgetUsd: (value) =>
    Number(value) > 0 ? { budgetUsd: Number(value) } : { notes: "No fixed investment budget yet" },
  previousRefusal: (value) =>
    value === "discuss"
      ? { notes: "Prefers to discuss refusal history with an advisor" }
      : { previousRefusal: value === "yes" },
  languageTest: (value) => {
    if (value === "0") return { languageTest: "not-taken" };
    if (value === "french") {
      return { languageTest: "french", notes: "Tested in French — check the francophone bonus and category draws" };
    }
    const band = Number(value);
    return {
      languageTest: "english",
      languageScores: { speaking: band, listening: band, reading: band, writing: band },
    };
  },
};

export function toQuestion(ask: WireAsk): Question {
  return {
    key: `ask-${ask.field}`,
    rail: ask.rail,
    ask: ask.question,
    field: ask.field as keyof XiaCase,
    chips: ask.chips.map((chip) => ({ label: chip.label, value: chip.value })),
    toPatch: ASK_PATCH[ask.field],
  };
}

/* -------------------------------------------------------------------------- */
/*  Refinements, offered once the cards are up                                 */
/* -------------------------------------------------------------------------- */

const REFINE_BY_GOAL: Record<string, Chip[]> = {
  pr: [
    { label: "I have a master's degree", value: "masters", patch: { education: "masters" } },
    { label: "10+ years' experience", value: "experience", patch: { yearsExperience: 12 } },
    { label: "My partner is coming too", value: "partner", patch: { family: "partner" } },
    { label: "I have a job offer there", value: "offer", patch: { notes: "Has a job offer in the destination country" } },
  ],
  "work-visa": [
    { label: "I have a job offer there", value: "offer", patch: { notes: "Has a job offer in the destination country" } },
    { label: "10+ years' experience", value: "experience", patch: { yearsExperience: 12 } },
    { label: "I have a master's degree", value: "masters", patch: { education: "masters" } },
    { label: "My partner is coming too", value: "partner", patch: { family: "partner" } },
  ],
  investment: [
    { label: "I'd rather not relocate", value: "no-relocate", patch: { stayTolerance: "minimal" } },
    { label: "Citizenship matters to me later", value: "cit-later", patch: { notes: "Wants a citizenship pathway from the residency" } },
    { label: "My budget can stretch", value: "stretch", patch: { budgetUsd: 700_000 } },
    { label: "Children under 18 coming", value: "kids", patch: { family: "children" } },
  ],
  citizenship: [
    { label: "I need it within 6 months", value: "fast", patch: { timelineMonths: 6 } },
    { label: "Adding parents too", value: "parents", patch: { family: "parents" } },
    { label: "I've had a visa refused before", value: "refused", patch: { previousRefusal: true } },
    { label: "My budget can stretch", value: "stretch", patch: { budgetUsd: 400_000 } },
  ],
  "business-setup": [
    { label: "I have external funding", value: "funded", patch: { notes: "Business has external funding committed" } },
    { label: "I'd relocate with the business", value: "relocate", patch: { stayTolerance: "relocate" } },
    { label: "We already have clients there", value: "clients", patch: { notes: "Existing clients in the destination market" } },
    { label: "The business trades already", value: "trading", patch: { businessStage: "2-5-years" } },
  ],
  "family-migration": [
    { label: "We're already married", value: "married", patch: { family: "partner" } },
    { label: "Not married yet", value: "unmarried", patch: { notes: "Relationship not yet registered as a marriage" } },
    { label: "Children under 18 coming", value: "kids", patch: { family: "children" } },
  ],
  study: [
    { label: "I studied in that country", value: "studied-there", patch: { notes: "Holds a qualification from the destination country" } },
    { label: "I have a master's degree", value: "masters", patch: { education: "masters" } },
    { label: "I have a job offer there", value: "offer", patch: { notes: "Has a job offer in the destination country" } },
  ],
};

const REFINE_DEFAULT: Chip[] = [
  { label: "I have a master's degree", value: "masters", patch: { education: "masters" } },
  { label: "10+ years' experience", value: "experience", patch: { yearsExperience: 12 } },
  { label: "My partner is coming too", value: "partner", patch: { family: "partner" } },
  { label: "I can invest $250k+", value: "funds", patch: { budgetUsd: 250_000 } },
];

export function refineFor(goal?: string): Chip[] {
  return REFINE_BY_GOAL[goal ?? ""] ?? REFINE_DEFAULT;
}

/* -------------------------------------------------------------------------- */
/*  When the advisor is the answer                                             */
/* -------------------------------------------------------------------------- */

export type AdvisorReason = "nothing-clears" | "family" | "investment";

/** Goals where the money, the structure and the family are the whole case. */
const INVESTMENT_GOALS = new Set(["investment", "citizenship", "business-setup"]);

/**
 * The advisor card is earned, not automatic. It leads the closing only when:
 *   - nothing on the shortlist clears the published rules, or
 *   - it is a family case, which the engine does not score, or
 *   - it is an investment or business route, where the engine can rank options
 *     but the structure, the source of funds and the family plan are what
 *     actually decide it.
 * Every other conversation ends on the routes, with the advisor one line away.
 */
export function advisorReasonFor(item: Pick<XiaCase, "goal" | "profile">, matches: CaseMatch[]): AdvisorReason | null {
  if (item.goal === "family-migration") return "family";
  if (INVESTMENT_GOALS.has(item.goal ?? "") || item.profile === "investor") return "investment";
  if (!matches.some((match) => match.state === "open" || match.state === "gaps")) return "nothing-clears";
  return null;
}

export const ADVISOR_LEAD: Record<AdvisorReason, string> = {
  "nothing-clears":
    "Nothing clears the published rules on what you have told me so far — which is worth knowing now rather than after a filing fee. That is exactly the case worth putting to a person.",
  family:
    "Family sponsorship is decided by your relative's status and your relationship to them, not by a points table — so I will not pretend to score it. What you have told me is exactly what an advisor needs to answer it properly.",
  investment:
    "These routes are ranked on the published thresholds. What decides an investment case is the structure, the source of funds and the family plan — and that is a conversation, not a calculation.",
};

/* -------------------------------------------------------------------------- */
/*  Where "Get started" goes                                                   */
/* -------------------------------------------------------------------------- */

/** The registration checkout, with the chosen route carried across. */
export function registrationHref(match?: Pick<CaseMatch, "programmeId"> | null): string {
  return match ? `/registration?route=${encodeURIComponent(match.programmeId)}` : "/registration";
}

export const REGISTRATION_PRICE_LABEL = "₹4,999";
export const REPORT_PRICE_LABEL = "₹499";
