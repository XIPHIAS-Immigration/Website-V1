// src/components/Skilled/PointsGridTable.tsx
import React from "react";
import { Target, Info } from "lucide-react";
import type { ProgramMeta } from "@/lib/skilled-content";

export default function PointsGridTable({
  grid,
  threshold,
  className = "",
}: {
  grid?: ProgramMeta["pointsGrid"];
  threshold?: number;
  className?: string;
}) {
  if (!grid?.length) return null;

  // Normalize + totals
  const rows = grid.map((r) => ({
    category: r.category,
    max: typeof r.max === "number" && isFinite(r.max) ? r.max : undefined,
    notes: r.notes,
  }));
  const totalMax = rows.reduce((acc, r) => acc + (r.max ?? 0), 0);
  const thresholdPct =
    typeof threshold === "number" && totalMax > 0
      ? Math.max(0, Math.min(100, (threshold / totalMax) * 100))
      : undefined;

  return (
    <section
      aria-label="Points breakdown"
      className={[
        "rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 overflow-hidden shadow-sm bg-white/70 dark:bg-neutral-900/40",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-neutral-50/80 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Points breakdown</h3>
          <span
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300"
            title="Guide only. Cut-offs vary by occupation and round."
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
            Guide
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeof totalMax === "number" && totalMax > 0 ? (
            <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800/80 ring-1 ring-neutral-200/70 dark:ring-neutral-700 px-2.5 py-1 text-xs">
              Max possible: <span className="ml-1 font-medium tabular-nums">{totalMax}</span> pts
            </span>
          ) : null}

          {typeof threshold === "number" ? (
            <span className="inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 px-2.5 py-1 text-xs">
              <Target className="mr-1 h-3.5 w-3.5" aria-hidden />
              Pass mark: <span className="ml-1 font-semibold tabular-nums">{threshold}</span> pts
            </span>
          ) : null}
        </div>
      </div>

      {/* Overall progress with threshold marker (if we know total) */}
      {totalMax > 0 ? (
        <div className="px-4 sm:px-5 pt-3">
          <div className="relative h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-400/60 to-emerald-400/60"
              style={{ width: "100%" }}
              aria-hidden
            />
            {typeof thresholdPct === "number" ? (
              <div
                className="absolute top-0 h-full w-0.5 bg-emerald-600/80 dark:bg-emerald-400/80"
                style={{ left: `${thresholdPct}%` }}
                aria-label="Pass mark relative to maximum"
                title={`Pass mark ≈ ${Math.round(thresholdPct)}% of maximum`}
              />
            ) : null}
          </div>
          <div className="mt-1 mb-2 text-[11px] text-neutral-600/80 dark:text-neutral-300/80">
            Pass mark line shows how the minimum sits against the theoretical maximum.
          </div>
        </div>
      ) : null}

      {/* Table (desktop) */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs opacity-70">
            <tr>
              <th className="px-4 sm:px-5 py-2.5">Category</th>
              <th className="px-4 sm:px-5 py-2.5 w-36 text-right">Max</th>
              <th className="px-4 sm:px-5 py-2.5">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pct =
                totalMax > 0 && typeof r.max === "number"
                  ? Math.max(0, Math.min(100, (r.max / totalMax) * 100))
                  : 0;
              return (
                <tr key={`${r.category}-${i}`} className="odd:bg-white/60 dark:odd:bg-neutral-900/30">
                  <td className="px-4 sm:px-5 py-3 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="hidden h-2 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800 md:block">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                      <span>{r.category}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-right tabular-nums">
                    {typeof r.max === "number" ? r.max : "—"}
                  </td>
                  <td className="px-4 sm:px-5 py-3 opacity-85">{r.notes ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
        {rows.map((r, i) => {
          const pct =
            totalMax > 0 && typeof r.max === "number"
              ? Math.max(0, Math.min(100, (r.max / totalMax) * 100))
              : 0;
        return (
          <div key={`${r.category}-${i}`} className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{r.category}</div>
              <div className="text-sm tabular-nums">{typeof r.max === "number" ? `${r.max} pts` : "—"}</div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
            {r.notes ? (
              <p className="mt-2 text-xs opacity-80 leading-5">{r.notes}</p>
            ) : null}
          </div>
        );})}
      </div>
    </section>
  );
}
