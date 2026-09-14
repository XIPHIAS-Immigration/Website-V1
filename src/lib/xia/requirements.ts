// src/lib/xia/requirements.ts
// -----------------------------------------------------------------------------
// The rule engine that replaces keyword matching.
//
// The old model scored a route by looking for words like "golden visa" inside a
// paragraph of marketing copy. This asks the questions an immigration officer
// asks, and returns one of exactly three honest answers:
//
//   open    every hard requirement we can test is met
//   gaps    the route fits, but something specific is missing or unknown
//   closed  a hard requirement fails — and we say which one
//
// A requirement that we cannot test because the visitor has not told us
// something returns "unknown", NOT "fail". Unknown pushes a route to `gaps` with
// a named question; it never silently rejects. That distinction is the whole
// difference between "you are not eligible" and "tell me your age".
// -----------------------------------------------------------------------------

import type { XiaCase } from "./case";

export type TestResult = "pass" | "fail" | "unknown";

export type Requirement = {
  id: string;
  /** Shown when the requirement is met. Short, factual. */
  label: string;
  /** Shown when it is not met or not known. Specific and actionable. */
  gap: string;
  /** Hard requirements close a route. Soft ones only weaken it. */
  hard: boolean;
  test: (item: XiaCase) => TestResult;
};

export type Evaluation = {
  state: "open" | "gaps" | "closed";
  met: string[];
  /** Named, specific. "IELTS 7 in every band", never "language". */
  gaps: string[];
  /** Only populated when state is "closed". */
  blockers: string[];
  /** What we still need to ask, in priority order. */
  unknowns: string[];
  /** 0-100 confidence that this evaluation is complete, not that it is a good fit. */
  certainty: number;
};

export function evaluate(requirements: Requirement[], item: XiaCase): Evaluation {
  const met: string[] = [];
  const gaps: string[] = [];
  const blockers: string[] = [];
  const unknowns: string[] = [];

  for (const requirement of requirements) {
    const result = requirement.test(item);
    if (result === "pass") {
      met.push(requirement.label);
    } else if (result === "fail") {
      if (requirement.hard) blockers.push(requirement.gap);
      else gaps.push(requirement.gap);
    } else {
      unknowns.push(requirement.gap);
      if (requirement.hard) gaps.push(requirement.gap);
    }
  }

  const state: Evaluation["state"] = blockers.length ? "closed" : gaps.length ? "gaps" : "open";
  const testable = requirements.length || 1;
  const certainty = Math.round(((testable - unknowns.length) / testable) * 100);

  return { state, met, gaps, blockers, unknowns, certainty };
}

/* -------------------------------------------------------------------------- */
/*  Builders — so the programme data file reads like immigration rules,         */
/*  not like TypeScript.                                                        */
/* -------------------------------------------------------------------------- */

const EDUCATION_RANK: Record<string, number> = {
  none: 0, secondary: 1, diploma: 2, "one-year": 2, "two-year": 3,
  bachelor: 4, "two-or-more": 5, masters: 6, doctorate: 7, doctoral: 7,
};

function norm(value?: string) {
  return (value ?? "").toLowerCase().replace(/[^a-z ]/g, "").trim();
}

/** Applicants of these nationalities cannot use the route at all. */
export function excludesNationality(countries: string[], why: string): Requirement {
  const set = countries.map(norm);
  return {
    id: `nat-excl-${countries.join("-")}`,
    label: "Nationality is eligible",
    gap: why,
    hard: true,
    test: (item) => {
      if (!item.nationality) return "unknown";
      return set.includes(norm(item.nationality)) ? "fail" : "pass";
    },
  };
}

/** A country's own citizens do not immigrate to it. */
export function notOwnCountry(country: string): Requirement {
  return {
    id: `not-own-${country}`,
    label: "Not your country of citizenship",
    gap: `You already hold ${country} citizenship.`,
    hard: true,
    test: (item) => {
      if (!item.nationality) return "unknown";
      return norm(item.nationality) === norm(country) ? "fail" : "pass";
    },
  };
}

