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
      subtitle="A focused route-fit workspace for destination, capital, timeline, family, and presence preferences."
    />
  );
}
