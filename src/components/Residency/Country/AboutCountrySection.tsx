// src/components/Residency/Country/AboutCountrySection.tsx
// Professional immigration-themed design; light/dark; responsive; accessible; SEO JSON-LD.

import React from "react";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import {
  Users,
  Landmark,
  Languages,
  BadgeDollarSign,
  Clock,
  CloudSun,
} from "lucide-react";

export type CountryFacts = {
  population?: number | string;
  capital?: string;
  language?: string;
  currency?: string;
  timeZone?: string;
  climate?: string;
};

type Accent = "blue" | "emerald" | "violet" | "amber" | "sky" | "rose";

export default function AboutCountrySection({
  country,
  overview,
  facts,
  /** Optional: link to official government immigration site */
  officialSiteUrl,
  /** Optional: custom agency label */
  officialAgencyName,
  /** Optional: small flag (root-absolute or remote) */
  flagSrc,
}: {
  country: string;
  overview?: string;
  facts?: CountryFacts;
  officialSiteUrl?: string;
  officialAgencyName?: string;
  flagSrc?: string;
}) {
  if (!overview && !facts) return null;

  const headerId = "about-" + React.useId();
  const items = buildFactItems(facts);
  const chips = buildHighlightChips(facts);
  const ld = factsToLd(country, facts);

  return (
    <section
      id="about"
      className="relative scroll-mt-28"
      aria-labelledby={headerId}
      itemScope
      itemType="https://schema.org/Country"
    >
      {/* Immigration-themed, subtle background graphics */}
      <ImmigrationGraphics />

      <div className="relative z-10">
        {/* Hidden heading to satisfy aria-labelledby without changing SectionHeader props */}
        <h2 id={headerId} className="sr-only">
          About {country}
        </h2>
        <meta itemProp="name" content={country} />

        <div className="flex items-start gap-3">
          <SectionHeader eyebrow="Overview" title={`About ${country}`} />
          {flagSrc ? (
            <span
              className="mt-1 inline-flex h-6 w-9 overflow-hidden rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800"
              aria-hidden
            >
              <img
                src={flagSrc}
                alt=""
                width={36}
                height={24}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </span>
          ) : null}
        </div>

        {overview ? (
          <p
            className="mt-3 text-[15px] sm:text-[16px] leading-7 text-neutral-800 dark:text-neutral-200 text-pretty"
            itemProp="description"
          >
            {overview}
          </p>
        ) : null}

        {/* Quick chips (only if data exists) */}
        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {chips.map((c) => (
              <Chip
                key={c.label}
                label={c.label}
                value={c.value}
                color={c.color}
              />
            ))}
          </div>
        ) : null}

        {/* Facts grid: show only available facts */}
        {items.length ? (
          <dl
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={`${country} key facts`}
          >
            {items.map((it) => (
              <StatCard key={it.label} item={it} />
            ))}
          </dl>
        ) : null}

        {/* Official government source (optional) */}
        {officialSiteUrl ? (
          <div
            className="
              mt-6 rounded-2xl p-4 sm:p-5
              bg-gradient-to-br from-sky-50/80 via-white/85 to-blue-50/70
              dark:from-[rgba(2,6,23,0.7)] dark:via-[rgba(2,6,23,0.6)] dark:to-[rgba(30,41,59,0.5)]
              ring-1 ring-neutral-200 dark:ring-neutral-800 backdrop-blur
            "
            itemProp="isPartOf"
            itemScope
            itemType="https://schema.org/GovernmentOrganization"
          >
            <div className="flex items-start gap-3">
              {/* Shield/passport icon */}
              <span
                aria-hidden
                className="
                  grid h-10 w-10 shrink-0 place-items-center rounded-lg
                  bg-gradient-to-b from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-800
                  ring-1 ring-sky-200/60 dark:ring-sky-900/50 text-sky-700 dark:text-sky-300
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
                  <rect x="8" y="9" width="8" height="6" rx="1.5" />
                </svg>
              </span>

              <div className="min-w-0">
                <div className="text-[13px] uppercase tracking-wide text-neutral-700/90 dark:text-neutral-300">
                  Official source
                </div>
                <div
                  className="mt-0.5 text-[15px] font-semibold leading-6 text-neutral-900 dark:text-neutral-100"
                  itemProp="name"
                >
                  {officialAgencyName || "Official government site"}
                </div>
                <div className="mt-2">
                  <Link
                    href={officialSiteUrl}
                    target="_blank"
                    rel="noopener nofollow"
                    className="
                      inline-flex items-center gap-2 rounded-md px-2.5 py-1.5
                      bg-white/90 hover:bg-white dark:bg-neutral-900/70 dark:hover:bg-neutral-900
                      ring-1 ring-neutral-200 dark:ring-neutral-800
                      text-[13px] font-medium text-sky-700 dark:text-sky-300
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60
                      transition
                    "
                    itemProp="url"
                  >
                    Visit website
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path
                        d="M9 5h6m0 0v6m0-6L9 11"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* SEO JSON-LD */}
      {ld ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ) : null}
    </section>
  );
}

