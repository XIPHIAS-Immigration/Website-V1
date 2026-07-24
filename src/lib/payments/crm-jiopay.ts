import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { crmSql, getLiveCrmPool, toNumber, toText } from "@/lib/crm/live-sql";
import { getJiopayOrder, updateJiopayOrder, type JiopayOrder } from "@/lib/payments/jiopay-store";

export type CrmPaymentType = "invoice" | "receipt";

export type CrmCheckout = {
  paymentType: CrmPaymentType;
  sourceId: number;
  clientId: number;
  amountInr: number;
  productName: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
};

type GatewayPayload = Record<string, unknown>;

const finalizeJobs = globalThis as typeof globalThis & {
  xiphiasCrmJiopayFinalizeJobs?: Map<string, Promise<CrmFinalizeResult>>;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function firstText(payload: GatewayPayload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" || typeof value === "bigint") return String(value);
  }
  return "";
}

function intentMessage(paymentType: CrmPaymentType, sourceId: number, timestamp: number) {
  return `${paymentType}\n${sourceId}\n${timestamp}`;
}

export function verifyCrmCheckoutIntent(input: {
  paymentType: string;
  sourceId: number;
  timestamp: number;
  signature: string;
}) {
  if (input.paymentType !== "invoice" && input.paymentType !== "receipt") return false;
  if (!Number.isSafeInteger(input.sourceId) || input.sourceId <= 0) return false;
  if (!Number.isSafeInteger(input.timestamp)) return false;

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - input.timestamp);
  if (ageSeconds > 300) return false;

  const expected = createHmac("sha256", requiredEnv("CRM_JIOPAY_BRIDGE_SECRET"))
    .update(intentMessage(input.paymentType, input.sourceId, input.timestamp), "utf8")
    .digest("hex");
  const supplied = input.signature.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(supplied)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(supplied, "hex"));
}

function customerName(row: Record<string, unknown>) {
  return [row.FIRST_NAME, row.MIDDLE_NAME, row.LAST_NAME].map(toText).filter(Boolean).join(" ");
}

