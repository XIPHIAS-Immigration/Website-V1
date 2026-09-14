// src/lib/passports/mobility-score.ts
// -----------------------------------------------------------------------------
// The XIPHIAS Mobility Score.
//
// Deliberately ours, and deliberately published. Copying another index's number
// would be both a licensing problem and a weaker product: this formula is one we
// can explain on the methodology page and defend line by line.
//
//   visa-free            1.00   walk up with the passport
//   eTA                  0.90   online authorisation, near-automatic
//   visa on arrival      0.70   granted at the border, but it can be refused
//   e-visa               0.40   an application, just a faster one
//   visa required        0.00
//   banned               0.00
//
// The weighted total is normalised against the best-performing passport in the
// snapshot, so 100 always means "the strongest passport we hold data for" rather
// than an arbitrary ceiling.
//
// THE HONEST PART: a cell we have not verified is not counted as "visa required".
// It is counted as unknown, excluded from the score, and reported in `coverage`.
// A passport below MIN_COVERAGE gets no score at all — the UI must show
// "Pending verification" instead of a number. That is the whole difference
// between this and the 15-row table it replaces.
// -----------------------------------------------------------------------------

export type AccessLevel =
  | "visa-free"
  | "eta"
  | "visa-on-arrival"
  | "e-visa"
  | "visa-required"
  | "banned"
  | "unknown";

export const ACCESS_WEIGHTS: Record<Exclude<AccessLevel, "unknown">, number> = {
  "visa-free": 1,
  eta: 0.9,
  "visa-on-arrival": 0.7,
  "e-visa": 0.4,
  "visa-required": 0,
  banned: 0,
};

/** Below this share of verified cells we publish no score for the passport. */
export const MIN_COVERAGE = 0.8;

export type AccessCell = {
  level: AccessLevel;
  /** Permitted stay in days, where the source states one. */
  days?: number;
  /** Where the cell came from. "pending" means nobody has verified it yet. */
  source?: string;
  lastVerified?: string;
};

/** destination code -> cell */
export type PassportAccess = Record<string, AccessCell>;

export type MobilityResult = {
  code: string;
  /** 0-100, or null when coverage is too thin to publish honestly. */
  score: number | null;
  /** Raw weighted total before normalisation. */
  weighted: number;
  counts: Record<AccessLevel, number>;
  /** Destinations reachable without applying in advance: visa-free + eTA + VOA. */
  openDestinations: number;
  coverage: number;
  verifiedCells: number;
  totalCells: number;
};

const EMPTY_COUNTS: Record<AccessLevel, number> = {
  "visa-free": 0,
  eta: 0,
  "visa-on-arrival": 0,
  "e-visa": 0,
  "visa-required": 0,
  banned: 0,
  unknown: 0,
};

export function summarisePassport(
  code: string,
  access: PassportAccess,
  destinationCodes: string[],
): Omit<MobilityResult, "score"> {
  const counts = { ...EMPTY_COUNTS };
  let weighted = 0;
  let verified = 0;

  for (const destination of destinationCodes) {
    // A passport is not a destination for its own holder.
    if (destination === code) continue;
    const cell = access[destination];
    const level: AccessLevel = cell?.level ?? "unknown";
    counts[level] += 1;
    if (level === "unknown") continue;
    verified += 1;
    weighted += ACCESS_WEIGHTS[level];
  }

  const totalCells = destinationCodes.filter((d) => d !== code).length;
  const openDestinations = counts["visa-free"] + counts.eta + counts["visa-on-arrival"];

  return {
    code,
    weighted,
    counts,
    openDestinations,
    coverage: totalCells ? verified / totalCells : 0,
    verifiedCells: verified,
    totalCells,
  };
}

/**
 * Score every passport in one pass, normalised against the strongest passport
 * that meets the coverage threshold.
 */
export function rankPassports(
  matrix: Record<string, PassportAccess>,
  destinationCodes: string[],
): MobilityResult[] {
  const summaries = Object.keys(matrix).map((code) =>
    summarisePassport(code, matrix[code], destinationCodes),
  );

  const publishable = summaries.filter((s) => s.coverage >= MIN_COVERAGE);
  const best = publishable.reduce((max, s) => Math.max(max, s.weighted), 0);

  return summaries
    .map((summary) => ({
      ...summary,
      score:
        summary.coverage >= MIN_COVERAGE && best > 0
          ? Math.round((summary.weighted / best) * 1000) / 10
          : null,
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.code.localeCompare(b.code));
}

/**
 * What a second passport actually adds — the delta engine behind Compare.
 * Returns destinations that improve, grouped by the improvement.
 */
export function accessDelta(
  current: PassportAccess,
  candidate: PassportAccess,
  destinationCodes: string[],
) {
  const gained: Array<{ destination: string; from: AccessLevel; to: AccessLevel }> = [];
  const lost: Array<{ destination: string; from: AccessLevel; to: AccessLevel }> = [];
  let unknownPairs = 0;

  for (const destination of destinationCodes) {
    const from = current[destination]?.level ?? "unknown";
    const to = candidate[destination]?.level ?? "unknown";
    if (from === "unknown" || to === "unknown") {
      unknownPairs += 1;
      continue;
    }
    const fromWeight = ACCESS_WEIGHTS[from];
    const toWeight = ACCESS_WEIGHTS[to];
    if (toWeight > fromWeight) gained.push({ destination, from, to });
    else if (toWeight < fromWeight) lost.push({ destination, from, to });
  }

  return { gained, lost, unknownPairs, netGain: gained.length - lost.length };
}

export const MOBILITY_METHODOLOGY = {
  weights: ACCESS_WEIGHTS,
  minCoverage: MIN_COVERAGE,
  note:
    "Scores are normalised against the strongest passport in the snapshot. Unverified destination pairs are excluded from the score rather than assumed, and any passport below 80% verified coverage is published as 'pending verification' rather than given a number.",
} as const;
