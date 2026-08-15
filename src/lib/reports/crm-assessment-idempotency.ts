import "server-only";

import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

type DeliveryRecord = {
  key: string;
  fingerprint: string;
  status: "sending" | "sent" | "failed";
  updatedAt: string;
  result?: Record<string, unknown>;
  error?: string;
};

type DeliveryStore = { deliveries: DeliveryRecord[] };

function storePath() {
  return process.env.XIPHIAS_CRM_REPORT_IDEMPOTENCY_PATH
    ? path.resolve(process.env.XIPHIAS_CRM_REPORT_IDEMPOTENCY_PATH)
    : path.join(process.cwd(), ".xiphias-platform", "crm-assessment-email.json");
}

function readStore(): DeliveryStore {
  try {
    if (!existsSync(storePath())) return { deliveries: [] };
    const parsed = JSON.parse(readFileSync(storePath(), "utf8")) as Partial<DeliveryStore>;
    return { deliveries: Array.isArray(parsed.deliveries) ? parsed.deliveries : [] };
  } catch {
    return { deliveries: [] };
  }
}

function writeStore(store: DeliveryStore) {
  const target = storePath();
  mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(store, null, 2));
  copyFileSync(temporary, target);
  try { unlinkSync(temporary); } catch { /* best effort */ }
}

export function beginCrmAssessmentEmail(key: string, fingerprint: string) {
  const store = readStore();
  const existing = store.deliveries.find((item) => item.key === key);
  if (existing && existing.fingerprint !== fingerprint) return { status: "conflict" as const };
  if (existing?.status === "sent") return { status: "sent" as const, result: existing.result };
  if (existing?.status === "sending") return { status: "sending" as const };
  const next: DeliveryRecord = { key, fingerprint, status: "sending", updatedAt: new Date().toISOString() };
  if (existing) Object.assign(existing, next);
  else store.deliveries.unshift(next);
  store.deliveries = store.deliveries.slice(0, 5000);
  writeStore(store);
  return { status: "new" as const };
}

export function completeCrmAssessmentEmail(key: string, result: Record<string, unknown>) {
  const store = readStore();
  const existing = store.deliveries.find((item) => item.key === key);
  if (!existing) throw new Error("Email idempotency record is missing.");
  existing.status = "sent";
  existing.result = result;
  existing.error = undefined;
  existing.updatedAt = new Date().toISOString();
  writeStore(store);
}

export function failCrmAssessmentEmail(key: string, error: string) {
  const store = readStore();
  const existing = store.deliveries.find((item) => item.key === key);
  if (!existing) return;
  existing.status = "failed";
  existing.error = error.slice(0, 1000);
  existing.updatedAt = new Date().toISOString();
  writeStore(store);
}
