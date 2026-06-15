import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";

export const metadata: Metadata = {
  title: "Deep Analysis",
  description:
    "Run a deeper XIA assessment with skills, education, CV notes, evidence signals, and advisor-ready immigration route matching.",
  alternates: {
    canonical: "/deep-analysis",
  },
};

export default function DeepAnalysisPage() {
  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine="high-skill"
      lockedEngine
      title="Deep Analysis"
      subtitle="A deeper profile review using skills, education, experience, CV notes, and evidence markers before XIPHIAS advisor verification."
    />
  );
}
