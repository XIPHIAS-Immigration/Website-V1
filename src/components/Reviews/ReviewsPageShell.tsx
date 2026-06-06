import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import TestimonialCarousel, { type Testimonial } from "@/components/Citizenship/TestimonialCarousel";
import type { LegacyReply, LegacyTopLevelReview } from "@/lib/reviews/legacyReviews";
import { Archive, ChevronLeft, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import ReviewCard from "./ReviewCard";

type ReviewThread = {
  review: LegacyTopLevelReview;
  replies: readonly LegacyReply[];
};

type Props = {
  featuredItems: readonly Testimonial[];
  reviewThreads: readonly ReviewThread[];
  currentPage: number;
  totalPages: number;
  totalReviews: number;
};

function getPageHref(page: number) {
  return page > 1 ? `/reviews?page=${page}` : "/reviews";
}

function getPageNumbers(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) pages.push("ellipsis");
  for (let page = windowStart; page <= windowEnd; page++) pages.push(page);
  if (windowEnd < totalPages - 1) pages.push("ellipsis");

  pages.push(totalPages);
  return pages;
}

export default function ReviewsPageShell({
  featuredItems,
  reviewThreads,
  currentPage,
  totalPages,
  totalReviews,
}: Props) {
  const startReview = totalReviews === 0 ? 0 : (currentPage - 1) * 20 + 1;
  const endReview = Math.min(totalReviews, currentPage * 20);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <main className="container mx-auto max-w-screen-2xl px-4 py-6 text-black sm:px-6 lg:px-8 dark:text-white">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8 lg:p-10 dark:border-blue-900/40 dark:from-blue-950/30 dark:via-slate-950 dark:to-indigo-950/20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(65%_65%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
        </div>

        <div className="relative max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:text-slate-100 dark:ring-blue-900/50">
            <Archive className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
            XIPHIAS Immigration reviews
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Client Reviews
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
            Read public client feedback about XIPHIAS Immigration across residency, citizenship, skilled migration, and corporate mobility journeys.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Browse detailed experiences, timelines, and conversations from clients who engaged with XIPHIAS Immigration on different global mobility paths.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/residency"
              className="inline-flex items-center rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-blue-100 transition hover:bg-blue-50 dark:bg-white/5 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-blue-950/20"
            >
              Residency
            </Link>
            <Link
              href="/citizenship"
              className="inline-flex items-center rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-blue-100 transition hover:bg-blue-50 dark:bg-white/5 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-blue-950/20"
            >
              Citizenship
            </Link>
            <Link
              href="/corporate"
              className="inline-flex items-center rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-blue-100 transition hover:bg-blue-50 dark:bg-white/5 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-blue-950/20"
            >
              Corporate
            </Link>
            <Link
              href="/skilled"
              className="inline-flex items-center rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-blue-100 transition hover:bg-blue-50 dark:bg-white/5 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-blue-950/20"
            >
              Skilled
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-3">
        <Breadcrumb />
      </div>

      <section className="mt-10 space-y-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Featured Client Reviews</h2>
            <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A quick way to explore client feedback across different XIPHIAS Immigration journeys.
            </p>
          </div>
        </div>
        <TestimonialCarousel
          items={featuredItems.slice()}
          title="Featured client reviews"
          ariaLabel="Featured client reviews"
        />
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/40">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">More Client Reviews</h2>
              <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Browse public client feedback with replies available where conversations continued.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {startReview}-{endReview} of {totalReviews} reviews
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {reviewThreads.map(({ review, replies }) => (
            <ReviewCard key={review.postId} review={review} replies={replies} />
          ))}
        </div>

        {totalPages > 1 ? (
          <nav
            aria-label="Reviews pagination"
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={getPageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={[
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                  currentPage === 1
                    ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]",
                ].join(" ")}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>

              {pageNumbers.map((pageNumber, index) =>
                pageNumber === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={pageNumber}
                    href={getPageHref(pageNumber)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    className={[
                      "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
                      pageNumber === currentPage
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </Link>
                ),
              )}

              <Link
                href={getPageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={[
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                  currentPage === totalPages
                    ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]",
                ].join(" ")}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
