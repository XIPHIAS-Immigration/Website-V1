import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as React from "react";

import {
  getCorporateCountrySlugs,
  getCorporatePrograms,
  loadProgramPageSections,
} from "@/lib/corporate-content";

import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { localBusinessSchemas } from "@/lib/seo/schema";
import { Prose } from "@/components/ui/Prose";
import nextDynamic from "next/dynamic";
import ProgrammeDecision from "@/components/Programme/ProgrammeDecision";
import ProgrammeTabs from "@/components/Programme/ProgrammeTabs";

const MediaHero = nextDynamic(() => import("@/components/Residency/MediaHero"));
const QuickFacts = nextDynamic(() => import("@/components/Residency/QuickFacts"));
const ProcessTimeline = nextDynamic(() => import("@/components/Residency/ProcessTimeline"));
const FAQAccordion = nextDynamic(() => import("@/components/Residency/FAQAccordion"));
const ContactForm = nextDynamic(() => import("@/components/ContactForm"));
import { formatTimelineShort } from "@/lib/timeline";
const Breadcrumb = nextDynamic(() => import("@/components/Common/Breadcrumb"));
// The "what do I do now?" bar: this route's fit for the visitor and one next step.
const RouteNextStep = nextDynamic(() => import("@/components/Xia/RouteNextStep"));
const EligibilityQuickCheck = nextDynamic(() => import("@/components/Residency/EligibilityQuickCheck"));
const SocialProof = nextDynamic(() => import("@/components/Residency/SocialProof"));
const GovernmentFees = nextDynamic(() => import("@/components/Citizenship/GovernmentFees"));

// Corporate-specific
const CompanySnapshot = nextDynamic(() => import("@/components/Corporate/CompanySnapshot"));
const SponsorshipRules = nextDynamic(() => import("@/components/Corporate/SponsorshipRules"));
const PostSetupChecklist = nextDynamic(() => import("@/components/Corporate/PostSetupChecklist"));
const AuthorityNotes = nextDynamic(() => import("@/components/Corporate/AuthorityNotes"));

/** Cache once/day */
export const revalidate = 86400;
export const dynamicParams = true;

/** SSG params */
export async function generateStaticParams() {
  const countries = getCorporateCountrySlugs();
  return countries.flatMap((c) =>
    getCorporatePrograms(c).map((p) => ({
      country: c,
      program: p.programSlug,
    })),
  );
}

