import Link from "next/link";

import InsightTOC from "./InsightTOC";
import ReadingProgress from "./ReadingProgress";
import ShareBar from "./ShareBar";
import InsightsList from "./InsightsList";
import MediaHero from "./MediaHero";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { getRelatedContent } from "@/lib/insights-content";
import type { InsightRecord } from "@/types/insights";
import { Prose } from "@/components/ui/Prose";

/* -------------------------------------------------------------------------- */
/* utils + inline icons                                                       */
/* -------------------------------------------------------------------------- */

function formatDateUTC(input?: string) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

const IconPen = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5z" />
  </svg>
);

const IconCalendar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M8 3v3M16 3v3M3 10h18" />
  </svg>
);

const IconClock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* main view                                                                  */
/* -------------------------------------------------------------------------- */

export default async function InsightDetailView({
  record,
}: {
  record: InsightRecord;
}) {
  const related = await getRelatedContent(record);

  const displayDate = formatDateUTC(record.updated || record.date);
  const readingTime = record.readingTimeMins
    ? `${record.readingTimeMins} min`
    : "—";

  const countries = record.country ?? [];
  const programs = record.program ?? [];
  const tags = record.tags ?? [];

  return (
    <>
      {/* Top progress bar (GPU-accelerated, non-intrusive) */}
      <ReadingProgress />

      {/* TOP: crumbs + hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Breadcrumb />

        <MediaHero
          title={record.title}
          subtitle={record.summary || undefined}
          videoSrc={record.heroVideo || undefined}
          poster={record.heroPoster ?? record.hero ?? undefined}
          imageSrc={record.hero || undefined}
          actions={[
            {
              href: "/personal-booking",
              label: "Book a Paid Consultation",
              variant: "primary",
            },
            { href: "/contact", label: "Contact Us", variant: "ghost" },
          ]}
        />
      </section>

      {/* INFO RIBBON — compact, advanced-responsive, strong hierarchy */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div
          role="group"
          aria-label="Article meta"
          className={[
            // minimal surface; no loud highlight
            "relative w-full rounded-xl",
            "border border-black/5 dark:border-white/10",
            "bg-transparent dark:bg-transparent",
            // padding tuned for small screens; airy but not tall
            "px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5",
            // subtle focus-within ring for a11y
            "focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition-shadow",
          ].join(" ")}
        >
          {/* Layout:
              - mobile: tight row that wraps gracefully
              - lg+: single-line with inline dividers and pinned Share at end
          */}
          <div
            className={[
              "flex flex-wrap items-center",
              "gap-x-3 gap-y-1.5 sm:gap-x-4",
              // add inline separators only on lg+
              "lg:divide-x lg:divide-black/10 lg:dark:divide-white/10",
            ].join(" ")}
          >
            {/* Written by */}
            <div className="flex items-center gap-2 min-w-0">
              <MetaBit
                icon={
                  <IconPen className="h-4 w-4 text-black/40 dark:text-white/50" />
                }
                label={
                  <span className="text-[11px] uppercase tracking-wide text-black/70 dark:text-white/80">
                    Written by
                  </span>
                }
                value={
                  <span
                    className="text-sm font-medium text-black/80 dark:text-white/85 truncate"
                    title={record.author || undefined}
                  >
                    {record.author || "—"}
                  </span>
                }
              />
            </div>

            {/* (lg-only) divider effect handled by lg:divide-x; spacer keeps padding balanced */}
            <div className="hidden lg:block px-3" aria-hidden />

            {/* Last updated */}
            <div className="flex items-center gap-2 min-w-0">
              <MetaBit
                icon={
                  <IconCalendar className="h-4 w-4 text-black/40 dark:text-white/50" />
                }
                label={
                  <span className="text-[11px] uppercase tracking-wide text-black/70 dark:text-white/80">
                    Last updated
                  </span>
                }
                value={
                  <time
                    className="text-sm font-medium text-black/80 dark:text-white/85 truncate"
                    title={displayDate || undefined}
                    dateTime={displayDate || undefined}
                  >
                    {displayDate || "—"}
                  </time>
                }
              />
            </div>

            <div className="hidden lg:block px-3" aria-hidden />

            {/* Read time — small badge for quick scan */}
            <div className="flex items-center gap-2">
              <MetaBit
                icon={
                  <IconClock className="h-4 w-4 text-black/40 dark:text-white/50" />
                }
                label={
                  <span className="text-[11px] uppercase tracking-wide text-black/70 dark:text-white/80">
                    Read time
                  </span>
                }
                value={
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-black/[0.04] text-black/70 dark:bg-white/[0.08] dark:text-white/80">
                    {readingTime}
                  </span>
                }
              />
            </div>

            {/* Share: inline on mobile; pinned right on lg */}
            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              {/* compact label: icon on xs, text from sm+ */}
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-black/70 dark:text-white/80">
                <svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14 6a3 3 0 1 0-2.4 2.94v6.12A3 3 0 1 0 13 17V8.94A3 3 0 0 0 14 6Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </span>

              {/* ensure comfortable touch targets on mobile without looking chunky */}
              <ShareBar
                title={record.title}
                url={record.url}
                className="[&>button]:p-2 [&>button]:min-w-[40px] [&>button]:min-h-[36px] sm:[&>button]:min-h-0"
              />
            </div>
          </div>

          {/* hairline top accent only on lg+; subtle color hierarchy */}
          <div
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute inset-x-0 -top-px h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.1), rgba(0,0,0,.06))",
            }}
          />
        </div>
      </section>

      {/* BODY */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* MAIN */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Centralized typography system */}
            <Prose
              id="article-content"
              className="prose-headings:scroll-mt-28 md:prose-lg max-w-[72ch]"
            >
              {record.content}
            </Prose>

            {/* META LINKS */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {countries.length > 0 && (
                <MetaBox title="Countries">
                  {countries.map((c) => (
                    <Link
                      key={c}
                      href={`/insights?country=${encodeURIComponent(c)}`}
                      className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                      aria-label={`Filter by country ${c}`}
                    >
                      {c}
                    </Link>
                  ))}
                </MetaBox>
              )}
              {programs.length > 0 && (
                <MetaBox title="Programs">
                  {programs.map((p) => (
                    <Link
                      key={p}
                      href={`/insights?program=${encodeURIComponent(p)}`}
                      className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                      aria-label={`Filter by program ${p}`}
                    >
                      {p}
                    </Link>
                  ))}
                </MetaBox>
              )}
              {tags.length > 0 && (
                <MetaBox title="Tags">
                  {tags.map((t) => (
                    <Link
                      key={t}
                      href={`/insights?tag=${encodeURIComponent(t)}`}
                      className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                      aria-label={`Filter by tag ${t}`}
                    >
                      #{t}
                    </Link>
                  ))}
                </MetaBox>
              )}
            </div>

            {/* RELATED */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                  Related
                </h2>
                <InsightsList items={related} />
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-28 space-y-6">
                <InsightTOC headings={record.headings || []} />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* small subcomponents                                                        */
/* -------------------------------------------------------------------------- */

function MetaBit({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: React.ReactNode; // was string — make flexible for hierarchy styling
  value: React.ReactNode; // was string — allow badges / truncation / time
}) {
  return (
    <div className="inline-flex items-center gap-2 min-w-0">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/80">
        {icon}
      </span>
      <div className="leading-tight min-w-0">
        <div className="text-xs uppercase tracking-wide text-black/70 dark:text-white/80">
          {label}
        </div>
        <div className="text-sm font-semibold text-black dark:text-white truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="h-6 w-px bg-black/10 dark:bg-white/15" />;
}

function MetaBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/80 dark:bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-black/60">
      <div className="mb-2 text-sm font-semibold text-black dark:text-white">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
