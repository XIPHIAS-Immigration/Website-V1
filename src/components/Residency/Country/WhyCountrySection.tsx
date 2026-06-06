import * as React from "react";
import SectionHeader from "./SectionHeader";
import { CheckCircle2 } from "lucide-react";

/** You can pass simple strings OR richer objects with detail text */
type Benefit =
  | string
  | {
      title: string;
      detail?: string;
    };

type Props = {
  country: string;
  points?: Benefit[];
  className?: string;
  columns?: 1 | 2; // default 1; set 2 for wider pages (still no boxes)
  dense?: boolean; // tighter spacing
  accent?: "green" | "blue"; // accent hue family
};

export default function WhyCountrySection({
  country,
  points,
  className,
  columns = 1,
  dense = false,
  accent = "green",
}: Props) {
  if (!Array.isArray(points) || points.length === 0) return null;

  const headerId = "why-" + slugify(country);
  const padY = dense ? "py-2.5" : "py-3.5";
  const gap = dense ? "gap-2.5" : "gap-3";
  const txtSize = dense ? "text-[14px] leading-6" : "text-[15px] leading-7";
  const acc = getAccent(accent);

  // Normalized list (filter empties)
  const items = points
    .map(normalize)
    .filter((i) => i.title && i.title.trim().length > 0);

  if (items.length === 0) return null;

  // Build JSON-LD for SEO (ItemList)
  const jsonLd = buildItemListLd(country, items);

  return (
    <section
      id="why"
      aria-labelledby={headerId}
      className={["relative scroll-mt-28", className || ""].join(" ")}
      itemScope
      itemType="https://schema.org/ItemList"
    >
      {/* Decorative, subtle background: primary glows + dotted guideline grid */}
      <DecorativeBackground tone={acc.patternTone} />

      {/* Hidden heading for aria-labelledby (SectionHeader doesn't accept id) */}
      <h2 id={headerId} className="sr-only">
        Why {country}
      </h2>

      {/* Section header (clean, official tone) */}
      <div className="relative z-10">
        {/* Slim brand accent line */}
        <span
          aria-hidden
          className={["block h-1 w-16 rounded-full", acc.topline].join(" ")}
        />
        <div className="mt-2">
          <SectionHeader
            eyebrow="Key Points"
            title={`Why ${country}?`}
            color={accent === "blue" ? "sky" : "green"}
          />
        </div>
      </div>

      {/* Lists */}
      {columns === 1 ? (
        <ul
          role="list"
          aria-label={`Top key points of ${country}`}
          className={[
            "relative z-10 mt-4 divide-y",
            "divide-neutral-200 dark:divide-neutral-800",
          ].join(" ")}
          itemProp="itemListElement"
        >
          {items.map((it, idx) => (
            <li
              key={idx}
              className={padY}
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(idx + 1)} />
              <div className={["flex items-start", gap].join(" ")}>
                <BulletIcon accent={acc} />
                <div className="min-w-0">
                  <h3
                    className={[
                      "font-medium text-neutral-900 dark:text-neutral-100",
                      txtSize,
                    ].join(" ")}
                    title={it.title}
                    itemProp="name"
                  >
                    {it.title}
                  </h3>
                  {it.detail ? (
                    <p
                      className="mt-1 text-[13px] leading-6 text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap hyphens-auto"
                      itemProp="description"
                    >
                      {it.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul
          role="list"
          aria-label={`Top key points of ${country}`}
          className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2"
          itemProp="itemListElement"
        >
          {items.map((it, idx) => (
            <li
              key={idx}
              className="relative"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(idx + 1)} />
              <div className={["flex items-start", gap].join(" ")}>
                {/* left accent tick (not a box) */}
                <span
                  aria-hidden
                  className={[
                    "absolute left-0 top-[0.5rem] h-[1.1rem] w-[2px] rounded",
                    acc.leftBar,
                  ].join(" ")}
                />
                <div className="pl-3">
                  <div className="flex items-start gap-2.5">
                    <BulletIcon accent={acc} />
                    <div className="min-w-0">
                      <h3
                        className={[
                          "font-medium text-neutral-900 dark:text-neutral-100",
                          txtSize,
                        ].join(" ")}
                        title={it.title}
                        itemProp="name"
                      >
                        {it.title}
                      </h3>
                      {it.detail ? (
                        <p
                          className="mt-1 text-[13px] leading-6 text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap hyphens-auto"
                          itemProp="description"
                        >
                          {it.detail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* JSON-LD (SEO). Safe to inline on SSR. */}
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

/* ---------- Decorative background (subtle, professional) ---------- */

function DecorativeBackground({ tone }: { tone: "blue" | "green" }) {
  const glowA = tone === "blue" ? "bg-sky-400/15" : "bg-emerald-400/15";
  const glowB = tone === "blue" ? "bg-blue-500/15" : "bg-green-600/15";
  const gridColor =
    tone === "blue"
      ? "text-sky-700 dark:text-sky-300"
      : "text-emerald-700 dark:text-emerald-300";

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-20 -left-16 h-48 w-48 rounded-full ${glowA} blur-3xl`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full ${glowB} blur-3xl`}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.08]"
      >
        <defs>
          <pattern
            id="why-grid"
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
          {/* minimal checkmark motif, very faint */}
          <symbol id="why-check" viewBox="0 0 24 24">
            <path
              d="M4 12l5 5L20 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </symbol>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#why-grid)"
          className={gridColor}
        />
        <g className={gridColor} opacity="0.06">
          <use href="#why-check" x="48" y="36" />
          <use href="#why-check" x="280" y="100" />
          <use href="#why-check" x="520" y="40" />
        </g>
      </svg>
      {/* top gloss for legibility on mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10"
      />
    </>
  );
}

/* ---------- pieces ---------- */

function BulletIcon({ accent }: { accent: ReturnType<typeof getAccent> }) {
  return (
    <span
      aria-hidden
      className={[
        "mt-[2px] grid h-7 w-7 shrink-0 place-items-center rounded-full",
        accent.iconBg,
        accent.iconRing,
      ].join(" ")}
    >
      <CheckCircle2 className={`h-4 w-4 ${accent.icon}`} />
    </span>
  );
}

/* ---------- helpers ---------- */

function normalize(p: Benefit): { title: string; detail?: string } {
  if (typeof p === "string") return { title: p };
  return { title: p.title, detail: p.detail };
}

function getAccent(a: "green" | "blue") {
  if (a === "blue") {
    return {
      topline: "bg-gradient-to-r from-sky-500 via-sky-300/40 to-sky-500",
      iconBg: "bg-sky-100/60 dark:bg-sky-900/30",
      iconRing: "ring-1 ring-sky-300/50 dark:ring-sky-800/60",
      icon: "text-sky-600 dark:text-sky-400",
      leftBar: "bg-sky-400/50 dark:bg-sky-600/50",
      patternTone: "blue" as const,
    };
  }
  return {
    topline:
      "bg-gradient-to-r from-emerald-500 via-emerald-300/40 to-emerald-500",
    iconBg: "bg-emerald-100/60 dark:bg-emerald-900/30",
    iconRing: "ring-1 ring-emerald-300/50 dark:ring-emerald-800/60",
    icon: "text-emerald-600 dark:text-emerald-400",
    leftBar: "bg-emerald-400/50 dark:bg-emerald-600/50",
    patternTone: "green" as const,
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Build schema.org ItemList JSON-LD for SEO */
function buildItemListLd(
  country: string,
  items: Array<{ title: string; detail?: string }>,
) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Why ${country}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Thing",
        name: it.title,
        ...(it.detail ? { description: it.detail } : {}),
      },
    })),
  };
}
