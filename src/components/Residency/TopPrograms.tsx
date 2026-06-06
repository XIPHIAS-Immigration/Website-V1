// src/components/TopPrograms.tsx
import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Banknote, Timer } from "lucide-react";
import { formatTimelineShort } from "@/lib/timeline";

import type { ProgramMeta as ResidencyProgram } from "@/lib/residency-content";
import type { ProgramMeta as CitizenshipProgram } from "@/lib/citizenship-content";
import type { ProgramMeta as SkilledProgram } from "@/lib/skilled-content";
import type { ProgramMeta as CorporateProgram } from "@/lib/corporate-content";

type AnyProgram =
  | ResidencyProgram
  | CitizenshipProgram
  | SkilledProgram
  | CorporateProgram;

/* ---------------- helpers ---------------- */

function baseFromCategory(cat?: AnyProgram["category"]) {
  switch (cat) {
    case "citizenship":
      return "/citizenship";
    case "skilled":
      return "/skilled";
    case "corporate":
      return "/corporate";
    case "residency":
    default:
      return "/residency";
  }
}

function safeHref(p: AnyProgram) {
  const base = baseFromCategory((p as any).category);
  const c = (p as any).countrySlug || "";
  const prog = (p as any).programSlug || "";
  return prog ? `${base}/${c}/${prog}` : `${base}/${c}`;
}

function normalizeImageSrc(src?: string, fallback = "/xiphias-immigration.png") {
  const val = (src && src.trim()) || fallback;
  if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
  return `/${val.replace(/^\/+/, "")}`;
}

function money(amount: number, currency?: string) {
  const c = (currency || "").toUpperCase();
  if (!c) return amount.toLocaleString();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${c}`;
  }
}
function months(m?: number, label?: string) {
  return formatTimelineShort(m, label, "Timeline varies");
}

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function programId(p: Partial<AnyProgram>): string {
  const cat = (p as any)?.category ?? "residency";
  const c = (p as any)?.countrySlug ?? "";
  const prog =
    (p as any)?.programSlug ??
    (p as any)?.slug ??
    ((p as any)?.title ? slugify(String((p as any).title)) : "");
  return `${cat}|${c}|${prog}`;
}

/* ---------------- component ---------------- */

export default function TopPrograms({ programs }: { programs: AnyProgram[] }) {
  if (!programs?.length) return null;

  // De-dupe with explicit typing
  const seen = new Set<string>();
  const list: AnyProgram[] = (programs || []).filter((p: AnyProgram) => {
    const id = programId(p);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // SEO: ItemList JSON-LD
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.map((p: AnyProgram, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: safeHref(p),
      name: (p as any).title,
      description: [
        (p as any).country,
        typeof (p as any).minInvestment === "number"
          ? money((p as any).minInvestment, (p as any).currency)
          : null,
        months((p as any).timelineMonths, (p as any).timelineLabel),
      ]
        .filter(Boolean)
        .join(" · "),
    })),
  };

  return (
    <section aria-labelledby="top-programs-heading" className="mt-4">
      <h2 id="top-programs-heading" className="sr-only">
        Top programs
      </h2>

      <ul className="flex flex-col gap-3">
        {list.map((p: AnyProgram, idx: number) => {
          const rawImg =
            ("image" in (p as any) && (p as any).image) ||
            ("heroImage" in (p as any) && (p as any).heroImage) ||
            undefined;

          const imgSrc = normalizeImageSrc(
            rawImg as string | undefined,
            `/images/countries/${(p as any).countrySlug}-hero-poster.jpg`,
          );

          const href = safeHref(p);
          const id = programId(p);
          const titleId = `tp-aside-title-${id || idx}`;

          const hasInvestment = typeof (p as any).minInvestment === "number";
          const investment = hasInvestment
            ? money(
                (p as any).minInvestment as number,
                (p as any).currency as string | undefined,
              )
            : "Varies";
          const timeline = months(
            (p as any).timelineMonths,
            (p as any).timelineLabel,
          );

          // 👇 explicit typing here fixes TS7006
          const chips: string[] = Array.isArray((p as any).tags)
            ? (p as any).tags.map((t: unknown) => String(t)).slice(0, 3)
            : [];

          return (
            <li key={`${id}|${idx}`}>
              <Link
                href={href}
                aria-labelledby={titleId}
                className={[
                  "group relative block w-full rounded-2xl p-2.5 sm:p-3",
                  "bg-white/90 dark:bg-neutral-900/70 backdrop-blur",
                  "ring-1 ring-neutral-200/80 dark:ring-neutral-800/70",
                  "shadow-sm hover:shadow-md transition-shadow duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
                ].join(" ")}
              >
                <article
                  itemScope
                  itemType="https://schema.org/Offer"
                  className="flex items-stretch gap-3"
                >
                  {/* Media (fixed size to keep rows aligned) */}
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:h-24 sm:w-32">
                    {rawImg ? (
                      <Image
                        src={imgSrc}
                        alt={`${(p as any).title} — ${(p as any).country}`}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-[11px] text-neutral-500 dark:text-neutral-400">
                        No image
                      </div>
                    )}
                    <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3
                      id={titleId}
                      className="text-[14px] sm:text-[15px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100 line-clamp-2"
                    >
                      {(p as any).title}
                    </h3>

                    {/* Metric pills */}
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[11px] sm:text-[12px]">
                      <div
                        className="flex items-center gap-1.5 rounded-lg bg-black/5 px-2 py-1 ring-1 ring-neutral-200 dark:bg-white/10 dark:ring-neutral-700"
                        title={`Minimum investment: ${investment}`}
                      >
                        <Banknote
                          className="h-3.5 w-3.5 opacity-70 text-black dark:text-white"
                          aria-hidden
                        />
                        <span className="font-medium tabular-nums truncate text-black dark:text-white">
                          {investment}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 rounded-lg bg-black/5 px-2 py-1 ring-1 ring-neutral-200 dark:bg-white/10 dark:ring-neutral-700"
                        title={`Typical timeline: ${timeline}`}
                      >
                        <Timer
                          className="h-3.5 w-3.5 opacity-70 text-black dark:text-white"
                          aria-hidden
                        />
                        <span className="font-medium tabular-nums truncate text-black dark:text-white">
                          {timeline}
                        </span>
                      </div>
                    </div>

                    {/* Tags row (optional) */}
                    {chips.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {chips.map((t: string, i: number) => (
                          <span
                            key={`${id}-tag-${i}-${t}`}
                            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] ring-1 ring-neutral-200 dark:ring-neutral-700 bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 max-w-[9rem] truncate"
                            title={t}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <span className="mt-1.5 inline-flex items-center text-[12px] font-medium text-sky-700 dark:text-sky-300">
                      View details
                      <span
                        aria-hidden
                        className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>

                    {/* Per-card Offer microdata */}
                    {hasInvestment ? (
                      <div
                        className="hidden"
                        itemProp="offers"
                        itemScope
                        itemType="https://schema.org/Offer"
                      >
                        <meta
                          itemProp="price"
                          content={String((p as any).minInvestment)}
                        />
                        {(p as any).currency ? (
                          <meta
                            itemProp="priceCurrency"
                            content={String((p as any).currency).toUpperCase()}
                          />
                        ) : null}
                        <link
                          itemProp="availability"
                          href="https://schema.org/InStock"
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* SEO: ItemList JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />
    </section>
  );
}
