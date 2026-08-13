import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ClientCase } from "./client-case";
import type { ReportKind } from "@/lib/payments/product-catalog";

export type SavedReportCase = {
  id: string;
  reference: string;
  reportKind: ReportKind;
  productType: string;
  customerEmail: string;
  customerName: string;
  version: number;
  status: ClientCase["reviewStatus"];
  createdAt: string;
  createdBy: string;
  clientCase: ClientCase;
};

type CaseStore = { reports: SavedReportCase[] };

function storePath() {
  return process.env.XIPHIAS_REPORT_CASE_STORE_PATH
    ? path.resolve(process.env.XIPHIAS_REPORT_CASE_STORE_PATH)
    : path.join(process.cwd(), ".xiphias-platform", "report-cases.json");
}

function readStore(): CaseStore {
  try {
    if (!existsSync(storePath())) return { reports: [] };
    const parsed = JSON.parse(readFileSync(storePath(), "utf8")) as Partial<CaseStore>;
    return { reports: Array.isArray(parsed.reports) ? parsed.reports : [] };
  } catch (error) {
    console.warn("[reports] Could not read report case store.", error);
    return { reports: [] };
  }
}

function writeStore(store: CaseStore) {
  mkdirSync(path.dirname(storePath()), { recursive: true });
  writeFileSync(storePath(), JSON.stringify(store, null, 2));
}

export function saveReportCase(input: Omit<SavedReportCase, "id" | "version" | "createdAt">): SavedReportCase {
  const store = readStore();
  const version = 1 + Math.max(0, ...store.reports.filter((item) => item.reference === input.reference && item.reportKind === input.reportKind).map((item) => item.version));
  const saved: SavedReportCase = {
    ...input,
    id: `report_${randomUUID().slice(0, 12)}`,
    version,
    createdAt: new Date().toISOString(),
  };
  store.reports.unshift(saved);
  writeStore(store);
  return saved;
}

export function listReportCases(limit = 50): SavedReportCase[] {
  return readStore().reports.slice(0, Math.max(1, Math.min(250, limit)));
}

export function getLatestReportCase(reference: string, reportKind?: ReportKind): SavedReportCase | null {
  return readStore().reports.find((item) => item.reference === reference && (!reportKind || item.reportKind === reportKind)) ?? null;
}
