// src/app/(site)/careers/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getJobBySlug, jobsStaticParams, jobJsonLd, getAllJobs } from "@/lib/jobs";
import { formatDateUS, formatDateUSShort } from "@/lib/format";
import JobDetailSections from "@/components/careers/JobDetailSections";
import QuickApplyForm from "@/components/careers/QuickApplyForm";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const dynamicParams = false; // only generate for files that exist
export async function generateStaticParams() {
  return jobsStaticParams();
}

const SITE = "https://www.xiphiasimmigration.com";

type Params = { slug: string };
type PageProps = { params: Params | Promise<Params> };

// ----- Helpers -----
function fmtDate(iso?: string) {
  if (!iso) return "";
  return formatDateUS(iso);
}

function fmtSalary(job: any) {
  const cur = job?.salaryCurrency || "INR";
  const min = job?.salaryMin;
  const max = job?.salaryMax;
  if (!min && !max) return null;
  const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  if (min && max) return `${cur} ${nf.format(min)}–${nf.format(max)}/yr`;
  if (min) return `From ${cur} ${nf.format(min)}/yr`;
  return `Up to ${cur} ${nf.format(max)}/yr`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const job = getJobBySlug(slug);
  const title = job ? `${job.title} | Careers at XIPHIAS Immigration` : "Job | XIPHIAS Immigration";
  const url = `${SITE}/careers/${slug}`;
  const description = job ? `${job.title} — ${job.location}. Apply now.` : "Open role at XIPHIAS Immigration.";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: job?.hero ? [{ url: job.hero, alt: job.heroAlt || job.title }] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  const job = getJobBySlug(slug);
  if (!job) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p>Role not found.</p>
      </main>
    );
  }

  const tele = Boolean(job.remote || /remote/i.test(job.location || ""));
  const salary = fmtSalary(job);

  // simple “more roles” (same dept first, then others) – server-rendered, no client JS
  const all = getAllJobs().filter((j) => j.slug !== slug);
  const sameDept = all.filter((j) => j.dept && job.dept && j.dept === job.dept);
  const more = (sameDept.length ? sameDept : all).slice(0, 3);

  return (
    <>
      {/* JobPosting structured data – correct place is the detail page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jobJsonLd(job, SITE) }} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb />
 
        {/* Hero header (matches your style) */}
        <section
          className={[
            "relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10",
            "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
            "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
            "text-black dark:text-white",
          ].join(" ")}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
            <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              {job.dept ? (
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                  {job.dept}
                </span>
              ) : null}
              {tele ? (
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                  Remote
                </span>
              ) : null}
              {job.employmentType ? (
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                  {job.employmentType}
                </span>
              ) : null}
              {job.postedAt ? (
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                  Posted {fmtDate(job.postedAt)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              {job.title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-200">
              {job.location} {job.employmentType ? "• " + job.employmentType : ""}{" "}
              {salary ? "• " + salary : ""}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Apply now
              </a>
              <a
                href="/careers"
                className="rounded-xl border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                Back to all roles
              </a>
            </div>
          </div>
        </section>

        {/* Main content + sticky apply card */}
        <section className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2">
            <JobDetailSections job={job} />
          </div>

          {/* Right: sticky apply & key facts */}
          <aside className="lg:sticky lg:top-6">
            <div
              className={[
                "rounded-2xl p-5",
                "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
                "dark:from-blue-950/30 dark:to-indigo-950/20 dark:ring-blue-900/40",
              ].join(" ")}
            >
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Quick facts
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                {job.dept && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Department</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">{job.dept}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600 dark:text-slate-300">Location</dt>
                  <dd className="font-medium text-slate-600 dark:text-slate-300">{job.location}</dd>
                </div>
                {job.employmentType && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Type</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">{job.employmentType}</dd>
                  </div>
                )}
                {salary && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Comp (est.)</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">{salary}</dd>
                  </div>
                )}
                {(job.experienceMin || job.experienceMax) && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Experience</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">
                      {job.experienceMin ?? ""}{job.experienceMax ? `–${job.experienceMax}` : ""} yrs
                    </dd>
                  </div>
                )}
                {job.postedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Posted</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">{fmtDate(job.postedAt)}</dd>
                  </div>
                )}
                {job.validThrough && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-600 dark:text-slate-300">Valid through</dt>
                    <dd className="font-medium text-slate-600 dark:text-slate-300">{fmtDate(job.validThrough)}</dd>
                  </div>
                )}
              </dl>

              {job.tags?.length ? (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.tags.map((t: string) => (
                      <span
                        key={t}
                        className="inline-flex items-center text-slate-600 dark:text-slate-300 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}

              <a
                href="#apply"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Apply for this role
              </a>
            </div>
          </aside>
        </section>

        {/* More roles (simple cards) */}
        {more.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              More roles {job.dept ? `in ${job.dept}` : "" }
            </h2>
            <ul role="list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((j) => (
                <li key={j.slug}>
                  <article className="group flex h-full flex-col justify-between rounded-xl border border-blue-100/70 bg-white/85 p-4 ring-1 ring-black/5 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
                    <header>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {j.dept || "—"} •{" "}
                        {j.postedAt
                          ? formatDateUSShort(j.postedAt)
                          : "New"}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                        {j.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {j.location} {j.employmentType ? `• ${j.employmentType}` : ""}
                      </p>
                    </header>
                    <footer className="mt-4">
                      <Link
                        href={`/careers/${j.slug}`}
                        prefetch={false}
                        className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={`View details for ${j.title}`}
                      >
                        View & Apply
                      </Link>
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Apply form block (matching site style) */}
        <section id="apply" className="mt-14">
          <div
            className={[
              "rounded-3xl p-6 sm:p-8",
              "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
              "dark:from-blue-950/30 dark:to-indigo-950/20 dark:ring-blue-900/40",
            ].join(" ")}
          >
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quick Apply
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Share your resume and we’ll get back to you.
            </p>
            <div className="mt-5">
              <QuickApplyForm defaultRole={job.title} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}