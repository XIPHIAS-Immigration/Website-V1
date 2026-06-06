import type { AnswerMap, Result } from "@/lib/eligibility/types";

export function scoreCitizenship(answers: AnswerMap): Result {
  const a = answers ?? {};
  const route = String(a["route"] ?? "");
  const clean = yn(a["clean_record"]);
  const inv = String(a["investment"] ?? a["budget_usd"] ?? "");

  if (clean === "no") {
    return {
      tier: "Not Yet Eligible",
      summary: "Background concerns can block most citizenship routes. A legal review is required.",
      programs: [
        { name: "Residency → Naturalization", why: "Often more flexible on screening" },
        { name: "Work/Business Residence", why: "Alternative path while issues are assessed" },
      ],
    };
  }

  // Citizenship by descent
  if (a["ancestry"] === true || String(a["ancestry"]) === "yes") {
    return {
      tier: "Eligible",
      summary: "You may qualify for citizenship by descent—subject to documents and lineage rules.",
      programs: [
        { name: "Italy (Jure Sanguinis)", why: "Multi-generation potential if unbroken line" },
        { name: "Ireland (Foreign Births Register)", why: "Grandparent route common" },
      ],
    };
  }

  // Citizenship by investment (coarse)
  if (route === "cbi") {
    if (inv === "400-1000" || inv === "500-1000" || inv === "1000+") {
      return {
        tier: "Eligible",
        summary: "Your budget fits mainstream citizenship-by-investment options.",
        programs: [
          { name: "Malta (Residence → Exceptional Services)", why: "Meets capital expectations" },
          { name: "Caribbean CBI", why: "Streamlined due diligence; 3–6 months typical" },
        ],
      };
    }
    if (inv === "150-250" || inv === "250-400" || inv === "250-500") {
      return {
        tier: "Borderline",
        summary:
          "Budget may fit some Caribbean family configurations. Exact costs vary by family size and fees.",
        programs: [
          { name: "Caribbean CBI (selected)", why: "Check donation tiers vs. family size" },
          { name: "Residency by Investment", why: "Lower thresholds; later naturalization" },
        ],
      };
    }
    return {
      tier: "Not Yet Eligible",
      summary:
        "Budget appears below common citizenship-by-investment thresholds. Consider residency-first routes.",
      programs: [{ name: "Residency → Naturalization", why: "Acquire residency then apply later" }],
    };
  }

  // Naturalization (residency-first)
  return {
    tier: "Borderline",
    summary:
      "Naturalization is typically possible after years of residence, language and presence requirements.",
    programs: [
      { name: "Work/Skilled Residence → Citizenship", why: "Employer route builds residence time" },
      { name: "Entrepreneur/Investor Residence → Citizenship", why: "Economic contribution route" },
    ],
  };
}

/* utils */
function yn(v: unknown): "yes" | "no" {
  if (v === true || v === "yes") return "yes";
  if (v === false || v === "no") return "no";
  return "yes"; // if unknown, be permissive here
}
