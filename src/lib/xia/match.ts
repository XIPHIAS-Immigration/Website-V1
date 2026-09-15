// src/lib/xia/match.ts
// -----------------------------------------------------------------------------
// Case in, cards out. Synchronous, pure, no network, no model.
//
// This is what lets the concierge paint programme cards the instant somebody
// finishes a sentence. The model may enrich the wording afterwards; it is never
// in the way of the result.
// -----------------------------------------------------------------------------

import type { CaseMatch, XiaCase } from "./case";
import { evaluate, type Ask } from "./requirements";
import { programmeRules, type ProgrammeRule } from "./programme-requirements";
import { calculateCrs, type CrsInput, type Clb, type EducationLevel } from "./crs";
import { calculateAustraliaPoints, type AuEnglish, type AuQualification } from "./australia-points";

function norm(value?: string) {
  return (value ?? "").toLowerCase().trim();
}

function destinationMatches(rule: ProgrammeRule, destination?: string) {
  const wanted = norm(destination);
  if (!wanted || wanted === "not-sure") return true;
  if (wanted === "europe") return ["portugal", "greece"].includes(rule.countryKey);
  return rule.countryKey === wanted || norm(rule.country).includes(wanted);
}

/* ----------------------------- real scoring ------------------------------ */

function clbFrom(item: XiaCase): CrsInput["firstLanguage"] {
  const s = item.languageScores ?? {};
  const toClb = (value?: number) => (value === undefined ? 0 : (Math.min(Math.max(Math.round(value), 0), 10) as Clb));
  return {
    speaking: toClb(s.speaking), listening: toClb(s.listening),
    reading: toClb(s.reading), writing: toClb(s.writing),
  };
}

function crsScore(item: XiaCase): number | null {
  if (item.age === undefined || !item.education || !item.languageScores) return null;
  const result = calculateCrs({
    age: item.age,
    hasSpouse: item.family === "partner" || item.family === "children",
    education: item.education as EducationLevel,
    firstLanguage: clbFrom(item),
    canadianWorkYears: item.canadianWorkYears ?? 0,
    foreignWorkYears: item.yearsExperience ?? 0,
  });
  return result.total;
}

function auScore(item: XiaCase): number | null {
  if (item.age === undefined || !item.education) return null;
  const scores = item.languageScores;
  const lowest = scores
    ? Math.min(scores.speaking ?? 0, scores.listening ?? 0, scores.reading ?? 0, scores.writing ?? 0)
    : 0;
  const english: AuEnglish = lowest >= 8 ? "superior" : lowest >= 7 ? "proficient" : "competent";
  const qualification: AuQualification =
    item.education === "doctorate" || item.education === "doctoral"
      ? "doctorate"
      : item.education === "masters"
        ? "masters-or-bachelor-with-research"
        : item.education === "bachelor"
          ? "bachelor"
          : "trade-or-diploma";

  return calculateAustraliaPoints({
    age: item.age,
    english,
    overseasSkilledYears: item.yearsExperience ?? 0,
    australianSkilledYears: 0,
    qualification,
    partner: item.family === "alone" ? "no-partner" : "partner-none-of-these",
  }).total;
}

/* ------------------------------- ordering -------------------------------- */

const STATE_WEIGHT = { open: 3, gaps: 2, closed: 0 } as const;

function relevance(rule: ProgrammeRule, item: XiaCase) {
  let score = 0;
  if (item.goal && rule.goals.includes(item.goal)) score += 40;
  if (item.destination && destinationMatches(rule, item.destination) && norm(item.destination) !== "not-sure") score += 30;
  if (item.profile && rule.profiles.includes(item.profile)) score += 20;
  if (item.timelineMonths && rule.timelineMonths && rule.timelineMonths <= item.timelineMonths) score += 10;
  if (item.budgetUsd && rule.investmentUsd > 0 && item.budgetUsd >= rule.investmentUsd) score += 10;
  return score;
}

export type MatchOptions = {
  /** How many cards to return. The bar shows three; a results page shows more. */
  limit?: number;
  /** Include routes that are closed, so we can explain why rather than hide them. */
  includeClosed?: boolean;
};

export function matchProgrammes(item: XiaCase, options: MatchOptions = {}): CaseMatch[] {
  const { limit = 3, includeClosed = false } = options;

  const evaluated = programmeRules
    .filter((rule) => destinationMatches(rule, item.destination))
    .filter((rule) => !item.goal || item.goal === "not-sure" || rule.goals.includes(item.goal))
    .map((rule) => {
      const result = evaluate(rule.requirements, item);
      const score =
        rule.scoring === "crs" ? crsScore(item) : rule.scoring === "australia-points" ? auScore(item) : null;

      // The reason is written here, from facts. The model may rewrite it later,
      // but a card is never blank waiting for one.
      const reason =
        result.state === "closed"
          ? result.blockers[0]
          : result.state === "open"
            ? score !== null
              ? `You meet the published criteria. Indicative score ${score}.`
              : "You meet every published requirement we can test from what you've told me."
            : result.gaps[0];

      return {
        rule,
        match: {
          programmeId: rule.id,
          title: rule.title,
          country: rule.country,
          track: rule.track,
          href: rule.href,
          state: result.state,
          score,
          gaps: result.gaps.slice(0, 3),
          reason,
        } satisfies CaseMatch,
        rank: STATE_WEIGHT[result.state] * 100 + relevance(rule, item) + result.certainty / 10,
      };
    })
    .filter((entry) => includeClosed || entry.match.state !== "closed")
    .sort((a, b) => b.rank - a.rank);

  return evaluated.slice(0, limit).map((entry) => entry.match);
}

