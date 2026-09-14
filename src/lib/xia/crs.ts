// src/lib/xia/crs.ts
// -----------------------------------------------------------------------------
// Express Entry Comprehensive Ranking System.
//
// The CRS is published, deterministic arithmetic. Implementing it honestly is
// the single fastest way to make the assessment tools credible: a candidate can
// check our number against IRCC's own calculator and get the same answer.
//
// SOURCE OF TRUTH: IRCC's CRS criteria page. The tables below reflect the rules
// as at LAST_VERIFIED. Two things move and must be re-checked before each
// release: the additional-points list (job-offer points were removed in 2025 and
// are scored as zero here) and the category-based draw cut-offs, which are not
// part of the CRS at all and live with the draw data.
//
// Nothing in this file guesses. Where an input is unknown the factor scores 0
// and `assumptions` says so, so the caller can show the gap rather than a number
// that looks authoritative.
// -----------------------------------------------------------------------------

export const CRS_LAST_VERIFIED = "2026-09-13";
export const CRS_SOURCE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/comprehensive-ranking-system-criteria.html";

export type EducationLevel =
  | "none"
  | "secondary"
  | "one-year"
  | "two-year"
  | "bachelor"
  | "two-or-more"
  | "masters"
  | "doctoral";

/** Canadian Language Benchmark, per ability. */
export type Clb = 0 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CrsInput = {
  age: number;
  hasSpouse: boolean;
  /** Set when the spouse is a Canadian citizen or PR — they are then scored as single. */
  spouseIsCanadian?: boolean;
  education: EducationLevel;
  /** Speaking, listening, reading, writing — lowest ability drives most of the score. */
  firstLanguage: { speaking: Clb; listening: Clb; reading: Clb; writing: Clb };
  secondLanguage?: { speaking: Clb; listening: Clb; reading: Clb; writing: Clb };
  canadianWorkYears: number;
  foreignWorkYears: number;
  certificateOfQualification?: boolean;
  spouse?: {
    education: EducationLevel;
    canadianWorkYears: number;
    language?: { speaking: Clb; listening: Clb; reading: Clb; writing: Clb };
  };
  provincialNomination?: boolean;
  siblingInCanada?: boolean;
  canadianStudy?: "none" | "one-or-two-year" | "three-year-plus";
  /** CLB 7+ in French across all four abilities unlocks the French bonus. */
  frenchClb7Plus?: boolean;
  englishClb5Plus?: boolean;
};

export type CrsBreakdown = {
  core: number;
  spouse: number;
  transferability: number;
  additional: number;
  total: number;
  detail: Record<string, number>;
  assumptions: string[];
  maximum: 1200;
};

/* --------------------------------- tables --------------------------------- */

// [withSpouse, withoutSpouse]
const AGE: Record<number, [number, number]> = {
  18: [90, 99], 19: [95, 105], 20: [100, 110], 21: [100, 110], 22: [100, 110],
  23: [100, 110], 24: [100, 110], 25: [100, 110], 26: [100, 110], 27: [100, 110],
  28: [100, 110], 29: [100, 110], 30: [95, 105], 31: [90, 99], 32: [85, 94],
  33: [80, 88], 34: [75, 83], 35: [70, 77], 36: [65, 72], 37: [60, 66],
  38: [55, 61], 39: [50, 55], 40: [45, 50], 41: [35, 39], 42: [25, 28],
  43: [15, 17], 44: [5, 6],
};

const EDUCATION: Record<EducationLevel, [number, number]> = {
  none: [0, 0],
  secondary: [28, 30],
  "one-year": [84, 90],
  "two-year": [91, 98],
  bachelor: [112, 120],
  "two-or-more": [119, 128],
  masters: [126, 135],
  doctoral: [140, 150],
};

