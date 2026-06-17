// src/lib/cost-estimator.ts
// -----------------------------------------------------------------------------
// Family-tailored cost model for the Cost Estimator tool.
//
// The BASE figure anchors on the already-parsed `investmentUsd` coming from
// src/lib/programme-explorer.ts (the source of truth) — we never re-parse the
// catalog here. Everything else (government/application fees, due diligence,
// per-dependent add-ons, professional service fee) is NOT present in the data,
// so it lives here as a small, DOCUMENTED, INDICATIVE model keyed by track,
// with optional per-program overrides keyed by the ProgrammeExplorerItem `id`.
//
// ⚠️ All figures below are INDICATIVE planning placeholders — they are not
// government-sourced schedules and must be verified by a XIPHIAS advisor.
// Pure module (type-only imports) so the client can recompute reactively.
// -----------------------------------------------------------------------------

import type { Vertical } from "@/lib/content/types";

export const COST_DISCLAIMER =
  "Indicative only — figures vary by case, route, dependants and current government schedules. Advisor review required before any decision.";

/** The minimal program shape the estimator needs (passed from the server page). */
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

type TrackCostModel = {
  /** Government/application fees expressed as a fraction of the investment anchor. */
  govtFeePctOfInvestment: number;
  /** Floor for government fees when there is little/no investment (e.g. skilled). */
  govtFeeFloorUsd: number;
  /** Due-diligence / background-check cost charged per applicant (main + each dependant). */
  dueDiligencePerApplicantUsd: number;
  /** XIPHIAS professional service fee (indicative, flat). */
  serviceFeeUsd: number;
  /** Extra government add-ons charged per dependant. */
  perDependentAddOnUsd: number;
};

// Indicative, advisor-reviewed track defaults. Documented, not government-sourced.
const TRACK_MODEL: Record<Vertical, TrackCostModel> = {
  citizenship: {
    govtFeePctOfInvestment: 0.04,
    govtFeeFloorUsd: 6000,
    dueDiligencePerApplicantUsd: 7500,
    serviceFeeUsd: 25000,
    perDependentAddOnUsd: 15000,
  },
  residency: {
    govtFeePctOfInvestment: 0.03,
    govtFeeFloorUsd: 1500,
    dueDiligencePerApplicantUsd: 2000,
    serviceFeeUsd: 15000,
    perDependentAddOnUsd: 6000,
  },
  skilled: {
    govtFeePctOfInvestment: 0,
    govtFeeFloorUsd: 4000,
    dueDiligencePerApplicantUsd: 600,
    serviceFeeUsd: 6000,
    perDependentAddOnUsd: 2500,
  },
  corporate: {
    govtFeePctOfInvestment: 0.02,
    govtFeeFloorUsd: 3000,
    dueDiligencePerApplicantUsd: 1000,
    serviceFeeUsd: 9000,
    perDependentAddOnUsd: 3000,
  },
};

// Optional per-program overrides keyed by ProgrammeExplorerItem.id.
// Use sparingly for flagship programs where a track default is clearly off.
const PROGRAM_OVERRIDES: Record<string, Partial<TrackCostModel>> = {
  // e.g. "catalog:citizenship:grenada:gd-ntf": { serviceFeeUsd: 28000 },
};

function modelFor(program: CostProgram): TrackCostModel {
  const base = TRACK_MODEL[program.track] ?? TRACK_MODEL.residency;
  const override = PROGRAM_OVERRIDES[program.id];
  return override ? { ...base, ...override } : base;
}

export type CostLineItem = {
  key: string;
  label: string;
  amountUsd: number;
  note: string;
  /** Every figure here is indicative; kept explicit so the UI can flag it. */
  indicative: true;
};

export type CostBreakdown = {
  program: CostProgram;
  dependents: number;
  familySize: number;
  /** The investment anchor (may be 0 for points-based skilled routes). */
  baseUsd: number;
  lineItems: CostLineItem[];
  totalUsd: number;
  timelineMonths: number;
  timelineLabel: string;
};

function round(n: number) {
  return Math.max(0, Math.round(n));
}

/**
 * Build an itemized, family-tailored INDICATIVE cost breakdown for a program.
 * `dependents` = people in addition to the main applicant.
 */
export function estimateCost(program: CostProgram, dependents: number): CostBreakdown {
  const deps = Math.max(0, Math.min(8, Math.floor(dependents || 0)));
  const familySize = 1 + deps;
  const model = modelFor(program);
  const base = Math.max(0, program.investmentUsd || 0);

  const lineItems: CostLineItem[] = [];

  if (base > 0) {
    lineItems.push({
      key: "investment",
      label: "Qualifying investment / contribution",
      amountUsd: base,
      note: program.investmentLabel || "From the programme catalogue (indicative).",
      indicative: true,
    });
  }

  lineItems.push({
    key: "govt",
    label: "Government & application fees",
    amountUsd: round(Math.max(model.govtFeeFloorUsd, base * model.govtFeePctOfInvestment)),
    note: "Processing, application and issuance fees — schedule varies and changes often.",
    indicative: true,
  });

  lineItems.push({
    key: "due-diligence",
    label: `Due diligence & background checks (${familySize} ${familySize === 1 ? "applicant" : "applicants"})`,
    amountUsd: round(model.dueDiligencePerApplicantUsd * familySize),
    note: "Charged per applicant including dependants; mandatory on most investment routes.",
    indicative: true,
  });

  if (deps > 0) {
    lineItems.push({
      key: "dependents",
      label: `Dependant government add-ons (${deps})`,
      amountUsd: round(model.perDependentAddOnUsd * deps),
      note: "Additional government charges for a spouse and/or dependent children.",
      indicative: true,
    });
  }

  lineItems.push({
    key: "service",
    label: "XIPHIAS professional service fee",
    amountUsd: model.serviceFeeUsd,
    note: "End-to-end advisory, document readiness and filing support (indicative).",
    indicative: true,
  });

  const totalUsd = lineItems.reduce((sum, item) => sum + item.amountUsd, 0);

  return {
    program,
    dependents: deps,
    familySize,
    baseUsd: base,
    lineItems,
    totalUsd,
    timelineMonths: program.timelineMonths || 0,
    timelineLabel: program.timelineLabel || "Case dependent",
  };
}

/** Slim a ProgrammeExplorerItem-like object down to what the estimator needs. */
export function toCostProgram(item: {
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
}): CostProgram {
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
