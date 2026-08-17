import type { Vertical } from "@/lib/content/types";

export const COST_DISCLAIMER =
  "Only amounts present in the programme catalogue are included. Government, due-diligence, dependant and professional fees remain Pending verification until a current programme-specific schedule is supplied.";

export type CostProgram = {
  id: string;
  title: string;
  country: string;
  countrySlug: string;
  track: Vertical;
  href: string;
  investmentUsd: number;
  investmentLabel: string;
  timelineMonths: number;
  timelineLabel: string;
};

export type CostLineItem = {
  key: string;
  label: string;
  amountUsd: number;
  note: string;
  indicative: true;
  includedInKnownTotal: boolean;
  status: "catalogue" | "pending-verification";
};

export type CostBreakdown = {
  program: CostProgram;
  dependents: number;
  familySize: number;
  baseUsd: number;
  lineItems: CostLineItem[];
  /** Sum of supplied catalogue amounts only; never a fabricated all-in total. */
  totalUsd: number;
  hasCompleteTotal: false;
  timelineMonths: number;
  timelineLabel: string;
};

export function estimateCost(program: CostProgram, dependents: number): CostBreakdown {
  const deps = Math.max(0, Math.min(8, Math.floor(dependents || 0)));
  const familySize = 1 + deps;
  const base = Math.max(0, program.investmentUsd || 0);
  const lineItems: CostLineItem[] = [];

  if (base > 0) {
    lineItems.push({
      key: "investment",
      label: "Qualifying investment / contribution",
      amountUsd: base,
      note: `${program.investmentLabel || "Programme catalogue amount"}; current amount and qualifying structure require verification.`,
      indicative: true,
      includedInKnownTotal: true,
      status: "catalogue",
    });
  }

  const pending = [
    ["govt", "Government and application fees", "Current authority schedule not supplied."],
    ["due-diligence", `Due diligence and background checks (${familySize} ${familySize === 1 ? "applicant" : "applicants"})`, "Applicant-specific schedule not supplied."],
    ["dependents", `Dependant fees (${deps})`, deps ? "Programme and age-specific dependant schedule not supplied." : "No dependants selected."],
    ["service", "XIPHIAS professional service fee", "A case-specific engagement fee has not been supplied."],
  ] as const;

  for (const [key, label, note] of pending) {
    lineItems.push({ key, label, amountUsd: 0, note, indicative: true, includedInKnownTotal: false, status: "pending-verification" });
  }

  return {
    program,
    dependents: deps,
    familySize,
    baseUsd: base,
    lineItems,
    totalUsd: base,
    hasCompleteTotal: false,
    timelineMonths: program.timelineMonths || 0,
    timelineLabel: program.timelineLabel || "Pending verification",
  };
}

export function toCostProgram(item: CostProgram): CostProgram {
  return {
    id: item.id,
    title: item.title,
    country: item.country,
    countrySlug: item.countrySlug,
    track: item.track,
    href: item.href,
    investmentUsd: item.investmentUsd,
    investmentLabel: item.investmentLabel,
    timelineMonths: item.timelineMonths,
    timelineLabel: item.timelineLabel,
  };
}
