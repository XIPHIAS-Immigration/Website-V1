import type { AnswerMap, Result } from "@/lib/eligibility/types";

export function scoreCorporate(answers: AnswerMap): Result {
  const a = answers ?? {};
  const objective = String(a["objective"] ?? "");
  const kycReady = yn(a["compliance_ready"] ?? "yes");
  const pep = yn(a["pep_or_sanctions"] ?? "no");

  if (pep === "yes") {
    return {
      tier: "Not Yet Eligible",
      summary: "PEP/sanctions flags require enhanced due diligence; options may be limited.",
      programs: [{ name: "Enhanced KYC Advisory", why: "Pre-clearance and risk mapping" }],
    };
  }
  if (kycReady === "no") {
    return {
      tier: "Not Yet Eligible",
      summary: "Prepare director/shareholder KYC before proceeding with any corporate pathway.",
      programs: [{ name: "KYC/AML Readiness Pack", why: "Gather and validate documents" }],
    };
  }

  if (objective === "sponsor") {
    return {
      tier: "Eligible",
      summary: "Employer-sponsored/global mobility options available.",
      programs: [
        { name: "Intra-Company Transfer", why: "Relocate key staff efficiently" },
        { name: "UAE Work Permits / Establishment Card", why: "Enable visa quota and processing" },
      ],
    };
  }

  if (objective === "entity") {
    return {
      tier: "Borderline",
      summary: "Entity setup plus visa privileges may be required; let’s scope your needs.",
      programs: [
        { name: "Entity + Bank + Visas", why: "Combine setup with sponsorship capability" },
      ],
    };
  }

  // EOR or unspecified → soft recommendation
  return {
    tier: "Borderline",
    summary: "If you don’t need your own entity, EOR can hire staff quickly and compliantly.",
    programs: [{ name: "EOR / Global Payroll", why: "Hire abroad without local entity" }],
  };
}

/* utils */
function yn(v: unknown): "yes" | "no" {
  if (v === true || v === "yes") return "yes";
  if (v === false || v === "no") return "no";
  return "yes";
}
