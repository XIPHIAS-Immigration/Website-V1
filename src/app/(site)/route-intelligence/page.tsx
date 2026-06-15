import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";

export const metadata: Metadata = {
  title: "Route Intelligence",
  description:
    "Rank immigration routes by country, budget, timeline, family needs, and XIPHIAS programme knowledge.",
  alternates: {
    canonical: "/route-intelligence",
  },
};

export default function RouteIntelligencePage() {
  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine="route"
      lockedEngine
      title="Route Intelligence"
      subtitle="A focused route-fit workspace for destination, capital, timeline, family, and presence preferences."
    />
  );
}
