// src/components/Residency/Prices.tsx
"use client";

import * as React from "react";
import { Banknote, Wallet, Info, CalendarDays, FileText } from "lucide-react";
/**
 * Prices (Residency) — blue primary, WHITE surfaces, subtle light grid
 * - Readability first: solid white cards, neutral text, restrained blue accents
 * - Background: very faint grid + soft neutral glows (non-distracting)
 * - UX: currency summary chips, stage timeline, sticky-first-col table, mobile scroll hint
 * - A11y: SR summary, caption, contrast-safe colors, motion-reduce friendly
 * - SEO: AggregateOffer JSON-LD + per-row Offer microdata
 * - Signature unchanged
 */

type PriceItem = {
  label: string;
  amount?: number;
  currency?: string;
  when?: string;
  notes?: string;
};

type ProofItem = {
  label?: string;
  amount: number;
  currency?: string;
  notes?: string;
};

export default function Prices({
  items,
  proofOfFunds = [],
  defaultCurrency = "USD",
}: {
  items: PriceItem[];
  proofOfFunds?: ProofItem[];
  defaultCurrency?: string;
}) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const hasProof = Array.isArray(proofOfFunds) && proofOfFunds.length > 0;
  if (!hasItems && !hasProof) return null;

  /* ---------- helpers ---------- */
const LOCALE = "en-US";

