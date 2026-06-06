// src/lib/skilled-content.ts
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
 * Types (Skilled — compatible with existing UI)
 * =======================*/
export type CurrencyCode =
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
  category: "skilled";
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

  // Skilled—optional helpers
  demandSectors?: string[];          // e.g., STEM, Healthcare, Construction
  shortageLists?: string[];          // e.g., "MLTSSL", "STSOL"
  languageTests?: string[];          // accepted tests (IELTS, PTE, CELPIP, TOEFL)
  lastUpdated?: string;              // ISO date
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

export type PointsRow = {
  category: string;            // e.g., "Age", "Education", "Work experience"
  max?: number;
  notes?: string;
};

export type GovernmentFee = {
  label: string;
  amount?: number;
  currency?: CurrencyCode;
  sourceLabel?: string;
  sourceUrl?: string;
};

export type SalaryExample = {
  role: string;
  amount: number;
  currency?: CurrencyCode;
};

export type OccupationList = {
  listName?: string;           // e.g., "MLTSSL", "ANZSCO 2023 list"
  occupations: string[];       // human-readable labels
};

export type ProgramMeta = {
  title: string;
  category: "skilled";
  country: string;
  countrySlug: string;
  programSlug: string;
  tagline?: string;

  /** For UI ranking/filters (existing fields kept for compatibility) */
  minInvestment?: number;              // reused for min salary / lowest cost
  currency?: CurrencyCode;
  timelineMonths?: number;
  timelineLabel?: string;
  tags?: string[];

  /** Skilled-specific */
  routeType?:
    | "points"
    | "employer"
    | "talent"
    | "graduate"
    | "working-holiday"
    | "startup"
    | "self-employed"
    | "other";

  // If provided, we alias to minInvestment so current UI keeps working
  minSalary?: number;
  salaryCurrency?: CurrencyCode;

  jobOfferRequired?: boolean;
  language?: {
    tests?: string[];          // "IELTS", "PTE", "CELPIP", etc.
    minLevel?: string;         // "IELTS 6.0", "CLB 7", "CEFR B2"
  };
  educationMin?: string;       // "Bachelor's", "Diploma + Trade"
  experienceMinYears?: number; // 0..N
  ageMax?: number;             // e.g., 45

  // Points-based systems
  pointsThreshold?: number;    // min invitation score
  pointsGrid?: PointsRow[];

  // Occupations
  occupationCodes?: string[];  // NOC/ANZSCO codes (short strings)
  occupationLists?: OccupationList[];

  // Fees & costs (optional; aligns with existing UI components)
  prices?: PriceRow[];
  proofOfFunds?: ProofOfFundsRow[];
  governmentFees?: GovernmentFee[];

  // Extra content for program page
  benefits?: string[];
  requirements?: string[];
  processSteps?: Step[];
  faq?: { q: string; a: string }[];
  brochure?: string;
  disqualifiers?: string[];
  quickCheck?: QuickCheckConfig;

  // Signals / guidance
  quotas?: number;
  salaryExamples?: SalaryExample[];
  riskNotes?: string[];
  complianceNotes?: string[];

  // Media/SEO
  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
  draft?: boolean;
  lastUpdated?: string;        // ISO date
};

/** Sections map returned by loadProgramPageSections */
export type ProgramSections = Record<string, ReactNode>;

/* =========================
 * Constants & tiny utils
 * =======================*/
const ROOT = path.join(process.cwd(), "content", "skilled");

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
  if (p.startsWith("/") || /^https?:\/\//i.test(p)) return p;
  return `/${p.replace(/^\.?\/*/, "")}`;
};

/** MDX options — NOTE: no `as const` so arrays aren't readonly */
const baseMdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
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

/** Split MDX body by top-level `###` headings (keeps the h3 line) */
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
      buf.push(line);
    } else {
      if (!current) {
        if (line.trim() === "") continue; // skip leading blanks
        current = nextKey("overview");
        buf.push("### Overview");
      }
      buf.push(line);
    }
  }
  flush();
  return out;
}

/* ============== Recursive dir-stamp cache ============== */
type Cache = {
  countries?: CountryMeta[];
  programsAll?: ProgramMeta[];
  mtimes?: Map<string, number>;
};
const _g = globalThis as any;
if (!_g.__SKILLED_CACHE__) _g.__SKILLED_CACHE__ = { mtimes: new Map() } as Cache;
const CACHE: Cache = _g.__SKILLED_CACHE__;

