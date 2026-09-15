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

/**
 * The question that would answer this requirement, if the visitor has not
 * already answered it.
 *
 * This is the whole point of the file. A requirement knows what it needs, so
 * the assistant no longer runs a fixed script that asks an investor for an
 * IELTS band. Only requirements that carry an `ask` are ever put to a visitor;
 * anything an advisor has to confirm stays an advisor's job.
 */
export type AskChip = { label: string; value: string };

export type Ask = {
  /** The XiaCase field a chip or free-text answer fills. */
  field: string;
  /** Asked in full, in the assistant's voice. */
  question: string;
  /** Two to six chips. Empty means free text only. */
  chips: AskChip[];
  /** Short label for the progress rail. */
  rail: string;
  /** Lower is asked first when several routes want different things. */
  priority: number;
  /** Chip value -> case patch. Defaults to writing the value to `field`. */
  toPatch?: (value: string) => Record<string, unknown>;
};

export type Requirement = {
  id: string;
  /** Shown when the requirement is met. Short, factual. */
  label: string;
  /** Shown when it is not met or not known. Specific and actionable. */
  gap: string;
  /** Hard requirements close a route. Soft ones only weaken it. */
  hard: boolean;
  test: (item: XiaCase) => TestResult;
  /** What to ask when `test` returns "unknown". Omit for advisor-only checks. */
  asks?: Ask;
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
  /** The subset of unknowns we can actually put to the visitor ourselves. */
  asks: Ask[];
  /** 0-100 confidence that this evaluation is complete, not that it is a good fit. */
  certainty: number;
};

export function evaluate(requirements: Requirement[], item: XiaCase): Evaluation {
  const met: string[] = [];
  const gaps: string[] = [];
  const blockers: string[] = [];
  const unknowns: string[] = [];
  const asks: Ask[] = [];

  for (const requirement of requirements) {
    const result = requirement.test(item);
    if (result === "pass") {
      met.push(requirement.label);
    } else if (result === "fail") {
      if (requirement.hard) blockers.push(requirement.gap);
      else gaps.push(requirement.gap);
    } else {
      unknowns.push(requirement.gap);
      if (requirement.asks) asks.push(requirement.asks);
      if (requirement.hard) gaps.push(requirement.gap);
    }
  }

  const state: Evaluation["state"] = blockers.length ? "closed" : gaps.length ? "gaps" : "open";
  const testable = requirements.length || 1;
  const certainty = Math.round(((testable - unknowns.length) / testable) * 100);

  return { state, met, gaps, blockers, unknowns, asks, certainty };
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

export const AGE_ASK: Ask = {
  field: "age",
  rail: "Age",
  question: "How old are you? Age moves the score on a points system more than anything else you can change.",
  priority: 10,
  chips: [
    { label: "Under 30", value: "27" },
    { label: "30 – 34", value: "32" },
    { label: "35 – 39", value: "37" },
    { label: "40 – 44", value: "42" },
    { label: "45 or over", value: "46" },
  ],
  toPatch: (value) => ({ age: Number(value) }),
};

export function ageBetween(min: number, max: number): Requirement {
  return {
    id: `age-${min}-${max}`,
    label: `Age ${min}–${max}`,
    gap: `This route requires you to be between ${min} and ${max}. Tell me your age and I can confirm.`,
    hard: true,
    asks: AGE_ASK,
    test: (item) => {
      if (item.age === undefined) return "unknown";
      return item.age >= min && item.age <= max ? "pass" : "fail";
    },
  };
}

/** Capital bands. Deliberately wide — nobody types an exact figure into a chat. */
export const CAPITAL_ASK: Ask = {
  field: "budgetUsd",
  rail: "Capital",
  question:
    "How much could you put into the qualifying investment itself — not counting government fees, due diligence or taxes?",
  priority: 10,
  chips: [
    { label: "Under US$250,000", value: "200000" },
    { label: "US$250,000 – 500,000", value: "350000" },
    { label: "US$500,000 – 1 million", value: "700000" },
    { label: "Over US$1 million", value: "1200000" },
    { label: "Still deciding", value: "0" },
  ],
  toPatch: (value) => (Number(value) > 0 ? { budgetUsd: Number(value) } : { notes: "Budget not yet decided" }),
};

export function fundsAtLeast(usd: number, note: string): Requirement {
  return {
    id: `funds-${usd}`,
    label: `Capital of about US$${usd.toLocaleString()} available`,
    gap: note,
    hard: true,
    asks: CAPITAL_ASK,
    test: (item) => {
      if (item.budgetUsd === undefined || item.budgetUsd === 0) return "unknown";
      return item.budgetUsd >= usd ? "pass" : "fail";
    },
  };
}

/**
 * Never says "IELTS" as the label. Canada accepts CELPIP and, for French, TEF
 * and TCF; Australia accepts PTE and TOEFL. French in particular is worth up to
 * 50 extra CRS points, which a fixed "what was your IELTS band" question cannot
 * even capture.
 */
export const LANGUAGE_ASK: Ask = {
  field: "languageTest",
  rail: "Language",
  question:
    "Have you sat a language assessment yet — IELTS, PTE, CELPIP, TEF or TCF? Roughly what did you get in your weakest section?",
  priority: 30,
  chips: [
    { label: "Band 8 or above", value: "8" },
    { label: "Band 7", value: "7" },
    { label: "Band 6.5", value: "6.5" },
    { label: "Band 6", value: "6" },
    { label: "Below 6", value: "5" },
    { label: "I tested in French", value: "french" },
    { label: "Not taken one yet", value: "0" },
  ],
  toPatch: (value) => {
    if (value === "0") return { languageTest: "not-taken" };
    if (value === "french") return { languageTest: "french", notes: "Tested in French — check the francophone CRS bonus and category draws" };
    const band = Number(value);
    return {
      languageTest: "english",
      languageScores: { speaking: band, listening: band, reading: band, writing: band },
    };
  },
};

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
    asks: LANGUAGE_ASK,
    test: (item) => {
      const scores = item.languageScores;
      if (!scores) return "unknown";
      const abilities = [scores.speaking, scores.listening, scores.reading, scores.writing];
      if (abilities.some((value) => value === undefined)) return "unknown";
      return Math.min(...(abilities as number[])) >= minPerAbility ? "pass" : "fail";
    },
  };
}

