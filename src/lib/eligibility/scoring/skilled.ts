import type { AnswerMap, Result } from "@/lib/eligibility/types";

export function scoreSkilled(answers: AnswerMap): Result {
  const a = answers ?? {};
  const dest = s(a["target_destination"] || "any");
  const offer = yn(a["job_offer"]);
  const age = num(a["age"]);
  const edu = s(a["education_level"]);
  const eng = s(a["english_level"]);
  const exp = s(a["experience_years"]);
  const clean = yn(a["clean_record"]);

  if (clean === "no") {
    return {
      tier: "Not Yet Eligible",
      summary: "Background concerns can block skilled routes; legal review required.",
      programs: [{ name: "Legal Review", why: "Assess admissibility and waivers" }],
    };
  }

  const baseline =
    age > 18 &&
    age <= 45 &&
    (edu === "bachelor" || edu === "master" || edu === "phd") &&
    (eng === "intermediate" || eng === "advanced") &&
    (exp === "3-5" || exp === "6-8" || exp === "9+");

  if (offer === "yes") {
    return {
      tier: "Eligible",
      summary: "With a job offer, you qualify for employer-sponsored routes in many destinations.",
      programs: suggestProgramsWithOffer(dest),
    };
  }

  switch (dest) {
    case "ca":
      return scoreCA(a, baseline);
    case "au":
      return scoreAU(a, baseline);
    case "uk":
      return scoreUK(a, baseline);
    case "eu":
      return scoreEU(a, baseline);
    case "sg":
      return scoreSG(baseline);
    case "nz":
      return scoreNZ(a, baseline);
    case "ae":
      return scoreAE(baseline);
    default:
      return {
        tier: baseline ? "Borderline" : "Not Yet Eligible",
        summary: baseline
          ? "You look competitive for skilled routes. Target a destination and secure an offer to proceed."
          : "Improve English, experience, or secure a job offer to strengthen eligibility.",
        programs: [
          { name: "Canada Express Entry / PNP", why: "Points-based pathways" },
          { name: "Australia SkillSelect", why: "EOI + state nomination options" },
          { name: "EU Blue Card (selected countries)", why: "High-skill residence with salary threshold" },
        ],
      };
  }
}

/* -------- per-destination (3-tier) -------- */

