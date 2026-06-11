import type { Metadata } from "next";
import PassportIndexClient from "@/components/PassportIndex/PassportIndexClient";
import { passportIndexStats, passportRecords } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "XIPHIAS Passport Power - Global Mobility Ranking",
  description:
    "Explore a premium XIPHIAS passport power experience for global mobility, visa-free score comparison, residence planning, and citizenship strategy.",
  alternates: { canonical: "/passport-index" },
  openGraph: {
    title: "XIPHIAS Passport Power",
    description:
      "Compare passport strength and plan second residence, citizenship, and family mobility routes with XIPHIAS.",
    url: `${SITE_URL}/passport-index`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "XIPHIAS Passport Power",
    description:
      "Compare passport power and turn mobility ranking into an advisor-led route plan.",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

export default function PassportIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "XIPHIAS Passport Power",
    url: `${SITE_URL}/passport-index`,
    description:
      "A XIPHIAS global mobility index page for comparing passport strength and planning residence or citizenship routes.",
    publisher: {
      "@type": "Organization",
      name: "XIPHIAS Immigration",
      url: SITE_URL,
    },
    about: [
      "passport power",
      "global mobility",
      "visa-free travel",
      "residence by investment",
      "citizenship planning",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PassportIndexClient records={passportRecords} stats={passportIndexStats} />
    </>
  );
}
