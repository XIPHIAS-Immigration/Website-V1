export type QmasCriterionStatus = "supported" | "indicated" | "not-supported" | "unconfirmed";

export type QmasCriterion = {
  id: number;
  aspect: string;
  criterion: string;
  status: QmasCriterionStatus;
  detail: string;
};

export type QmasAssessment = {
  criteria: QmasCriterion[];
  criteriaMet: number;
  threshold: 6;
  legacyScore?: number;
  scoreBasis: "recorded" | "evidence-aligned";
  outlook: "Strong potential" | "Positive" | "Developing" | "Insufficient evidence";
  assurance: "Positive" | "Promising" | "Preliminary" | "Not assessable";
};

export type QmasAssessmentInput = {
  age?: number;
  education?: string;
  yearsExperience?: number;
  languageTest?: string;
  languageScore?: number;
  languageDetails?: string;
  profileSummary?: string;
  workDetails?: string;
  employerOrBusiness?: string;
  pointsAssessment?: string;
  eligibilityAssessment?: string;
  claimedPointsTotal?: number;
  qmasCriteriaMet?: number;
  qmasLegacyScore?: number;
  qmasCriteria?: Record<string, boolean | null | undefined>;
};

const safeNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function recordedCriteriaCount(input: QmasAssessmentInput): number | undefined {
  const direct = safeNumber(input.qmasCriteriaMet);
  if (direct !== undefined && direct >= 0 && direct <= 12) return Math.round(direct);

  const combined = [input.pointsAssessment, input.eligibilityAssessment].filter(Boolean).join(" ");
  const patterns = [
    /(?:qmas|current|general points test|criteria(?:\s+met)?)\D{0,40}(\d{1,2})\s*(?:\/|of|out of)\s*12/i,
    /(\d{1,2})\s*(?:\/|of|out of)\s*12\s*(?:qmas|criteria|general points test)?/i,
  ];
  for (const pattern of patterns) {
    const value = safeNumber(combined.match(pattern)?.[1]);
    if (value !== undefined && value >= 0 && value <= 12) return Math.round(value);
  }

  const claimed = safeNumber(input.claimedPointsTotal);
  return claimed !== undefined && claimed >= 0 && claimed <= 12 ? Math.round(claimed) : undefined;
}

function recordedLegacyScore(input: QmasAssessmentInput): number | undefined {
  const direct = safeNumber(input.qmasLegacyScore);
  if (direct !== undefined && direct > 12 && direct <= 225) return Math.round(direct);
  const claimed = safeNumber(input.claimedPointsTotal);
  if (claimed !== undefined && claimed > 12 && claimed <= 225) return Math.round(claimed);
  const combined = [input.pointsAssessment, input.eligibilityAssessment].filter(Boolean).join(" ");
  const match = combined.match(/(?:legacy|former|submitted|worksheet)?\D{0,30}(\d{2,3})\s*\/\s*(?:195|225)/i);
  const parsed = safeNumber(match?.[1]);
  return parsed !== undefined && parsed > 12 ? Math.round(parsed) : undefined;
}

function explicitStatus(input: QmasAssessmentInput, id: number): QmasCriterionStatus | undefined {
  const value = input.qmasCriteria?.[String(id)] ?? input.qmasCriteria?.[`criterion${id}`];
  if (value === true) return "supported";
  if (value === false) return "not-supported";
  return undefined;
}

