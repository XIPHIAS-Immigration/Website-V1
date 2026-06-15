import type { Metadata } from "next";

import XiaSuiteGatewayClient from "@/components/XiaIntelligence/XiaSuiteGatewayClient";

export const metadata: Metadata = {
  title: "XIA Intelligence Suite",
  description:
    "Explore route-fit, high-skill visa evidence, investment pathways, document readiness, reports, and advisor workflow with XIPHIAS XIA.",
  alternates: {
    canonical: "/xia-intelligence",
  },
};

export default function XiaIntelligencePage() {
  return <XiaSuiteGatewayClient />;
}
