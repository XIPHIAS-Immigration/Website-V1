import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Camera, MapPin, Tag } from "lucide-react";
import { formatDateLong } from "@/lib/date-format";
import { getAllEvents, getEventBySlug } from "@/lib/events-data";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found | XIPHIAS Immigration",
      robots: { index: false, follow: false },
    };
  }

  const firstParagraph = event.description
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find(Boolean);

  const description = event.summary || firstParagraph || "Event details";
  const canonical = `${SITE_URL}/events/${event.slug}`;
  const ogImage = event.photos?.[0]?.src;
  const ogImageAbsolute = ogImage
    ? `${SITE_URL}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`
    : undefined;

  return {
    title: `${event.title} | Events | XIPHIAS Immigration`,
    description,
    keywords: [
      "XIPHIAS event details",
      event.title,
      event.location ?? "immigration event",
      "migration seminar",
      "investment migration",
    ],
    alternates: { canonical },
    openGraph: {
      title: `${event.title} | Events`,
      description,
      url: canonical,
      type: "article",
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      images: ogImageAbsolute
        ? [
            {
              url: ogImageAbsolute,
              width: event.photos?.[0]?.w ?? 1200,
              height: event.photos?.[0]?.h ?? 630,
              alt: event.photos?.[0]?.alt || event.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImageAbsolute ? "summary_large_image" : "summary",
      title: `${event.title} | Events`,
      description,
      images: ogImageAbsolute ? [ogImageAbsolute] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const allEvents = getAllEvents();
  const currentIndex = allEvents.findIndex((entry) => entry.slug === event.slug);
  const newerEvent = currentIndex > 0 ? allEvents[currentIndex - 1] : undefined;
  const olderEvent =
    currentIndex >= 0 && currentIndex < allEvents.length - 1
      ? allEvents[currentIndex + 1]
      : undefined;

  const availablePhotos = (event.photos ?? []).filter((photo) =>
    isLocalPublicAssetAvailable(photo.src),
  );
  const heroPhoto = availablePhotos[0];

  const paragraphs = event.description
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description: event.summary || paragraphs[0] || event.description,
    image: availablePhotos.map((photo) => `${SITE_URL}${photo.src}`),
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
    url: `${SITE_URL}/events/${event.slug}`,
  };

  return (
    <main className="container mx-auto w-full max-w-screen-2xl px-4 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-black/55 dark:text-white/55">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/events" className="hover:text-primary">
              Events
            </Link>
          </li>
          <li>/</li>
          <li className="line-clamp-1 text-black/80 dark:text-white/80">
            {event.title}
          </li>
        </ol>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/events"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Back to events
        </Link>
        <span className="hidden text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 sm:inline">
          Event detail
        </span>
      </div>

      <article className="overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-900">
        <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 aspect-[21/9]">
          {heroPhoto ? (
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt || `${event.title} cover image`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/95 sm:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/25 px-2.5 py-1">
                <CalendarDays className="h-4 w-4" />
                {formatDateLong(event.date)}
              </span>
              {event.location ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/25 px-2.5 py-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </article>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          {event.summary ? (
            <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-neutral-900 sm:p-6">
              <h2 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
                Executive Summary
              </h2>
              <p className="mt-3 text-base leading-relaxed text-black/80 dark:text-white/80 sm:text-lg">
                {event.summary}
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-neutral-900 sm:p-6">
            <h2 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Event Overview
            </h2>
            <div className="mt-4 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${event.slug}-paragraph-${index + 1}`}
                  className="text-sm leading-7 text-black/80 dark:text-white/80 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 self-start xl:sticky xl:top-28">
          <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-neutral-900">
            <h3 className="text-base font-semibold text-black dark:text-white">
              Event Information
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <dt className="text-black/60 dark:text-white/60">Date</dt>
                  <dd className="font-medium text-black dark:text-white">
                    {formatDateLong(event.date)}
                  </dd>
                </div>
              </div>
              {event.location ? (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <dt className="text-black/60 dark:text-white/60">Location</dt>
                    <dd className="font-medium text-black dark:text-white">
                      {event.location}
                    </dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-2">
                <Camera className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <dt className="text-black/60 dark:text-white/60">Media</dt>
                  <dd className="font-medium text-black dark:text-white">
                    {availablePhotos.length} {availablePhotos.length === 1 ? "photo" : "photos"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <dt className="text-black/60 dark:text-white/60">Reference ID</dt>
                  <dd className="font-medium text-black dark:text-white">{event.slug}</dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {availablePhotos.length > 0 ? (
        <section className="mt-8" aria-labelledby="event-gallery-title">
          <div className="mb-4 flex items-end justify-between">
            <h2
              id="event-gallery-title"
              className="text-2xl font-bold text-black dark:text-white"
            >
              Event Gallery
            </h2>
            <span className="text-xs text-black/60 dark:text-white/60 sm:text-sm">
              {availablePhotos.length} {availablePhotos.length === 1 ? "photo" : "photos"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {availablePhotos.map((photo, index) => (
              <figure
                key={`${event.slug}-${photo.src}-${index}`}
                className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-neutral-900"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt || `${event.title} photo ${index + 1}`}
                  width={photo.w}
                  height={photo.h}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                {photo.caption ? (
                  <figcaption className="px-3 py-2 text-xs text-black/70 dark:text-white/70 sm:text-sm">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {newerEvent || olderEvent ? (
        <section className="mt-10 border-t border-black/10 pt-6 dark:border-white/15" aria-label="Related events navigation">
          <h2 className="text-lg font-semibold text-black dark:text-white">Explore More Events</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {newerEvent ? (
              <Link
                href={`/events/${newerEvent.slug}`}
                className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-primary/40 hover:shadow-sm dark:border-white/15 dark:bg-neutral-900"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  Newer event
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">{newerEvent.title}</p>
              </Link>
            ) : (
              <div />
            )}

            {olderEvent ? (
              <Link
                href={`/events/${olderEvent.slug}`}
                className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-primary/40 hover:shadow-sm dark:border-white/15 dark:bg-neutral-900"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  Older event
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">{olderEvent.title}</p>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
    </main>
  );
}

function isLocalPublicAssetAvailable(src: string): boolean {
  if (!src.startsWith("/")) return true;
  const normalized = src.split("?")[0].split("#")[0];
  const fullPath = path.join(process.cwd(), "public", normalized);
  return fs.existsSync(fullPath);
}