export const EDUCATION_ASK: Ask = {
  field: "education",
  rail: "Study",
  question: "What is your highest completed qualification?",
  priority: 20,
  chips: [
    { label: "Doctorate", value: "doctorate" },
    { label: "Master's", value: "masters" },
    { label: "Bachelor's", value: "bachelor" },
    { label: "Diploma", value: "diploma" },
    { label: "School only", value: "secondary" },
  ],
};

export function educationAtLeast(level: string, gap: string): Requirement {
  const floor = EDUCATION_RANK[level] ?? 0;
  return {
    id: `edu-${level}`,
    label: `Education at ${level} or above`,
    gap,
    hard: true,
    asks: EDUCATION_ASK,
    test: (item) => {
      if (!item.education) return "unknown";
      const rank = EDUCATION_RANK[item.education];
      if (rank === undefined) return "unknown";
      return rank >= floor ? "pass" : "fail";
    },
  };
}

export const EXPERIENCE_ASK: Ask = {
  field: "yearsExperience",
  rail: "Work",
  question: "How many years have you worked in your field, full time, since qualifying?",
  priority: 40,
  chips: [
    { label: "Under a year", value: "0" },
    { label: "1 – 2 years", value: "2" },
    { label: "3 – 5 years", value: "4" },
    { label: "6 – 9 years", value: "7" },
    { label: "10 years or more", value: "12" },
  ],
  toPatch: (value) => ({ yearsExperience: Number(value) }),
};