/* ----------------- Background graphics (passport/visa/globe motifs) ----------------- */
function ImmigrationGraphics() {
  return (
    <>
      {/* Soft radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
      />
      {/* Blueprint/grid + subtle motifs */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.08]"
      >
        <defs>
          <pattern
            id="imm-grid"
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
          <symbol id="visa-stamp" viewBox="0 0 120 80">
            <rect
              x="3"
              y="3"
              width="114"
              height="74"
              rx="10"
              ry="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <rect
              x="18"
              y="22"
              width="84"
              height="16"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <rect
              x="18"
              y="46"
              width="54"
              height="14"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </symbol>
          <symbol id="passport" viewBox="0 0 96 96">
            <rect
              x="14"
              y="10"
              width="68"
              height="76"
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              cx="48"
              cy="42"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path d="M32 68h32" stroke="currentColor" strokeWidth="4" />
          </symbol>
          <symbol id="globe" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M18 48h60M48 18v60M29 29c10 6 28 6 38 0M29 67c10-6 28-6 38 0"
              stroke="currentColor"
              strokeWidth="4"
            />
          </symbol>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#imm-grid)"
          className="text-sky-700 dark:text-sky-300"
        />
        <g className="text-sky-800 dark:text-sky-300" opacity="0.06">
          <use href="#visa-stamp" x="40" y="40" />
          <use href="#passport" x="260" y="120" />
          <use href="#globe" x="520" y="40" />
        </g>
      </svg>
      {/* Top gloss for legibility on mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10"
      />
    </>
  );
}

/* ----------------- Subcomponents ----------------- */

function Chip({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color: Accent;
}) {
  const c = accent(color);
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] ring-1",
        c.chipBg,
        c.chipText,
        c.chipRing,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span className="font-semibold">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

type FactItem = {
  label: string;
  value: React.ReactNode;
  Icon: React.ElementType;
  accent: Accent;
};

function StatCard({ item }: { item: FactItem }) {
  const c = accent(item.accent);
  const IconCmp = item.Icon;

  return (
    <div
      className="group relative h-full overflow-hidden rounded-2xl p-4 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900/40 ring-1 ring-neutral-200 dark:ring-neutral-800 transition shadow-sm hover:shadow-md"
      itemProp="additionalProperty"
      itemScope
      itemType="https://schema.org/PropertyValue"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full ${c.accentArc} opacity-10 blur-2xl`}
      />
      <meta itemProp="name" content={item.label} />
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${c.bubbleBg} ${c.iconText} ring-1 ring-inset ${c.bubbleRing}`}
        >
          <IconCmp className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {item.label}
          </dt>
          <dd
            className="mt-0.5 text-[15px] font-semibold leading-6 text-neutral-900 dark:text-neutral-100 break-words hyphens-auto"
            itemProp="value"
          >
            {item.value}
          </dd>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Data builders ----------------- */

function buildFactItems(f?: CountryFacts) {
  if (!f) return [] as FactItem[];
  const list: FactItem[] = [
    {
      label: "Population",
      value:
        typeof f.population === "number"
          ? Number(f.population).toLocaleString()
          : f.population,
      Icon: Users,
      accent: "blue",
    },
    { label: "Capital", value: f.capital, Icon: Landmark, accent: "emerald" },
    { label: "Language", value: f.language, Icon: Languages, accent: "violet" },
    {
      label: "Currency",
      value: f.currency,
      Icon: BadgeDollarSign,
      accent: "amber",
    },
    { label: "Time zone", value: f.timeZone, Icon: Clock, accent: "sky" },
    { label: "Climate", value: f.climate, Icon: CloudSun, accent: "rose" },
  ];
  return list.filter((i) => i.value !== undefined && i.value !== "");
}

/** Show up to 3 concise chips when available */
function buildHighlightChips(f?: CountryFacts) {
  if (!f)
    return [] as Array<{
      label: string;
      value: React.ReactNode;
      color: Accent;
    }>;
  const pool: Array<{ label: string; value?: React.ReactNode; color: Accent }> =
    [
      { label: "Capital", value: f.capital, color: "emerald" },
      { label: "Language", value: f.language, color: "violet" },
      { label: "Currency", value: f.currency, color: "amber" },
    ];
  return pool
    .filter((p) => p.value != null && p.value !== "")
    .slice(0, 3) as Array<{
    label: string;
    value: React.ReactNode;
    color: Accent;
  }>;
}

/* ----------------- SEO JSON-LD ----------------- */
function factsToLd(country: string, f?: CountryFacts) {
  if (!f) return null;
  const additionalProperty: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string | number;
  }> = [];
  const push = (name: string, value?: string | number) => {
    if (value !== undefined && value !== "")
      additionalProperty.push({ "@type": "PropertyValue", name, value });
  };
  push(
    "Population",
    typeof f.population === "number"
      ? Number(f.population)
      : (f.population as any),
  );
  push("Capital", f.capital);
  push("Language", f.language);
  push("Currency", f.currency);
  push("Time zone", f.timeZone);
  push("Climate", f.climate);
  if (!additionalProperty.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Country",
    name: country,
    additionalProperty,
  };
}

/* ----------------- Accent tokens ----------------- */
function accent(k: Accent) {
  switch (k) {
    case "blue":
      return {
        chipBg: "bg-blue-50 dark:bg-blue-900/20",
        chipText: "text-blue-800 dark:text-blue-300",
        chipRing: "ring-blue-100 dark:ring-blue-800/60",
        bubbleBg: "bg-blue-50 dark:bg-blue-900/30",
        bubbleRing: "ring-blue-100/70 dark:ring-blue-800/50",
        iconText: "text-blue-700 dark:text-blue-300",
        dot: "bg-blue-600 dark:bg-blue-400",
        accentArc: "bg-gradient-to-br from-sky-500 to-blue-600",
      };
    case "emerald":
      return {
        chipBg: "bg-emerald-50 dark:bg-emerald-900/20",
        chipText: "text-emerald-800 dark:text-emerald-300",
        chipRing: "ring-emerald-100 dark:ring-emerald-800/60",
        bubbleBg: "bg-emerald-50 dark:bg-emerald-900/30",
        bubbleRing: "ring-emerald-100/70 dark:ring-emerald-800/50",
        iconText: "text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-600 dark:bg-emerald-400",
        accentArc: "bg-gradient-to-br from-emerald-500 to-green-600",
      };
    case "violet":
      return {
        chipBg: "bg-violet-50 dark:bg-violet-900/20",
        chipText: "text-violet-800 dark:text-violet-300",
        chipRing: "ring-violet-100 dark:ring-violet-800/60",
        bubbleBg: "bg-violet-50 dark:bg-violet-900/30",
        bubbleRing: "ring-violet-100/70 dark:ring-violet-800/50",
        iconText: "text-violet-700 dark:text-violet-300",
        dot: "bg-violet-600 dark:bg-violet-400",
        accentArc: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      };
    case "amber":
      return {
        chipBg: "bg-amber-50 dark:bg-amber-900/20",
        chipText: "text-amber-800 dark:text-amber-300",
        chipRing: "ring-amber-100 dark:ring-amber-800/60",
        bubbleBg: "bg-amber-50 dark:bg-amber-900/30",
        bubbleRing: "ring-amber-100/70 dark:ring-amber-800/50",
        iconText: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-600 dark:bg-amber-400",
        accentArc: "bg-gradient-to-br from-amber-500 to-orange-600",
      };
    case "sky":
      return {
        chipBg: "bg-sky-50 dark:bg-sky-900/20",
        chipText: "text-sky-800 dark:text-sky-300",
        chipRing: "ring-sky-100 dark:ring-sky-800/60",
        bubbleBg: "bg-sky-50 dark:bg-sky-900/30",
        bubbleRing: "ring-sky-100/70 dark:ring-sky-800/50",
        iconText: "text-sky-700 dark:text-sky-300",
        dot: "bg-sky-600 dark:bg-sky-400",
        accentArc: "bg-gradient-to-br from-sky-500 to-blue-600",
      };
    case "rose":
      return {
        chipBg: "bg-rose-50 dark:bg-rose-900/20",
        chipText: "text-rose-800 dark:text-rose-300",
        chipRing: "ring-rose-100 dark:ring-rose-800/60",
        bubbleBg: "bg-rose-50 dark:bg-rose-900/30",
        bubbleRing: "ring-rose-100/70 dark:ring-rose-800/50",
        iconText: "text-rose-700 dark:text-rose-300",
        dot: "bg-rose-600 dark:bg-rose-400",
        accentArc: "bg-gradient-to-br from-rose-500 to-pink-600",
      };
  }
}
