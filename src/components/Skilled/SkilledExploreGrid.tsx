// src/components/Skilled/ExploreGrid.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { ProgramMeta, CountryMeta } from "@/lib/skilled-content";
import CountryCardPro from "@/components/Citizenship/CountryCardPro"; // same visual
import CompareDrawer, {
  type CompareItem,
} from "@/components/Citizenship/CompareDrawer"; // same visual drawer
import {
  Search as SearchIcon,
  SlidersHorizontal,
  XCircle,
  ChevronDown,
  Check as CheckIcon,
} from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { formatTimelineShort } from "@/lib/timeline";

/* ------------------------- helpers & formatters ------------------------- */

type SkilledRoute =
  | "points"
  | "employer"
  | "talent"
  | "graduate"
  | "working-holiday"
  | "startup"
  | "self-employed";

/** Infer a skilled route type from tags */
function inferSkilledRouteTypeFromTags(tags?: string[]): SkilledRoute | undefined {
  if (!tags) return undefined;
  const t = tags.map((s) => s.toLowerCase());

  if (t.some((s) => s.includes("points") || s.includes("express entry") || s.includes("points-based")))
    return "points";
  if (t.some((s) => s.includes("employer") || s.includes("sponsor") || s.includes("sponsored")))
    return "employer";
  if (t.some((s) => s.includes("talent") || s.includes("exceptional") || s.includes("distinguished")))
    return "talent";
  if (t.some((s) => s.includes("graduate") || s.includes("post-study") || s.includes("pgwp")))
    return "graduate";
  if (t.some((s) => s.includes("working holiday")))
    return "working-holiday";
  if (t.some((s) => s.includes("startup") || s.includes("innovator") || s.includes("entrepreneur")))
    return "startup";
  if (t.some((s) => s.includes("self-employed") || s.includes("self employed")))
    return "self-employed";

  return undefined;
}

const STABLE_LOCALE = "en"; // <- keep output identical on server & client

