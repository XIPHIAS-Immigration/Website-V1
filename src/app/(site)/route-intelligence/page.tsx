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
      subtitle="Compare immigration pathways against your real destination, objective, applicant profile, available capital, timeline, family needs and physical-presence preference. XIA first removes routes that conflict with the selected profile or goal, then explains why the remaining pathways may fit, where mandatory requirements are not met and which information still affects confidence. The result is a focused shortlist for informed research and advisor verification—not a generic list of every programme in a country."
    />
  );
}
