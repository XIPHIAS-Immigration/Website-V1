import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { ReactNode } from "react";
import { rehypeFixInvalidLinkChildren } from "@/lib/mdx-plugins";
import { normalizeTimelineValue } from "@/lib/timeline";

/* =========================
 * Types (corporate)
 * =======================*/
type CurrencyCode = "USD" | "EUR" | "AED" | "INR" | "CAD" | "GBP" | "XCD" | "CHF" | "AUD" | "SGD";

export type FAQ = { q: string; a: string };
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
  questions?: { id: string; label: string; type: "boolean" | "select" | "number" | "text"; options?: string[] }[];
  ctas?: { primaryHref?: string; primaryText?: string; secondaryHref?: string; secondaryText?: string };
};

export type DocumentChecklistGroup = { group: string; documents: string[]; notes?: string };

export type FamilyMatrixConfig = {
  childrenUpTo?: number;
  parentsFromAge?: number;
  siblings?: boolean;
  spouse?: boolean;
};

export type LanguageMin =
  | {
      test?: string;
      overall?: number;
      bands?: { listening?: number; reading?: number; writing?: number; speaking?: number };
    }
  | undefined;

export type LanguageRequirements =
  | {
      tests?: string[];
      minLevel?: string; // human-readable
    }
  | undefined;

export type Testimonial = { quote: string; author?: string };

export type CountryMeta = {
  title: string;
  category: "corporate";
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

  region?: string;
  lastUpdated?: string; // ISO

  overview?: string;
  keyPoints?: string[];
  facts?: Record<string, unknown>;
  applicationProcess?: Step[];
  requirements?: string[];
  faq?: FAQ[];
};

export type ProgramMeta = {
  title: string;
  category: "corporate";
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
  faq?: FAQ[];
  brochure?: string;
  prices?: PriceRow[];
  proofOfFunds?: ProofOfFundsRow[];
  disqualifiers?: string[];
  quickCheck?: QuickCheckConfig;

  documentChecklist?: DocumentChecklistGroup[];
  familyMatrix?: FamilyMatrixConfig;

  languageRequirements?: LanguageRequirements;
  languageMin?: LanguageMin;
  jobOfferRequired?: boolean;
  jobOfferNote?: string;
  jobOffer?: { required?: boolean; note?: string };

  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;

  testimonials?: Testimonial[];

  seo?: { title?: string; description?: string; keywords?: string[] };
  draft?: boolean;

  governmentFees?: {
    label: string;
    amount?: number;
    currency?: CurrencyCode;
    sourceLabel?: string;
    sourceUrl?: string;
  }[];

  lastUpdated?: string; // ISO
};

/** Sections map returned by loadProgramPageSections */
export type ProgramSections = Record<string, ReactNode>;

/* =========================
 * Constants & tiny utils
 * =======================*/
const ROOT = path.join(process.cwd(), "content", "corporate");

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
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return undefined;
};

const sanitizeStringArray = (a?: unknown): string[] | undefined => {
  if (!a) return undefined;
  if (Array.isArray(a)) {
    return a
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object") {
          const entries = Object.entries(v as Record<string, unknown>).map(([k, val]) => `${k}: ${String(val)}`);
          return entries.join(", ");
        }
        return String(v);
      })
      .filter(Boolean);
  }
  if (typeof a === "string") return [a];
  return undefined;
};

const toAbsolute = (p: string | undefined, fallback: string) => {
  if (!p) return fallback;
  if (p.startsWith("/") || /^https?:\/\//i.test(p)) return p;
  return `/${p.replace(/^\.?\/*/, "")}`;
};

/** MDX options — no `components` (prevents TS2353) */
const baseMdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }], rehypeFixInvalidLinkChildren],
};

