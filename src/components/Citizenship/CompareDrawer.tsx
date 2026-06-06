"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { formatTimelineShort } from "@/lib/timeline";

export type CompareItem = {
  title: string;
  country: string;
  href: string;
  minInvestment?: number;
  currency?: string;
  timelineMonths?: number;
  timelineLabel?: string;
  tags?: string[];
  heroImage?: string; // absolute path preferred
};

type Props = {
  items: CompareItem[];
  initialOpen?: boolean;
  className?: string;
  /** Optional drawer title (defaults to 'Compare programs') */
  title?: string;
  /** Optional aria-label for dialog */
  ariaLabel?: string;
};

/* ------------------------------ helpers ------------------------------ */

function toCurrency(amount?: number, currency = "USD") {
  if (typeof amount !== "number") return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function safeThumbSrc(it: CompareItem) {
  const raw = it.heroImage;
  if (raw && raw.startsWith("/")) return raw;
  // final fallback
  return "/xiphias-immigration.png";
}

/* square thumbnail with two-step fallback */
function SquareThumb({ item }: { item: CompareItem }) {
  const [src, setSrc] = React.useState(safeThumbSrc(item));
  const [stage, setStage] = React.useState<0 | 1>(0);
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
        onError={() => {
          if (stage === 0) {
            setSrc("/xiphias-immigration.png");
            setStage(1);
          }
        }}
        priority={false}
      />
    </div>
  );
}

/* focus trap util */
function useFocusTrap(
  enabled: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;
    const focusable = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, details,[tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (n) => !n.hasAttribute("disabled") && !n.getAttribute("aria-hidden"),
      );
    const firstFocus = () => focusable()[0];
    const lastFocus = () => {
      const list = focusable();
      return list[list.length - 1];
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = firstFocus();
      const last = lastFocus();
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keyHandler);
    // autofocus first focusable
    firstFocus()?.focus();
    return () => document.removeEventListener("keydown", keyHandler);
  }, [enabled, containerRef]);
}

/* lock body scroll when drawer open */
function useBodyScrollLock(locked: boolean) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    if (locked) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/* ------------------------------ component ----------------------------- */

