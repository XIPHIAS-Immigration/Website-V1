import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const DEFAULT_SITE_URL = "https://www.xiphiasimmigration.com";

export type JiopayPrimitive = string | number | boolean | null | undefined;
export type JiopayPayload = Record<string, JiopayPrimitive>;
export type JiopayUnknownPayload = Record<string, unknown>;

export type JiopayConfig = {
  merchantId: string;
  secretKey: string;
  initiateSaleUrl: string;
  statusUrl?: string;
  siteUrl: string;
  returnUrl: string;
  webhookUrl: string;
  mode: "uat" | "production";
};

export type JiopayCheckoutInput = {
  merchantTxnNo: string;
  amountInr: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productType: string;
  productName: string;
  returnUrl?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Jiopay integration.`);
  return value;
}

export function getSiteUrl(req?: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (fromEnv) return trimTrailingSlash(fromEnv);
  if (req) return trimTrailingSlash(req.nextUrl.origin);
  return DEFAULT_SITE_URL;
}

export function getJiopayConfig(req?: NextRequest): JiopayConfig {
  const siteUrl = getSiteUrl(req);
  const mode = process.env.JIOPAY_MODE === "production" ? "production" : "uat";
  return {
    mode,
    merchantId: requireEnv("JIOPAY_MERCHANT_ID"),
    secretKey: requireEnv("JIOPAY_SECRET_KEY"),
    initiateSaleUrl: requireEnv("JIOPAY_INITIATE_SALE_URL"),
    statusUrl: process.env.JIOPAY_STATUS_URL?.trim(),
    siteUrl,
    returnUrl:
      process.env.JIOPAY_RETURN_URL?.trim() ||
      `${siteUrl}/api/payments/jiopay/return`,
    webhookUrl:
      process.env.JIOPAY_WEBHOOK_URL?.trim() ||
      `${siteUrl}/api/payments/jiopay/webhook`,
  };
}

export function makeJiopayTxnNo() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `XI${stamp}${suffix}`.slice(0, 20);
}

export function formatJiopayAmount(amountInr: number) {
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    throw new Error("Jiopay amount must be a positive number.");
  }
  return amountInr.toFixed(2);
}

function formatInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

export function makeJiopayTxnDate(date = new Date()) {
  return formatInTimeZone(date, "Asia/Kolkata");
}

function normalizeHashValue(value: unknown) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function jiopayHashString(payload: JiopayUnknownPayload) {
  return Object.keys(payload)
    .filter((key) => key !== "secureHash" && payload[key] !== undefined && payload[key] !== null)
    .sort()
    .map((key) => normalizeHashValue(payload[key]))
    .join("");
}

export function createJiopaySecureHash(payload: JiopayUnknownPayload, secretKey: string) {
  return createHmac("sha256", secretKey).update(jiopayHashString(payload), "utf8").digest("hex");
}

export function verifyJiopaySecureHash(payload: JiopayUnknownPayload, secretKey: string) {
  const supplied = normalizeHashValue(payload.secureHash).trim().toLowerCase();
  if (!supplied) return false;
  const expected = createJiopaySecureHash(payload, secretKey).toLowerCase();
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function buildJiopaySalePayload(input: JiopayCheckoutInput, config: JiopayConfig): JiopayPayload {
  const payload: JiopayPayload = {
    merchantId: config.merchantId,
    merchantTxnNo: input.merchantTxnNo,
    amount: formatJiopayAmount(input.amountInr),
    currencyCode: "356",
    payType: "0",
    transactionType: "SALE",
    txnDate: makeJiopayTxnDate(),
    returnURL: input.returnUrl || config.returnUrl,
    customerEmailID: input.customerEmail,
    customerMobileNo: input.customerPhone || undefined,
    customerName: input.customerName,
    addlParam1: input.productType,
    addlParam2: input.productName.slice(0, 120),
  };
  return {
    ...payload,
    secureHash: createJiopaySecureHash(payload, config.secretKey),
  };
}

function findStringByKey(payload: JiopayUnknownPayload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function jiopayResponseCode(payload: JiopayUnknownPayload) {
  return findStringByKey(payload, ["responseCode", "respCode", "statusCode", "code"]);
}

export function jiopayStatusLabel(payload: JiopayUnknownPayload) {
  return findStringByKey(payload, [
    "txnStatus",
    "transactionStatus",
    "status",
    "paymentStatus",
    "responseMessage",
    "respMessage",
    "message",
  ]);
}

export function extractJiopayMerchantTxnNo(payload: JiopayUnknownPayload) {
  return findStringByKey(payload, [
    "merchantTxnNo",
    "merchantTransactionNo",
    "merchantTranId",
    "orderId",
    "txnId",
  ]);
}

export function isJiopaySuccess(payload: JiopayUnknownPayload) {
  const responseCode = jiopayResponseCode(payload).toUpperCase();
  const status = jiopayStatusLabel(payload).toUpperCase();
  return (
    responseCode === "0000" ||
    responseCode === "0" ||
    status === "SUCCESS" ||
    status === "CAPTURED" ||
    status === "PAID" ||
    status === "SALE"
  );
}

export function resolveJiopayCheckoutUrl(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const redirectUri =
      typeof record.redirectURI === "string"
        ? record.redirectURI
        : typeof record.redirectUrl === "string"
          ? record.redirectUrl
          : typeof record.redirectURL === "string"
            ? record.redirectURL
            : "";
    const tranCtx = typeof record.tranCtx === "string" ? record.tranCtx : "";
    if (redirectUri && /^https?:\/\//i.test(redirectUri) && tranCtx) {
      const url = new URL(redirectUri);
      url.searchParams.set("tranCtx", tranCtx);
      return url.toString();
    }
  }

  const queue: unknown[] = [payload];
  const preferredKeys = /redirect|checkout|payment|url|uri/i;
  while (queue.length) {
    const item = queue.shift();
    if (!item || typeof item !== "object") continue;
    for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
      if (typeof value === "string" && /^https?:\/\//i.test(value) && preferredKeys.test(key)) {
        return value;
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return "";
}

export function publicJiopayPayload(payload: JiopayUnknownPayload) {
  const clone: JiopayUnknownPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (/hash|secret|token|key/i.test(key)) continue;
    clone[key] = value;
  }
  return clone;
}

export async function initiateJiopaySale(input: JiopayCheckoutInput, config: JiopayConfig) {
  const requestPayload = buildJiopaySalePayload(input, config);
  const response = await fetch(config.initiateSaleUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestPayload),
    cache: "no-store",
  });
  const rawText = await response.text();
  let parsed: JiopayUnknownPayload = {};
  try {
    parsed = JSON.parse(rawText) as JiopayUnknownPayload;
  } catch {
    parsed = { raw: rawText };
  }
  return {
    ok: response.ok,
    status: response.status,
    requestPayload,
    responsePayload: parsed,
    checkoutUrl: resolveJiopayCheckoutUrl(parsed),
  };
}
