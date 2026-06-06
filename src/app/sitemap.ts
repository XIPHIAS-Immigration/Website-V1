// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getSiteUrl } from "../lib/seo/site";

export const runtime = "nodejs";
// regenerate periodically (good for content sites)
export const revalidate = 21600; // ✅ 6 hours

/* ------------------------------ config ---------------------------------- */

const APP_DIR = path.join(process.cwd(), "src", "app");

const RAW_CONTENT_DIRS = [
  path.join(process.cwd(), "content"),
  path.join(process.cwd(), "src", "content"),
];

// Only keep dirs that actually exist (prevents confusion + extra work)
const CONTENT_DIRS = RAW_CONTENT_DIRS.filter((p) => fs.existsSync(p));

// Keep this aligned with /app/robots.ts block list
const BLOCKLIST: Array<string | RegExp> = [
  /^\/api(\/|$)/,
  /^\/search(\/|$)/,
  /^\/thank-you(\/|$)/,
  /^\/login(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/preview(\/|$)/,
  /^\/draft(\/|$)/,
  /^\/private(\/|$)/,
];

/* ------------------------------ utils ----------------------------------- */

function isBlocked(route: string): boolean {
  return BLOCKLIST.some((rule) =>
    typeof rule === "string" ? route === rule : rule.test(route),
  );
}

/** Walk a directory recursively and return matching files */
function walk(
  dir: string,
  filter: (fullPath: string, d?: fs.Dirent) => boolean,
): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;

  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p, d)) out.push(p);
  }
  return out;
}

/** Remove route groups like (site) */
function cleanSegment(seg: string) {
  if (seg.startsWith("(") && seg.endsWith(")")) return "";
  return seg;
}

/** Remove accidental ranking suffix like "foo|3" */
function stripPipeSuffix(seg: string) {
  return seg.replace(/\|\d+$/, "");
}

/** Build route path from a folder containing a page.* under src/app */
function dirToRoute(dir: string): string | null {
  const rel = path.relative(APP_DIR, dir).replace(/\\/g, "/");
  if (!rel) return "/"; // app root

  const parts = rel
    .split("/")
    .map(cleanSegment)
    .map(stripPipeSuffix)
    .filter(Boolean);

  // Skip dynamic segments and any segment starting with '_' (internal)
  if (parts.some((p) => p.includes("[") || p.startsWith("_"))) return null;

  return "/" + parts.join("/");
}

/** Convert content path to route, supporting /content and /src/content */
function contentPathToRoute(file: string): string | null {
  const base = CONTENT_DIRS.find((root) => file.startsWith(root));
  if (!base) return null;

  const rel = path.relative(base, file).replace(/\\/g, "/");
  const noExt = rel.replace(/\.mdx?$/, "");
  let parts = noExt
    .split("/")
    .map(stripPipeSuffix)
    .filter(Boolean);

  // If leaf is "index" or starts with "_" (e.g. _country), drop it (map to parent)
  const leaf = parts[parts.length - 1];
  if (leaf === "index" || leaf.startsWith("_")) parts = parts.slice(0, -1);

  // Drop any other internal segments like "_foo" anywhere in the path
  parts = parts.filter((seg) => seg && !seg.startsWith("_"));

  if (parts.length === 0) return "/"; // safety
  return "/" + parts.join("/");
}

function parseMaybeDate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t);
}

/** Infer changefreq & priority from route depth */
function seoHintsFor(route: string): {
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
} {
  if (route === "/") return { changeFrequency: "daily", priority: 1.0 };

  const depth = route.split("/").filter(Boolean).length;
  if (depth === 1) return { changeFrequency: "weekly", priority: 0.8 };
  if (depth === 2) return { changeFrequency: "weekly", priority: 0.7 };
  return { changeFrequency: "monthly", priority: 0.5 };
}

/* -------------------------------- main ---------------------------------- */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/+$/, ""); // no trailing slash
  const urls: MetadataRoute.Sitemap = [];

  // 1) Static routes from src/app/**/page.*
  const staticPageFiles = walk(APP_DIR, (f) =>
    /\/page\.(tsx|ts|jsx|js)$/.test(f.replace(/\\/g, "/")),
  );

  for (const file of staticPageFiles) {
    const routeDir = path.dirname(file);
    const route = dirToRoute(routeDir);
    if (!route) continue;
    if (isBlocked(route)) continue;

    const stat = fs.statSync(file);
    const { changeFrequency, priority } = seoHintsFor(route);
    const url = `${base}${route === "/" ? "" : route}`;

    urls.push({
      url,
      lastModified: stat.mtime,
      changeFrequency,
      priority,
    });
  }

  // 2) Content-driven routes from /content/**/*.md(x) and /src/content/**/*.md(x)
  for (const root of CONTENT_DIRS) {
    const mdxFiles = walk(root, (f) => /\.mdx?$/.test(f));
    for (const file of mdxFiles) {
      try {
        const raw = fs.readFileSync(file, "utf8");
        const { data } = matter(raw) as { data: Record<string, any> };

        // Skip drafts / noindex from frontmatter
        if (data?.draft === true || data?.noindex === true) continue;

        const route = contentPathToRoute(file);
        if (!route || isBlocked(route)) continue;

        const lastmod =
          parseMaybeDate(data?.updatedAt) ||
          parseMaybeDate(data?.date) ||
          fs.statSync(file).mtime;

        const { changeFrequency, priority } = seoHintsFor(route);
        const url = `${base}${route === "/" ? "" : route}`;

        urls.push({
          url,
          lastModified: lastmod,
          changeFrequency,
          priority,
        });
      } catch {
        // ignore bad files
      }
    }
  }

  // 3) Ensure homepage exists
  if (!urls.some((u) => u.url === base || u.url === `${base}/`)) {
    urls.push({
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    });
  }

  // 4) Deduplicate by URL and sort (homepage first, then lexicographically)
  const seen = new Set<string>();
  const deduped = urls.filter((u) => {
    if (seen.has(u.url)) return false;
    seen.add(u.url);
    return true;
  });

  deduped.sort((a, b) => {
    if (a.url === base) return -1;
    if (b.url === base) return 1;
    return a.url.localeCompare(b.url);
  });

  return deduped;
}