function scoreCA(a: AnswerMap, baseline: boolean): Result {
  const clb = s(a["english_clb"]);      // "clb<=5" | "clb6-8" | "clb9+"
  const eca = yn(a["eca_ready"]);        // yes|no
  const french = s(a["french_level"]);   // none-a2 | b1-b2 | c1+

  const strong = baseline && eca === "yes" && (clb === "clb9+" || french === "c1+");
  if (strong) {
    return {
      tier: "Eligible",
      summary: "Strong Express Entry profile (ECA ready + high CLB / French).",
      programs: [
        { name: "Express Entry (FSW/CEC)", why: "Language and ECA drive CRS" },
        { name: "Provincial Nominee Programs (PNP)", why: "Nomination boosts CRS" },
      ],
    };
  }

  if (baseline && (clb === "clb6-8" || clb === "clb9+")) {
    return {
      tier: "Borderline",
      summary: "Competitive for Express Entry/PNP; complete ECA and improve language for higher CRS.",
      programs: [{ name: "Express Entry / PNP", why: "Increase CRS to reach ITA" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Boost CLB, complete ECA, or secure a job offer/PNP to lift CRS.",
    programs: [{ name: "Employer-Sponsored Work Permit", why: "Alternative while improving CRS" }],
  };
}

function scoreAU(a: AnswerMap, baseline: boolean): Result {
  const skills = yn(a["skills_assessment_ready"]); // yes|no
  const engTest = s(a["eng_test_taken"]);          // ielts | pte | toefl | notyet

  if (baseline && skills === "yes" && engTest !== "notyet") {
    return {
      tier: "Eligible",
      summary: "Strong SkillSelect profile (skills assessment + English test).",
      programs: [{ name: "SkillSelect (189/190/491)", why: "Points + state nomination" }],
    };
  }

  if (baseline && (skills === "yes" || engTest !== "notyet")) {
    return {
      tier: "Borderline",
      summary: "Feasible; obtain skills assessment and complete English test to maximize points.",
      programs: [{ name: "SkillSelect (selected)", why: "Complete missing pieces for competitiveness" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Start with skills assessment, English test, or pursue employer sponsorship.",
    programs: [{ name: "Employer Sponsorship (TSS/ENS)", why: "Alternative route to PR later" }],
  };
}

function scoreUK(a: AnswerMap, baseline: boolean): Result {
  const shortage = yn(a["shortage_occupation"]); // yes|no
  if (shortage === "yes") {
    return {
      tier: "Eligible",
      summary: "Strong fit for Skilled Worker (shortage/eligible list).",
      programs: [{ name: "Skilled Worker (sponsor-backed)", why: "Main UK employer route" }],
    };
  }

  if (baseline) {
    return {
      tier: "Borderline",
      summary: "Competitive for Skilled Worker; focus on sponsor-backed offers.",
      programs: [{ name: "Skilled Worker", why: "Secure a licensed sponsor" }],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Skilled Worker typically requires a sponsor-backed offer or exceptional profile.",
    programs: [{ name: "Global Talent (if applicable)", why: "Endorsement-based alternative" }],
  };
}

function scoreEU(a: AnswerMap, baseline: boolean): Result {
  const degree = yn(a["degree_recognized"]); // yes|no
  if (baseline && degree === "yes") {
    return {
      tier: "Borderline",
      summary: "Potential for EU Blue Card or national skilled routes (with salary thresholds).",
      programs: [
        { name: "EU Blue Card", why: "Requires degree recognition + salary level" },
        { name: "National Skilled Routes", why: "Country-specific criteria" },
      ],
    };
  }

  return {
    tier: "Not Yet Eligible",
    summary: "Get degree recognition and a qualifying job offer to meet Blue Card thresholds.",
    programs: [{ name: "Employer-Sponsored Work Permit", why: "Pathway to Blue Card later" }],
  };
}

function scoreSG(baseline: boolean): Result {
  if (baseline) {
    return {
      tier: "Borderline",
      summary: "Competitive for Singapore EP; salary and university recognition influence outcome.",
      programs: [{ name: "Employment Pass (EP)", why: "COMPASS points framework" }],
    };
  }
  return {
    tier: "Not Yet Eligible",
    summary: "Strengthen profile (salary, degree recognition) or secure an offer first.",
    programs: [{ name: "Employer-Sponsored EP", why: "Offer + COMPASS points" }],
  };
}

function scoreNZ(a: AnswerMap, baseline: boolean): Result {
  const nzProxy = yn(a["nz_points_proxy"]); // yes|no
  if (baseline && nzProxy === "yes") {
    return {
      tier: "Borderline",
      summary: "Potential for Skilled Migrant; confirm points via job/qualification/registration.",
      programs: [{ name: "Skilled Migrant / Accredited Employer", why: "Points + employer routes" }],
    };
  }
  return {
    tier: "Not Yet Eligible",
    summary: "Secure job/registration or pursue an offer to strengthen eligibility.",
    programs: [{ name: "Accredited Employer Work Visa", why: "Employer accreditation + offer" }],
  };
}

function scoreAE(baseline: boolean): Result {
  if (baseline) {
    return {
      tier: "Borderline",
      summary: "UAE offers employer-sponsored residence for skilled workers; secure an offer.",
      programs: [{ name: "UAE Work Residence", why: "Company-sponsored permit" }],
    };
  }
  return {
    tier: "Not Yet Eligible",
    summary: "Focus on securing an employer in the UAE or consider other destinations.",
    programs: [{ name: "Job Search + Sponsorship", why: "Target UAE-licensed employers" }],
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
function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v || 0);
}
function suggestProgramsWithOffer(dest: string): Result["programs"] {
  switch (dest) {
    case "ca":
      return [
        { name: "Closed Work Permit → PR", why: "Employer-backed; transition to PR" },
        { name: "Express Entry + Job Offer", why: "CRS boost" },
      ];
    case "au":
      return [{ name: "TSS / ENS", why: "Employer routes → PR" }];
    case "uk":
      return [{ name: "Skilled Worker (sponsor-backed)", why: "Main UK employer route" }];
    case "eu":
      return [{ name: "EU Blue Card / National Work Permit", why: "Salary + degree thresholds" }];
    case "sg":
      return [{ name: "Employment Pass (EP)", why: "Offer + COMPASS points" }];
    case "nz":
      return [{ name: "Accredited Employer Work Visa", why: "Employer accreditation + offer" }];
    case "ae":
      return [{ name: "UAE Work Residence", why: "Company-sponsored permit" }];
    default:
      return [{ name: "Employer-Sponsored Work Visa", why: "Fastest skilled route with offer" }];
  }
}
