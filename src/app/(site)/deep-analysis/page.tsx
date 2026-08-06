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
      subtitle="A deeper profile review using skills, education, experience, CV notes, and evidence markers before XIPHIAS advisor verification."
    />
  );
}
