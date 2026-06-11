import type { Metadata } from "next";
import PassportRankingClient from "@/components/PassportIndex/PassportRankingClient";
import { passportIndexStats, passportRecords, passportRegions } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "Passport Ranking - XIPHIAS Passport Power",
  description:
    "Search the XIPHIAS passport ranking snapshot and open country passport profiles with advisor-led mobility context.",
  alternates: { canonical: "/passport-index/ranking" },
  openGraph: {
    title: "Passport Ranking - XIPHIAS Passport Power",
    description: "Search passport strength and understand the advisory meaning of each mobility score.",
    url: `${SITE_URL}/passport-index/ranking`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

export default function PassportRankingPage() {
  return <PassportRankingClient records={passportRecords} regions={passportRegions} stats={passportIndexStats} />;
}
