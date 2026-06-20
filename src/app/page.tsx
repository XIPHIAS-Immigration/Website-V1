import React from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Server components (read the programme catalogue) — static imports.
import GlobeScene from "@/components/Home/GlobeScene";
import ProgrammesChapter from "@/components/Home/ProgrammesChapter";
import CountriesChapter from "@/components/Home/CountriesChapter";
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

      {/* Chapter 3 — browse by programme (pathway-first) */}
      <ProgrammesChapter />

      {/* Chapter 4 — browse by country (destination-first) */}
      <CountriesChapter />

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