export function experienceAtLeast(years: number, gap: string, hard = true): Requirement {
  return {
    id: `exp-${years}`,
    label: `${years}+ years of relevant experience`,
    gap,
    hard,
    asks: EXPERIENCE_ASK,
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
  asks: {
    field: "previousRefusal",
    rail: "History",
    question: "Has any visa application of yours ever been refused, anywhere?",
    priority: 70,
    chips: [
      { label: "No, never", value: "no" },
      { label: "Yes, once", value: "yes" },
      { label: "Yes, more than once", value: "yes" },
      { label: "I'd rather discuss it", value: "discuss" },
    ],
    toPatch: (value) =>
      value === "discuss"
        ? { notes: "Prefers to discuss refusal history with an advisor" }
        : { previousRefusal: value === "yes" },
  },
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


/* -------------------------------------------------------------------------- */
/*  Requirements that matter on the routes where a language score does not.    */
/*                                                                            */
/*  An investment, citizenship or business route is decided by capital, family */
/*  size, how much time you can spend in the country and where the money came  */
/*  from. These make the engine able to ask about those the same way it asks   */
/*  a skilled applicant about their points.                                    */
/* -------------------------------------------------------------------------- */

/**
 * Replaces `familyInclusive` on routes where the family is the cost driver.
 * Soft: not knowing never closes a route, it only asks.
 */
export function includesFamily(note: string): Requirement {
  return {
    id: "family-size",
    label: "Family on the application is known",
    gap: note,
    hard: false,
    test: (item) => (item.family ? "pass" : "unknown"),
    asks: {
      field: "family",
      rail: "Family",
      question: "Who would be on the application with you? It changes both the cost and which programmes work.",
      priority: 20,
      chips: [
        { label: "Just me", value: "alone" },
        { label: "Me and my partner", value: "partner" },
        { label: "Partner and children", value: "children" },
        { label: "Parents or grandparents too", value: "parents" },
      ],
    },
  };
}

/**
 * The question nobody asks and everybody should. Greece has no minimum stay,
 * Portugal has a small one, the UAE needs an entry every six months, and a
 * citizenship pathway usually needs real residence. Getting this wrong is how
 * people buy the wrong programme.
 */
export function minimumStayFits(note: string): Requirement {
  return {
    id: "stay-tolerance",
    label: "Minimum stay is workable",
    gap: note,
    hard: false,
    test: (item) => (item.stayTolerance ? "pass" : "unknown"),
    asks: {
      field: "stayTolerance",
      rail: "Time there",
      question: "Realistically, how much time could you spend in the country each year?",
      priority: 30,
      chips: [
        { label: "Barely any — I need a low-stay option", value: "minimal" },
        { label: "A few weeks", value: "weeks" },
        { label: "Several months", value: "months" },
        { label: "I want to move there properly", value: "relocate" },
      ],
    },
  };
}

/** Source of funds decides a due-diligence outcome long before the money moves. */
export function sourceOfFundsKnown(note: string): Requirement {
  return {
    id: "source-of-funds",
    label: "Source of funds is documentable",
    gap: note,
    hard: false,
    test: (item) => (item.notes?.includes("source-of-funds:") ? "pass" : "unknown"),
    asks: {
      field: "notes",
      rail: "Funds",
      question: "Where would the investment funds come from? Every programme investigates this before it approves anything.",
      priority: 50,
      chips: [
        { label: "Salary and savings", value: "source-of-funds: salary and savings" },
        { label: "Sale of a business", value: "source-of-funds: sale of a business" },
        { label: "Business profits or dividends", value: "source-of-funds: business profits" },
        { label: "Property sale", value: "source-of-funds: property sale" },
        { label: "Inheritance or gift", value: "source-of-funds: inheritance or gift" },
      ],
    },
  };
}

/** What the applicant is actually setting up. Decides which business route fits. */
export function businessIntentKnown(note: string): Requirement {
  return {
    id: "business-intent",
    label: "Business intent is clear",
    gap: note,
    hard: false,
    test: (item) => (item.businessIntent ? "pass" : "unknown"),
    asks: {
      field: "businessIntent",
      rail: "Business",
      question: "What are you actually setting up there?",
      priority: 15,
      chips: [
        { label: "A new company", value: "new" },
        { label: "Expanding a business I already run", value: "expansion" },
        { label: "Moving staff for my employer", value: "staff" },
        { label: "Buying into an existing business", value: "acquisition" },
      ],
    },
  };
}

/** Trading history separates a start-up route from an expansion route. */
export function businessStageKnown(note: string): Requirement {
  return {
    id: "business-stage",
    label: "Trading history is known",
    gap: note,
    hard: false,
    test: (item) => (item.businessStage ? "pass" : "unknown"),
    asks: {
      field: "businessStage",
      rail: "Stage",
      question: "Does the business already trade?",
      priority: 35,
      chips: [
        { label: "Not yet — it's an idea", value: "idea" },
        { label: "Under two years", value: "under-2-years" },
        { label: "Two to five years", value: "2-5-years" },
        { label: "Over five years", value: "over-5-years" },
      ],
    },
  };
}
