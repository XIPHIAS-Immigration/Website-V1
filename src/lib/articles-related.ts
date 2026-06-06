// FILE: src/lib/articles-related.ts
import { getAllInsights } from "@/lib/insights-content";
import type { InsightMeta } from "@/types/insights";

/**
 * Very simple related-articles scorer by tag overlap.
 * Call with the current article meta; returns up to `limit` related.
 */
export async function getRelatedArticles(
  current: InsightMeta,
  limit = 3,
): Promise<InsightMeta[]> {
  const { items } = await getAllInsights({ kind: "articles", pageSize: 500 });

  const curTags = new Set((current.tags ?? []).map((t) => t.toLowerCase()));
  const scored = items
    .filter((m) => m.slug !== current.slug)
    .map((m) => {
      let score = 0;
      for (const t of m.tags ?? [])
        if (curTags.has(t.toLowerCase())) score += 2;
      if (
        m.country?.some((c) =>
          current.country
            ?.map((x) => x.toLowerCase())
            .includes(c.toLowerCase()),
        )
      )
        score += 1;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.m);
}
