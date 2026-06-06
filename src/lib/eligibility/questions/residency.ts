import type { Question, AnswerMap } from "@/lib/eligibility/types";

/**
 * Residency assessment (2025)
 * - Collects region & country preferences
 * - Branches by basis: investment, business, work, remote, study, family, retiree
 * - Uses only: radio | select | yesno | text
 * - Keys chosen for stable scoring/analytics
 */
export function questionsResidency(_answers: AnswerMap): Question[] {
  const a = _answers || {};
  const region = (a["target_region"] as string) || "";
  const basis = (a["basis"] as string) || "";

  const qs: Question[] = [];

  const pushUnique = (q: Question) => {
    if (!qs.some((x) => x.key === q.key)) qs.push(q);
  };

  /* ------------------------------- Core prefs ------------------------------- */
  pushUnique({ key: "nationality", prompt: "What is your nationality?", type: "text" });

  pushUnique({
    key: "target_region",
    prompt: "Preferred region?",
    type: "radio",
    options: [
      { label: "EU / Schengen", value: "eu" },
      { label: "Middle East (GCC)", value: "me" },
      { label: "Caribbean", value: "caribbean" },
      { label: "Americas", value: "americas" },
      { label: "Asia-Pacific", value: "apac" },
      { label: "Open to suggestions", value: "any" },
    ],
  });

  // Region → country preference (lightweight; purely for routing recommendations)
  if (region === "eu") {
    pushUnique({
      key: "preferred_country",
      prompt: "Preferred country (EU/Schengen)",
      type: "select",
      options: [
        { label: "Portugal", value: "pt" },
        { label: "Spain", value: "es" },
        { label: "Greece", value: "gr" },
        { label: "Italy", value: "it" },
        { label: "Malta", value: "mt" },
        { label: "Other / not sure", value: "other" },
      ],
    });
  } else if (region === "me") {
    pushUnique({
      key: "preferred_country",
      prompt: "Preferred country (Middle East)",
      type: "select",
      options: [
        { label: "UAE", value: "ae" },
        { label: "Saudi Arabia", value: "sa" },
        { label: "Qatar", value: "qa" },
        { label: "Oman", value: "om" },
        { label: "Bahrain", value: "bh" },
        { label: "Other / not sure", value: "other" },
      ],
    });
  } else if (region === "americas") {
    pushUnique({
      key: "preferred_country",
      prompt: "Preferred country (Americas)",
      type: "select",
      options: [
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
        { label: "Mexico", value: "mx" },
        { label: "Panama", value: "pa" },
        { label: "Other / not sure", value: "other" },
      ],
    });
  } else if (region === "apac") {
    pushUnique({
      key: "preferred_country",
      prompt: "Preferred country (Asia-Pacific)",
      type: "select",
      options: [
        { label: "Singapore", value: "sg" },
        { label: "Malaysia", value: "my" },
        { label: "Thailand", value: "th" },
        { label: "Australia", value: "au" },
        { label: "Other / not sure", value: "other" },
      ],
    });
  } else if (region === "caribbean") {
    pushUnique({
      key: "preferred_country",
      prompt: "Preferred country (Caribbean)",
      type: "select",
      options: [
        { label: "Barbados", value: "bb" },
        { label: "Bahamas", value: "bs" },
        { label: "Cayman Islands", value: "ky" },
        { label: "Other / not sure", value: "other" },
      ],
    });
  }

  // Route to qualify for residency
  pushUnique({
    key: "basis",
    prompt: "How do you prefer to qualify for residency?",
    type: "radio",
    options: [
      { label: "Investment (property / fund / business, where eligible)", value: "investment" },
      { label: "Business / entrepreneur", value: "business" },
      { label: "Work (job offer / intra-company)", value: "work" },
      { label: "Remote worker / digital nomad", value: "remote" },
      { label: "Study", value: "study" },
      { label: "Family reunification", value: "family" },
      { label: "Retirement / self-sufficient", value: "retiree" },
      { label: "Not sure — recommend the best", value: "unsure" },
    ],
  });

  /* ----------------------------- Branch: Investment ----------------------------- */
  if (basis === "investment") {
    pushUnique({
      key: "investment_budget_usd",
      prompt: "Total investment budget (USD)",
      type: "select",
      options: [
        { label: "US$100k–250k", value: "100-250" },
        { label: "US$250k–500k", value: "250-500" },
        { label: "US$500k–1M", value: "500-1000" },
        { label: "US$1M–2M", value: "1000-2000" },
        { label: "US$2M+", value: "2000+" },
      ],
    });
    pushUnique({
      key: "asset_preference",
      prompt: "Any preference on investment type?",
      type: "radio",
      options: [
        { label: "Property (where eligible)", value: "property" },
        { label: "Fund / financial instruments", value: "fund" },
        { label: "Business / job-creation", value: "business" },
        { label: "No preference", value: "any" },
      ],
    });
    pushUnique({
      key: "source_of_funds_ready",
      prompt: "Are source-of-funds documents ready (bank statements, tax returns)?",
      type: "yesno",
    });
    pushUnique({
      key: "family_included",
      prompt: "Include spouse/children on the same application?",
      type: "yesno",
    });
    pushUnique({
      key: "presence_days",
      prompt: "How many days per year can you spend in the country?",
      type: "select",
      options: [
        { label: "< 60 days / year", value: "<60" },
        { label: "60–183 days / year", value: "60-183" },
        { label: "≥ 183 days / year", value: "183+" },
      ],
    });
    pushUnique({
      key: "timeline",
      prompt: "Desired timeline to obtain residence card",
      type: "select",
      options: [
        { label: "3–6 months", value: "3-6" },
        { label: "6–12 months", value: "6-12" },
        { label: "12–24 months", value: "12-24" },
        { label: "Flexible", value: "flex" },
      ],
    });
  }

  /* ---------------------------- Branch: Business ----------------------------- */
  if (basis === "business") {
    pushUnique({
      key: "business_sector",
      prompt: "Primary business activity",
      type: "select",
      options: [
        { label: "Technology / SaaS / Consulting", value: "tech" },
        { label: "Trading / General commerce", value: "trading" },
        { label: "Manufacturing / Industrial", value: "manufacturing" },
        { label: "Professional services", value: "professional" },
        { label: "Holding / IP", value: "holding" },
        { label: "Other / mixed", value: "other" },
      ],
    });
    pushUnique({
      key: "business_capital_usd",
      prompt: "Capital available for setup (USD)",
      type: "select",
      options: [
        { label: "Up to $25k", value: "0-25" },
        { label: "$25k–$100k", value: "25-100" },
        { label: "$100k–$250k", value: "100-250" },
        { label: "$250k+", value: "250+" },
      ],
    });
    pushUnique({
      key: "have_existing_company",
      prompt: "Do you already have a company that could be the parent?",
      type: "yesno",
    });
    pushUnique({
      key: "local_hires_year1",
      prompt: "Planned local headcount in Year 1",
      type: "select",
      options: [
        { label: "0–1 (director only)", value: "0-1" },
        { label: "2–5", value: "2-5" },
        { label: "6–20", value: "6-20" },
        { label: "20+", value: "20+" },
      ],
    });
    pushUnique({
      key: "director_relocate",
      prompt: "Will a founder/director relocate to satisfy presence if required?",
      type: "yesno",
    });
    pushUnique({
      key: "family_included",
      prompt: "Include spouse/children?",
      type: "yesno",
    });
    pushUnique({
      key: "timeline",
      prompt: "Desired go-live timeline",
      type: "select",
      options: [
        { label: "2–4 weeks", value: "2-4w" },
        { label: "4–8 weeks", value: "4-8w" },
        { label: "8+ weeks", value: "8w+" },
        { label: "Flexible", value: "flex" },
      ],
    });
  }

  /* ------------------------------ Branch: Work ------------------------------ */
  if (basis === "work") {
    pushUnique({
      key: "job_offer",
      prompt: "Do you already have a job offer or intra-company transfer?",
      type: "yesno",
    });
    pushUnique({
      key: "role_type",
      prompt: "Typical role",
      type: "select",
      options: [
        { label: "Executive / managerial", value: "exec" },
        { label: "Tech / engineering / product", value: "tech" },
        { label: "Operations / sales / support", value: "ops" },
        { label: "Other", value: "other" },
      ],
    });
    pushUnique({
      key: "highest_education",
      prompt: "Highest education",
      type: "select",
      options: [
        { label: "High school", value: "hs" },
        { label: "Bachelor’s", value: "bachelor" },
        { label: "Master’s", value: "master" },
        { label: "Doctorate", value: "phd" },
      ],
    });
    pushUnique({
      key: "experience_years",
      prompt: "Years of relevant experience",
      type: "select",
      options: [
        { label: "0–2", value: "0-2" },
        { label: "3–5", value: "3-5" },
        { label: "6–9", value: "6-9" },
        { label: "10+", value: "10+" },
      ],
    });
    pushUnique({
      key: "salary_band_usd",
      prompt: "Indicative annual salary (USD)",
      type: "select",
      options: [
        { label: "Below $40k", value: "<40" },
        { label: "$40k–$80k", value: "40-80" },
        { label: "$80k–$150k", value: "80-150" },
        { label: "$150k+", value: "150+" },
      ],
    });
    pushUnique({
      key: "family_included",
      prompt: "Include dependents (spouse/children)?",
      type: "yesno",
    });
    pushUnique({
      key: "timeline",
      prompt: "When do you need the work residence?",
      type: "select",
      options: [
        { label: "1–2 months", value: "1-2m" },
        { label: "2–4 months", value: "2-4m" },
        { label: "4+ months / flexible", value: "4m+" },
      ],
    });
  }

  /* --------------------------- Branch: Remote/Nomad --------------------------- */
  if (basis === "remote") {
    pushUnique({
      key: "monthly_income_usd",
      prompt: "Monthly remote income (USD)",
      type: "select",
      options: [
        { label: "Below $1,500", value: "<1500" },
        { label: "$1,500–$3,000", value: "1500-3000" },
        { label: "$3,000–$5,000", value: "3000-5000" },
        { label: "$5,000–$8,000", value: "5000-8000" },
        { label: "$8,000+", value: "8000+" },
      ],
    });
    pushUnique({
      key: "employment_type",
      prompt: "Your working arrangement",
      type: "radio",
      options: [
        { label: "Employee (foreign employer)", value: "employee" },
        { label: "Contractor / freelancer", value: "contractor" },
        { label: "Own company", value: "owner" },
      ],
    });
    pushUnique({
      key: "health_insurance",
      prompt: "Do you have international health insurance?",
      type: "yesno",
    });
    pushUnique({
      key: "family_included",
      prompt: "Include spouse/children?",
      type: "yesno",
    });
    pushUnique({
      key: "presence_days",
      prompt: "Expected presence per year",
      type: "select",
      options: [
        { label: "< 60 days / year", value: "<60" },
        { label: "60–183 days / year", value: "60-183" },
        { label: "≥ 183 days / year", value: "183+" },
      ],
    });
    pushUnique({
      key: "timeline",
      prompt: "Start date preference",
      type: "select",
      options: [
        { label: "ASAP (1–2 months)", value: "1-2m" },
        { label: "2–4 months", value: "2-4m" },
        { label: "Flexible (4+ months)", value: "4m+" },
      ],
    });
  }

  /* ------------------------------- Branch: Study ------------------------------ */
  if (basis === "study") {
    pushUnique({
      key: "study_level",
      prompt: "Planned level of study",
      type: "select",
      options: [
        { label: "Language / foundation", value: "foundation" },
        { label: "Bachelor’s", value: "bachelor" },
        { label: "Master’s", value: "master" },
        { label: "MBA / Specialized master", value: "mba" },
        { label: "PhD / Research", value: "phd" },
      ],
    });
    pushUnique({
      key: "budget_tuition_year_usd",
      prompt: "Budget for tuition per year (USD)",
      type: "select",
      options: [
        { label: "Up to $10k", value: "0-10" },
        { label: "$10k–$25k", value: "10-25" },
        { label: "$25k–$40k", value: "25-40" },
        { label: "$40k+", value: "40+" },
      ],
    });
    pushUnique({
      key: "language_test_ready",
      prompt: "Language test ready (IELTS/TOEFL or equivalent)?",
      type: "yesno",
    });
    pushUnique({
      key: "family_included",
      prompt: "Will dependents accompany you?",
      type: "yesno",
    });
    pushUnique({
      key: "timeline",
      prompt: "Intended intake / start timeline",
      type: "select",
      options: [
        { label: "Next 3–6 months", value: "3-6" },
        { label: "6–12 months", value: "6-12" },
        { label: "12+ months / flexible", value: "12+" },
      ],
    });
  }

  /* ------------------------------ Branch: Family ------------------------------ */
  if (basis === "family") {
    pushUnique({
      key: "relationship",
      prompt: "Your relationship to the sponsor",
      type: "select",
      options: [
        { label: "Spouse / partner", value: "spouse" },
        { label: "Parent", value: "parent" },
        { label: "Child", value: "child" },
        { label: "Other dependent", value: "other" },
      ],
    });
    pushUnique({
      key: "sponsor_status",
      prompt: "Sponsor’s status in target country",
      type: "radio",
      options: [
        { label: "Citizen", value: "citizen" },
        { label: "Permanent resident", value: "pr" },
        { label: "Temporary resident / worker / student", value: "temp" },
        { label: "Not sure", value: "unsure" },
      ],
    });
    if ((a["relationship"] as string) === "spouse") {
      pushUnique({
        key: "marriage_duration",
        prompt: "Marriage/partnership duration",
        type: "select",
        options: [
          { label: "< 1 year", value: "<1" },
          { label: "1–3 years", value: "1-3" },
          { label: "3+ years", value: "3+" },
        ],
      });
    }
    pushUnique({
      key: "timeline",
      prompt: "Desired timeline",
      type: "select",
      options: [
        { label: "3–6 months", value: "3-6" },
        { label: "6–12 months", value: "6-12" },
        { label: "12+ months / flexible", value: "12+" },
      ],
    });
  }

  /* ------------------------------ Branch: Retiree ----------------------------- */
  if (basis === "retiree") {
    pushUnique({
      key: "passive_income_monthly_usd",
      prompt: "Monthly passive income (USD)",
      type: "select",
      options: [
        { label: "Below $1,500", value: "<1500" },
        { label: "$1,500–$3,000", value: "1500-3000" },
        { label: "$3,000–$5,000", value: "3000-5000" },
        { label: "$5,000+", value: "5000+" },
      ],
    });
    pushUnique({
      key: "savings_usd",
      prompt: "Liquid savings available (USD)",
      type: "select",
      options: [
        { label: "Up to $50k", value: "0-50" },
        { label: "$50k–$150k", value: "50-150" },
        { label: "$150k–$300k", value: "150-300" },
        { label: "$300k+", value: "300+" },
      ],
    });
    pushUnique({
      key: "health_insurance",
      prompt: "Do you have private health insurance?",
      type: "yesno",
    });
    pushUnique({
      key: "presence_days",
      prompt: "Expected presence per year",
      type: "select",
      options: [
        { label: "< 60 days / year", value: "<60" },
        { label: "60–183 days / year", value: "60-183" },
        { label: "≥ 183 days / year", value: "183+" },
      ],
    });
    pushUnique({
      key: "family_included",
      prompt: "Include spouse?",
      type: "yesno",
    });
    pushUnique({
      key: "timeline",
      prompt: "Start timeline",
      type: "select",
      options: [
        { label: "3–6 months", value: "3-6" },
        { label: "6–12 months", value: "6-12" },
        { label: "12+ months / flexible", value: "12+" },
      ],
    });
  }

  /* --------------------------------- Common --------------------------------- */
  pushUnique({
    key: "clean_record",
    prompt: "Do you have a clean background record?",
    type: "yesno",
  });

  // If family_included wasn’t asked in the branch, ask once here.
  if (!qs.some((x) => x.key === "family_included")) {
    pushUnique({
      key: "family_included",
      prompt: "Applying with spouse/children?",
      type: "yesno",
    });
  }

  // If timeline wasn’t asked in the branch, ask once here.
  if (!qs.some((x) => x.key === "timeline")) {
    pushUnique({
      key: "timeline",
      prompt: "What is your timeline?",
      type: "select",
      options: [
        { label: "3–6 months", value: "3-6" },
        { label: "6–12 months", value: "6-12" },
        { label: "12–24 months", value: "12-24" },
        { label: "Flexible", value: "flex" },
      ],
    });
  }

  // If presence_days wasn’t asked in the branch, ask once here.
  if (!qs.some((x) => x.key === "presence_days")) {
    pushUnique({
      key: "presence_days",
      prompt: "How many days per year can you spend in the country?",
      type: "select",
      options: [
        { label: "< 60 days / year", value: "<60" },
        { label: "60–183 days / year", value: "60-183" },
        { label: "≥ 183 days / year", value: "183+" },
      ],
    });
  }

  return qs;
}