/** slugify section titles, e.g. "Why Choose Us?" -> "why-choose-us" */
function slugify(h: string) {
  return h
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Split MDX by top-level `###` headings only.
 * - Content before the first heading becomes "overview" (we seed it).
 * - We do NOT split on `##`, so authors can freely use H2 inside sections.
 */
function splitByH3(md: string): Record<string, string> {
  const lines = md.split(/\r?\n/);
  const out: Record<string, string> = {};
  let current: string | null = null;
  let buf: string[] = [];
  const counts = new Map<string, number>();

  const nextKey = (base: string) => {
    const n = (counts.get(base) || 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const flush = () => {
    if (current) out[current] = buf.join("\n").trim();
    buf = [];
  };

  for (const line of lines) {
    const m = /^###\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      current = nextKey(slugify(m[1]));
      // we intentionally DO NOT push the H3 line; page components add their own headings
    } else {
      if (!current) {
        // seed an "overview" section
        current = nextKey("overview");
      }
      buf.push(line);
    }
  }
  flush();
  if (!("overview" in out)) out.overview = "";
  return out;
}

/** Strip a redundant "Program Overview" heading at the top of a chunk */
function stripLeadingProgramOverview(md: string): string {
  const lines = md.split(/\r?\n/);
  if (lines.length === 0) return md;
  const first = lines[0].trim();
  if (/^#{2,3}\s*program\s+overview\b/i.test(first)) {
    return lines.slice(1).join("\n").trim();
  }
  return md;
}

/* ============== Robust cache stamp (recursive) ============== */
type Cache = {
  countries?: CountryMeta[];
  programsAll?: ProgramMeta[];
  mtimes?: Map<string, number>;
};
const _g = globalThis as any;
if (!_g.__CORPORATE_CACHE__) _g.__CORPORATE_CACHE__ = { mtimes: new Map() } as Cache;
const CACHE: Cache = _g.__CORPORATE_CACHE__;

/** Recursively get the newest mtime under the corporate content tree. */
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
      // ignore transient fs errors
    }
  }
  return max;
}

/* =========================
 * Normalizers (defensive)
 * =======================*/
function normalizeCountry(metaIn: Partial<CountryMeta>, slug: string): CountryMeta {
  const meta: any = { ...metaIn };
  const timeline = normalizeTimelineValue(meta.timelineMonths);
  const countrySlug = meta.countrySlug || slug;
  const country = meta.country || meta.title || toTitle(countrySlug);
  const title = meta.title || (typeof country === "string" ? country : toTitle(countrySlug));

  meta.introPoints = sanitizeStringArray(meta.introPoints);
  meta.tags = sanitizeStringArray(meta.tags);
  meta.keyPoints = sanitizeStringArray(meta.keyPoints);
  meta.requirements = sanitizeStringArray(meta.requirements);

  const fallbackHero = `/images/${countrySlug}.jpg`;
  meta.heroImage = toAbsolute(meta.heroImage, fallbackHero);
  meta.heroPoster = toAbsolute(meta.heroPoster, `/images/${countrySlug}-hero-poster.jpg`);

  return {
    ...meta,
    title: String(title),
    country: String(country),
    countrySlug: String(countrySlug),
    timelineMonths: timeline.months,
    timelineLabel: timeline.label,
    category: "corporate",
  } as CountryMeta;
}

function normalizeBadgeTone(t?: string): "indigo" | "emerald" | "amber" | "slate" {
  if (!t) return "indigo";
  const k = String(t).toLowerCase();
  if (k === "blue") return "indigo";
  if (k === "green" || k === "emerald") return "emerald";
  if (k === "yellow" || k === "amber") return "amber";
  if (k === "gray" || k === "slate") return "slate";
  return "indigo";
}

