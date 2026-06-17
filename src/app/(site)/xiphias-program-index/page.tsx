import type { Metadata } from "next";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import { toCostProgram } from "@/lib/cost-estimator";
import ProgramIndexClient from "@/components/ProgramIndex/ProgramIndexClient";
import type { ProgramIndexItem } from "@/lib/program-index";

export const metadata: Metadata = {
  title: "XIPHIAS Program Index — XIA Intelligence",
  description:
    "A documented composite benchmark ranking XIPHIAS programmes on affordability, speed, presence, family inclusion, due diligence and passport power. Indicative — advisor review required.",
  alternates: { canonical: "/xiphias-program-index" },
};

export const revalidate = 86400;

export default function XiphiasProgramIndexPage() {
  const { items } = getProgrammeExplorerData();
  const programs: ProgramIndexItem[] = items.map((it) => ({
    ...toCostProgram(it),
    presence: it.presence,
    family: it.family,
    risk: it.risk,
  }));
  return <ProgramIndexClient programs={programs} />;
}
