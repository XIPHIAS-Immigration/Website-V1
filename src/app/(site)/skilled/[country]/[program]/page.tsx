// Skilled detail page — skilled-only UX (no investment/cost blocks), Related only (no Insights)

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as React from "react";
import { Target, Timer, Briefcase } from "lucide-react";

import {
  getSkilledCountrySlugs,
  getSkilledPrograms,
  loadProgramPageSections,
} from "@/lib/skilled-content";
import { baseFromCategory, pickSectionKey } from "@/lib/section-helpers";
import { formatTimelineLong } from "@/lib/timeline";

import { Prose } from "@/components/ui/Prose";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo";

// Dynamically import heavy UI sections to reduce the main bundle size.
// Using next/dynamic helps lower Total Blocking Time and improves
// Lighthouse performance.
import nextDynamic from "next/dynamic";

const MediaHero = nextDynamic(() => import("@/components/Skilled/MediaHero"));
const ProgramQuickNav = nextDynamic(() => import("@/components/Residency/ProgramQuickNav"));
const ProcessTimeline = nextDynamic(() => import("@/components/Residency/ProcessTimeline"));
const FAQAccordion = nextDynamic(() => import("@/components/Residency/FAQAccordion"));
const ContactForm = nextDynamic(() => import("@/components/ContactForm"));
const SocialProof = nextDynamic(() => import("@/components/Residency/SocialProof"));
const Breadcrumb = nextDynamic(() => import("@/components/Common/Breadcrumb"));

// Skilled-specific blocks
const LanguageRequirements = nextDynamic(() => import("@/components/Skilled/LanguageRequirements"));
const OccupationLists = nextDynamic(() => import("@/components/Skilled/OccupationLists"));
const PointsGridTable = nextDynamic(() => import("@/components/Skilled/PointsGridTable"));
const Overoffer = nextDynamic(() => import("@/components/Skilled/Overoffer"));
const TestimonialCarousel = nextDynamic(() => import("@/components/Skilled/TestimonialCarousel"));

// Shared rich blocks reused from citizenship
const EligibilityQuickCheck = nextDynamic(() => import("@/components/Residency/EligibilityQuickCheck"));
const DocumentChecklist = nextDynamic(() => import("@/components/Citizenship/DocumentChecklist"));
const FamilyMatrix = nextDynamic(() => import("@/components/Citizenship/FamilyMatrix"));
const GovernmentFees = nextDynamic(() => import("@/components/Citizenship/GovernmentFees"));

export const revalidate = 86400;
export const dynamicParams = true;

/** SSG params */
export async function generateStaticParams() {
  const countries = await getSkilledCountrySlugs();
  const params: { country: string; program: string }[] = [];
  for (const c of countries) {
    const progs = await getSkilledPrograms(c);
    for (const p of progs as any[]) {
      const programSlug = p.programSlug ?? p.slug;
      if (!programSlug) continue;
      params.push({ country: c, program: programSlug });
    }
  }
  return params;
}

/** simple slug helper (null/undefined/number-safe) */
const toSlug = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** SEO */
export async function generateMetadata(
  props: { params: Promise<{ country: string; program: string }> }
): Promise<Metadata> {
  const params = await props.params;

  try {
    const { meta } = await loadProgramPageSections(params.country, params.program);
    const heroImage = (meta as any).heroImage as string | undefined;
    const title =
      (meta as any).seo?.title ??
      (meta as any).metaTitle ??
      (meta as any).title ??
      `${params.program} — ${(meta as any).country ?? params.country}`;
    const description =
      (meta as any).seo?.description ??
      (meta as any).metaDescription ??
      (meta as any).tagline ??
      (meta as any).description;
    const tags: string[] = (meta as any).tags ?? [];
    const keywords =
      (meta as any).seo?.keywords ??
      [title, (meta as any).country ?? params.country, ...tags].join(", ");

    const canonicalPath = `${baseFromCategory("skilled")}/${params.country}/${params.program}`;
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
    };
  } catch {
    return { title: "Program not found" };
  }
}

/** tiny scorer for “Related” */
function similarityScore(
  base: { title: string; tags?: string[] },
  cand: { title: string; tags?: string[] },
) {
  const baseTags = new Set((base.tags ?? []).map((t) => t.toLowerCase()));
  const candTags = new Set((cand.tags ?? []).map((t) => t.toLowerCase()));
  let score = 0;
  candTags.forEach((t) => baseTags.has(t) && (score += 3));
  const b = base.title.toLowerCase();
  const c = cand.title.toLowerCase();
  ["skilled", "talent", "work", "permit", "visa", "points"].forEach(
    (k) => b.includes(k) && c.includes(k) && (score += 1),
  );
  return score;
}

