import "server-only";

import { getProgrammeExplorerData, type ProgrammeExplorerItem } from "@/lib/programme-explorer";

/**
 * Audience-led "Solutions" segments. Each is a real landing page that curates
 * relevant programmes (from the live catalogue) plus the right tools and a
 * consultation CTA — the GEO/SEO entry points for how clients self-identify.
 */

export type SolutionSlug =
  | "for-investors"
  | "for-families"
  | "for-professionals"
  | "for-businesses"
  | "for-entrepreneurs";

export type SolutionTool = { label: string; href: string; desc: string };

export type SolutionConfig = {
  slug: SolutionSlug;
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  tools: SolutionTool[];
  select: (items: ProgrammeExplorerItem[]) => ProgrammeExplorerItem[];
};

const has = (item: ProgrammeExplorerItem, ...words: string[]) => {
  const hay = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.keywords}`.toLowerCase();
  return words.some((w) => hay.includes(w));
};

const byInvestmentDesc = (a: ProgrammeExplorerItem, b: ProgrammeExplorerItem) =>
  b.investmentUsd - a.investmentUsd;

export const SOLUTIONS: Record<SolutionSlug, SolutionConfig> = {
  "for-investors": {
    slug: "for-investors",
    eyebrow: "For Investors",
    title: "Turn capital into a second residency or passport",
    intro:
      "Investment-led routes to residency and citizenship — golden visas, fund and real-estate programmes, and citizenship by investment — structured around your portfolio, mobility and tax goals.",
    points: [
      "Citizenship and residency by investment, vetted for due diligence",
      "Clear minimum-investment and timeline comparisons",
      "Routes that keep your family and assets protected",
    ],
    tools: [
      { label: "Cost Estimator", href: "/cost-estimator", desc: "Model government fees, due diligence and dependants" },
      { label: "Compare Programmes", href: "/compare-programs", desc: "Weigh routes side by side" },
      { label: "Investment & Residency", href: "/investment-residency", desc: "AI route scoring for investors" },
    ],
    select: (items) =>
      items
        .filter((i) => (i.track === "citizenship" || i.track === "residency") && i.investmentUsd >= 100_000)
        .sort(byInvestmentDesc)
        .slice(0, 9),
  },
  "for-families": {
    slug: "for-families",
    eyebrow: "For Families",
    title: "A safer future and a stronger passport for your family",
    intro:
      "Programmes that include your spouse, children and parents — with schooling, healthcare and visa-free travel in mind. Build a genuine plan B for the people who matter most.",
    points: [
      "Family-inclusive residency and citizenship routes",
      "Access to education, healthcare and visa-free travel",
      "Long-term security and a path to a second passport",
    ],
    tools: [
      { label: "Eligibility Check", href: "/eligibility#start", desc: "See which family routes you qualify for" },
      { label: "Cost Estimator", href: "/cost-estimator", desc: "Estimate costs including dependants" },
      { label: "Passport Index", href: "/passport-index", desc: "Compare passport strength" },
    ],
    select: (items) =>
      items
        .filter((i) => i.family && (i.track === "citizenship" || i.track === "residency"))
        .sort((a, b) => a.timelineMonths - b.timelineMonths)
        .slice(0, 9),
  },
  "for-professionals": {
    slug: "for-professionals",
    eyebrow: "For Professionals",
    title: "Skilled migration mapped to your profile",
    intro:
      "Points-based permanent residency and skilled work visas across Canada, Australia, Germany, the UK and beyond — matched to your occupation, experience and language scores.",
    points: [
      "Points-based PR and skilled work routes",
      "Occupation, experience and language mapped to programmes",
      "Evidence-led shortlists, not generic advice",
    ],
    tools: [
      { label: "High-Skill Visa", href: "/high-skill-visa", desc: "AI scoring for skilled routes" },
      { label: "Eligibility Check", href: "/eligibility#start", desc: "Screen your profile in minutes" },
      { label: "Deep Analysis", href: "/deep-analysis", desc: "An in-depth route assessment" },
    ],
    select: (items) => items.filter((i) => i.track === "skilled").slice(0, 9),
  },
  "for-businesses": {
    slug: "for-businesses",
    eyebrow: "For Businesses",
    title: "Move talent and expand across borders",
    intro:
      "Corporate mobility, intra-company transfers, market entry and compliant workforce relocation — one accountable partner for founders, HR and global teams.",
    points: [
      "Intra-company transfer and sponsored work routes",
      "Market entry and company formation support",
      "Compliant, repeatable mobility for teams",
    ],
    tools: [
      { label: "Compare Programmes", href: "/compare-programs", desc: "Compare corporate routes" },
      { label: "Document Readiness", href: "/document-readiness", desc: "Check filing readiness" },
      { label: "Cost Estimator", href: "/cost-estimator", desc: "Budget the move" },
    ],
    select: (items) => items.filter((i) => i.track === "corporate").slice(0, 9),
  },
  "for-entrepreneurs": {
    slug: "for-entrepreneurs",
    eyebrow: "For Entrepreneurs",
    title: "Build your venture from a new base",
    intro:
      "Start-up visas, entrepreneur residency and self-sponsorship routes that let you launch and scale a business while securing residency for you and your family.",
    points: [
      "Start-up, entrepreneur and self-employed routes",
      "Residency tied to building a real business",
      "Gateways to major markets and talent pools",
    ],
    tools: [
      { label: "Route Intelligence", href: "/route-intelligence", desc: "Find your best founder route" },
      { label: "Cost Estimator", href: "/cost-estimator", desc: "Model setup and living costs" },
      { label: "Compare Programmes", href: "/compare-programs", desc: "Weigh entrepreneur routes" },
    ],
    select: (items) =>
      items
        .filter(
          (i) =>
            i.track === "corporate" ||
            has(i, "entrepreneur", "start up", "start-up", "startup", "self employed", "self-employed", "business investment"),
        )
        .slice(0, 9),
  },
};

export function getSolutionSlugs(): SolutionSlug[] {
  return Object.keys(SOLUTIONS) as SolutionSlug[];
}

export function getSolution(slug: SolutionSlug): {
  config: SolutionConfig;
  programmes: ProgrammeExplorerItem[];
} {
  const config = SOLUTIONS[slug];
  const items = getProgrammeExplorerData().items.filter((i) => i.source === "site-content");
  return { config, programmes: config.select(items) };
}
