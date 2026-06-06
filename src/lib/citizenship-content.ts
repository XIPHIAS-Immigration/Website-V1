// src/lib/citizenship-content.ts
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { ReactNode } from "react";
import { normalizeTimelineValue } from "@/lib/timeline";

/* =========================
 * Types (citizenship-only; backward compatible)
 * =======================*/
type CurrencyCode =
  | "USD"
  | "EUR"
  | "AED"
  | "INR"
  | "CAD"
  | "GBP"
  | "XCD"
  | "CHF"
  | "AUD"
  | "SGD";

export type CountryMeta = {
  title: string;
  category: "citizenship";
  country: string;
  countrySlug: string;
  summary?: string;
  tagline?: string;
  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;
  timelineMonths?: number;
  timelineLabel?: string;
  introPoints?: string[];
  tags?: string[];
  seo?: { title?: string; description?: string; keywords?: string[] };
  draft?: boolean;

  /** Optional, used by Citizenship pages */
  visaFreeCount?: number; // total visa-free/VOA/eTA
  passportRank?: number; // lower is stronger
  passportNotes?: string;

  // Additional optional metadata (safe to ignore where unused)
  region?: string;
  allowsDualCitizenship?: boolean;
  interviewRequired?: boolean;
  residencyRequirement?: string;
  taxNotes?: string[];
  dependents?: {
    childrenUpTo?: number;
    parentsFromAge?: number;
    siblings?: boolean;
  };
  legalBasis?: string;
  lastUpdated?: string; // ISO date
};

export type Step = { title: string; description?: string };

export type PriceRow = {
  label: string;
  amount?: number;
  currency?: CurrencyCode;
  when?: string;
  notes?: string;
};

export type ProofOfFundsRow = {
  label?: string;
  amount: number;
  currency?: CurrencyCode;
  notes?: string;
};

export type QuickCheckConfig = {
  title?: string;
  questions?: {
    id: string;
    label: string;
    type: "boolean" | "select" | "number" | "text";
    options?: string[];
  }[];
};

export type ProgramMeta = {
  title: string;
  category: "citizenship";
  country: string;
  countrySlug: string;
  programSlug: string;
  tagline?: string;
  minInvestment?: number;
  currency?: CurrencyCode;
  timelineMonths?: number;
  timelineLabel?: string;
  tags?: string[];
  benefits?: string[];
  requirements?: string[];
  processSteps?: Step[];
  faq?: { q: string; a: string }[];
  brochure?: string;
  prices?: PriceRow[];
  proofOfFunds?: ProofOfFundsRow[];
  disqualifiers?: string[];
  quickCheck?: QuickCheckConfig;
  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
  draft?: boolean;

  /** Program specifics used on program pages & filters */
  routeType?: "donation" | "real-estate" | "bond" | "naturalisation";
  holdingPeriodMonths?: number;
  governmentFees?: {
    label: string;
    amount?: number;
    currency?: CurrencyCode;
  }[];
  projectList?: {
    name: string;
    minBuyIn: number;
    holdMonths: number;
    notes?: string;
    image?: string;
  }[];
  riskNotes?: string[];
  complianceNotes?: string[];
  lastUpdated?: string; // ISO date
};

/** Sections map returned by loadProgramPageSections */
export type ProgramSections = Record<string, ReactNode>;

/* =========================
 * Constants & tiny utils
 * =======================*/
const ROOT = path.join(process.cwd(), "content", "citizenship");
const DEFAULT_PROJECT_IMAGE = "/images/citizenship/grenada/harborview-suites-share-units.webp";

const exists = (p: string) => {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
};

const toTitle = (slug: string) =>
  slug
    .split("-")
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");

const coerceNum = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)))
    return Number(v);
  return undefined;
};

const coerceBool = (v: unknown): boolean | undefined => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return undefined;
};