/** Recursively get the newest mtime under the skilled content tree. */
function dirStamp(rootDir: string): number {
  if (!exists(rootDir)) return 0;
  let max = 0;
  for (const e of fs.readdirSync(rootDir, { withFileTypes: true })) {
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
 * Sanitizers (handle YAML edge-cases)
 * =======================*/
function sanitizeStringArray(a?: unknown): string[] | undefined {
  if (!a) return undefined;
  if (Array.isArray(a)) {
    return a
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object") {
          const entries = Object.entries(v as Record<string, unknown>).map(
            ([k, val]) => `${k}: ${String(val)}`
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

function sanitizePointsGrid(grid?: unknown): PointsRow[] | undefined {
  if (!Array.isArray(grid)) return undefined;
  return grid
    .map((row: any) => ({
      category: String(row?.category ?? row?.title ?? ""),
      max: coerceNum(row?.max),
      notes: row?.notes ? String(row.notes) : undefined,
    }))
    .filter((r) => r.category);
}

function sanitizeGovernmentFees(fees?: unknown): GovernmentFee[] | undefined {
  if (!Array.isArray(fees)) return undefined;
  return fees.map((row: any) => ({
    label: String(row?.label ?? ""),
    amount: coerceNum(row?.amount),
    currency: row?.currency,
    sourceLabel: row?.sourceLabel ? String(row.sourceLabel) : undefined,
    sourceUrl: row?.sourceUrl ? String(row.sourceUrl) : undefined,
  }));
}

function sanitizeSalaryExamples(list?: unknown): SalaryExample[] | undefined {
  if (!Array.isArray(list)) return undefined;
  return list
    .map((row: any) => ({
      role: String(row?.role ?? ""),
      amount: coerceNum(row?.amount) ?? 0,
      currency: row?.currency,
    }))
    .filter((r) => r.role && r.amount > 0);
}

function sanitizeOccupationLists(a?: unknown): OccupationList[] | undefined {
  if (!Array.isArray(a)) return undefined;
  return a
    .map((item: any) => {
      const listName = item?.listName ? String(item.listName) : undefined;
      const occupations = sanitizeStringArray(item?.occupations) ?? [];
      return occupations.length ? { listName, occupations } : null;
    })
    .filter(Boolean) as OccupationList[];
}

/* =========================
 * Normalizers (defensive & backwards-compatible)
 * =======================*/
function normalizeCountry(
  metaIn: Partial<CountryMeta>,
  slug: string
): CountryMeta {
  const meta: any = { ...metaIn };
  const timeline = normalizeTimelineValue(meta.timelineMonths);

  const countrySlug = meta.countrySlug || slug;
  const country = meta.country || meta.title || toTitle(countrySlug);
  const title =
    meta.title || (typeof country === "string" ? country : toTitle(countrySlug));

  meta.introPoints = sanitizeStringArray(meta.introPoints);
  meta.tags = sanitizeStringArray(meta.tags);
  meta.demandSectors = sanitizeStringArray(meta.demandSectors);
  meta.shortageLists = sanitizeStringArray(meta.shortageLists);
  meta.languageTests = sanitizeStringArray(meta.languageTests);

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
    category: "skilled",
  } as CountryMeta;
}

function normalizeProgram(
  metaIn: Partial<ProgramMeta>,
  cSlug: string,
  pSlug: string
): ProgramMeta {
  const meta: any = { ...metaIn };

  meta.programSlug = meta.programSlug || pSlug;
  meta.countrySlug = meta.countrySlug || cSlug;
  meta.category = "skilled";

  // Backwards-compatible numeric coercions
  if (meta.minInvestment !== undefined) meta.minInvestment = coerceNum(meta.minInvestment);
  if (meta.timelineMonths !== undefined) {
    const timeline = normalizeTimelineValue(meta.timelineMonths);
    meta.timelineMonths = timeline.months;
    meta.timelineLabel = timeline.label;
  }
  if (meta.minSalary !== undefined) meta.minSalary = coerceNum(meta.minSalary);
  if (meta.experienceMinYears !== undefined)
    meta.experienceMinYears = coerceNum(meta.experienceMinYears);
  if (meta.ageMax !== undefined) meta.ageMax = coerceNum(meta.ageMax);
  if (meta.pointsThreshold !== undefined) meta.pointsThreshold = coerceNum(meta.pointsThreshold);
  if (meta.quotas !== undefined) meta.quotas = coerceNum(meta.quotas);
  if (typeof meta.jobOfferRequired !== "undefined")
    meta.jobOfferRequired = coerceBool(meta.jobOfferRequired);

  // If author provided minSalary/salaryCurrency but not minInvestment/currency,
  // alias them so existing UI chips (minInvestment + currency) show correct values.
  if (meta.minInvestment == null && meta.minSalary != null) {
    meta.minInvestment = meta.minSalary;
  }
  if (!meta.currency && meta.salaryCurrency) {
    meta.currency = meta.salaryCurrency;
  }

  // Arrays cleanup
  meta.tags = sanitizeStringArray(meta.tags);
  meta.benefits = sanitizeStringArray(meta.benefits);
  meta.requirements = sanitizeStringArray(meta.requirements);
  meta.disqualifiers = sanitizeStringArray(meta.disqualifiers);
  meta.riskNotes = sanitizeStringArray(meta.riskNotes);
  meta.complianceNotes = sanitizeStringArray(meta.complianceNotes);
  meta.occupationCodes = sanitizeStringArray(meta.occupationCodes);

  // Nested structures
  if (meta.language && typeof meta.language === "object") {
    meta.language.tests = sanitizeStringArray(meta.language.tests);
    if (meta.language.minLevel != null)
      meta.language.minLevel = String(meta.language.minLevel);
  }
  meta.pointsGrid = sanitizePointsGrid(meta.pointsGrid);
  meta.occupationLists = sanitizeOccupationLists(meta.occupationLists);
  meta.governmentFees = sanitizeGovernmentFees(meta.governmentFees);
  meta.salaryExamples = sanitizeSalaryExamples(meta.salaryExamples);

  // Prices & proof of funds coercion (kept for compatibility; can be hidden in UI)
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

  // Images: enforce root-absolute; fallback to country poster
  const fallbackPoster = `/images/countries/${cSlug}-hero-poster.jpg`;
  meta.heroImage = toAbsolute(meta.heroImage, fallbackPoster);
  if (meta.heroPoster) meta.heroPoster = toAbsolute(meta.heroPoster, fallbackPoster);

  return meta as ProgramMeta;
}

/* =========================
 * Lists & slugs (cache keyed by recursive dir stamp)
 * =======================*/
export function getSkilledCountrySlugs(): string[] {
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

export function getSkilledCountries(): CountryMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::countries`;
  const stamp = dirStamp(ROOT);

  if (CACHE.countries && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.countries;
  }

  const out: CountryMeta[] = [];
  for (const slug of getSkilledCountrySlugs()) {
    const file = path.join(ROOT, slug, "_country.mdx");
    if (!exists(file)) continue;
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const meta = normalizeCountry(data as Partial<CountryMeta>, slug);
    if (!meta.draft) out.push(meta);
  }

  const sorted = out.sort((a, b) => a.country.localeCompare(b.country));
  CACHE.countries = sorted;
  CACHE.mtimes?.set(cacheKey, Date.now());
  CACHE.mtimes?.set(stampKey, stamp);
  return sorted;
}

export function getSkilledProgramSlugs(countrySlug: string): string[] {
  const dir = path.join(ROOT, countrySlug);
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".mdx") && n !== "_country.mdx")
    .map((n) => n.replace(/\.mdx$/, ""));
}

export function getSkilledPrograms(countrySlug?: string): ProgramMeta[] {
  const stampKey = `${ROOT}::stamp`;
  const cacheKey = `${ROOT}::programsAll`;
  const stamp = dirStamp(ROOT);

  if (!countrySlug && CACHE.programsAll && CACHE.mtimes?.get(stampKey) === stamp) {
    return CACHE.programsAll;
  }

  const countries = countrySlug ? [countrySlug] : getSkilledCountrySlugs();
  const out: ProgramMeta[] = [];

  for (const c of countries) {
    for (const p of getSkilledProgramSlugs(c)) {
      const f = path.join(ROOT, c, `${p}.mdx`);
      const { data } = matter(fs.readFileSync(f, "utf8"));
      const meta = normalizeProgram(data as Partial<ProgramMeta>, c, p);
      if (!meta?.draft) out.push(meta);
    }
  }

  const sorted = out.sort((a, b) =>
    (a.countrySlug + a.title).localeCompare(b.countrySlug + b.title)
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

/* ========= Section-by-section renderer ========= */
export async function loadProgramPageSections(
  countrySlug: string,
  programSlug: string
): Promise<{ meta: ProgramMeta; sections: ProgramSections }> {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const raw = fs.readFileSync(f, "utf8");
  const { data, content: body } = matter(raw);

  const meta = normalizeProgram(data as Partial<ProgramMeta>, countrySlug, programSlug);
  const chunks = splitByH3(body);

  const entries = await Promise.all(
    Object.entries(chunks).map(async ([key, md]) => {
      const { content } = await compileMDX({
        source: md,
        options: { parseFrontmatter: false, mdxOptions: baseMdxOptions as any },
      });
      return [key, content] as const;
    })
  );

  const sections = Object.fromEntries(entries) as ProgramSections;
  return { meta, sections };
}

/* =========================
 * Insights helper (for Skilled pages)
 * =======================*/
export type InsightListItem = {
  title: string;
  url: string;
  source?: string;  // kind: "news" | "articles" | "media" | "blog"
  date?: string;    // ISO
  tag?: string;
  excerpt?: string;
};

function _tokens(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch newest insights (Articles/News/Media/Blog) related to a specific skilled program.
 * Requires src/lib/insights-content.ts to be present.
 *
 * Strategy:
 * 1) Strict filter by country+program (fast path)
 * 2) Loose keyword search (country + program + tags)
 * 3) Tag fallbacks
 * 4) Rank by match strength + recency
 */
export async function getInsightsForProgram(args: {
  country: string;      // slug or label (case-insensitive)
  program: string;      // slug or label (case-insensitive)
  tags?: string[];      // optional extra tag filters
  limit?: number;       // default 6
}): Promise<InsightListItem[]> {
  try {
    const mod = await import("./insights-content");
    const { getAllInsights } = mod as {
      getAllInsights: (p: {
        q?: string;
        kind?: "articles" | "news" | "media" | "blog";
        country?: string;
        program?: string;
        tag?: string;
        page?: number;
        pageSize?: number;
      }) => Promise<{ items: any[] }>;
    };

    const limit = args.limit ?? 6;
    const seen = new Set<string>();
    const bucket: any[] = [];
    const add = (list: any[]) => {
      for (const it of list ?? []) {
        if (!seen.has(it.url)) {
          seen.add(it.url);
          bucket.push(it);
        }
      }
    };

    // 1) STRICT: country + program
    const strict = await getAllInsights({
      country: args.country,
      program: args.program,
      page: 1,
      pageSize: 50,
    });
    add(strict.items);
    if (bucket.length >= limit) {
      return bucket.slice(0, limit).map(mapItem);
    }

    // 2) LOOSE: keyword search across title/summary/tags/country/program
    const qLoose = [
      _tokens(args.country),
      _tokens(args.program).replace(/\d+/g, (n) => ` ${n} `),
      ...(args.tags ?? []).map(_tokens),
    ]
      .filter(Boolean)
      .join(" ");
    const loose = await getAllInsights({ q: qLoose, page: 1, pageSize: 100 });
    add(loose.items);
    if (bucket.length >= limit) {
      return rank(bucket, args).slice(0, limit).map(mapItem);
    }

    // 3) TAG FALLBACKS
    for (const t of args.tags ?? []) {
      const byTag = await getAllInsights({ tag: t, page: 1, pageSize: 50 });
      add(byTag.items);
      if (bucket.length >= limit) break;
    }

    return rank(bucket, args).slice(0, limit).map(mapItem);
  } catch {
    return [];
  }
}

function rank(items: any[], args: { country: string; program: string; tags?: string[] }) {
  const lcCountry = _tokens(args.country);
  const lcProgram = _tokens(args.program);
  const tagSet = new Set((args.tags ?? []).map(_tokens));

  const score = (m: any) => {
    let s = 0;
    const countries = (m.country ?? []).map(_tokens);
    const programs = (m.program ?? []).map(_tokens);
    const tags = (m.tags ?? []).map(_tokens);
    const title = _tokens(m.title);

    if (countries.includes(lcCountry)) s += 4;                   // country match
    if (programs.includes(lcProgram)) s += 6;                    // program match
    if (lcProgram && title.includes(lcProgram)) s += 3;          // title mentions slug
    if (lcProgram && title.includes(lcProgram.replace(/\d+/g, ""))) s += 1; // looser title match
    for (const t of tags) if (tagSet.has(t)) s += 1;             // tag overlap

    // slight recency nudge
    const d = new Date(m.updated || m.date || 0).getTime();
    s += (isFinite(d) ? d : 0) / 1e13;

    return s;
  };

  return [...items].sort((a, b) => score(b) - score(a));
}

function mapItem(m: any): InsightListItem {
  return {
    title: m.title,
    url: m.url,
    source: m.kind,
    date: m.updated ?? m.date,
    tag: (m.tags ?? [])[0],
    excerpt: m.summary,
  };
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
export function getSkilledUrls() {
  const urls: { url: string }[] = [{ url: "/skilled" }];
  for (const c of getSkilledCountrySlugs()) {
    urls.push({ url: `/skilled/${c}` });
    for (const p of getSkilledProgramSlugs(c)) {
      urls.push({ url: `/skilled/${c}/${p}` });
    }
  }
  return urls;
}

/* =========================
 * Dev helper
 * =======================*/
export function invalidateSkilledContentCache() {
  CACHE.countries = undefined;
  CACHE.programsAll = undefined;
}
