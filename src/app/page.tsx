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
import ImmigrationConsultantsOverview from "@/components/Home/ImmigrationConsultantsOverview";
import { JsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Best Immigration Consultants in India | XIPHIAS",
  description:
    "Immigration consultants in India for Canada PR, US EB-5, skilled migration, investment residency, citizenship and corporate mobility. Serving clients since 2009.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Best Immigration Consultants in India | XIPHIAS",
    description:
      "Immigration consultants for Canada PR, US EB-5, skilled migration, investment residency, citizenship and corporate mobility.",
    url: "https://www.xiphiasimmigration.com",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Immigration Consultants in India | XIPHIAS",
    description:
      "Immigration consultants for Canada PR, US EB-5, skilled migration, investment residency, citizenship and corporate mobility.",
    images: ["/xiphias-immigration.png"],
  },
};

export default function Home() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.xiphiasimmigration.com/#webpage",
        url: "https://www.xiphiasimmigration.com",
        name: "Best Immigration Consultants in India | XIPHIAS",
        description:
          "Immigration consultants in India for skilled migration, residency, citizenship, investment and corporate mobility.",
        isPartOf: { "@id": "https://www.xiphiasimmigration.com/#website" },
        about: { "@id": "https://www.xiphiasimmigration.com/#organization" },
        inLanguage: "en-IN",
      },
      {
        "@type": "Service",
        "@id": "https://www.xiphiasimmigration.com/#immigration-consulting",
        name: "Immigration consulting services in India",
        serviceType: "Immigration consulting and global mobility advisory",
        provider: { "@id": "https://www.xiphiasimmigration.com/#organization" },
        areaServed: { "@type": "Country", name: "India" },
        audience: [
          { "@type": "Audience", audienceType: "Skilled professionals" },
          { "@type": "Audience", audienceType: "Investors and families" },
          { "@type": "Audience", audienceType: "Employers and global mobility teams" },
        ],
        url: "https://www.xiphiasimmigration.com",
      },
    ],
  };

  return (
    <>
      <JsonLd id="home-service-jsonld" data={homeJsonLd} />
      <Hero />
      <ImmigrationConsultantsOverview />
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
