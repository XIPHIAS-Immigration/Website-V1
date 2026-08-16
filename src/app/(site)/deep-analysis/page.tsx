import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";
import {
  getHighSkillPrefill,
  getJourneySource,
  type PageSearchParams,
} from "@/lib/xia-concierge-prefill";

export const metadata: Metadata = {
  title: "Deep Analysis",
  description:
    "Run a deeper XIA assessment with skills, education, CV notes, evidence signals, and advisor-ready immigration route matching.",
  alternates: {
    canonical: "/deep-analysis",
  },
};

export default async function DeepAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;

  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine="high-skill"
      initialHighSkillInput={getHighSkillPrefill(params)}
      journeySource={getJourneySource(params)}
      lockedEngine
      title="Deep Analysis"
      subtitle="Explore your high-skill profile for free, or buy the full case-specific Deep Analysis report for INR 4,999. Advisor verification remains a separate step before filing."
    />
  );
}
