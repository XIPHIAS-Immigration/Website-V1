import type { Metadata } from "next";

import XiaWorkbench from "@/components/Xia/XiaWorkbench";

export const metadata: Metadata = {
  title: "US Visa Intelligence | EB-1A, EB-2 NIW and EB-5 against the published standard",
  description:
    "Check your profile against the published standards for EB-1A, EB-2 NIW and EB-5, with the evidence each category actually requires and the gaps named in full.",
  alternates: { canonical: "/us-visa-intelligence" },
};

export default function UsVisaIntelligencePage() {
  return <XiaWorkbench focus="united states" preset={{ destination: "united states" }} />;
}
