"use client";

import * as React from "react";
import { Landmark } from "lucide-react";

export type GovernmentFee = {
  label: string;
  amount?: number;
  currency?: string;
  notes?: string;
};

export default function GovernmentFees({
  fees,
  defaultCurrency = "USD",
  title = "Government fees",
  id = "gov-fees",
}: {
  fees: GovernmentFee[];
  defaultCurrency?: string;
  title?: string;
  id?: string;
}) {
  const hasFees = Array.isArray(fees) && fees.length > 0;
  if (!hasFees) return null;

  const fmt = (amt?: number, cur?: string) => {
    if (typeof amt !== "number" || Number.isNaN(amt)) return "—";
    const c = (cur || defaultCurrency).toUpperCase();
    const hasDecimals = Math.abs(amt % 1) > 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: c,
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: hasDecimals ? 2 : 0,
      }).format(amt);
    } catch {
      return hasDecimals
        ? `${amt.toFixed(2)} ${c}`
        : `${amt.toLocaleString()} ${c}`;
    }
  };

  // Per-currency totals (simple chips)
  const totals = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of fees) {
      if (typeof row.amount !== "number" || Number.isNaN(row.amount)) continue;
      const c = (row.currency || defaultCurrency).toUpperCase();
      map.set(c, (map.get(c) || 0) + row.amount);
    }
    return [...map.entries()].map(([currency, total]) => ({ currency, total }));
  }, [fees, defaultCurrency]);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28"
      itemScope
      itemType="https://schema.org/OfferCatalog"
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          Official
        </span>
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          {title}
        </h2>
      </header>

      {/* Totals (optional chips) */}
      {totals.length ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {totals.map(({ currency, total }) => (
            <span
              key={currency}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200 ring-1 ring-indigo-200/70 dark:ring-indigo-800/60 px-2.5 py-0.5 text-[12px] font-medium"
            >
              Total ({currency}):{" "}
              <span className="tabular-nums">{fmt(total, currency)}</span>
            </span>
          ))}
        </div>
      ) : null}

      {/* ===== MOBILE (cards, no scroll, no toggle) ===== */}
      <ul
        className="
          sm:hidden grid gap-3
        "
        role="list"
        aria-label="Government fees (mobile view)"
      >
        {fees.map((row, i) => (
          <li
            key={`${row.label}-${i}`}
            className="
              rounded-xl p-3
              bg-white/90 dark:bg-neutral-900/50
              ring-1 ring-slate-200/70 dark:ring-neutral-800/70
              shadow-sm
            "
            itemScope
            itemType="https://schema.org/Offer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className="text-sm font-medium break-words"
                  title={row.label}
                >
                  <span itemProp="name">{row.label}</span>
                </div>
                {row.notes ? (
                  <p className="mt-1 text-[12.5px] leading-6 text-slate-700 dark:text-slate-300 break-words">
                    {row.notes}
                  </p>
                ) : (
                  <p className="mt-1 text-[12.5px] leading-6 opacity-60">—</p>
                )}
              </div>
              <div className="ml-2 shrink-0 text-[15px] font-semibold tabular-nums whitespace-nowrap">
                {typeof row.amount === "number" ? (
                  <>
                    <span itemProp="price">
                      {fmt(row.amount, row.currency)}
                    </span>
                    <meta
                      itemProp="priceCurrency"
                      content={(row.currency || defaultCurrency).toUpperCase()}
                    />
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ===== DESKTOP/TABLET (simple table, notes wrap) ===== */}
      <div
        className="
          hidden sm:block overflow-hidden rounded-2xl
          bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900/60 dark:to-neutral-900/20
          ring-1 ring-slate-200/70 dark:ring-neutral-800/70 shadow-sm
        "
        role="group"
        aria-label="Government fee breakdown"
      >
        <div className="px-4 pt-4 sm:px-6 sm:pt-6 flex items-center gap-2">
          <Landmark className="h-4 w-4 opacity-80" aria-hidden />
          <p className="text-sm font-medium">
            Official fees (payable to the government)
          </p>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="bg-slate-50/60 dark:bg-neutral-900/40">
              <tr className="text-left text-[12px] uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <th className="py-2.5 pr-4 font-semibold">Item</th>
                <th className="py-2.5 pr-4 font-semibold">Amount</th>
                <th className="py-2.5 pr-0 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((row, i) => (
                <tr
                  key={`${row.label}-${i}`}
                  className="border-t border-slate-200/70 dark:border-neutral-800/70"
                  itemScope
                  itemType="https://schema.org/Offer"
                >
                  <td
                    className="py-3 pr-4 font-medium align-top break-words"
                    title={row.label}
                  >
                    <span itemProp="name">{row.label}</span>
                  </td>
                  <td className="py-3 pr-4 align-top tabular-nums whitespace-nowrap">
                    {typeof row.amount === "number" ? (
                      <>
                        <span itemProp="price">
                          {fmt(row.amount, row.currency)}
                        </span>
                        <meta
                          itemProp="priceCurrency"
                          content={(
                            row.currency || defaultCurrency
                          ).toUpperCase()}
                        />
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-0 align-top">
                    <p className="text-[13px] leading-6 text-slate-700 dark:text-slate-300 break-words">
                      {row.notes || "—"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 text-[12px] opacity-70">
            Government fees are set by the issuing authority and may change
            without notice. We’ll confirm current rates during onboarding.
          </p>
        </div>
      </div>
    </section>
  );
}
