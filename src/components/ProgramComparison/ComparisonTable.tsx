"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";

export type CompareColumn = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  onRemove?: () => void;
};

export type CompareRow = {
  key: string;
  label: string;
  hint?: string;
  /** One cell per column, in column order. */
  cells: ReactNode[];
  /** Visually emphasise this row (e.g. the headline cost row). */
  emphasize?: boolean;
};

/**
 * Reusable, dark-suite comparison grid. Presentational only — callers supply
 * columns + aligned cells. Sticky metric column, horizontal scroll on mobile.
 * Built for Program Comparison (Tool 2); presentational + data-agnostic so any
 * tool can reuse it.
 */
export function ComparisonTable({ columns, rows }: { columns: CompareColumn[]; rows: CompareRow[] }) {
  const cols = columns.length;
  const template = `minmax(140px,170px) repeat(${cols}, minmax(190px,1fr))`;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/12 bg-white/[0.03]">
      <div role="table" className="min-w-[620px]" style={{ display: "grid", gridTemplateColumns: template }}>
        {/* Header row */}
        <div role="columnheader" className="sticky left-0 z-10 border-b border-white/20 bg-primary p-4" />
        {columns.map((c) => (
          <div key={c.id} role="columnheader" className="border-b border-l border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="type-card-title truncate text-white">{c.title}</p>
                {c.subtitle ? <p className="type-caption mt-0.5 truncate font-normal text-white/50">{c.subtitle}</p> : null}
              </div>
              {c.onRemove ? (
                <button
                  type="button"
                  onClick={c.onRemove}
                  aria-label={`Remove ${c.title}`}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            {c.href ? (
              <Link
                href={c.href}
                className="type-caption mt-2 inline-flex items-center gap-1 text-secondary hover:text-white"
              >
                Programme page <ArrowUpRight className="size-3.5" />
              </Link>
            ) : null}
          </div>
        ))}

        {/* Metric rows */}
        {rows.map((row) => (
          <Fragment key={row.key}>
            <div
              role="rowheader"
              className={`sticky left-0 z-10 border-b border-white/15 bg-primary p-4 ${row.emphasize ? "bg-black/15" : ""}`}
            >
              <p className="type-small font-bold text-white">{row.label}</p>
              {row.hint ? <p className="type-caption mt-0.5 font-normal text-white/50">{row.hint}</p> : null}
            </div>
            {row.cells.map((cell, i) => (
              <div
                key={`${row.key}-${columns[i]?.id ?? i}`}
                role="cell"
                className={`type-small border-b border-l border-white/8 p-4 text-white/85 ${row.emphasize ? "bg-white/[0.04]" : ""}`}
              >
                {cell}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