/* -------------------------------------------------------------------------- */
/*  What to ask next                                                           */
/*                                                                            */
/*  This used to be a fixed ladder that ended on "Have you taken IELTS or PTE  */
/*  yet?" for every visitor, including someone buying a Caribbean passport.    */
/*  Now the question comes from the matched routes themselves: each rule       */
/*  declares what would answer it, and we ask whichever of those the most      */
/*  routes on the shortlist are waiting on. Change a programme rule and the    */
/*  questions follow automatically.                                           */
/* -------------------------------------------------------------------------- */

/** Questions for a goal that has no programme rules loaded yet, or none matched. */
const FALLBACK_ASKS: Record<string, Ask[]> = {
  "family-migration": [
    {
      field: "relativeInDestination",
      rail: "Who",
      question: "Who do you already have in the country you are aiming for?",
      priority: 10,
      chips: [
        { label: "Spouse or partner", value: "spouse" },
        { label: "Parent", value: "parent" },
        { label: "Child", value: "child" },
        { label: "Sibling", value: "sibling" },
        { label: "Fiancé(e)", value: "fiance" },
      ],
    },
    {
      field: "relativeStatus",
      rail: "Status",
      question: "What status do they hold there? It decides whether they can sponsor you at all.",
      priority: 20,
      chips: [
        { label: "Citizen", value: "citizen" },
        { label: "Permanent resident", value: "pr" },
        { label: "Work visa", value: "work" },
        { label: "Student visa", value: "student" },
        { label: "Not sure", value: "not-sure" },
      ],
    },
    {
      field: "family",
      rail: "Family",
      question: "And who would be moving?",
      priority: 30,
      chips: [
        { label: "Just me", value: "alone" },
        { label: "Me and my children", value: "children" },
        { label: "My whole family", value: "parents" },
      ],
    },
  ],
  citizenship: [
    {
      field: "notes",
      rail: "Why",
      question: "What is the second passport actually for? Different programmes are strong at different things.",
      priority: 60,
      chips: [
        { label: "Visa-free travel", value: "passport for: visa-free travel" },
        { label: "A backup plan", value: "passport for: a backup plan" },
        { label: "Business and banking", value: "passport for: business and banking" },
        { label: "Family security", value: "passport for: family security" },
      ],
    },
  ],
  "not-sure": [
    {
      field: "timelineMonths",
      rail: "When",
      question: "How soon would you want this to actually happen?",
      priority: 10,
      chips: [
        { label: "Within 3 months", value: "3" },
        { label: "3 to 6 months", value: "6" },
        { label: "6 to 12 months", value: "12" },
        { label: "1 to 2 years", value: "24" },
        { label: "No fixed date", value: "0" },
      ],
      toPatch: (value) => ({ timelineMonths: Number(value) }),
    },
    {
      field: "budgetUsd",
      rail: "How",
      question:
        "Is there capital you could put behind this, or does it need to be earned on points? This one answer splits the whole thing in two.",
      priority: 20,
      chips: [
        { label: "It has to be on merit and points", value: "0" },
        { label: "Up to US$250,000", value: "200000" },
        { label: "US$250,000 – 500,000", value: "350000" },
        { label: "Over US$500,000", value: "700000" },
      ],
      toPatch: (value) =>
        Number(value) > 0
          ? { budgetUsd: Number(value) }
          : { notes: "No investment capital — points-based routes only" },
    },
  ],
};

/** True once the case already holds an answer for this question's field. */
function answered(item: XiaCase, ask: Ask) {
  const value = (item as unknown as Record<string, unknown>)[ask.field];
  if (ask.field === "languageTest") return Boolean(item.languageTest || item.languageScores);
  if (ask.field === "notes") return false; // notes can take several answers
  return value !== undefined && value !== "" && value !== null;
}

/**
 * The questions worth asking next, most useful first.
 *
 * Collected from every route on the shortlist, deduplicated by field, ranked by
 * how many routes are waiting on it and then by the requirement's own priority.
 */
export function nextQuestions(item: XiaCase, limit = 3): Ask[] {
  const shortlist = matchProgrammes(item, { limit: 4 });

  const byField = new Map<string, { ask: Ask; wanted: number }>();

  for (const match of shortlist) {
    const rule = programmeRules.find((entry) => entry.id === match.programmeId);
    if (!rule) continue;
    for (const ask of evaluate(rule.requirements, item).asks) {
      if (answered(item, ask)) continue;
      const seen = byField.get(ask.field);
      if (seen) seen.wanted += 1;
      else byField.set(ask.field, { ask, wanted: 1 });
    }
  }

  // Nothing matched, or the matched routes need nothing further: fall back to
  // the goal's own questions so a family or undecided visitor is not stranded.
  if (byField.size < limit) {
    for (const ask of FALLBACK_ASKS[item.goal ?? ""] ?? []) {
      if (answered(item, ask) || byField.has(ask.field)) continue;
      byField.set(ask.field, { ask, wanted: 0 });
    }
  }

  return [...byField.values()]
    .sort((a, b) => b.wanted - a.wanted || a.ask.priority - b.ask.priority)
    .slice(0, limit)
    .map((entry) => entry.ask);
}

/**
 * The single most useful next question. Kept for the callers that want one.
 */
export function sharpeningQuestion(item: XiaCase): { field: string; question: string } | null {
  if (!item.destination) return { field: "destination", question: "Which country are you aiming for?" };
  if (!item.goal) return { field: "goal", question: "What do you want this move to achieve?" };
  const [first] = nextQuestions(item, 1);
  return first ? { field: first.field, question: first.question } : null;
}
