import React, { type JSX } from "react";

/**
 * FamilyMatrixNeo — readable, professional blue theme
 * - Server-component friendly (no hooks / client-only libs)
 * - White cards on ultra-light grid; blue used only for emphasis
 * - Mobile-first responsive grid, print-friendly
 * - A11y: clear heading, SR summary, focus rings, status legend
 * - SEO: JSON-LD ItemList (per-tile PropertyValue)
 */

export type FamilyMatrixProps = {
  childrenUpTo?: number | null;
  parentsFromAge?: number | null;
  siblings?: boolean;
  spouse?: boolean;
  className?: string;
  title?: string; // default: "Eligible dependents"
  note?: string; // MDX text allowed
  renderJsonLd?: boolean; // default: true
};

export default function FamilyMatrixNeo({
  childrenUpTo,
  parentsFromAge,
  siblings = false,
  spouse = true,
  className = "",
  title = "Eligible dependents",
  note,
  renderJsonLd = true,
}: FamilyMatrixProps) {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 64);

  const sectionId = slug(title) || "eligible-dependents";
  const noteId = note ? `${sectionId}-note` : undefined;

  const tiles: TileData[] = [
    {
      key: "spouse",
      label: "Spouse",
      valueText: spouse ? "Included" : "Not included",
      included: !!spouse,
      icon: SpouseIcon,
    },
    {
      key: "children",
      label: "Children",
      valueText:
        typeof childrenUpTo === "number"
          ? `Up to ${childrenUpTo} years`
          : "Not included",
      included: typeof childrenUpTo === "number",
      chip: typeof childrenUpTo === "number" ? `${childrenUpTo}` : undefined,
      icon: ChildIcon,
    },
    {
      key: "parents",
      label: "Parents",
      valueText:
        typeof parentsFromAge === "number"
          ? `From ${parentsFromAge}+ years`
          : "Not included",
      included: typeof parentsFromAge === "number",
      chip:
        typeof parentsFromAge === "number" ? `${parentsFromAge}+` : undefined,
      icon: ParentIcon,
    },
    {
      key: "siblings",
      label: "Siblings",
      valueText: siblings ? "Included" : "Not included",
      included: !!siblings,
      icon: SiblingIcon,
    },
  ];

  const includedCount = tiles.filter((x) => x.included).length;

  const srSummary = `${includedCount} of ${tiles.length} categories eligible. ${
    typeof childrenUpTo === "number" ? `Children up to ${childrenUpTo}. ` : ""
  }${typeof parentsFromAge === "number" ? `Parents from ${parentsFromAge}+ years. ` : ""}${
    spouse ? "Spouse included. " : "Spouse not included. "
  }${siblings ? "Siblings included." : "Siblings not included."}`;

  return (
    <section
      id={sectionId}
      aria-label={title}
      aria-describedby={noteId}
      className={[
        "relative overflow-hidden",
        "rounded-2xl p-5 md:p-6 lg:p-8",
        "bg-white dark:bg-neutral-900",
        "ring-1 ring-neutral-200 dark:ring-neutral-800",
        "shadow-sm print:shadow-none",
        className,
      ].join(" ")}
    >
      {/* ---- Background: ultra-light grid + neutral glows (keeps text crisp) ---- */}
      <BackgroundGraphics />

      {/* ---- Header ---- */}
      <header className="relative mb-5 md:mb-6">
        <div className="flex items-center gap-2 text-[12px] text-blue-700 dark:text-blue-300">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span className="font-medium">Snapshot</span>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/30">
              <FamilyIcon aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
          </div>

          <p
            className="text-xs sm:text-[13px] font-medium px-2 py-1 rounded-lg self-start
                       bg-blue-50 text-blue-800 ring-1 ring-blue-100
                       dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900/40"
            aria-label="Summary of eligibility"
          >
            {includedCount} of {tiles.length} categories included
          </p>
        </div>

        <p className="sr-only">{srSummary}</p>

        {note ? (
          <p
            id={noteId}
            className="mt-2 text-sm md:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-3xl"
          >
            {note}
          </p>
        ) : null}
      </header>

      {/* ---- Legend ---- */}
      <div className="relative mb-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-800 ring-1 ring-blue-100 px-2 py-0.5 dark:bg-blue-950/30 dark:text-blue-200 dark:ring-blue-900/40">
          <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden />
          Included
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 px-2 py-0.5 dark:bg-neutral-800/60 dark:text-neutral-200 dark:ring-neutral-700">
          <span className="h-2 w-2 rounded-full bg-neutral-500" aria-hidden />
          Not included
        </span>
      </div>

      {/* ---- Grid ---- */}
      <dl className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((tile, i) => (
          <div
            key={`${tile.key}-${i}`}
            className={[
              "group rounded-xl p-4",
              "bg-white dark:bg-neutral-900",
              "ring-1 ring-neutral-200 dark:ring-neutral-800",
              "hover:shadow-md transition-shadow motion-reduce:transition-none",
              "focus-within:ring-2 focus-within:ring-blue-400/70 dark:focus-within:ring-blue-700/60",
            ].join(" ")}
            itemScope
            itemType="https://schema.org/PropertyValue"
          >
            <meta itemProp="name" content={tile.label} />
            <dt className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg
                           bg-blue-50 text-blue-700 ring-1 ring-blue-100
                           dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40"
              >
                <tile.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                {tile.label}
              </span>
            </dt>

            <dd className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-medium text-sm md:text-[15px] text-neutral-900 dark:text-neutral-100 truncate"
                  itemProp="value"
                  title={tile.valueText}
                >
                  {tile.valueText}
                </span>
                {tile.chip ? (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white ring-1 ring-blue-100 text-blue-700 dark:bg-neutral-950/40 dark:ring-blue-900/40 dark:text-blue-200">
                    {tile.chip}
                  </span>
                ) : null}
              </div>

              <span
                className={[
                  "text-[11px] px-2 py-1 rounded-md ring-1 select-none",
                  tile.included
                    ? "bg-blue-50 ring-blue-100 text-blue-800 dark:bg-blue-950/30 dark:ring-blue-900/40 dark:text-blue-200"
                    : "bg-neutral-100 ring-neutral-200 text-neutral-700 dark:bg-neutral-800/60 dark:ring-neutral-700 dark:text-neutral-300",
                ].join(" ")}
                aria-label={
                  tile.included
                    ? `${tile.label} eligible`
                    : `${tile.label} not eligible`
                }
              >
                {tile.included ? "Yes" : "No"}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {/* ---- JSON-LD for SEO ---- */}
      {renderJsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(toJsonLd(title, note, tiles)),
          }}
        />
      ) : null}
    </section>
  );
}

