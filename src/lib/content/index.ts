import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { AnyDoc, HubDoc, ProgramDoc, Vertical } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const HUB_DIRS = new Set(["blog", "news", "articles", "media", "jobs"]);

const walk = (dir: string): string[] =>
  fs.readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return walk(full);
    return full.endsWith(".mdx") ? [full] : [];
  });

const toUrl = (file: string): string => {
  const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, "/");
  const segs = rel.split("/");
  if (HUB_DIRS.has(segs[0])) {
    const type = segs[0];
    const slug = path.basename(file, ".mdx");
    if (type === "jobs") return `/careers/${slug}`;
    return `/${type}/${slug}`;
  }
  const [vertical, country, fileName] = segs;
  const program = path.basename(fileName, ".mdx");
  if (program === "_country") return `/${vertical}/${country}`;
  return `/${vertical}/${country}/${program}`;
};

export function loadAllContent(): AnyDoc[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = walk(CONTENT_DIR);
  const out: AnyDoc[] = [];

  for (const file of files) {
    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, "/");
    const [a, b, c] = rel.split("/");
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);

    if (HUB_DIRS.has(a)) {
      out.push({
        kind: "hub",
        type: (a === "articles" ? "article" : a === "jobs" ? "job" : a) as HubDoc["type"],
        title: data.title ?? path.basename(file, ".mdx"),
        summary: data.summary ?? "",
        updatedAt: data.updatedAt ?? data.date ?? "",
        heroImage: data.heroImage ?? "",
        tags: data.tags ?? [],
        verticals: data.verticals ?? [],
        countries: data.countries ?? [],
        programs: data.programs ?? [],
        body: content,
        path: file,
        url: toUrl(file),
      } as HubDoc);
      continue;
    }

    const vertical = a as Vertical;
    const country = b;
    const fileName = c;

    if (!country || !fileName) continue;

    if (fileName === "_country.mdx") {
      out.push({
        kind: "hub",
        type: "article",
        title: data.title ?? `${country} ${vertical} overview`,
        summary: data.summary ?? "",
        updatedAt: data.updatedAt ?? "",
        heroImage: data.heroImage ?? "",
        tags: data.tags ?? [],
        verticals: [vertical],
        countries: [country],
        programs: [],
        body: content,
        path: file,
        url: toUrl(file),
      } as HubDoc);
      continue;
    }

    const program = path.basename(fileName, ".mdx");

    out.push({
      kind: "program",
      title: data.title ?? program,
      vertical,
      country,
      program,
      summary: data.summary ?? data.tagline ?? "",
      updatedAt: data.updatedAt ?? data.date ?? "",
      heroImage: data.heroImage ?? "",
      heroVideo: data.heroVideo ?? "",
      heroPoster: data.heroPoster ?? "",
      brochure: data.brochure ?? "",
      tags: data.tags ?? [],
      quickFacts: data.quickFacts ?? [],
      faq: data.faq ?? [],
      body: content,
      path: file,
      url: toUrl(file),
    } as ProgramDoc);
  }

  return out;
}

let _cache: AnyDoc[] | null = null;
export function getAllContentCached(): AnyDoc[] {
  if (!_cache) _cache = loadAllContent();
  return _cache;
}
export function invalidateContentCache() {
  _cache = null;
}
