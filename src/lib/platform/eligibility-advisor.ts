import "server-only";

import { scoreAssessment } from "@/lib/eligibility/scoring";
import type { AnswerMap, Result, Track } from "@/lib/eligibility/types";
import { retrieveContent } from "./content-rag";

const ANSWER_COUNTRIES: Record<string, string> = {
  ae: "UAE",
  au: "Australia",
  bb: "Barbados",
  bh: "Bahrain",
  bs: "Bahamas",
  ca: "Canada",
  de: "Germany",
  eg: "Egypt",
  es: "Spain",
  gr: "Greece",
  ie: "Ireland",
  it: "Italy",
  ky: "Cayman Islands",
  lt: "Lithuania",
  mt: "Malta",
  mx: "Mexico",
  nl: "Netherlands",
  nz: "New Zealand",
  om: "Oman",
  pa: "Panama",
  pl: "Poland",
  pt: "Portugal",
  qa: "Qatar",
  ro: "Romania",
  sa: "Saudi Arabia",
  sg: "Singapore",
  th: "Thailand",
  uk: "United Kingdom",
  uae: "UAE",
  us: "United States",
};

const SKIP_VALUES = new Set([
  "",
  "any",
  "apac",
  "americas",
  "caribbean",
  "eu",
  "europe",
  "me",
  "mea",
  "na",
  "other",
  "ukeu",
  "unsure",
  "no preference",
  "not sure",
]);

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function labelForAnswer(value: unknown) {
  const raw = stringValue(value);
  if (!raw || SKIP_VALUES.has(raw.toLowerCase())) return "";
  return ANSWER_COUNTRIES[raw.toLowerCase()] ?? raw;
}

function inferCountry(track: Track, answers: AnswerMap) {
  const keysByTrack: Record<Track, string[]> = {
    residency: ["preferred_country"],
    citizenship: ["ancestor_country", "preferred_region"],
    corporate: ["target_region", "ukeu_country", "na_country"],
    skilled: ["target_destination"],
  };

  for (const key of keysByTrack[track]) {
    const label = labelForAnswer(answers[key]);
    if (!label) continue;
    return label;
  }

  return "";
}

function answersToQuery(track: Track, answers: AnswerMap, scored: Result, country: string) {
  const answerText = Object.entries(answers)
    .map(([key, value]) => `${key}: ${labelForAnswer(value) || stringValue(value)}`)
    .join(" ");
  return `${track} eligibility. ${country}. ${scored.tier}. ${scored.summary}. ${answerText}`;
}

export function getEligibilityAdvisory(track: Track, answers: AnswerMap): Result {
  const scored = scoreAssessment(track, answers);
  const country = inferCountry(track, answers);
  const retrieval = retrieveContent({
    query: answersToQuery(track, answers, scored, country),
    country,
    track,
    limit: 5,
  });

  const countryMissing = retrieval.hasCountryIntent && retrieval.exactCountryMatchCount === 0;

  if (countryMissing) {
    return {
      ...scored,
      summary: `${scored.summary} We could not find a dedicated ${retrieval.countryLabel ?? country} page in the current website content, so staff review is required before recommending alternatives.`,
      programs: [
        {
          name: `Staff review required for ${retrieval.countryLabel ?? country}`,
          country: retrieval.countryLabel ?? country,
          why: "No exact country/program page exists in the current content index. Add approved content or let an advisor shortlist options manually.",
          score: 55,
        },
      ],
      confidence: 55,
      countryFocus: retrieval.countryLabel ?? country,
      handoffRequired: true,
      criteria: [
        "Eligibility answers were scored with deterministic rules.",
        "Country-specific recommendations require an exact site content match.",
        "No unrelated country was substituted when the country page was missing.",
        "Advisor review is required before program advice is given.",
      ],
      sources: [{ label: "Eligibility scoring", href: "/eligibility" }],
    };
  }

  const contentPrograms = retrieval.chunks.map((chunk) => ({
    name: chunk.title,
    country: chunk.country,
    href: chunk.href,
    why: `${chunk.excerpt} Criteria: ${chunk.reasons.join(" ")}`,
    score: chunk.score,
  }));

  const programs = contentPrograms.length ? contentPrograms : scored.programs;
  const confidence = contentPrograms[0]?.score ?? (scored.tier === "Eligible" ? 78 : scored.tier === "Borderline" ? 64 : 48);

  return {
    ...scored,
    programs,
    confidence,
    countryFocus: (retrieval.countryLabel ?? country) || undefined,
    handoffRequired: scored.tier !== "Eligible" || confidence < 70,
    criteria: [
      "Eligibility answers were scored with deterministic rules.",
      "Approved site content is searched before generic catalog suggestions.",
      "Exact country/program matches are ranked first.",
      "Program rules, fees, and processing times still require advisor verification.",
    ],
    sources: [
      ...retrieval.chunks.map((chunk) => ({ label: chunk.title, href: chunk.href })),
      { label: "Eligibility scoring", href: "/eligibility" },
    ],
  };
}
