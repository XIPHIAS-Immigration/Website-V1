// src/components/Citizenship/InvestmentRoutes.tsx
import React from "react";

/**
 * InvestmentRoutes — professional, readable blue-accent list
 * - Server-component friendly (no hooks, no client-only libs)
 * - White cards on ultra-light grid; blue only for emphasis
 * - 100% responsive (1 → 2 → 3 columns), print-friendly
 * - A11y: semantic <section>/<header>, dl pairs, focus states
 * - SEO: ItemList JSON-LD with Offer rows
 */

export type RouteItem = {
  title: string;
  minInvestment?: number;
  timeline?: number; // in months
  currency?: string;
  count?: number; // number of programs for this route
};

type Props = { routes: RouteItem[]; className?: string };

export default function InvestmentRoutes({ routes, className = "" }: Props) {
  if (!routes?.length) return null;

  const id = "investment-routes";
  const cheapest = minBy(routes, (r) =>
    isFiniteNum(r.minInvestment) ? (r.minInvestment as number) : Infinity,
  );
  const fastest = minBy(routes, (r) =>
    isFiniteNum(r.timeline) ? (r.timeline as number) : Infinity,
  );

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={[
        "relative overflow-hidden",
        "rounded-2xl p-5 md:p-6 lg:p-8",
        "bg-white dark:bg-neutral-900",
        "ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm print:shadow-none",
        className,
      ].join(" ")}
    >
      <BackgroundGraphics />

      {/* Header */}
      <header className="relative mb-4 md:mb-5">
        <div className="flex items-center gap-2 text-[12px] text-blue-700 dark:text-blue-300">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="font-medium">Routes</span>
        </div>
        <h2
          id={`${id}-title`}
          className="mt-2 text-lg md:text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Investment routes
        </h2>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          Thresholds, holding periods and indicative timelines.
        </p>

        {/* Summary chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip label="Available" value={`${routes.length}`} />
          {cheapest?.minInvestment != null ? (
            <Chip
              label="From"
              value={fmtCurrency(cheapest.minInvestment!, cheapest.currency)}
            />
          ) : null}
          {fastest?.timeline != null ? (
            <Chip label="Fastest" value={plural(fastest.timeline!, "mo")} />
          ) : null}
        </div>
      </header>

      {/* Grid */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {routes.map((r, idx) => {
          const accent = colorToken(r.title);
          return (
            <li key={`${r.title}-${idx}`} className="group">
              <article
                className={[
                  "relative h-full rounded-xl p-4",
                  "bg-white dark:bg-neutral-900",
                  "ring-1 ring-neutral-200 dark:ring-neutral-800",
                  "hover:shadow-md transition-shadow",
                  "focus-within:ring-2 focus-within:ring-blue-400/70 dark:focus-within:ring-blue-700/60",
                ].join(" ")}
                itemScope
                itemType="https://schema.org/Offer"
                aria-label={`${r.title} investment route`}
              >
                <meta itemProp="name" content={r.title} />

                {/* Decorative accent arc */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${accent.arc} opacity-10 blur-2xl`}
                />

                <div className="flex items-start gap-3">
                  {/* Icon bubble */}
                  <span
                    aria-hidden
                    className={[
                      "inline-grid place-items-center h-10 w-10 shrink-0 rounded-lg ring-1 ring-inset",
                      accent.bubbleBg,
                      accent.bubbleRing,
                      accent.iconText,
                    ].join(" ")}
                  >
                    {iconFor(r.title)}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                      itemProp="category"
                    >
                      {r.title}
                    </h3>

                    {/* Small chips */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {isFiniteNum(r.minInvestment) ? (
                        <small className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ring-1 ring-neutral-200 dark:ring-neutral-700">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-blue-600"
                            aria-hidden
                          />
                          {fmtCurrency(r.minInvestment!, r.currency)}
                        </small>
                      ) : null}
                      {isFiniteNum(r.timeline) ? (
                        <small className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ring-1 ring-neutral-200 dark:ring-neutral-700">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-neutral-500"
                            aria-hidden
                          />
                          {plural(r.timeline!, "mo")}
                        </small>
                      ) : null}
                      {isFiniteNum(r.count) ? (
                        <small className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ring-1 ring-neutral-200 dark:ring-neutral-700">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                            aria-hidden
                          />
                          {plural(r.count!, "program")}
                        </small>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row
                    label="From"
                    value={
                      isFiniteNum(r.minInvestment)
                        ? fmtCurrency(r.minInvestment!, r.currency)
                        : "—"
                    }
                  />
                  <Row
                    label="Fastest timeline"
                    value={
                      isFiniteNum(r.timeline) ? plural(r.timeline!, "mo") : "—"
                    }
                  />
                  {isFiniteNum(r.count) ? (
                    <Row label="Programs" value={String(r.count)} />
                  ) : null}
                </dl>

                {/* Offer microdata */}
                {isFiniteNum(r.minInvestment) ? (
                  <>
                    <meta itemProp="price" content={String(r.minInvestment)} />
                    {r.currency ? (
                      <meta
                        itemProp="priceCurrency"
                        content={r.currency.toUpperCase()}
                      />
                    ) : null}
                    <link
                      itemProp="availability"
                      href="https://schema.org/InStock"
                    />
                  </>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toItemListJsonLd(routes)),
        }}
      />
    </section>
  );
}

/* ---------------- Subcomponents ---------------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
      <dd className="font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </dd>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="
        inline-flex items-center gap-1 rounded-md bg-white text-neutral-900 ring-1 ring-neutral-200
        dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700
        px-2 py-0.5 text-[12px] font-medium
      "
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
      {label}: <span className="tabular-nums">{value}</span>
    </span>
  );
}

/* ---------------- Background graphics (light grid + neutral glows) ---------------- */
function BackgroundGraphics() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 print:hidden"
    >
      <div className="absolute -top-24 -left-20 h-56 w-56 rounded-full bg-neutral-300/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-neutral-400/10 blur-3xl" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ir-grid"
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
        <rect width="100%" height="100%" fill="url(#ir-grid)" />
      </svg>
    </div>
  );
}

/* ---------------- Icons & color tokens ---------------- */

function iconFor(title: string) {
  const t = title.toLowerCase();
  if (/\bdonation|contribution|national fund/.test(t))
    return <CoinIcon className="h-4 w-4" />;
  if (/\b(real ?estate|property|home|house)/.test(t))
    return <HomeIcon className="h-4 w-4" />;
  if (/\bbond|securit/.test(t)) return <BondIcon className="h-4 w-4" />;
  if (/\b(business|enterprise|startup|company|investment fund)/.test(t))
    return <BriefcaseIcon className="h-4 w-4" />;
  return <StarIcon className="h-4 w-4" />;
}

function colorToken(title: string) {
  const t = title.toLowerCase();
  if (/\bdonation|contribution|fund/.test(t)) {
    return {
      bubbleBg: "bg-amber-50 dark:bg-amber-900/30",
      bubbleRing: "ring-amber-100/70 dark:ring-amber-800/50",
      iconText: "text-amber-700 dark:text-amber-300",
      arc: "bg-gradient-to-br from-amber-500 to-orange-600",
    };
  }
  if (/\breal ?estate|property/.test(t)) {
    return {
      bubbleBg: "bg-blue-50 dark:bg-blue-900/30",
      bubbleRing: "ring-blue-100/70 dark:ring-blue-800/50",
      iconText: "text-blue-700 dark:text-blue-300",
      arc: "bg-gradient-to-br from-sky-500 to-blue-600",
    };
  }
  if (/\bbond/.test(t)) {
    return {
      bubbleBg: "bg-violet-50 dark:bg-violet-900/30",
      bubbleRing: "ring-violet-100/70 dark:ring-violet-800/50",
      iconText: "text-violet-700 dark:text-violet-300",
      arc: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    };
  }
  if (/\bbusiness|enterprise|startup|fund/.test(t)) {
    return {
      bubbleBg: "bg-emerald-50 dark:bg-emerald-900/30",
      bubbleRing: "ring-emerald-100/70 dark:ring-emerald-800/50",
      iconText: "text-emerald-700 dark:text-emerald-300",
      arc: "bg-gradient-to-br from-emerald-500 to-green-600",
    };
  }
  return {
    bubbleBg: "bg-neutral-50 dark:bg-neutral-800/60",
    bubbleRing: "ring-neutral-200/70 dark:ring-neutral-700/50",
    iconText: "text-neutral-700 dark:text-neutral-300",
    arc: "bg-gradient-to-br from-neutral-400 to-neutral-600",
  };
}

function CoinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}
function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 11l9-7 9 7" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}
function BondIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h10M7 14h6" />
    </svg>
  );
}
function BriefcaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}
function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 3l2.9 6.26L22 10.27l-5 4.87L18.2 22 12 18.6 5.8 22 7 15.14l-5-4.87 7.1-1.01L12 3z" />
    </svg>
  );
}

/* ---------------- Utils ---------------- */

function isFiniteNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function minBy<T>(arr: T[], fn: (x: T) => number) {
  if (!arr.length) return undefined;
  let best = arr[0];
  let bestVal = fn(best);
  for (let i = 1; i < arr.length; i++) {
    const v = fn(arr[i]);
    if (v < bestVal) {
      best = arr[i];
      bestVal = v;
    }
  }
  return Number.isFinite(bestVal) ? (best as T) : undefined;
}

function fmtCurrency(amount: number, currency?: string) {
  if (!isFiniteNum(amount)) return "—";
  const cur = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${cur}`;
  }
}

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/* ---------------- JSON-LD ---------------- */

function toItemListJsonLd(routes: RouteItem[]) {
  const itemListElement = routes.map((r, i) => {
    const offer: any = {
      "@type": "Offer",
      name: r.title,
    };
    if (isFiniteNum(r.minInvestment)) offer.price = r.minInvestment;
    if (r.currency) offer.priceCurrency = r.currency.toUpperCase();
    offer.description =
      [
        isFiniteNum(r.timeline)
          ? `Fastest timeline: ${plural(r.timeline!, "mo")}`
          : null,
        isFiniteNum(r.count) ? `Programs: ${r.count}` : null,
      ]
        .filter(Boolean)
        .join(" · ") || undefined;

    return { "@type": "ListItem", position: i + 1, item: offer };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Investment routes",
    itemListOrder: "Ascending",
    itemListElement,
  } as const;
}
