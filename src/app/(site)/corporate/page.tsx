import type { Metadata } from "next";
import {
  getCorporateCountries,
  getCorporatePrograms,
  type ProgramMeta,
  type CountryMeta,
} from "@/lib/corporate-content";

import dynamic from "next/dynamic";
const CorporateHero = dynamic(() => import("@/components/Corporate/CorporateHero"));
const SkilledOffer = dynamic(() => import("@/components/Skilled/Overoffer"));
const SkilledTestimonialCarousel = dynamic(() => import("@/components/Skilled/TestimonialCarousel"));
const InsightsPreview = dynamic(() => import("@/components/Insights/InsightsPreview"));
const CorporateExploreGrid = dynamic(() => import("@/components/Corporate/CorporateExploreGrid"));
import { JsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Corporate Setup & Employment Visas — Countries & Options",
  description:
    "Explore corporate setup and employment visa options by country, including free zone & mainland company formation, investor visas, and work permits",
  alternates: { canonical: "/corporate" },
  openGraph: {
    title: "Corporate Setup & Employment Visas — Countries & Options",
    description:
      "Explore corporate setup and employment visa options by country, including free zone & mainland company formation, investor visas, and work permits",
    url: "https://www.xiphiasimmigration.com/corporate",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [{ url: "/xiphias-immigration.png", width: 1200, height: 630, alt: "Corporate Setup & Employment Visas – XIPHIAS Immigration" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Setup & Employment Visas — Countries & Options",
    description:
      "Explore corporate routes by country: free zone & mainland company formation, investor/entrepreneur options, employment/work permits, and residence sponsorship. Compare timelines, eligibility, and fees.",
    images: ["/xiphias-immigration.png"],
  },
};

/** Server ranker for JSON-LD only */
function pickTopProgramsForLd(all: ProgramMeta[], n = 5): ProgramMeta[] {
  const key = (x: ProgramMeta) => `${x?.title ?? ""} ${x?.country ?? ""}`.trim();
  const ranked = [...all].sort((a, b) => {
    const tA = a.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    const tB = b.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    if (tA !== tB) return tA - tB;
    const iA = a.minInvestment ?? Number.MAX_SAFE_INTEGER;
    const iB = b.minInvestment ?? Number.MAX_SAFE_INTEGER;
    if (iA !== iB) return iA - iB;
    return key(a).localeCompare(key(b), "en", { sensitivity: "base" });
  });
  return ranked.slice(0, n);
}

export default function CorporatePage() {
  const countries: CountryMeta[] = getCorporateCountries();
  const programs: ProgramMeta[] = getCorporatePrograms();
  const top5 = pickTopProgramsForLd(programs, 5);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Corporate Setup & Employment Visas — Countries & Options",
    url: "https://www.xiphiasimmigration.com/corporate",
    description:
      "Explore corporate routes by country: free zone & mainland company formation, investor/entrepreneur options, employment/work permits, and residence sponsorship. Compare timelines, eligibility, and fees.",
  };
  const countryListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Corporate Countries",
    itemListElement: countries.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://www.xiphiasimmigration.com/corporate/${c.countrySlug}`,
      name: c.title || c.country,
    })),
  };
  const topProgramsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Corporate Programs",
    itemListElement: top5.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://www.xiphiasimmigration.com/corporate/${p.countrySlug}/${p.programSlug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <JsonLd data={webPageLd} />
      <JsonLd data={countryListLd} />
      <JsonLd data={topProgramsLd} />

      <main className="max-w-screen-2xl mx-auto px-4 py-10 text-black dark:text-white">
        <CorporateHero className="mb-6" />
        <CorporateExploreGrid countries={countries} programs={programs} />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <SkilledOffer className="lg:col-span-2" />
          <SkilledTestimonialCarousel
            items={[
              { quote: "Fast, clear, and accurate guidance on skilled visas.", author: "Software Lead, Berlin" },
              { quote: "They mapped out the best route and handled everything.", author: "Data Scientist, Dubai" },
              { quote: "Transparent timelines and realistic eligibility advice.", author: "Product Manager, Singapore" },
            ]}
          />
        </div>

        <div className="mt-10">
          <InsightsPreview limit={6} />
        </div>
      </main>
    </>
  );
}