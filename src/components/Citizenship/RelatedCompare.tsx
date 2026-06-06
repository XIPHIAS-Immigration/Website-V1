// src/components/Citizenship/RelatedCompare.tsx
import Link from "next/link";
import React from "react";
import { formatTimelineLong, formatTimelineShort } from "@/lib/timeline";

export type RelatedItem = {
  url: string; // ideally internal like "/citizenship/malta"
  title: string;
  country: string;
  minInvestment?: number;
  currency?: string;
  timelineMonths?: number;
  timelineLabel?: string;
  tags?: string[];
  heroImage?: string;
};

type Props = { items: RelatedItem[]; className?: string; title?: string };

// ✅ Change this only if your canonical domain changes later
const SITE_URL = "https://www.xiphiasimmigration.com";
const SERVICE_TYPE = "Citizenship by Investment";

/**
 * RelatedCompare — professional, readable cards for similar programs
 * - Server-component friendly (no state/effect)
 * - SEO: Service microdata + ItemList JSON-LD (NO Product)
 */
export default function RelatedCompare({
  items,
  className = "",
  title = "Programs similar to this",
}: Props) {
  if (!items?.length) return null;

  const sectionId = "related-programs";

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className={["relative", className].join(" ")}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-600/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            Related
          </span>
          <h2
            id={`${sectionId}-title`}
            className="text-xl font-semibold tracking-tight"
          >
            {title}
          </h2>
        </div>
        <p className="sr-only">
          {items.length} similar programs listed. Use arrow keys to navigate
          cards.
        </p>
      </header>

      <ul role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, idx) => {
          const price = isNum(r.minInvestment)
            ? fmtCurrency(r.minInvestment!, r.currency)
            : "No minimum";
          const time = formatTimelineShort(r.timelineMonths, r.timelineLabel);

          // ✅ Make sure Link always receives an internal path
          const href = toInternalPath(r.url);
          const absoluteUrl = ensureAbsoluteUrl(href);

          const hero = ensureAbsoluteImage(r.heroImage);

          return (
            <li key={`${r.url}-${idx}`} className="group">
              <Link
                href={href}
                aria-label={`${r.title} — ${r.country}. Minimum ${price}. Timeline ${time}.`}
                className={[
                  "block overflow-hidden rounded-2xl",
                  "bg-white dark:bg-neutral-900",
                  "ring-1 ring-neutral-200/90 dark:ring-neutral-800/90",
                  "shadow-sm hover:shadow-lg transition hover:-translate-y-0.5 motion-reduce:transform-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70",
                ].join(" ")}
              >
                {/* ✅ Microdata: Service (NO Product) */}
                <article itemScope itemType="https://schema.org/Service">
                  {/* Hidden schema values - no UI impact */}
                  <link itemProp="url" href={absoluteUrl} />
                  <meta itemProp="name" content={r.title} />
                  <meta itemProp="serviceType" content={SERVICE_TYPE} />

                  {/* areaServed as Country object */}
                  <div
                    itemProp="areaServed"
                    itemScope
                    itemType="https://schema.org/Country"
                    className="hidden"
                  >
                    <meta itemProp="name" content={r.country} />
                  </div>

                  <div
                    itemProp="provider"
                    itemScope
                    itemType="https://schema.org/Organization"
                    className="hidden"
                  >
                    <meta itemProp="name" content="XIPHIAS Immigration" />
                    <link itemProp="url" href={SITE_URL} />
                  </div>

                  {isNum(r.minInvestment) ? (
                    <div
                      className="hidden"
                      itemProp="offers"
                      itemScope
                      itemType="https://schema.org/Offer"
                    >
                      <meta itemProp="price" content={String(r.minInvestment)} />
                      <meta
                        itemProp="priceCurrency"
                        content={(r.currency || "USD").toUpperCase()}
                      />
                      <link
                        itemProp="availability"
                        href="https://schema.org/InStock"
                      />
                    </div>
                  ) : null}

                  {/* Hero */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {hero ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hero}
                        alt={`${r.title} — ${r.country}`}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.src = "/xiphias-immigration.png";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 grid place-items-center">
                        <span className="text-xs text-neutral-700/80 dark:text-neutral-200/80">
                          {r.country}
                        </span>
                      </div>
                    )}

                    {/* subtle overlays */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900 ring-1 ring-neutral-200 backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100 dark:ring-neutral-700">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-600"
                        aria-hidden
                      />
                      {r.country}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100 line-clamp-2">
                          {r.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                          {r.country}
                        </p>
                      </div>

                      {!!r.tags?.length && (
                        <div className="hidden md:flex flex-wrap gap-1 max-w-[220px] justify-end">
                          {r.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]
                                         bg-white text-neutral-900 ring-1 ring-neutral-200
                                         dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-blue-600"
                                aria-hidden
                              />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                      <div className="rounded-xl p-2 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
                        <div className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          {price}
                        </div>
                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                          Minimum investment
                        </div>
                      </div>
                      <div className="rounded-xl p-2 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {time}
                        </div>
                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                          Timeline
                        </div>
                      </div>
                    </div>

                    {/* Mobile tags */}
                    {!!r.tags?.length && (
                      <div className="mt-3 md:hidden flex flex-wrap gap-1.5">
                        {r.tags.slice(0, 4).map((t) => (
                          <span
                            key={`m-${t}`}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]
                                       bg-white text-neutral-900 ring-1 ring-neutral-200
                                       dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-blue-600"
                              aria-hidden
                            />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ✅ SEO: JSON-LD ItemList (Service items, NOT Product) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toItemListJsonLd(items)),
        }}
      />
    </section>
  );
}

/* ---------------- helpers ---------------- */

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function fmtCurrency(amount: number, currency?: string) {
  const cur = (currency || "USD").toUpperCase();
  const locale = "en-IN";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${cur}`;
  }
}

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

function ensureAbsoluteImage(src?: string) {
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
  return `/${src.replace(/^\.?\/*/, "")}`;
}

function toInternalPath(url: string) {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const u = new URL(url);
      return u.pathname || "/";
    }
  } catch {
    // ignore parsing errors and fallback below
  }
  return url.startsWith("/") ? url : `/${url}`;
}

function ensureAbsoluteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function toItemListJsonLd(items: RelatedItem[]) {
  const itemListElement = items.map((r, i) => {
    const href = toInternalPath(r.url);
    const item: any = {
      "@type": "Service",
      name: r.title,
      url: ensureAbsoluteUrl(href),
      serviceType: SERVICE_TYPE,
      areaServed: { "@type": "Country", name: r.country },
      provider: {
        "@type": "Organization",
        name: "XIPHIAS Immigration",
        url: SITE_URL,
      },
    };

    if (isNum(r.minInvestment)) {
      item.offers = {
        "@type": "Offer",
        price: r.minInvestment,
        priceCurrency: (r.currency || "USD").toUpperCase(),
        availability: "https://schema.org/InStock",
      };
    }

    if (isNum(r.timelineMonths)) {
      item.additionalProperty = [
        {
          "@type": "PropertyValue",
          name: "Typical timeline",
          value: formatTimelineLong(r.timelineMonths, r.timelineLabel),
        },
      ];
    }

    return { "@type": "ListItem", position: i + 1, item };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Related programs",
    itemListElement,
  } as const;
}
