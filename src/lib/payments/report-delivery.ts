import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getJiopayStorePath } from "@/lib/payments/jiopay-store";
import type { ProductConfig } from "@/lib/payments/product-catalog";
import { generateReportPdf } from "@/lib/payments/report-router";

const deliveryState = globalThis as typeof globalThis & {
  xiphiasReportArtifacts?: Map<string, Promise<Buffer>>;
};

function secretKey() {
  const value = process.env.JIOPAY_SECRET_KEY?.trim();
  if (!value) throw new Error("JIOPAY_SECRET_KEY is required for report delivery.");
  return value;
}

function safeReference(merchantTxnNo: string) {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(merchantTxnNo)) {
    throw new Error("Invalid report reference.");
  }
  return merchantTxnNo;
}

function artifactPath(merchantTxnNo: string) {
  const reference = safeReference(merchantTxnNo);
  return path.join(path.dirname(getJiopayStorePath()), "paid-report-artifacts", `${reference}.pdf`);
}

function signaturePayload(merchantTxnNo: string, expires: number) {
  return `${safeReference(merchantTxnNo)}.${expires}`;
}

export function createReportDownloadGrant(merchantTxnNo: string, validityMs = 7 * 24 * 60 * 60 * 1000) {
  const expires = Date.now() + validityMs;
  const token = createHmac("sha256", secretKey())
    .update(signaturePayload(merchantTxnNo, expires), "utf8")
    .digest("hex");
  return { token, expires };
}

export function verifyReportDownloadGrant(merchantTxnNo: string, expires: number, token: string) {
  if (!Number.isSafeInteger(expires) || expires < Date.now() || expires > Date.now() + 8 * 24 * 60 * 60 * 1000) {
    return false;
  }
  const expected = createHmac("sha256", secretKey())
    .update(signaturePayload(merchantTxnNo, expires), "utf8")
    .digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(token, "hex");
  } catch {
    return false;
  }
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function reportDownloadUrl(siteUrl: string, merchantTxnNo: string) {
  const grant = createReportDownloadGrant(merchantTxnNo);
  const url = new URL("/api/payments/jiopay/report-download", siteUrl.replace(/\/+$/, ""));
  url.searchParams.set("order", merchantTxnNo);
  url.searchParams.set("expires", String(grant.expires));
  url.searchParams.set("token", grant.token);
  return url.toString();
}

export async function ensurePaidReportArtifact(order: JiopayOrder, product: ProductConfig) {
  if (!product.reportKind) throw new Error("No report template configured for this product.");
  const outputPath = artifactPath(order.merchantTxnNo);
  if (existsSync(outputPath)) return readFile(outputPath);

  if (!deliveryState.xiphiasReportArtifacts) deliveryState.xiphiasReportArtifacts = new Map();
  const existing = deliveryState.xiphiasReportArtifacts.get(order.merchantTxnNo);
  if (existing) return existing;

  const generation = (async () => {
    const pdf = await generateReportPdf(product.reportKind!, order);
    await mkdir(path.dirname(outputPath), { recursive: true });
    const temporaryPath = `${outputPath}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
    try {
      await writeFile(temporaryPath, pdf);
      try {
        await rename(temporaryPath, outputPath);
      } catch (error) {
        if (!existsSync(outputPath)) throw error;
        await unlink(temporaryPath).catch(() => undefined);
      }
      return existsSync(outputPath) ? readFile(outputPath) : pdf;
    } finally {
      await unlink(temporaryPath).catch(() => undefined);
    }
  })();

  deliveryState.xiphiasReportArtifacts.set(order.merchantTxnNo, generation);
  try {
    return await generation;
  } finally {
    deliveryState.xiphiasReportArtifacts.delete(order.merchantTxnNo);
  }
}
