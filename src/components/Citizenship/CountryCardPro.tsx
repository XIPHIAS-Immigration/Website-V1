// src/components/Citizenship/CountryCardPro.tsx
import Link from "next/link";
import React from "react";
import { formatTimelineShort } from "@/lib/timeline";

type Props = {
  href: string;
  title: string;
  summary?: string;
  heroImage?: string;
  country?: string;
  visaFreeCount?: number;
  passportRank?: number;
  minInvestment?: number;
  currency?: string; // e.g. USD
  timelineMonths?: number; // typical processing
  timelineLabel?: string;
  tags?: string[];
  className?: string;
};

const SITE_URL = "https://www.xiphiasimmigration.com";
const SERVICE_TYPE = "Citizenship by Investment";

/* ---------------- utils ---------------- */

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableIds(href: string, title: string) {
  const base = `ccp-${slugify(href || title || "card")}`;
  return { hId: `${base}-h`, dId: `${base}-d` };
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
    // ignore
  }
  return url.startsWith("/") ? url : `/${url}`;
}

function ensureAbsoluteUrl(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return `${SITE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

// locale pinned to avoid SSR/CSR differences
function fmtCurrency(amount?: number, cur = "USD", locale = "en-IN") {
  if (typeof amount !== "number") return "Varies";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${cur.toUpperCase()}`;
  }
}

/* ---------------- component ---------------- */

export default function CountryCardPro({
  href,
  title,
  summary,
  heroImage,
  country,
  visaFreeCount,
  passportRank,
  minInvestment,
  currency = "USD",
  timelineMonths,
  timelineLabel,
  tags = [],
  className = "",
}: Props) {
  const hrefInternal = toInternalPath(href);           // ✅ for <Link>
  const absoluteHref = ensureAbsoluteUrl(hrefInternal); // ✅ for schema

  const price = fmtCurrency(minInvestment, currency, "en-IN");
  const time = formatTimelineShort(timelineMonths, timelineLabel);

  const normalizedImg = ensureAbsoluteImage(heroImage);
  const { hId, dId } = stableIds(hrefInternal, title);

  return (
    <Link
      href={hrefInternal}
      aria-labelledby={hId}
      aria-describedby={summary ? dId : undefined}
      className={[
        "group block overflow-hidden rounded-2xl",
        "bg-white dark:bg-neutral-900",
        "ring-1 ring-neutral-200/90 dark:ring-neutral-800/90",
        "shadow-sm hover:shadow-lg transition hover:-translate-y-0.5 motion-reduce:transform-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70",
        className,
      ].join(" ")}
    >
      {/* ✅ Microdata is Service (NOT Product) */}
      <article itemScope itemType="https://schema.org/Service">
        {/* Hidden schema values - no UI impact */}
        <link itemProp="url" href={absoluteHref} />
        <meta itemProp="name" content={title} />
        <meta itemProp="serviceType" content={SERVICE_TYPE} />
        {summary ? <meta itemProp="description" content={summary} /> : null}

        {/* areaServed as Country object */}
        {country ? (
          <div
            itemProp="areaServed"
            itemScope
            itemType="https://schema.org/Country"
            className="hidden"
          >
            <meta itemProp="name" content={country} />
          </div>
        ) : null}

        <div
          itemProp="provider"
          itemScope
          itemType="https://schema.org/Organization"
          className="hidden"
        >
          <meta itemProp="name" content="XIPHIAS Immigration" />
          <link itemProp="url" href={SITE_URL} />
        </div>

        {/* Optional pricing only when minInvestment exists */}
        {typeof minInvestment === "number" ? (
          <div
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
            className="hidden"
          >
            <meta itemProp="priceCurrency" content={currency.toUpperCase()} />
            <meta itemProp="price" content={String(minInvestment)} />
            <link itemProp="availability" href="https://schema.org/InStock" />
          </div>
        ) : null}

        {/* ---------- Hero ---------- */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {normalizedImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={normalizedImg}
              alt={`${title}${country ? ` — ${country}` : ""}`}
              decoding="async"
              loading="lazy"
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => {
                e.currentTarget.src = "/xiphias-immigration.png";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 grid place-items-center">
              <span className="text-xs text-neutral-700/80 dark:text-neutral-200/80">
                {country || "Program"}
              </span>
            </div>
          )}

          {/* overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          {country ? (
            <span
              className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900 ring-1 ring-neutral-200 backdrop-blur
                         dark:bg-neutral-900/70 dark:text-neutral-100 dark:ring-neutral-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
              {country}
            </span>
          ) : null}
        </div>

        {/* ---------- Body ---------- */}
        <div className="p-4 sm:p-5">
          <h3
            id={hId}
            className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </h3>

          {summary ? (
            <p
              id={dId}
              className="mt-1 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2"
            >
              {summary}
            </p>
          ) : null}

          {/* Key metrics */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-xl p-2 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {price}
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Min investment
              </div>
            </div>
            <div className="rounded-xl p-2 bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {time}
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Typical timeline
              </div>
            </div>
          </div>

          {passportRank || visaFreeCount ? (
            <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-xl p-2 ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {passportRank ?? "—"}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Passport rank
                </div>
              </div>
              <div className="rounded-xl p-2 ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {visaFreeCount ?? "—"}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Visa-free countries
                </div>
              </div>
            </div>
          ) : null}

          {/* Tags */}
          {!!tags.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]
                             bg-white text-neutral-900 ring-1 ring-neutral-200
                             dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