function normalizeProgram(metaIn: Partial<ProgramMeta>, cSlug: string, pSlug: string): ProgramMeta {
  const meta: any = { ...metaIn };
  meta.programSlug = meta.programSlug || pSlug;
  meta.countrySlug = meta.countrySlug || cSlug;
  meta.category = "corporate";

  if (meta.minInvestment !== undefined) meta.minInvestment = coerceNum(meta.minInvestment);
  if (meta.timelineMonths !== undefined) {
    const timeline = normalizeTimelineValue(meta.timelineMonths);
    meta.timelineMonths = timeline.months;
    meta.timelineLabel = timeline.label;
  }

  if (Array.isArray(meta.prices)) {
    meta.prices = meta.prices.map((row: any) => ({ ...row, amount: coerceNum(row?.amount) }));
  }
  if (Array.isArray(meta.proofOfFunds)) {
    meta.proofOfFunds = meta.proofOfFunds.map((row: any) => ({ ...row, amount: coerceNum(row?.amount) ?? 0 }));
  }
  if (Array.isArray(meta.governmentFees)) {
    meta.governmentFees = meta.governmentFees.map((row: any) => ({ ...row, amount: coerceNum(row?.amount) }));
  }

  meta.tags = sanitizeStringArray(meta.tags);
  meta.benefits = sanitizeStringArray(meta.benefits);
  meta.requirements = sanitizeStringArray(meta.requirements);
  meta.disqualifiers = sanitizeStringArray(meta.disqualifiers);

  if (meta.languageRequirements && typeof meta.languageRequirements === "object") {
    const lr = meta.languageRequirements as any;
    if (lr.tests && !Array.isArray(lr.tests)) lr.tests = [String(lr.tests)].filter(Boolean);
    if (lr.minLevel != null) lr.minLevel = String(lr.minLevel);
  }
  if (meta.languageMin && typeof meta.languageMin === "object") {
    const lm = meta.languageMin as any;
    if (lm.overall != null) lm.overall = coerceNum(lm.overall);
    if (lm.bands && typeof lm.bands === "object") {
      const b = lm.bands;
      b.listening = coerceNum(b.listening);
      b.reading = coerceNum(b.reading);
      b.writing = coerceNum(b.writing);
      b.speaking = coerceNum(b.speaking);
    }
  }

  // sponsorship/job-offer normalization
  if (typeof meta.jobOfferRequired === "string") {
    meta.jobOfferRequired = /^(true|yes|1)$/i.test(meta.jobOfferRequired);
  }
  if (meta.jobOffer && typeof meta.jobOffer === "object") {
    if (typeof meta.jobOffer.required === "string") {
      meta.jobOffer.required = /^(true|yes|1)$/i.test(meta.jobOffer.required);
    }
    if (!meta.jobOfferNote && meta.jobOffer.note) {
      meta.jobOfferNote = String(meta.jobOffer.note);
    }
  }

  // authority notes tone normalization
  if (Array.isArray(meta.authorityNotes)) {
    meta.authorityNotes = meta.authorityNotes.map((n: any) => ({
      ...n,
      badgeTone: normalizeBadgeTone(n?.badgeTone),
    }));
  }

  // Merge top-level `ctas` into quickCheck.ctas if present
  if (meta.ctas && (!meta.quickCheck || !meta.quickCheck.ctas)) {
    meta.quickCheck = { ...(meta.quickCheck || {}), ctas: meta.ctas };
  }

  const fallbackHero = `/images/${cSlug}.jpg`;
  meta.heroImage = toAbsolute(meta.heroImage, fallbackHero);
  if (meta.heroPoster) meta.heroPoster = toAbsolute(meta.heroPoster, `/images/${cSlug}-hero-poster.jpg`);
  if (meta.brochure) meta.brochure = toAbsolute(meta.brochure, meta.brochure);

  if (Array.isArray(meta.testimonials)) {
    meta.testimonials = meta.testimonials
      .map((t: any) => {
        if (!t) return null;
        if (typeof t === "string") return { quote: t };
        if (typeof t === "object") {
          const quote = (t as any).quote ?? String((t as any).q ?? "");
          const author = (t as any).author ?? (t as any).a;
          return quote ? { quote: String(quote), author: author ? String(author) : undefined } : null;
        }
        return null;
      })
      .filter(Boolean);
  }

  return meta as ProgramMeta;
}

/* =========================
 * Lists & slugs (cache keyed by recursive dir stamp)
 * =======================*/
export function getCorporateCountrySlugs(): string[] {
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

  return slugs;
}

