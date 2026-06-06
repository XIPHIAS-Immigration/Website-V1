// src/components/Shared/RiskCompliance.tsx
import React from "react";

type Props = {
  /** Short, plain-text risk statements. Rendered as a readable list. */
  riskNotes?: string[];
  /** Plain-text compliance reminders / regulatory notes. */
  complianceNotes?: string[];
  className?: string;
  title?: string; // default: "Risk & compliance"
};

/**
 * RiskCompliance — professional, readable callouts
 * ------------------------------------------------
 * • Server-component friendly (no hooks)
 * • Neutral white surface; amber accent for Risk, blue accent for Compliance
 * • Accessible: semantic regions, headings, lists, focus styles
 * • Responsive: single column → two columns; print-friendly
 * • SEO: JSON-LD ItemLists for risk/compliance notes
 * • No external icon libs (inline SVGs only)
 */
export default function RiskCompliance({
  riskNotes = [],
  complianceNotes = [],
  className = "",
  title = "Risk & compliance",
}: Props) {
  if (!riskNotes.length && !complianceNotes.length) return null;

  const sectionId = "risk-compliance";

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
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
          <span className="font-medium">Disclosure</span>
        </div>
        <h2
          id={`${sectionId}-title`}
          className="mt-2 text-lg md:text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          Please read carefully. These notes are informational and do not
          constitute legal or financial advice.
        </p>
      </header>

      {/* Columns */}
      <div className="relative grid gap-4 md:grid-cols-2">
        {/* Risk */}
        {riskNotes.length ? (
          <article
            aria-labelledby={`${sectionId}-risk`}
            role="note"
            className="rounded-xl p-4 ring-1 ring-amber-200/70 dark:ring-amber-900/50 bg-amber-50/70 dark:bg-amber-900/20"
          >
            <div className="flex items-center justify-between gap-2">
              <h3
                id={`${sectionId}-risk`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200"
              >
                <AlertIcon className="h-4 w-4" />
                Risk notes
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-medium text-amber-900 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-800/60">
                {riskNotes.length} item{riskNotes.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-2 space-y-2" role="list">
              {riskNotes.map((n, i) => (
                <li
                  key={`${n}-${i}`}
                  className="flex items-start gap-2 text-[15px] leading-7"
                >
                  <span
                    aria-hidden
                    className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-600 ring-2 ring-amber-200/70 dark:bg-amber-400 dark:ring-amber-800/60"
                  />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {/* Compliance */}
        {complianceNotes.length ? (
          <article
            aria-labelledby={`${sectionId}-compliance`}
            role="note"
            className="rounded-xl p-4 ring-1 ring-blue-200/70 dark:ring-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20"
          >
            <div className="flex items-center justify-between gap-2">
              <h3
                id={`${sectionId}-compliance`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100"
              >
                <ShieldIcon className="h-4 w-4" />
                Compliance
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-medium text-blue-900 ring-1 ring-blue-200/70 dark:bg-blue-950/30 dark:text-blue-100 dark:ring-blue-900/60">
                {complianceNotes.length} item
                {complianceNotes.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-2 space-y-2" role="list">
              {complianceNotes.map((n, i) => (
                <li
                  key={`${n}-${i}`}
                  className="flex items-start gap-2 text-[15px] leading-7"
                >
                  <span
                    aria-hidden
                    className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 ring-2 ring-blue-200/70 dark:bg-blue-400 dark:ring-blue-900/60"
                  />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>

      {/* Fine print */}
      <footer className="relative mt-4">
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
          Program rules change periodically. Always consult the official source
          and independent counsel.
        </p>
      </footer>

      {/* SEO: JSON-LD (two ItemLists under hasPart) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toJsonLd(riskNotes, complianceNotes)),
        }}
      />
    </section>
  );
}

/* ---------------- Background (light grid + neutral glows) ---------------- */
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
            id="rc-grid"
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
        <rect width="100%" height="100%" fill="url(#rc-grid)" />
      </svg>
    </div>
  );
}

/* ---------------- Icons (inline, no deps) ---------------- */

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M10 3l8 14H2L10 3z" />
      <path d="M10 8v4M10 15h.01" strokeLinecap="round" />
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

/* ---------------- SEO JSON-LD ---------------- */

function toJsonLd(risk: string[], compliance: string[]) {
  const makeList = (name: string, arr: string[]) => ({
    "@type": "ItemList",
    name,
    itemListElement: arr.map((text, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "CreativeWork", name: text },
    })),
  });

  const parts = [];
  if (risk.length) parts.push(makeList("Risk notes", risk));
  if (compliance.length) parts.push(makeList("Compliance notes", compliance));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    name: "Risk & compliance",
    hasPart: parts,
  } as const;
}
