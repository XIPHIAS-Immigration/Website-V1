import React from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

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
const XiaSection = dynamic(() => import("@/components/Home/XiaSection"));

// Defers hydration/JS of below-the-fold sections until they near the viewport.
import DeferOnView from "@/components/util/DeferOnView";

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
      {/* min-heights match measured mobile section heights so deferred mounting
          doesn't shift layout (keeps CLS ~0). */}
      <DeferOnView minHeight="1330px"><WhyChooseUs /></DeferOnView>
      <DeferOnView minHeight="1600px"><CitizenshipPreview /></DeferOnView>
      <DeferOnView minHeight="1560px"><ResidencyPreview /></DeferOnView>
      <DeferOnView minHeight="1545px"><CorporatePreview /></DeferOnView>
      <DeferOnView minHeight="1585px"><SkilledPreview /></DeferOnView>
      <DeferOnView minHeight="720px"><XiaSection /></DeferOnView>
      <DeferOnView minHeight="815px"><FAQJourney /></DeferOnView>

      <DeferOnView minHeight="1010px">
        <section className="scroll-mt-28 mx-auto lg:max-w-screen-2xl sm:px-6 lg:px-4">
          <AdvisorConsultationCard bookingHref="/booking?plan=paid" />
        </section>
      </DeferOnView>

      <DeferOnView minHeight="1230px"><InsightsPreview /></DeferOnView>
    </>
  );
}