export default function CompareDrawer({
  items,
  initialOpen = false,
  className = "",
  title = "Compare programs",
  ariaLabel = "Comparison drawer",
}: Props) {
  const [open, setOpen] = React.useState(initialOpen);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const idBase = React.useId();

  const panelRef = React.useRef<HTMLDivElement | null>(null);

  useBodyScrollLock(open);
  useFocusTrap(open, panelRef);

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
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // JSON-LD: ItemList of Services with Offers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: `${it.title} – ${it.country}`,
        areaServed: "Worldwide",
        ...(it.href ? { url: it.href } : {}),
        offers: it.minInvestment
          ? [
              {
                "@type": "Offer",
                price: it.minInvestment,
                priceCurrency: it.currency || "USD",
                availability: "https://schema.org/InStock",
              },
            ]
          : undefined,
      },
    })),
  };

  /* --------------------------- Trigger button --------------------------- */
  return (
    <>
      {/* SEO: emit data once on page */}
      <Script
        id={`compare-jsonld-${idBase}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "fixed top-2 right-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2",
          "bg-blue-600 text-white shadow-lg ring-1 ring-blue-700/20",
          "hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${idBase}-drawer`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 5.75A.75.75 0 0 1 3.75 5h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75Zm0 6A.75.75 0 0 1 3.75 11h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 11.75Zm.75 5.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" />
        </svg>
        <span className="font-medium">Compare</span>
        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
          {items.length}
        </span>
      </button>

      {/* ------------------------------ Drawer ------------------------------ */}
      {open ? (
        <div
          id={`${idBase}-drawer`}
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div
            ref={panelRef}
            className={[
              "absolute right-0 top-0 h-full w-full max-w-3xl",
              "bg-white dark:bg-zinc-950 shadow-2xl",
              "ring-1 ring-blue-100/80 dark:ring-blue-900/40",
              "flex flex-col",
              reduceMotion ? "" : "transition-transform duration-300 ease-out",
              reduceMotion ? "" : "translate-x-0",
              className,
            ].join(" ")}
          >
            {/* header */}
            <div className="flex items-center gap-3 border-b border-blue-100/80 dark:border-blue-900/40 px-5 py-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white ring-1 ring-blue-700/20">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 5.75A.75.75 0 0 1 3.75 5h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75Zm0 6A.75.75 0 0 1 3.75 11h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 11.75Zm.75 5.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Side-by-side overview of timelines, minimum investment, and
                  tags.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-sm ring-1 ring-blue-200 hover:bg-blue-50 dark:bg-white/5 dark:ring-blue-900/40 dark:hover:bg-blue-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Close
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.36a1 1 0 0 1 1.415 1.413L13.414 10.586l4.362 4.36a1 1 0 0 1-1.415 1.415L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.415l4.36-4.36-4.36-4.362a1 1 0 0 1 0-1.414Z" />
                </svg>
              </button>
            </div>

            {/* content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Mobile cards */}
              <ul className="grid gap-3 md:hidden" aria-label="Programs list">
                {items.map((it, idx) => (
                  <li
                    key={it.href}
                    className="rounded-2xl ring-1 ring-blue-100/80 bg-white p-3 dark:bg-white/5 dark:ring-blue-900/40"
                    itemScope
                    itemType="https://schema.org/Service"
                  >
                    <meta
                      itemProp="name"
                      content={`${it.title} – ${it.country}`}
                    />
                    <div className="flex items-center gap-3">
                      <SquareThumb item={it} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {it.title}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                          {it.country}
                        </div>
                        {!!it.tags?.length && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {it.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="text-[11px] rounded-full bg-white/90 dark:bg-white/5 px-2 py-0.5 ring-1 ring-blue-100/80 dark:ring-blue-900/40"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link
                        href={it.href}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        aria-label={`View ${it.title}`}
                      >
                        View
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z" />
                        </svg>
                      </Link>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-white/90 dark:bg-white/5 px-2 py-1 ring-1 ring-blue-100/80 dark:ring-blue-900/40">
                        <dt className="text-zinc-500">Minimum investment</dt>
                        <dd className="tabular-nums">
                          {typeof it.minInvestment === "number"
                            ? toCurrency(it.minInvestment, it.currency ?? "USD")
                            : "—"}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-white/90 dark:bg-white/5 px-2 py-1 ring-1 ring-blue-100/80 dark:ring-blue-900/40">
                        <dt className="text-zinc-500">Timeline</dt>
                        <dd className="tabular-nums">
                          {formatTimelineShort(
                            it.timelineMonths,
                            it.timelineLabel,
                          )}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>

              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur ring-1 ring-blue-100/80 dark:ring-blue-900/40">
                    <tr className="text-left">
                      <th className="p-2 font-semibold">Program</th>
                      <th className="p-2 text-right font-semibold">
                        Min investment
                      </th>
                      <th className="p-2 text-right font-semibold">Timeline</th>
                      <th className="p-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr
                        key={it.href}
                        className="border-b border-blue-100/80 dark:border-blue-900/40"
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <SquareThumb item={it} />
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {it.title}
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                                {it.country}
                              </div>
                              {!!it.tags?.length && (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {it.tags.slice(0, 4).map((t) => (
                                    <span
                                      key={t}
                                      className="text-[11px] rounded-full bg-white/90 dark:bg-white/5 px-2 py-0.5 ring-1 ring-blue-100/80 dark:ring-blue-900/40"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {typeof it.minInvestment === "number"
                            ? toCurrency(it.minInvestment, it.currency ?? "USD")
                            : "—"}
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {formatTimelineShort(
                            it.timelineMonths,
                            it.timelineLabel,
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <Link
                            href={it.href}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs text-white ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            aria-label={`View ${it.title}`}
                          >
                            View
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3.5 w-3.5"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* footer (optional area for notes) */}
            <div className="border-t border-blue-100/80 dark:border-blue-900/40 px-5 py-3 text-xs text-zinc-600 dark:text-zinc-400">
              Figures are indicative and subject to due diligence outcomes and
              government updates.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
