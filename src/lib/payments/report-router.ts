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
import { buildDueDiligenceReport } from "@/lib/reports/templates/due-diligence";
import { withClientCaseAnswers } from "@/lib/reports/client-case";
import { runWithNarrative } from "@/lib/reports/narrative-context";
import { depthFor } from "@/lib/reports/templates/report-depth";
import { findCaseByEmail } from "@/lib/xia/case-store";
import { matchProgrammes } from "@/lib/xia/match";
import { programmeRules } from "@/lib/xia/programme-requirements";
import { evaluate } from "@/lib/xia/requirements";
import {
  writeNarrativeSections,
  type NarrativeFacts,
  type NarrativeSection,
} from "@/lib/xia/report-narrative";

/**
 * Model-written pages for this buyer, or none.
 *
 * The facts handed to the model are exactly what the rules engine produced for
 * this person's case — requirements met, gaps, and a closed list of figures. The
 * writer may not introduce a number that is not on that list; a draft that does
 * is discarded rather than printed. So the worst case is a report without these
 * pages, never a report with an invented processing time in it.
 */
async function narrativeFor(reportKind: ReportKind, order: JiopayOrder): Promise<NarrativeSection[]> {
  const limit = depthFor(reportKind).maxNarrativeSections;
  if (limit <= 0) return [];

  // The case is the same object the visitor filled in on the website, found by
  // the email they paid with. No case means no personalised analysis — the
  // deterministic report is complete on its own.
  const item = order.customer.email ? findCaseByEmail(order.customer.email) : null;
  if (!item) return [];

  const matches = matchProgrammes(item, { limit, includeClosed: false });
  if (!matches.length) return [];

  const facts: NarrativeFacts[] = [];
  for (const match of matches) {
    const rule = programmeRules.find((candidate) => candidate.id === match.programmeId);
    if (!rule) continue;
    const result = evaluate(rule.requirements, item);

    facts.push({
      clientName: order.customer.name,
      nationality: item.nationality,
      destination: item.destination,
      goal: item.goal,
      programme: rule.title,
      programmeSummary: rule.summary,
      met: result.met,
      gaps: [...result.gaps, ...result.unknowns],
      figures: [
        ...(match.score !== null ? [{ label: "Indicative score for this route", value: String(match.score) }] : []),
        { label: "Indicative investment", value: rule.investmentLabel },
        { label: "Indicative timeline", value: rule.timelineLabel },
        ...(item.age !== undefined ? [{ label: "Client age", value: String(item.age) }] : []),
        ...(item.yearsExperience !== undefined
          ? [{ label: "Years of work experience", value: String(item.yearsExperience) }]
          : []),
      ],
      source: { url: rule.officialUrl, lastVerified: rule.lastVerified },
    });
  }

  try {
    return await writeNarrativeSections(facts);
  } catch (error) {
    // A model outage must never stop a paid report from being delivered.
    console.warn("[xia] Narrative generation skipped:", error);
    return [];
  }
}

/**
 * Generate the PDF for a paid report, dispatching on the product's report template.
 * All reports are built on the shared premium framework (src/lib/reports/*).
 */
export async function generateReportPdf(reportKind: ReportKind, order: JiopayOrder): Promise<Buffer> {
  const normalizedOrder = withClientCaseAnswers(order);
  const sections = await narrativeFor(reportKind, order);

  return runWithNarrative({ sections, reference: order.merchantTxnNo }, async () =>
    buildFor(reportKind, normalizedOrder),
  );
}

function buildFor(reportKind: ReportKind, normalizedOrder: JiopayOrder): Promise<Buffer> {
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
    case "due_diligence":
      return buildDueDiligenceReport(normalizedOrder);
    default:
      throw new Error(`Unknown report template: ${String(reportKind)}`);
  }
}