export function buildQmasAssessment(input: QmasAssessmentInput): QmasAssessment {
  const age = safeNumber(input.age);
  const years = safeNumber(input.yearsExperience);
  const education = String(input.education ?? "").toLowerCase();
  const language = `${input.languageTest ?? ""} ${input.languageDetails ?? ""}`.toLowerCase().trim();
  const career = `${input.profileSummary ?? ""} ${input.workDetails ?? ""} ${input.employerOrBusiness ?? ""}`.toLowerCase().trim();
  const status = (id: number, fallback: QmasCriterionStatus) => explicitStatus(input, id) ?? fallback;

  const criteria: QmasCriterion[] = [
    {
      id: 1, aspect: "Age", criterion: "Aged 50 or below",
      status: status(1, age === undefined ? "unconfirmed" : age <= 50 ? "supported" : "not-supported"),
      detail: age === undefined ? "Age is not recorded." : `Recorded age: ${Math.round(age)}.`,
    },
    {
      id: 2, aspect: "Academic qualifications", criterion: "Master's or doctoral degree from an eligible university",
      status: status(2, education && !/master|mba|phd|doctor/.test(education) ? "not-supported" : "unconfirmed"),
      detail: /master|mba|phd|doctor/.test(education) ? "Postgraduate qualification is recorded; eligible-university status remains document-dependent." : "Qualifying postgraduate education is not confirmed.",
    },
    {
      id: 3, aspect: "Academic qualifications", criterion: "Eligible-university master's or doctoral degree in STEM",
      status: status(3, "unconfirmed"),
      detail: "STEM relevance and eligible-university status require explicit documentary confirmation.",
    },
    {
      id: 4, aspect: "Language proficiency", criterion: "Written and spoken proficiency in two languages",
      status: status(4, "unconfirmed"),
      detail: "Two-language proficiency must be supported at the required written and spoken standard.",
    },
    {
      id: 5, aspect: "Language proficiency", criterion: "Written and spoken English proficiency",
      status: status(5, language && !/not[- ]?provided/.test(language) ? "indicated" : "unconfirmed"),
      detail: language && !/not[- ]?provided/.test(language) ? "English-language evidence is recorded and remains subject to documentary review." : "English proficiency evidence is not recorded.",
    },
    {
      id: 6, aspect: "Work experience", criterion: "At least five years of graduate or specialist-level work experience",
      status: status(6, years === undefined ? "unconfirmed" : years >= 5 ? "supported" : "not-supported"),
      detail: years === undefined ? "Experience duration is not recorded." : `Recorded experience: ${years} years.`,
    },
    {
      id: 7, aspect: "Work experience", criterion: "At least three years in multinational or reputable enterprises",
      status: status(7, /(multinational|mnc|goldman sachs|fortune|forbes global|listed compan)/.test(career) ? "indicated" : "unconfirmed"),
      detail: "Employer standing and the qualifying period require documentary confirmation.",
    },
    {
      id: 8, aspect: "Work experience", criterion: "At least three years in innovation and technology, finance or international trade",
      status: status(8, /(innovation|technology|finance|financial|international trade|supply chain|aviation|marine)/.test(career) && (years ?? 0) >= 3 ? "indicated" : "unconfirmed"),
      detail: "The role, field and qualifying period must be evidenced from employment records.",
    },
    {
      id: 9, aspect: "Work experience", criterion: "At least two years of graduate or specialist-level international exposure",
      status: status(9, /(international exposure|outside (?:the )?home country|overseas|netherlands|singapore|dubai|uae|united kingdom|united states)/.test(career) ? "indicated" : "unconfirmed"),
      detail: "International exposure means qualifying work outside the applicant's home country or territory.",
    },
    {
      id: 10, aspect: "Annual income", criterion: "Prior-year annual income of at least HKD 1 million",
      status: status(10, "unconfirmed"),
      detail: "The relevant annual income and supporting tax or remuneration records are not derived automatically.",
    },
    {
      id: 11, aspect: "Business ownership", criterion: "Business entity with prior-year annual profit of at least HKD 5 million",
      status: status(11, "unconfirmed"),
      detail: "Business ownership and qualifying annual profit require explicit evidence.",
    },
    {
      id: 12, aspect: "Business ownership", criterion: "Current ownership of a listed company",
      status: status(12, "unconfirmed"),
      detail: "Listed-company ownership requires explicit evidence.",
    },
  ];

  const recorded = recordedCriteriaCount(input);
  const evidenceAligned = criteria.filter((criterion) => criterion.status === "supported" || criterion.status === "indicated").length;
  const criteriaMet = recorded ?? evidenceAligned;
  const outlook = criteriaMet >= 6 ? "Strong potential" : criteriaMet >= 4 ? "Developing" : "Insufficient evidence";
  const assurance = criteriaMet >= 6 ? "Positive" : criteriaMet >= 4 ? "Promising" : criteriaMet > 0 ? "Preliminary" : "Not assessable";

  return {
    criteria,
    criteriaMet,
    threshold: 6,
    legacyScore: recordedLegacyScore(input),
    scoreBasis: recorded === undefined ? "evidence-aligned" : "recorded",
    outlook,
    assurance,
  };
}
