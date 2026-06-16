import React from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

function SectionBreak() {
  return <div className="h-10 sm:h-16" aria-hidden="true" />;
}

// Hero + all big home sections are code-split
const Hero = dynamic(() => import("@/components/Home/Hero"));
const WhyChooseUs = dynamic(() => import("@/components/Home/whychooseus"));
const FAQJourney = dynamic(() => import("@/components/Home/FAQJourney"));
const InsightsPreview = dynamic(
  () => import("@/components/Insights/InsightsPreview"),
);
const ResidencyPreview = dynamic(
  () => import("@/components/Residency/ResidencyPreview"),
);
const SkilledPreview = dynamic(
  () => import("@/components/Skilled/SkilledPreview"),
);
const CitizenshipPreview = dynamic(
  () => import("@/components/Citizenship/CitizenshipPreview"),
);
const XiaIntelligencePreview = dynamic(
  () => import("@/components/Home/XiaIntelligencePreview"),
);
const CorporatePreview = dynamic(
  () => import("@/components/Corporate/CorporatePreview"),
);
const AdvisorConsultationCard = dynamic(
  () => import("@/components/Citizenship/AdvisorConsultationCard"),
);

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
      <Hero />
      <WhyChooseUs />
      <XiaIntelligencePreview />
      <CitizenshipPreview />
      <SectionBreak />
      <ResidencyPreview />
      <SectionBreak />
      <CorporatePreview />
      <SectionBreak />
      <SkilledPreview />
      <SectionBreak />
      <section className="scroll-mt-28 bg-[#F5F7FA] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <AdvisorConsultationCard bookingHref="/booking?plan=paid" />
        </div>
      </section>
      <SectionBreak />
      <FAQJourney />
      <SectionBreak />
      <InsightsPreview />
    </>
  );
}
