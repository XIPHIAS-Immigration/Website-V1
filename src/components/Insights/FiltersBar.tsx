// FILE: src/components/Insights/FiltersBar.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Facets, InsightKind } from "@/types/insights";
import {
  Filter as FilterIcon,
  Search as SearchIcon,
  Globe2,
  Layers3,
  Tags as TagsIcon,
  ChevronDown,
  X,
} from "lucide-react";

/* --------------------------------- utils --------------------------------- */
function useDebouncedCallback<T extends (...args: any[]) => void>(
  cb: T,
  delay = 350,
) {
  return useMemo(() => {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => cb(...args), delay);
    };
  }, [cb, delay]);
}

/* ------------------------------- component ------------------------------- */
type Props = {
  initialQuery?: string;
  initialKind?: InsightKind;
  initialCountry?: string;
  initialProgram?: string;
  initialTag?: string;
  facets: Facets;
};

export default function FiltersBar({
  initialQuery = "",
  initialKind,
  initialCountry,
  initialProgram,
  initialTag,
  facets,
}: Props) {
  const [q, setQ] = useState(initialQuery);
  const [kind, setKind] = useState<InsightKind | "">(
    (initialKind as any) || "",
  );
  const [country, setCountry] = useState(initialCountry || "");
  const [program, setProgram] = useState(initialProgram || "");
  const [tag, setTag] = useState(initialTag || "");

  const [showSheet, setShowSheet] = useState(false); // mobile bottom sheet

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const apply = useCallback(
    (next: {
      q?: string;
      kind?: string;
      country?: string;
      program?: string;
      tag?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.kind !== undefined) {
        if (next.kind) params.set("kind", next.kind);
        else params.delete("kind");
      }
      if (next.country !== undefined) {
        if (next.country) params.set("country", next.country);
        else params.delete("country");
      }
      if (next.program !== undefined) {
        if (next.program) params.set("program", next.program);
        else params.delete("program");
      }
      if (next.tag !== undefined) {
        if (next.tag) params.set("tag", next.tag);
        else params.delete("tag");
      }

      // reset pagination whenever filters/search change
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const debouncedApply = useDebouncedCallback(apply, 350);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setKind((searchParams.get("kind") as InsightKind) || "");
    setCountry(searchParams.get("country") || "");
    setProgram(searchParams.get("program") || "");
    setTag(searchParams.get("tag") || "");
  }, [searchParams]);

  const hasActive = !!(q || kind || country || program || tag);
  const activeCount = [q, kind, country, program, tag].filter(Boolean).length;

  function clearAll() {
    setQ("");
    setKind("");
    setCountry("");
    setProgram("");
    setTag("");
    setShowSheet(false);
    router.replace(pathname, { scroll: false });
  }

  /* ------------------------------ shared styles ----------------------------- */
  const inputBase =
    "w-full rounded-xl border border-neutral-200 bg-white px-10 py-2.5 text-[14px] leading-5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500";
  const selectBase =
    "w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-10 pr-9 py-2.5 text-[14px] leading-5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100";

  /* --------------------------------- chips --------------------------------- */
  const chips: Array<{ label: string; onClear: () => void; key: string }> = [];
  if (q)
    chips.push({
      key: "q",
      label: `Keyword: ${q}`,
      onClear: () => apply({ q: "" }),
    });
  if (kind)
    chips.push({
      key: "kind",
      label: `Type: ${kind}`,
      onClear: () => apply({ kind: "" }),
    });
  if (country)
    chips.push({
      key: "country",
      label: `Country: ${country}`,
      onClear: () => apply({ country: "" }),
    });
  if (program)
    chips.push({
      key: "program",
      label: `Program: ${program}`,
      onClear: () => apply({ program: "" }),
    });
  if (tag)
    chips.push({
      key: "tag",
      label: `Tag: ${tag}`,
      onClear: () => apply({ tag: "" }),
    });

  /* --------------------------------- render -------------------------------- */
  return (
    <>
      {/* Toolbar (desktop/tablet ≥ sm) */}
      <section
        aria-label="Filters"
        className="
          hidden sm:block
          rounded-3xl border border-neutral-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70
        "
      >
        <div className="relative flex items-center gap-3">
          {/* Visual accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 top-0 hidden h-full w-24 -skew-x-12 rounded-3xl bg-[radial-gradient(60%_100%_at_0%_50%,rgba(59,130,246,.15),transparent)] sm:block"
          />

          {/* Left: label */}
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
            <FilterIcon
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            Filters
            {hasActive && (
              <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30">
                {activeCount}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="min-w-[260px] flex-1">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <input
                id="q"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  debouncedApply({ q: e.target.value });
                }}
                placeholder="Search titles or topics"
                className={inputBase}
                inputMode="search"
                aria-label="Search by keyword"
              />
            </div>
          </div>

          {/* Type */}
          <div className="w-[210px]">
            <div className="relative">
              <Layers3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <select
                id="kind"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as InsightKind | "");
                  apply({ kind: e.target.value });
                }}
                className={selectBase}
                aria-label="Filter by type"
              >
                <option value="">All types</option>
                {facets.kinds.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          {/* Country */}
          <div className="w-[230px]">
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <select
                id="country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  apply({ country: e.target.value });
                }}
                className={selectBase}
                aria-label="Filter by country"
              >
                <option value="">All countries</option>
                {facets.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          {/* Clear on far right */}
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[13px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 dark:text-neutral-300 dark:decoration-neutral-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>

        {/* Chips row (desktop) */}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.onClear}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100/80 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30"
                aria-label={`Remove ${c.label}`}
              >
                {c.label}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Mobile: compact bar + bottom sheet */}
      <section
        aria-label="Filters (mobile)"
        className="sm:hidden rounded-3xl border border-neutral-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                debouncedApply({ q: e.target.value });
              }}
              placeholder="Search titles or topics"
              className={inputBase + " !py-2"}
              inputMode="search"
              aria-label="Search by keyword"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSheet(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 active:scale-[.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <FilterIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Filters
            {hasActive && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* active chips */}
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {chips.slice(0, 3).map((c) => (
              <button
                key={`m-${c.key}`}
                onClick={c.onClear}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30"
              >
                {c.label}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
            {chips.length > 3 && (
              <span className="text-[12px] text-neutral-500">
                +{chips.length - 3} more
              </span>
            )}
          </div>
        )}
      </section>

      {/* Bottom sheet for mobile filters */}
      {showSheet && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setShowSheet(false)}
            aria-hidden
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-auto rounded-t-3xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                <FilterIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Filters
                {hasActive && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSheet(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 dark:text-neutral-300 dark:decoration-neutral-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {/* Type */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                  Type
                </label>
                <Layers3 className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value as InsightKind | "");
                    apply({ kind: e.target.value });
                  }}
                  className={selectBase}
                >
                  <option value="">All types</option>
                  {facets.kinds.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              </div>

              {/* Country */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                  Country
                </label>
                <Globe2 className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    apply({ country: e.target.value });
                  }}
                  className={selectBase}
                >
                  <option value="">All countries</option>
                  {facets.countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              </div>

              {/* Program */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                  Program
                </label>
                <Layers3 className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <select
                  value={program}
                  onChange={(e) => {
                    setProgram(e.target.value);
                    apply({ program: e.target.value });
                  }}
                  className={selectBase}
                >
                  <option value="">All programs</option>
                  {facets.programs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              </div>

              {/* Tag */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                  Tag
                </label>
                <TagsIcon className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <select
                  value={tag}
                  onChange={(e) => {
                    setTag(e.target.value);
                    apply({ tag: e.target.value });
                  }}
                  className={selectBase}
                >
                  <option value="">All tags</option>
                  {facets.tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              </div>

              {/* Chips & clear */}
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {chips.map((c) => (
                    <button
                      key={`sheet-${c.key}`}
                      onClick={c.onClear}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30"
                    >
                      {c.label}
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[13px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 dark:text-neutral-300 dark:decoration-neutral-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setShowSheet(false)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-[.99] dark:bg-blue-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
