import type { AnswerMap, Result } from "@/lib/eligibility/types";

export function scoreResidency(answers: AnswerMap): Result {
  const a = answers ?? {};
  const clean = yn(a["clean_record"]);
  if (clean === "no") {
    return {
      tier: "Not Yet Eligible",
      summary: "Background concerns may restrict residency options; a case review is needed.",
      programs: [{ name: "Legal Review", why: "Assess admissibility and disclosures" }],
    };
  }

  const basis = s(a["basis"] || "unsure");
  const region = s(a["target_region"] || "any");
  const presence = s(a["presence_days"]);

  switch (basis) {
    case "investment":
      return scoreInvestment(a, region, presence);
    case "business":
      return scoreBusiness(a, region, presence);
    case "work":
      return scoreWork(a, region);
    case "remote":
      return scoreRemote(a, region);
    case "study":
      return scoreStudy(a, region);
    case "family":
      return scoreFamily(a);
    case "retiree":
      return scoreRetiree(a, region, presence);
    default:
      return {
        tier: "Borderline",
        summary:
          "Tell us how you prefer to qualify (investment, business, work, remote, study, family, retiree) for precise options.",
        programs: [
          { name: "Residency by Investment (EU/UAE/Americas)", why: "Capital-led options" },
          { name: "Employer-Sponsored Residence", why: "Job-based route" },
          { name: "Remote/Digital Nomad", why: "Income-based alternative" },
        ],
      };
  }
}

