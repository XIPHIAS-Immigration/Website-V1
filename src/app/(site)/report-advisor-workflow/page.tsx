import type { Metadata } from "next";

import XiaIntelligenceClient from "@/components/XiaIntelligence/XiaIntelligenceClient";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";

export const metadata: Metadata = {
  title: "Report + Advisor Workflow",
  description:
    "Move from XIA preview report to detailed advisor review, paid report unlock, and X-Hub case tracking.",
  alternates: {
    canonical: "/report-advisor-workflow",
  },
};

export default function ReportAdvisorWorkflowPage() {
  return (
    <XiaIntelligenceClient
      data={getXiaIntelligenceData()}
      initialEngine="workflow"
      lockedEngine
      title="Report + Advisor Workflow"
      subtitle="A focused workflow page for preview reports, detailed report unlocks, advisor verification, and X-Hub case tracking."
    />
  );
}
