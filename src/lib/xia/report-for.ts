// src/lib/xia/report-for.ts
// Which paid report answers the question a given card raises. Keeps the mapping
// in one place so the card, the checkout page and the report builder agree.

import type { CaseMatch } from "./case";

export type ReportProductType =
  | "route_report" | "premium_report" | "cost_report" | "compare_report"
  | "docs_report" | "due_diligence_report" | "us_visa_report" | "deep_analysis_report";

export const REPORT_LABEL: Record<ReportProductType, string> = {
  route_report: "Route Intelligence Report",
  premium_report: "Personal Immigration Strategy Report",
  cost_report: "Cost & Budget Report",
  compare_report: "Programme Comparison Report",
  docs_report: "Document Readiness Report",
  due_diligence_report: "Immigration Due Diligence Report",
  us_visa_report: "US Visa Strategy Report",
  deep_analysis_report: "High-Skill Deep Analysis Report",
};

export function reportForMatch(match: CaseMatch): ReportProductType {
  if (match.country === "United States") return "us_visa_report";
  if (match.track === "citizenship" || match.track === "residency") return "premium_report";
  return "route_report";
}
