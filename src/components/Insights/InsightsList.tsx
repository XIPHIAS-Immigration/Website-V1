"use client";

import * as React from "react";
import InsightCard from "./InsightCard";
import type { InsightMeta } from "@/types/insights";

type SortKey = "new" | "popular" | "az";

type Props = {
  items: InsightMeta[];
  isLoading?: boolean;
  pageSize?: number;
  defaultView?: "grid" | "list";
  sort?: SortKey;

  /** Next 15 client prop rule: callbacks must be named *Action */
  onSortChangeAction?: (s: SortKey) => void;
  showToolbar?: boolean;
  onResetFiltersAction?: () => void;
};

export default function InsightsList({
  items,
  isLoading = false,
  pageSize = 9,
  defaultView = "grid",
  sort = "new",
  onSortChangeAction,
  showToolbar = true,
  onResetFiltersAction,
}: Props) {
  const [view, setView] = React.useState<"grid" | "list">(defaultView);
  const [page, setPage] = React.useState(1);

  const total = items?.length ?? 0;
  const visible = Math.min(page * pageSize, total);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!endRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPage((p) => (p * pageSize < total ? p + 1 : p));
        }
      },
      { rootMargin: "360px 0px" },
    );
    io.observe(endRef.current);
    return () => io.disconnect();
  }, [pageSize, total]);

  if (!isLoading && (!items || items.length === 0)) {
    return <EmptyState onResetFiltersAction={onResetFiltersAction} />;
  }

  const liveMsg = `${visible} of ${total} insights`;

  return (
    <section aria-label="Insights">
      <h2 className="sr-only">Insights results</h2>
      {showToolbar && (
        <Toolbar
          countText={liveMsg}
          view={view}
          onViewChange={setView}
          sort={sort}
          onSortChangeAction={onSortChangeAction}
        />
      )}

      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden"
        }
      >
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) =>
              view === "grid" ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />,
            )
          : items.slice(0, visible).map((it) =>
              view === "grid" ? (
                <InsightCard key={it.url} item={it} />
              ) : (
                <Row key={it.url} item={it} />
              ),
            )}
      </div>

      {!isLoading && visible < total && (
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-black dark:text-white ring-1 ring-neutral-400 dark:ring-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            aria-label="Load more insights"
          >
            <ArrowDown className="h-4 w-4" /> Load more
          </button>
        </div>
      )}

      <div ref={endRef} aria-hidden className="h-1" />
      <p className="sr-only" aria-live="polite">
        {liveMsg}
      </p>
    </section>
  );
}

/* ───────── Toolbar ───────── */

