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
      subtitle="A US-focused visa intelligence page for EB1A, EB2 NIW, O1A, H-1B, L1, founder, employer, and evidence improvement guidance."
    />
  );
}
