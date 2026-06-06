// src/app/api/highlights/route.ts
import { NextResponse } from "next/server";
import { getAllInsights } from "@/lib/insights-content";
import type { InsightMeta, InsightKind } from "@/types/insights";

// We read MDX from disk => must be Node runtime.
export const runtime = "nodejs";
// Always compute fresh (you can switch to a number later if you want ISR).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRIORITY: InsightKind[] = ["news", "articles", "media", "blog"];

function sortByDateDesc(a: InsightMeta, b: InsightMeta) {
  const da = new Date(a.updated || a.date || 0).getTime();
  const db = new Date(b.updated || b.date || 0).getTime();
  return db - da;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(24, Number(url.searchParams.get("limit")) || 16));

  // Pull a lot, then we trim. (This is fast because we already cache the
  // MDX scan inside insights-content on prod.)
  const { items } = await getAllInsights({ page: 1, pageSize: 1000 });

  // Bucket and sort each bucket, remove duplicates by URL.
  const buckets = new Map<InsightKind, InsightMeta[]>(PRIORITY.map(k => [k, []]));
  const seen = new Set<string>();
  for (const m of items) {
    if (!buckets.has(m.kind)) continue;
    const key = (m.url || `${m.kind}:${m.slug}`).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    buckets.get(m.kind)!.push(m);
  }
  for (const k of PRIORITY) buckets.get(k)!.sort(sortByDateDesc);

  // Fill by priority: News → Articles → Media → Blog.
  const out: InsightMeta[] = [];
  for (const k of PRIORITY) {
    for (const m of buckets.get(k)!) {
      out.push(m);
      if (out.length >= limit) break;
    }
    if (out.length >= limit) break;
  }

  return NextResponse.json({ items: out });
}
