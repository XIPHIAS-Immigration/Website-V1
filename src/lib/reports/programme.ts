import "server-only";

import { getSkilledPrograms } from "@/lib/skilled-content";
import { getResidencyPrograms } from "@/lib/residency-content";
import { getCitizenshipPrograms } from "@/lib/citizenship-content";
import { getCorporatePrograms } from "@/lib/corporate-content";
import { getAllContentCached } from "@/lib/content";

// Cross-vertical programme resolver. Given a free-text country + programme (and an
// optional track hint), it finds the best-matching programme across all four content
// libraries and returns a permissive "Dossier" view of its full normalized frontmatter,
// so reports can render the SAME rich content the public programme pages show.

export type Vertical = "skilled" | "residency" | "citizenship" | "corporate";

export type FeeRow = { label?: string; amount?: number; currency?: string; when?: string; notes?: string; sourceLabel?: string };
export type DocGroup = { group?: string; documents?: string[]; notes?: string };
export type ProcessStep = { title?: string; description?: string };
export type Faq = { q?: string; a?: string };
export type Project = { name?: string; minBuyIn?: number; holdMonths?: number; notes?: string; image?: string };
export type PointsRow = { category?: string; max?: number; notes?: string };
export type OccupationList = { listName?: string; occupations?: string[] };

export type Dossier = {
  vertical: Vertical;
  title?: string;
  country?: string;
  countrySlug?: string;
  programSlug?: string;
  tagline?: string;
  minInvestment?: number;
  currency?: string;
  timelineMonths?: number;
  timelineLabel?: string;
  routeType?: string;
  holdingPeriodMonths?: number;
  jobOfferRequired?: boolean;
  allowsDualCitizenship?: boolean;
  tags?: string[];
  benefits?: string[];
  requirements?: string[];
  disqualifiers?: string[];
  riskNotes?: string[];
  complianceNotes?: string[];
  taxNotes?: string[];
  processSteps?: ProcessStep[];
  faq?: Faq[];
  prices?: FeeRow[];
  proofOfFunds?: FeeRow[];
  governmentFees?: FeeRow[];
  documentChecklist?: DocGroup[];
  projectList?: Project[];
  pointsGrid?: PointsRow[];
  occupationLists?: OccupationList[];
  language?: { tests?: string[]; minLevel?: string };
  familyMatrix?: { childrenUpTo?: number; parentsFromAge?: number; siblings?: boolean; spouse?: boolean };
  heroImage?: string;
  lastUpdated?: string;
  /** Raw MDX prose body (the narrative shown on the public programme page). */
  body?: string;
};

type Pool = { vertical: Vertical; load: () => unknown[] };

const POOLS: Pool[] = [
  { vertical: "skilled", load: () => getSkilledPrograms() as unknown[] },
  { vertical: "residency", load: () => getResidencyPrograms() as unknown[] },
  { vertical: "citizenship", load: () => getCitizenshipPrograms() as unknown[] },
  { vertical: "corporate", load: () => getCorporatePrograms() as unknown[] },
];

const TRACK_TO_VERTICAL: Record<string, Vertical> = {
  skilled: "skilled",
  residency: "residency",
  citizenship: "citizenship",
  corporate: "corporate",
};

const COUNTRY_ALIASES: Record<string, string> = {
  "united states": "usa",
  america: "usa",
  "united states of america": "usa",
  "united kingdom": "uk",
  britain: "uk",
  england: "uk",
  "great britain": "uk",
  "united arab emirates": "uae",
};