/** First official language, per ability. */
function firstLanguagePoints(clb: Clb, hasSpouse: boolean) {
  const table: Record<number, [number, number]> = {
    4: [6, 6], 5: [6, 6], 6: [8, 9], 7: [16, 17], 8: [22, 23], 9: [29, 31], 10: [32, 34],
  };
  const row = table[Math.min(clb, 10)];
  if (!row) return 0;
  return hasSpouse ? row[0] : row[1];
}

function secondLanguagePoints(clb: Clb) {
  if (clb >= 9) return 6;
  if (clb >= 7) return 3;
  if (clb >= 5) return 1;
  return 0;
}

const CANADIAN_WORK: Record<number, [number, number]> = {
  0: [0, 0], 1: [35, 40], 2: [46, 53], 3: [56, 64], 4: [63, 72], 5: [70, 80],
};

/* ------------------------------- calculation ------------------------------ */

function clbMin(set: CrsInput["firstLanguage"]) {
  return Math.min(set.speaking, set.listening, set.reading, set.writing) as Clb;
}

export function calculateCrs(input: CrsInput): CrsBreakdown {
  const assumptions: string[] = [];
  const detail: Record<string, number> = {};

  // A spouse who is already a citizen or PR does not accompany the applicant,
  // so the single-applicant tables apply.
  const withSpouse = Boolean(input.hasSpouse) && !input.spouseIsCanadian;
  const idx = withSpouse ? 0 : 1;

  // ---- Core / human capital (max 460 with spouse, 500 without) ----
  const ageKey = Math.floor(input.age);
  const agePoints = ageKey >= 45 || ageKey < 18 ? 0 : (AGE[ageKey]?.[idx] ?? 0);
  if (ageKey >= 45) assumptions.push("Age 45 or over scores zero age points.");
  detail.age = agePoints;

  detail.education = EDUCATION[input.education][idx];
  if (input.education === "none") {
    assumptions.push("Education below secondary scores zero. An ECA is required for foreign credentials.");
  }

  const first = input.firstLanguage;
  detail.firstLanguage =
    firstLanguagePoints(first.speaking, withSpouse) +
    firstLanguagePoints(first.listening, withSpouse) +
    firstLanguagePoints(first.reading, withSpouse) +
    firstLanguagePoints(first.writing, withSpouse);

  const firstMin = clbMin(first);
  if (firstMin < 7) {
    assumptions.push(
      `Lowest first-language ability is CLB ${firstMin}. Federal Skilled Worker requires CLB 7 in every ability.`,
    );
  }

  if (input.secondLanguage) {
    const second = input.secondLanguage;
    const raw =
      secondLanguagePoints(second.speaking) +
      secondLanguagePoints(second.listening) +
      secondLanguagePoints(second.reading) +
      secondLanguagePoints(second.writing);
    detail.secondLanguage = Math.min(raw, withSpouse ? 22 : 24);
  } else {
    detail.secondLanguage = 0;
  }

  const cwYears = Math.min(Math.max(Math.floor(input.canadianWorkYears), 0), 5);
  detail.canadianWorkExperience = CANADIAN_WORK[cwYears][idx];

  const core =
    detail.age + detail.education + detail.firstLanguage + detail.secondLanguage + detail.canadianWorkExperience;

  // ---- Spouse factors (max 40) ----
  let spouse = 0;
  if (withSpouse && input.spouse) {
    const spouseEdu = { none: 0, secondary: 2, "one-year": 6, "two-year": 7, bachelor: 8, "two-or-more": 9, masters: 10, doctoral: 10 }[
      input.spouse.education
    ];
    const spouseWork = [0, 5, 7, 8, 9, 10][Math.min(Math.max(Math.floor(input.spouse.canadianWorkYears), 0), 5)];
    let spouseLang = 0;
    if (input.spouse.language) {
      const perAbility = (clb: Clb) => (clb >= 9 ? 5 : clb >= 7 ? 3 : clb >= 5 ? 1 : 0);
      const l = input.spouse.language;
      spouseLang = Math.min(
        perAbility(l.speaking) + perAbility(l.listening) + perAbility(l.reading) + perAbility(l.writing),
        20,
      );
    } else {
      assumptions.push("No spouse language result supplied — spouse language points scored as zero.");
    }
    detail.spouseEducation = spouseEdu;
    detail.spouseWork = spouseWork;
    detail.spouseLanguage = spouseLang;
    spouse = Math.min(spouseEdu + spouseWork + spouseLang, 40);
  }

  // ---- Skill transferability (max 100) ----
  const eduTier = ["none", "secondary"].includes(input.education) ? 0 : input.education === "one-year" ? 1 : 2;
  const fwYears = Math.max(Math.floor(input.foreignWorkYears), 0);

  const eduLang = eduTier === 0 ? 0 : firstMin >= 9 ? (eduTier === 2 ? 50 : 25) : firstMin >= 7 ? (eduTier === 2 ? 25 : 13) : 0;
  const eduCanadian = eduTier === 0 ? 0 : cwYears >= 2 ? (eduTier === 2 ? 50 : 25) : cwYears >= 1 ? (eduTier === 2 ? 25 : 13) : 0;
  const foreignLang = fwYears === 0 ? 0 : firstMin >= 9 ? (fwYears >= 3 ? 50 : 25) : firstMin >= 7 ? (fwYears >= 3 ? 25 : 13) : 0;
  const foreignCanadian = fwYears === 0 ? 0 : cwYears >= 2 ? (fwYears >= 3 ? 50 : 25) : cwYears >= 1 ? (fwYears >= 3 ? 25 : 13) : 0;
  const certLang = input.certificateOfQualification ? (firstMin >= 7 ? 50 : firstMin >= 5 ? 25 : 0) : 0;

  detail.transferEducationLanguage = Math.min(eduLang + eduCanadian, 50);
  detail.transferForeignWork = Math.min(foreignLang + foreignCanadian, 50);
  detail.transferCertificate = certLang;
  const transferability = Math.min(
    detail.transferEducationLanguage + detail.transferForeignWork + detail.transferCertificate,
    100,
  );

  // ---- Additional points (max 600) ----
  detail.provincialNomination = input.provincialNomination ? 600 : 0;
  detail.sibling = input.siblingInCanada ? 15 : 0;
  detail.canadianStudy =
    input.canadianStudy === "three-year-plus" ? 30 : input.canadianStudy === "one-or-two-year" ? 15 : 0;
  detail.french = input.frenchClb7Plus ? (input.englishClb5Plus ? 50 : 25) : 0;
  detail.arrangedEmployment = 0;
  assumptions.push(
    "Job-offer points are scored as zero: IRCC removed arranged-employment CRS points in 2025.",
  );

  const additional = Math.min(
    detail.provincialNomination + detail.sibling + detail.canadianStudy + detail.french,
    600,
  );

  const total = Math.min(core + spouse + transferability + additional, 1200);

  return { core, spouse, transferability, additional, total, detail, assumptions, maximum: 1200 };
}

/**
 * Hard requirements for Federal Skilled Worker, checked before any score is
 * shown. A high CRS on an ineligible profile is the most misleading number an
 * assessment tool can produce.
 */
export function expressEntryKnockouts(input: CrsInput): string[] {
  const out: string[] = [];
  const firstMin = clbMin(input.firstLanguage);
  if (firstMin < 7) out.push("Federal Skilled Worker requires CLB 7 or higher in all four abilities.");
  if (input.education === "none") out.push("A completed secondary credential is the minimum for Express Entry.");
  if (input.foreignWorkYears < 1 && input.canadianWorkYears < 1) {
    out.push("At least one year of continuous skilled work experience is required.");
  }
  if (input.age >= 45) {
    out.push("Age 45 or over scores zero age points, which usually puts the total below recent draw cut-offs.");
  }
  return out;
}