function Toolbar({
  countText,
  view,
  onViewChange,
  sort,
  onSortChangeAction,
}: {
  countText: string;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  sort?: SortKey;
  onSortChangeAction?: (s: SortKey) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white/70 dark:bg-neutral-900/50 px-3 py-2">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {countText}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {onSortChangeAction && (
          <label className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span className="whitespace-nowrap">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSortChangeAction(e.target.value as SortKey)}
              className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="Sort insights"
            >
              <option value="new">Newest</option>
              <option value="popular">Most popular</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        )}

        <div className="inline-flex overflow-hidden rounded-md ring-1 ring-neutral-300 dark:ring-neutral-700">
          <button
            className={`px-2.5 py-1.5 text-sm ${
              view === "grid"
                ? "bg-secondary text-white"
                : "bg-white dark:bg-neutral-900"
            }`}
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            title="Grid view"
          >
            <GridIcon className="h-4 w-4" />
          </button>
          <button
            className={`px-2.5 py-1.5 text-sm ${
              view === "list"
                ? "bg-primary text-white"
                : "bg-white dark:bg-neutral-900"
            }`}
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            title="List view"
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── List Row (image left; badge = type; whole row is a link) ───────── */
function Row({ item }: { item: InsightMeta }) {
  const any = item as any;
  const cover = getCover(any);
  const type = getTypeBadge(any); // always returns a type (defaults to "article")
  const readStr = getReadTime(any);

  return (
    <a
      href={item.url}
      className="
        grid grid-cols-[112px_minmax(0,1fr)] gap-3 p-3 transition-colors
        hover:bg-neutral-50 focus:bg-neutral-50
        dark:hover:bg-neutral-900/40 dark:focus:bg-neutral-900/40
        outline-none
      "
      aria-label={item.title}
    >
      {/* thumbnail */}
      <div className="relative h-24 w-[112px] overflow-hidden rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900" />
        )}
      </div>

      {/* content */}
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ring-1 ${badgeClasses(
              type,
            )}`}
            aria-label={`Content type: ${type}`}
          >
            {type}
          </span>

          <h3 className="text-[15px] font-semibold leading-5 text-neutral-900 dark:text-neutral-100 line-clamp-2">
            {item.title}
          </h3>
        </div>

        {(any.excerpt || any.summary) && (
          <p className="mt-1 text-[13px] leading-5 text-neutral-700 dark:text-neutral-300 line-clamp-2">
            {any.excerpt ?? any.summary}
          </p>
        )}

        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          {readStr ? `${readStr} · ` : ""}
          {any.date ?? ""}
        </p>
      </div>
    </a>
  );
}

/* ───────── Empty & Skeletons ───────── */

function EmptyState({
  onResetFiltersAction,
}: {
  onResetFiltersAction?: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 text-center"
    >
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center justify-center">
        <SearchIcon className="h-5 w-5" />
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        No results
      </p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Try different keywords or adjust filters.
      </p>
      {onResetFiltersAction && (
        <button
          onClick={onResetFiltersAction}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-neutral-300 hover:bg-neutral-50 dark:ring-neutral-700 dark:hover:bg-neutral-800"
        >
          <RotateIcon className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 p-4">
      <div className="h-36 rounded-xl bg-neutral-200/80 dark:bg-neutral-800" />
      <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200/80 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-5/6 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-2/3 rounded bg-neutral-200/70 dark:bg-neutral-800" />
    </div>
  );
}
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 p-3 animate-pulse">
      <div className="h-24 w-[112px] rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-neutral-200/80 dark:bg-neutral-800" />
        <div className="h-3 w-5/6 rounded bg-neutral-200/70 dark:bg-neutral-800" />
        <div className="h-3 w-2/3 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

/* ───────── Helpers ───────── */

function getCover(any: any): string | undefined {
  return (
    any?.cover ??
    any?.image ??
    any?.thumbnail ??
    any?.thumb ??
    any?.banner ??
    any?.hero ??
    any?.ogImage ??
    any?.og_image ??
    any?.featuredImage ??
    any?.featured_image ??
    undefined
  );
}

/** Returns normalized type label. Defaults to "article" so badge always shows. */
function getTypeBadge(any: any): "news" | "blog" | "media" | "article" {
  const raw: string | undefined =
    any?.type ??
    any?.kind ??
    any?.format ??
    any?.contentType ??
    any?.content_type ??
    any?.category;
  const pick = (raw ?? "").toString().toLowerCase();

  if (["news"].includes(pick)) return "news";
  if (["blog", "post"].includes(pick)) return "blog";
  if (["media", "press", "press-release", "press_release"].includes(pick))
    return "media";
  if (["article", "insight", "guide"].includes(pick)) return "article";

  const tags: string[] = Array.isArray(any?.tags)
    ? any.tags.map((t: any) => String(t).toLowerCase())
    : [];
  if (tags.includes("news")) return "news";
  if (tags.includes("blog")) return "blog";
  if (tags.includes("media") || tags.includes("press")) return "media";
  if (
    tags.includes("article") ||
    tags.includes("insight") ||
    tags.includes("guide")
  )
    return "article";

  return "article"; // default – ensures badge renders
}

function badgeClasses(type: string): string {
  switch (type) {
    case "news":
      return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-800";
    case "blog":
      return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-800";
    case "media":
      return "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800";
    default:
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800";
  }
}

function getReadTime(item: InsightMeta): string | undefined {
  const any = item as any;
  if (typeof any.readTime === "string") return any.readTime;
  if (typeof any.readTime === "number") return `${any.readTime} min`;
  if (typeof any.readMinutes === "number") return `${any.readMinutes} min`;
  if (typeof any.minutes === "number") return `${any.minutes} min`;
  if (typeof any.wordCount === "number") {
    const mins = Math.max(1, Math.ceil(any.wordCount / 220));
    return `${mins} min`;
  }
  return undefined;
}

/* ───────── Icons ───────── */

function GridIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
    </svg>
  );
}
function ListIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
    </svg>
  );
}
function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 6.293 10.3L8.586 12.6V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 2a8 8 0 1 0 5.293 14.293l4.707 4.707a1 1 0 0 0 1.414-1.414l-4.707-4.707A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 10 4z" />
    </svg>
  );
}
function RotateIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 2a8 8 0 0 1 7.937 7H16l3.5 3.5L23 9h-2.063A8.001 8.001 0 1 1 2 10a1 1 0 1 0 2 0 6 6 0 1 0 6 6 1 1 0 1 0 0-2 4 4 0 1 1 0-8 1 1 0 1 0 0-2z" />
    </svg>
  );
}
