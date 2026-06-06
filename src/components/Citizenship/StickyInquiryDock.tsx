// src/components/Shared/StickyInquiryDock.tsx
"use client";

import React from "react";
import Link from "next/link";

type Props = {
  bookingUrl?: string;
  brochureUrl?: string;
  text?: string;
  className?: string;
  /** Hide the dock for this many days after dismissal (persisted in localStorage). */
  hideForDays?: number;
  /** Optional id so you can deep-link or test */
  id?: string;
};

const STORAGE_KEY = "stickyInquiryDock:hiddenUntil";

export default function StickyInquiryDock({
  bookingUrl = "/personal-booking",
  brochureUrl = "/images/residency/xiphias-corporate-mobility.pdf",
  text = "Questions about eligibility or timelines?",
  className = "",
  hideForDays = 7,
  id = "inquiry-dock",
}: Props) {
  // Start hidden to avoid flash, then decide in effect.
  const [hidden, setHidden] = React.useState(true);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const until = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const now = Date.now();
      if (!until || now > until) {
        setHidden(false);
      }
    } catch {
      // ignore storage errors (private mode etc)
      setHidden(false);
    } finally {
      setReady(true);
    }
  }, []);

  const dismiss = React.useCallback(() => {
    try {
      const ms = Math.max(0, Math.round(hideForDays)) * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, String(Date.now() + ms));
    } catch {
      /* noop */
    }
    setHidden(true);
  }, [hideForDays]);

  if (!ready || hidden) return null;

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  return (
    <div
      id={id}
      aria-label="Inquiry actions"
      role="region"
      className={[
        "fixed inset-x-0 bottom-0 z-50 px-3 sm:px-4",
        // safe-area padding on iOS
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "pointer-events-none",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto max-w-4xl pointer-events-auto",
          // container
          "rounded-2xl p-3 sm:p-4",
          "bg-white/95 dark:bg-neutral-900/90 backdrop-blur",
          "ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-lg",
          // slide up
          "translate-y-2 opacity-0 animate-[dockIn_250ms_ease-out_forwards]",
          "motion-reduce:animate-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
        ].join(" ")}
      >
        {/* subtle grid + glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.06]">
            <defs>
              <pattern
                id="dock-grid"
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
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#dock-grid)"
              className="text-neutral-700 dark:text-neutral-300"
            />
          </svg>
        </div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Message */}
          <p className="text-sm sm:text-[15px] text-neutral-900 dark:text-neutral-100">
            {text}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <SmartLink
              href={bookingUrl}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2",
                "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-400/70",
                "shadow-sm",
              ].join(" ")}
              ariaLabel="Book a call"
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full bg-white/90"
                aria-hidden
              />
              Book a call
            </SmartLink>

            <a
              href={brochureUrl}
              download
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2",
                "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50",
                "dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-800 dark:hover:bg-neutral-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70",
              ].join(" ")}
              aria-label="Download program guide PDF"
              rel={isExternal(brochureUrl) ? "noopener" : undefined}
            >
              <svg
                viewBox="0 0 20 20"
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M10 4v8m0 0l-3-3m3 3l3-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 14v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
              </svg>
              Download guide
            </a>

            <button
              type="button"
              onClick={dismiss}
              className="ml-0 sm:ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
              aria-label={`Hide this bar for ${hideForDays} day${hideForDays === 1 ? "" : "s"}`}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round" />
              </svg>
              Hide
            </button>
          </div>
        </div>

        {/* SEO: tiny JSON-LD for actions */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(toJsonLd(bookingUrl, brochureUrl)),
          }}
        />
      </div>

      {/* keyframes (scoped) */}
      <style jsx>{`
        @keyframes dockIn {
          from {
            transform: translateY(0.5rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function SmartLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function toJsonLd(bookingUrl: string, brochureUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    potentialAction: [
      {
        "@type": "ContactAction",
        name: "Book a call",
        target: bookingUrl,
      },
      {
        "@type": "DownloadAction",
        name: "Download guide",
        target: brochureUrl,
      },
    ],
  };
}
