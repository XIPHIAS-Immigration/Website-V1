import * as React from "react";
import SectionHeader from "./SectionHeader";
import { CheckCircle2 } from "lucide-react";

type Props = {
  items?: string[] | string | unknown; // tolerate non-strings
  className?: string;
  /** Set to true if you prefer 1,2,3… instead of check icons */
  numbered?: boolean;
  /** Max columns for wide screens (1 or 2). Default: 2 */
  columns?: 1 | 2;
};

// --- NEW: stringify any odd YAML objects like { "Points-tested PR": "189..." } ---
function toDisplayString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const [k, val] = Object.entries(v as Record<string, unknown>)[0] ?? [];
    if (k !== undefined)
      return `${k}${val !== undefined ? `: ${String(val)}` : ""}`;
  }
  return v == null ? "" : String(v);
}

export default function EligibilityRequirements({
  items,
  className = "",
  numbered = false,
  columns = 2,
}: Props) {
  if (!items) return null;

  // Normalize to a clean string list (keeps your old API)
  const isList = Array.isArray(items);
  const list: string[] = isList
    ? (items as unknown[]).map(toDisplayString).filter(Boolean)
    : [];

  if (isList && list.length === 0) return null;

  const count = isList ? list.length : undefined;
  const gridCols = columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

  // JSON-LD only for arrays
  const jsonLd = isList
    ? buildItemListLd("Eligibility requirements", list)
    : null;

  const regionProps = isList
    ? { itemScope: true, itemType: "https://schema.org/ItemList" }
    : {};

  return (
    <section
      id="requirements"
      role="region"
      aria-labelledby="eligibility-title"
      aria-describedby="eligibility-desc"
      className={[
        "relative scroll-mt-28",
        "print:bg-white print:shadow-none",
        className,
      ].join(" ")}
      {...regionProps}
    >
      <BackgroundGraphics />

      {/* Hidden heading used by aria-labelledby */}
      <h2 id="eligibility-title" className="sr-only">
        Eligibility — Requirements
      </h2>

      {/* Header */}
      <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            aria-hidden
            className="block h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 via-sky-300/50 to-emerald-400"
          />
          <div className="mt-2">
            <SectionHeader
              eyebrow="Eligibility"
              title="Requirements"
              color="sky"
            />
          </div>
        </div>

        {typeof count === "number" ? (
          <span
            className="
              inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]
              bg-white/85 dark:bg-neutral-900/70
              ring-1 ring-neutral-200 dark:ring-neutral-800
              text-neutral-700 dark:text-neutral-200
            "
            aria-label={`${count} requirement${count === 1 ? "" : "s"}`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
            {count} item{count === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <p id="eligibility-desc" className="sr-only">
        The following list outlines the core eligibility requirements for this
        program.
      </p>

      {/* -------- Rich-text single string variant -------- */}
      {!isList ? (
        <div
          className={[
            "relative z-10 rounded-2xl p-4 sm:p-5",
            "bg-white/90 dark:bg-neutral-950/60 backdrop-blur",
            "ring-1 ring-neutral-200 dark:ring-neutral-800",
            "prose prose-sm dark:prose-invert max-w-none",
          ].join(" ")}
          itemProp="description"
        >
          {toDisplayString(items)}
        </div>
      ) : numbered ? (
        /* -------- Numbered variant -------- */
        <ol
          role="list"
          className={["relative z-10 mt-2 grid gap-y-3 gap-x-6", gridCols].join(
            " ",
          )}
          aria-label="Eligibility requirements (numbered)"
        >
          <meta itemProp="numberOfItems" content={String(count || 0)} />
          {list.map((text, idx) => (
            <li
              key={`${idx}-${text.slice(0, 24)}`}
              className="relative pl-8 print:break-inside-avoid"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(idx + 1)} />
              <span
                aria-hidden
                className="
                  absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full
                  bg-amber-500/15 text-[12px] font-semibold
                  ring-1 ring-amber-500/30 text-neutral-800 dark:text-neutral-200
                "
              >
                {idx + 1}
              </span>
              <p
                className="text-[15px] leading-7 text-neutral-900 dark:text-neutral-100 break-words hyphens-auto"
                itemProp="name"
                title={text}
              >
                {text}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        /* -------- Checklist variant (default) -------- */
        <ul
          role="list"
          className={["relative z-10 mt-2 grid gap-y-3 gap-x-6", gridCols].join(
            " ",
          )}
          aria-label="Eligibility requirements"
        >
          <meta itemProp="numberOfItems" content={String(count || 0)} />
          {list.map((text, idx) => (
            <li
              key={`${idx}-${text.slice(0, 24)}`}
              className="relative print:break-inside-avoid"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(idx + 1)} />
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="
                    mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full
                    bg-emerald-500/15 ring-1 ring-emerald-500/25
                  "
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <p
                  className="text-[15px] leading-7 text-neutral-900 dark:text-neutral-100 break-words hyphens-auto"
                  itemProp="name"
                  title={text}
                >
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* JSON-LD (arrays only) */}
      {jsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </section>
  );
}

/* ---------------- Background: subtle white surface with light grid ---------------- */
function BackgroundGraphics() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 print:hidden"
    >
      {/* soft brand glows */}
      <div className="absolute -top-16 -left-14 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
      {/* faint grid + doc motif */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.08]">
        <defs>
          <pattern
            id="req-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0v24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
          <symbol id="doc" viewBox="0 0 96 96">
            <rect
              x="22"
              y="16"
              width="52"
              height="64"
              rx="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M30 34h36M30 48h36M30 62h24"
              stroke="currentColor"
              strokeWidth="4"
            />
          </symbol>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#req-grid)"
          className="text-sky-900 dark:text-sky-300"
        />
        <g className="text-sky-900 dark:text-sky-300" opacity="0.06">
          <use href="#doc" x="48" y="36" />
          <use href="#doc" x="300" y="120" />
        </g>
      </svg>
      {/* top gloss aiding legibility over grid */}
      <div className="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />
    </div>
  );
}

/* ---------------- SEO helper ---------------- */
function buildItemListLd(name: string, items: string[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((text, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Thing", name: text },
    })),
  } as const;
}
