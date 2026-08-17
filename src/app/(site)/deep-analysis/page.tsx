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
      subtitle="Build a detailed evidence-led view of your education, experience, role, achievements and supporting records across relevant high-skill immigration pathways. XIA uses only the information you provide to identify plausible routes, explain the evidence supporting each direction, highlight missing criteria and organise practical next steps. Incomplete profiles are not given artificial recommendations. A case-specific Deep Analysis report is available for INR 4,999, while final eligibility and filing strategy remain subject to advisor verification."
    />
  );
}