type RelatedItem = {
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
};

function SkilledFacts({
  timelineMonths,
  timelineLabel,
  passMark,
  jobOfferRequired,
}: {
  timelineMonths?: number;
  timelineLabel?: string;
  passMark?: number;
  jobOfferRequired?: boolean;
}) {
  // Build the cards list with icon + accent color + optional hint
  const items = [
    passMark != null
      ? {
          key: "pass-mark",
          label: "Pass mark",
          value: `${passMark} points`,
          Icon: Target,
          accent: "from-emerald-500/15 to-emerald-500/5",
          hint: "Minimum to be eligible; recent invitation cut-offs can be higher by occupation.",
        }
      : null,
    timelineMonths != null
      ? {
          key: "timeline",
          label: "Typical timeline",
          value: formatTimelineLong(timelineMonths, timelineLabel),
          Icon: Timer,
          accent: "from-sky-500/15 to-sky-500/5",
          hint: "Indicative end-to-end processing; varies by case.",
        }
      : null,
    jobOfferRequired != null
      ? {
          key: "job-offer",
          label: "Job offer",
          value: jobOfferRequired ? "Required" : "Not required",
          Icon: Briefcase,
          accent: jobOfferRequired
            ? "from-amber-500/15 to-amber-500/5"
            : "from-emerald-500/15 to-emerald-500/5",
          badge: jobOfferRequired ? { text: "Requirement", tone: "amber" } : { text: "Independent", tone: "emerald" },
          hint: jobOfferRequired
            ? "A qualifying offer is needed for this route."
            : "No employer sponsorship is needed.",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    value: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    accent: string;
    hint?: string;
    badge?: { text: string; tone: "emerald" | "amber" };
  }>;

  if (!items.length) return null;

  // Responsive column count based on how many items we actually have
  const gridCols =
    items.length === 1 ? "sm:grid-cols-1" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <section aria-label="Quick facts" className="relative overflow-hidden">
      {/* subtle gradient sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5" />
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {items.map(({ key, label, value, Icon, accent, badge, hint }) => (
          <article
            key={key}
            className="group relative isolate overflow-hidden rounded-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-gradient-to-br"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} aria-hidden="true" />
            <div className="relative flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-neutral-900/60 ring-1 ring-neutral-200/70 dark:ring-neutral-800/70">
                <Icon className="h-5 w-5 opacity-80" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                    {label}
                  </h3>
                  {badge ? (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ring-1 ${
                        badge.tone === "emerald"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30"
                      }`}
                    >
                      {badge.text}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-lg font-semibold leading-6 text-neutral-900 dark:text-white">
                  {value}
                </p>
                {hint ? (
                  <p className="mt-1 text-[12px] leading-5 text-neutral-600/80 dark:text-neutral-300/80" title={hint}>
                    {hint}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function ProgramPage(
  props: { params: Promise<{ country: string; program: string }> }
) {
  const params = await props.params;

  try {
    const { meta, sections } = await loadProgramPageSections(params.country, params.program);

    const videoSrc = (meta as any).heroVideo as string | undefined;
    const poster = (meta as any).heroPoster as string | undefined;
    const heroImage = (meta as any).heroImage as string | undefined;
    const brochure =
      ((meta as any).brochure as string | undefined) ??
      `/brochures/skilled/${params.country}/${params.program}.pdf`;

    const processSteps: any[] = (meta as any).processSteps ?? [];
    const disqualifiers: string[] = (meta as any).disqualifiers ?? [];

    // Skilled features
    const jobOffer = {
      required: (meta as any).jobOfferRequired as boolean | undefined,
      note: (meta as any).jobOfferNote as string | undefined,
      ...((meta as any).jobOffer ?? {}),
    };
    const pointsGrid = (meta as any).pointsGrid;
    const passMark = (meta as any).points?.max as number | undefined;

    // Normalize LanguageRequirements prop
    const langMin = (meta as any).languageRequirements ?? (meta as any).languageMin;
    const languageReq =
      langMin
        ? ({
            tests:
              Array.isArray(langMin.tests)
                ? langMin.tests
                : langMin.test
                ? [langMin.test]
                : undefined,
            minLevel:
              langMin.minLevel ??
              (typeof langMin.overall === "number"
                ? langMin.overall >= 7
                  ? "Proficient"
                  : "Competent"
                : undefined),
          } as any)
        : undefined;

    const occupations = (meta as any).occupationLists;

    // Extra rich sections from MDX
    const quickCheck = (meta as any).quickCheck as any | undefined;
    const documentChecklist =
      (meta as any).documentChecklist as { group: string; documents: string[]; notes?: string }[] | undefined;
    const familyMatrix =
      (meta as any).familyMatrix as
        | { childrenUpTo?: number; parentsFromAge?: number; siblings?: boolean; spouse?: boolean }
        | undefined;
    const governmentFees =
      (meta as any).governmentFees as {
        label: string;
        amount?: number;
        currency?: string;
        sourceLabel?: string;
        sourceUrl?: string;
      }[] | undefined;

    const otherProgramsRaw = await getSkilledPrograms(params.country);
    const otherPrograms = (otherProgramsRaw as any[])
      .map((p) => ({ ...p, programSlug: p.programSlug ?? p.slug }))
      .filter((p) => p.programSlug !== params.program);

    // Related (cross-country too)
    const allCountrySlugs = await getSkilledCountrySlugs();
    const candidateTasks: Promise<RelatedItem | null>[] = [];
    for (const ctry of allCountrySlugs) {
      const progs = await getSkilledPrograms(ctry);
      for (const p of progs as any[]) {
        const progSlug = p.programSlug ?? p.slug;
        if (!progSlug) continue;
        if (ctry === params.country && progSlug === params.program) continue;
        candidateTasks.push(
          (async () => {
            try {
              const { meta: candMeta } = await loadProgramPageSections(ctry, progSlug);
              const candTitle =
                (candMeta as any).title ?? (candMeta as any).name ?? progSlug;
              const score = similarityScore(
                { title: (meta as any).title ?? params.program, tags: (meta as any).tags },
                { title: candTitle, tags: (candMeta as any).tags },
              );
              if (score <= 0) return null;
              return {
                url: `${baseFromCategory("skilled")}/${ctry}/${progSlug}`,
                title: candTitle as string,
                country: (candMeta as any).country ?? ctry,
                minInvestment: (candMeta as any).minInvestment as number | undefined,
                currency: (candMeta as any).currency as string | undefined,
                timelineMonths: (candMeta as any).timelineMonths as number | undefined,
                timelineLabel: (candMeta as any).timelineLabel as string | undefined,
                tags: ((candMeta as any).tags ?? []) as string[],
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
    const relatedRaw = (await Promise.all(candidateTasks)).filter(Boolean) as RelatedItem[];
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

    // MDX sections
    const overviewKey = pickSectionKey(sections, ["overview"]);
    const compKey = pickSectionKey(sections, [
      "salary-overview",
      // intentionally DO NOT include "investment-overview" for skilled pages
      "package-overview",
    ]);
    const comparisonKey = pickSectionKey(sections, [
      "comparison",
      "alternatives",
      "comparison-with-provincial-entrepreneur-programs",
    ]);

    const countryKey = toSlug((meta as any).country ?? params.country);
    const whyCountryKey = pickSectionKey(sections, [
      `why-${countryKey}`,
      "why-country",
    ]);

    // Presence flags (no costs/proof-of-funds in skilled)
    const hasRequirements = !!(meta as any).requirements?.length;
    const hasBenefits = !!(meta as any).benefits?.length;
    const hasProcess = processSteps.length > 0;
    const hasFAQ = !!(meta as any).faq?.length;
    const hasRelated = relatedPrograms.length > 0;
    const hasGovFees = !!governmentFees?.length;

    const hasPoints = !!pointsGrid?.length || !!passMark;
    const hasLanguage = !!languageReq;
    const hasOccupations = !!(Array.isArray(occupations) ? occupations.length : occupations);
    const hasQuickCheck = !!quickCheck?.questions?.length;
    const hasDocs = !!documentChecklist?.length;
    const hasDeps = !!familyMatrix;

    // QuickNav: mirrors on-page order (no Prices / Investment, and NO Insights)
    const sectionsForNav: { id: string; label: string }[] = [
      { id: "quick-facts", label: "Quick facts" },
      ...(hasPoints ? [{ id: "points", label: "Points grid" }] : []),
      ...(hasLanguage ? [{ id: "language", label: "Language" }] : []),
      ...(hasOccupations ? [{ id: "occupations", label: "Occupations" }] : []),
      ...(overviewKey && sections[overviewKey] ? [{ id: "overview", label: "Overview" }] : []),
      ...(compKey && sections[compKey] ? [{ id: "salary", label: "Salary overview" }] : []),
      ...(hasGovFees ? [{ id: "gov-fees", label: "Government fees" }] : []),
      ...(hasRequirements ? [{ id: "requirements", label: "Eligibility" }] : []),
      ...(hasBenefits ? [{ id: "benefits", label: "Benefits" }] : []),
      ...(hasDocs ? [{ id: "documents", label: "Documents" }] : []),
      ...(hasDeps ? [{ id: "dependents", label: "Dependents" }] : []),
      ...(hasProcess ? [{ id: "process", label: "Process" }] : []),
      ...(comparisonKey && sections[comparisonKey] ? [{ id: "comparison", label: "Comparison" }] : []),
      ...(whyCountryKey && sections[whyCountryKey]
        ? [{ id: "why-country", label: `Why ${(meta as any).country ?? params.country}` }]
        : []),
      ...(disqualifiers.length ? [{ id: "not-a-fit", label: "Not a fit?" }] : []),
      ...(hasFAQ ? [{ id: "faq", label: "FAQ" }] : []),
      ...(hasRelated ? [{ id: "related", label: "Related" }] : []),
    ];

    // JSON-LD (HowTo only; no AggregateOffer for skilled pages)
    const howToLdData =
      processSteps.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `${(meta as any).title ?? params.program} Application Process`,
            description: (meta as any).seo?.description ?? (meta as any).tagline,
            step: processSteps.map((step: any, index: number) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: step.title,
              text: step.description,
            })),
          }
        : null;

    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: (meta as any).title ?? params.program,
      url: `https://yourdomain.com${baseFromCategory("skilled")}/${params.country}/${params.program}`,
      mainEntity: howToLdData ? { "@id": "#application-howto" } : undefined,
    };

    return (
      <main
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-black dark:text-white"
        style={{ scrollBehavior: "smooth" } as React.CSSProperties}
      >
        {/* JSON-LD */}
        <JsonLd
          data={breadcrumbLd([
            { name: "Skilled", url: baseFromCategory("skilled") },
            {
              name: (meta as any).country ?? params.country,
              url: `${baseFromCategory("skilled")}/${params.country}`,
            },
            {
              name: (meta as any).title ?? params.program,
              url: `${baseFromCategory("skilled")}/${params.country}/${params.program}`,
            },
          ])}
        />
        {(meta as any).faq?.length ? <JsonLd data={faqLd((meta as any).faq)!} /> : null}
        {howToLdData ? <JsonLd data={{ ...howToLdData, "@id": "#application-howto" }} /> : null}
        <JsonLd data={webPageLd} />

        {/* HERO */}
        <div className="pt-4 pb-4">
          <div className="rounded-3xl bg-white/80 dark:bg-dark_bg/80 shadow-lg backdrop-blur">
            <MediaHero
              title={(meta as any).title ?? params.program}
              subtitle={(meta as any).tagline}
              videoSrc={videoSrc}
              poster={poster}
              imageSrc={heroImage}
              actions={[
                {
                  href: `/skilled/eligibility-check`,
                  label: "Check Eligibility",
                  variant: "primary",
                },
                {
                  href: brochure,
                  label: "Download Brochure",
                  variant: "primary",
                  download: true,
                },
                {
                  href: "/contact",
                  label: "Book a Free Consultation",
                  variant: "ghost",
                },
              ]}
            />
          </div>
          <Breadcrumb />
        </div>

        {/* Quick Check — mobile near top, desktop in sidebar */}
        {hasQuickCheck ? (
          <section
            id="quick-check-mobile"
            className="sm:hidden scroll-mt-28 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60 p-4"
          >
            <EligibilityQuickCheck config={quickCheck} />
          </section>
        ) : null}

        {/* In-page Quick Nav */}
        <ProgramQuickNav sections={sectionsForNav} />

        {/* BODY */}
        <div className="flex flex-col gap-8 pt-5 pb-16 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* MAIN */}
          <div className="order-2 lg:order-1 lg:col-span-8 xl:col-span-8 space-y-10">
            {/* Quick facts (top on mobile too) */}
            <section id="quick-facts" className="scroll-mt-28">
              <SkilledFacts
                timelineMonths={(meta as any).timelineMonths}
                timelineLabel={(meta as any).timelineLabel}
                passMark={passMark}
                jobOfferRequired={jobOffer.required}
              />
            </section>

            {/* Points grid — keep near top, right after Quick facts */}
            {hasPoints ? (
              <section id="points" className="scroll-mt-28">
                <PointsGridTable grid={pointsGrid as any} threshold={passMark} />
              </section>
            ) : null}

            {/* Language */}
            {hasLanguage ? (
              <section id="language" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Language requirements</h2>
                </header>
                <LanguageRequirements language={languageReq as any} />
              </section>
            ) : null}

            {/* Occupation lists */}
            {hasOccupations ? (
              <section id="occupations" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Occupation lists</h2>
                </header>
                <OccupationLists lists={occupations as any} />
              </section>
            ) : null}

            {/* Overview (MDX) */}
            {overviewKey && sections[overviewKey] ? (
              <section id="overview" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Program overview</h2>
                </header>
                <Prose>{sections[overviewKey]}</Prose>
              </section>
            ) : null}

            {/* Salary overview (NOT "Investment") */}
            {compKey && sections[compKey] ? (
              <section id="salary" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Salary overview</h2>
                </header>
                <Prose>{sections[compKey]}</Prose>
              </section>
            ) : null}

            {/* Government fees (if provided) */}
            {hasGovFees ? (
              <section id="gov-fees" className="scroll-mt-28">
                <GovernmentFees
                  fees={governmentFees}
                  defaultCurrency={(meta as any).currency || "AUD"}
                />
              </section>
            ) : null}

            {/* Eligibility + Benefits */}
            {(hasRequirements || hasBenefits) && (
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
            )}

            {/* Documents & Dependents */}
            {hasDocs ? (
              <section id="documents" className="scroll-mt-28">
                <DocumentChecklist
                  groups={documentChecklist}
                  note="Documents vary by profile; we’ll tailor your list."
                />
              </section>
            ) : null}
            {hasDeps ? (
              <section id="dependents" className="scroll-mt-28">
                <FamilyMatrix {...familyMatrix!} />
              </section>
            ) : null}

            {/* Process */}
            {hasProcess ? (
              <section id="process" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Application process</h2>
                </header>
                <ProcessTimeline steps={processSteps} />
              </section>
            ) : null}

            {/* Comparison */}
            {comparisonKey && sections[comparisonKey] ? (
              <section id="comparison" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Comparison</h2>
                </header>
                <Prose>{sections[comparisonKey]}</Prose>
              </section>
            ) : null}

            {/* Why country */}
            {whyCountryKey && sections[whyCountryKey] ? (
              <section id="why-country" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">
                    Why {(meta as any).country ?? params.country}
                  </h2>
                </header>
                <Prose>{sections[whyCountryKey]}</Prose>
              </section>
            ) : null}

            {/* Not a fit */}
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
                  <Link
                    href={`${baseFromCategory("skilled")}/${params.country}`}
                    className="underline"
                  >
                    other programs in {(meta as any).country ?? params.country}
                  </Link>
                  .
                </p>
              </section>
            ) : null}

            {/* Related programs */}
            {hasRelated ? (
              <section id="related" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Related programs</h2>
                </header>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedPrograms.map((r) => (
                    <Link
                      key={r.url}
                      href={r.url}
                      className="group rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden hover:shadow-md bg-white/70 dark:bg-neutral-900/40"
                    >
                      <div
                        className="h-32 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${r.heroImage ?? "/xiphias-immigration.png"})` }}
                        aria-hidden="true"
                      />
                      <div className="p-4">
                        <div className="text-sm opacity-70">{r.country}</div>
                        <div className="font-semibold group-hover:underline">{r.title}</div>
                        {typeof r.timelineMonths === "number" ? (
                          <div className="text-xs mt-1 opacity-70">
                            {formatTimelineLong(r.timelineMonths, r.timelineLabel)}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* FAQ */}
            {(meta as any).faq?.length ? (
              <section id="faq" className="scroll-mt-28">
                <header className="mb-3">
                  <h2 className="text-xl font-semibold">Frequently asked questions</h2>
                </header>
                <FAQAccordion faqs={(meta as any).faq} />
              </section>
            ) : null}

            {/* Testimonials & Our Offer */}
            <section id="testimonials" className="scroll-mt-28">
              <TestimonialCarousel
                items={
                  (meta as any).testimonials ?? [
                    { quote: "Seamless employer-sponsor coordination and PR plan.", author: "Tech Lead, Toronto" },
                    { quote: "Crystal-clear on points and language strategy.", author: "Data Scientist, Sydney" },
                  ]
                }
              />
            </section>
            <section id="our-offer" className="scroll-mt-28">
              <Overoffer />
            </section>

            <div className="sm:hidden h-24" aria-hidden="true" />
          </div>

          {/* SIDEBAR */}
          <aside className="order-1 lg:order-2 lg:col-span-4 xl:col-span-4 space-y-6 self-start lg:sticky lg:top-24">
            {hasQuickCheck ? (
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
    // Keep a single concise error; page will 404
    console.error("[Skilled ProgramPage] load error", e);
    notFound();
  }
}
