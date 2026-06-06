import { NextRequest } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import MiniSearch from "minisearch";
import type {
  SearchDoc,
  SearchIndexFile,
  ApiSearchResponse,
} from "@/types/search";

export const runtime = "nodejs"; // Fuse/MiniSearch prefer Node
export const dynamic = "force-dynamic";
export const revalidate = 0;

let cachedDocs: SearchDoc[] | null = null;
let mini: MiniSearch<SearchDoc> | null = null;

function expandQuery(q: string) {
  // Simple synonym/alias expansion
  const normalized = q.toLowerCase();
  const add: string[] = [];
  if (normalized.includes("golden visa"))
    add.push(
      "residency by investment",
      "greece golden visa",
      "portugal golden visa",
    );
  if (/\bcbi\b/.test(normalized)) add.push("citizenship by investment");
  if (/\bebi\b/.test(normalized)) add.push("employment based immigration");
  if (/\bep\b/.test(normalized)) add.push("employment pass");
  if (normalized.includes("startup visa"))
    add.push("start up visa", "start-up visa");
  if (normalized.includes("real estate")) add.push("property investment");
  return [q, ...add];
}

async function loadIndex(): Promise<SearchDoc[]> {
  if (cachedDocs) return cachedDocs;

  const file = path.join(process.cwd(), "public", "search-index.json");
  const json = await fs.readFile(file, "utf8");
  let parsed: SearchIndexFile | SearchDoc[];
  try {
    parsed = JSON.parse(json);
  } catch {
    parsed = [] as SearchDoc[];
  }

  const docs = Array.isArray(parsed)
    ? (parsed as SearchDoc[])
    : (parsed as SearchIndexFile).docs;

  cachedDocs = docs ?? [];
  return cachedDocs;
}

function buildMiniSearch(docs: SearchDoc[]) {
  if (mini) return mini;
  mini = new MiniSearch<SearchDoc>({
    fields: ["title", "subtitle", "tags", "snippet"],
    storeFields: [
      "id",
      "url",
      "type",
      "title",
      "subtitle",
      "tags",
      "snippet",
      "hero",
      "date",
      "updated",
      "countries",
      "programs",
    ],
    searchOptions: {
      boost: { title: 4, subtitle: 2, tags: 1.5, snippet: 1 },
      fuzzy: 0.2, // edit distance tolerance
      prefix: true,
    },
    // idField defaults to "id"
  });
  mini.addAll(docs);
  return mini;
}

export async function GET(req: NextRequest) {
  const t0 = performance.now();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.max(
    1,
    Math.min(parseInt(searchParams.get("limit") || "12", 10), 25),
  );
  const types = (searchParams.get("types") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Array<SearchDoc["type"]>;

  const docs = await loadIndex();

  // If no query provided, return recent items (by updated || date desc), optionally filtered by types.
  if (!q) {
    const recent = docs
      .filter((d) => (types.length ? types.includes(d.type) : true))
      .slice() // copy
      .sort((a, b) => {
        const da = new Date(a.updated || a.date || 0).getTime();
        const db = new Date(b.updated || b.date || 0).getTime();
        return db - da;
      })
      .slice(0, limit)
      .map((d) => ({ ...d, score: 0 }));

    const tookMs = Math.round(performance.now() - t0);
    return Response.json(
      {
        query: "",
        tookMs,
        count: recent.length,
        items: recent,
      } as ApiSearchResponse,
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=600",
        },
      },
    );
  }

  const ms = buildMiniSearch(docs);

  const queries = expandQuery(q);
  const seen = new Map<string, number>(); // id -> best (max) score

  for (const part of queries) {
    const results = ms.search(part, {
      filter: types.length ? (doc) => types.includes(doc.type) : undefined,
      combineWith: "AND",
    });
    for (const r of results) {
      const prev = seen.get(r.id);
      const score = r.score ?? 0;
      // In MiniSearch, higher score is better — keep the max.
      if (prev == null || score > prev) seen.set(r.id, score);
    }
  }

  // Build final items in order of score desc
  const idToDoc = new Map(docs.map((d) => [d.id, d]));
  const items = Array.from(seen.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({ ...(idToDoc.get(id) as SearchDoc), score }));

  const tookMs = Math.round(performance.now() - t0);

  return Response.json(
    { query: q, tookMs, count: items.length, items } as ApiSearchResponse,
    {
      headers: {
        // CDN friendly
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=600",
      },
    },
  );
}
