import type { Question, AnswerMap } from "@/lib/eligibility/types";

/**
 * Citizenship assessment (2025-ready)
 * - Routes covered: CBI (investment), Descent (ancestry), Naturalization.
 * - Keeps to simple input types your UI already supports: radio, select, yesno, text.
 * - Uses conditional branching driven by prior answers.
 *
 * Notes (2025 reality):
 * • Direct “Citizenship by Investment” today is mainly Caribbean (+ Vanuatu). Malta’s route
 *   is residence + exceptional services (12–36 months), not a same-day CBI purchase.
 * • Strong ancestry programs: Ireland, Italy, Poland, Lithuania, Germany, Romania, Portugal
 *   (Sephardic route now narrowly limited/ended in many cases), plus a few niche cases.
 * • Naturalization generally needs residence time + language (+ basic civics) + clean record.
 */
export function questionsCitizenship(_answers: AnswerMap): Question[] {
  const a = _answers || {};
  const route = (a["route"] as string) || "";

  const qs: Question[] = [
    {
      key: "route",
      prompt: "Which route interests you most?",
      type: "radio",
      options: [
        { label: "By Investment (CBI / fast track)", value: "cbi" },
        { label: "By Descent (ancestry)", value: "descent" },
        { label: "Naturalization (residency → passport)", value: "naturalization" },
      ],
    },
  ];

  /* --------------------- Route: Citizenship by Investment --------------------- */
  if (route === "cbi") {
    qs.push(
      {
        key: "preferred_region",
        prompt: "Any region preference?",
        type: "radio",
        options: [
          { label: "Caribbean (Dominica, St. Lucia, Antigua, Grenada, St. Kitts & Nevis)", value: "caribbean" },
          { label: "Europe (Malta via residence & exceptional services)", value: "europe" },
          { label: "No preference", value: "any" },
        ],
      },
      {
        key: "budget_usd",
        prompt: "Total budget (USD) for the process?",
        type: "select",
        options: [
          { label: "US$100k–150k", value: "100-150" },
          { label: "US$150k–250k", value: "150-250" },
          { label: "US$250k–400k", value: "250-400" },
          { label: "US$400k–1M", value: "400-1000" },
          { label: "US$1M+", value: "1000+" },
        ],
      },
      {
        key: "family_included",
        prompt: "Do you need to include spouse/children or parents in one application?",
        type: "yesno",
      },
      {
        key: "timeline",
        prompt: "How soon do you need the passport?",
        type: "select",
        options: [
          { label: "As fast as possible (3–6 months)", value: "3-6" },
          { label: "6–9 months is fine", value: "6-9" },
          { label: "12+ months", value: "12+" },
        ],
      },
      {
        key: "pep_or_sanctions",
        prompt: "Are you a PEP (Politically Exposed Person) or subject to sanctions/watchlists?",
        type: "yesno",
      }
    );
  }

  /* -------------------------- Route: Descent / Ancestry ----------------------- */
  if (route === "descent") {
    qs.push(
      {
        key: "ancestor_relation",
        prompt: "Which ancestor held the citizenship?",
        type: "radio",
        options: [
          { label: "Parent", value: "parent" },
          { label: "Grandparent", value: "grandparent" },
          { label: "Great-grandparent (or earlier)", value: "great_grandparent" },
          { label: "Not sure", value: "unknown" },
        ],
      },
      {
        key: "ancestor_country",
        prompt: "Ancestor’s country (most likely options shown)",
        type: "select",
        options: [
          { label: "Ireland", value: "ie" },
          { label: "Italy", value: "it" },
          { label: "Poland", value: "pl" },
          { label: "Lithuania", value: "lt" },
          { label: "Germany", value: "de" },
          { label: "Romania", value: "ro" },
          { label: "Portugal", value: "pt" },
          { label: "Other / not listed", value: "other" },
        ],
      },
      {
        key: "unbroken_lineage",
        prompt: "Was the lineage unbroken (no renunciation & citizenship passed to each generation)?",
        type: "yesno",
      },
      {
        key: "docs_available",
        prompt: "Can you obtain civil records (birth/marriage/death) for each generation?",
        type: "yesno",
      },
      {
        key: "name_changes",
        prompt: "Were there name changes or different spellings in the lineage?",
        type: "yesno",
      }
    );
  }

  /* ----------------------- Route: Naturalization (Residency) ------------------ */
  if (route === "naturalization") {
    qs.push(
      {
        key: "willing_to_relocate",
        prompt: "Are you willing to relocate and maintain residence for a few years?",
        type: "yesno",
      },
      {
        key: "annual_presence",
        prompt: "How many days per year can you realistically spend in the country?",
        type: "select",
        options: [
          { label: "Few short visits (<60 days/year)", value: "<60" },
          { label: "Moderate presence (60–183 days/year)", value: "60-183" },
          { label: "Most of the year (≥183 days/year)", value: "183+" },
        ],
      },
      {
        key: "language_level",
        prompt: "Language ability (best self-assessment)",
        type: "select",
        options: [
          { label: "Beginner (A1–A2)", value: "A1-A2" },
          { label: "Intermediate (B1)", value: "B1" },
          { label: "Upper-intermediate (B2)", value: "B2" },
          { label: "Advanced/Fluent (C1+)", value: "C1+" },
        ],
      },
      {
        key: "economic_basis",
        prompt: "Main basis to qualify for residence?",
        type: "radio",
        options: [
          { label: "Skilled work / job offer", value: "work" },
          { label: "Own business / entrepreneurship", value: "business" },
          { label: "Study", value: "study" },
          { label: "Retirement / self-sufficient", value: "retiree" },
          { label: "Family reunification (spouse/partner/parent)", value: "family" },
          { label: "Other / not sure", value: "other" },
        ],
      },
      {
        key: "target_region",
        prompt: "Preferred region for residence → citizenship",
        type: "radio",
        options: [
          { label: "European Union / EEA", value: "eu" },
          { label: "Americas", value: "americas" },
          { label: "Asia-Pacific", value: "apac" },
          { label: "Middle East & Africa", value: "mea" },
          { label: "No preference", value: "any" },
        ],
      }
    );
  }

  /* ------------------------------- Common checks ------------------------------ */
  qs.push(
    {
      key: "clean_record",
      prompt: "Do you have a clean background record?",
      type: "yesno",
    },
    {
      key: "nationality",
      prompt: "What is your current nationality?",
      type: "text",
    }
  );

  return qs;
}
