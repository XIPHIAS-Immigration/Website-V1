// src/app/(site)/articles/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllInsights } from "@/lib/insights-content";
import nextDynamic from "next/dynamic";

const InsightsList = nextDynamic(() => import("@/components/Insights/InsightsList"));

const SITE_URL = "https://www.xiphiasimmigration.com";
const OG_IMAGE = "/xiphias-immigration.png";

// SEO metadata for the articles listing page
export const metadata: Metadata = {
  title: "Articles – Immigration Insights & Updates | XIPHIAS Immigration",
  description:
    "Stay informed with the latest articles on investment migration, residency and citizenship programs. Browse our expert insights and updates.",
  alternates: { canonical: "/articles" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Articles – Immigration Insights & Updates",
    description:
      "Stay informed with the latest articles on investment migration, residency and citizenship programs. Browse our expert insights and updates.",
    url: `${SITE_URL}/articles`,
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}${OG_IMAGE}`,
        width: 1200,
        height: 630,
        alt: "Articles – Immigration Insights & Updates – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles – Immigration Insights & Updates",
    description:
      "Stay informed with the latest articles on investment migration, residency and citizenship programs. Browse our expert insights and updates.",
    images: [`${SITE_URL}${OG_IMAGE}`],
  },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Compatible typing: supports either plain object or Promise (varies by Next versions/tooling)
type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default async function ArticlesListPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const page = Math.max(1, Number(first(sp.page) ?? "1"));
  const pageSize = 12;

  // getAllInsights must support page + pageSize and return total
  const { items, total } = await getAllInsights({
    kind: "articles",
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(total, safePage * pageSize);

  const makePageHref = (p: number) => (p > 1 ? `/articles?page=${p}` : `/articles`);

  const baseBtn =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-base sm:text-sm " +
    "border text-black dark:text-white border-black/20 dark:border-white/20 " +
    "hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/50 transition";
  const disabledBtn = "pointer-events-none opacity-40";

  const pagePill =
    "min-w-10 h-10 sm:min-w-9 sm:h-9 px-3 rounded-md inline-flex items-center justify-center " +
    "text-base sm:text-sm border border-black/20 dark:border-white/20 " +
    "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition";
  const pagePillActive =
    "min-w-10 h-10 sm:min-w-9 sm:h-9 px-3 rounded-md inline-flex items-center justify-center " +
    "text-base sm:text-sm bg-black text-white dark:bg-white dark:text-black " +
    "border border-black dark:border-white";

  // Build compact list with ellipses (desktop/tablet)
  const pageNumbers = (() => {
    const arr: (number | "...")[] = [];
    const firstPage = 1;
    const last = totalPages;
    const window = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }

    arr.push(firstPage);
    if (safePage > firstPage + window + 1) arr.push("...");

    for (
      let i = Math.max(firstPage + 1, safePage - window);
      i <= Math.min(last - 1, safePage + window);
      i++
    ) {
      if (i !== firstPage && i !== last) arr.push(i);
    }

    if (safePage < last - window - 1) arr.push("...");
    arr.push(last);
    return arr;
  })();

  return (
    <main className="container mx-auto w-full lg:max-w-screen-xl md:max-w-screen-md px-4 pt-6 sm:pt-8 pb-28 sm:pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6 text-black dark:text-white">
        Articles
      </h1>

      {/* Meta */}
      <div
        className="text-sm text-black dark:text-white opacity-70 mb-3 sm:mb-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {total > 0 ? (
          <>
            Showing {startIdx}–{endIdx} of {total} articles
          </>
        ) : (
          <>No articles found</>
        )}
      </div>

      <InsightsList items={items} />

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
              aria-disabled={safePage === 1}
              className={`${baseBtn} ${safePage === 1 ? disabledBtn : ""}`}
            >
              First
            </Link>
            <Link
              href={makePageHref(Math.max(1, safePage - 1))}
              aria-disabled={safePage === 1}
              className={`${baseBtn} ${safePage === 1 ? disabledBtn : ""}`}
            >
              Previous
            </Link>
          </div>

          <ul className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1" aria-label="Page list">
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <li
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="px-2 text-black dark:text-white opacity-60 select-none"
                >
                  …
                </li>
              ) : (
                <li key={p} className="shrink-0">
                  {p === safePage ? (
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
              href={makePageHref(Math.min(totalPages, safePage + 1))}
              aria-disabled={safePage === totalPages}
              className={`${baseBtn} ${safePage === totalPages ? disabledBtn : ""}`}
            >
              Next
            </Link>
            <Link
              href={makePageHref(totalPages)}
              aria-disabled={safePage === totalPages}
              className={`${baseBtn} ${safePage === totalPages ? disabledBtn : ""}`}
            >
              Last
            </Link>
          </div>
        </nav>
      )}

      {/* Mobile sticky Prev/Next */}
      {totalPages > 1 && (
        <>
          {/* Compact number strip (mobile) */}
          <div className="sm:hidden mt-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1">
                {Array.from(
                  new Set(
                    [1, safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2, totalPages].filter(
                      (n) => n >= 1 && n <= totalPages
                    )
                  )
                ).map((n) =>
                  n === safePage ? (
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

          <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 dark:bg-black/90 backdrop-blur border-t border-black/10 dark:border-white/10">
            <div className="mx-auto max-w-screen-xl px-4 py-2">
              <div className="flex gap-3">
                <Link
                  href={makePageHref(Math.max(1, safePage - 1))}
                  aria-disabled={safePage === 1}
                  className={`flex-1 ${baseBtn} h-12 text-base ${safePage === 1 ? disabledBtn : ""}`}
                >
                  ← Previous
                </Link>
                <Link
                  href={makePageHref(Math.min(totalPages, safePage + 1))}
                  aria-disabled={safePage === totalPages}
                  className={`flex-1 ${baseBtn} h-12 text-base ${safePage === totalPages ? disabledBtn : ""}`}
                >
                  Next →
                </Link>
              </div>
              <div className="mt-2 text-center text-xs text-black dark:text-white opacity-70">
                Page {safePage} of {totalPages}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
