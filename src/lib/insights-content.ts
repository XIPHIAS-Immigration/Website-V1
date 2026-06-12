// src/lib/insights-content.ts
"use server";
import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypePrefixRelativeAssetUrls } from "@/lib/mdx-plugins";
import {
  listContentAdminRuntimeSources,
  listDeletedContentAdminKeys,
} from "@/lib/content-admin/store";

import mdxComponents from "@/components/MDX/registry";

import type {
  Facets,
  GetAllInsightsParams,
  Heading,
  InsightKind,
  InsightMeta,
  InsightRecord,
} from "@/types/insights";

/* ────────────────────────────────────────────────────────────────────────── */
/* constants                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const INSIGHT_KINDS: InsightKind[] = ["articles", "news", "media", "blog"];
const DEV = process.env.NODE_ENV !== "production";
const RUNTIME_CACHE_MS = Number(process.env.XIPHIAS_INSIGHTS_CACHE_MS || 5000);

// Safety caps (no UI changes; just prevents edge-case abuse)
const MAX_PAGE_SIZE = 50;

/* ────────────────────────────────────────────────────────────────────────── */
/* types                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

type RawDoc = {
  kind: InsightKind;
  slug: string;
  filePath: string;
  source: string;
  data: Record<string, unknown>;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function assertKind(kind: string): kind is InsightKind {
  return INSIGHT_KINDS.includes(kind as InsightKind);
}

function toUrl(kind: InsightKind, slug: string) {
  switch (kind) {
    case "articles":
      return `/articles/${slug}`;
    case "news":
      return `/news/${slug}`;
    case "media":
      return `/media/${slug}`;
    case "blog":
      return `/blog/${slug}`;
  }
}

function rawDocKey(kind: InsightKind, slug: string) {
  return `${kind}:${slug}`;
}

function relativeAssetBaseForKind(kind: InsightKind) {
  switch (kind) {
    case "articles":
      return "/images/articles";
    case "news":
      return "/images/news";
    case "media":
      return "/images/media";
    case "blog":
    default:
      return "/images/blogs";
  }
}

function normalizeArray(val?: unknown): string[] | undefined {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val.map((v) => String(v));
  const s = String(val).trim();
  if (!s) return undefined;
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function coerceString(val?: unknown): string | undefined {
  if (val == null) return undefined;
  const s = String(val).trim();
  return s || undefined;
}

function isHiddenInsight(data: Record<string, unknown>) {
  return (
    data.draft === true ||
    (data as any).hidden === true ||
    coerceString((data as any).visibility)?.toLowerCase() === "hidden" ||
    coerceString((data as any).status)?.toLowerCase() === "hidden"
  );
}

function readingTimeMins(text: string) {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(text: string, existing: Set<string>) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\/^$*+?.()|[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let out = base;
  let i = 1;
  while (existing.has(out)) out = `${base}-${i++}`;
  existing.add(out);
  return out;
}

function extractHeadingsForToc(source: string): Heading[] {
  const lines = source.split(/\r?\n/);
  const seen = new Set<string>();
  const res: Heading[] = [];
  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    const h3 = /^###\s+(.*)$/.exec(line);
    if (h2)
      res.push({ id: slugify(h2[1], seen), text: h2[1].trim(), depth: 2 });
    else if (h3)
      res.push({ id: slugify(h3[1], seen), text: h3[1].trim(), depth: 3 });
  }
  return res;
}

// Safe date parsing: never returns NaN
function safeDateMs(meta: Pick<InsightMeta, "updated" | "date">) {
  const s = meta.updated || meta.date;
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

function sortByDateDesc(a: InsightMeta, b: InsightMeta) {
  return safeDateMs(b) - safeDateMs(a);
}

function clampInt(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.floor(x);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* disk scan                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

async function loadRawDocs(): Promise<RawDoc[]> {
  const patterns = [
    "content/articles/**/*.mdx",
    "content/news/**/*.mdx",
    "content/media/**/*.mdx",
    "content/blog/**/*.mdx",
  ];

  const files = await fg(patterns, {
    cwd: process.cwd(),
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  if (DEV) console.log(`[insights] matched files: ${files.length}`);

  const deletedRuntimeKeys = new Set(await listDeletedContentAdminKeys());
  const out = new Map<string, RawDoc>();
  for (const filePath of files) {
    const file = await fs.readFile(filePath, "utf8");
    const { content, data } = matter(file);

    const relFromContent = path.relative(
      path.join(process.cwd(), "content"),
      filePath,
    );
    const kindDir = relFromContent.split(path.sep)[0];
    if (!assertKind(kindDir)) continue;

    const slug = path.basename(filePath).replace(/(?:\.mdx)+$/i, "");
    const key = rawDocKey(kindDir, slug);
    if (deletedRuntimeKeys.has(key) || isHiddenInsight(data)) continue;

    out.set(key, {
      kind: kindDir as InsightKind,
      slug,
      filePath,
      source: content,
      data,
    });
  }

  const runtimeDocs = await listContentAdminRuntimeSources();
  for (const doc of runtimeDocs) {
    if (!assertKind(doc.kind)) continue;
    const { content, data } = matter(doc.source);
    const key = rawDocKey(doc.kind, doc.slug);
    if (isHiddenInsight(data)) {
      out.delete(key);
      continue;
    }

    out.set(key, {
      kind: doc.kind,
      slug: doc.slug,
      filePath: doc.filePath,
      source: content,
      data,
    });
  }

  return Array.from(out.values());
}

/* ────────────────────────────────────────────────────────────────────────── */
/* meta                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function metaFromRaw(raw: RawDoc): InsightMeta {
  const title = coerceString(raw.data.title) ?? raw.slug;

  // Summary: accept common aliases from MDX
  const summary =
    coerceString(raw.data.summary) ||
    coerceString((raw.data as any).excerpt) ||
    coerceString((raw.data as any).description) ||
    coerceString((raw.data as any).subtitle) ||
    undefined;

  // Support string or { name: string }
  const author =
    coerceString(raw.data.author) ??
    coerceString((raw.data as any).author?.name);

  const country =
    normalizeArray(raw.data.country) ??
    normalizeArray((raw.data as any).countries);
  const program =
    normalizeArray(raw.data.program) ??
    normalizeArray((raw.data as any).programs);
  const tags = normalizeArray(raw.data.tags) ?? [];

  // Hero image: accept many aliases
  const hero =
    coerceString((raw.data as any).hero) ||
    coerceString((raw.data as any).heroImage) ||
    coerceString((raw.data as any).cover) ||
    coerceString((raw.data as any).coverImage) ||
    coerceString((raw.data as any).featuredImage) ||
    coerceString((raw.data as any).featured_image) ||
    coerceString((raw.data as any).image) ||
    coerceString((raw.data as any).thumbnail) ||
    coerceString((raw.data as any).thumb) ||
    coerceString((raw.data as any).banner) ||
    coerceString((raw.data as any).ogImage) ||
    coerceString((raw.data as any).og_image) ||
    undefined;

  const heroAlt =
    coerceString((raw.data as any).heroAlt) ||
    coerceString((raw.data as any).imageAlt) ||
    title;

  // Detail hero video/poster (optional)
  const heroVideo =
    coerceString((raw.data as any).heroVideo) ||
    coerceString((raw.data as any).video) ||
    coerceString((raw.data as any).videoSrc);

  const heroPoster =
    coerceString((raw.data as any).heroPoster) ||
    coerceString((raw.data as any).poster) ||
    undefined;

  const date = coerceString(raw.data.date);
  const updated =
    coerceString((raw.data as any).updated) ||
    coerceString((raw.data as any).lastmod);

  const url = toUrl(raw.kind, raw.slug);
  const readingTime = readingTimeMins(raw.source);

  return {
    kind: raw.kind,
    slug: raw.slug,
    title,
    summary,
    author,
    country: country && country.length ? country : undefined,
    program: program && program.length ? program : undefined,
    tags,
    hero: hero || undefined,
    heroAlt,
    heroVideo,
    heroPoster,
    date,
    updated,
    readingTimeMins: readingTime,
    url,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* cache                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

let _cache: { metas: InsightMeta[]; raw: RawDoc[]; loadedAt: number } | null =
  null;

export async function invalidateInsightsCache() {
  _cache = null;
}

async function ensureCache() {
  if (!DEV && _cache && Date.now() - _cache.loadedAt < RUNTIME_CACHE_MS) return _cache; // brief reuse in prod

  const raw = await loadRawDocs();
  const metas = raw.map(metaFromRaw).sort(sortByDateDesc);
  const next = { metas, raw, loadedAt: Date.now() };
  if (!DEV) _cache = next;
  return next;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* queries                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export async function getAllInsights(params: GetAllInsightsParams = {}) {
  const { metas } = await ensureCache();
  const { q, kind, country, program, tag } = params;

  // Clamp page/pageSize safely (no UI changes for normal usage)
  const safePage = Math.max(1, clampInt((params as any).page ?? 1, 1));
  const safePageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, clampInt((params as any).pageSize ?? 12, 12)),
  );

  let filtered = metas.slice();

  if (kind) filtered = filtered.filter((m) => m.kind === kind);

  if (country)
    filtered = filtered.filter((m) =>
      (m.country ?? [])
        .map((c: string) => c.toLowerCase())
        .includes(country.toLowerCase()),
    );

  if (program)
    filtered = filtered.filter((m) =>
      (m.program ?? [])
        .map((p: string) => p.toLowerCase())
        .includes(program.toLowerCase()),
    );

  if (tag)
    filtered = filtered.filter((m) =>
      (m.tags ?? [])
        .map((t: string) => t.toLowerCase())
        .includes(tag.toLowerCase()),
    );

  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((m) => {
      const hay = [
        m.title,
        m.summary,
        (m.tags ?? []).join(" "),
        (m.country ?? []).join(" "),
        (m.program ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }

  filtered.sort(sortByDateDesc);

  const total = filtered.length;
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  const items = filtered.slice(start, end);

  return { items, total, page: safePage, pageSize: safePageSize };
}

export async function getInsightsFacets(): Promise<Facets> {
  const { metas } = await ensureCache();
  const kinds: InsightKind[] = Array.from(
    new Set(metas.map((m) => m.kind)),
  ) as InsightKind[];

  const countries = Array.from(
    new Set(metas.flatMap((m) => m.country ?? [])),
  ).sort((a, b) => a.localeCompare(b));

  const programs = Array.from(
    new Set(metas.flatMap((m) => m.program ?? [])),
  ).sort((a, b) => a.localeCompare(b));

  const tags = Array.from(new Set(metas.flatMap((m) => m.tags ?? []))).sort(
    (a, b) => a.localeCompare(b),
  );

  return { kinds, countries, programs, tags };
}

export async function getInsightBySlug(
  kind: InsightKind,
  slug: string,
): Promise<InsightRecord | null> {
  const { raw } = await ensureCache();
  const entry = raw.find((r) => r.kind === kind && r.slug === slug);
  if (!entry) return null;

  const headings = extractHeadingsForToc(entry.source);

  // MDX components registry (must include FAQSection)
  const componentsMap = (mdxComponents as Record<string, unknown>) || {};
  if (DEV) console.log("[mdx components keys]", Object.keys(componentsMap));

  const args = {
    source: entry.source,
    components: componentsMap as Record<string, any>,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm] as any,
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["anchor"] },
            },
          ],
          [rehypePrefixRelativeAssetUrls, relativeAssetBaseForKind(kind)],
        ] as any,
      },
    },
  } as unknown as Parameters<typeof compileMDX>[0];

  // Harden: one broken MDX should not 500 in production
  let content: any;
  try {
    const res = await compileMDX(args);
    content = res.content;
  } catch (err) {
    if (DEV) throw err; // fail loudly in dev so you fix the MDX fast
    console.error(
      `[insights] MDX compile failed: kind=${kind} slug=${slug} file=${entry.filePath}`,
      err,
    );
    return null; // becomes 404 instead of 500
  }

  const meta = metaFromRaw(entry);
  return { ...meta, headings, content };
}

export async function getRelatedContent(
  current: InsightMeta,
  limit = 3,
): Promise<InsightMeta[]> {
  const { metas } = await ensureCache();

  const safeLimit = Math.max(1, Math.min(12, clampInt(limit, 3)));

  const curTags = new Set(
    (current.tags ?? []).map((t: string) => t.toLowerCase()),
  );
  const curCountries = new Set(
    (current.country ?? []).map((c: string) => c.toLowerCase()),
  );
  const curPrograms = new Set(
    (current.program ?? []).map((p: string) => p.toLowerCase()),
  );

  const scored = metas
    .filter((m) => m.url !== current.url)
    .map((m) => {
      let score = 0;
      for (const t of m.tags ?? [])
        if (curTags.has(t.toLowerCase())) score += 2;
      for (const c of m.country ?? [])
        if (curCountries.has(c.toLowerCase())) score += 1;
      for (const p of m.program ?? [])
        if (curPrograms.has(p.toLowerCase())) score += 1;
      if (m.kind === current.kind) score += 1;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || sortByDateDesc(a.m, b.m));

  return scored.slice(0, safeLimit).map((x) => x.m);
}
