import type { Metadata } from "next";

import ProgrammeExplorerClient from "@/components/ProgrammeExplorer/ProgrammeExplorerClient";
import { getProgrammeExplorerData } from "@/lib/programme-explorer";

export const metadata: Metadata = {
  title: "Programme Explorer - XIA Route Intelligence",
  description:
    "Explore XIPHIAS immigration programmes with AI-style route scoring for residency, citizenship, corporate mobility, and skilled migration.",
  alternates: {
    canonical: "/programme-explorer",
  },
};

export default function ProgrammeExplorerPage() {
  const data = getProgrammeExplorerData();
  return <ProgrammeExplorerClient data={data} />;
}
