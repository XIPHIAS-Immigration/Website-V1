import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { EventRecord } from "@/types/events";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { formatDateLong } from "@/lib/date-format";
import { getAllEvents } from "@/lib/events-data";

const SITE_URL = "https://www.xiphiasimmigration.com";
const OG_IMAGE = "/xiphias-immigration.png";
const BASE_TITLE = "Events | XIPHIAS Immigration";
const BASE_DESCRIPTION =
  "Explore XIPHIAS events from 2011 to the present, including summits, workshops, forums, and client engagement milestones.";
const ITEMS_PER_PAGE = 12;

export const revalidate = 86400;

type EventsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const events = getAllEvents();
  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const params = await searchParams;
  const currentPage = normalizePage(params.page, totalPages);

  const isPaged = currentPage > 1;
  const title = isPaged
    ? `Events - Page ${currentPage} | XIPHIAS Immigration`
    : BASE_TITLE;
  const description = isPaged
    ? `Browse XIPHIAS events archive page ${currentPage} of ${totalPages}, including immigration seminars, investor forums, and global mobility sessions.`
    : BASE_DESCRIPTION;

  const canonical = `${SITE_URL}${getEventsPageHref(currentPage)}`;

  return {
    title,
    description,
    keywords: [
      "XIPHIAS events",
      "immigration events",
      "investment migration forums",
      "global mobility conferences",
      "XIPHIAS seminars",
      "migration advisory events",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}${OG_IMAGE}`,
          width: 1200,
          height: 630,
          alt: "XIPHIAS events overview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}${OG_IMAGE}`],
    },
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const events = getAllEvents();
  const newestYear = events[0]?.date.slice(0, 4);
  const oldestYear = events[events.length - 1]?.date.slice(0, 4);

  const params = await searchParams;
  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const currentPage = normalizePage(params.page, totalPages);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const fromEventNo = events.length === 0 ? 0 : startIndex + 1;
  const toEventNo = startIndex + pagedEvents.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "XIPHIAS Events",
    url: `${SITE_URL}${getEventsPageHref(currentPage)}`,
    description: BASE_DESCRIPTION,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: pagedEvents.length,
      itemListElement: pagedEvents.map((event, index) => {
        const thumb = event.photos?.[0]?.src;
        return {
          "@type": "ListItem",
          position: fromEventNo + index,
          url: `${SITE_URL}/events/${event.slug}`,
          item: {
            "@type": "Event",
            name: event.title,
            startDate: event.date,
            description:
              event.summary || event.description.slice(0, 180).trim(),
            image: thumb ? [`${SITE_URL}${thumb}`] : undefined,
            location: event.location
              ? {
                  "@type": "Place",
                  name: event.location,
                }
              : undefined,
            organizer: {
              "@type": "Organization",
              name: "XIPHIAS Immigration",
              url: SITE_URL,
            },
          },
        };
      }),
    },
  };

  return (
    <main className="container mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-16 sm:pt-8">
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-white via-blue-50/70 to-slate-100 p-5 dark:border-white/15 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl" />

        <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          Events Archive
        </p>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black dark:text-white sm:text-4xl lg:text-5xl">
          Events
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-black/70 dark:text-white/70 sm:text-base">
          Explore company events from 2011 to the present. Review forums,
          migration seminars, and strategic sessions with curated photo
          highlights and detailed event records.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-black/80 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
            {events.length} events
          </span>
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-black/80 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
            {oldestYear} to {newestYear}
          </span>
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-black/80 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </header>

      <section aria-label="All events sorted by date">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
            Recent Events
          </h2>
          <span className="text-xs text-black/60 dark:text-white/60 sm:text-sm">
            Showing {fromEventNo}-{toEventNo} of {events.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-8">
          {pagedEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        className="mt-10"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

function EventCard({
  event,
}: {
  event: EventRecord;
}) {
  const href = `/events/${event.slug}`;
  const thumbnail = event.photos?.[0];
  const hasThumbnail = Boolean(
    thumbnail?.src && isLocalPublicAssetAvailable(thumbnail.src),
  );

  return (
    <article>
      <Link
        href={href}
        className="group block h-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg dark:border-white/15 dark:bg-neutral-900"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
          {hasThumbnail && thumbnail ? (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt || `${event.title} thumbnail`}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-black/70 dark:border-white/15 dark:bg-white/10 dark:text-white/70">
                XIPHIAS Event
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateLong(event.date)}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="text-xl font-semibold leading-snug text-black dark:text-white">
            {event.title}
          </h3>

          {event.location ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-black/70 dark:text-white/70">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </p>
          ) : null}

          {event.summary ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-black/75 dark:text-white/75 sm:text-base">
              {event.summary}
            </p>
          ) : null}

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View event details
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  className,
}: {
  currentPage: number;
  totalPages: number;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = buildVisiblePageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Events pagination"
      className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ""}`}
    >
      <Link
        href={getEventsPageHref(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition ${
          currentPage <= 1
            ? "pointer-events-none border-black/10 text-black/35 dark:border-white/15 dark:text-white/35"
            : "border-black/15 text-black/75 hover:border-primary/40 hover:text-primary dark:border-white/20 dark:text-white/75"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Link>

      {pages.map((page, index) => {
        const prevPage = pages[index - 1];
        const showEllipsis = typeof prevPage === "number" && page - prevPage > 1;

        return (
          <span key={`page-slot-${page}`} className="inline-flex items-center gap-2">
            {showEllipsis ? (
              <span className="px-1 text-black/45 dark:text-white/45">...</span>
            ) : null}
            <Link
              href={getEventsPageHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                page === currentPage
                  ? "border-primary bg-primary text-white"
                  : "border-black/15 text-black/75 hover:border-primary/40 hover:text-primary dark:border-white/20 dark:text-white/75"
              }`}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        href={getEventsPageHref(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition ${
          currentPage >= totalPages
            ? "pointer-events-none border-black/10 text-black/35 dark:border-white/15 dark:text-white/35"
            : "border-black/15 text-black/75 hover:border-primary/40 hover:text-primary dark:border-white/20 dark:text-white/75"
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

function normalizePage(pageParam: string | undefined, totalPages: number): number {
  const parsed = Number(pageParam);
  if (!Number.isFinite(parsed)) return 1;
  if (parsed < 1) return 1;
  return Math.min(Math.trunc(parsed), totalPages);
}

function getEventsPageHref(page: number): string {
  if (page <= 1) return "/events";
  return `/events?page=${page}`;
}

function buildVisiblePageNumbers(currentPage: number, totalPages: number): number[] {
  const set = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) set.add(page);
  }
  return [...set].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
}

function isLocalPublicAssetAvailable(src: string): boolean {
  if (!src.startsWith("/")) return true;

  const normalized = src.split("?")[0].split("#")[0];
  const fullPath = path.join(process.cwd(), "public", normalized);
  return fs.existsSync(fullPath);
}
