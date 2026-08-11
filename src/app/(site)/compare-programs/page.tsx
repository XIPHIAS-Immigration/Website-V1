import type { Metadata } from "next";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import { toCostProgram } from "@/lib/cost-estimator";
import ProgramComparisonClient, {
  type ComparableProgram,
} from "@/components/ProgramComparison/ProgramComparisonClient";

export const metadata: Metadata = {
  title: "Compare Programmes — XIA Intelligence",
  description:
    "Put 2-4 XIPHIAS immigration programmes side by side on cost, timeline, benefits, residency outcome, family inclusion, physical presence and passport power.",
  alternates: { canonical: "/compare-programs" },
};

export const revalidate = 86400;

export default function CompareProgramsPage() {
  const { items } = getProgrammeExplorerData();
  const programs: ComparableProgram[] = items.map((it) => ({
    ...toCostProgram(it),
    presence: it.presence,
    risk: it.risk,
    family: it.family,
    benefits: it.benefits,
    residencyOutcome: it.residencyOutcome,
    familySummary: it.familySummary,
  }));
  return <ProgramComparisonClient programs={programs} />;
}
