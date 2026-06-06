import type { Question, AnswerMap } from "@/lib/eligibility/types";

/**
 * Corporate assessment (2025)
 * Goals covered:
 *  - Open an entity (company setup)
 *  - Sponsor visas / relocate staff
 *  - Remote hub / EOR (hire without local entity)
 *
 * Uses only the input types your UI supports and branches off prior answers.
 * Keys are chosen to be stable for scoring & analytics.
 */
export function questionsCorporate(_answers: AnswerMap): Question[] {
  const a = _answers || {};
  const companyType = (a["company_type"] as string) || "";
  const objective = (a["objective"] as string) || "";
  const target = (a["target_region"] as string) || (a["jurisdiction"] as string) || ""; // legacy compat

  const qs: Question[] = [
    {
      key: "company_type",
      prompt: "What best describes you?",
      type: "radio",
      options: [
        { label: "Startup / Founder", value: "startup" },
        { label: "SME", value: "sme" },
        { label: "Enterprise / HR", value: "enterprise" },
      ],
    },
    {
      key: "objective",
      prompt: "Main objective?",
      type: "radio",
      options: [
        { label: "Open an entity", value: "entity" },
        { label: "Sponsor visas / relocate staff", value: "sponsor" },
        { label: "Remote hub / EOR (hire without entity)", value: "eor" },
      ],
    },
    {
      key: "target_region",
      prompt: "Preferred jurisdiction / region",
      type: "radio",
      options: [
        { label: "UAE (free zone / mainland)", value: "uae" },
        { label: "Singapore", value: "sg" },
        { label: "UK / EU", value: "ukeu" },
        { label: "North America (US / Canada)", value: "na" },
        { label: "No preference / explore options", value: "any" },
      ],
    },
  ];

  /* ----------------------------- ENTITY SETUP ----------------------------- */
  if (objective === "entity") {
    qs.push(
      {
        key: "activity_type",
        prompt: "Primary business activity",
        type: "select",
        options: [
          { label: "Technology / SaaS / Consulting", value: "tech" },
          { label: "Trading / General commerce", value: "trading" },
          { label: "Financial services / Fintech", value: "fintech" },
          { label: "Holding company / IP holding", value: "holding" },
          { label: "Professional services (legal, accounting, studio, etc.)", value: "professional" },
          { label: "Other / mixed", value: "other" },
        ],
      },
      {
        key: "local_presence",
        prompt: "Do you need physical presence (office lease / staff in-country) in year 1?",
        type: "yesno",
      },
      {
        key: "banking_need",
        prompt: "Banking requirement",
        type: "radio",
        options: [
          { label: "Local bank account required", value: "local_bank" },
          { label: "EMI/fintech account is OK", value: "emi_ok" },
          { label: "No banking needed initially", value: "no_bank" },
        ],
      },
      {
        key: "shareholder_mix",
        prompt: "Shareholder/ownership profile",
        type: "select",
        options: [
          { label: "100% foreign ownership", value: "100_foreign" },
          { label: "Local partner acceptable / required", value: "local_partner" },
          { label: "Branch / subsidiary of existing company", value: "subsidiary" },
        ],
      },
      {
        key: "team_year1",
        prompt: "Planned local headcount in Year 1",
        type: "select",
        options: [
          { label: "0–1 (director only)", value: "0-1" },
          { label: "2–5", value: "2-5" },
          { label: "6–20", value: "6-20" },
          { label: "20+", value: "20+" },
        ],
      },
      {
        key: "setup_budget_usd",
        prompt: "Approx. setup budget (USD)",
        type: "select",
        options: [
          { label: "Up to $5k", value: "0-5" },
          { label: "$5k–$15k", value: "5-15" },
          { label: "$15k–$40k", value: "15-40" },
          { label: "$40k+", value: "40+" },
        ],
      },
      {
        key: "setup_timeline",
        prompt: "Desired go-live timeline",
        type: "select",
        options: [
          { label: "Fast (2–4 weeks)", value: "2-4w" },
          { label: "4–8 weeks", value: "4-8w" },
          { label: "Flexible (8+ weeks)", value: "8w+" },
        ],
      }
    );

    // Region-specific clarifiers
    if (target === "uae") {
      qs.push({
        key: "uae_model",
        prompt: "UAE model preference",
        type: "radio",
        options: [
          { label: "Free zone (IFZA/RAKEZ/DMCC, etc.)", value: "free_zone" },
          { label: "Mainland (DED license)", value: "mainland" },
          { label: "Not sure, need advice", value: "unsure" },
        ],
      });
    }
    if (target === "sg") {
      qs.push({
        key: "sg_director",
        prompt: "Do you have a resident director (or need nominee services)?",
        type: "radio",
        options: [
          { label: "We have a resident director", value: "have" },
          { label: "Need nominee service", value: "need" },
          { label: "Not sure yet", value: "unsure" },
        ],
      });
    }
    if (target === "ukeu") {
      qs.push({
        key: "ukeu_country",
        prompt: "Preferred country in UK/EU",
        type: "select",
        options: [
          { label: "United Kingdom", value: "uk" },
          { label: "Germany", value: "de" },
          { label: "Netherlands", value: "nl" },
          { label: "Ireland", value: "ie" },
          { label: "Other EU", value: "other" },
        ],
      });
    }
    if (target === "na") {
      qs.push({
        key: "na_country",
        prompt: "United States or Canada?",
        type: "radio",
        options: [
          { label: "United States", value: "us" },
          { label: "Canada", value: "ca" },
          { label: "Either / compare", value: "either" },
        ],
      });
    }
  }

  /* ----------------------- SPONSOR VISAS / RELOCATION ----------------------- */
  if (objective === "sponsor") {
    qs.push(
      {
        key: "headcount",
        prompt: "How many people to relocate initially?",
        type: "select",
        options: [
          { label: "1–5", value: "1-5" },
          { label: "6–20", value: "6-20" },
          { label: "20+", value: "20+" },
        ],
      },
      {
        key: "roles_profile",
        prompt: "Typical roles to sponsor",
        type: "select",
        options: [
          { label: "Executives / founders", value: "exec" },
          { label: "Engineers / product / data", value: "eng" },
          { label: "Sales / operations / support", value: "ops" },
          { label: "Mixed", value: "mixed" },
        ],
      },
      {
        key: "candidates_degree",
        prompt: "Do candidates generally have university degrees?",
        type: "yesno",
      },
      {
        key: "dependents",
        prompt: "Include dependents (spouse/children)?",
        type: "yesno",
      },
      {
        key: "visa_timeline",
        prompt: "How soon should visas be issued?",
        type: "select",
        options: [
          { label: "ASAP (1–2 months)", value: "1-2m" },
          { label: "2–4 months", value: "2-4m" },
          { label: "Flexible (4+ months)", value: "4m+" },
        ],
      },
      {
        key: "have_local_entity",
        prompt: "Do you already have a local entity that can sponsor?",
        type: "radio",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No, need sponsorship route set up", value: "no" },
          { label: "Considering EOR as interim", value: "eor_interim" },
        ],
      }
    );

    // Region clarifiers for sponsorship rules
    if (target === "sg") {
      qs.push({
        key: "sg_salary_level",
        prompt: "Indicative fixed monthly salary per candidate (SGD)",
        type: "select",
        options: [
          { label: "≤ 5k", value: "<=5k" },
          { label: "5k–10k", value: "5-10k" },
          { label: "10k+", value: "10k+" },
        ],
      });
    }
    if (target === "ukeu") {
      qs.push({
        key: "uk_license",
        prompt: "Do you need a UK sponsor licence (Skilled Worker)?",
        type: "yesno",
      });
    }
    if (target === "na") {
      qs.push({
        key: "na_track",
        prompt: "Which path are you exploring?",
        type: "select",
        options: [
          { label: "US (L-1 / O-1 / H-1B-alt) ", value: "us" },
          { label: "Canada (Global Talent / LMIA-exempt)", value: "ca" },
          { label: "Both / compare", value: "both" },
        ],
      });
    }
    if (target === "uae") {
      qs.push({
        key: "uae_establishment",
        prompt: "Do you hold (or plan) a UAE licence to enable work permits?",
        type: "yesno",
      });
    }
  }

  /* --------------------------- REMOTE HUB / EOR ---------------------------- */
  if (objective === "eor") {
    qs.push(
      {
        key: "hire_countries",
        prompt: "Which countries will you hire in? (list, comma separated)",
        type: "text",
      },
      {
        key: "eor_headcount",
        prompt: "Expected headcount via EOR in 12 months",
        type: "select",
        options: [
          { label: "1–5", value: "1-5" },
          { label: "6–20", value: "6-20" },
          { label: "20+", value: "20+" },
        ],
      },
      {
        key: "payroll_currency",
        prompt: "Payroll currency preference",
        type: "radio",
        options: [
          { label: "Local currency per country", value: "local" },
          { label: "USD / EUR where permitted", value: "fx" },
          { label: "No preference", value: "any" },
        ],
      },
      {
        key: "benefits_required",
        prompt: "Do you require statutory + private benefits packages?",
        type: "yesno",
      },
      {
        key: "stock_options",
        prompt: "Will you issue equity/stock options to EOR hires?",
        type: "yesno",
      },
      {
        key: "eor_timeline",
        prompt: "Go-live timeline for first hires",
        type: "select",
        options: [
          { label: "ASAP (1–2 weeks)", value: "1-2w" },
          { label: "2–6 weeks", value: "2-6w" },
          { label: "Flexible (6+ weeks)", value: "6w+" },
        ],
      }
    );
  }

  /* ------------------------------- COMMON ------------------------------- */
  qs.push(
    {
      key: "company_exists",
      prompt: "Do you already have a parent company?",
      type: "radio",
      options: [
        { label: "Yes (existing legal entity)", value: "yes" },
        { label: "No (greenfield)", value: "no" },
      ],
    },
    {
      key: "compliance_ready",
      prompt: "Are you ready for KYC/AML and director/shareholder KYC?",
      type: "yesno",
    },
    {
      key: "pep_or_sanctions",
      prompt: "Any shareholders/directors are PEPs or on sanctions/watchlists?",
      type: "yesno",
    },
    {
      key: "overall_budget_usd",
      prompt: "Overall budget for this initiative (USD)",
      type: "select",
      options: [
        { label: "Up to $10k", value: "0-10" },
        { label: "$10k–$50k", value: "10-50" },
        { label: "$50k–$150k", value: "50-150" },
        { label: "$150k+", value: "150+" },
      ],
    }
  );

  // Small copy tweak for enterprise tone (no logic change)
  if (companyType === "enterprise") {
    qs.push({
      key: "enterprise_procurement",
      prompt: "Do you require vendor onboarding / procurement compliance?",
      type: "yesno",
    });
  }

  return qs;
}
