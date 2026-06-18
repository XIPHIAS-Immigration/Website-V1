import React from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Server components (read the programme catalogue) — static imports.
import GlobeScene from "@/components/Home/GlobeScene";
import VerticalChapter from "@/components/Home/VerticalChapter";
import Reveal from "@/components/motion/Reveal";

function SectionBreak() {
  return <div className="h-10 sm:h-16" aria-hidden="true" />;
}

// Hero + cinematic chapters (code-split).
const Hero = dynamic(() => import("@/components/Home/Hero"));
const TrustMarquee = dynamic(() => import("@/components/Home/TrustMarquee"));
const IntroChapter = dynamic(() => import("@/components/Home/IntroChapter"));
const XiaChapter = dynamic(() => import("@/components/Home/XiaChapter"));
const AdvisorChapter = dynamic(() => import("@/components/Home/AdvisorChapter"));
const StatsBand = dynamic(() => import("@/components/Home/StatsBand"));
const FAQJourney = dynamic(() => import("@/components/Home/FAQJourney"));
const InsightsPreview = dynamic(() => import("@/components/Insights/InsightsPreview"));

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Best Immigration Consultants in India - XIPHIAS Immigration",
  description:
    "Xiphias Immigration offers expert residency, citizenship, corporate, and skilled migration services worldwide with 17+ years of experience",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Best Immigration Consultants in India – XIPHIAS Immigration",
    description:
      "Leading consultants for residency, citizenship, and skilled migration. Build your global future with XIPHIAS",
    url: "https://www.xiphiasimmigration.com",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Immigration Consultants in India – XIPHIAS Immigration",
    description:
      "Build your global future with XIPHIAS Immigration — experts in residency, citizenship, and migration",
    images: ["/xiphias-immigration.png"],
  },
};

export default function Home() {
  return (
    <>
      {/* Chapter 0 — Hero photo (unchanged) */}
      <Hero />
      <TrustMarquee />

      {/* Chapter 1 — kinetic intro statement */}
      <IntroChapter />

      {/* Chapter 2 — interactive globe: hover a beacon → destination card */}
      <GlobeScene />

      {/* Chapters 4–7 — each vertical: full-screen, horizontal advancing destinations */}
      <VerticalChapter
        vertical="citizenship"
        eyebrow="Citizenship by Investment"
        title="A second passport, a safer future."
        blurb="Donation or real-estate routes to a powerful second citizenship — visa-free travel, security and a genuine plan B for your family."
        accent="#b8860b"
        hubLabel="View all citizenship"
        fallbackImage="/images/citizenship/grenada/grenada-citizenship.webp"
      />

      <VerticalChapter
        vertical="residency"
        eyebrow="Residency by Investment"
        title="Live, invest and belong."
        blurb="Golden visas and investor residence across Europe, the Gulf and Asia — a base to live, study and grow on your terms."
        accent="#0e7c66"
        hubLabel="View all residency"
        fallbackImage="/images/residency/portugal/portugal-golden-visa.webp"
        flip
      />

      <VerticalChapter
        vertical="corporate"
        eyebrow="Corporate Global Mobility"
        title="Move your talent across borders."
        blurb="Intra-company transfers, market entry and compliant workforce mobility for teams and founders — one accountable partner."
        accent="#7c3aed"
        hubLabel="View corporate mobility"
        fallbackImage="/images/corporate/singapore/singapore.webp"
      />

      <VerticalChapter
        vertical="skilled"
        eyebrow="Skilled Migration"
        title="Built for professionals."
        blurb="Points-based permanent residency and work visas for talent — Canada, Australia, Germany and the UK, mapped to your profile."
        accent="#2563eb"
        hubLabel="View skilled migration"
        fallbackImage="/images/skilled/canada/canada.webp"
        flip
      />

      {/* Chapter 8 — XIA Intelligence */}
      <XiaChapter />

      {/* Chapter 9 — senior advisor paid consultation */}
      <AdvisorChapter />

      {/* Proof + journey + insights */}
      <StatsBand />

      <Reveal amount={0.12}>
        <FAQJourney />
      </Reveal>
      <SectionBreak />

      <Reveal amount={0.12}>
        <InsightsPreview />
      </Reveal>
    </>
  );
}
