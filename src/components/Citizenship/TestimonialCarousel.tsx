"use client";

import React from "react";
import Script from "next/script";

/* ============================ Types ============================ */

export type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  /** Optional embellishments (backwards-compatible) */
  avatarUrl?: string;
  organization?: string;
  url?: string; // source link if public
};

type Props = {
  items: Testimonial[];
  /** Autoplay interval (ms). Defaults to 6s. */
  intervalMs?: number;
  className?: string;
  /** Optional heading for a11y/SEO (visually hidden by default). */
  title?: string;
  /** aria-label for the carousel region */
  ariaLabel?: string;
};

/* ========================= Helpers ========================== */

function getSite(): string {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.xiphiasimmigration.com";

  const base = env.startsWith("http") ? env : `https://${env}`;
  return base.replace(/\/$/, "");
}

function toAbsUrl(site: string, u?: string) {
  if (!u) return undefined;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${site}${u.startsWith("/") ? u : `/${u}`}`;
}

/* ========================= Component ========================== */

export default function TestimonialCarousel({
  items,
  intervalMs = 6000,
  className = "",
  title = "Client testimonials",
  ariaLabel = "Testimonials carousel",
}: Props) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  const length = items?.length ?? 0;
  const safeItems = Array.isArray(items) ? items : [];

  // Early escape
  if (!length) return null;

  const idBase = React.useId();
  const quoteId = `${idBase}-quote-${index}`;

  // Respect prefers-reduced-motion and pause on tab switch
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) {
      const apply = () => setReduceMotion(mq.matches);
      apply();
      mq.addEventListener?.("change", apply);
      return () => mq.removeEventListener?.("change", apply);
    }
  }, []);

  React.useEffect(() => {
    const onVisibility = () => document.hidden && setPaused(true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Autoplay
  React.useEffect(() => {
    if (paused || reduceMotion || length <= 1) return;
    const id = setInterval(
      () => {
        setIndex((v) => (v + 1) % length);
      },
      Math.max(intervalMs, 2000),
    );
    return () => clearInterval(id);
  }, [paused, reduceMotion, intervalMs, length]);

  const goTo = (i: number) => setIndex((i + length) % length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Current item
  const t = safeItems[index];

  const SITE = getSite();
  const ORG_ID = `${SITE}/#organization`;

  // JSON-LD for SEO (ItemList of Review) — FIXED
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Client Testimonials",
    description: "Client feedback about services provided by XIPHIAS Immigration.",
    itemListElement: safeItems.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Review",
        reviewBody: it.quote,
        ...(toAbsUrl(SITE, it.url) ? { url: toAbsUrl(SITE, it.url) } : {}),
        // ✅ Required by Google for Review clarity
        itemReviewed: {
          "@type": "Organization",
          "@id": ORG_ID,
          name: "XIPHIAS Immigration",
          url: SITE,
        },
        author: {
          "@type": "Person",
          name: it.author,
          ...(it.organization
            ? { worksFor: { "@type": "Organization", name: it.organization } }
            : {}),
          ...(it.role ? { jobTitle: it.role } : {}),
        },
      },
    })),
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={[
        "relative overflow-hidden rounded-3xl p-6 md:p-8",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        "text-black dark:text-white",
        className,
      ].join(" ")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* JSON-LD for the whole list (SEO) */}
      <Script
        id={`testimonials-jsonld-${idBase}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* (Visually hidden) heading for accessibility / SEO */}
      <h2 className="sr-only">{title}</h2>

      {/* Decorative background grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start gap-3 md:gap-4">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 shrink-0 text-blue-600/70 dark:text-blue-300/80"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8V11.17A5.17 5.17 0 0 0 4.83 6H2Zm14 0A5.17 5.17 0 0 0 16 11.17V22h8V11.17A5.17 5.17 0 0 0 18.83 6H16Z" />
          </svg>

          <blockquote
            id={quoteId}
            className="text-[15px] leading-7 md:text-base transition-opacity duration-300 ease-out"
            aria-live="polite"
          >
            “{t.quote}”
          </blockquote>
        </div>

        {/* Author row */}
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={t.author} url={t.avatarUrl} />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{t.author}</div>
            {(t.role || t.organization) && (
              <div className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                {[t.role, t.organization].filter(Boolean).join(" • ")}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {length > 1 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Dots */}
            <nav className="flex flex-wrap gap-1.5" aria-label="Select testimonial">
              {safeItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Show testimonial ${idx + 1} of ${length}`}
                  aria-controls={quoteId}
                  aria-current={idx === index}
                  onClick={() => goTo(idx)}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    idx === index
                      ? "w-8 bg-blue-600"
                      : "w-4 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600",
                  ].join(" ")}
                />
              ))}
            </nav>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <CarouselButton onClick={prev} ariaLabel="Previous testimonial" />
              <CarouselButton onClick={next} ariaLabel="Next testimonial" direction="next" />
              <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                {index + 1}/{length}
              </span>
              <span
                className={[
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1",
                  paused
                    ? "text-zinc-700 ring-zinc-300 dark:text-zinc-200 dark:ring-zinc-700"
                    : "text-blue-700 ring-blue-200 dark:text-blue-200 dark:ring-blue-800/60",
                ].join(" ")}
              >
                {paused ? "Paused" : "Auto"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard navigation (left/right/home/end) */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            next();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            prev();
          } else if (e.key === "Home") {
            e.preventDefault();
            goTo(0);
          } else if (e.key === "End") {
            e.preventDefault();
            goTo(length - 1);
          } else if (e.key.toLowerCase() === " " || e.key === "Enter") {
            e.preventDefault();
            setPaused((p) => !p);
          }
        }}
        aria-label="Carousel keyboard focus target"
        className="sr-only"
      />
    </section>
  );
}

/* ========================== Subcomponents ========================== */

function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const altText = name && name.trim().length > 0 ? `${name}'s photo` : "Client photo";

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={altText}
      className="h-8 w-8 rounded-full ring-1 ring-blue-100/80 object-cover bg-zinc-100 dark:bg-zinc-900"
    />
  ) : (
    <div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center ring-1 ring-blue-700/20">
      <span className="text-xs font-semibold">{initials}</span>
    </div>
  );
}

function CarouselButton({
  onClick,
  ariaLabel,
  direction = "prev",
}: {
  onClick: () => void;
  ariaLabel: string;
  direction?: "prev" | "next";
}) {
  const isNext = direction === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-xl",
        "bg-white/90 ring-1 ring-blue-200 text-blue-700 hover:bg-blue-50",
        "dark:bg-white/5 dark:ring-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-950/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        "transition",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        {isNext ? (
          <path d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z" />
        ) : (
          <path d="M19 11.25H7.81l3.72-3.72a.75.75 0 1 0-1.06-1.06L5.22 11.72a.75.75 0 0 0 0 1.06l5.25 5.25a.75.75 0 1 0 1.06-1.06l-3.72-3.72H19a.75.75 0 0 0 0-1.5z" />
        )}
      </svg>
    </button>
  );
}