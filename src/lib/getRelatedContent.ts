// src/lib/getRelatedContent.ts
import path from "node:path";
import fs from "node:fs/promises";
import type { SearchDoc, SearchIndexFile } from "@/types/search";

let _cache: SearchDoc[] | null = null;

async function loadIndex(): Promise<SearchDoc[]> {
  if (_cache) return _cache;
  const file = path.join(process.cwd(), "public", "search-index.json");
  const json = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(json) as SearchIndexFile | SearchDoc[];
  const docs = Array.isArray(parsed) ? (parsed as SearchDoc[]) : parsed.docs;
  _cache = docs;
  return docs;
}

type GetRelatedOpts = {
  countrySlug: string;
  programSlug?: string | null;
  limit?: number;
  includeTypes?: Array<SearchDoc["type"]>;
};

export async function getRelatedContent({
  countrySlug,
  programSlug = null,
  limit = 6,
  includeTypes = ["article", "news"],
}: GetRelatedOpts): Promise<SearchDoc[]> {
  const docs = await loadIndex();

  // Filter to articles/news first
  const pool = docs.filter((d) => includeTypes.includes(d.type));

  // Score function: country match >> program match >> tag and text hints
  const scoreDoc = (d: SearchDoc) => {
    let s = 0;
    if (d.countries?.includes(countrySlug)) s += 5;
    if (programSlug && d.programs?.includes(programSlug)) s += 4;

    // Loose tag boosts
    const t = (d.tags || []).map((x) => x.toLowerCase());
    if (t.includes("real estate")) s += 1;
    if (t.includes("donation")) s += 1;
    if (t.includes("startup visa")) s += 1;
    if (t.includes("employment pass")) s += 1;

    // Recency boost for articles/news with date
    const date = d.updated || d.date;
    if (date) {
      const ageDays = Math.max(
        0,
        (Date.now() - new Date(date).getTime()) / 86400000,
      );
      // 0 days -> +2, 180 days -> ~+1, 365+ -> ~+0.5
      s += Math.max(0.5, 2 - ageDays / 180);
    }
    return s;
  };

  const ranked = pool
    .map((d) => [d, scoreDoc(d)] as const)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);

  // Remove exact duplicates by id
  const seen = new Set<string>();
  const unique = ranked.filter((d) =>
    seen.has(d.id) ? false : (seen.add(d.id), true),
  );

  return unique.slice(0, limit);
}
