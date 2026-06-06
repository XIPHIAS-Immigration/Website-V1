// src/utils/search.ts

export type UIItem = {
  title: string;
  type: string;         // "Program" | "Country" | "Article" | "News" | "Page" ...
  url: string;
  snippet?: string;     // plain text, markdown/HTML stripped
  image?: string;       // optional valid URL or same-origin path
  date?: string;        // raw ISO (if backend sends)
  dateLabel?: string;   // human-friendly ("Feb 2025")
  tags?: string[];      // optional tags (we'll show up to 3)
  score?: number;       // optional
};

type ApiSearchResult = {
  id: string;
  url: string;
  type: "country" | "program" | "article" | "news" | "page";
  title: string;
  subtitle?: string;
  tags?: string[];
  snippet?: string;     // may contain md/html
  hero?: string | null; // may be null or invalid
  date?: string | null;
  updated?: string | null;
  countries?: string[];
  programs?: string[];
  score: number;
};

type ApiSearchResponse = {
  query: string;
  tookMs: number;
  count: number;
  items: ApiSearchResult[];
};

// ---------- helpers

function stripMdHtml(s?: string | null): string {
  if (!s) return "";
  let x = s;

  // code blocks / inline code
  x = x.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  // headings/lists/emphasis
  x = x
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "");
  // links/images
  x = x.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  x = x.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // html tags
  x = x.replace(/<[^>]+>/g, " ");
  // collapse whitespace
  x = x.replace(/\s+/g, " ").trim();

  return x;
}

export function debounce<F extends (...args: any[]) => void>(fn: F, wait = 200) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Warm the static index for snappier first search
export async function preloadIndex(): Promise<void> {
  try {
    await fetch("/search-index.json", { cache: "force-cache" });
  } catch {
    // non-fatal
  }
}

function normalizeImageUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  const s = u.trim();
  if (!s) return undefined;
  if (s.startsWith("/")) return s; // same-origin paths are fine
  try {
    const url = new URL(s);
    if (url.protocol === "http:" || url.protocol === "https:") return s;
  } catch {
    // invalid URL -> no image
  }
  return undefined;
}

function toTitleCaseType(t?: string): string {
  if (!t) return "Item";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function formatDateLabel(iso?: string | null): string | undefined {
  if (!iso) return;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return;
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

// ---------- API → UI map

export async function searchItems(
  query: string,
  limit = 12,
  types?: string[],
): Promise<UIItem[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({ q, limit: String(limit) });
  if (types?.length) params.set("types", types.join(","));

  const res = await fetch(`/api/search?${params.toString()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as ApiSearchResponse;

  return (data.items || []).map((d): UIItem => {
    const rawDate = d.updated || d.date || undefined;
    return {
      title: stripMdHtml(d.title),
      type: toTitleCaseType(d.type),
      url: d.url,
      snippet: stripMdHtml(d.snippet || d.subtitle),
      image: normalizeImageUrl(d.hero), // never null; undefined if invalid
      date: rawDate || undefined,
      dateLabel: formatDateLabel(rawDate),
      tags: (d.tags || []).filter(Boolean).slice(0, 3),
      score: d.score,
    };
  });
}
