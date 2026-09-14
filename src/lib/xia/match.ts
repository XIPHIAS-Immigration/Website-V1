// src/lib/xia/match.ts
// -----------------------------------------------------------------------------
// Case in, cards out. Synchronous, pure, no network, no model.
//
// This is what lets the concierge paint programme cards the instant somebody
// finishes a sentence. The model may enrich the wording afterwards; it is never
// in the way of the result.
// -----------------------------------------------------------------------------

import type { CaseMatch, XiaCase } from "./case";
import { evaluate } from "./requirements";
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

/**
 * The single most useful next question, derived from what the matcher could not
 * test. Used when the concierge has cards but could sharpen them with one more
 * answer — asked *alongside* the cards, never instead of them.
 */
export function sharpeningQuestion(item: XiaCase): { field: string; question: string } | null {
  if (!item.destination) return { field: "destination", question: "Which country are you aiming for?" };
  if (!item.goal) return { field: "goal", question: "What do you want this move to achieve?" };
  if (item.age === undefined) return { field: "age", question: "How old are you? It changes the score on most points systems." };
  if (!item.education) return { field: "education", question: "What's your highest qualification?" };
  if (!item.languageScores) return { field: "language", question: "Have you taken IELTS or PTE yet?" };
  return null;
}