const toAbsolute = (p: string | undefined, fallback: string) => {
  if (!p) return fallback;
  // allow absolute local (/...), absolute remote (http/https), or normalize "images/.."
  if (p.startsWith("/") || /^https?:\/\//i.test(p)) return p;
  return `/${p.replace(/^\.?\/*/, "")}`;
};

const projectImagePath = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  return toAbsolute(s, DEFAULT_PROJECT_IMAGE);
};

const publicAssetExists = (assetPath: string): boolean => {
  if (/^https?:\/\//i.test(assetPath)) return true;
  const localPath = assetPath.split(/[?#]/, 1)[0];
  return exists(path.join(process.cwd(), "public", localPath.replace(/^\/+/, "")));
};

const resolveProjectImage = (v: unknown): string => {
  const assetPath = projectImagePath(v);
  if (!assetPath) return DEFAULT_PROJECT_IMAGE;
  return publicAssetExists(assetPath) ? assetPath : DEFAULT_PROJECT_IMAGE;
};

/** MDX options */
const baseMdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
} as const;

/** slugify section titles, e.g. "Why Choose Us?" -> "why-choose-us" */
function slugify(h: string) {
  return h
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Normalize explicit {#id} values to safe keys */
function normalizeIdKey(id: string) {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Strip disallowed ESM from MDX body: remove any `import ...` or `export ...` lines */
function sanitizeMdxBody(src: string): string {
  return src
    .split(/\r?\n/)
    .filter((line) => !/^\s*(import|export)\b/.test(line))
    .join("\n");
}

/**
 * Split MDX by H2/H3 headings into named sections.
 * - Supports "##" and "###".
 * - Honors explicit anchors like: "### Heading {#my-id}" using "my-id" as key.
 * - DOES NOT include the heading line inside the section (prevents duplicate UI headings).
 * - Any content before the first heading becomes "overview".
 * - Deduplicates equal headings by suffixing -2, -3, ...
 */
function splitByHeadings(md: string): Record<string, string> {
  const lines = md.split(/\r?\n/);
  const out: Record<string, string> = {};
  let current = "overview";
  let buf: string[] = [];
  const counts = new Map<string, number>();

  const nextKey = (baseRaw: string) => {
    const base = baseRaw;
    const n = (counts.get(base) || 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const flush = () => {
    const content = buf.join("\n").trim();
    out[current] = content;
    buf = [];
  };

  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      let raw = m[2].trim();

      // Allow explicit MDX anchor: "### Title {#my-id}"
      const anchor = /\{#([A-Za-z0-9_-]+)\}\s*$/.exec(raw);
      if (anchor) {
        // drop the "{#id}" from any trailing text and prefer the explicit id as key
        raw = raw.replace(/\s*\{#[^}]+\}\s*$/, "").trim();
        const idKey = normalizeIdKey(anchor[1]);
        current = nextKey(idKey);
      } else {
        current = nextKey(slugify(raw));
      }
      // do NOT push the heading line (UI provides H2s)
    } else {
      buf.push(line);
    }
  }
  flush();

  if (!("overview" in out)) out.overview = "";
  return out;
}

/* ============== Robust cache stamp (recursive) ============== */
type Cache = {
  countries?: CountryMeta[];
  programsAll?: ProgramMeta[];
  mtimes?: Map<string, number>;
};
const _g = globalThis as any;
if (!_g.__CITIZENSHIP_CACHE__)
  _g.__CITIZENSHIP_CACHE__ = { mtimes: new Map() } as Cache;
const CACHE: Cache = _g.__CITIZENSHIP_CACHE__;

/** Recursively get the newest mtime under the citizenship content tree. */
function dirStamp(rootDir: string): number {
  if (!exists(rootDir)) return 0;
  let max = 0;
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(rootDir, e.name);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const sub = dirStamp(full);
        if (sub > max) max = sub;
      } else {
        if (stat.mtimeMs > max) max = stat.mtimeMs;
      }
    } catch {
      // ignore
    }
  }
  return max;
}

/* =========================
 * Normalizers (YAML-safe & defensive)
 * =======================*/
function sanitizeStringArray(a?: unknown): string[] | undefined {
  if (!a) return undefined;
  if (Array.isArray(a)) {
    return a
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object") {
          const entries = Object.entries(v as Record<string, unknown>).map(
            ([k, val]) => `${k}: ${String(val)}`,
          );
          return entries.join(", ");
        }
        return String(v);
      })
      .filter(Boolean);
  }
  if (typeof a === "string") return [a];
  return undefined;
}

function normalizeCountry(
  metaIn: Partial<CountryMeta>,
  slug: string,
): CountryMeta {
  const meta: any = { ...metaIn };
  const timeline = normalizeTimelineValue(meta.timelineMonths);
  const countrySlug = meta.countrySlug || slug;
  const country = meta.country || meta.title || toTitle(countrySlug);
  const title =
    meta.title ||
    (typeof country === "string" ? country : toTitle(countrySlug));

  // Coerce new citizenship fields
  if (meta.visaFreeCount !== undefined)
    meta.visaFreeCount = coerceNum(meta.visaFreeCount);
  if (meta.passportRank !== undefined)
    meta.passportRank = coerceNum(meta.passportRank);
  if (meta.allowsDualCitizenship !== undefined)
    meta.allowsDualCitizenship = coerceBool(meta.allowsDualCitizenship);
  if (meta.interviewRequired !== undefined)
    meta.interviewRequired = coerceBool(meta.interviewRequired);

  if (meta.dependents && typeof meta.dependents === "object") {
    const d = meta.dependents as CountryMeta["dependents"];
    if (d) {
      if (d.childrenUpTo !== undefined)
        d.childrenUpTo = coerceNum(d.childrenUpTo);
      if (d.parentsFromAge !== undefined)
        d.parentsFromAge = coerceNum(d.parentsFromAge);
      if (d.siblings !== undefined) d.siblings = coerceBool(d.siblings);
    }
  }

  // Clean arrays possibly polluted by YAML edge-cases
  meta.introPoints = sanitizeStringArray(meta.introPoints);
  meta.tags = sanitizeStringArray(meta.tags);
  meta.taxNotes = sanitizeStringArray(meta.taxNotes);

  // Images: enforce root-absolute; fallback to a sensible poster path
  const fallbackPoster = `/images/countries/${countrySlug}-hero-poster.jpg`;
  meta.heroImage = toAbsolute(meta.heroImage, fallbackPoster);
  meta.heroPoster = toAbsolute(meta.heroPoster, fallbackPoster);

  return {
    ...meta,
    title: String(title),
    country: String(country),
    countrySlug: String(countrySlug),
    timelineMonths: timeline.months,
    timelineLabel: timeline.label,
    category: "citizenship",
  } as CountryMeta;
}

function normalizeProgram(
  metaIn: Partial<ProgramMeta>,
  cSlug: string,
  pSlug: string,
): ProgramMeta {
  const meta: any = { ...metaIn };

  // tolerate common content typos
  if (meta.procesSteps && !meta.processSteps) meta.processSteps = meta.procesSteps;
  if (meta.governmentfees && !meta.governmentFees) meta.governmentFees = meta.governmentfees;
  if (meta.risknotes && !meta.riskNotes) meta.riskNotes = meta.risknotes;
  if (meta.compliancenotes && !meta.complianceNotes) meta.complianceNotes = meta.compliancenotes;

  meta.programSlug = meta.programSlug || pSlug;
  meta.countrySlug = meta.countrySlug || cSlug;
  meta.category = "citizenship";

  if (meta.minInvestment !== undefined)
    meta.minInvestment = coerceNum(meta.minInvestment);
  if (meta.timelineMonths !== undefined) {
    const timeline = normalizeTimelineValue(meta.timelineMonths);
    meta.timelineMonths = timeline.months;
    meta.timelineLabel = timeline.label;
  }
  if (meta.holdingPeriodMonths !== undefined)
    meta.holdingPeriodMonths = coerceNum(meta.holdingPeriodMonths);

  // Arrays cleanup (handles accidental object items)
  meta.tags = sanitizeStringArray(meta.tags);
  meta.benefits = sanitizeStringArray(meta.benefits);
  meta.requirements = sanitizeStringArray(meta.requirements);
  meta.disqualifiers = sanitizeStringArray(meta.disqualifiers);
  meta.riskNotes = sanitizeStringArray(meta.riskNotes);
  meta.complianceNotes = sanitizeStringArray(meta.complianceNotes);

  // Prices & proof of funds coercion
  if (Array.isArray(meta.prices)) {
    meta.prices = meta.prices.map((row: any) => ({
      ...row,
      amount: coerceNum(row?.amount),
    }));
  }
  if (Array.isArray(meta.proofOfFunds)) {
    meta.proofOfFunds = meta.proofOfFunds.map((row: any) => ({
      ...row,
      amount: coerceNum(row?.amount) ?? 0,
    }));
  }

  // Government fees (optional)
  if (Array.isArray(meta.governmentFees)) {
    meta.governmentFees = meta.governmentFees.map((row: any) => ({
      ...row,
      amount: coerceNum(row?.amount),
    }));
  }

  // Project list (optional; numbers)
  if (Array.isArray(meta.projectList)) {
    meta.projectList = meta.projectList.map((p: any) => ({
      ...p,
      minBuyIn: coerceNum(p?.minBuyIn) ?? 0,
      holdMonths: coerceNum(p?.holdMonths) ?? 0,
      image: resolveProjectImage(p?.image),
    }));
  }

  // Images: enforce root-absolute; fallback to country poster
  const fallbackPoster = `/images/countries/${cSlug}-hero-poster.jpg`;
  meta.heroImage = toAbsolute(meta.heroImage, fallbackPoster);
  if (meta.heroPoster)
    meta.heroPoster = toAbsolute(meta.heroPoster, fallbackPoster);

  return meta as ProgramMeta;
}

/* =========================
 * Lists & slugs (cache keyed by recursive dir stamp)
 * =======================*/
export function getCitizenshipCountrySlugs(): string[] {
  if (!exists(ROOT)) return [];
  const stampKey = `${ROOT}::stamp`;
  const stamp = dirStamp(ROOT);
  if (CACHE.countries && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.countries.map((c) => c.countrySlug);
  }

  const slugs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  CACHE.mtimes?.set(stampKey, stamp);
  return slugs;
}

export function getCitizenshipCountries(): CountryMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::countries`;

  const stamp = dirStamp(ROOT);
  if (CACHE.countries && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.countries;
  }

  const out: CountryMeta[] = [];
  for (const slug of getCitizenshipCountrySlugs()) {
    const file = path.join(ROOT, slug, "_country.mdx");
    if (!exists(file)) continue;
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const meta = normalizeCountry(data as Partial<CountryMeta>, slug);
    if (!meta.draft) out.push(meta);
  }

  const sorted = out.sort((a, b) => a.country.localeCompare(b.country));
  CACHE.countries = sorted;
  CACHE.mtimes?.set(cacheKey, Date.now());
  CACHE.mtimes?.set(stampKey, stamp);
  return sorted;
}

export function getCitizenshipProgramSlugs(countrySlug: string): string[] {
  const dir = path.join(ROOT, countrySlug);
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".mdx") && n !== "_country.mdx")
    .map((n) => n.replace(/\.mdx$/, ""));
}

export function getCitizenshipPrograms(countrySlug?: string): ProgramMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::programsAll`;

  const stamp = dirStamp(ROOT);
  if (
    !countrySlug &&
    CACHE.programsAll &&
    CACHE.mtimes?.get(stampKey) === stamp
  ) {
    return CACHE.programsAll;
  }

  const countries = countrySlug ? [countrySlug] : getCitizenshipCountrySlugs();
  const out: ProgramMeta[] = [];

  for (const c of countries) {
    for (const p of getCitizenshipProgramSlugs(c)) {
      const f = path.join(ROOT, c, `${p}.mdx`);
      const raw = fs.readFileSync(f, "utf8");
      const { data } = matter(raw);
      const meta = normalizeProgram(data as Partial<ProgramMeta>, c, p);
      if (!meta?.draft) out.push(meta);
    }
  }

  const sorted = out.sort((a, b) =>
    (a.countrySlug + a.title).localeCompare(b.countrySlug + b.title),
  );

  if (!countrySlug) {
    CACHE.programsAll = sorted;
    CACHE.mtimes?.set(cacheKey, Date.now());
    CACHE.mtimes?.set(stampKey, stamp);
  }
  return sorted;
}

/* =========================
 * Renderers
 * =======================*/
export async function loadCountryPage(countrySlug: string) {
  const f = path.join(ROOT, countrySlug, "_country.mdx");
  const raw = fs.readFileSync(f, "utf8");
  const { data, content } = matter(raw);

  const meta = normalizeCountry(data as Partial<CountryMeta>, countrySlug);

  // sanitize MDX body to ensure no ESM imports/exports leak through
  const body = sanitizeMdxBody(content);
  const { content: compiled } = await compileMDX({
    source: body,
    options: { parseFrontmatter: false, mdxOptions: baseMdxOptions as any },
  });

  return { content: compiled, meta };
}

export async function loadProgramPage(
  countrySlug: string,
  programSlug: string,
) {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const raw = fs.readFileSync(f, "utf8");
  const { data, content } = matter(raw);

  const meta = normalizeProgram(
    data as Partial<ProgramMeta>,
    countrySlug,
    programSlug,
  );

  // sanitize MDX body
  const body = sanitizeMdxBody(content);
  const { content: compiled } = await compileMDX<ProgramMeta>({
    source: body,
    options: { parseFrontmatter: false, mdxOptions: baseMdxOptions as any },
  });

  return { content: compiled, meta };
}

/* ========= Section-by-section renderer (non-breaking) ========= */
export async function loadProgramPageSections(
  countrySlug: string,
  programSlug: string,
): Promise<{ meta: ProgramMeta; sections: ProgramSections }> {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const raw = fs.readFileSync(f, "utf8");
  const { data, content: bodyRaw } = matter(raw);

  const meta = normalizeProgram(
    data as Partial<ProgramMeta>,
    countrySlug,
    programSlug,
  );

  // sanitize + split
  const body = sanitizeMdxBody(bodyRaw);
  const chunks = splitByHeadings(body);

  const entries = await Promise.all(
    Object.entries(chunks).map(async ([key, md]) => {
      const { content } = await compileMDX({
        source: md,
        options: {
          parseFrontmatter: false,
          mdxOptions: baseMdxOptions as any,
        },
      });
      return [key, content] as const;
    }),
  );

  const sections = Object.fromEntries(entries) as ProgramSections;
  return { meta, sections };
}

/* =========================
 * Frontmatter-only helpers
 * =======================*/
export function getProgramFrontmatter(
  countrySlug: string,
  programSlug: string,
) {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const { data } = matter(fs.readFileSync(f, "utf8"));
  return normalizeProgram(
    data as Partial<ProgramMeta>,
    countrySlug,
    programSlug,
  );
}

export function getCountryFrontmatter(countrySlug: string) {
  const f = path.join(ROOT, countrySlug, "_country.mdx");
  const { data } = matter(fs.readFileSync(f, "utf8"));
  return normalizeCountry(data as Partial<CountryMeta>, countrySlug);
}

/* =========================
 * Sitemap helper
 * =======================*/
export function getCitizenshipUrls() {
  const urls: { url: string }[] = [{ url: "/citizenship" }];
  for (const c of getCitizenshipCountrySlugs()) {
    urls.push({ url: `/citizenship/${c}` });
    for (const p of getCitizenshipProgramSlugs(c)) {
      urls.push({ url: `/citizenship/${c}/${p}` });
    }
  }
  return urls;
}

/* =========================
 * Dev helper
 * =======================*/
export function invalidateCitizenshipContentCache() {
  CACHE.countries = undefined;
  CACHE.programsAll = undefined;
}