function norm(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function slugOf(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countryMatches(meta: Dossier, country: string): boolean {
  if (!country) return true;
  const c = norm(country);
  const mc = norm(meta.country);
  const ms = norm(meta.countrySlug);
  const alias = COUNTRY_ALIASES[c];
  return Boolean(
    (mc && mc === c) ||
      (ms && ms === c) ||
      (mc && (mc.includes(c) || c.includes(mc))) ||
      (alias && (ms === alias || mc.includes(alias))),
  );
}

function programScore(meta: Dossier, program: string): number {
  const p = norm(program);
  if (!p) return 5; // no programme specified — any programme for the country is acceptable
  const t = norm(meta.title);
  const ps = slugOf(meta.programSlug);
  const sp = slugOf(program);
  const identifiers = (value: string) => norm(value).match(/\b(?:subclass\s*)?\d{3}\b|\b(?:eb|o|h)\s*\d+[a-z]?\b/g)?.map((item) => item.replace(/\s+/g, "")) ?? [];
  const requestedIds = identifiers(program);
  if (requestedIds.length) {
    const candidateIds = new Set(identifiers(`${meta.title ?? ""} ${meta.programSlug ?? ""}`));
    if (!requestedIds.some((value) => candidateIds.has(value))) return 0;
  }
  if (t === p || (ps && ps === sp)) return 100;
  if (requestedIds.length) return 92;
  if (t && (t.includes(p) || p.includes(t))) return 70;
  if (ps && sp && (ps.includes(sp) || sp.includes(ps))) return 60;
  const ptoks = new Set(p.split(" ").filter(Boolean));
  const overlap = t.split(" ").filter((w) => ptoks.has(w)).length;
  return overlap * 8;
}

// Attach the programme's raw MDX prose body (from the unified content cache) so reports
// can render the narrative, not just the frontmatter. Matched by vertical + country slug
// + programme slug. Returns the same object (mutated) for convenience.
function attachBody(meta: Dossier): Dossier {
  if (meta.body != null) return meta;
  try {
    const want = { v: meta.vertical, c: slugOf(meta.countrySlug ?? meta.country), p: slugOf(meta.programSlug) };
    if (!want.p) return meta;
    const docs = getAllContentCached();
    const hit = docs.find(
      (d) =>
        (d as { kind?: string }).kind === "program" &&
        String((d as { vertical?: string }).vertical ?? "") === want.v &&
        slugOf((d as { country?: string }).country) === want.c &&
        slugOf((d as { program?: string }).program) === want.p,
    ) as { body?: string } | undefined;
    if (hit?.body) meta.body = hit.body;
  } catch {
    // body is optional; ignore lookup failures
  }
  return meta;
}

// All country-matching programmes across the pools, scored and sorted best-first.
function scoredCandidates(opts: { country?: string; program?: string; track?: string }): { meta: Dossier; score: number }[] {
  const country = (opts.country ?? "").trim();
  const program = (opts.program ?? "").trim();
  const hinted = opts.track ? TRACK_TO_VERTICAL[String(opts.track).toLowerCase()] : undefined;
  const pools = hinted
    ? [...POOLS].sort((a, b) => (a.vertical === hinted ? -1 : b.vertical === hinted ? 1 : 0))
    : POOLS;

  const out: { meta: Dossier; score: number }[] = [];
  for (const pool of pools) {
    let items: Dossier[];
    try {
      items = (pool.load() as unknown as Dossier[]).map((m) => ({ ...m, vertical: pool.vertical }));
    } catch {
      continue;
    }
    for (const meta of items) {
      if (!countryMatches(meta, country)) continue;
      const score = programScore(meta, program) + (country ? 6 : 0) + (hinted && meta.vertical === hinted ? 4 : 0);
      if (score <= 0) continue;
      out.push({ meta, score });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/**
 * Resolve the best-matching programme dossier for a country/programme/track.
 * Returns null only if nothing in any vertical matches the country.
 */
export function resolveProgramme(opts: { country?: string; program?: string; track?: string }): Dossier | null {
  const best = scoredCandidates(opts)[0];
  return best ? attachBody(best.meta) : null;
}

/**
 * Resolve up to `limit` DISTINCT programmes (by programme slug) for a country/track, best
 * first — used to carry a primary route plus its strongest alternatives in one report.
 */
export function resolveProgrammes(opts: { country?: string; program?: string; track?: string }, limit = 3): Dossier[] {
  const seen = new Set<string>();
  const out: Dossier[] = [];
  for (const { meta } of scoredCandidates(opts)) {
    const key = `${meta.vertical}:${slugOf(meta.programSlug) || norm(meta.title)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(attachBody(meta));
    if (out.length >= limit) break;
  }
  return out;
}
