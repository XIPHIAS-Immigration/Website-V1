import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ExpressReportsClient, {
  type ExpressProgrammeOption,
  type ExpressReportProduct,
} from "@/components/ExpressReports/ExpressReportsClient";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { getProgrammeExplorerData } from "@/lib/programme-explorer";

export const metadata: Metadata = {
  title: "Personalised Immigration Reports from ₹499",
  description:
    "Buy a focused immigration route, cost, programme comparison, document, high-skill, US visa or due-diligence report through secure JioPay checkout.",
  alternates: { canonical: "/express-reports" },
  openGraph: {
    title: "Express Personalised Immigration Reports | XIPHIAS",
    description: "Focused intake, secure payment and a personalised PDF without completing the full assessment journey first.",
    url: "https://www.xiphiasimmigration.com/express-reports",
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const dynamic = "force-dynamic";

const productCopy: Array<Omit<ExpressReportProduct, "priceInr">> = [
  {
    productType: "route_report",
    title: "XIPHIAS Route Intelligence Report",
    shortTitle: "Route Intelligence",
    description: "Rank suitable immigration routes against your destination, objective, profile, budget, timeline and family priorities.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Ranked route shortlist", "Fit factors and trade-offs", "Readiness gaps", "Practical next-action plan"],
  },
  {
    productType: "deep_analysis_report",
    title: "XIPHIAS High-Skill Deep Analysis Report",
    shortTitle: "High-Skill Deep Analysis",
    description: "Assess professional, education, experience and evidence signals across relevant high-skill routes.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Country and route matching", "Evidence-strength review", "Profile readiness measures", "Priority evidence plan"],
    featured: true,
  },
  {
    productType: "cost_report",
    title: "XIPHIAS Cost & Budget Report",
    shortTitle: "Cost & Budget",
    description: "Turn a destination, programme and family profile into an itemised planning estimate and payment roadmap.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Itemised indicative budget", "Family-cost impact", "Stage-by-stage planning", "Cost risks and questions"],
  },
  {
    productType: "compare_report",
    title: "XIPHIAS Programme Comparison Report",
    shortTitle: "Programme Comparison",
    description: "Compare two to four shortlisted programmes on cost, timing, family, presence, risk and your stated priority.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Side-by-side comparison", "Priority-led ranking", "Strengths and trade-offs", "Decision checklist"],
  },
  {
    productType: "docs_report",
    title: "XIPHIAS Document Readiness Report",
    shortTitle: "Document Readiness",
    description: "Build a programme-aware document checklist and identify evidence that is available, missing or needs attention.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Grouped document checklist", "Readiness priorities", "Evidence-quality guidance", "Collection sequence"],
  },
  {
    productType: "due_diligence_report",
    title: "XIPHIAS Immigration Due Diligence Report",
    shortTitle: "Immigration Due Diligence",
    description: "Review identity, immigration history, evidence, funds, family records and relevant counterparties through a secure detailed intake.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Structured risk review", "Evidence and chronology matrix", "Source-of-funds review", "Prioritised remediation plan"],
  },
  {
    productType: "us_visa_report",
    title: "XIPHIAS US Visa Strategy Report",
    shortTitle: "US Visa Strategy",
    description: "Compare relevant US high-skill visa families against your professional profile and available evidence.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["US route comparison", "Evidence criteria mapping", "Readiness gaps", "Recommended preparation order"],
  },
  {
    productType: "premium_report",
    title: "XIPHIAS Personal Immigration Strategy Report",
    shortTitle: "Personal Strategy Report",
    description: "A broader strategy report for customers who want route direction, profile analysis, risks and next actions together.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Personal profile snapshot", "Route strategy", "Risks and dependencies", "Detailed action roadmap"],
  },
];

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ExpressReportsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const products = productCopy.map((product) => ({
    ...product,
    priceInr: getProductConfig(product.productType)?.priceInr ?? 499,
  }));
  const validTypes = new Set(products.map((product) => product.productType));
  const requested = typeof params.report === "string" && validTypes.has(params.report as ExpressReportProduct["productType"])
    ? params.report as ExpressReportProduct["productType"]
    : undefined;
  if (!requested) redirect("/reports");
  const initialProgrammes = typeof params.programmes === "string" ? params.programmes.slice(0, 800) : "";
  const programmes: ExpressProgrammeOption[] = getProgrammeExplorerData().items.map((item) => ({
    id: item.id,
    title: item.title,
    country: item.country,
    track: item.track,
  }));

  return <ExpressReportsClient products={products} programmes={programmes} initialReport={requested} initialProgrammes={initialProgrammes} />;
}
