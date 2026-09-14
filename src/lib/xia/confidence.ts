// src/lib/xia/confidence.ts
// -----------------------------------------------------------------------------
// Honest confidence scoring.
//
// The engine previously derived confidence from how many form fields the user
// had filled in: complete the form and every answer reported ~95% confidence,
// whether or not the match was any good. That is the most damaging thing an
// assessment tool can do, because it makes a guess look authoritative.
//
// Confidence here is the product of three things we can actually measure:
//
//   dataCompleteness  did we get the inputs the rules need?
//   sourceFreshness   how old is the programme record we matched against?
//   ruleCoverage      how much of this route is modelled by real rules rather
//                     than by text matching?
//
// Any one of them being weak drags the result down, which is the point.
// -----------------------------------------------------------------------------

export type ConfidenceInput = {
  /** Required fields actually supplied, over required fields the rules need. */
  requiredFieldsSupplied: number;
  requiredFieldsTotal: number;
  /** ISO date the matched programme record was last verified, if known. */
  lastVerified?: string;
  /** "rules" when scored by a modelled eligibility test, "catalog" when by text match. */
  matchBasis: "rules" | "site-content" | "catalog";
  /** Knock-outs found. Any knock-out caps confidence, because the route is not open. */
  knockoutCount?: number;
};

export type ConfidenceResult = {
  /** 0-100. */
  score: number;
  band: "High" | "Moderate" | "Low" | "Insufficient data";
  /** Shown to the user so the number is never a black box. */
  reasons: string[];
  components: { dataCompleteness: number; sourceFreshness: number; ruleCoverage: number };
};

const STALE_AFTER_DAYS = 180;
const VERY_STALE_AFTER_DAYS = 540;

function freshness(lastVerified?: string) {
  if (!lastVerified) return { value: 0.45, reason: "The programme record carries no verification date." };
  const then = Date.parse(lastVerified);
  if (Number.isNaN(then)) return { value: 0.45, reason: "The programme record's verification date is unreadable." };
  const days = (Date.now() - then) / 86_400_000;
  if (days <= STALE_AFTER_DAYS) return { value: 1, reason: `Programme rules verified within the last ${STALE_AFTER_DAYS} days.` };
  if (days <= VERY_STALE_AFTER_DAYS) {
    return { value: 0.7, reason: `Programme rules last verified ${Math.round(days)} days ago — an advisor should re-check them.` };
  }
  return { value: 0.4, reason: `Programme rules last verified ${Math.round(days)} days ago and may be out of date.` };
}

const BASIS_COVERAGE: Record<ConfidenceInput["matchBasis"], { value: number; reason: string }> = {
  rules: { value: 1, reason: "Scored against modelled eligibility rules for this route." },
  "site-content": { value: 0.6, reason: "Matched on the published programme page, not a modelled rule set." },
  catalog: { value: 0.4, reason: "Matched on the programme catalogue only — an advisor must confirm current rules." },
};

export function scoreConfidence(input: ConfidenceInput): ConfidenceResult {
  const reasons: string[] = [];

  const total = Math.max(input.requiredFieldsTotal, 1);
  const dataCompleteness = Math.min(input.requiredFieldsSupplied / total, 1);
  if (dataCompleteness < 1) {
    const missing = total - input.requiredFieldsSupplied;
    reasons.push(`${missing} of the ${total} inputs this route depends on were not supplied.`);
  }

  const fresh = freshness(input.lastVerified);
  reasons.push(fresh.reason);

  const coverage = BASIS_COVERAGE[input.matchBasis];
  reasons.push(coverage.reason);

  let raw = dataCompleteness * fresh.value * coverage.value;

  if (input.knockoutCount && input.knockoutCount > 0) {
    // A route with an unmet hard requirement is not a low-confidence match, it is
    // a closed one. Cap it hard so it can never outrank an open route.
    raw = Math.min(raw, 0.2);
    reasons.push(`${input.knockoutCount} mandatory requirement${input.knockoutCount > 1 ? "s are" : " is"} not met.`);
  }

  const score = Math.round(raw * 100);
  const band: ConfidenceResult["band"] =
    dataCompleteness < 0.5 ? "Insufficient data" : score >= 70 ? "High" : score >= 45 ? "Moderate" : "Low";

  return {
    score,
    band,
    reasons,
    components: {
      dataCompleteness: Math.round(dataCompleteness * 100),
      sourceFreshness: Math.round(fresh.value * 100),
      ruleCoverage: Math.round(coverage.value * 100),
    },
  };
}
