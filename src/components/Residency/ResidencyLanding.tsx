"use client";

import * as React from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

// ✅ Accept countries/programs from any vertical
import type {
  CountryMeta as ResidencyCountry,
  ProgramMeta as ResidencyProgram,
} from "@/lib/residency-content";
import type {
  CountryMeta as CitizenshipCountry,
  ProgramMeta as CitizenshipProgram,
} from "@/lib/citizenship-content";
import type {
  CountryMeta as SkilledCountry,
  ProgramMeta as SkilledProgram,
} from "@/lib/skilled-content";
import type {
  CountryMeta as CorporateCountry,
  ProgramMeta as CorporateProgram,
} from "@/lib/corporate-content";

type AnyCountry =
  | ResidencyCountry
  | CitizenshipCountry
  | SkilledCountry
  | CorporateCountry;
type AnyProgram =
  | ResidencyProgram
  | CitizenshipProgram
  | SkilledProgram
  | CorporateProgram;

import CountryCard from "./CountryCard";
import TopPrograms from "@/components/Residency/TopPrograms";
import ContactForm from "@/components/ContactForm";
import { ca } from "date-fns/locale"; // (tree-shaken; safe if unused)

// ---------------- helpers ----------------
function baseFromCategory(
  cat?: AnyCountry["category"] | AnyProgram["category"],
) {
  switch (cat) {
    case "citizenship":
      return "/citizenship";
    case "skilled":
      return "/skilled";
    case "corporate":
      return "/corporate";
    case "residency":
    default:
      return "/residency";
  }
}
/** Accent-insensitive, whitespace-tolerant search */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

type Props = {
  countries: AnyCountry[];
  topPrograms?: AnyProgram[];
  /** Optional override for the right-column heading */
  topHeading?: string;
};

