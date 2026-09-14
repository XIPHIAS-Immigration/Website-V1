import type { Metadata } from "next";
import ConsultationBookingClient from "@/components/PersonalBooking/ConsultationBookingClient";
import {
  AdvisorProof,
  AdvisoryHero,
  consultationFaq,
} from "@/components/PersonalBooking/AdvisoryAuthority";
import { getProductConfig } from "@/lib/payments/product-catalog";
import {
  CONSULTATION_DURATION_MINUTES,
  CONSULTATION_PRODUCT_TYPE,
} from "@/lib/consultations/config";
import { credentials, firmFacts, offices } from "@/data/credentials";

const SITE_URL = "https://www.xiphiasimmigration.com";
const PAGE_URL = `${SITE_URL}/personal-booking`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Senior Immigration Advisor Consultation | Varun Singh, XIPHIAS",
  description:
    "A private 60-minute immigration strategy consultation with Varun Singh, MD of XIPHIAS Immigration. 17+ years, Fellow IMC, and a Canadian practice under RCIC licence R516194 you can verify on the CICC register.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Book a Senior Advisor Consultation | XIPHIAS Immigration",
    description:
      "One hour with the advisor who built the practice. Licensed, verifiable, and structured — you leave with a written view of what is genuinely open to you.",
    url: PAGE_URL,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/avtar/varun-singh-md-xiphias.jpg`,
        width: 1200,
        height: 630,
        alt: "Varun Singh, Managing Director, XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Senior Advisor Consultation | XIPHIAS Immigration",
    description:
      "A private 60-minute immigration strategy consultation with the Managing Director of XIPHIAS Immigration.",
    images: [`${SITE_URL}/images/avtar/varun-singh-md-xiphias.jpg`],
  },
};

export default function PersonalBookingPage() {
  const product = getProductConfig(CONSULTATION_PRODUCT_TYPE);
  const priceInr = product?.priceInr || 25_000;

  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "XIPHIAS Immigration Private Limited",
    url: SITE_URL,
    foundingDate: String(firmFacts.foundedYear),
    identifier: firmFacts.cin,
    address: offices.map((office) => ({
      "@type": "PostalAddress",
      addressLocality: office.city,
      addressRegion: office.region || undefined,
      addressCountry: office.country,
    })),
  };

  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}#varun-singh`,
    name: "Varun Singh",
    jobTitle: "Managing Director",
    image: `${SITE_URL}/images/avtar/varun-singh-md-xiphias.jpg`,
    worksFor: { "@id": `${SITE_URL}#organization` },
    sameAs: ["https://www.linkedin.com/in/varunxiphias/", "https://www.imidaily.com/varun-singh/"],
    hasCredential: credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional licence",
      name: `${credential.authorityShort} ${credential.reference}`,
      recognizedBy: { "@type": "Organization", name: credential.authority },
      url: credential.verifyUrl,
    })),
  };

  const service = {
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: "XIPHIAS Senior Advisor Strategy Consultation",
    serviceType: "Immigration strategy consultation",
    description:
      "A private 60-minute immigration strategy consultation covering eligible routes, evidence requirements, realistic costs and sequencing, followed by a written summary.",
    provider: { "@id": `${SITE_URL}#organization` },
    areaServed: offices.map((office) => ({ "@type": "Country", name: office.country })),
    offers: {
      "@type": "Offer",
      price: priceInr,
      priceCurrency: "INR",
      url: PAGE_URL,
      availability: "https://schema.org/InStock",
      category: `${CONSULTATION_DURATION_MINUTES}-minute private consultation`,
    },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    mainEntity: consultationFaq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [organization, person, service, faqPage],
  };

  return (
    <>
      <AdvisoryHero priceInr={priceInr} durationMinutes={CONSULTATION_DURATION_MINUTES} />
      <ConsultationBookingClient
        initialPriceInr={priceInr}
        initialDurationMinutes={CONSULTATION_DURATION_MINUTES}
      />
      <AdvisorProof />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
