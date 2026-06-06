// src/lib/residency-content.ts
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
 * Types
 * =======================*/
export type CountryMeta = {
  title: string;
  category: "residency";
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
};

export type Step = { title: string; description?: string };

export type GovernmentFee = {
  label: string;
  amount?: number;
  currency?: "USD" | "EUR" | "AED" | "INR" | "CAD" | "GBP" | "CHF";
  sourceLabel?: string;
  sourceUrl?: string;
};

export type PriceRow = {
  label: string;
  amount?: number;
  currency?: "USD" | "EUR" | "AED" | "INR" | "CAD" | "GBP" | "CHF";
  when?: string;
  notes?: string;
};

export type ProofOfFundsRow = {
  label?: string;
  amount: number;
  currency?: "USD" | "EUR" | "AED" | "INR" | "CAD" | "GBP" | "CHF";
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
  ctas?: {
    primaryHref?: string;
    primaryText?: string;
    secondaryHref?: string;
    secondaryText?: string;
  };
};

export type DocumentChecklistGroup = {
  group: string;
  documents: string[];
  notes?: string;
};

export type FamilyMatrix = {
  childrenUpTo?: number;
  parentsFromAge?: number;
  siblings?: boolean;
  spouse?: boolean;
};

export type ProjectRow = {
  name: string;
  minBuyIn?: number;
  holdMonths?: number;
  notes?: string;
  image?: string;
};

export type CostEstimatorConfig = {
  baseOptions?: {
    id: string;
    label: string;
    amount: number;
  }[];
  defaultBaseId?: string;
  adults?: number;
  children?: number;
  addons?: {
    id: string;
    label: string;
    amount: number;
    per?: "application" | "adult" | "child";
  }[];
};

export type ProgramMeta = {
  title: string;
  category: "residency";
  country: string;
  countrySlug: string;
  programSlug: string;
  tagline?: string;
  minInvestment?: number;
  currency?: "USD" | "EUR" | "AED" | "INR" | "CAD" | "GBP" | "CHF";
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
  routeType?: string;
  holdingPeriodMonths?: number;
  lastUpdated?: string;
  governmentFees?: GovernmentFee[];
  riskNotes?: string[];
  complianceNotes?: string[];
  projectList?: ProjectRow[];
  documentChecklist?: DocumentChecklistGroup[];
  familyMatrix?: FamilyMatrix;
  costEstimator?: CostEstimatorConfig;
  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
  draft?: boolean;
};

export type ProgramSections = Record<string, ReactNode>;

/* =========================
 * Constants & tiny utils
 * =======================*/
const ROOT = path.join(process.cwd(), "content", "residency");
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
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return undefined;
};

const coerceStringArray = (v: unknown): string[] | undefined => {
  if (typeof v === "string") {
    const s = v.trim();
    return s ? [s] : undefined;
  }
  if (!Array.isArray(v)) return undefined;
  const out = v
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return out.length ? out : undefined;
};

const normalizeAssetPath = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s.replace(/^\.?\/*/, "")}`;
};

const publicAssetExists = (assetPath: string): boolean => {
  if (/^https?:\/\//i.test(assetPath)) return true;
  const localPath = assetPath.split(/[?#]/, 1)[0];
  return exists(path.join(process.cwd(), "public", localPath.replace(/^\/+/, "")));
};

const resolveProjectImage = (v: unknown): string => {
  const assetPath = normalizeAssetPath(v);
  if (!assetPath) return DEFAULT_PROJECT_IMAGE;
  return publicAssetExists(assetPath) ? assetPath : DEFAULT_PROJECT_IMAGE;
};

/** MDX options */
const baseMdxOptions: any = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
};