export default function ResidencyLanding({
  countries,
  topPrograms,
  topHeading,
}: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: press "/" to jump to desktop search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as any).isContentEditable);
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const s = norm(q);
    if (!s) return countries;
    return countries.filter((c) => {
      const title = norm(c.title || "");
      const country = norm(c.country || "");
      const summary = norm(c.summary || "");
      return (
        title.includes(s) ||
        country.includes(s) ||
        (summary && summary.includes(s))
      );
    });
  }, [countries, q]);

  // Heading for the aside list
  const derivedHeading =
    topHeading ??
    (topPrograms && topPrograms[0]
      ? `Top ${topPrograms[0].category
          .charAt(0)
          .toUpperCase()}${topPrograms[0].category.slice(1)} Programs`
      : "Top Programs");

  // SEO: build ItemList JSON-LD for country grid
  const itemListJsonLd = React.useMemo(() => {
    const elements = filtered.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseFromCategory(c.category)}/${c.countrySlug}`,
      name: c.title || c.country,
      description: c.summary || undefined,
    }));
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Explore by country",
      itemListElement: elements,
    } as const;
  }, [filtered]);

  return (
    <section
      className="relative grid grid-cols-1 gap-8 lg:grid-cols-3 pt-4"
      aria-labelledby="explore-heading"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      {/* Subtle neutral background pattern */}
      <Background />

      {/* ---- Left/Main: Countries ---- */}
      <div className="order-1 lg:order-1 lg:col-span-2 space-y-4">
        {/* Title row (desktop) */}
        <div className="hidden md:flex items-center justify-between">
          <h2
            id="explore-heading"
            className="text-xl font-semibold text-neutral-900 dark:text-neutral-50"
          >
            Explore by country
          </h2>
          <Link
            href="/personal-booking"
            className="text-sm font-medium text-neutral-900 dark:text-neutral-50 underline underline-offset-2 hover:opacity-90"
          >
            Need advice?
          </Link>
        </div>

        {/* Mobile sticky search */}
        <div
          role="search"
          className="md:hidden sticky top-0 z-40 -mx-4 px-4 py-3 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800/70"
          aria-label="Search countries"
        >
          <SearchField
            id="mobileCountrySearch"
            value={q}
            onChange={setQ}
            placeholder="Type a country name…"
            srLabel="Search countries"
          />
          <CountBar current={filtered.length} total={countries.length} />
        </div>

        {/* Country Grid */}
        <ul
          id="country-grid"
          role="list"
          className="grid gap-4 sm:grid-cols-2"
          aria-live="polite"
        >
          {filtered.map((c) => (
            <li key={c.countrySlug} className="min-w-0">
              {/* CountryCard already handles category-aware links */}
              <CountryCard country={c as any} variant="compact" />
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="sm:col-span-2">
              <EmptyState query={q} onClear={() => setQ("")} />
            </li>
          )}
        </ul>
      </div>

      {/* ---- Right/Aside (sticky) ---- */}
      <aside className="order-2 lg:order-2 lg:sticky lg:top-6 h-max">
        <div className="rounded-2xl bg-white dark:bg-neutral-950 ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 shadow-sm p-5">
          {/* Desktop search */}
          <div className="hidden md:block" role="search">
            <label
              htmlFor="countrySearch"
              className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
            >
              Search countries
            </label>
            <div className="mt-3">
              <SearchField
                id="countrySearch"
                inputRef={inputRef}
                value={q}
                onChange={setQ}
                placeholder="Type a country name…"
                srLabel="Search countries"
              />
            </div>
            <CountBar current={filtered.length} total={countries.length} />
            <p className="mt-2 text-[12px] text-neutral-600 dark:text-neutral-400">
              Tip: press <kbd className="rounded border px-1">/</kbd> to focus
              the search.
            </p>
          </div>

          {/* Top programs (horizontal cards for sidebars) */}
          {topPrograms && topPrograms.length > 0 ? (
            <div className="mt-6">
              <header className="mb-2">
                <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {derivedHeading}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Popular, fast-moving options across countries.
                </p>
              </header>
              <TopPrograms programs={topPrograms as any} />
            </div>
          ) : null}
        </div>

        {/* Contact form */}
        <div className="pt-5">
          <ContactForm />
        </div>
      </aside>

      {/* SEO: JSON-LD for the country grid */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </section>
  );
}

/* ---------------- subcomponents ---------------- */

function SearchField({
  id,
  value,
  onChange,
  placeholder,
  srLabel,
  inputRef,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  srLabel: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {srLabel}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500"
        aria-hidden
      />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={[
          "w-full rounded-xl",
          "bg-white dark:bg-neutral-950",
          "ring-1 ring-neutral-300 dark:ring-neutral-700",
          "px-9 pr-9 py-3 text-sm md:text-base",
          "text-neutral-900 dark:text-neutral-50",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
          "focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200",
        ].join(" ")}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function CountBar({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="mt-2 text-xs text-neutral-600 dark:text-neutral-400"
      aria-live="polite"
      role="status"
    >
      Showing <strong className="tabular-nums">{current}</strong> of{" "}
      <span className="tabular-nums">{total}</span>
    </div>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-950 ring-1 ring-neutral-200 dark:ring-neutral-800 p-6 text-center">
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        No countries match{" "}
        <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          onClick={onClear}
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          Clear search
        </button>
        <Link
          href="/contact"
          className="rounded-lg ring-1 ring-neutral-300 dark:ring-neutral-700 px-3 py-1.5 text-sm"
        >
          Get help
        </Link>
      </div>
    </div>
  );
}

/* ---------------- background (subtle, black & white) ---------------- */
function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* very faint grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] dark:opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-bw"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-bw)"
          className="text-neutral-900 dark:text-neutral-300"
        />
      </svg>
      {/* soft neutral glows */}
      <div className="absolute -top-24 -left-20 h-56 w-56 rounded-full bg-neutral-400/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-neutral-500/10 blur-3xl" />
    </div>
  );
}
