// src/lib/program-index.ts
// -----------------------------------------------------------------------------
// XIPHIAS Program Index — a documented composite benchmark over the parsed
// programme data. Parallels src/lib/xia-intelligence-model.ts: exported weights
// + a pure scoring function the methodology page renders verbatim.
//
// ⚠️ The index is an INDICATIVE benchmark for orientation only — it is not a
// ranking of "best" outcomes and never replaces advisor review. Pure module
// (type-only catalog import) so the ranking client can re-rank reactively.
// -----------------------------------------------------------------------------

import type { CostProgram } from "@/lib/cost-estimator";
import { passportRecordForCountry, type PresenceKey } from "@/lib/program-metrics";
import { passportIndexStats } from "@/data/passport-index";

export type ProgramIndexItem = CostProgram & {
  presence: PresenceKey;
  family: boolean;
  risk: "standard" | "enhanced" | "high";
};

/** Composite weights (sum to 100). Rendered on the methodology page. */
export const INDEX_WEIGHTS = {
  affordability: 22,
  speed: 20,
  flexibility: 16,
  family: 12,
  dueDiligence: 14,
  passportPower: 16,
} as const;

export type IndexComponentKey = keyof typeof INDEX_WEIGHTS;

export const INDEX_FACTORS: {
  key: IndexComponentKey;
  label: string;
  weight: number;
  direction: string;
  description: string;
}[] = [
  {
    key: "affordability",
    label: "Affordability",
    weight: INDEX_WEIGHTS.affordability,
    direction: "Lower capital scores higher",
    description: "Anchored on the parsed minimum investment. Points-based routes with no investment score highest.",
  },
  {
    key: "speed",
    label: "Processing speed",
    weight: INDEX_WEIGHTS.speed,
    direction: "Shorter timelines score higher",
    description: "Uses the parsed indicative timeline in months.",
  },
  {
    key: "flexibility",
    label: "Presence flexibility",
    weight: INDEX_WEIGHTS.flexibility,
    direction: "Lower required presence scores higher",
    description: "Uses the physical-presence proxy honestly — no fabricated day counts.",
  },
  {
    key: "family",
    label: "Family inclusion",
    weight: INDEX_WEIGHTS.family,
    direction: "Family-inclusive routes score higher",
    description: "Whether a spouse and dependants can typically be included.",
  },
  {
    key: "dueDiligence",
    label: "Due-diligence ease",
    weight: INDEX_WEIGHTS.dueDiligence,
    direction: "Lower scrutiny scores higher",
    description: "Derived from the risk tier; enhanced/high checks reduce the sub-score.",
  },
  {
    key: "passportPower",
    label: "Passport power gained",
    weight: INDEX_WEIGHTS.passportPower,
    direction: "Higher visa-free mobility scores higher",
    description:
      "Joined to the passport snapshot where available. Destinations outside the snapshot use a neutral baseline pending advisor review.",
  },
];

export const INDEX_DISCLAIMER =
  "Indicative composite benchmark — varies by case and is not a ranking of guaranteed outcomes. Advisor review required.";

export type IndexComponents = Record<IndexComponentKey, number>;

export type ScoredProgram = ProgramIndexItem & {
  indexScore: number;
  tier: "Standout" | "Strong" | "Balanced" | "Specialist";
  components: IndexComponents;
  /** False when the destination passport is outside the snapshot (neutral baseline used). */
  passportKnown: boolean;
  rank: number;
};

const PRESENCE_SCORE: Record<PresenceKey, number> = { low: 100, moderate: 70, variable: 60, high: 35 };
const RISK_SCORE: Record<ProgramIndexItem["risk"], number> = { standard: 100, enhanced: 65, high: 35 };
const NEUTRAL_PASSPORT = 55;
const INVESTMENT_CAP = 2_000_000;
const TIMELINE_CAP = 48;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function tierFor(score: number): ScoredProgram["tier"] {
  if (score >= 80) return "Standout";
  if (score >= 68) return "Strong";
  if (score >= 56) return "Balanced";
  return "Specialist";
}

/** Compute the composite index score + component breakdown for one programme. */
export function scoreProgram(item: ProgramIndexItem): Omit<ScoredProgram, "rank"> {
  const affordability =
    item.investmentUsd <= 0 ? 100 : clamp(100 - (item.investmentUsd / INVESTMENT_CAP) * 100, 5, 100);
  const speed = clamp(100 - (item.timelineMonths / TIMELINE_CAP) * 100, 5, 100);
  const flexibility = PRESENCE_SCORE[item.presence] ?? 60;
  const family = item.family ? 100 : 45;
  const dueDiligence = RISK_SCORE[item.risk] ?? 65;

  const record = passportRecordForCountry(item.country);
  const passportKnown = Boolean(record);
  const passportPower = record ? clamp((record.score / passportIndexStats.topScore) * 100) : NEUTRAL_PASSPORT;

  const components: IndexComponents = {
    affordability: Math.round(affordability),
    speed: Math.round(speed),
    flexibility: Math.round(flexibility),
    family: Math.round(family),
    dueDiligence: Math.round(dueDiligence),
    passportPower: Math.round(passportPower),
  };

  const composite =
    (INDEX_WEIGHTS.affordability * affordability +
      INDEX_WEIGHTS.speed * speed +
      INDEX_WEIGHTS.flexibility * flexibility +
      INDEX_WEIGHTS.family * family +
      INDEX_WEIGHTS.dueDiligence * dueDiligence +
      INDEX_WEIGHTS.passportPower * passportPower) /
    100;

  const indexScore = Math.round(clamp(composite));

  return { ...item, indexScore, tier: tierFor(indexScore), components, passportKnown };
}

/** Score + sort programmes by composite index (desc), assigning ranks. */
export function rankPrograms(items: ProgramIndexItem[]): ScoredProgram[] {
  return items
    .map(scoreProgram)
    .sort((a, b) => b.indexScore - a.indexScore || a.title.localeCompare(b.title))
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}
