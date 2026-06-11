import type { Metadata } from "next";
import PassportCompareClient from "@/components/PassportIndex/PassportCompareClient";
import { passportIndexStats, passportRecords } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "Compare Passports - XIPHIAS Passport Power",
  description:
    "Compare two passports by mobility score, rank, and XIPHIAS advisor interpretation for residence or citizenship planning.",
  alternates: { canonical: "/passport-index/compare" },
  openGraph: {
    title: "Compare Passports - XIPHIAS Passport Power",
    description: "Compare passport strength and understand what the mobility gap means for planning.",
    url: `${SITE_URL}/passport-index/compare`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

export default function PassportComparePage() {
  return <PassportCompareClient records={passportRecords} stats={passportIndexStats} />;
}
