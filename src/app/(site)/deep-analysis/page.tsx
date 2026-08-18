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
      subtitle="Turn your professional history and supporting evidence into a structured high-skill immigration review. XIA identifies plausible directions, evidence strengths and critical gaps without treating incomplete information as eligibility."
      steps={[
        { title: "Describe your professional profile", description: "Add your role, field, education, experience, destination and intended immigration outcome." },
        { title: "Record evidence and achievements", description: "Supply CV details, awards, publications, leadership, recognition, sponsorship and other evidence that genuinely applies." },
        { title: "Review routes and evidence priorities", description: "See which high-skill directions warrant deeper review and what should be documented before an advisor assessment." },
      ]}
    />
  );
}
