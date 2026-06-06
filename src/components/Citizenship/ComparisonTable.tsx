// src/components/Common/ComparisonTable.tsx
import * as React from "react";

/** A single column (besides the left "Dimension" column). */
type Column = {
  key: string;
  label: string;
  accent?: "blue" | "emerald" | "amber" | "purple";
};

/** A single row of comparison. Provide a `label` and values keyed by Column.key */
type Row = { label: string } & Record<string, React.ReactNode>;

type Props = {
  caption: string;
  columns: Column[]; // e.g. [{ key: "realEstate", label: "Approved Real Estate" }, ...]
  rows: Row[]; // e.g. [{ label: "Core requirement", realEstate: "...", entrepreneur: "..." }, ...]
  className?: string;
  footnote?: string; // optional small note under the table
};

export default function ComparisonTable({
  caption,
  columns,
  rows,
  className = "",
  footnote,
}: Props) {
  if (!columns?.length || !rows?.length) return null;

  // Build JSON-LD ItemList (dimensions)
  const jsonLd = React.useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: caption,
      itemListElement: rows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Thing", name: String(r.label) },
      })),
    }),
    [caption, rows],
  );

  const accentRing = (a?: Column["accent"]) =>
    a === "emerald"
      ? "ring-emerald-200 dark:ring-emerald-800"
      : a === "amber"
        ? "ring-amber-200 dark:ring-amber-800"
        : a === "purple"
          ? "ring-purple-200 dark:ring-purple-800"
          : "ring-blue-200 dark:ring-blue-900";

  const accentText = (a?: Column["accent"]) =>
    a === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : a === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : a === "purple"
          ? "text-purple-700 dark:text-purple-300"
          : "text-blue-700 dark:text-blue-300";

  return (
    <section
      className={[
        "relative",
        "rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm",
        "p-4 sm:p-5",
        className,
      ].join(" ")}
      aria-label={caption}
    >
      {/* subtle background grid + glows */}
      <Decor />

      {/* Header chip + caption */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-blue-600/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
          Comparison
        </span>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {caption}
        </h3>
      </div>

      {/* Desktop/Large: table */}
      <div className="relative hidden sm:block">
        {/* edge fades */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent dark:from-neutral-900"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent dark:from-neutral-900"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">{caption}</caption>
            <colgroup>
              <col className="w-[28%]" />
              {columns.map((_, i) => (
                <col key={i} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 text-[12px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                <th className="sticky left-0 z-10 bg-neutral-50 px-3 py-2.5 text-left font-semibold dark:bg-neutral-900/60">
                  Dimension
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-3 py-2.5 text-left font-semibold ${accentText(c.accent)}`}
                  >
                    <span
                      className={`inline-flex items-center gap-2 rounded-md bg-white/80 dark:bg-neutral-900/80 ring-1 ${accentRing(c.accent)} px-2 py-1`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={idx}
                  className={[
                    "border-t border-neutral-200 dark:border-neutral-800",
                    idx % 2
                      ? "bg-white dark:bg-neutral-900"
                      : "bg-neutral-50/60 dark:bg-neutral-900/40",
                  ].join(" ")}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-inherit px-3 py-3 text-left font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    {r.label}
                  </th>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-3 align-top text-neutral-800 dark:text-neutral-200"
                    >
                      {r[c.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {footnote ? (
          <p className="mt-3 text-[12px] text-neutral-600 dark:text-neutral-400">
            {footnote}
          </p>
        ) : null}
      </div>

      {/* Mobile: cards */}
      <div
        className="sm:hidden space-y-3"
        role="list"
        aria-label={`${caption} (mobile view)`}
      >
        {rows.map((r, idx) => (
          <article
            role="listitem"
            key={idx}
            className="rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 p-3"
          >
            <div className="mb-2 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              {r.label}
            </div>
            <dl className="grid grid-cols-1 gap-2">
              {columns.map((c) => (
                <div
                  key={c.key}
                  className="rounded-lg ring-1 p-2 bg-neutral-50 dark:bg-neutral-900/60 text-sm
                  ring-neutral-200 dark:ring-neutral-800"
                >
                  <dt
                    className={`text-[11px] uppercase tracking-wide ${accentText(c.accent)}`}
                  >
                    {c.label}
                  </dt>
                  <dd className="mt-0.5 text-neutral-800 dark:text-neutral-200">
                    {r[c.key] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
        {footnote ? (
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
            {footnote}
          </p>
        ) : null}
      </div>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

/* --- subtle, premium background --- */
function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-16 h-48 w-48 rounded-full bg-neutral-300/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]">
        <defs>
          <pattern
            id="comp-grid"
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
          fill="url(#comp-grid)"
          className="text-blue-800 dark:text-blue-300"
        />
      </svg>
    </div>
  );
}
