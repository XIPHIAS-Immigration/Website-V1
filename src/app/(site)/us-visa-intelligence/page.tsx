import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";

export const metadata: Metadata = {
  title: "US Visa Intelligence",
  description:
    "Evaluate US visa directions including EB1A, EB2 NIW, O1A, H-1B, L1, founder, employer-sponsored, and evidence-led pathways.",
  alternates: {
    canonical: "/us-visa-intelligence",
  },
};

export default function UsVisaIntelligencePage() {
  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine="high-skill"
      lockedEngine
      targetCountryLocked="usa"
      title="US Visa Intelligence"
      subtitle="Assess US visa directions against your professional record, intended work in the United States, petitioner or employer position, current status, previous visa history and available evidence. XIA compares the supplied facts with routes such as EB-1A, EB-2 NIW, O-1, H-1B and L-1, showing why a category may fit, which mandatory dependency is missing and what evidence should be strengthened. It does not assume acclaim, sponsorship or eligibility when those facts have not been provided."
    />
  );
}
