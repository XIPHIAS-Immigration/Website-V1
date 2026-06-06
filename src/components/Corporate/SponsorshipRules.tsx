// components/Corporate/SponsorshipRules.tsx
"use client";

import * as React from "react";

type Threshold = {
  /** e.g., "Skilled worker", "Manager", "Executive" */
  level: string;
  amount?: number;
  currency?: string; // AED, SGD, etc.
  note?: string;
};

type SponsorshipRulesProps = {
  title?: string;
  thresholds?: Threshold[];
  notes?: string[];
  className?: string;
};

export default function SponsorshipRules({
  title = "Sponsorship & salary rules",
  thresholds = [],
  notes = [],
  className,
}: SponsorshipRulesProps) {
  const hasTable = thresholds.length > 0;

  return (
    <section
      className={`rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/40 p-5 ${className || ""}`}
      aria-labelledby="sponsorship-rules-title"
    >
      <header className="mb-4">
        <h2 id="sponsorship-rules-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm opacity-70">
          Salary/role guidance used by authorities when issuing employment
          visas/sponsorship.
        </p>
      </header>

      {hasTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-3 font-semibold">Level</th>
                <th className="py-2 pr-3 font-semibold">Minimum salary</th>
                <th className="py-2 pr-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t) => {
                const amount =
                  typeof t.amount === "number"
                    ? `${t.currency ?? ""} ${t.amount.toLocaleString()}`
                    : "Varies";
                return (
                  <tr
                    key={t.level}
                    className="border-b border-neutral-100 dark:border-neutral-800/60"
                  >
                    <td className="py-2 pr-3">{t.level}</td>
                    <td className="py-2 pr-3">{amount}</td>
                    <td className="py-2 pr-3">{t.note ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!!notes.length && (
        <ul className="mt-4 list-disc pl-5 space-y-1 text-sm leading-6">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
