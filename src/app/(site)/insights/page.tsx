// src/app/(site)/insights/page.tsx
import Link from "next/link";
import { Suspense } from "react";
// Dynamically import the insights list and filters bar to reduce initial bundle size and improve performance.
import nextDynamic from "next/dynamic";
const InsightsList = nextDynamic(() => import("@/components/Insights/InsightsList"));
const FiltersBar = nextDynamic(() => import("@/components/Insights/FiltersBar"));

import type { Metadata } from "next";

// SEO metadata for the insights listing page
export const metadata: Metadata = {
  title: "Insights – Articles, News, Media & Blog Updates | XIPHIAS Immigration",
  description:
    "Explore our latest insights: articles, news, media, and blog updates covering residency, citizenship and investment migration programs",
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Insights – Articles, News, Media & Blog Updates",
    description:
      "Explore our latest insights: articles, news, media, and blog updates covering residency, citizenship and investment migration programs",
    url: "https://www.xiphiasimmigration.com/insights",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Insights – Articles, News, Media & Blog Updates – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights – Articles, News, Media & Blog Updates",
    description:
      "Explore our latest insights: articles, news, media, and blog updates covering residency, citizenship and investment migration programs.",
    images: ["/xiphias-immigration.png"],
  },
};
import { getAllInsights, getInsightsFacets } from "@/lib/insights-content";
import type { InsightKind } from "@/types/insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// In Next 15, dynamic APIs like searchParams are Promises
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default async function InsightsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const q = (first(sp.q) ?? "") as string;
  const kind = first(sp.kind) as InsightKind | undefined;
  const country = first(sp.country);
  const program = first(sp.program);
  const tag = first(sp.tag);
  const pageParam = first(sp.page) ?? "1";
  const parsedPage = Number.parseInt(pageParam, 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 12;

  const [{ items, total }, facets] = await Promise.all([
    getAllInsights({ q, kind, country, program, tag, page, pageSize }),
    getInsightsFacets(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  const makePageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kind) params.set("kind", kind);
    if (country) params.set("country", country);
    if (program) params.set("program", program);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/insights${qs ? `?${qs}` : ""}`;
  };

  // Compact page number list with ellipses
  const pageNumbers = (() => {
    const pages: (number | "...")[] = [];
    const add = (n: number | "...") => pages.push(n);

    const pad = 1;
    const firstPage = 1;
    const lastPage = totalPages;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return pages;
    }

    add(firstPage);
    if (page > firstPage + pad + 1) add("...");
    for (
      let i = Math.max(firstPage + 1, page - pad);
      i <= Math.min(lastPage - 1, page + pad);
      i++
    ) {
      if (i !== firstPage && i !== lastPage) add(i);
    }
    if (page < lastPage - pad - 1) add("...");
    add(lastPage);
    return pages;
  })();

  // Shared styles (only black/white with opacity)
  const baseBtn =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-base sm:text-sm " +
    "border text-black dark:text-white border-black/20 dark:border-white/20 " +
    "hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/50 " +
    "transition";
  const disabledBtn = "pointer-events-none opacity-40";

  const pagePill =
    "min-w-10 h-10 sm:min-w-9 sm:h-9 px-3 rounded-md inline-flex items-center justify-center " +
    "text-base sm:text-sm border border-black/20 dark:border-white/20 " +
    "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition";
  const pagePillActive =
    "min-w-10 h-10 sm:min-w-9 sm:h-9 px-3 rounded-md inline-flex items-center justify-center " +
    "text-base sm:text-sm bg-black text-white dark:bg-white dark:text-black " +
    "border border-black dark:border-white";

  return (
    <div className="container mx-auto lg:max-w-screen-2xl px-4 pb-24 sm:pb-12 pt-6 sm:pt-8">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Insights
          </h1>
          <p className="mt-1 sm:mt-2 text-black/70 dark:text-white/70 text-sm sm:text-base">
            Articles, news, media and blog updates from XIPHIAS Immigration.
          </p>
        </div>

        {/* Mobile filters */}
        <div className="sm:hidden mt-2">
          <details className="group rounded-lg border border-black/15 dark:border-white/20">
            <summary className="list-none cursor-pointer px-4 py-3 rounded-lg flex items-center justify-between text-black dark:text-white">
              <span className="text-base font-medium">Filters</span>
              <span
                className="ml-3 inline-flex items-center justify-center rounded-md border border-black/20 dark:border-white/20
                           w-8 h-8 group-open:rotate-180 transition"
                aria-hidden="true"
              >
                ▲
              </span>
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-black/10 dark:border-white/10">
              {/*
                `FiltersBar` uses `useSearchParams()`.
                Wrap it in Suspense so prerendering doesn't error.
              */}
              <Suspense
                fallback={
                  <div className="h-14 rounded-xl bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10 animate-pulse" />
                }
              >
                <FiltersBar
                  initialQuery={q}
                  initialKind={kind}
                  initialCountry={country}
                  initialProgram={program}
                  initialTag={tag}
                  facets={facets}
                />
              </Suspense>
            </div>
          </details>
        </div>

        {/* Desktop filters */}
        <div className="hidden sm:block sm:w-full sm:max-w-xl">
          {/*
            `FiltersBar` uses `useSearchParams()`.
            Wrap it in Suspense so prerendering doesn't error.
          */}
          <Suspense
            fallback={
              <div className="h-14 rounded-xl bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10 animate-pulse" />
            }
          >
            <FiltersBar
              initialQuery={q}
              initialKind={kind}
              initialCountry={country}
              initialProgram={program}
              initialTag={tag}
              facets={facets}
            />
          </Suspense>
        </div>
      </header>

      {/* Results meta */}
      <div
        className="mt-4 sm:mt-6 text-sm text-black/70 dark:text-white/70"
        aria-live="polite"
        aria-atomic="true"
      >
        {total > 0 ? (
          <>Showing {startIdx}–{endIdx} of {total} results</>
        ) : (
          <>No results found</>
        )}
      </div>

      {/* List */}
      <section className="mt-3 sm:mt-4">
        <InsightsList items={items} />
      </section>

      {/* Desktop/Tablet Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-6 sm:mt-8 hidden sm:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          role="navigation"
          aria-label="Pagination"
        >
          <div className="flex items-center gap-2">
            <Link
              href={makePageHref(1)}
              aria-disabled={page === 1}
              className={`${baseBtn} ${page === 1 ? disabledBtn : ""}`}
            >
              First
            </Link>
            <Link
              href={makePageHref(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={`${baseBtn} ${page === 1 ? disabledBtn : ""}`}
            >
              Previous
            </Link>
          </div>

          <ul
            className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1"
            aria-label="Page list"
          >
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <li
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="px-2 text-black/60 dark:text-white/60 select-none"
                >
                  …
                </li>
              ) : (
                <li key={p} className="shrink-0">
                  {p === page ? (
                    <span aria-current="page" className={pagePillActive}>
                      {p}
                    </span>
                  ) : (
                    <Link href={makePageHref(p)} className={pagePill}>
                      {p}
                    </Link>
                  )}
                </li>
              )
            )}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href={makePageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className={`${baseBtn} ${page === totalPages ? disabledBtn : ""}`}
            >
              Next
            </Link>
            <Link
              href={makePageHref(totalPages)}
              aria-disabled={page === totalPages}
              className={`${baseBtn} ${page === totalPages ? disabledBtn : ""}`}
            >
              Last
            </Link>
          </div>
        </nav>
      )}

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <>
          <div className="sm:hidden mt-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1">
                {Array.from(
                  new Set(
                    [1, page - 2, page - 1, page, page + 1, page + 2, totalPages]
                      .filter((n) => n >= 1 && n <= totalPages)
                  )
                ).map((n) =>
                  n === page ? (
                    <span key={`m-${n}`} aria-current="page" className={pagePillActive}>
                      {n}
                    </span>
                  ) : (
                    <Link key={`m-${n}`} href={makePageHref(n)} className={pagePill}>
                      {n}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          <div
            className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 dark:bg-black/90 backdrop-blur
                       border-t border-black/10 dark:border-white/10"
          >
            <div className="mx-auto max-w-6xl px-4 py-2">
              <div className="flex gap-3">
                <Link
                  href={makePageHref(Math.max(1, page - 1))}
                  aria-disabled={page === 1}
                  className={`flex-1 ${baseBtn} h-12 text-base ${page === 1 ? disabledBtn : ""}`}
                >
                  ← Previous
                </Link>
                <Link
                  href={makePageHref(Math.min(totalPages, page + 1))}
                  aria-disabled={page === totalPages}
                  className={`flex-1 ${baseBtn} h-12 text-base ${page === totalPages ? disabledBtn : ""}`}
                >
                  Next →
                </Link>
              </div>
              <div className="mt-2 text-center text-xs text-black/70 dark:text-white/70">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
