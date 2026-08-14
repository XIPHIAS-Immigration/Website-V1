import type { Metadata } from "next";

import DueDiligenceClient from "@/components/DueDiligence/DueDiligenceClient";

export const metadata: Metadata = {
  title: "Immigration Due Diligence — XIA Intelligence",
  description:
    "Run a preliminary immigration due-diligence assessment across identity, immigration history, documents, source of funds, family evidence and counterparties.",
  alternates: {
    canonical: "/due-diligence-intelligence",
  },
  openGraph: {
    title: "XIA Immigration Due Diligence | XIPHIAS Immigration",
    description:
      "Identify immigration evidence gaps, inconsistencies and enhanced-review requirements before application or investment.",
    url: "https://www.xiphiasimmigration.com/due-diligence-intelligence",
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export default function DueDiligenceIntelligencePage() {
  return <DueDiligenceClient />;
}
