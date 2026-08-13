import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import type { ReportKind } from "@/lib/payments/product-catalog";
import { buildPremiumStrategyReport } from "@/lib/reports/templates/premium-strategy";
import { buildRouteReport } from "@/lib/reports/templates/route";
import { buildDeepAnalysisReport } from "@/lib/reports/templates/deep-analysis";
import { buildUsVisaReport } from "@/lib/reports/templates/us-visa";
import { buildCostReport } from "@/lib/reports/templates/cost";
import { buildCompareReport } from "@/lib/reports/templates/compare";
import { buildDocsReport } from "@/lib/reports/templates/docs";
import { withClientCaseAnswers } from "@/lib/reports/client-case";

/**
 * Generate the PDF for a paid report, dispatching on the product's report template.
 * All reports are built on the shared premium framework (src/lib/reports/*).
 */
export async function generateReportPdf(reportKind: ReportKind, order: JiopayOrder): Promise<Buffer> {
  const normalizedOrder = withClientCaseAnswers(order);
  switch (reportKind) {
    case "premium_strategy":
      return buildPremiumStrategyReport(normalizedOrder);
    case "route":
      return buildRouteReport(normalizedOrder);
    case "deep_analysis":
      return buildDeepAnalysisReport(normalizedOrder);
    case "us_visa":
      return buildUsVisaReport(normalizedOrder);
    case "cost":
      return buildCostReport(normalizedOrder);
    case "compare":
      return buildCompareReport(normalizedOrder);
    case "docs":
      return buildDocsReport(normalizedOrder);
    default:
      throw new Error(`Unknown report template: ${String(reportKind)}`);
  }
}
