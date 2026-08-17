import type { Metadata } from "next";

import DocumentReadinessClient from "@/components/DocumentReadiness/DocumentReadinessClient";

export const metadata: Metadata = {
  title: "Document & Evidence Readiness",
  description:
    "Check immigration document and evidence readiness for CV, proof of funds, source of funds, awards, education, company, and family records.",
  alternates: {
    canonical: "/document-readiness",
  },
};

export default function DocumentReadinessPage() {
  return <DocumentReadinessClient />;
}