export function ageBetween(min: number, max: number): Requirement {
  return {
    id: `age-${min}-${max}`,
    label: `Age ${min}–${max}`,
    gap: `This route requires you to be between ${min} and ${max}. Tell me your age and I can confirm.`,
    hard: true,
    test: (item) => {
      if (item.age === undefined) return "unknown";
      return item.age >= min && item.age <= max ? "pass" : "fail";
    },
  };
}

export function fundsAtLeast(usd: number, note: string): Requirement {
  return {
    id: `funds-${usd}`,
    label: `Capital of about US$${usd.toLocaleString()} available`,
    gap: note,
    hard: true,
    test: (item) => {
      if (item.budgetUsd === undefined || item.budgetUsd === 0) return "unknown";
      return item.budgetUsd >= usd ? "pass" : "fail";
    },
  };
}

/** Language floors expressed on the scale the destination actually publishes. */
export function languageAtLeast(
  scale: "clb" | "ielts" | "competent-english",
  minPerAbility: number,
  gap: string,
): Requirement {
  return {
    id: `lang-${scale}-${minPerAbility}`,
    label: `Language at or above the published floor`,
    gap,
    hard: true,
    test: (item) => {
      const scores = item.languageScores;
      if (!scores) return "unknown";
      const abilities = [scores.speaking, scores.listening, scores.reading, scores.writing];
      if (abilities.some((value) => value === undefined)) return "unknown";
      return Math.min(...(abilities as number[])) >= minPerAbility ? "pass" : "fail";
    },
  };
}

export function educationAtLeast(level: string, gap: string): Requirement {
  const floor = EDUCATION_RANK[level] ?? 0;
  return {
    id: `edu-${level}`,
    label: `Education at ${level} or above`,
    gap,
    hard: true,
    test: (item) => {
      if (!item.education) return "unknown";
      const rank = EDUCATION_RANK[item.education];
      if (rank === undefined) return "unknown";
      return rank >= floor ? "pass" : "fail";
    },
  };
}

export function experienceAtLeast(years: number, gap: string, hard = true): Requirement {
  return {
    id: `exp-${years}`,
    label: `${years}+ years of relevant experience`,
    gap,
    hard,
    test: (item) => {
      if (item.yearsExperience === undefined) return "unknown";
      return item.yearsExperience >= years ? "pass" : "fail";
    },
  };
}

/** Something only an advisor can confirm. Always a gap, never a block. */
export function needsCheck(id: string, label: string, gap: string): Requirement {
  return { id, label, gap, hard: false, test: () => "unknown" };
}

export const cleanRecord: Requirement = {
  id: "clean-record",
  label: "No criminal inadmissibility declared",
  gap: "A criminal record needs assessment before any application — it is not automatically fatal, but it changes the route.",
  hard: true,
  test: (item) => (item.criminalRecord === undefined ? "unknown" : item.criminalRecord ? "fail" : "pass"),
};

export const noPriorRefusal: Requirement = {
  id: "prior-refusal",
  label: "No previous refusal declared",
  gap: "A previous refusal must be disclosed and explained. It usually narrows the route rather than closing it.",
  hard: false,
  test: (item) => (item.previousRefusal === undefined ? "unknown" : item.previousRefusal ? "fail" : "pass"),
};

export function requiresSponsor(gap: string): Requirement {
  return {
    id: "sponsor",
    label: "Employer sponsorship in place",
    gap,
    hard: true,
    test: (item) => {
      if (item.profile === "company") return "pass";
      return "unknown";
    },
  };
}

export function familyInclusive(): Requirement {
  return {
    id: "family",
    label: "Spouse and dependants can be included",
    gap: "Family inclusion rules differ by programme and dependant age — an advisor confirms this per case.",
    hard: false,
    test: () => "pass",
  };
}
