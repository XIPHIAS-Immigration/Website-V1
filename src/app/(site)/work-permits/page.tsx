import type { Metadata } from "next";
import WorkPermitsClient from "@/components/WorkPermits/WorkPermitsClient";
import { workPermitCountries } from "@/lib/work-permits";

export const metadata: Metadata = {
  title: "Work Permit Advisory | XIPHIAS Immigration",
  description:
    "Explore country-specific work permit routes and submit your resume for XIPHIAS advisor review. XIPHIAS supports permit planning, not job placement.",
  alternates: {
    canonical: "/work-permits",
  },
};

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
