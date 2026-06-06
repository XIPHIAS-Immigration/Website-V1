// src/components/Shared/MetricsTiles.tsx
import React from "react";

type Tile = { label: string; value: string | number };

type Props =
  | { items: Tile[]; className?: string }
  | {
      minInvestmentRange?: string;
      timelineRange?: string;
      visaFreeCount?: number;
      passportRank?: number;
      className?: string;
      items?: never;
    };

/**
 * MetricsTiles — crisp, professional stats
 * - Server-component friendly (no hooks)
 * - White cards, subtle rings; blue only as an accent
 * - Accessible: semantic <dl>, focus rings, good contrast
 * - Responsive: 1 → 2 → 4 columns, print friendly
 * - SEO: emits JSON-LD (ItemList of PropertyValue)
 */
export default function MetricsTiles(props: Props) {
  const className = (props as any).className ?? "";
  const tiles: Tile[] =
    "items" in props && props.items
      ? props.items
      : [
          {
            label: "Minimum investment range",
            value: (props as any).minInvestmentRange ?? "Varies",
          },
          {
            label: "Typical timeline",
            value: (props as any).timelineRange ?? "Varies",
          },
          {
            label: "Visa-free countries",
            value: isNum((props as any).visaFreeCount)
              ? (props as any).visaFreeCount
              : "—",
          },
          {
            label: "Passport rank",
            value: isNum((props as any).passportRank)
              ? (props as any).passportRank
              : "—",
          },
        ];

  if (!tiles.length) return null;

  return (
    <section
      aria-label="Key metrics"
      className={[
        "relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      ].join(" ")}
    >
      {tiles.map((t, i) => {
        const accent = tokenFromLabel(t.label);
        const val = formatValue(t.value);
        return (
          <article
            key={`${t.label}-${i}`}
            className={[
              "group relative h-full overflow-hidden rounded-2xl p-4",
              "bg-white dark:bg-neutral-900",
              "ring-1 ring-neutral-200 dark:ring-neutral-800",
              "shadow-sm hover:shadow-md transition-shadow",
              "focus-within:ring-2 focus-within:ring-blue-400/70 dark:focus-within:ring-blue-700/60",
            ].join(" ")}
            aria-label={`${t.label}: ${val}`}
            itemScope
            itemType="https://schema.org/PropertyValue"
          >
            {/* soft accent arc */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${accent.arc} opacity-10 blur-2xl`}
            />

            <dl className="min-w-0">
              <div className="flex items-start gap-3">
                {/* icon bubble */}
                <span
                  aria-hidden
                  className={[
                    "inline-grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
                    accent.bubbleBg,
                    accent.bubbleRing,
                    accent.iconText,
                  ].join(" ")}
                >
                  {iconForLabel(t.label)}
                </span>

                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                    {t.label}
                  </dt>
                  <dd
                    className="mt-1 text-[15px] font-semibold leading-6 text-neutral-900 dark:text-neutral-100 truncate tabular-nums"
                    itemProp="value"
                    title={String(val)}
                  >
                    {val}
                  </dd>
                </div>
              </div>
            </dl>
          </article>
        );
      })}

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toItemListJsonLd(tiles)),
        }}
      />
    </section>
  );
}

/* ---------------- helpers ---------------- */

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function formatValue(v: string | number) {
  if (isNum(v)) return v.toLocaleString();
  return v;
}

/** Choose gentle accent based on common labels */
function tokenFromLabel(label: string) {
  const l = label.toLowerCase();
  if (/\binvest|donation|amount|price|cost/.test(l)) {
    return {
      bubbleBg: "bg-amber-50 dark:bg-amber-900/30",
      bubbleRing: "ring-amber-100/70 dark:ring-amber-800/50",
      iconText: "text-amber-700 dark:text-amber-300",
      arc: "bg-gradient-to-br from-amber-500 to-orange-600",
    };
  }
  if (/\btimeline|time|month|processing/.test(l)) {
    return {
      bubbleBg: "bg-sky-50 dark:bg-sky-900/30",
      bubbleRing: "ring-sky-100/70 dark:ring-sky-800/50",
      iconText: "text-sky-700 dark:text-sky-300",
      arc: "bg-gradient-to-br from-sky-500 to-blue-600",
    };
  }
  if (/\bvisa|travel|countries/.test(l)) {
    return {
      bubbleBg: "bg-emerald-50 dark:bg-emerald-900/30",
      bubbleRing: "ring-emerald-100/70 dark:ring-emerald-800/50",
      iconText: "text-emerald-700 dark:text-emerald-300",
      arc: "bg-gradient-to-br from-emerald-500 to-green-600",
    };
  }
  if (/\bpassport|rank|strength/.test(l)) {
    return {
      bubbleBg: "bg-violet-50 dark:bg-violet-900/30",
      bubbleRing: "ring-violet-100/70 dark:ring-violet-800/50",
      iconText: "text-violet-700 dark:text-violet-300",
      arc: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    };
  }
  return {
    bubbleBg: "bg-neutral-50 dark:bg-neutral-800/60",
    bubbleRing: "ring-neutral-200/70 dark:ring-neutral-700/50",
    iconText: "text-neutral-700 dark:text-neutral-300",
    arc: "bg-gradient-to-br from-neutral-400 to-neutral-600",
  };
}

/* ---------------- icons (inline, no deps) ---------------- */

function iconForLabel(label: string) {
  const l = label.toLowerCase();
  if (/\binvest|donation|amount|price|cost/.test(l))
    return <BanknoteIcon className="h-4 w-4" />;
  if (/\btimeline|time|month|processing/.test(l))
    return <CalendarIcon className="h-4 w-4" />;
  if (/\bvisa|travel|countries/.test(l))
    return <GlobeIcon className="h-4 w-4" />;
  if (/\bpassport|rank|strength/.test(l))
    return <ShieldIcon className="h-4 w-4" />;
  return <InfoIcon className="h-4 w-4" />;
}

function BanknoteIcon({ className = "" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 10h.01M17 14h.01" />
    </svg>
  );
}
function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5 8c4 2 10 2 14 0M5 16c4-2 10-2 14 0" />
    </svg>
  );
}
function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6h.01M9 9h2v5H9z" />
    </svg>
  );
}

/* ---------------- JSON-LD ---------------- */

function toItemListJsonLd(items: Tile[]) {
  const itemListElement = items.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "PropertyValue",
      name: t.label,
      value: typeof t.value === "number" ? t.value : String(t.value),
    },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Key metrics",
    itemListElement,
  } as const;
}
