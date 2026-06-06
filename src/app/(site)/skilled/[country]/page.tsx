// src/app/(site)/skilled/[country]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSkilledCountrySlugs,
  getSkilledCountries,
  getSkilledPrograms,
  loadCountryPage,
} from "@/lib/skilled-content";
import { baseFromCategory } from "@/lib/section-helpers";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

import nextDynamic from "next/dynamic";
const MediaHero = nextDynamic(() => import("@/components/Residency/MediaHero"));
const ContactForm = nextDynamic(() => import("@/components/ContactForm"));
const Breadcrumb = nextDynamic(() => import("@/components/Common/Breadcrumb"));
const SidebarStatsPanel = nextDynamic(
  () => import("@/components/Skilled/SidebarStatsPanel"),
);
const SidebarProgramsList = nextDynamic(
  () => import("@/components/Residency/Country/SidebarProgramsList"),
);
const SidebarHighlights = nextDynamic(
  () => import("@/components/Residency/Country/SidebarHighlights"),
);
const AboutCountrySection = nextDynamic(
  () => import("@/components/Residency/Country/AboutCountrySection"),
);
const WhyCountrySection = nextDynamic(
  () => import("@/components/Residency/Country/WhyCountrySection"),
);
const ProcessSteps = nextDynamic(
  () => import("@/components/Residency/Country/ProcessSteps"),
);
const EligibilityRequirements = nextDynamic(
  () => import("@/components/Residency/Country/EligibilityRequirements"),
);
const FAQSection = nextDynamic(
  () => import("@/components/Residency/Country/FAQSection"),
);
const MDXDetailsSection = nextDynamic(
  () => import("@/components/Residency/Country/MDXDetailsSection"),
);
const RelatedCountriesSection = nextDynamic(
  () => import("@/components/Residency/Country/RelatedCountriesSection"),
);

export const runtime = "nodejs";
export const revalidate = 86400;

/** SSG params */
export async function generateStaticParams() {
  const slugs = getSkilledCountrySlugs();
  return slugs.map((country) => ({ country }));
}

/** SEO */
export async function generateMetadata(
  props: { params: Promise<{ country: string }> },
): Promise<Metadata> {
  const { country } = await props.params;
  const all = getSkilledCountrySlugs();
  if (!all.includes(country)) return { title: "Skilled country not found" };

  const { meta } = await loadCountryPage(country);

  const heroImage = (meta as any).heroImage as string | undefined;
  const title =
    (meta as any).seo?.title ??
    (meta as any).metaTitle ??
    (meta as any).title ??
    (meta as any).name ??
    `${country} — Skilled Migration`;

  const description =
    (meta as any).seo?.description ??
    (meta as any).metaDescription ??
    (meta as any).summary ??
    (meta as any).description ??
    `Skilled migration programs in ${(meta as any).name ?? country}.`;

  const keywords =
    ((meta as any).seo?.keywords as string[] | undefined) ??
    ((meta as any).keywords as string[] | undefined);

  const canonicalPath = `${baseFromCategory("skilled")}/${country}`;
  const canonicalUrl = `https://www.xiphiasimmigration.com${canonicalPath}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: heroImage ?? "/xiphias-immigration.png",
          width: 1200,
          height: 630,
          alt: `${title} – XIPHIAS`,
        },
      ],
    },
  };
}

export default async function CountryPage(props: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await props.params;
  const slugs = getSkilledCountrySlugs();
  if (!slugs.includes(country)) notFound();

  const { meta, content } = await loadCountryPage(country);
  const programs = getSkilledPrograms(country);
  const countryName = (meta as any).country ?? (meta as any).name ?? country;

  const minInvestments = programs
    .map((p) => p.minInvestment)
    .filter((n): n is number => typeof n === "number");
  const timelines = programs
    .map((p) => p.timelineMonths)
    .filter((n): n is number => typeof n === "number");

  const minInvestmentRange =
    minInvestments.length && programs[0]?.currency
      ? `${Math.min(...minInvestments).toLocaleString()}–${Math.max(
          ...minInvestments,
        ).toLocaleString()} ${programs[0].currency}`
      : "Varies";

  const timelineRange = timelines.length
    ? `${Math.min(...timelines)}–${Math.max(...timelines)} months`
    : "Varies";

  const {
    overview,
    keyPoints,
    facts,
    applicationProcess,
    requirements,
    faq,
    introPoints,
  } = (meta as any) as Record<string, any>;

  const related = getSkilledCountries()
    .filter((c) => c.countrySlug !== country)
    .slice(0, 2);

  const videoSrc = (meta as any).heroVideo as string | undefined;
  const poster = (meta as any).heroPoster as string | undefined;
  const heroImage = (meta as any).heroImage as string | undefined;

  // Brochure URL (country-level)
  // 1) Prefer `brochure` from _country.mdx frontmatter if present
  // 2) Fallback: a conventional PDF path for this category/country
  const brochure =
    ((meta as any).brochure as string | undefined) ??
    `/brochures/skilled/${country}.pdf`;

  // Hero actions: Book Consultation + Download Brochure
  const heroActions: {
    href: string;
    label: string;
    variant?: "primary" | "ghost";
    download?: boolean;
  }[] = [
    { href: "/personal-booking", label: "Book Free Consultation", variant: "primary" },
    {
      href: brochure,
      label: "Download Brochure",
      variant: "ghost",
      download: true,
    },
  ];

  return (
    <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-2 text-black">
      <h1 className="sr-only">Skilled migration in {countryName}</h1>

      <JsonLd
        data={breadcrumbLd([
          { name: "Skilled", url: baseFromCategory("skilled") },
          { name: countryName, url: `${baseFromCategory("skilled")}/${country}` },
        ])}
      />

      <section className="pt-4">
        <MediaHero
          title={(meta as any).title ?? (meta as any).name ?? countryName}
          subtitle={(meta as any).summary ?? (meta as any).description}
          videoSrc={videoSrc}
          poster={poster}
          imageSrc={heroImage}
          actions={heroActions}
        />
      </section>

      <div className="mt-3">
        <Breadcrumb />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <aside className="md:col-span-4 space-y-6">
          <SidebarStatsPanel
            programsCount={programs.length}
            timelineRange={timelineRange}
          />
          <SidebarProgramsList country={countryName} programs={programs} />
          <SidebarHighlights points={introPoints} />
          <div className="hidden md:block">
            <ContactForm />
          </div>
        </aside>

        <div className="md:col-span-8 space-y-8">
          <AboutCountrySection
            country={countryName}
            overview={overview}
            facts={facts}
          />
          <WhyCountrySection country={countryName} points={keyPoints} />
          <ProcessSteps steps={applicationProcess} />
          <EligibilityRequirements items={requirements} />
          <FAQSection faqs={faq} />
          <MDXDetailsSection country={countryName} content={content} />
          <div className="md:hidden">
            <ContactForm />
          </div>
        </div>
      </div>

      <RelatedCountriesSection related={related} />
    </main>
  );
}