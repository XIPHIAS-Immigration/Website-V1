import type { Metadata } from "next";
import PassportPlannerClient from "@/components/PassportIndex/PassportPlannerClient";
import { passportIndexStats, passportRecords } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "My Passport Planner - XIPHIAS Passport Power",
  description:
    "Choose a current passport and goal to get a practical XIPHIAS mobility direction before advisor review.",
  alternates: { canonical: "/passport-index/my-passport" },
  openGraph: {
    title: "My Passport Planner - XIPHIAS Passport Power",
    description: "Start from a client passport and turn mobility rank into the next practical step.",
    url: `${SITE_URL}/passport-index/my-passport`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

export default function MyPassportPage() {
  return <PassportPlannerClient records={passportRecords} stats={passportIndexStats} />;
}
