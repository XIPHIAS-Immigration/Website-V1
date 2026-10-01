import type { Metadata } from "next";
import WorkPermitsClient from "@/components/WorkPermits/WorkPermitsClient";
import { workPermitCountries } from "@/lib/work-permits";

// Per-country metadata: a link like /work-permits?country=greece shows that
// country's name and photo when shared on WhatsApp, LinkedIn or email.
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = (await searchParams) || {};
  const slug = typeof params.country === "string" ? params.country : undefined;
  const match = slug ? workPermitCountries.find((c) => c.slug === slug) : undefined;

  if (!match) {
    return {
      title: "Work Permit Advisory | XIPHIAS Immigration",
      description:
        "Work permit routes for 14 countries, checked against official government rules. Tell us your profile and a licensed XIPHIAS advisor tells you which route you actually qualify for. Advisory only - we do not place you in a job.",
      alternates: { canonical: "/work-permits" },
    };
  }

  const routes = match.permitTypes.slice(0, 3).join(", ");
  return {
    title: `${match.country} Work Permit - Routes, Eligibility & Advisory | XIPHIAS`,
    description: `${match.country} work permit routes: ${routes}. ${match.processingSignal} Send your CV for a licensed advisor review.`,
    alternates: { canonical: `/work-permits?country=${match.slug}` },
    openGraph: {
      title: `${match.country} Work Permit - XIPHIAS Immigration`,
      description: `${match.processingSignal} Check your eligibility with a licensed advisor.`,
      images: [{ url: match.image, alt: `${match.country} work permit advisory` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${match.country} Work Permit - XIPHIAS Immigration`,
      description: match.processingSignal,
      images: [match.image],
    },
  };
}

export default async function WorkPermitsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const country = typeof params.country === "string" ? params.country : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "XIPHIAS Work Permit Advisory",
    provider: {
      "@type": "Organization",
      name: "XIPHIAS Immigration",
      url: "https://www.xiphiasimmigration.com",
    },
    serviceType: "Work permit immigration advisory",
    areaServed: workPermitCountries.map((item) => item.country),
    description:
      "Country-specific work permit route review, document readiness, resume assessment, and advisor follow-up.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkPermitsClient initialCountrySlug={country} />
    </>
  );
}
