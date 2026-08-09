import type { ReportKind } from "@/lib/payments/product-catalog";
import type { DossierSection } from "../dossier-sections";

export type ReportDepthContract = {
  priceInr: number;
  targetPages: readonly [min: number, max: number];
  maxProgrammes: number;
  primaryDossierSections: readonly DossierSection[];
  alternativeDossierSections: readonly DossierSection[];
  maxNarrativeSections: number;
};

const FULL_DOSSIER: readonly DossierSection[] = [
  "divider",
  "snapshot",
  "eligibility",
  "scoring",
  "costs",
  "documents",
  "family",
  "process",
  "projects",
  "risk",
  "faq",
];

/**
 * Product depth is intentionally tied to the public catalogue price. The range is a
 * design target, not padding: optional programme data may move a report a few pages.
 */
export const REPORT_DEPTH: Record<ReportKind, ReportDepthContract> = {
  premium_strategy: {
    priceInr: 5000,
    targetPages: [46, 56],
    maxProgrammes: 3,
    primaryDossierSections: FULL_DOSSIER,
    alternativeDossierSections: FULL_DOSSIER,
    maxNarrativeSections: 4,
  },
  us_visa: {
    priceInr: 4999,
    targetPages: [44, 52],
    maxProgrammes: 4,
    primaryDossierSections: FULL_DOSSIER,
    alternativeDossierSections: FULL_DOSSIER,
    maxNarrativeSections: 1,
  },
  deep_analysis: {
    priceInr: 3999,
    targetPages: [40, 48],
    maxProgrammes: 1,
    primaryDossierSections: ["divider", "documents"],
    alternativeDossierSections: ["divider", "snapshot", "eligibility", "scoring", "documents", "risk"],
    maxNarrativeSections: 0,
  },
  route: {
    priceInr: 1999,
    targetPages: [12, 18],
    maxProgrammes: 1,
    primaryDossierSections: ["divider", "snapshot", "eligibility", "costs", "process", "risk"],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  cost: {
    priceInr: 499,
    targetPages: [7, 9],
    maxProgrammes: 1,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  compare: {
    priceInr: 199,
    targetPages: [5, 7],
    maxProgrammes: 0,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  docs: {
    priceInr: 199,
    targetPages: [6, 8],
    maxProgrammes: 0,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
};

export function depthFor(kind: ReportKind): ReportDepthContract {
  return REPORT_DEPTH[kind];
}

export function cleanReportPunctuation(html: string): string {
  return html
    .replace(/\s+[\u2014\u2013]\s+/g, ". ")
    .replace(/[\u2014\u2013]/g, "-");
}

const IMAGE_KIND_OFFSET: Record<ReportKind, number> = {
  premium_strategy: 0,
  us_visa: 1,
  deep_analysis: 2,
  route: 3,
  cost: 4,
  compare: 5,
  docs: 6,
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function allocateReportImages(images: string[], kind: ReportKind, orderRef: string): string[] {
  if (images.length < 2) return [...images];
  const base = stableHash(orderRef) % images.length;
  const offset = (base + IMAGE_KIND_OFFSET[kind]) % images.length;
  return [...images.slice(offset), ...images.slice(0, offset)];
}
