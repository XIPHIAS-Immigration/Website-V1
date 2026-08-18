import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig } from "@/lib/payments/product-catalog";

type GatewayPayload = Record<string, unknown>;

const REGISTRATION_PRICE_INR = getProductConfig("registration")?.priceInr ?? 5000;
const REGISTRATION_BASE_AMOUNT = Math.round((REGISTRATION_PRICE_INR / 1.18) * 100) / 100;
const REGISTRATION_GST_AMOUNT = Math.round((REGISTRATION_PRICE_INR - REGISTRATION_BASE_AMOUNT) * 100) / 100;

export type CrmPaidRegistrationResult = {
  ok: true;
  clientId: number;
  receiptId: number;
  onlinePaymentId: number;
  registrationStatus: "REGISTERED";
  paymentStatus: "PAID";
  reportStatus: "PENDING_INTAKE";
  accessUrl: string;
  idempotent: boolean;
};

function requiredSecret() {
  const value =
    process.env.CRM_PAID_REGISTRATION_SECRET?.trim() ||
    process.env.CRM_JIOPAY_BRIDGE_SECRET?.trim() ||
    process.env.CRM_JIOPAY_FINALIZE_SECRET?.trim();
  if (!value) throw new Error("CRM_PAID_REGISTRATION_SECRET is required.");
  return value;
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function firstText(payload: GatewayPayload, keys: string[]) {
  for (const key of keys) {
    const value = text(payload[key]);
    if (value) return value;
  }
  return "";
}

function safeEqual(expected: string, supplied: string) {
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function provisionCrmPaidRegistration(
  order: JiopayOrder,
  gatewayPayload: GatewayPayload,
): Promise<CrmPaidRegistrationResult> {
  if (order.productType !== "registration") throw new Error("Order is not a paid registration.");
  if (Math.abs(order.amountInr - REGISTRATION_PRICE_INR) > 0.01) {
    throw new Error(`Paid registration total must be ₹${REGISTRATION_PRICE_INR.toLocaleString("en-IN")} including GST.`);
  }

  const body = JSON.stringify({
    merchantReference: order.merchantTxnNo,
    providerTransactionId:
      firstText(gatewayPayload, ["transactionId", "jiopayTxnId", "gatewayTxnId", "bankTxnId", "txnId"]) ||
      order.merchantTxnNo,
    gatewayPaymentId: firstText(gatewayPayload, ["paymentId", "paymentID", "gatewayPaymentId"]),
    responseMessage:
      firstText(gatewayPayload, ["responseMessage", "respMessage", "message", "transactionStatus", "status"]) ||
      "SUCCESS",
    paymentMethod:
      firstText(gatewayPayload, ["paymentMethod", "paymentMode", "payMode", "instrumentType"]) || "JioPay",
    productType: order.productType,
    productName: order.productName,
    name: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone || "",
    track: order.track || "skilled",
    targetCountry: order.country || "",
    primaryGoal: order.program || "Full immigration assessment",
    baseAmount: REGISTRATION_BASE_AMOUNT,
    gstAmount: REGISTRATION_GST_AMOUNT,
    totalAmount: REGISTRATION_PRICE_INR,
    currency: "INR",
    deepAnalysisIncluded: true,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", requiredSecret()).update(`${timestamp}.${body}`, "utf8").digest("hex");
  const endpoint =
    process.env.CRM_PAID_REGISTRATION_URL?.trim() ||
    "https://www.xiphiasimmigration.com/XIPHIAS/PaidRegistrationFinalize.ashx";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Xiphias-Timestamp": timestamp,
      "X-Xiphias-Signature": signature,
    },
    body,
    cache: "no-store",
  });
  const raw = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // The HTTP status below remains the authoritative failure signal.
  }
  if (!response.ok || data.ok !== true) {
    const message = typeof data.error === "string" ? data.error : `CRM registration failed with HTTP ${response.status}.`;
    throw new Error(message);
  }

  const result = data as unknown as CrmPaidRegistrationResult & { responseSignature?: string };
  const responseSignature = typeof result.responseSignature === "string" ? result.responseSignature : "";
  const expectedResponseSignature = createHmac("sha256", requiredSecret())
    .update(`${result.clientId}|${result.receiptId}|${order.merchantTxnNo}|${result.paymentStatus}`, "utf8")
    .digest("hex");
  if (!safeEqual(expectedResponseSignature, responseSignature)) {
    throw new Error("CRM paid-registration response signature is invalid.");
  }
  if (!Number.isSafeInteger(result.clientId) || result.clientId <= 0 || !result.accessUrl) {
    throw new Error("CRM returned an incomplete paid-registration result.");
  }
  return result;
}
