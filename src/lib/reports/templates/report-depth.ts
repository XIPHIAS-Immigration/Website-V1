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

/**
 * Product depth is intentionally tied to the public catalogue price. The range is a
 * design target, not padding: optional programme data may move a report a few pages.
 */
export const REPORT_DEPTH: Record<ReportKind, ReportDepthContract> = {
  premium_strategy: {
    priceInr: 1000,
    targetPages: [30, 36],
    maxProgrammes: 1,
    primaryDossierSections: ["divider", "snapshot", "eligibility", "documents", "risk"],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  us_visa: {
    priceInr: 1000,
    targetPages: [24, 32],
    maxProgrammes: 2,
    primaryDossierSections: ["divider", "snapshot", "eligibility", "scoring", "documents", "risk"],
    alternativeDossierSections: ["divider", "snapshot", "eligibility", "risk"],
    maxNarrativeSections: 0,
  },
  deep_analysis: {
    priceInr: 4999,
    targetPages: [40, 48],
    maxProgrammes: 1,
    primaryDossierSections: ["divider", "documents"],
    alternativeDossierSections: ["divider", "snapshot", "eligibility", "scoring", "documents", "risk"],
    maxNarrativeSections: 0,
  },
  route: {
    priceInr: 499,
    targetPages: [18, 22],
    maxProgrammes: 1,
    primaryDossierSections: ["divider", "snapshot", "eligibility", "costs", "process", "risk"],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  due_diligence: {
    priceInr: 499,
    targetPages: [12, 15],
    maxProgrammes: 0,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  cost: {
    priceInr: 499,
    targetPages: [15, 18],
    maxProgrammes: 1,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  compare: {
    priceInr: 499,
    targetPages: [14, 17],
    maxProgrammes: 0,
    primaryDossierSections: [],
    alternativeDossierSections: [],
    maxNarrativeSections: 0,
  },
  docs: {
    priceInr: 499,
    targetPages: [14, 17],
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
  due_diligence: 7,
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
