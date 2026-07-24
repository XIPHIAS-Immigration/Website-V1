import "server-only";

import { crmSql, getLiveCrmPool } from "@/lib/crm/live-sql";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";

type Payload = Record<string, unknown>;

export type CrmPaymentRecordResult = {
  status: "inserted" | "existing";
  id: number;
  clientId: number | null;
};

function text(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return "";
}

function firstText(payload: Payload, keys: string[]) {
  for (const key of keys) {
    const value = text(payload[key]);
    if (value) return value;
  }
  return "";
}

function crmTimestamp(date = new Date()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  let hours = date.getHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()} ${String(hours).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")} ${meridiem}`;
}

/**
 * Mirrors one verified JioPay purchase to the legacy CRM's gateway ledger.
 *
 * tbl_OnlinePayments is the correct legacy target because CLIENT_ID is
 * nullable. Existing CRM clients are linked by email; new report buyers remain
 * valid purchases without fabricating a client/account record.
 *
 * The SERIALIZABLE transaction and REF_NO check make webhook retries safe.
 */
export async function recordJiopayPurchaseInCrm(
  order: JiopayOrder,
  payload: Payload,
): Promise<CrmPaymentRecordResult> {
  const pool = await getLiveCrmPool("india");
  const providerTransactionId =
    firstText(payload, [
      "transactionId",
      "jiopayTxnId",
      "gatewayTxnId",
      "bankTxnId",
      "txnId",
    ]) || order.merchantTxnNo;
  const paymentId = firstText(payload, ["paymentId", "paymentID", "gatewayPaymentId"]);
  const requestId = firstText(payload, ["requestId", "requestID", "tranCtx"]);
  const responseMessage = firstText(payload, [
    "responseMessage",
    "respMessage",
    "message",
    "transactionStatus",
    "txnStatus",
    "status",
  ]);
  const paymentMethod = firstText(payload, [
    "paymentMethod",
    "paymentMode",
    "payMode",
    "instrumentType",
  ]);

  const result = await pool
    .request()
    .input("MerchantRefNo", crmSql.NVarChar(crmSql.MAX), order.merchantTxnNo)
    .input("TransactionID", crmSql.NVarChar(crmSql.MAX), providerTransactionId)
    .input("Amount", crmSql.NVarChar(crmSql.MAX), order.amountInr.toFixed(2))
    .input("BillingEmail", crmSql.NVarChar(crmSql.MAX), order.customer.email)
    .input("BillingName", crmSql.NVarChar(crmSql.MAX), order.customer.name)
    .input("BillingPhone", crmSql.NVarChar(crmSql.MAX), order.customer.phone || null)
    .input("BillingCountry", crmSql.NVarChar(crmSql.MAX), order.country || null)
    .input("DateCreated", crmSql.NVarChar(crmSql.MAX), crmTimestamp())
    .input(
      "Description",
      crmSql.NVarChar(crmSql.MAX),
      order.crmPayment
        ? `JioPay CRM ${order.crmPayment.paymentType} payment [source ${order.crmPayment.sourceId}]`
        : `JioPay report purchase: ${order.productName} [${order.productType}]`,
    )
    .input("PaymentID", crmSql.NVarChar(crmSql.MAX), paymentId || null)
    .input("PaymentMethod", crmSql.NVarChar(crmSql.MAX), paymentMethod || "JioPay")
    .input("RequestID", crmSql.NVarChar(crmSql.MAX), requestId || null)
    // This function is called only after a verified-success callback. The
    // legacy grid recognizes exactly "0" as success, while JioPay uses values
    // such as "0000".
    .input("ResponseCode", crmSql.NVarChar(crmSql.MAX), "0")
    .input("ResponseMessage", crmSql.NVarChar(crmSql.MAX), responseMessage || "SUCCESS")
    .query(`
      SET XACT_ABORT ON;
      SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
      BEGIN TRANSACTION;

      DECLARE @ClientId bigint = ${
        order.crmPayment
          ? String(order.crmPayment.clientId)
          : `(
        SELECT TOP (1) ID
        FROM dbo.tbl_Client
        WHERE LOWER(LTRIM(RTRIM(EMAIL))) = LOWER(LTRIM(RTRIM(@BillingEmail)))
        ORDER BY ID DESC
      )`
      };

      DECLARE @ExistingId bigint = (
        SELECT TOP (1) ID
        FROM dbo.tbl_OnlinePayments WITH (UPDLOCK, HOLDLOCK)
        WHERE REF_NO = @MerchantRefNo
        ORDER BY ID DESC
      );

      IF @ExistingId IS NOT NULL
      BEGIN
        SELECT @ExistingId AS id, @ClientId AS clientId, CAST(0 AS bit) AS inserted;
      END
      ELSE
      BEGIN
        INSERT INTO dbo.tbl_OnlinePayments (
          AMOUNT,
          BILL_COUNTRY,
          BILL_EMAIL,
          BILL_NAME,
          BILL_PHONE,
          CREATED,
          DESCRIPTION,
          ISFLAGGED,
          REF_NO,
          MODE,
          PAYMENT_ID,
          PAYMENT_METHOD,
          REQUEST_ID,
          RESPONSE_CODE,
          RESPONSE_MESSAGE,
          SECURE_HASH,
          TRAN_ID,
          CLIENT_ID
        )
        OUTPUT INSERTED.ID AS id, INSERTED.CLIENT_ID AS clientId, CAST(1 AS bit) AS inserted
        VALUES (
          @Amount,
          @BillingCountry,
          @BillingEmail,
          @BillingName,
          @BillingPhone,
          @DateCreated,
          @Description,
          N'N',
          @MerchantRefNo,
          N'JioPay',
          @PaymentID,
          @PaymentMethod,
          @RequestID,
          @ResponseCode,
          @ResponseMessage,
          NULL,
          @TransactionID,
          @ClientId
        );
      END

      COMMIT TRANSACTION;
    `);

  const row = result.recordset[0] as
    | { id?: number; clientId?: number | null; inserted?: boolean }
    | undefined;
  if (!row?.id) throw new Error("CRM did not return an online-payment record ID.");

  return {
    status: row.inserted ? "inserted" : "existing",
    id: Number(row.id),
    clientId: row.clientId == null ? null : Number(row.clientId),
  };
}
