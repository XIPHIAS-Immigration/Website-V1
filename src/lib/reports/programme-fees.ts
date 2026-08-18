import "server-only";

import type { Dossier, FeeCoverage, FeeRow } from "./programme";

type VerifiedProgrammeSchedule = {
  checkedAt: string;
  effectiveFrom?: string;
  rows: FeeRow[];
};

const HOME_AFFAIRS_189 = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189";
const HOME_AFFAIRS_190 = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190";

const VERIFIED_PROGRAMME_FEES: Record<string, VerifiedProgrammeSchedule> = {
  "australia/skilled-independent-189": {
    checkedAt: "2026-08-18",
    effectiveFrom: "2026-07-01",
    rows: [
      {
        category: "government",
        label: "Subclass 189 base visa application charge - main applicant (from)",
        amount: 6135,
        currency: "AUD",
        when: "At visa application",
        notes: "Base charge only. Family-member charges, concessions, payment surcharges and other case-specific costs are separate.",
        sourceLabel: "Australian Department of Home Affairs - Subclass 189",
        sourceUrl: HOME_AFFAIRS_189,
        effectiveFrom: "2026-07-01",
        checkedAt: "2026-08-18",
        status: "verified",
      },
    ],
  },
  "australia/skilled-nominated-190": {
    checkedAt: "2026-08-18",
    effectiveFrom: "2026-07-01",
    rows: [
      {
        category: "government",
        label: "Subclass 190 base visa application charge - main applicant",
        amount: 6140,
        currency: "AUD",
        when: "At visa application",
        notes: "Base charge only. Family-member charges, concessions, payment surcharges and other case-specific costs are separate.",
        sourceLabel: "Australian Department of Home Affairs - Subclass 190",
        sourceUrl: HOME_AFFAIRS_190,
        effectiveFrom: "2026-07-01",
        checkedAt: "2026-08-18",
        status: "verified",
      },
      {
        category: "government",
        label: "Subclass 190 second instalment - family member without functional English (if requested)",
        amount: 4885,
        currency: "AUD",
        when: "Only if requested before grant",
        notes: "Conditional charge; it is not payable in every application and must not be added automatically.",
        sourceLabel: "Australian Department of Home Affairs - Subclass 190",
        sourceUrl: HOME_AFFAIRS_190,
        effectiveFrom: "2026-07-01",
        checkedAt: "2026-08-18",
        status: "verified",
      },
    ],
  },
};

function slug(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function keyFor(dossier: Dossier): string {
  return `${slug(dossier.countrySlug ?? dossier.country)}/${slug(dossier.programSlug)}`;
}

function isGovernmentDuplicate(row: FeeRow): boolean {
  return /\b(?:vac|visa application charge|government fee|statutory fee)\b/i.test(row.label ?? "");
}

function websiteEstimate(row: FeeRow, dossier: Dossier): FeeRow {
  return {
    ...row,
    status: row.status ?? "website_estimate",
    sourceLabel: row.sourceLabel || "Website programme data - verify before use",
    checkedAt: row.checkedAt || dossier.lastUpdated,
  };
}

/**
 * Applies the central fee-control policy to every programme dossier.
 *
 * Authority-backed schedules replace stale government amounts. Existing programme
 * values remain available only as dated website estimates; they are never silently
 * promoted to an official or XIPHIAS professional fee.
 */
export function attachProgrammeFeeSchedule(dossier: Dossier): Dossier {
  const schedule = VERIFIED_PROGRAMME_FEES[keyFor(dossier)];
  const existingGovernment = (dossier.governmentFees ?? []).map((row) => websiteEstimate(row, dossier));
  const existingPrices = (dossier.prices ?? []).map((row) => websiteEstimate(row, dossier));

  let feeCoverage: FeeCoverage;
  if (schedule) {
    dossier.governmentFees = schedule.rows.map((row) => ({ ...row }));
    dossier.prices = existingPrices.filter((row) => !isGovernmentDuplicate(row));
    feeCoverage = {
      status: "verified",
      checkedAt: schedule.checkedAt,
      effectiveFrom: schedule.effectiveFrom,
      note: "A current authority-backed programme fee is loaded. Conditional and applicant-specific charges still require confirmation.",
    };
  } else if (existingGovernment.length || existingPrices.length) {
    dossier.governmentFees = existingGovernment;
    dossier.prices = existingPrices;
    feeCoverage = {
      status: "website_estimate",
      checkedAt: dossier.lastUpdated,
      note: "The website contains indicative programme values, but no authority source URL is recorded. Recheck them before client delivery or payment.",
    };
  } else {
    dossier.governmentFees = [];
    dossier.prices = [];
    feeCoverage = {
      status: "pending",
      note: "No source-backed programme fee schedule is loaded yet. The report must not invent or imply an amount.",
    };
  }

  dossier.feeCoverage = feeCoverage;
  return dossier;
}

export function verifiedProgrammeFeeKeys(): string[] {
  return Object.keys(VERIFIED_PROGRAMME_FEES).sort();
}