/** SEO metadata */
export async function generateMetadata(props: {
  params: Promise<{ country: string; program: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  try {
    const { meta } = await loadProgramPageSections(params.country, params.program);
    const heroImage = (meta as any).heroImage as string | undefined;
    const title = (meta as any).seo?.title ?? meta.title;
    const description = (meta as any).seo?.description ?? (meta as any).tagline;
    const tags: string[] = (meta as any).tags ?? [];
    const keywords = (meta as any).seo?.keywords ?? [title, meta.country, ...tags].join(", ");

    const canonicalPath = `/corporate/${params.country}/${params.program}`;
    const canonicalUrl = `https://www.xiphiasimmigration.com${canonicalPath}`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        type: "article",
        url: canonicalUrl,
        siteName: "XIPHIAS Immigration",
        locale: "en_US",
        images: [
          {
            url: heroImage ?? "/xiphias-immigration.png",
            width: 1200,
            height: 630,
            alt: `${title} – XIPHIAS Immigration`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [heroImage ?? "/xiphias-immigration.png"],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Program not found" };
  }
}

/** Similarity score for "Related" */
function similarityScore(
  base: { title: string; tags?: string[] },
  cand: { title: string; tags?: string[] },
) {
  const baseTags = new Set((base.tags ?? []).map((t) => t.toLowerCase()));
  const candTags = new Set((cand.tags ?? []).map((t) => t.toLowerCase()));
  let score = 0;
  candTags.forEach((t) => {
    if (baseTags.has(t)) score += 3;
  });
  const b = base.title.toLowerCase();
  const c = cand.title.toLowerCase();
  ["company", "business", "entrepreneur", "work", "permit", "visa", "corporate", "ep"].forEach(
    (k) => {
      if (b.includes(k) && c.includes(k)) score += 1;
    },
  );
  return score;
}

/** Page */
export default async function ProgramPage(props: {
  params: Promise<{ country: string; program: string }>;
}) {
  const params = await props.params;
  try {
    const { meta, sections } = await loadProgramPageSections(params.country, params.program);

    const videoSrc = (meta as any).heroVideo as string | undefined;
    const poster = (meta as any).heroPoster as string | undefined;
    const heroImage = (meta as any).heroImage as string | undefined;
    const brochure =
      ((meta as any).brochure as string | undefined) ??
      `/brochures/corporate/${params.country}/${params.program}.pdf`;

    const processSteps: any[] = (meta as any).processSteps ?? [];
    const quickCheck = (meta as any).quickCheck as any | undefined;

    const governmentFees =
      ((meta as any).governmentFees as
        | {
          label: string;
          amount?: number;
          currency?: string;
          sourceLabel?: string;
          sourceUrl?: string;
        }[]
        | undefined) ?? [];

    // optional corporate blocks
    const snapshot = (meta as any).snapshot as
      | {
        structure?: string;
        ownership?: string;
        office?: string;
        visaQuota?: number | string;
        bankReady?: boolean | string;
        highlights?: string[];
      }
      | undefined;

    const sponsorship = (meta as any).sponsorship as
      | {
        title?: string;
        thresholds?: { level: string; amount?: number; currency?: string; note?: string }[];
        notes?: string[];
      }
      | undefined;

    const postSetup = (meta as any).postSetup as { title?: string; items?: string[] } | undefined;

    const authorityNotes = (meta as any).authorityNotes as
      | Array<{ authority: string; points: string[]; badgeTone?: "indigo" | "emerald" | "amber" | "slate" }>
      | undefined;

    const disqualifiers: string[] = (meta as any).disqualifiers ?? [];

    /** Programs in same country */
    const otherPrograms = getCorporatePrograms(params.country).filter(
      (p) => p.programSlug !== params.program,
    );

    /** RELATED (parallelized + capped) */
    const allCountrySlugs = getCorporateCountrySlugs();
    const candidateTasks: Promise<{
      url: string;
      title: string;
      country: string;
      minInvestment?: number;
      currency?: string;
      timelineMonths?: number;
      timelineLabel?: string;
      tags?: string[];
      heroImage?: string;
      score: number;
    } | null>[] = [];

    for (const ctry of allCountrySlugs) {
      const progs = getCorporatePrograms(ctry);
      for (const p of progs) {
        if (ctry === params.country && p.programSlug === params.program) continue;
        candidateTasks.push(
          (async () => {
            try {
              const { meta: candMeta } = await loadProgramPageSections(ctry, p.programSlug);
              const score = similarityScore(
                { title: meta.title, tags: (meta as any).tags },
                { title: candMeta.title, tags: (candMeta as any).tags },
              );
              if (score <= 0) return null;
              return {
                url: `/corporate/${ctry}/${p.programSlug}`,
                title: candMeta.title,
                country: candMeta.country,
                minInvestment: candMeta.minInvestment,
                currency: candMeta.currency,
                timelineMonths: candMeta.timelineMonths,
                timelineLabel: (candMeta as any).timelineLabel as string | undefined,
                tags: (candMeta as any).tags ?? [],
                heroImage: (candMeta as any).heroImage as string | undefined,
                score,
              };
            } catch {
              return null;
            }
          })(),
        );
      }
    }

    const relatedRaw = (await Promise.all(candidateTasks)).filter(Boolean) as NonNullable<
      Awaited<(typeof candidateTasks)[number]>
    >[];
    const relatedPrograms = relatedRaw
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        const ta = a.timelineMonths ?? Number.MAX_SAFE_INTEGER;
        const tb = b.timelineMonths ?? Number.MAX_SAFE_INTEGER;
        if (ta !== tb) return ta - tb;
        const ia = a.minInvestment ?? Number.MAX_SAFE_INTEGER;
        const ib = b.minInvestment ?? Number.MAX_SAFE_INTEGER;
        return ia - ib;
      })
      .slice(0, 6);

    /** Section keys */
    const overviewKey = "overview";
    const countrySlugFromTitle = String(meta.country || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/gi, "")
      .trim()
      .replace(/\s+/g, "-");
    const whyKey = `why-${countrySlugFromTitle}`;

    const comparisonKey =
      "comparison-with-provincial-entrepreneur-programs" in sections
        ? "comparison-with-provincial-entrepreneur-programs"
        : "comparison" in sections
          ? "comparison"
          : null;

    const hasCompanySection = Boolean(
      snapshot?.structure ||
      snapshot?.ownership ||
      snapshot?.office ||
      snapshot?.visaQuota != null ||
      snapshot?.bankReady != null ||
      snapshot?.highlights?.length,
    );
    const hasOverviewSection = Boolean(sections[overviewKey]);
    const hasFaqSection = Boolean((meta as any).faq?.length);

    /** Quick Nav — corporate */

    /** JSON-LD */
    const howToLdData =
      processSteps.length > 0
        ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `${meta.title} Application Process`,
          description: (meta as any).seo?.description ?? (meta as any).tagline,
          step: processSteps.map((step: any, index: number) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.description,
          })),
        }
        : null;

    const canonicalPath = `/corporate/${params.country}/${params.program}`;
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      url: `https://www.xiphiasimmigration.com${canonicalPath}`,
      mainEntity: howToLdData ? { "@id": "#application-howto" } : undefined,
    };

    return (
      <main
        className="
          relative container mx-auto px-4
          bg-light_bg dark:bg-dark_bg text-black dark:text-white
          pb-32 sm:pb-16
        "
        style={{ scrollBehavior: "smooth" } as React.CSSProperties}
      >
        {/* JSON-LD */}
        <JsonLd
          data={breadcrumbLd([
            { name: "Corporate", url: "/corporate" },
            { name: meta.country, url: `/corporate/${params.country}` },
            { name: meta.title, url: canonicalPath },
          ])}
        />
        {(meta as any).faq?.length ? <JsonLd data={faqLd((meta as any).faq)!} /> : null}
        {howToLdData ? <JsonLd data={{ ...howToLdData, "@id": "#application-howto" }} /> : null}
        <JsonLd data={webPageLd} />
        {/* LocalBusiness — emits the verified office NAP on every programme page so
            local search can connect the programme to the practice that advises on it. */}
        {localBusinessSchemas().map((lb, i) => (
          <JsonLd key={`lb-${i}`} data={lb} />
        ))}

        {/* HERO */}
        <div className="pt-4 pb-4">
          <div className="rounded-3xl bg-white/80 dark:bg-dark_bg/80 shadow-lg backdrop-blur">
            <MediaHero
              title={meta.title}
              subtitle={(meta as any).tagline}
              videoSrc={videoSrc}
              poster={poster}
              imageSrc={heroImage}
              actions={[
                { href: "#decide", label: "Get started — ₹4,999", variant: "primary" },
                { href: brochure, label: "Download Brochure", variant: "ghost", download: true },
              ]}
            />
          </div>
          <Breadcrumb />
          <RouteNextStep country={params.country} track="corporate" title={meta.title} />
        </div>

        {/* DECIDE NOW — the first screen: facts, fit and the one next step */}
        <div id="decide" className="scroll-mt-28">
          <ProgrammeDecision track="corporate" countrySlug={params.country} programSlug={params.program} meta={meta as unknown as Record<string, unknown>} brochure={brochure} />
        </div>

        {/* EVERYTHING ELSE — one tab at a time, not a 12,000-pixel scroll */}
        <ProgrammeTabs
          tabs={[
            { id: "overview", label: "Overview", content: (
              <>
            {/* QUICK FACTS */}
            <section id="quick-facts" className="scroll-mt-28">
              <QuickFacts
                minInvestment={meta.minInvestment}
                currency={meta.currency}
                timelineMonths={meta.timelineMonths}
                timelineLabel={(meta as any).timelineLabel}
                tags={(meta as any).tags}
              />
            </section>

            {/* COMPANY SNAPSHOT */}
            {hasCompanySection && (
                <section id="company" className="scroll-mt-28">
                  <CompanySnapshot
                    structure={snapshot?.structure}
                    ownership={snapshot?.ownership}
                    office={snapshot?.office}
                    visaQuota={snapshot?.visaQuota}
                    bankReady={snapshot?.bankReady}
                    highlights={snapshot?.highlights}
                  />
                </section>
              )}

            {/* OVERVIEW */}
            {sections[overviewKey] && (
              <section id="overview" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Program overview</h2>
                </header>
                <Prose>{sections[overviewKey]}</Prose>
              </section>
            )}

            {/* COMPARISON */}
            {comparisonKey && sections[comparisonKey] && (
              <section id="comparison" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Comparison</h2>
                </header>
                <Prose>{sections[comparisonKey]}</Prose>
              </section>
            )}

            {/* WHY {COUNTRY} */}
            {sections[whyKey] && (
              <section id="why-country" className="scroll-mt-28 ">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Why {meta.country}</h2>
                </header>
                <Prose>{sections[whyKey]}</Prose>
              </section>
            )}

            {/* AUTHORITY NOTES */}
            {authorityNotes?.length ? (
              <section id="authority-notes" className="scroll-mt-28 space-y-5">
                {authorityNotes.map((b, i) => (
                  <AuthorityNotes
                    key={`${b.authority}-${i}`}
                    authority={b.authority}
                    points={b.points ?? []}
                    badgeTone={(b.badgeTone as any) ?? "indigo"}
                  />
                ))}
              </section>
            ) : null}

            {/* OTHER PROGRAMS IN COUNTRY */}
            {otherPrograms.length ? (
              <section id="other-programs" className="scroll-mt-28">
                <header className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-slate-600/10 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Explore
                  </span>
                  <h2 className="text-xl font-semibold">Other programs in {meta.country}</h2>
                </header>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {otherPrograms.map((prog) => (
                    <li key={prog.programSlug}>
                      <Link
                        href={`/corporate/${params.country}/${prog.programSlug}`}
                        className="group block rounded-xl p-4 ring-1 ring-neutral-200/80 dark:ring-neutral-800/80 bg-white/80 dark:bg-neutral-900/40 hover:-translate-y-0.5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        aria-label={`View ${prog.title}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold leading-6">{prog.title}</h3>
                            <p className="mt-0.5 text-xs opacity-70">{meta.country} · same country</p>
                          </div>
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-neutral-200 dark:ring-neutral-700 bg-black/5 dark:bg-white/10 transition group-hover:bg-black/10 group-hover:dark:bg-white/15"
                            aria-hidden
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* RELATED */}
            {relatedPrograms.length ? (
              <section id="related" className="scroll-mt-28">
                <header className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    Related
                  </span>
                  <h2 className="text-xl font-semibold">Programs similar to {meta.title}</h2>
                </header>

                <ul className="grid gap-5 sm:grid-cols-2">
                  {relatedPrograms.map((r) => {
                    const hasImg = !!r.heroImage;
                    const price =
                      typeof r.minInvestment === "number"
                        ? `${r.currency ?? ""} ${r.minInvestment.toLocaleString()}`
                        : "No minimum";
                    const time = formatTimelineShort(
                      r.timelineMonths,
                      r.timelineLabel,
                    );
                    return (
                      <li key={r.url}>
                        <Link
                          href={r.url}
                          className="group block overflow-hidden rounded-2xl ring-1 ring-neutral-200/80 dark:ring-neutral-800/80 bg-white/80 dark:bg-neutral-900/40 hover:-translate-y-0.5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                          aria-label={`View ${r.title}`}
                        >
                          <div className="relative aspect-[16/9] overflow-hidden">
                            {hasImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.heroImage!}
                                alt={`${r.title} — ${r.country} corporate immigration program`}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 grid place-items-center">
                                <span className="text-xs opacity-70">{r.country}</span>
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-base font-semibold leading-6">{r.title}</h3>
                                <p className="mt-0.5 text-xs opacity-70">{r.country}</p>
                              </div>

                              {!!r.tags?.length && (
                                <div className="hidden md:flex flex-wrap gap-1 max-w-[220px] justify-end">
                                  {r.tags.slice(0, 3).map((t) => (
                                    <span
                                      key={t}
                                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] opacity-80 ring-1 ring-neutral-200 dark:ring-neutral-700"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                              <div className="rounded-xl p-2 bg-black/5 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-neutral-700">
                                <div className="font-medium tabular-nums">{price}</div>
                                <div className="text-[11px] opacity-70">Minimum investment</div>
                              </div>
                              <div className="rounded-xl p-2 bg-black/5 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-neutral-700">
                                <div className="font-medium">{time}</div>
                                <div className="text-[11px] opacity-70">Timeline</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

              </>
            ) },
            { id: "eligibility", label: "Eligibility", content: (
              <>
            {/* MOBILE QUICK CHECK */}
            {quickCheck?.questions?.length ? (
              <section
                id="quick-check-mobile"
                className="scroll-mt-28 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60 p-4"
              >
                <EligibilityQuickCheck config={quickCheck} />
              </section>
            ) : null}

            {/* SPONSORSHIP / SALARY RULES */}
            {(sponsorship?.thresholds?.length || sponsorship?.notes?.length) && (
              <section id="sponsorship" className="scroll-mt-28">
                <SponsorshipRules
                  title={sponsorship?.title}
                  thresholds={sponsorship?.thresholds}
                  notes={sponsorship?.notes}
                />
              </section>
            )}

            {/* ELIGIBILITY */}
            {(meta as any).requirements?.length ? (
              <section
                id="requirements"
                className="scroll-mt-28 rounded-2xl bg-sky-50 dark:bg-sky-950/30 ring-1 ring-sky-200/60 dark:ring-sky-900/50 p-6"
              >
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Eligibility</h2>
                </header>
                <ul className="list-disc pl-5 space-y-2 text-[15px] leading-7">
                  {(meta as any).requirements.map((r: string) => <li key={r}>{r}</li>)}
                </ul>
              </section>
            ) : null}

            {/* BENEFITS */}
            {(meta as any).benefits?.length ? (
              <section
                id="benefits"
                className="scroll-mt-28 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40 p-6"
              >
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Key benefits</h2>
                </header>
                <ul className="list-disc pl-5 space-y-2 text-[15px] leading-7">
                  {(meta as any).benefits.map((b: string) => <li key={b}>{b}</li>)}
                </ul>
              </section>
            ) : null}

            {/* NOT A FIT? */}
            {disqualifiers.length ? (
              <section
                id="not-a-fit"
                className="scroll-mt-28 rounded-2xl bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-200/60 dark:ring-amber-900/40 p-6"
              >
                <header className="mb-2">
                  <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-300">Who this program is NOT for</h2>
                </header>
                <ul className="list-disc pl-5 text-[15px] leading-7 text-amber-900/90 dark:text-amber-100/90">
                  {disqualifiers.map((d) => <li key={d}>{d}</li>)}
                </ul>
                <p className="mt-3 text-[14px]">
                  Not a match? Explore{" "}
                  <Link href={`/corporate/${params.country}`} className="underline">
                    other programs in {meta.country}
                  </Link>.
                </p>
              </section>
            ) : null}

              </>
            ) },
            { id: "costs", label: "Costs & fees", content: (
              <>
            {/* GOVERNMENT FEES */}
            {governmentFees?.length ? (
              <section id="gov-fees" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Government fees</h2>
                </header>
                <GovernmentFees fees={governmentFees} defaultCurrency={(meta as any).currency || "USD"} />
              </section>
            ) : null}

              </>
            ) },
            { id: "process", label: "Process", content: (
              <>
            {/* POST-SETUP CHECKLIST */}
            {postSetup?.items?.length ? (
              <section id="post-setup" className="scroll-mt-28">
                <PostSetupChecklist title={postSetup?.title} items={postSetup.items} />
              </section>
            ) : null}

            {/* PROCESS */}
            {processSteps.length > 0 && (
              <section id="process" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Application process</h2>
                </header>
                <ProcessTimeline steps={processSteps} />
              </section>
            )}

              </>
            ) },
            { id: "documents", label: "Documents & family", content: (
              <>
              </>
            ) },
            { id: "faq", label: "FAQ", content: (
              <>
            {/* FAQ */}
            {(meta as any).faq?.length ? (
              <section id="faq" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Frequently asked questions</h2>
                </header>
                <FAQAccordion faqs={(meta as any).faq} />
              </section>
            ) : null}

              </>
            ) },
            { id: "contact", label: "Talk to us", content: (
              <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 p-6">
                <SocialProof />
              </div>
              <ContactForm />
            </div>
              </>
            ) },
          ]}
        />
      </main>
    );
  } catch (e) {
    console.error("[Corporate ProgramPage] load error", e);
    notFound();
  }
}