/** slugify section titles */
function slugify(h: string) {
  return h
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Split MDX by H2/H3 headings into named sections.
 * - Supports "##" and "###".
 * - Content before first heading becomes "overview".
 * - Deduplicates equal headings with -2, -3, ...
 */
function splitByHeadings(md: string): Record<string, string> {
  const lines = md.split(/\r?\n/);
  const out: Record<string, string> = {};
  let current = "overview";
  let buf: string[] = [];
  const counts = new Map<string, number>();

  const nextKey = (raw: string) => {
    const base = slugify(raw);
    const n = (counts.get(base) || 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const flush = () => {
    const content = buf.join("\n").trim();
    if (content) out[current] = content;
    buf = [];
  };

  for (const line of lines) {
    const m = /^#{2,3}\s+(.+?)\s*$/.exec(line); // H2 or H3
    if (m) {
      flush();
      current = nextKey(m[1]);
      // skip the heading line itself
    } else {
      buf.push(line);
    }
  }
  flush();

  if (!("overview" in out)) out.overview = "";
  return out;
}

/* =========================
 * Lightweight in-memory cache (dev-friendly)
 * =======================*/
type Cache = {
  countries?: CountryMeta[];
  programsAll?: ProgramMeta[];
  mtimes?: Map<string, number>;
};
const _g = globalThis as any;
if (!_g.__RESIDENCY_CACHE__) _g.__RESIDENCY_CACHE__ = { mtimes: new Map() } as Cache;
const CACHE: Cache = _g.__RESIDENCY_CACHE__ as Cache;

function mtime(file: string) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}
function touchCacheForDir(dir: string) {
  if (!exists(dir)) return 0;
  let max = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const t = mtime(full);
    if (t > max) max = t;
  }
  return max;
}

/* =========================
 * Normalizers
 * =======================*/
function normalizeCountry(meta: Partial<CountryMeta>, slug: string): CountryMeta {
  const timeline = normalizeTimelineValue((meta as any).timelineMonths);
  const countrySlug = meta.countrySlug || slug;
  const country = meta.country || meta.title || toTitle(countrySlug);
  const title = meta.title || (typeof country === "string" ? country : toTitle(countrySlug));
  const heroImage = meta.heroImage || `/images/${countrySlug}.jpg`;
  return {
    ...meta,
    title: String(title),
    country: String(country),
    countrySlug: String(countrySlug),
    heroImage: String(heroImage),
    timelineMonths: timeline.months,
    timelineLabel: timeline.label,
    category: "residency",
  } as CountryMeta;
}

function normalizeProgram(
  metaIn: Partial<ProgramMeta>,
  cSlug: string,
  pSlug: string,
): ProgramMeta {
  const meta: any = { ...metaIn };

  // tolerate misspellings from content (e.g., "procesSteps")
  if (meta.procesSteps && !meta.processSteps) meta.processSteps = meta.procesSteps;
  if (meta.applicationProcess && !meta.processSteps) meta.processSteps = meta.applicationProcess;
  if (meta.governmentfees && !meta.governmentFees) meta.governmentFees = meta.governmentfees;
  if (meta.risknotes && !meta.riskNotes) meta.riskNotes = meta.risknotes;
  if (meta.compliancenotes && !meta.complianceNotes)
    meta.complianceNotes = meta.compliancenotes;

  meta.programSlug = meta.programSlug || pSlug;
  meta.countrySlug = meta.countrySlug || cSlug;
  meta.category = "residency";

  if (meta.minInvestment !== undefined) meta.minInvestment = coerceNum(meta.minInvestment);
  if (meta.timelineMonths !== undefined) {
    const timeline = normalizeTimelineValue(meta.timelineMonths);
    meta.timelineMonths = timeline.months;
    meta.timelineLabel = timeline.label;
  }
  if (meta.holdingPeriodMonths !== undefined)
    meta.holdingPeriodMonths = coerceNum(meta.holdingPeriodMonths);

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
  if (Array.isArray(meta.processSteps)) {
    meta.processSteps = meta.processSteps
      .map((row: any) => {
        if (typeof row === "string") return { title: row };
        if (!row || typeof row !== "object") return null;
        const title = String(row.title ?? row.name ?? row.step ?? "").trim();
        if (!title) return null;
        const description =
          typeof row.description === "string" && row.description.trim()
            ? row.description.trim()
            : undefined;
        return { ...row, title, description };
      })
      .filter(Boolean);
  }
  if (Array.isArray(meta.governmentFees)) {
    meta.governmentFees = meta.governmentFees.map((row: any) => ({
      ...row,
      amount: coerceNum(row?.amount),
    }));
  }
  meta.riskNotes = coerceStringArray(meta.riskNotes);
  meta.complianceNotes = coerceStringArray(meta.complianceNotes);
  if (Array.isArray(meta.projectList)) {
    meta.projectList = meta.projectList.map((row: any) => ({
      ...row,
      minBuyIn: coerceNum(row?.minBuyIn),
      holdMonths: coerceNum(row?.holdMonths),
      image: resolveProjectImage(row?.image),
    }));
  }
  if (Array.isArray(meta.documentChecklist)) {
    meta.documentChecklist = meta.documentChecklist
      .map((row: any) => {
        const group = typeof row?.group === "string" ? row.group.trim() : "";
        const documents = Array.isArray(row?.documents)
          ? row.documents
              .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
              .filter(Boolean)
          : [];
        if (!group || !documents.length) return null;
        return {
          group,
          documents,
          notes:
            typeof row?.notes === "string" && row.notes.trim() ? row.notes.trim() : undefined,
        };
      })
      .filter(Boolean);
  }
  if (meta.familyMatrix && typeof meta.familyMatrix === "object") {
    meta.familyMatrix = {
      ...meta.familyMatrix,
      childrenUpTo: coerceNum(meta.familyMatrix.childrenUpTo),
      parentsFromAge: coerceNum(meta.familyMatrix.parentsFromAge),
      siblings: Boolean(meta.familyMatrix.siblings),
      spouse:
        meta.familyMatrix.spouse === undefined ? undefined : Boolean(meta.familyMatrix.spouse),
    };
  }
  if (meta.costEstimator && typeof meta.costEstimator === "object") {
    meta.costEstimator = {
      ...meta.costEstimator,
      adults: coerceNum(meta.costEstimator.adults),
      children: coerceNum(meta.costEstimator.children),
      baseOptions: Array.isArray(meta.costEstimator.baseOptions)
        ? meta.costEstimator.baseOptions
            .map((row: any) => {
              const id = typeof row?.id === "string" ? row.id.trim() : "";
              const label = typeof row?.label === "string" ? row.label.trim() : "";
              const amount = coerceNum(row?.amount);
              if (!id || !label || amount === undefined) return null;
              return { id, label, amount };
            })
            .filter(Boolean)
        : undefined,
      addons: Array.isArray(meta.costEstimator.addons)
        ? meta.costEstimator.addons
            .map((row: any) => {
              const id = typeof row?.id === "string" ? row.id.trim() : "";
              const label = typeof row?.label === "string" ? row.label.trim() : "";
              const amount = coerceNum(row?.amount);
              if (!id || !label || amount === undefined) return null;
              return {
                id,
                label,
                amount,
                per:
                  row?.per === "application" || row?.per === "adult" || row?.per === "child"
                    ? row.per
                    : undefined,
              };
            })
            .filter(Boolean)
        : undefined,
    };
  }

  return meta as ProgramMeta;
}

/* =========================
 * Lists & slugs
 * =======================*/
export function getResidencyCountrySlugs(): string[] {
  if (!exists(ROOT)) return [];
  const cacheKey = `${ROOT}::countries_dir_mtime`;
  const dirMtime = touchCacheForDir(ROOT);
  if (CACHE.countries && CACHE.mtimes?.get(cacheKey) === dirMtime) {
    return CACHE.countries.map((c) => c.countrySlug);
  }
  const slugs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  CACHE.mtimes?.set(cacheKey, dirMtime);
  return slugs;
}

export function getResidencyCountries(): CountryMeta[] {
  const dirMtime = touchCacheForDir(ROOT);
  const cacheKey = `${ROOT}::countries`;
  const cacheStamp = `${ROOT}::countries_dir_mtime`;

  if (CACHE.countries && CACHE.mtimes?.get(cacheStamp) === dirMtime) {
    return CACHE.countries;
  }

  const out: CountryMeta[] = [];
  for (const slug of getResidencyCountrySlugs()) {
    const file = path.join(ROOT, slug, "_country.mdx");
    if (!exists(file)) continue;
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const meta = normalizeCountry(data as Partial<CountryMeta>, slug);
    if (!meta.draft) out.push(meta);
  }

  const sorted = out.sort((a, b) => a.country.localeCompare(b.country));
  CACHE.countries = sorted;
  CACHE.mtimes?.set(cacheKey, Date.now());
  CACHE.mtimes?.set(`${ROOT}::countries_dir_mtime`, dirMtime);
  return sorted;
}

export function getResidencyProgramSlugs(countrySlug: string): string[] {
  const dir = path.join(ROOT, countrySlug);
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".mdx") && n !== "_country.mdx")
    .map((n) => n.replace(/\.mdx$/, ""));
}