/* ----------------------------- Branch: Investment ----------------------------- */
function scoreInvestment(a: AnswerMap, region: string, presence: string): Result {
  const budget = s(a["investment_budget_usd"]);
  const level = rankInvest(budget); // "100-250","250-500","500-1000","1000-2000","2000+"
  const sof = yn(a["source_of_funds_ready"]);

  if (level >= rankInvest("500-1000") && sof === "yes") {
    const programs = [
      ...(region === "eu" || region === "any"
        ? [{ name: "EU Investor Residence", why: "Capital level fits fund/business routes" } as const]
        : []),
      ...(region === "me" || region === "any"
        ? [{ name: "UAE Investor Residence", why: "Property/company investment paths" } as const]
        : []),
      ...(region === "americas" || region === "any"
        ? [{ name: "Investor Residence (Americas)", why: "Multiple jurisdictions available" } as const]
        : []),
    ];
    return {
      tier: "Eligible",
      summary: "Your capital and documents support investor residency in several regions.",
      programs,
    };
  }

  if (level >= rankInvest("250-500") && sof === "yes") {
    return {
      tier: "Borderline",
      summary:
        "Investor residency may be feasible depending on the country and asset type. Some EU/UAE options exist.",
      programs: [
        { name: "EU/UAE Investor Residence", why: "Check exact thresholds and fees" },
        { name: "Entrepreneur/Business Residence", why: "Lower capital entry via job creation" },
      ],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary:
      "Capital appears below common investor thresholds. Consider business/remote routes or increasing budget.",
    programs: [
      { name: "Remote/Digital Nomad", why: "Low-capital alternative" },
      { name: "Employer-Sponsored Residence", why: "Qualify via employment" },
    ],
  };
}

/* ----------------------------- Branch: Business ----------------------------- */
function scoreBusiness(a: AnswerMap, region: string, presence: string): Result {
  const capital = s(a["business_capital_usd"]); // "0-25","25-100","100-250","250+"
  const hires = s(a["local_hires_year1"]);      // "0-1","2-5","6-20","20+"
  const directorRelocate = yn(a["director_relocate"]);

  if ((capital === "100-250" || capital === "250+") && (hires === "2-5" || hires === "6-20" || hires === "20+")) {
    return {
      tier: directorRelocate === "yes" ? "Eligible" : "Borderline",
      summary:
        directorRelocate === "yes"
          ? "Your planned capital and hiring support a business residence route."
          : "Business residence is feasible; confirm director presence to satisfy rules.",
      programs: [
        { name: "Entrepreneur/Innovator Residence", why: "Company formation + job creation" },
        ...(region === "me" || region === "any"
          ? [{ name: "UAE Company + Residence", why: "Fast setup; director/family visas" } as const]
          : []),
        ...(presence === "183+" ? [{ name: "Tax Planning", why: "High presence impacts taxation" } as const] : []),
      ],
    };
  }

  if (capital === "25-100") {
    return {
      tier: "Borderline",
      summary:
        "Business route might work with a lean plan and limited hiring. Some jurisdictions are flexible.",
      programs: [
        { name: "Founder/Startup Residence", why: "Innovation-led programs can fit lower capital" },
        { name: "UAE Company + Residence", why: "Pragmatic setup and visas" },
      ],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Capital looks light for compliant setup. Consider remote or employer-sponsored routes.",
    programs: [{ name: "Remote/Digital Nomad", why: "Lower cost of entry" }],
  };
}

/* ------------------------------- Branch: Work ------------------------------- */
function scoreWork(a: AnswerMap, region: string): Result {
  const offer = yn(a["job_offer"]);
  const edu = s(a["highest_education"]);
  if (offer === "yes") {
    const programs = [
      { name: "Employer-Sponsored Work Residence", why: "Job offer enables sponsorship" },
      ...(region === "eu" || region === "any"
        ? [{ name: "EU Blue Card (where eligible)", why: "High-skill track with salary/degree threshold" } as const]
        : []),
      ...(region === "sg" ? [{ name: "Singapore EP", why: "Points-style COMPASS assessment" } as const] : []),
      ...(region === "me" ? [{ name: "UAE Work Residence", why: "Company-sponsored permits" } as const] : []),
    ];
    return {
      tier: "Eligible",
      summary: "With a job offer, employer-sponsored residence is viable.",
      programs,
    };
  }

  if (edu === "bachelor" || edu === "master" || edu === "phd") {
    return {
      tier: "Borderline",
      summary: "You’re competitive for skilled routes; securing a job offer unlocks residence.",
      programs: [{ name: "Job Search + Sponsorship", why: "Target sponsor-capable employers" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Without an offer or degree, focus on job search, upskilling or alternative routes.",
    programs: [{ name: "Remote/Digital Nomad", why: "Alternative while building profile" }],
  };
}

/* ----------------------------- Branch: Remote ------------------------------ */
function scoreRemote(a: AnswerMap, region: string): Result {
  const income = s(a["monthly_income_usd"]); // "<1500","1500-3000","3000-5000","5000-8000","8000+"
  const level = rankIncome(income);

  if (level >= 3) {
    const programs = [
      { name: "Digital Nomad / Remote Worker Visas", why: "Income-based residence without local employment" },
      ...(region === "eu" || region === "any"
        ? [{ name: "EU Remote Programs", why: "Multiple EU/EEA states offer remote stays" } as const]
        : []),
      ...(region === "caribbean"
        ? [{ name: "Caribbean Remote Programs", why: "Attractive climate & tax regimes" } as const]
        : []),
    ];
    return {
      tier: "Eligible",
      summary: "Your income supports remote-worker residence in several countries.",
      programs,
    };
  }

  if (level >= 2) {
    return {
      tier: "Borderline",
      summary: "Remote-worker routes may be feasible; confirm specific income thresholds.",
      programs: [{ name: "Remote Worker Visas (selected)", why: "Thresholds vary by country" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Income looks below common thresholds; consider employer-sponsored or study routes.",
    programs: [{ name: "Employer-Sponsored Residence", why: "Qualify via employment" }],
  };
}

/* ------------------------------ Branch: Study ------------------------------ */
function scoreStudy(a: AnswerMap, region: string): Result {
  const budget = s(a["budget_tuition_year_usd"]); // "0-10","10-25","25-40","40+"
  const lang = yn(a["language_test_ready"]);
  const tuitionLevel = rankTuition(budget);

  if (tuitionLevel >= 2 && lang === "yes") {
    const programs = [
      { name: "Student Residence", why: "Enrollment-based residence with study rights" },
      { name: "Post-Study Work (where available)", why: "Transition to work/PR" },
      ...(region === "eu" || region === "any"
        ? [{ name: "EU Study Routes", why: "Wide program availability" } as const]
        : []),
    ];
    return {
      tier: "Eligible",
      summary: "Your budget and language readiness support study residence with post-study options.",
      programs,
    };
  }

  if (tuitionLevel >= 1) {
    return {
      tier: "Borderline",
      summary: "Study residence looks feasible; confirm language & admissions timelines.",
      programs: [{ name: "Student Residence (selected)", why: "Costs vary by country and program" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Budget looks tight; consider scholarships, lower-cost countries, or alternative routes.",
    programs: [{ name: "Remote/Digital Nomad", why: "Lower upfront costs" }],
  };
}

/* ------------------------------ Branch: Family ----------------------------- */
function scoreFamily(a: AnswerMap): Result {
  const relation = s(a["relationship"]);
  const status = s(a["sponsor_status"]); // citizen | pr | temp | unsure

  if (status === "citizen" || status === "pr") {
    return {
      tier: "Eligible",
      summary: "Family reunification looks viable; prepare relationship and support documents.",
      programs: [{ name: "Family Reunion Residence", why: "Resident/citizen sponsor enables residence" }],
    };
  }

  if (relation && status) {
    return {
      tier: "Borderline",
      summary: "Family route may work depending on sponsor status and proofs.",
      programs: [{ name: "Family Reunion Residence (selected)", why: "Eligibility varies by country" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Need sponsor status and relationship proof to assess family route.",
    programs: [{ name: "Document Checklist", why: "Gather civil and financial proofs" }],
  };
}

/* ------------------------------ Branch: Retiree ---------------------------- */
function scoreRetiree(a: AnswerMap, region: string, presence: string): Result {
  const income = s(a["passive_income_monthly_usd"]); // "<1500","1500-3000","3000-5000","5000+"
  const savings = s(a["savings_usd"]);               // "0-50","50-150","150-300","300+"
  const ins = yn(a["health_insurance"]);

  const okIncome = rankIncome(income) >= 3;
  const okSavings = rankSavings(savings) >= 2;

  if (okIncome && okSavings && ins === "yes") {
    const programs = [
      { name: "Retirement Residence", why: "Income/savings-based permits" },
      ...(region === "apac" ? [{ name: "SE Asia Retirement", why: "Popular and cost-effective" } as const] : []),
      ...(presence === "183+" ? [{ name: "Tax Residence Planning", why: "High presence impacts taxation" } as const] : []),
    ];
    return {
      tier: "Eligible",
      summary: "Income, savings and insurance support retirement residence options.",
      programs,
    };
  }

  if (rankIncome(income) >= 2) {
    return {
      tier: "Borderline",
      summary: "Retirement residence may be feasible; align proofs and medical insurance.",
      programs: [{ name: "Retirement Residence (selected)", why: "Thresholds vary by country" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Income looks low for many retirement visas; explore remote or family routes.",
    programs: [{ name: "Remote/Digital Nomad", why: "Lower income thresholds in some countries" }],
  };
}

/* helpers */
function s(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function yn(v: unknown): "yes" | "no" {
  if (v === true || v === "yes") return "yes";
  if (v === false || v === "no") return "no";
  return "no";
}
function rankInvest(v: string): number {
  const order = ["100-250", "250-500", "500-1000", "1000-2000", "2000+"];
  const i = order.indexOf(v);
  return i >= 0 ? i : 0;
}
function rankIncome(v: string): number {
  const order = ["<1500", "1500-3000", "3000-5000", "5000-8000", "8000+"];
  const i = order.indexOf(v);
  return i >= 0 ? i : 0;
}
function rankTuition(v: string): number {
  const order = ["0-10", "10-25", "25-40", "40+"];
  const i = order.indexOf(v);
  return i >= 0 ? i : 0;
}
function rankSavings(v: string): number {
  const order = ["0-50", "50-150", "150-300", "300+"];
  const i = order.indexOf(v);
  return i >= 0 ? i : 0;
}
