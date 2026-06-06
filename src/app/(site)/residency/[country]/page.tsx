import type { Metadata } from "next";
import {
  getResidencyCountrySlugs,
  getResidencyPrograms,
  loadCountryPage,
  getCountryFrontmatter,
  getResidencyCountries,
} from "@/lib/residency-content";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
// Dynamically import heavy UI sections.  Splitting these into separate
// chunks reduces initial JS payload and improves Lighthouse performance.
import nextDynamic from "next/dynamic";

const MediaHero = nextDynamic(() => import("@/components/Residency/MediaHero"));
const ContactForm = nextDynamic(() => import("@/components/ContactForm"));
const Breadcrumb = nextDynamic(() => import("@/components/Common/Breadcrumb"));

/* New modular sections */
const SidebarStatsPanel = nextDynamic(
  () => import("@/components/Residency/Country/SidebarStatsPanel"),
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

// Only include what you actually need. Examples:
export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

/** SSG params */
export async function generateStaticParams() {
  return getResidencyCountrySlugs().map((slug) => ({ country: slug }));
}

/** SEO */
export async function generateMetadata(props: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const meta = getCountryFrontmatter(params.country);
  const heroImage = (meta as any).heroImage as string | undefined;
  const title = (meta as any).seo?.title ?? meta.title;
  const description = (meta as any).seo?.description ?? meta.summary;
  const keywords = (meta as any).seo?.keywords as string[] | undefined;

  // Build canonical and absolute URLs for SEO.  Using the full domain in
  // openGraph.url helps search engines and social platforms generate rich
  // previews.
  const canonicalPath = `/residency/${params.country}`;
  const absoluteUrl = `https://www.xiphiasimmigration.com${canonicalPath}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      type: "website",
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
}

/** Page */
export default async function CountryPage(props: {
  params: Promise<{ country: string }>;
}) {
  const params = await props.params;
  const { meta, content } = await loadCountryPage(params.country);
  const programs = getResidencyPrograms(params.country);

  // Brochure URL (country-level)
  // 1) Prefer `brochure` from _country.mdx frontmatter if present
  // 2) Fallback: a conventional PDF path for this country
  const brochure =
    ((meta as any).brochure as string | undefined) ??
    `/brochures/residency/${params.country}.pdf`;

  // Hero media
  const videoSrc = (meta as any).heroVideo as string | undefined;
  const poster = (meta as any).heroPoster as string | undefined;
  const heroImage = (meta as any).heroImage as string | undefined;

  // Hero actions: Book Consultation + Download Brochure
  const heroActions: {
    href: string;
    label: string;
    variant?: "primary" | "ghost";
    download?: boolean;
  }[] = [
    {
      href: "/personal-booking",
      label: "Book Consultation",
      variant: "primary",
    },
    {
      href: brochure,
      label: "Download Brochure",
      variant: "ghost",
      download: true,
    },
  ];

  // Aggregates (ranges)
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

  // Optional fields from frontmatter
  const {
    overview,
    keyPoints,
    facts,
    applicationProcess,
    requirements,
    faq,
    introPoints,
  } = meta as any;

  // Related countries (simple: any other 2)
  const related = getResidencyCountries()
    .filter((c) => c.countrySlug !== params.country)
    .slice(0, 2);

  return (
    <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-2 text-black">
      <h1 className="sr-only">Residency in {meta.country}</h1>

      <JsonLd
        data={breadcrumbLd([
          { name: "Residency", url: "/residency" },
          { name: meta.country, url: `/residency/${params.country}` },
        ])}
      />

      {/* HERO */}
      <section className="pt-4">
        <MediaHero
          title={meta.title}
          subtitle={meta.summary}
          videoSrc={videoSrc}
          poster={poster}
          imageSrc={heroImage}
          actions={heroActions}
        />
      </section>

      <div className="mt-3">
        <Breadcrumb />
      </div>

      {/* LAYOUT */}
      <div className="mt-6 grid gap-8 md:grid-cols-12">
        {/* Sidebar */}
        <aside className="md:col-span-4 space-y-6">
          <SidebarStatsPanel
            programsCount={programs.length}
            investRange={minInvestmentRange}
            timelineRange={timelineRange}
          />
          <SidebarProgramsList country={meta.country} programs={programs} />
          <SidebarHighlights points={introPoints} />
          <div className="hidden md:block">
            <ContactForm />
          </div>
        </aside>

        {/* Main content */}
        <div className="md:col-span-8 space-y-8">
          <AboutCountrySection country={meta.country} overview={overview} facts={facts} />
          <WhyCountrySection country={meta.country} points={keyPoints} />
          <ProcessSteps steps={applicationProcess} />
          <EligibilityRequirements items={requirements} />
          <FAQSection faqs={faq} />
          <MDXDetailsSection country={meta.country} content={content} />
          <div className="md:hidden">
            <ContactForm />
          </div>
        </div>
      </div>

      <RelatedCountriesSection related={related} />
    </main>
  );
}