const fmt = (amt?: number, cur?: string) => {
  if (typeof amt !== "number" || Number.isNaN(amt)) return "—";
  const c = (cur || defaultCurrency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: c,
      maximumFractionDigits: 0,
    }).format(amt);
  } catch {
    return `${amt.toLocaleString(LOCALE)} ${c}`;
  }
};


  const sumByCurrency = <T extends { amount?: number; currency?: string }>(
    list: T[],
  ) => {
    const map = new Map<string, number>();
    for (const row of list) {
      if (typeof row.amount !== "number" || Number.isNaN(row.amount)) continue;
      const c = (row.currency || defaultCurrency || "USD").toUpperCase();
      map.set(c, (map.get(c) || 0) + row.amount);
    }
    return [...map.entries()].map(([currency, total]) => ({ currency, total }));
  };

  type StageKey =
    | "reservation"
    | "application"
    | "approval"
    | "issuance"
    | "other";
  const normalizeStage = (when?: string): StageKey => {
    const s = (when || "").toLowerCase();
    if (!s) return "other";
    if (/\b(reserve|reservation|booking|deposit)\b/.test(s))
      return "reservation";
    if (/\b(app|application|submit|filing|due diligence|dd)\b/.test(s))
      return "application";
    if (/\b(approval|decision|grant)\b/.test(s)) return "approval";
    if (/\b(oath|issuance|passport|certificate|naturalization)\b/.test(s))
      return "issuance";
    return "other";
  };

  const itemTotals = hasItems ? sumByCurrency(items) : [];
  const proofTotals = hasProof ? sumByCurrency(proofOfFunds) : [];

  // Group into stages
  const stageBuckets = React.useMemo(() => {
    const buckets: Record<
      StageKey,
      { items: PriceItem[]; totals: ReturnType<typeof sumByCurrency> }
    > = {
      reservation: { items: [], totals: [] },
      application: { items: [], totals: [] },
      approval: { items: [], totals: [] },
      issuance: { items: [], totals: [] },
      other: { items: [], totals: [] },
    };
    if (hasItems) {
      for (const it of items) buckets[normalizeStage(it.when)].items.push(it);
      (Object.keys(buckets) as StageKey[]).forEach((k) => {
        buckets[k].totals = sumByCurrency(buckets[k].items);
      });
    }
    return buckets;
  }, [items, hasItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const a11ySummary = [
    hasItems ? `Fees listed: ${items.length} line items.` : "",
    itemTotals.length
      ? `Estimated totals: ${itemTotals
          .map((t) => `${fmt(t.total, t.currency)} (${t.currency})`)
          .join(", ")}.`
      : "",
    hasProof ? `Proof of funds items: ${proofOfFunds.length}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // JSON-LD AggregateOffer (plus per-row microdata below)
  const aggregateJsonLd = React.useMemo(() => {
    const offers = (items || []).map((it) => ({
      "@type": "Offer",
      name: it.label,
      price: typeof it.amount === "number" ? it.amount : undefined,
      priceCurrency: (it.currency || defaultCurrency).toUpperCase(),
      description: [it.when, it.notes].filter(Boolean).join(" — ") || undefined,
      availability: "https://schema.org/InStock",
    }));
    return {
      "@context": "https://schema.org",
      "@type": "AggregateOffer",
      priceCurrency: defaultCurrency.toUpperCase(),
      offers,
    } as const;
  }, [items, defaultCurrency]);

  /* ---------- UI ---------- */
  return (
    <section
      aria-labelledby="prices-title"
      aria-describedby="prices-desc"
      className="relative space-y-6"
      itemScope
      itemType="https://schema.org/AggregateOffer"
    >
      {/* very light grid + soft neutral glows to avoid blue wash */}
      <BackgroundGraphics />

      {/* Header */}
      <header className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white dark:bg-blue-500">
          Costs & funds
        </span>
        <h3
          id="prices-title"
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Program fees & proof of funds
        </h3>
      </header>
      <p id="prices-desc" className="sr-only">
        {a11ySummary}
      </p>

      {/* ===== Summary strip: currency totals ===== */}
      {itemTotals.length || proofTotals.length ? (
        <div
          className="
            rounded-2xl p-4 sm:p-5
            bg-white dark:bg-neutral-900
            ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm
          "
          role="group"
          aria-label="Totals summary"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {itemTotals.length ? (
              <div className="rounded-xl p-3 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Estimated program totals
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {itemTotals.map(({ currency, total }) => (
                    <span
                      key={`items-${currency}`}
                      className="
                        inline-flex items-center gap-1 rounded-full
                        bg-white text-neutral-900 ring-1 ring-neutral-200
                        dark:bg-neutral-800 dark:text-neutral-50 dark:ring-neutral-700
                        px-2.5 py-0.5 text-[12px] font-medium
                      "
                    >
                      {currency}:{" "}
                      <span className="tabular-nums">
                        {fmt(total, currency)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {proofTotals.length ? (
              <div className="rounded-xl p-3 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Required proof of funds
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {proofTotals.map(({ currency, total }) => (
                    <span
                      key={`proof-${currency}`}
                      className="
                        inline-flex items-center gap-1 rounded-full
                        bg-white text-neutral-900 ring-1 ring-neutral-200
                        dark:bg-neutral-800 dark:text-neutral-50 dark:ring-neutral-700
                        px-2.5 py-0.5 text-[12px] font-medium
                      "
                    >
                      {currency}:{" "}
                      <span className="tabular-nums">
                        {fmt(total, currency)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ===== Stage timeline (blue accent, white surface) ===== */}
      {hasItems ? (
        <nav
          aria-label="Payment stages"
          className="
            rounded-2xl p-4 sm:p-5
            bg-white dark:bg-neutral-900
            ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm
          "
        >
          <ol className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {/* connector line */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-5 hidden sm:block h-px bg-neutral-200 dark:bg-neutral-700"
            />
            {(
              ["reservation", "application", "approval", "issuance"] as const
            ).map((k, idx) => {
              const active = stageBuckets[k].items.length > 0;
              return (
                <li key={k} className="relative">
                  <div
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 font-semibold tabular-nums transition-colors motion-reduce:transition-none",
                      active
                        ? "bg-blue-600 text-white ring-blue-500"
                        : "bg-white text-blue-700 ring-blue-200 dark:bg-neutral-900 dark:text-blue-300 dark:ring-neutral-700",
                    ].join(" ")}
                    aria-hidden
                  >
                    {idx + 1}
                  </div>
                  <div className="mt-2">
                    <div className="text-[12px] uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                      {stageLabel(k)}
                    </div>
                    {stageBuckets[k].totals.length ? (
                      <div className="mt-0.5 space-y-0.5">
                        {stageBuckets[k].totals.map(({ currency, total }) => (
                          <div key={`${k}-${currency}`} className="text-[13px]">
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {currency}:
                            </span>{" "}
                            <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                              {fmt(total, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[13px] text-neutral-500 dark:text-neutral-400">
                        No fees at this stage
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[12px] text-neutral-600 dark:text-neutral-400">
            Stages are inferred from each line item’s “When” note.
          </p>
        </nav>
      ) : null}

      {/* ===== Fees table (mobile-safe; desktop sticky first column) ===== */}
      {hasItems ? (
        <div
          role="group"
          aria-label="Program fee breakdown"
          className="
            rounded-2xl
            bg-white dark:bg-neutral-900
            ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm
            print:bg-white print:shadow-none
          "
        >
          <div className="px-4 pt-4 sm:px-6 sm:pt-6 flex items-center gap-2">
            <Banknote
              className="h-4 w-4 text-blue-700 dark:text-blue-300"
              aria-hidden
            />
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Detailed fee table
            </p>
          </div>

          <div className="relative mt-3">
            {/* edge fades (hidden on print) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-0 bg-gradient-to-r from-white to-transparent dark:from-neutral-900 print:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-0 bg-gradient-to-l from-white to-transparent dark:from-neutral-900 print:hidden" />

            <div className="overflow-x-auto px-4 sm:px-6 pb-4 overscroll-x-contain">
              <table className="min-w-[780px] w-full table-fixed text-sm print:min-w-full">
                <colgroup>
                  <col className="w-[44%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[20%]" />
                </colgroup>

                <caption className="sr-only">
                  Program fee breakdown with price, timing and notes.
                </caption>

                <thead className="bg-neutral-50 dark:bg-neutral-900/60">
                  <tr className="text-left text-[12px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                    <th className="py-2.5 pr-4 font-semibold md:sticky md:left-0 md:bg-neutral-50 md:dark:bg-neutral-900/60 md:z-10">
                      Item
                    </th>
                    <th className="py-2.5 pr-4 font-semibold">Price</th>
                    <th className="py-2.5 pr-4 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        When
                      </span>
                    </th>
                    <th className="py-2.5 pr-4 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        Notes
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it, i) => (
                    <tr
                      key={`${it.label}-${i}`}
                      className={[
                        "border-t border-neutral-200 dark:border-neutral-800",
                        i % 2
                          ? "bg-white dark:bg-neutral-900"
                          : "bg-neutral-50/70 dark:bg-neutral-900/50",
                      ].join(" ")}
                      itemScope
                      itemType="https://schema.org/Offer"
                    >
                      <td
                        className="
                          py-3 pr-4 font-medium
                          md:sticky md:left-0 md:bg-inherit md:z-10
                          whitespace-nowrap truncate max-w-[60vw] md:max-w-none
                          text-neutral-900 dark:text-neutral-100
                        "
                        title={it.label}
                      >
                        <span itemProp="name">{it.label}</span>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-neutral-900 dark:text-neutral-100">
                        <span itemProp="price">
                          {fmt(it.amount, it.currency)}
                        </span>
                        {it.amount ? (
                          <meta
                            itemProp="priceCurrency"
                            content={(
                              it.currency || defaultCurrency
                            ).toUpperCase()}
                          />
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-neutral-700 dark:text-neutral-300">
                        {it.when ?? "—"}
                      </td>

                      <td className="py-3 pr-4 align-top">
                        {it.notes ? (
                          <p
                            className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words"
                            title={it.notes}
                          >
                            {it.notes}
                          </p>
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* mobile hint */}
              <p className="mt-2 text-[12px] text-neutral-600 dark:text-neutral-400 sm:hidden">
                Swipe horizontally to see all columns.
              </p>
            </div>
          </div>

          {/* Inline note */}
<div className="px-4 pb-4 sm:px-6 sm:pb-6">
  <div className="mt-2 flex flex-wrap items-center gap-2">
    <div
      className="
        inline-flex items-center gap-2 rounded-lg
        bg-neutral-100 dark:bg-neutral-800
        px-3 py-1.5 text-[12px] ring-1 ring-neutral-200 dark:ring-neutral-700
        text-neutral-800 dark:text-neutral-200
      "
    >
      <FileText className="h-3.5 w-3.5" />
      <span>We’ll share a personalized cost sheet after your pre-screen.</span>
    </div>

    <div
      className="
        inline-flex items-center gap-2 rounded-lg
        bg-neutral-100 dark:bg-neutral-800
        px-3 py-1.5 text-[12px] ring-1 ring-neutral-200 dark:ring-neutral-700
        text-neutral-700 dark:text-neutral-300
      "
    >
      {/* use any icon you already have; Info is nice if available */}
      <Info className="h-3.5 w-3.5" />
      <span>Estimates only — final costs may vary by case & government updates.</span>
    </div>
  </div>
</div>
        </div>
      ) : null}

      {/* ===== Proof of funds ===== */}
      {hasProof ? (
        <div
          className="
            rounded-2xl p-4 sm:p-6
            bg-white dark:bg-neutral-900
            ring-1 ring-neutral-200 dark:ring-neutral-800
          "
          role="group"
          aria-label="Proof of funds guidance"
        >
          <div className="flex items-center gap-2">
            <Wallet
              className="h-4 w-4 text-blue-700 dark:text-blue-300"
              aria-hidden
            />
            <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Proof of funds
            </h4>
          </div>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="list">
            {proofOfFunds.map((p, i) => (
              <li
                key={`${p.label || "pf"}-${i}`}
                className="
                  rounded-xl p-3
                  bg-white dark:bg-neutral-900
                  ring-1 ring-neutral-200 dark:ring-neutral-800
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {p.label || "Applicant"}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {fmt(p.amount, p.currency)}
                  </span>
                </div>
                {p.notes ? (
                  <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {p.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {proofTotals.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {proofTotals.map(({ currency, total }) => (
                <span
                  key={`req-${currency}`}
                  className="
                    inline-flex items-center gap-1 rounded-full
                    bg-white text-blue-900 ring-1 ring-blue-200
                    dark:bg-neutral-900 dark:text-blue-200 dark:ring-blue-900/50
                    px-3 py-1 text-xs font-medium
                  "
                >
                  Required ({currency}):{" "}
                  <span className="tabular-nums">{fmt(total, currency)}</span>
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-3 text-[12px] text-neutral-600 dark:text-neutral-400">
            Figures are indicative and may change with family size, project
            selection and program updates.
          </p>
        </div>
      ) : null}

      {/* JSON-LD script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateJsonLd) }}
      />
    </section>
  );
}

/* ---------- helpers ---------- */
function stageLabel(
  k: "reservation" | "application" | "approval" | "issuance" | "other",
) {
  switch (k) {
    case "reservation":
      return "Reservation / Deposit";
    case "application":
      return "At Application";
    case "approval":
      return "At Approval";
    case "issuance":
      return "Issuance / Passport";
    default:
      return "Other";
  }
}

/* ---------- Background graphics: white-first with ultra-light grid ---------- */
function BackgroundGraphics() {
  return (
    <>
      {/* neutral soft glows (very faint) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-neutral-300/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-neutral-400/10 blur-3xl"
      />
      {/* ultra-faint grid so text remains crisp on white */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="prices-grid-white"
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
          fill="url(#prices-grid-white)"
          className="text-neutral-900 dark:text-blue-300"
        />
      </svg>
      {/* top gloss for legibility on small screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent dark:from-neutral-950/20"
      />
    </>
  );
}