function toCurrency(amount?: number, currency = "USD") {
  if (typeof amount !== "number") return "";
  try {
    return new Intl.NumberFormat(STABLE_LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(STABLE_LOCALE)}`;
  }
}

// normalize any relative path ("images/..") to root-absolute ("/images/..")
function ensureAbs(src?: string) {
  if (!src) return undefined;
  return src.startsWith("/") ? src : `/${src.replace(/^\.?\/*/, "")}`;
}

/** Shared ranker for programs (safe) */
function rankPrograms(all: ProgramMeta[]) {
  const key = (x: ProgramMeta) =>
    `${String(x?.title ?? "")} ${String(x?.country ?? "")}`.trim();

  return [...all].sort((a, b) => {
    const tA = a.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    const tB = b.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    if (tA !== tB) return tA - tB;

    const iA = a.minInvestment ?? Number.MAX_SAFE_INTEGER;
    const iB = b.minInvestment ?? Number.MAX_SAFE_INTEGER;
    if (iA !== iB) return iA - iB;

    return key(a).localeCompare(key(b), STABLE_LOCALE, { sensitivity: "base" });
  });
}

function pickTopPrograms(all: ProgramMeta[], n = 5) {
  return rankPrograms(all).slice(0, n);
}

/** Build a preview image with safe fallback (normalize to absolute) */
function imgOrFallback(p: ProgramMeta) {
  const img =
    ensureAbs((p as any).heroImage as string | undefined) ||
    ensureAbs((p as any).heroPoster as string | undefined);
  return img || `/images/countries/${p.countrySlug}-hero-poster.jpg`;
}

/** Discover which route types exist across programs */
function availableRouteTypes(programs?: ProgramMeta[]) {
  const set = new Set<string>();
  for (const p of programs ?? []) {
    const rt = inferSkilledRouteTypeFromTags((p as any).tags);
    if (rt) set.add(rt);
  }
  return Array.from(set) as SkilledRoute[];
}

/** Heuristic: does a program *not* require a job offer? */
function hasNoJobOfferRequirement(p: ProgramMeta) {
  const t = ((p as any).tags ?? []).map((s: string) => s.toLowerCase());
  // common hints
  if (t.some((s: string) => s.includes("no job offer") || s.includes("without job offer"))) return true;
  if (t.some((s: string) => s.includes("points") || s.includes("points-based"))) return true;
  if (t.some((s: string) => s.includes("independent"))) return true;
  return false;
}

/* -------------------------------- types -------------------------------- */

type Option = { value: string; label: string; hint?: string };

/* --------------------------- main component ---------------------------- */

export default function ExploreGrid({
  countries,
  programs,
  className,
}: {
  countries?: CountryMeta[];
  programs?: ProgramMeta[];
  className?: string;
}) {
  const safeCountries = countries ?? [];
  const safePrograms = programs ?? [];

  const [q, setQ] = React.useState("");
  const [routeType, setRouteType] = React.useState<string>("");
  const [sort, setSort] = React.useState<"timeline" | "salary" | "joboffer" | "alpha">(
    "timeline",
  );

  const routeTypes = React.useMemo(
    () => availableRouteTypes(safePrograms),
    [safePrograms],
  );

  const routeTypeOptions: Option[] = React.useMemo(
    () => [
      { value: "", label: "All routes" },
      ...routeTypes.map((rt) => ({
        value: rt,
        label:
          rt === "working-holiday"
            ? "Working Holiday"
            : rt.replace("-", " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      })),
    ],
    [routeTypes],
  );

  const sortOptions: Option[] = React.useMemo(
    () => [
      {
        value: "timeline",
        label: "Fastest timeline",
        hint: "Shortest months first",
      },
      {
        value: "salary",
        label: "Lowest salary / cost",
        hint: "Min requirement first",
      },
      {
        value: "joboffer",
        label: "No job offer first",
        hint: "Independent routes first",
      },
      { value: "alpha", label: "A–Z country", hint: "Alphabetical" },
    ],
    [],
  );

  /** Filter programs by route & search */
  const filteredPrograms = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return safePrograms.filter((p) => {
      const derived = inferSkilledRouteTypeFromTags((p as any).tags);
      if (routeType && derived !== routeType) return false;
      if (!ql) return true;

      const title = String(p?.title ?? "").toLowerCase();
      const country = String(p?.country ?? "").toLowerCase();
      const slug = String((p as any)?.programSlug ?? "").toLowerCase();
      const tags: string[] = Array.isArray((p as any)?.tags) ? (p as any).tags : [];

      return (
        title.includes(ql) ||
        country.includes(ql) ||
        slug.includes(ql) ||
        tags.some((t) => String(t).toLowerCase().includes(ql))
      );
    });
  }, [safePrograms, q, routeType]);

  /** Per-country best stats after filtering */
  const bestByCountry = React.useMemo(() => {
    const map = new Map<string, ProgramMeta | undefined>();
    for (const p of filteredPrograms) {
      const current = map.get(p.countrySlug);
      if (!current) {
        map.set(p.countrySlug, p);
      } else {
        const a = p.timelineMonths ?? Number.MAX_SAFE_INTEGER;
        const b = current.timelineMonths ?? Number.MAX_SAFE_INTEGER;
        if (a < b) map.set(p.countrySlug, p);
      }
    }
    return map;
  }, [filteredPrograms]);

  /** Country list derived for cards */
  const normalized = React.useMemo(
    () =>
      safeCountries.map((c) => {
        const best = bestByCountry.get(c.countrySlug);
        return {
          c,
          hasMatch: !!best,
          minInvestment: best?.minInvestment, // reused as min salary / cost
          currency: best?.currency,
          timelineMonths: best?.timelineMonths,
          timelineLabel: best?.timelineLabel,
        };
      }),
    [safeCountries, bestByCountry],
  );

  /** Country search + route gating */
  const filteredCountries = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    let arr = normalized;
    if (ql) {
      arr = arr.filter(({ c }) => {
        const country = String(c?.country ?? "").toLowerCase();
        const title = String(c?.title ?? "").toLowerCase();
        const tags: string[] = Array.isArray((c as any)?.tags) ? (c as any).tags : [];
        return (
          country.includes(ql) ||
          title.includes(ql) ||
          tags.some((t) => String(t).toLowerCase().includes(ql))
        );
      });
    }
    if (routeType) arr = arr.filter((row) => row.hasMatch);
    return arr;
  }, [normalized, q, routeType]);

  /** Sort countries */
  const sortedCountries = React.useMemo(() => {
    const arr = [...filteredCountries];
    switch (sort) {
      case "salary":
        arr.sort(
          (a, b) =>
            (a.minInvestment ?? Number.MAX_SAFE_INTEGER) -
            (b.minInvestment ?? Number.MAX_SAFE_INTEGER),
        );
        break;
      case "joboffer":
        // Countries with at least one "no job offer" program bubble up,
        // then by fastest timeline for tie-break.
        arr.sort((a, b) => {
          const aProg = bestByCountry.get(a.c.countrySlug);
          const bProg = bestByCountry.get(b.c.countrySlug);
          const aNo = aProg ? (hasNoJobOfferRequirement(aProg) ? 0 : 1) : 1;
          const bNo = bProg ? (hasNoJobOfferRequirement(bProg) ? 0 : 1) : 1;
          if (aNo !== bNo) return aNo - bNo;
          const ta = a.timelineMonths ?? Number.MAX_SAFE_INTEGER;
          const tb = b.timelineMonths ?? Number.MAX_SAFE_INTEGER;
          return ta - tb;
        });
        break;
      case "alpha":
        arr.sort((a, b) =>
          String(a?.c?.country ?? "").localeCompare(
            String(b?.c?.country ?? ""),
            STABLE_LOCALE,
            { sensitivity: "base" },
          ),
        );
        break;
      case "timeline":
      default:
        arr.sort(
          (a, b) =>
            (a.timelineMonths ?? Number.MAX_SAFE_INTEGER) -
            (b.timelineMonths ?? Number.MAX_SAFE_INTEGER),
        );
        break;
    }
    return arr;
  }, [filteredCountries, sort, bestByCountry]);

  /** Top 5 + compare items */
  const top5 = React.useMemo(
    () => pickTopPrograms(filteredPrograms, 5),
    [filteredPrograms],
  );

  const compareItems: CompareItem[] = React.useMemo(
    () =>
      pickTopPrograms(filteredPrograms, 6).map((p) => ({
        title: p.title,
        country: p.country,
        href: `/skilled/${p.countrySlug}/${p.programSlug}`,
        minInvestment: p.minInvestment,
        currency: p.currency,
        timelineMonths: p.timelineMonths,
        timelineLabel: p.timelineLabel,
        tags: (p as any).tags ?? [],
        heroImage: imgOrFallback(p),
      })),
    [filteredPrograms],
  );

  const resultCount = sortedCountries.length;

  /* --------------------------------- UI --------------------------------- */

  return (
    <div className={["text-black dark:text-white", className ?? ""].join(" ")}>
      {/* MOBILE: collapsible filter panel with premium dropdowns */}
      <details
        className="
          lg:hidden rounded-2xl p-4 open:p-4
          ring-1 ring-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50
          dark:ring-blue-900/40 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/10
        "
      >
        <summary className="cursor-pointer select-none font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Filters & Top Programs
          <span className="ml-auto text-sm font-normal text-zinc-500 dark:text-zinc-400">
            {resultCount} countries
          </span>
        </summary>

        <ActiveFilters
          q={q}
          routeType={routeType}
          onClearQ={() => setQ("")}
          onClearRoute={() => setRouteType("")}
        />

        {/* Filter fields */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search (span 2 on sm for symmetry) */}
          <div className="sm:col-span-2">
            <FilterInput
              value={q}
              onChange={setQ}
              placeholder="Search by country, program or tag…"
            />
          </div>

          {/* Route type */}
          <FancySelect
            label="Route type"
            value={routeType}
            onChange={setRouteType}
            options={routeTypeOptions}
            placeholder="All routes"
          />

          {/* Sort */}
          <FancySelect
            label="Sort by"
            value={sort}
            onChange={(v) => setSort(v as any)}
            options={sortOptions}
            placeholder="Sort"
          />
        </div>

        {/* Reset */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setQ("");
              setRouteType("");
              setSort("timeline");
            }}
            className="text-sm rounded-xl px-3 py-2 ring-1 ring-blue-200 hover:bg-blue-50 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
          >
            Reset all
          </button>
        </div>

        {/* Top 5 list */}
        <div className="mt-6">
          <h3 className="text-base font-semibold">Top 5 programs</h3>
          <ol
            className="mt-3 space-y-3"
            itemScope
            itemType="https://schema.org/ItemList"
          >
            {top5.map((p, idx) => (
              <li
                key={`${p.countrySlug}-${p.programSlug}`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <meta itemProp="position" content={String(idx + 1)} />
                <Link
                  href={`/skilled/${p.countrySlug}/${p.programSlug}`}
                  className="block rounded-xl ring-1 ring-blue-100/80 bg-white p-3 hover:bg-blue-50/60 dark:bg-white/5 dark:ring-blue-900/40 dark:hover:bg-blue-950/20 transition"
                  itemProp="url"
                >
                  <div className="flex items-center gap-3">
                    <SquareThumb program={p} />
                    <div className="flex-1">
                      <div className="text-sm font-medium" itemProp="name">
                        {p.title}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        {p.country}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="tabular-nums">
                        {typeof p.minInvestment === "number"
                          ? toCurrency(p.minInvestment, p.currency ?? "USD")
                          : "No min"}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-300">
                        {formatTimelineShort(
                          p.timelineMonths,
                          p.timelineLabel,
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-5 hidden md:block">
            <ContactForm />
          </div>
        </div>
      </details>

      {/* DESKTOP: sticky aside with premium dropdowns */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <aside className="hidden lg:block lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div
              className="
                rounded-2xl p-5
                ring-1 ring-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50
                dark:ring-blue-900/40 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/10
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-semibold">Filters</h3>
                <span className="ml-auto text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  {resultCount} countries
                </span>
              </div>

              <ActiveFilters
                q={q}
                routeType={routeType}
                onClearQ={() => setQ("")}
                onClearRoute={() => setRouteType("")}
              />

              {/* 2-column responsive layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Search spans both columns */}
                <div className="md:col-span-2">
                  <FilterInput
                    value={q}
                    onChange={setQ}
                    placeholder="Search by country, program or tag…"
                  />
                </div>

                {/* Route */}
                <FancySelect
                  label="Route type"
                  value={routeType}
                  onChange={setRouteType}
                  options={routeTypeOptions}
                  placeholder="All routes"
                />

                {/* Sort */}
                <FancySelect
                  label="Sort by"
                  value={sort}
                  onChange={(v) => setSort(v as any)}
                  options={sortOptions}
                  placeholder="Sort"
                />
              </div>

              {/* Reset */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setRouteType("");
                    setSort("timeline");
                  }}
                  className="text-sm rounded-xl px-3 py-2 ring-1 ring-blue-200 hover:bg-blue-50 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                >
                  Reset all
                </button>
              </div>
            </div>

            {/* Top 5 (same UI; thumbnails safe) */}
            <div className="rounded-2xl p-5 ring-1 ring-blue-100/80 bg-white dark:bg-white/5 dark:ring-blue-900/40">
              <h3 className="text-base font-semibold">Top 5 programs</h3>
              <ol
                className="mt-3 space-y-3"
                itemScope
                itemType="https://schema.org/ItemList"
              >
                {top5.map((p, idx) => (
                  <li
                    key={`${p.countrySlug}-${p.programSlug}`}
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                  >
                    <meta itemProp="position" content={String(idx + 1)} />
                    <Link
                      href={`/skilled/${p.countrySlug}/${p.programSlug}`}
                      className="group block rounded-xl ring-1 ring-blue-100/80 bg-white p-3 hover:bg-blue-50/60 dark:bg-white/5 dark:ring-blue-900/40 dark:hover:bg-blue-950/20 transition"
                      itemProp="url"
                    >
                      <div className="flex items-center gap-3">
                        <SquareThumb program={p} />
                        <div className="flex-1">
                          <div className="text-sm font-medium" itemProp="name">
                            {p.title}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            {p.country}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="tabular-nums">
                            {typeof p.minInvestment === "number"
                              ? toCurrency(p.minInvestment, p.currency ?? "USD")
                              : "No min"}
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-300">
                            {formatTimelineShort(
                              p.timelineMonths,
                              p.timelineLabel,
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </div>
        </aside>

        {/* Main grid (same visuals) */}
        <section className="lg:col-span-8">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Explore by country</h2>
            <Link
              href="/personal-booking"
              className="text-blue-700 hover:underline dark:text-blue-300"
            >
              Need advice?
            </Link>
          </header>

          <ol
            className="grid gap-4 sm:grid-cols-2"
            itemScope
            itemType="https://schema.org/ItemList"
          >
            {sortedCountries.map(
              ({ c, minInvestment, currency, timelineMonths, timelineLabel }, idx) => (
                <li
                  key={`${c.countrySlug}-${idx}`}
                  className="contents"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <meta itemProp="position" content={String(idx + 1)} />
                  <div itemProp="item" itemScope itemType="https://schema.org/Country">
                    <meta itemProp="name" content={c.country} />
                    <CountryCardPro
                      href={`/skilled/${c.countrySlug}`}
                      title={c.title}
                      summary={c.summary}
                      heroImage={
                        ensureAbs((c as any).heroImage) ||
                        `/images/countries/${c.countrySlug}-hero-poster.jpg`
                      }
                      country={c.country}
                      minInvestment={minInvestment}
                      currency={currency}
                      timelineMonths={timelineMonths}
                      timelineLabel={timelineLabel}
                      tags={(c as any).tags ?? []}
                    />
                  </div>
                </li>
              ),
            )}
          </ol>

          {resultCount === 0 && (
            <div className="mt-8 rounded-2xl border border-blue-100/80 bg-white/70 p-6 text-center dark:bg-white/5 dark:border-blue-900/40">
              <p className="font-medium">No countries match your filters.</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Try clearing the search or selecting a different route.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="rounded-xl px-3 py-2 text-sm ring-1 ring-blue-200 hover:bg-blue-50 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                  >
                    Clear search
                  </button>
                )}
                {routeType && (
                  <button
                    onClick={() => setRouteType("")}
                    className="rounded-xl px-3 py-2 text-sm ring-1 ring-blue-200 hover:bg-blue-50 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                  >
                    Reset route
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <CompareDrawer items={compareItems} />
    </div>
  );
}

/* ----------------------------- subcomponents ---------------------------- */

function ActiveFilters({
  q,
  routeType,
  onClearQ,
  onClearRoute,
}: {
  q: string;
  routeType: string;
  onClearQ: () => void;
  onClearRoute: () => void;
}) {
  if (!q && !routeType) return null;
  return (
    <div className="mb-3 mt-2 flex flex-wrap items-center gap-2">
      {q ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-blue-200 dark:bg-white/5 dark:ring-blue-800/60">
          <span className="opacity-80">Search:</span>
          <strong className="font-medium">{q}</strong>
          <button
            aria-label="Clear search"
            onClick={onClearQ}
            className="ml-1 p-0.5 hover:opacity-80"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </span>
      ) : null}
      {routeType ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-blue-200 dark:bg-white/5 dark:ring-blue-800/60">
          <span className="opacity-80">Route:</span>
          <strong className="font-medium">{routeType.replace("-", " ")}</strong>
          <button
            aria-label="Reset route"
            onClick={onClearRoute}
            className="ml-1 p-0.5 hover:opacity-80"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </span>
      ) : null}
      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
        Refine your selection
      </span>
    </div>
  );
}

function SquareThumb({ program }: { program: ProgramMeta }) {
  const hero = ensureAbs((program as any).heroImage);
  const heroPoster = ensureAbs((program as any).heroPoster);
  const countryPost = `/images/countries/${program.countrySlug}-hero-poster.jpg`;
  const og = `/xiphias-immigration.png`;
  const svgFallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='#e6f0ff'/><stop offset='1' stop-color='#f5f8ff'/></linearGradient></defs><rect width='80' height='80' fill='url(#g)'/><circle cx='40' cy='40' r='18' fill='#93c5fd'/></svg>",
    );

  const candidates = [hero, heroPoster, countryPost, og, svgFallback].filter(Boolean) as string[];
  const [idx, setIdx] = React.useState(0);

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candidates[idx]}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setIdx((i) => Math.min(i + 1, candidates.length - 1))}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/* ======================== Filter UI building blocks ===================== */

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/70 dark:text-blue-300/70" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-blue-100/80 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/90 dark:bg-white/5 dark:border-blue-900/40"
        aria-label="Search programs and countries"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
        >
          <XCircle className="h-4 w-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" />
        </button>
      ) : null}
    </label>
  );
}

/** Accessible, dependency-free dropdown with keyboard + outside-click support */
function FancySelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard on button
  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(
        Math.max(
          0,
          options.findIndex((o) => o.value === value),
        ),
      );
    }
  }

  // Keyboard on menu
  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i < 0 ? 0 : i + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i < 0 ? 0 : i - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
        btnRef.current?.focus();
      }
    }
  }

  // Ensure active option visible
  React.useEffect(() => {
    if (!open) return;
    const el = menuRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </label>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "group w-full rounded-xl border border-blue-100/80 bg-white/90 dark:bg-white/5 dark:border-blue-900/40",
          "px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-600",
          "flex items-center justify-between gap-2",
        ].join(" ")}
      >
        <span className={selected ? "text-current" : "text-zinc-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className="
            absolute z-50 mt-2 w-full overflow-auto rounded-xl border border-blue-100/80 bg-white shadow-xl
            dark:bg-zinc-950 dark:border-blue-900/40
            max-h-72 ring-1 ring-blue-100/60 dark:ring-blue-900/40
          "
        >
          {options.map((opt, i) => {
            const isSel = opt.value === value;
            const isActive = i === activeIndex;
            return (
              <div
                key={opt.value || i}
                role="option"
                aria-selected={isSel}
                data-index={i}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className={[
                  "flex cursor-pointer items-start gap-2 px-3 py-2 text-sm",
                  isActive ? "bg-blue-50 dark:bg-blue-950/30" : "",
                ].join(" ")}
              >
                <div
                  className={`h-4 w-4 mt-0.5 rounded border ${
                    isSel ? "bg-blue-600 border-blue-600" : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {isSel && <CheckIcon className="h-4 w-4 text-white" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate">{opt.label}</div>
                  {opt.hint ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {opt.hint}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              No options
            </div>
          )}
        </div>
      )}
    </div>
  );
}
