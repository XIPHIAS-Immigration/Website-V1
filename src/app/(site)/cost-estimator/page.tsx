import type { Metadata } from "next";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import { toCostProgram, type CostProgram } from "@/lib/cost-estimator";
import CostEstimatorClient from "@/components/CostEstimator/CostEstimatorClient";

export const metadata: Metadata = {
  title: "Family Cost Estimator — XIA Intelligence",
  description:
    "Estimate an indicative, family-tailored cost for a XIPHIAS residency, citizenship, skilled or corporate programme — itemized fees, dependants and timeline, ready for advisor review.",
  alternates: { canonical: "/cost-estimator" },
};

export const revalidate = 86400;

export default function CostEstimatorPage() {
  const { items } = getProgrammeExplorerData();
  const programs: CostProgram[] = items.map(toCostProgram);
  return <CostEstimatorClient programs={programs} />;
}