export function getResidencyPrograms(countrySlug?: string): ProgramMeta[] {
  const dirMtime = touchCacheForDir(ROOT);
  const cacheKey = `${ROOT}::programsAll`;
  const cacheStamp = `${ROOT}::programs_dir_mtime`;

  if (!countrySlug && CACHE.programsAll && CACHE.mtimes?.get(cacheStamp) === dirMtime) {
    return CACHE.programsAll;
  }

  const countries = countrySlug ? [countrySlug] : getResidencyCountrySlugs();
  const out: ProgramMeta[] = [];

  for (const c of countries) {
    for (const p of getResidencyProgramSlugs(c)) {
      const f = path.join(ROOT, c, `${p}.mdx`);
      const { data } = matter(fs.readFileSync(f, "utf8"));
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
    CACHE.mtimes?.set(cacheStamp, dirMtime);
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
    options: {
      parseFrontmatter: true,
      mdxOptions: baseMdxOptions,
    },
  });

  const meta = normalizeCountry(frontmatter as Partial<CountryMeta>, countrySlug);
  return { content, meta };
}

export async function loadProgramPage(countrySlug: string, programSlug: string) {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const source = fs.readFileSync(f, "utf8");

  const { content, frontmatter } = await compileMDX<ProgramMeta>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: baseMdxOptions,
    },
  });

  const meta = normalizeProgram(frontmatter as Partial<ProgramMeta>, countrySlug, programSlug);
  return { content, meta };
}