export function getCorporateCountries(): CountryMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::countries`;

  const stamp = dirStamp(ROOT);
  if (CACHE.countries && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.countries;
  }

  const out: CountryMeta[] = [];
  for (const slug of getCorporateCountrySlugs()) {
    const file = path.join(ROOT, slug, "_country.mdx");
    if (!exists(file)) continue;
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const meta = normalizeCountry(data as Partial<CountryMeta>, slug);
    if (!meta.draft) out.push(meta);
  }

  const sorted = out.sort((a, b) => a.country.localeCompare(b.country));
  CACHE.countries = sorted;
  CACHE.mtimes ??= new Map<string, number>();
  CACHE.mtimes.set(cacheKey, Date.now());
  CACHE.mtimes.set(stampKey, stamp);
  return sorted;
}

export function getCorporateProgramSlugs(countrySlug: string): string[] {
  const dir = path.join(ROOT, countrySlug);
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".mdx") && n !== "_country.mdx")
    .map((n) => n.replace(/\.mdx$/, ""));
}

export function getCorporatePrograms(countrySlug?: string): ProgramMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::programsAll`;

  const stamp = dirStamp(ROOT);
  if (!countrySlug && CACHE.programsAll && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.programsAll;
  }

  const countries = countrySlug ? [countrySlug] : getCorporateCountrySlugs();
  const out: ProgramMeta[] = [];

  for (const c of countries) {
    for (const p of getCorporateProgramSlugs(c)) {
      const f = path.join(ROOT, c, `${p}.mdx`);
      const { data } = matter(fs.readFileSync(f, "utf8"));
      const meta = normalizeProgram(data as Partial<ProgramMeta>, c, p);
      if (!meta?.draft) out.push(meta);
    }
  }

  const sorted = out.sort((a, b) => (a.countrySlug + a.title).localeCompare(b.countrySlug + b.title));

  if (!countrySlug) {
    CACHE.programsAll = sorted;
    CACHE.mtimes ??= new Map<string, number>();
    CACHE.mtimes.set(cacheKey, Date.now());
    CACHE.mtimes.set(stampKey, stamp);
  }
  return sorted;
}

/* =========================
 * Renderers
 * =======================*/
export async function loadCountryPage(countrySlug: string) {
  const f = path.join(ROOT, countrySlug, "_country.mdx");
  const source = fs.readFileSync(f, "utf8");
  const { content, frontmatter } = await compileMDX<CountryMeta>({
    source,
    options: { parseFrontmatter: true, mdxOptions: baseMdxOptions as any },
  });

  const meta = normalizeCountry(frontmatter as Partial<CountryMeta>, countrySlug);
  return { content, meta };
}

export async function loadProgramPage(countrySlug: string, programSlug: string) {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const source = fs.readFileSync(f, "utf8");
  const { content, frontmatter } = await compileMDX<ProgramMeta>({
    source,
    options: { parseFrontmatter: true, mdxOptions: baseMdxOptions as any },
  });

  const meta = normalizeProgram(frontmatter as Partial<ProgramMeta>, countrySlug, programSlug);
  return { content, meta };
}

/* ========= Section-by-section renderer (non-breaking) ========= */
export async function loadProgramPageSections(
  countrySlug: string,
  programSlug: string,
): Promise<{ meta: ProgramMeta; sections: ProgramSections }> {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const raw = fs.readFileSync(f, "utf8");
  const { data, content: body } = matter(raw);

  const meta = normalizeProgram(data as Partial<ProgramMeta>, countrySlug, programSlug);
  const chunks = splitByH3(body);

  // Normalize/alias: ensure "overview" has meaningful content and no duplicate heading
  if (typeof chunks.overview === "string") {
    chunks.overview = stripLeadingProgramOverview(chunks.overview);
  }

  const entries = await Promise.all(
    Object.entries(chunks).map(async ([key, md]) => {
      const { content } = await compileMDX({
        source: md,
        options: { parseFrontmatter: false, mdxOptions: baseMdxOptions as any },
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
export function getProgramFrontmatter(countrySlug: string, programSlug: string) {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const { data } = matter(fs.readFileSync(f, "utf8"));
  return normalizeProgram(data as Partial<ProgramMeta>, countrySlug, programSlug);
}

export function getCountryFrontmatter(countrySlug: string) {
  const f = path.join(ROOT, countrySlug, "_country.mdx");
  const { data } = matter(fs.readFileSync(f, "utf8"));
  return normalizeCountry(data as Partial<CountryMeta>, countrySlug);
}

/* =========================
 * Sitemap helper
 * =======================*/
export function getCorporateUrls() {
  const urls: { url: string }[] = [{ url: "/corporate" }];
  for (const c of getCorporateCountrySlugs()) {
    urls.push({ url: `/corporate/${c}` });
    for (const p of getCorporateProgramSlugs(c)) {
      urls.push({ url: `/corporate/${c}/${p}` });
    }
  }
  return urls;
}

/* =========================
 * Dev helper
 * =======================*/
export function invalidateCorporateContentCache() {
  CACHE.countries = undefined;
  CACHE.programsAll = undefined;
}
