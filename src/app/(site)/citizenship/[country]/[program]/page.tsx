// app/(site)/citizenship/[country]/[program]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as React from "react";

import {
  getCitizenshipCountrySlugs,
  getCitizenshipPrograms,
  loadProgramPageSections,
} from "@/lib/citizenship-content";
import nextDynamic from "next/dynamic";

// Shared UI
const MediaHero = nextDynamic(() => import("@/components/Residency/MediaHero"));
const QuickFacts = nextDynamic(() => import("@/components/Residency/QuickFacts"));
const ProcessTimeline = nextDynamic(() => import("@/components/Residency/ProcessTimeline"));
const FAQAccordion = nextDynamic(() => import("@/components/Residency/FAQAccordion"));
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { formatTimelineShort } from "@/lib/timeline";
const ContactForm = nextDynamic(() => import("@/components/ContactForm"));
const ProgramQuickNav = nextDynamic(() => import("@/components/Residency/ProgramQuickNav"));
const Breadcrumb = nextDynamic(() => import("@/components/Common/Breadcrumb"));
import { Prose } from "@/components/ui/Prose";
const EligibilityQuickCheck = nextDynamic(() => import("@/components/Residency/EligibilityQuickCheck"));
const SocialProof = nextDynamic(() => import("@/components/Residency/SocialProof"));
const Prices = nextDynamic(() => import("@/components/Residency/Prices"));

// Citizenship-only
const RiskCompliance = nextDynamic(() => import("@/components/Citizenship/RiskCompliance"));
const CostCalculator = nextDynamic(() => import("@/components/Citizenship/CostCalculator"));
const DocumentChecklist = nextDynamic(() => import("@/components/Citizenship/DocumentChecklist"));
const FamilyMatrix = nextDynamic(() => import("@/components/Citizenship/FamilyMatrix"));
const AdvisorConsultationCard = nextDynamic(() => import("@/components/Citizenship/AdvisorConsultationCard"));
import { FileSignature, Hourglass, CalendarClock } from "lucide-react";
const GovernmentFees = nextDynamic(() => import("@/components/Citizenship/GovernmentFees"));

export const revalidate = 86400;
export const dynamicParams = true;

/** ---------- small helpers (kept local; no flow changes) ---------- */
// Slug helper that mirrors the one used when splitting MDX
function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Find the best-matching section key from compiled MDX sections.
 * - Tries exact string keys first
 * - Then tries regex match (first found wins)
 */
function findSectionKey(
  sections: Record<string, unknown>,
  ...candidates: (string | RegExp)[]
): string | undefined {
  const keys = Object.keys(sections);
  for (const c of candidates) {
    if (typeof c === "string") {
      if (keys.includes(c)) return c;
    } else {
      const k = keys.find((k) => c.test(k));
      if (k) return k;
    }
  }
  return undefined;
}

/** ---------- SSG params ---------- */
export async function generateStaticParams() {
  const countries = getCitizenshipCountrySlugs();
  return countries.flatMap((c) =>
    getCitizenshipPrograms(c).map((p) => ({
      country: c,
      program: p.programSlug,
    })),
  );
}

/** ---------- SEO metadata ---------- */
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
    const keywords =
      (meta as any).seo?.keywords ?? [title, meta.country, ...tags].join(", ");
    const canonicalPath = `/citizenship/${params.country}/${params.program}`;
    const absoluteUrl = `https://www.xiphiasimmigration.com${canonicalPath}`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        type: "article",
        url: absoluteUrl,
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

/** Similarity score for "Related" (tuned for citizenship) */
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
  ["citizenship", "investment", "naturalization", "golden", "visa"].forEach((k) => {
    if (b.includes(k) && c.includes(k)) score += 1;
  });
  return score;
}