/* ---------------- Internal types & helpers ---------------- */

type TileData = {
  key: "spouse" | "children" | "parents" | "siblings";
  label: string;
  valueText: string;
  included: boolean;
  chip?: string;
  icon: (props: { className?: string }) => JSX.Element;
};

function toJsonLd(title: string, note: string | undefined, tiles: TileData[]) {
  const elements = tiles.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "PropertyValue",
      name: t.label,
      value: t.valueText,
      additionalProperty: {
        "@type": "PropertyValue",
        name: "included",
        value: t.included,
      },
      description: note || undefined,
    },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: elements,
  } as const;
}

/* ---------------- Background graphics (white-first) ---------------- */
function BackgroundGraphics() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 print:hidden"
    >
      {/* soft neutral glows */}
      <div className="absolute -top-24 -left-20 h-56 w-56 rounded-full bg-neutral-300/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-neutral-400/10 blur-3xl" />
      {/* ultra-faint grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fmneo-grid"
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
        <rect width="100%" height="100%" fill="url(#fmneo-grid)" />
      </svg>
      {/* top gloss */}
      <div className="absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent dark:from-neutral-950/20" />
    </div>
  );
}

/* ---------------- Inline icons ---------------- */

function FamilyIcon(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="3" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6" />
      <circle cx="17" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-4-4h-1" />
    </svg>
  );
}
function SpouseIcon(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4h-1" />
      <circle cx="15" cy="7" r="3" />
      <path d="M10 21v-2a4 4 0 0 1 4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
    </svg>
  );
}
function ChildIcon(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
    </svg>
  );
}
function ParentIcon(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
      <circle cx="12" cy="7" r="3" />
      <path d="M4 21v-2a4 4 0 0 1 4-4H6" />
      <circle cx="6" cy="10" r="2" />
    </svg>
  );
}
function SiblingIcon(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6M22 21v-2a4 4 0 0 0-4-4h-6" />
    </svg>
  );
}
