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
      subtitle="Assess US visa directions against your professional record, intended work, petitioner position and available evidence. The result distinguishes possible routes from missing mandatory dependencies and unsupported claims."
      steps={[
        { title: "Define your US objective", description: "Add your intended work, current immigration position, petitioner or employer situation and preferred outcome." },
        { title: "Map your professional evidence", description: "Record qualifications, experience, recognition, publications, leadership, sponsorship and previous visa history." },
        { title: "Compare relevant US categories", description: "Review why EB-1A, EB-2 NIW, O-1, H-1B, L-1 or another direction may or may not warrant detailed assessment." },
      ]}
    />
  );
}
