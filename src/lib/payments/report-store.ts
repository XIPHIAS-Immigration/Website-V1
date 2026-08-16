import { getProductConfig } from "@/lib/payments/product-catalog";

export type PublicReportProductType =
  | "premium_report"
  | "route_report"
  | "deep_analysis_report"
  | "us_visa_report"
  | "cost_report"
  | "compare_report"
  | "docs_report"
  | "due_diligence_report";

export type PublicReportProduct = {
  productType: PublicReportProductType;
  slug: string;
  title: string;
  shortTitle: string;
  priceInr: number;
  description: string;
  delivery: string;
  includes: string[];
  informationRequired: string[];
  pageRange: string;
  requiresIntake?: boolean;
  featured?: boolean;
};

type ReportProductCopy = Omit<PublicReportProduct, "priceInr">;

export const REPORT_PRODUCT_COPY: ReportProductCopy[] = [
  {
    productType: "deep_analysis_report",
    slug: "deep-analysis",
    title: "XIPHIAS High-Skill Deep Analysis Report",
    shortTitle: "High-Skill Deep Analysis",
    description: "The most detailed self-service assessment for professional profile fit, route options, evidence strength, risks and a case-specific action plan.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Country and route ranking", "Occupation and evidence analysis", "Profile-readiness measures", "Prioritised case action plan"],
    informationRequired: ["Professional and education history", "Experience and occupation details", "Language results and route evidence", "Immigration objective and document position"],
    pageRange: "Usually 40-48 pages, depending on the information supplied",
    featured: true,
  },
  {
    productType: "premium_report",
    slug: "personal-strategy",
    title: "XIPHIAS Personal Immigration Strategy Report",
    shortTitle: "Personal Strategy",
    description: "A broad strategy snapshot for customers who want route direction, profile observations, dependencies and next actions together.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Personal profile snapshot", "Shortlisted route strategy", "Risks and dependencies", "Practical action roadmap"],
    informationRequired: ["Goal and preferred destination", "Profile type and timeline", "Budget and family position", "Short background summary"],
    pageRange: "Usually 30-36 pages, depending on the information supplied",
  },
  {
    productType: "us_visa_report",
    slug: "us-visa-strategy",
    title: "XIPHIAS US Visa Strategy Report",
    shortTitle: "US Visa Strategy",
    description: "Compare relevant US high-skill visa families against your professional profile and the evidence you can support.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["US route comparison", "Evidence-criteria mapping", "Readiness gaps", "Recommended preparation order"],
    informationRequired: ["Occupation, field and objective", "Education and experience", "Achievements and supporting evidence", "Sponsor or employer position"],
    pageRange: "Usually 24-32 pages, depending on the information supplied",
  },
  {
    productType: "route_report",
    slug: "route-intelligence",
    title: "XIPHIAS Route Intelligence Report",
    shortTitle: "Route Intelligence",
    description: "Rank suitable immigration routes against your destination, objective, profile, budget, timeline and family priorities.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Ranked route shortlist", "Fit factors and trade-offs", "Readiness gaps", "Practical next-action plan"],
    informationRequired: ["Destination and immigration goal", "Profile type", "Budget and timeline", "Family and decision priority"],
    pageRange: "Usually 18-22 pages",
  },
  {
    productType: "due_diligence_report",
    slug: "immigration-due-diligence",
    title: "XIPHIAS Immigration Due Diligence Report",
    shortTitle: "Immigration Due Diligence",
    description: "Review identity, immigration history, evidence, funds, family records and relevant counterparties through a secure detailed intake.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Structured risk review", "Evidence and chronology matrix", "Source-of-funds review", "Prioritised remediation plan"],
    informationRequired: ["Identity, nationality and residence", "Destination, route and immigration history", "Evidence and source-of-funds position", "Relevant employer, agent or other counterparty concerns"],
    pageRange: "Usually 12-15 pages",
  },
  {
    productType: "cost_report",
    slug: "cost-and-budget",
    title: "XIPHIAS Cost & Budget Report",
    shortTitle: "Cost & Budget",
    description: "Turn a destination, programme and family profile into an itemised planning estimate and payment roadmap.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Itemised indicative budget", "Family-cost impact", "Stage-by-stage planning", "Cost risks and questions"],
    informationRequired: ["Exact destination and programme", "Family size", "Budget and currency", "Expected move timing"],
    pageRange: "Usually 15-18 pages",
  },
  {
    productType: "compare_report",
    slug: "programme-comparison",
    title: "XIPHIAS Programme Comparison Report",
    shortTitle: "Programme Comparison",
    description: "Compare two to four shortlisted programmes on cost, timing, family, presence, risk and your stated priority.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Side-by-side comparison", "Priority-led ranking", "Strengths and trade-offs", "Decision checklist"],
    informationRequired: ["Two to four exact programmes", "Decision priority", "Budget", "Family suitability requirement"],
    pageRange: "Usually 14-17 pages",
  },
  {
    productType: "docs_report",
    slug: "document-readiness",
    title: "XIPHIAS Document Readiness Report",
    shortTitle: "Document Readiness",
    description: "Build a programme-aware document checklist and identify evidence that is available, missing, expired or needs attention.",
    delivery: "Generated after verified payment and delivered by secure download and email.",
    includes: ["Grouped document checklist", "Readiness priorities", "Evidence-quality guidance", "Collection sequence"],
    informationRequired: ["Destination and programme", "Application stage", "Documents already available", "Missing, expired or untranslated documents"],
    pageRange: "Usually 14-17 pages",
  },
];

export function getPublicReportProducts(): PublicReportProduct[] {
  return REPORT_PRODUCT_COPY.map((product) => ({
    ...product,
    priceInr: getProductConfig(product.productType)?.priceInr ?? 499,
  }));
}

export function getPublicReportProductBySlug(slug: string): PublicReportProduct | undefined {
  return getPublicReportProducts().find((product) => product.slug === slug);
}
