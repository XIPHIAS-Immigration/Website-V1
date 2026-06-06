import type { Question, AnswerMap } from "@/lib/eligibility/types";

/**
 * Skilled migration assessment (2025)
 * - General points-style inputs (age, education, experience, English)
 * - Destination-aware follow-ups (Canada/Australia/UK/EU-NL-DE/NZ/SG/UAE)
 * - Job-offer branching (salary bands, sponsor license, etc.)
 * - Spouse/partner details that often affect points
 *
 * Uses only: radio | select | yesno | text | number
 * Keys are scoring-friendly and consistent across destinations.
 */
export function questionsSkilled(_answers: AnswerMap): Question[] {
  const a = _answers || {};
  const dest = (a["target_destination"] as string) || "any";
  const hasOffer = (a["job_offer"] as string) === "yes";

  const qs: Question[] = [];

  const pushUnique = (q: Question) => {
    if (!qs.some((x) => x.key === q.key)) qs.push(q);
  };

  /* ------------------------------ Core profile ------------------------------ */
  pushUnique({ key: "nationality", prompt: "What is your nationality?", type: "text" });

  pushUnique({
    key: "target_destination",
    prompt: "Preferred destination",
    type: "radio",
    options: [
      { label: "Canada", value: "ca" },
      { label: "Australia", value: "au" },
      { label: "United Kingdom", value: "uk" },
      { label: "EU (Germany / Netherlands / Ireland etc.)", value: "eu" },
      { label: "New Zealand", value: "nz" },
      { label: "Singapore", value: "sg" },
      { label: "UAE", value: "ae" },
      { label: "Open to suggestions", value: "any" },
    ],
  });

  pushUnique({
    key: "age",
    prompt: "What is your age?",
    type: "number",
    helper: "Age impacts most points-based systems.",
  });

  pushUnique({
    key: "education_level",
    prompt: "Highest education level?",
    type: "select",
    options: [
      { label: "High school / diploma", value: "hs" },
      { label: "Bachelor’s", value: "bachelor" },
      { label: "Master’s", value: "master" },
      { label: "Doctorate (PhD)", value: "phd" },
    ],
  });

  pushUnique({
    key: "field_of_study",
    prompt: "Field of study / occupation group",
    type: "select",
    options: [
      { label: "IT / Engineering / Data", value: "tech" },
      { label: "Healthcare / Life sciences", value: "health" },
      { label: "Finance / Business / Legal", value: "biz" },
      { label: "Education / Research", value: "edu" },
      { label: "Skilled trades (electrical, mechanical, etc.)", value: "trades" },
      { label: "Hospitality / Other", value: "other" },
    ],
  });

  pushUnique({
    key: "experience_years",
    prompt: "Years of skilled work experience",
    type: "select",
    options: [
      { label: "0–2", value: "0-2" },
      { label: "3–5", value: "3-5" },
      { label: "6–8", value: "6-8" },
      { label: "9+", value: "9+" },
    ],
  });

  pushUnique({
    key: "english_level",
    prompt: "English proficiency (self-assessment or test equivalent)",
    type: "select",
    options: [
      { label: "Basic (A2 / CLB 4–5)", value: "basic" },
      { label: "Intermediate (B1–B2 / CLB 6–8)", value: "intermediate" },
      { label: "Advanced (C1–C2 / CLB 9+)", value: "advanced" },
    ],
  });

  pushUnique({
    key: "job_offer",
    prompt: "Do you have a job offer in your target country?",
    type: "yesno",
  });

  /* -------------------------- Destination branches -------------------------- */

  // CANADA (Express Entry / PNP / CEC)
  if (dest === "ca") {
    pushUnique({
      key: "english_clb",
      prompt: "Approx. English level (CLB)",
      type: "select",
      options: [
        { label: "CLB 5 or below", value: "clb<=5" },
        { label: "CLB 6–8", value: "clb6-8" },
        { label: "CLB 9+", value: "clb9+" },
      ],
    });
    pushUnique({
      key: "french_level",
      prompt: "French ability (TEF/TCF equivalent)",
      type: "select",
      options: [
        { label: "None / A1–A2", value: "none-a2" },
        { label: "B1–B2", value: "b1-b2" },
        { label: "C1+", value: "c1+" },
      ],
    });
    pushUnique({
      key: "eca_ready",
      prompt: "Education Credential Assessment (ECA) ready?",
      type: "yesno",
    });
    if (!hasOffer) {
      pushUnique({
        key: "proof_of_funds_usd",
        prompt: "Proof of funds available (USD)",
        type: "select",
        options: [
          { label: "Below $15k", value: "<15" },
          { label: "$15k–$25k", value: "15-25" },
          { label: "$25k–$40k", value: "25-40" },
          { label: "$40k+", value: "40+" },
        ],
      });
    }
    pushUnique({
      key: "ca_province_interest",
      prompt: "Any province preference (for PNP)?",
      type: "select",
      options: [
        { label: "Ontario", value: "on" },
        { label: "British Columbia", value: "bc" },
        { label: "Alberta", value: "ab" },
        { label: "Atlantic (NS/NB/PEI/NL)", value: "atl" },
        { label: "Any / not sure", value: "any" },
      ],
    });
  }

  // AUSTRALIA (SkillSelect / State nomination)
  if (dest === "au") {
    pushUnique({
      key: "skills_assessment_ready",
      prompt: "Skills assessment ready (relevant assessing authority)?",
      type: "yesno",
    });
    pushUnique({
      key: "eng_test_taken",
      prompt: "English test taken (IELTS / PTE / TOEFL)?",
      type: "select",
      options: [
        { label: "IELTS", value: "ielts" },
        { label: "PTE Academic", value: "pte" },
        { label: "TOEFL iBT", value: "toefl" },
        { label: "Not yet", value: "notyet" },
      ],
    });
    pushUnique({
      key: "state_nomination_interest",
      prompt: "Open to state/territory nomination?",
      type: "yesno",
    });
  }

  // UNITED KINGDOM (Skilled Worker / Global Talent etc.)
  if (dest === "uk") {
    pushUnique({
      key: "uk_sponsor_license",
      prompt: "Is your employer a licensed sponsor (if job offer)?",
      type: "yesno",
    });
    if (hasOffer) {
      pushUnique({
        key: "uk_salary_band_gbp",
        prompt: "Annual salary offer (GBP)",
        type: "select",
        options: [
          { label: "< £26k", value: "<26" },
          { label: "£26k–£38k", value: "26-38" },
          { label: "£38k–£50k", value: "38-50" },
          { label: "£50k+", value: "50+" },
        ],
      });
    }
    pushUnique({
      key: "shortage_occupation",
      prompt: "Is your role on a recognised shortage/eligible list?",
      type: "yesno",
    });
  }

  // EU (Germany / Netherlands / Ireland etc.) – EU Blue Card / national routes
  if (dest === "eu") {
    pushUnique({
      key: "degree_recognized",
      prompt: "Is your degree internationally recognised/equivalent?",
      type: "yesno",
    });
    if (hasOffer) {
      pushUnique({
        key: "eu_salary_band_eur",
        prompt: "Annual salary offer (EUR)",
        type: "select",
        options: [
          { label: "< €40k", value: "<40" },
          { label: "€40k–€55k", value: "40-55" },
          { label: "€55k–€70k", value: "55-70" },
          { label: "€70k+", value: "70+" },
        ],
      });
    }
    pushUnique({
      key: "german_level",
      prompt: "German (or local language) ability",
      type: "select",
      options: [
        { label: "None / A1–A2", value: "a" },
        { label: "B1–B2", value: "b" },
        { label: "C1+", value: "c" },
      ],
    });
  }

  // NEW ZEALAND
  if (dest === "nz") {
    pushUnique({
      key: "nz_points_proxy",
      prompt: "Do you have any of: NZ qualification / registration / high-skill job?",
      type: "yesno",
    });
  }

  // SINGAPORE (EP / ONE Pass signals)
  if (dest === "sg") {
    if (hasOffer) {
      pushUnique({
        key: "sg_salary_monthly_sgd",
        prompt: "Fixed monthly salary offer (SGD)",
        type: "select",
        options: [
          { label: "≤ 5k", value: "<=5k" },
          { label: "5k–10k", value: "5-10k" },
          { label: "10k–15k", value: "10-15k" },
          { label: "15k+", value: "15k+" },
        ],
      });
    }
    pushUnique({
      key: "degree_tier",
      prompt: "Degree from a recognised university?",
      type: "yesno",
    });
  }

  // UAE (company-sponsored skilled worker)
  if (dest === "ae") {
    pushUnique({
      key: "uae_employer_license",
      prompt: "Will a UAE-licensed employer sponsor your work permit?",
      type: "yesno",
    });
  }

  /* ---------------------- Offer-dependent follow-ups ---------------------- */
  if (hasOffer) {
    pushUnique({
      key: "employer_size",
      prompt: "Employer size",
      type: "select",
      options: [
        { label: "Startup (≤ 50)", value: "startup" },
        { label: "SME (51–250)", value: "sme" },
        { label: "Enterprise (250+)", value: "enterprise" },
      ],
    });
    pushUnique({
      key: "offer_contract_type",
      prompt: "Contract type",
      type: "radio",
      options: [
        { label: "Full-time, permanent", value: "permanent" },
        { label: "Fixed-term", value: "fixed" },
        { label: "Contractor", value: "contractor" },
      ],
    });
  } else {
    pushUnique({
      key: "job_search_status",
      prompt: "Job search status",
      type: "select",
      options: [
        { label: "Actively interviewing", value: "active" },
        { label: "Just starting", value: "new" },
        { label: "Need employer introductions", value: "intros" },
      ],
    });
  }

  /* --------------------------- Regulated professions -------------------------- */
  pushUnique({
    key: "regulated_profession",
    prompt: "Is your occupation regulated (license/registration needed)?",
    type: "yesno",
  });

  /* ----------------------------- Spouse & family ----------------------------- */
  pushUnique({
    key: "spouse_accompanying",
    prompt: "Will a spouse/partner accompany you?",
    type: "yesno",
  });
  if ((a["spouse_accompanying"] as string) === "yes") {
    pushUnique({
      key: "spouse_education",
      prompt: "Spouse’s highest education",
      type: "select",
      options: [
        { label: "High school / diploma", value: "hs" },
        { label: "Bachelor’s", value: "bachelor" },
        { label: "Master’s", value: "master" },
        { label: "Doctorate (PhD)", value: "phd" },
      ],
    });
    pushUnique({
      key: "spouse_english_level",
      prompt: "Spouse English ability",
      type: "select",
      options: [
        { label: "Basic (A2)", value: "basic" },
        { label: "Intermediate (B1–B2)", value: "intermediate" },
        { label: "Advanced (C1+)", value: "advanced" },
      ],
    });
    pushUnique({
      key: "dependents_children",
      prompt: "Any dependent children?",
      type: "yesno",
    });
  }

  /* --------------------------------- Common --------------------------------- */
  pushUnique({
    key: "clean_record",
    prompt: "Do you have a clean background record?",
    type: "yesno",
  });

  pushUnique({
    key: "timeline",
    prompt: "When do you want to move?",
    type: "select",
    options: [
      { label: "1–3 months", value: "1-3" },
      { label: "3–6 months", value: "3-6" },
      { label: "6–12 months", value: "6-12" },
      { label: "12+ months / flexible", value: "12+" },
    ],
  });

  return qs;
}