export async function loadCrmCheckout(
  paymentType: CrmPaymentType,
  sourceId: number,
): Promise<CrmCheckout | null> {
  const pool = await getLiveCrmPool("india");
  const request = pool.request().input("SourceId", crmSql.BigInt, sourceId);
  const result =
    paymentType === "invoice"
      ? await request.query(`
          SELECT TOP (1)
            i.ID AS SOURCE_ID,
            i.CLIENT_ID,
            CAST(i.DUE AS decimal(18, 2)) AS AMOUNT_INR,
            c.FIRST_NAME,
            c.MIDDLE_NAME,
            c.LAST_NAME,
            c.EMAIL,
            c.PHONE
          FROM dbo.vw_InstallmentBreakup AS i
          INNER JOIN dbo.tbl_Client AS c ON c.ID = i.CLIENT_ID
          WHERE i.ID = @SourceId AND i.DUE > 0;
        `)
      : await request.query(`
          SELECT TOP (1)
            r.ID AS SOURCE_ID,
            c.ID AS CLIENT_ID,
            CONVERT(
              decimal(18, 2),
              CASE
                WHEN ISNUMERIC(REPLACE(r.TOTAL_AMOUNT, ',', '')) = 1
                  THEN REPLACE(r.TOTAL_AMOUNT, ',', '')
                ELSE NULL
              END
            ) AS AMOUNT_INR,
            c.FIRST_NAME,
            c.MIDDLE_NAME,
            c.LAST_NAME,
            c.EMAIL,
            c.PHONE
          FROM dbo.vw_ClientReciepts AS r
          INNER JOIN dbo.tbl_Client AS c ON c.ID = r.ID
          WHERE r.ID = @SourceId
            AND r.RID = 0
            AND CONVERT(
              decimal(18, 2),
              CASE
                WHEN ISNUMERIC(REPLACE(r.TOTAL_AMOUNT, ',', '')) = 1
                  THEN REPLACE(r.TOTAL_AMOUNT, ',', '')
                ELSE NULL
              END
            ) > 0;
        `);

  const row = result.recordset[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const amountInr = toNumber(row.AMOUNT_INR);
  const clientId = toNumber(row.CLIENT_ID);
  const email = toText(row.EMAIL).toLowerCase();
  if (!(amountInr > 0) || !Number.isSafeInteger(clientId) || clientId <= 0 || !email) return null;

  return {
    paymentType,
    sourceId,
    clientId,
    amountInr,
    productName: paymentType === "invoice" ? "CRM installment payment" : "CRM pre-evaluation fee",
    customer: {
      name: customerName(row) || email,
      email,
      phone: toText(row.PHONE) || undefined,
    },
  };
}

export type CrmFinalizeResult = {
  status: "finalized" | "already_finalized";
  response?: Record<string, unknown>;
};

async function finalizeOnce(
  order: JiopayOrder,
  gatewayPayload: GatewayPayload,
): Promise<CrmFinalizeResult> {
  if (!order.crmPayment) throw new Error("Order is not a CRM payment.");
  if (order.events.some((event) => event.type === "crm_payment_finalized")) {
    return { status: "already_finalized" };
  }

  const body = JSON.stringify({
    Id: order.crmPayment.sourceId,
    ClientId: order.crmPayment.clientId,
    PaymentId: firstText(gatewayPayload, ["paymentId", "paymentID", "gatewayPaymentId"]),
    TransactionId:
      firstText(gatewayPayload, ["transactionId", "jiopayTxnId", "gatewayTxnId", "bankTxnId", "txnId"]) ||
      order.merchantTxnNo,
    ResponseCode: 0,
    ResponseMessage:
      firstText(gatewayPayload, ["responseMessage", "respMessage", "message", "status"]) || "SUCCESS",
    MerchantRefNo: order.merchantTxnNo,
    Amount: order.amountInr.toFixed(2),
    DateCreated: new Date().toISOString(),
    Description: `JioPay ${order.crmPayment.paymentType} payment`,
    Mode: "JioPay",
    BillingName: order.customer.name,
    BillingPhone: order.customer.phone || "",
    BillingEmail: order.customer.email,
    PaymentStatus: "SUCCESS",
    PaymentMode:
      firstText(gatewayPayload, ["paymentMethod", "paymentMode", "payMode", "instrumentType"]) || "JioPay",
    PType: order.crmPayment.paymentType,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", requiredEnv("CRM_JIOPAY_FINALIZE_SECRET"))
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
  const endpoint =
    process.env.CRM_JIOPAY_FINALIZE_URL?.trim() ||
    "https://www.xiphiasimmigration.com/XIPHIAS/WCFServices/JiopayFinalize.ashx";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Xiphias-Timestamp": timestamp,
      "X-Xiphias-Signature": signature,
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.ok !== true) {
    throw new Error(
      typeof data.error === "string"
        ? `CRM finalization failed: ${data.error}`
        : `CRM finalization failed with HTTP ${response.status}.`,
    );
  }

  updateJiopayOrder(order.merchantTxnNo, {}, {
    type: "crm_payment_finalized",
    at: new Date().toISOString(),
    data: {
      paymentType: order.crmPayment.paymentType,
      sourceId: order.crmPayment.sourceId,
      clientId: order.crmPayment.clientId,
      result: data,
    },
  });
  return { status: "finalized", response: data };
}

export async function finalizeCrmJiopayPayment(
  merchantTxnNo: string,
  gatewayPayload: GatewayPayload,
): Promise<CrmFinalizeResult> {
  const order = getJiopayOrder(merchantTxnNo);
  if (!order?.crmPayment) throw new Error("CRM JioPay order was not found.");
  if (!finalizeJobs.xiphiasCrmJiopayFinalizeJobs) finalizeJobs.xiphiasCrmJiopayFinalizeJobs = new Map();
  const running = finalizeJobs.xiphiasCrmJiopayFinalizeJobs.get(merchantTxnNo);
  if (running) return running;
  const job = finalizeOnce(order, gatewayPayload);
  finalizeJobs.xiphiasCrmJiopayFinalizeJobs.set(merchantTxnNo, job);
  try {
    return await job;
  } finally {
    finalizeJobs.xiphiasCrmJiopayFinalizeJobs.delete(merchantTxnNo);
  }
}
