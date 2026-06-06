// src/app/(site)/skilled/page.tsx
import type { Metadata } from "next";
import {
  getSkilledCountries,
  getSkilledPrograms,
  type ProgramMeta,
  type CountryMeta,
} from "@/lib/skilled-content";

import nextDynamic from "next/dynamic";

const SkilledHero = nextDynamic(() => import("@/components/Skilled/SkilledHero"));
const SkilledOffer = nextDynamic(() => import("@/components/Skilled/Overoffer"));
const SkilledTestimonialCarousel = nextDynamic(() => import("@/components/Skilled/TestimonialCarousel"));
const InsightsPreview = nextDynamic(() => import("@/components/Insights/InsightsPreview"));
import { JsonLd } from "@/lib/seo";
// ✅ normal import (the component itself is "use client")
const SkilledExploreGrid = nextDynamic(() => import("@/components/Skilled/SkilledExploreGrid"));

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Skilled Migration & Work Permits – Countries & Options",
  description:
    "Explore skilled migration routes by country: points-tested PR, employer sponsorships, and talent visas. Compare timelines, eligibility and costs.",
  alternates: { canonical: "/skilled" },
  openGraph: {
    title: "Skilled Migration & Work Permits – Countries & Options",
    description:
      "Explore skilled migration routes by country: points-tested PR, employer sponsorships, and talent visas. Compare timelines, eligibility and costs.",
    url: "https://www.xiphiasimmigration.com/skilled",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Skilled Migration & Work Permits – Countries & Options – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skilled Migration & Work Permits – Countries & Options",
    description:
      "Explore skilled migration routes by country: points-tested PR, employer sponsorships, and talent visas. Compare timelines, eligibility and costs.",
    images: ["/xiphias-immigration.png"],
  },
};

/** Server ranker for JSON-LD only (same logic as citizenship) */
function pickTopProgramsForLd(all: ProgramMeta[], n = 5): ProgramMeta[] {
  const key = (x: ProgramMeta) =>
    `${x?.title ?? ""} ${x?.country ?? ""}`.trim();

  const ranked = [...all].sort((a, b) => {
    const tA = a.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    const tB = b.timelineMonths ?? Number.MAX_SAFE_INTEGER;
    if (tA !== tB) return tA - tB;

    const iA = a.minInvestment ?? Number.MAX_SAFE_INTEGER;
    const iB = b.minInvestment ?? Number.MAX_SAFE_INTEGER;
    if (iA !== iB) return iA - iB;

    // 👇 use a fixed locale to avoid SSR/CSR differences
    return key(a).localeCompare(key(b), "en", { sensitivity: "base" });
  });

  return ranked.slice(0, n);
}

export default function SkilledPage() {
  const countries: CountryMeta[] = getSkilledCountries();
  const programs: ProgramMeta[] = getSkilledPrograms();
  const top5 = pickTopProgramsForLd(programs, 5);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Skilled Migration & Work Permits – Countries & Options",
    url: "https://yourdomain.com/skilled",
    description:
      "Explore skilled migration routes by country: points-tested PR, employer sponsorships, and talent visas. Compare timelines, eligibility and costs.",
  };
  const countryListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Skilled Migration Countries",
    itemListElement: countries.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://yourdomain.com/skilled/${c.countrySlug}`,
      name: c.title || c.country,
    })),
  };
  const topProgramsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Skilled Programs",
    itemListElement: top5.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://yourdomain.com/skilled/${p.countrySlug}/${p.programSlug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <JsonLd data={webPageLd} />
      <JsonLd data={countryListLd} />
      <JsonLd data={topProgramsLd} />

      <main className="max-w-screen-2xl mx-auto px-4 py-10 text-black dark:text-white">
        <SkilledHero className="mb-6" />
        <SkilledExploreGrid countries={countries} programs={programs} />
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
      </main>

      <InsightsPreview limit={6} />
    </>
  );
}