/** ---------- Page ---------- */
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
      `/brochures/citizenship/${params.country}/${params.program}.pdf`;

    const processSteps: any[] = (meta as any).processSteps ?? [];
    const quickCheck = (meta as any).quickCheck as any | undefined;

    const prices = (meta as any).prices as
      | { label: string; amount?: number; currency?: string; when?: string; notes?: string }[]
      | undefined;

    const proofOfFunds = (meta as any).proofOfFunds as
      | { label?: string; amount: number; currency?: string; notes?: string }[]
      | undefined;

    const disqualifiers: string[] = (meta as any).disqualifiers ?? [];

    // Program-level extras (all optional)
    const routeType = (meta as any).routeType as
      | "donation"
      | "real-estate"
      | "bond"
      | "naturalisation"
      | undefined;

    const holdingPeriodMonths = (meta as any).holdingPeriodMonths as number | undefined;

    const governmentFees = (meta as any).governmentFees as
      | { label: string; amount?: number; currency?: string }[]
      | undefined;

    const projectList = (meta as any).projectList as
      | { name: string; minBuyIn: number; holdMonths: number; notes?: string; image?: string }[]
      | undefined;

    const riskNotes = (meta as any).riskNotes as string[] | undefined;
    const complianceNotes = (meta as any).complianceNotes as string[] | undefined;
    const lastUpdated = (meta as any).lastUpdated as string | undefined;

    // Optional: document checklist + family matrix data (if present)
    const documentChecklist = (meta as any).documentChecklist as
      | { group: string; documents: string[] }[]
      | undefined;

    const familyMatrix = (meta as any).familyMatrix as
      | { childrenUpTo?: number; parentsFromAge?: number; siblings?: boolean; spouse?: boolean }
      | undefined;

    /** Programs in same country */
    const otherPrograms = getCitizenshipPrograms(params.country).filter(
      (p) => p.programSlug !== params.program,
    );

    /** RELATED (parallelized + capped) */
    const allCountrySlugs = getCitizenshipCountrySlugs();
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
      const progs = getCitizenshipPrograms(ctry);
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
                url: `/citizenship/${ctry}/${p.programSlug}`,
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
    const relatedPrograms = Array.from(new Map(relatedRaw.map((r) => [r.url, r])).values())
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

    /** ---------- MDX section keys (robust to headings/anchors) ---------- */
    const countrySlugFromMeta = toSlug((meta as any).country || "");
    const overviewKey =
      findSectionKey(sections, "overview") ??
      findSectionKey(sections, /^introduction$/i);
    const investmentKey =
      findSectionKey(sections, "investment-overview", "investment") ??
      findSectionKey(sections, /^investment/);
    const comparisonKey =
      findSectionKey(
        sections,
        "comparison",
        /^comparison(-|$)/,
        /^comparison-of-/,
        /(^|-)vs(-|$)/,
        /(^|-)versus(-|$)/,
        /(^|-)compare(d|s)?(-|$)/,
      ) ?? undefined;
    // Prefer "Why {country}" (not "Why choose...")
    const whyCountryKey =
      findSectionKey(
        sections,
        new RegExp(`^why-${countrySlugFromMeta}$`),
        new RegExp(`^why-${countrySlugFromMeta.split("-").slice(0, 3).join("-")}`),
        /^why-(?!choose)/, // any "why-" that is not "why-choose..."
      ) ?? undefined;
    // Kept for future use; not necessarily rendered on this page
    const whyUsKey =
      findSectionKey(sections, "why-choose-us") ??
      findSectionKey(sections, /^why-choose/);

    const mdxKey = {
      overview: overviewKey,
      investment: investmentKey,
      comparison: comparisonKey,
      whyCountry: whyCountryKey,
      whyUs: whyUsKey,
    } as const;

    const hasSpecifics = !!(routeType || typeof holdingPeriodMonths === "number" || lastUpdated);
    const hasPrices = !!(prices?.length || proofOfFunds?.length);
    const hasGovFees = !!governmentFees?.length;
    const hasRequirements = !!(meta as any).requirements?.length;
    const hasBenefits = !!(meta as any).benefits?.length;
    const hasDocs = !!documentChecklist?.length;
    const hasDeps = !!familyMatrix;
    const hasProcess = processSteps.length > 0;
    const hasCompliance = !!(riskNotes?.length || complianceNotes?.length);
    const hasComparison = !!(mdxKey.comparison && sections[mdxKey.comparison]);
    const hasWhyCountry = !!(mdxKey.whyCountry && sections[mdxKey.whyCountry]);
    const hasProjects = !!projectList?.length;
    const hasEstimator = !!(meta as any).costEstimator?.baseOptions?.length;
    const hasFAQ = !!(meta as any).faq?.length;
    const hasOther = otherPrograms.length > 0;
    const hasRelated = relatedPrograms.length > 0;

    const sectionsForNav: { id: string; label: string }[] = [
      { id: "quick-facts", label: "Quick facts" },
      ...(hasSpecifics ? [{ id: "specifics", label: "Program specifics" }] : []),
      ...(mdxKey.overview ? [{ id: "overview", label: "Overview" }] : []),
      ...(mdxKey.investment ? [{ id: "investment", label: "Investment" }] : []),
      ...(hasPrices ? [{ id: "prices", label: "Costs & funds" }] : []),
      ...(hasGovFees ? [{ id: "gov-fees", label: "Government fees" }] : []),
      ...(hasRequirements ? [{ id: "requirements", label: "Eligibility" }] : []),
      ...(hasBenefits ? [{ id: "benefits", label: "Benefits" }] : []),
      ...(hasDocs ? [{ id: "documents", label: "Documents" }] : []),
      ...(hasDeps ? [{ id: "dependents", label: "Dependents" }] : []),
      ...(hasProcess ? [{ id: "process", label: "Process" }] : []),
      ...(hasCompliance ? [{ id: "compliance", label: "Risk & compliance" }] : []),
      ...(hasComparison ? [{ id: "comparison", label: "Comparison" }] : []),
      ...(hasWhyCountry ? [{ id: "why-country", label: `Why ${meta.country}` }] : []),
      ...(hasProjects ? [{ id: "projects", label: "Approved projects" }] : []),
      ...(hasEstimator ? [{ id: "cost-estimator", label: "Cost estimator" }] : []),
      ...(disqualifiers.length ? [{ id: "not-a-fit", label: "Not a fit?" }] : []),
      ...(hasFAQ ? [{ id: "faq", label: "FAQ" }] : []),
      ...(hasOther ? [{ id: "other-programs", label: "Other programs" }] : []),
      ...(hasRelated ? [{ id: "related", label: "Related" }] : []),
      { id: "advisor", label: "Advisor" },
    ];

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

    const offerLd =
      prices && prices.length
        ? {
          "@context": "https://schema.org",
          "@type": "AggregateOffer",
          priceCurrency:
            prices.find((p) => p.currency)?.currency || (meta as any).currency || "USD",
          offers: prices
            .filter((p) => typeof p.amount === "number")
            .map((p) => ({
              "@type": "Offer",
              name: p.label,
              price: p.amount,
              priceCurrency: p.currency || (meta as any).currency || "USD",
              category: p.when || undefined,
              description: p.notes || undefined,
              availability: "https://schema.org/InStock",
            })),
        }
        : null;

    const canonicalPath = `/citizenship/${params.country}/${params.program}`;
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      url: `https://www.xiphiasimmigration.com${canonicalPath}`,
      mainEntity: howToLdData ? { "@id": "#application-howto" } : undefined,
    };

    return (
      <main
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-2 text-black dark:text-white "
        style={{ scrollBehavior: "smooth" } as React.CSSProperties}
      >
        {/* JSON-LD */}
        <JsonLd
          data={breadcrumbLd([
            { name: "Citizenship", url: "/citizenship" },
            { name: meta.country, url: `/citizenship/${params.country}` },
            { name: meta.title, url: canonicalPath },
          ])}
        />
        {(meta as any).faq?.length ? <JsonLd data={faqLd((meta as any).faq)!} /> : null}
        {howToLdData ? <JsonLd data={{ ...howToLdData, "@id": "#application-howto" }} /> : null}
        <JsonLd data={webPageLd} />
        {offerLd ? <JsonLd data={offerLd} /> : null}

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
                { href: "/contact", label: "Book a Free Consultation", variant: "primary" },
                { href: brochure, label: "Download Brochure", variant: "ghost", download: true },
              ]}
            />
          </div>
          <Breadcrumb />
        </div>

        {/* IN-PAGE QUICK NAV */}
        <ProgramQuickNav sections={sectionsForNav} />

        {/* BODY */}
        <div className="flex flex-col gap-8 pt-5 pb-16 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* MAIN */}
          <div className="order-2 lg:order-1 lg:col-span-8 xl:col-span-8 space-y-10">
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

            {/* Program specifics */}
            {hasSpecifics ? (
              <section id="specifics" className="scroll-mt-28" aria-labelledby="specifics-heading">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-sky-600/10 px-2 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                    Program
                  </span>
                  <h2 id="specifics-heading" className="text-sm font-semibold opacity-80">
                    Program specifics
                  </h2>
                </div>

                <div
                  className="
                    relative overflow-hidden rounded-2xl p-4 sm:p-6
                    bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900/60 dark:to-neutral-900/20
                    ring-1 ring-neutral-200/80 dark:ring-neutral-800/70 shadow-sm
                  "
                  role="group"
                  aria-label="Key program parameters"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-sky-500/5 blur-2xl"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-10 -bottom-12 h-40 w-40 rounded-full bg-indigo-500/5 blur-2xl"
                  />

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                    {/* Route type */}
                    {routeType ? (
                      <dl className="grid gap-1.5">
                        <dt className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                          <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-white ring-1 ring-neutral-200 dark:bg-white/10 dark:ring-neutral-700">
                            <FileSignature className="h-4 w-4 text-sky-700 dark:text-sky-300" aria-hidden />
                          </span>
                          Route type
                        </dt>
                        <dd className="text-[15px] sm:text-base font-semibold leading-6 capitalize">
                          {prettyRouteType(routeType)}
                        </dd>
                        <dd className="text-xs opacity-70">Eligible investment pathway</dd>
                      </dl>
                    ) : null}

                    {/* Holding period */}
                    {typeof holdingPeriodMonths === "number" ? (
                      <dl className="grid gap-1.5 sm:border-l sm:border-neutral-200/70 sm:dark:border-neutral-800/70 sm:pl-4">
                        <dt className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                          <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-white ring-1 ring-neutral-200 dark:bg-white/10 dark:ring-neutral-700">
                            <Hourglass className="h-4 w-4 text-emerald-700 dark:text-emerald-300" aria-hidden />
                          </span>
                          Holding period
                        </dt>
                        <dd className="text-[15px] sm:text-base font-semibold leading-6">
                          <time dateTime={toISOMonthDuration(holdingPeriodMonths)}>
                            {holdingPeriodMonths} {holdingPeriodMonths === 1 ? "month" : "months"}
                          </time>
                          {holdingPeriodMonths >= 12 ? (
                            <span className="ml-2 text-sm font-normal opacity-80">
                              ({approxYears(holdingPeriodMonths)})
                            </span>
                          ) : null}
                        </dd>
                        <dd className="text-xs opacity-70">Minimum asset retention</dd>
                      </dl>
                    ) : null}

                    {/* Last updated */}
                    {lastUpdated ? (
                      <dl className="grid gap-1.5 sm:border-l sm:border-neutral-200/70 sm:dark:border-neutral-800/70 sm:pl-4">
                        <dt className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                          <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-white ring-1 ring-neutral-200 dark:bg-white/10 dark:ring-neutral-700">
                            <CalendarClock className="h-4 w-4 text-indigo-700 dark:text-indigo-300" aria-hidden />
                          </span>
                          Last updated
                        </dt>
                        <dd className="text-[15px] sm:text-base font-semibold leading-6">
                          <time dateTime={toISO(lastUpdated)} title={toISO(lastUpdated)}>
                            {toNiceDate(lastUpdated)}
                          </time>
                        </dd>
                        <dd className="text-xs opacity-70">Subject to regulatory change</dd>
                      </dl>
                    ) : null}
                  </div>

                  <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Information is indicative and may change; confirm current terms with an advisor.
                  </p>
                </div>
              </section>
            ) : null}

            {/* MOBILE: Quick eligibility check near top */}
            {quickCheck?.questions?.length ? (
              <section
                id="quick-check-mobile"
                className="sm:hidden scroll-mt-28 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60 p-4"
              >
                <EligibilityQuickCheck config={quickCheck} />
              </section>
            ) : null}

            {/* OVERVIEW */}
            {mdxKey.overview && sections[mdxKey.overview] && (
              <section id="overview" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Program overview</h2>
                </header>
                <Prose>{sections[mdxKey.overview]}</Prose>
              </section>
            )}

            {/* INVESTMENT */}
            {mdxKey.investment && sections[mdxKey.investment] && (
              <section id="investment" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Investment overview</h2>
                </header>
                <Prose>{sections[mdxKey.investment]}</Prose>
              </section>
            )}

            {/* === Eligibility + Benefits === */}
            {hasRequirements || hasBenefits ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {hasRequirements ? (
                  <section
                    id="requirements"
                    aria-labelledby="eligibility-title"
                    className="scroll-mt-28 rounded-2xl bg-sky-50 dark:bg-sky-950/30 ring-1 ring-sky-200/60 dark:ring-sky-900/50 p-6"
                  >
                    <header className="mb-3">
                      <h2 id="eligibility-title" className="text-xl font-semibold">
                        Eligibility
                      </h2>
                    </header>
                    <ul className="list-disc pl-5 space-y-2 text-[15px] leading-7">
                      {(meta as any).requirements.map((r: string) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {hasBenefits ? (
                  <section
                    id="benefits"
                    aria-labelledby="benefits-title"
                    className="scroll-mt-28 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40 p-6"
                  >
                    <header className="mb-3">
                      <h2 id="benefits-title" className="text-xl font-semibold">
                        Key benefits
                      </h2>
                    </header>
                    <ul className="list-disc pl-5 space-y-2 text-[15px] leading-7">
                      {(meta as any).benefits.map((b: string) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}

            {/* COSTS & FUNDS */}
            {hasPrices ? (
              <section id="prices" className="scroll-mt-28 overflow-visible">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Costs & proof of funds</h2>
                </header>
                <div className="w-full overflow-visible">
                  <Prices
                    items={prices ?? []}
                    proofOfFunds={proofOfFunds ?? []}
                    defaultCurrency={(meta as any).currency}
                  />
                </div>
              </section>
            ) : null}

            {/* GOV FEES — anchor for quick-nav */}
            {hasGovFees ? (
              <section id="gov-fees" className="scroll-mt-28">
                <GovernmentFees
                  fees={governmentFees}
                  defaultCurrency={(meta as any).currency || "USD"}
                />
              </section>
            ) : null}

            {/* Optional: Document checklist & Dependents */}
            {documentChecklist?.length ? (
              <section id="documents" className="scroll-mt-28">
                <DocumentChecklist
                  groups={documentChecklist}
                  note="Documents vary by family profile; we’ll tailor your list."
                />
              </section>
            ) : null}
            {familyMatrix ? (
              <section id="dependents" className="scroll-mt-28">
                <FamilyMatrix {...familyMatrix} />
              </section>
            ) : null}

            {/* PROCESS */}
            {hasProcess && (
              <section id="process" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Application process</h2>
                </header>
                <ProcessTimeline steps={processSteps} />
              </section>
            )}

            {/* Risk & Compliance */}
            {hasCompliance ? (
              <section id="compliance" className="scroll-mt-28">
                <RiskCompliance
                  riskNotes={riskNotes ?? []}
                  complianceNotes={complianceNotes ?? []}
                />
              </section>
            ) : null}

            {/* COMPARISON */}
            {hasComparison && mdxKey.comparison && (
              <section id="comparison" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Comparison</h2>
                </header>
                <Prose>{sections[mdxKey.comparison]}</Prose>
              </section>
            )}

            {/* Approved projects */}
            {hasProjects ? (
              <section id="projects" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Approved projects</h2>
                  <p className="text-sm opacity-80">
                    Government-approved developments vetted for eligibility and exit horizons.
                  </p>
                </header>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {projectList!.map((p) => (
                    <li
                      key={p.name}
                      className="overflow-hidden rounded-2xl ring-1 ring-neutral-200/80 dark:ring-neutral-800/80 bg-white/80 dark:bg-neutral-900/40"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                          src={p.image}
                          alt={`${p.name} project in ${meta.country}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 grid place-items-center">
                            <span className="text-xs opacity-70">{meta.country}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-semibold">{p.name}</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-lg bg-black/5 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-neutral-700 p-2">
                            <div className="opacity-70 text-[11px]">Min buy-in</div>
                            <div className="font-medium tabular-nums">
                              {typeof p.minBuyIn === "number" ? p.minBuyIn.toLocaleString() : "—"}{" "}
                              {(meta as any).currency || ""}
                            </div>
                          </div>
                          <div className="rounded-lg bg-black/5 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-neutral-700 p-2">
                            <div className="opacity-70 text-[11px]">Hold period</div>
                            <div className="font-medium tabular-nums">
                              {typeof p.holdMonths === "number" ? `${p.holdMonths} mo` : "—"}
                            </div>
                          </div>
                        </div>
                        {p.notes ? <p className="mt-2 text-sm opacity-80">{p.notes}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <a
                    href="/personal-booking"
                    className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  >
                    Discuss vetted projects
                  </a>
                </div>
              </section>
            ) : null}

            {/* Cost estimator */}
            {hasEstimator ? (
              <section id="cost-estimator" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Cost estimator</h2>
                </header>
                <CostCalculator
                  currency={(meta as any).currency || "USD"}
                  baseOptions={(meta as any).costEstimator.baseOptions}
                  defaultBaseId={(meta as any).costEstimator.defaultBaseId}
                  adults={(meta as any).costEstimator.adults ?? 2}
                  children={(meta as any).costEstimator.children ?? 0}
                  addons={(meta as any).costEstimator.addons ?? []}
                />
              </section>
            ) : null}

            {/* NOT A FIT? */}
            {disqualifiers.length ? (
              <section
                id="not-a-fit"
                className="scroll-mt-28 rounded-2xl bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-200/60 dark:ring-amber-900/40 p-6"
              >
                <header className="mb-2">
                  <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-300">
                    Who this program is NOT for
                  </h2>
                </header>
                <ul className="list-disc pl-5 text-[15px] leading-7 text-amber-900/90 dark:text-amber-100/90">
                  {disqualifiers.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="mt-3 text-[14px]">
                  Not a match? Explore{" "}
                  <Link href={`/citizenship/${params.country}`} className="underline">
                    other programs in {meta.country}
                  </Link>
                  .
                </p>
              </section>
            ) : null}

            {/* FAQ */}
            {hasFAQ ? (
              <section id="faq" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Frequently asked questions</h2>
                </header>
                <FAQAccordion faqs={(meta as any).faq} />
              </section>
            ) : null}

            {/* OTHER PROGRAMS IN COUNTRY */}
            {hasOther ? (
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
                        href={`/citizenship/${params.country}/${prog.programSlug}`}
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
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
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
            {hasRelated ? (
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
                                alt={`${r.title} — ${r.country} citizenship program`}
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

            {/* ADVISOR SPOTLIGHT */}
            <section id="advisor" className="scroll-mt-28">
              <AdvisorConsultationCard bookingHref="/booking?plan=paid" />
            </section>

            {/* spacer for mobile floating nav */}
            <div className="sm:hidden h-24" aria-hidden="true" />
          </div>

          {/* SIDEBAR (desktop) */}
          <aside className="order-1 lg:order-2 lg:col-span-4 xl:col-span-4 space-y-6 self-start lg:sticky lg:top-24">
            {quickCheck?.questions?.length ? (
              <div className="hidden lg:block">
                <EligibilityQuickCheck config={quickCheck} />
              </div>
            ) : null}

            <div className="hidden lg:block rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 p-6">
              <SocialProof />
            </div>

            <div className="hidden lg:block rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 p-6">
              <h3 className="text-base font-semibold">Brochure</h3>
              <p className="text-sm opacity-80 mt-1">Full details, requirements, and timelines.</p>
              <a
                href={brochure}
                download
                className="mt-4 inline-flex rounded-xl ring-1 ring-neutral-300 dark:ring-neutral-700 px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Download PDF
              </a>
            </div>

            <div className="hidden lg:block">
              <ContactForm />
            </div>
          </aside>
        </div>
      </main>
    );
  } catch (e) {
    console.error("[Citizenship ProgramPage] load error", e);
    notFound();
  }
}

function toISOMonthDuration(m: number) {
  const clamped = Math.max(0, Math.round(m));
  return `P${clamped}M`;
}
function approxYears(m: number) {
  const yrs = m / 12;
  const rounded = yrs >= 2 ? Math.round(yrs) : Math.round(yrs * 2) / 2;
  return `~${rounded} yr${rounded === 1 ? "" : "s"}`;
}
function toISO(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toISOString();
}
function toNiceDate(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
}
function prettyRouteType(rt: string) {
  return rt.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
