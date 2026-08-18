import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";
import {
  getJourneySource,
  getRoutePrefill,
  type PageSearchParams,
} from "@/lib/xia-concierge-prefill";

export const metadata: Metadata = {
  title: "Route Intelligence",
  description:
    "Rank immigration routes by country, budget, timeline, family needs, and XIPHIAS programme knowledge.",
  alternates: {
    canonical: "/route-intelligence",
  },
};

export default async function RouteIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const routePrefill = getRoutePrefill(params);

  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine={routePrefill.goal === "investment" ? "investment" : "route"}
      initialRouteInput={routePrefill}
      journeySource={getJourneySource(params)}
      lockedEngine
      title="Route Intelligence"
      subtitle="Find immigration pathways that fit your destination, objective and practical circumstances. XIA removes conflicting routes first, then presents a focused shortlist with clear reasons, limitations and evidence gaps."
      steps={[
        { title: "Choose your destination and goal", description: "Tell us where you want to move and whether the objective is residence, work, citizenship, investment, business or family migration." },
        { title: "Add the constraints that matter", description: "Provide your applicant profile, budget, timeline, family needs and preferred physical-presence level." },
        { title: "Review compatible route directions", description: "Receive a filtered shortlist explaining possible fit, missing requirements and the confidence of each direction." },
      ]}
    />
  );
}
