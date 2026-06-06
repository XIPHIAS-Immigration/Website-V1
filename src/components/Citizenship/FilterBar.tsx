// src/components/Citizenship/FilterBar.tsx
"use client";

import React from "react";

type Filters = {
  q?: string;
  routeType?: "donation" | "real-estate" | "bond" | "naturalisation" | "";
  sort?: "timeline" | "investment" | "passport";
};

type Props = {
  initial?: Filters;
  onChange?: (f: Filters) => void;
  className?: string;
};

/**
 * FilterBar — professional, readable blue-accent filters
 * - White card on ultra-light grid; neutral text; blue only for emphasis
 * - A11y: form/labels, focus rings, keyboardable clear/reset
 * - UX: debounced search (300ms), clear button, reset all
 * - 100% responsive: 1col → 3col (search | route | sort)
 * - No external libs; server-safe props; client-only behavior
 */
export default function FilterBar({
  initial,
  onChange,
  className = "",
}: Props) {
  const [q, setQ] = React.useState(initial?.q ?? "");
  const [routeType, setRouteType] = React.useState<Filters["routeType"]>(
    initial?.routeType ?? "",
  );
  const [sort, setSort] = React.useState<Filters["sort"]>(
    initial?.sort ?? "timeline",
  );

  // Debounce updates slightly to avoid chatty parent re-renders on typing
  React.useEffect(() => {
    const t = setTimeout(() => onChange?.({ q, routeType, sort }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, routeType, sort]);

  const hasActive = (q?.trim()?.length ?? 0) > 0 || !!routeType;
  const activeCount = (q?.trim() ? 1 : 0) + (routeType ? 1 : 0);

  const resetAll = () => {
    setQ("");
    setRouteType("");
    setSort("timeline");
    onChange?.({ q: "", routeType: "", sort: "timeline" });
  };

  const sectionId = "filters-" + React.useId();

  return (
    <section
      id={sectionId}
      aria-label="Program filters"
      className={[
        "relative overflow-hidden",
        "rounded-2xl p-4 sm:p-5",
        "bg-white dark:bg-neutral-900",
        "ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm",
        className,
      ].join(" ")}
    >
      <BackgroundGraphics />

      {/* Header */}
      <header className="relative mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-blue-700 dark:text-blue-300">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="font-medium">Filters</span>
          {hasActive ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-100 px-2 py-[2px] dark:bg-blue-950/30 dark:text-blue-200 dark:ring-blue-900/40">
              {activeCount} active
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="text-[12px] font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-4 dark:text-neutral-300 dark:hover:text-neutral-100"
          aria-label="Reset all filters"
        >
          Reset
        </button>
      </header>

      {/* Form */}
      <form
        role="search"
        aria-labelledby={sectionId}
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-3 sm:grid-cols-[1fr,auto,auto]"
      >
        {/* Search */}
        <div className="relative">
          <label htmlFor="filter-q" className="sr-only">
            Search country or program
          </label>
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
          >
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            id="filter-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search country or program…"
            autoComplete="off"
            enterKeyHint="search"
            className="
              w-full rounded-xl pl-9 pr-9 py-2
              ring-1 ring-neutral-300 dark:ring-neutral-700
              bg-white dark:bg-neutral-900
              text-sm text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-500 dark:placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-blue-400/70
            "
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="
                absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center
                h-7 w-7 rounded-md ring-1 ring-neutral-300 dark:ring-neutral-700
                text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
              "
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Route type */}
        <div className="relative">
          <label htmlFor="filter-route" className="sr-only">
            Route type
          </label>
          <select
            id="filter-route"
            className="
              w-full appearance-none rounded-xl px-3 py-2
              ring-1 ring-neutral-300 dark:ring-neutral-700
              bg-white dark:bg-neutral-900
              text-sm text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:ring-2 focus:ring-blue-400/70
            "
            value={routeType}
            onChange={(e) => setRouteType(e.target.value as any)}
          >
            <option value="">All routes</option>
            <option value="donation">Donation</option>
            <option value="real-estate">Real estate</option>
            <option value="bond">Government bonds</option>
            <option value="naturalisation">Naturalisation</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </div>

        {/* Sort */}
        <div className="relative">
          <label htmlFor="filter-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="filter-sort"
            className="
              w-full appearance-none rounded-xl px-3 py-2
              ring-1 ring-neutral-300 dark:ring-neutral-700
              bg-white dark:bg-neutral-900
              text-sm text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:ring-2 focus:ring-blue-400/70
            "
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="timeline">Fastest timeline</option>
            <option value="investment">Lowest investment</option>
            <option value="passport">Strongest passport</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </div>
      </form>
    </section>
  );
}

/* ---------------- Background (light grid + neutral glows) ---------------- */
function BackgroundGraphics() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 print:hidden"
    >
      <div className="absolute -top-20 -left-16 h-48 w-48 rounded-full bg-neutral-300/15 blur-3xl" />
      <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-neutral-400/10 blur-3xl" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fb-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0v24"
              fill="none"
              stroke="#111827"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fb-grid)" />
      </svg>
    </div>
  );
}

/* ---------------- Inline icons (no libs) ---------------- */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M14 14l4 4" strokeLinecap="round" />
    </svg>
  );
}
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
