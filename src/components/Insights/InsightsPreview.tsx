import { getAllInsights } from "@/lib/insights-content";
import InsightsPreviewClient from "./InsightsPreviewClient";

type Item = {
  url: string;
  title?: string;
  heading?: string;
  updated?: string;
  date?: string;
  publishedAt?: string;
};

const toTime = (d?: string) => {
  if (!d) return NaN;
  const t = Date.parse(d);
  return Number.isNaN(t) ? NaN : t;
};

export default async function InsightsPreview({
  limit = 8,
  title = "News and Articles",
  viewAllHref = "/insights",
}: {
  limit?: number;
  title?: string;
  viewAllHref?: string;
}) {
  const { items } = await getAllInsights({ pageSize: limit });
  if (!items?.length) return null;

  // de-dupe + sort newest by updated -> date -> publishedAt
  const seen = new Set<string>();
  const cleaned: Item[] = [];
  for (const it of items) {
    if (!it?.url || seen.has(it.url)) continue;
    seen.add(it.url);
    cleaned.push(it as Item);
  }

  cleaned.sort((a, b) => {
    const tb = toTime(b.updated ?? b.date ?? b.publishedAt);
    const ta = toTime(a.updated ?? a.date ?? a.publishedAt);
    if (Number.isNaN(tb) && Number.isNaN(ta)) return 0;
    if (Number.isNaN(tb)) return 1;
    if (Number.isNaN(ta)) return -1;
    return tb - ta;
  });

  return (
    <InsightsPreviewClient
      items={cleaned.slice(0, limit) as any}
      title={title}
      viewAllHref={viewAllHref}
    />
  );
}
