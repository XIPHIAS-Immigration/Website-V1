// src/app/(site)/blog/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllInsights } from "@/lib/insights-content";
import nextDynamic from "next/dynamic";

const InsightsList = nextDynamic(() => import("@/components/Insights/InsightsList"));

// SEO metadata for the blog listing page
export const metadata: Metadata = {
  title: "Blog – Immigration Stories & Updates | XIPHIAS Immigration",
  description:
    "Read our latest blog posts on immigration stories, expert tips and program updates. Stay informed with XIPHIAS Immigration.",
  alternates: { canonical: "/blog" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog – Immigration Stories & Updates",
    description:
      "Read our latest blog posts on immigration stories, expert tips and program updates. Stay informed with XIPHIAS Immigration.",
    url: "/blog",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Blog – Immigration Stories & Updates – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog – Immigration Stories & Updates",
    description:
      "Read our latest blog posts on immigration stories, expert tips and program updates. Stay informed with XIPHIAS Immigration.",
    images: ["/xiphias-immigration.png"],
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

export default async function BlogListPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const requestedPage = Math.max(1, Number(first(sp.page) ?? "1"));
  const pageSize = 12;

  const { items, total } = await getAllInsights({
    kind: "blog",
    page: requestedPage,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  const makePageHref = (p: number) => (p > 1 ? `/blog?page=${p}` : `/blog`);

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
    if (page > firstPage + window + 1) arr.push("...");

    for (let i = Math.max(firstPage + 1, page - window); i <= Math.min(last - 1, page + window); i++) {
      if (i !== firstPage && i !== last) arr.push(i);
    }

    if (page < last - window - 1) arr.push("...");
    arr.push(last);
    return arr;
  })();

  return (
    <main className="container mx-auto w-full lg:max-w-screen-xl md:max-w-screen-md px-4 pt-6 sm:pt-8 pb-28 sm:pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6 text-black dark:text-white">
        Blog
      </h1>

      <div
        className="text-sm text-black dark:text-white opacity-70 mb-3 sm:mb-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {total > 0 ? (
          <>
            Showing {startIdx}–{endIdx} of {total} posts
          </>
        ) : (
          <>No posts found</>
        )}
      </div>

      <InsightsList items={items} />

      {totalPages > 1 && (
        <nav
          className="mt-6 sm:mt-8 hidden sm:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          role="navigation"
          aria-label="Pagination"
        >
          <div className="flex items-center gap-2">
            <Link href={makePageHref(1)} aria-disabled={page === 1} className={`${baseBtn} ${page === 1 ? disabledBtn : ""}`}>
              First
            </Link>
            <Link href={makePageHref(Math.max(1, page - 1))} aria-disabled={page === 1} className={`${baseBtn} ${page === 1 ? disabledBtn : ""}`}>
              Previous
            </Link>
          </div>

          <ul className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1" aria-label="Page list">
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <li key={`ellipsis-${idx}`} aria-hidden="true" className="px-2 text-black dark:text-white opacity-60 select-none">
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
            <Link href={makePageHref(totalPages)} aria-disabled={page === totalPages} className={`${baseBtn} ${page === totalPages ? disabledBtn : ""}`}>
              Last
            </Link>
          </div>
        </nav>
      )}

      {totalPages > 1 && (
        <>
          <div className="sm:hidden mt-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-1">
                {Array.from(
                  new Set([1, page - 2, page - 1, page, page + 1, page + 2, totalPages].filter((n) => n >= 1 && n <= totalPages))
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

          <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 dark:bg-black/90 backdrop-blur border-t border-black/10 dark:border-white/10">
            <div className="mx-auto max-w-screen-xl px-4 py-2">
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
              <div className="mt-2 text-center text-xs text-black dark:text-white opacity-70">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