/* ========= Section-by-section renderer ========= */
export async function loadProgramPageSections(
  countrySlug: string,
  programSlug: string,
): Promise<{ meta: ProgramMeta; sections: ProgramSections }> {
  const f = path.join(ROOT, countrySlug, `${programSlug}.mdx`);
  const raw = fs.readFileSync(f, "utf8");
  const { data, content: body } = matter(raw);

  const meta = normalizeProgram(data as Partial<ProgramMeta>, countrySlug, programSlug);
  const chunks = splitByHeadings(body);

  const entries = await Promise.all(
    Object.entries(chunks).map(async ([key, md]) => {
      const { content } = await compileMDX({
        source: md,
        options: {
          parseFrontmatter: false,
          mdxOptions: baseMdxOptions,
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
export function getResidencyUrls() {
  const urls: { url: string }[] = [{ url: "/residency" }];
  for (const c of getResidencyCountrySlugs()) {
    urls.push({ url: `/residency/${c}` });
    for (const p of getResidencyProgramSlugs(c)) {
      urls.push({ url: `/residency/${c}/${p}` });
    }
  }
  return urls;
}

/* =========================
 * Dev helper
 * =======================*/
export function invalidateResidencyContentCache() {
  CACHE.countries = undefined;
  CACHE.programsAll = undefined;
}
