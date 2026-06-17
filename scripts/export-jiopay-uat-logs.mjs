import fs from "node:fs";
import path from "node:path";

const txn = process.argv[2] || "";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://www.xiphiasimmigration.com").replace(/\/+$/, "");
const storePath = process.env.JIOPAY_STORE_PATH
  ? path.resolve(process.env.JIOPAY_STORE_PATH)
  : path.join(process.cwd(), ".xiphias-platform", "jiopay-orders.json");
const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(process.cwd(), `jiopay-uat-signoff-${txn || "latest"}.txt`);

function readStore() {
  if (!fs.existsSync(storePath)) throw new Error(`JioPay store not found: ${storePath}`);
  const parsed = JSON.parse(fs.readFileSync(storePath, "utf8"));
  return Array.isArray(parsed.orders) ? parsed.orders : [];
}

function pretty(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function findEvent(order, type) {
  return order.events?.find((event) => event.type === type) || null;
}

function shellJson(value) {
  return JSON.stringify(value ?? {}).replaceAll("'", "'\\''");
}

function block(title, body) {
  return [
    "",
    "================================================================================",
    title,
    "================================================================================",
    body,
  ].join("\n");
}

const orders = readStore();
const order = txn
  ? orders.find((item) => item.merchantTxnNo === txn)
  : orders[0];

if (!order) {
  throw new Error(txn ? `No JioPay order found for ${txn}` : "No JioPay orders found.");
}

const initiate = findEvent(order, "initiate_sale");
const webhook = findEvent(order, "webhook");
const webhookResponse = findEvent(order, "webhook_response");
const browserReturn = findEvent(order, "browser_return");

const clientCheckoutRequest = {
  name: order.customer?.name,
  email: order.customer?.email,
  phone: order.customer?.phone,
  amountInr: order.amountInr,
  productType: order.productType,
  productName: order.productName,
  track: order.track,
  country: order.country,
  program: order.program,
  page: "/xia-intelligence",
  consent: true,
};

const lines = [];
lines.push("XIPHIAS IMMIGRATION - JIOPAY UAT SIGN-OFF LOGS");
lines.push(`Generated At: ${new Date().toISOString()}`);
lines.push(`Merchant Transaction No: ${order.merchantTxnNo}`);
lines.push(`Lead ID: ${order.leadId || "-"}`);
lines.push(`Amount INR: ${order.amountInr}`);
lines.push(`Order Status: ${order.status}`);
lines.push(`Store Path: ${storePath}`);
lines.push("");
lines.push("Implemented APIs:");
lines.push("1. Initiate Sale API / Hosted Checkout");
lines.push("2. Callback URL / S2S Webhook");
lines.push("3. Return URL / B2B Browser Return");
lines.push("");
lines.push("Note: Do not include the JIOPAY_SECRET_KEY in this file. secureHash may be present only if JIOPAY_LOG_FULL_PAYLOADS=true was enabled before the UAT test.");

lines.push(block(
  "1A. XIPHIAS CREATE CHECKOUT API - cURL REQUEST",
  [
    `curl -X POST "${siteUrl}/api/payments/jiopay/create-checkout" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  --data '${shellJson(clientCheckoutRequest)}'`,
  ].join("\n"),
));

lines.push(block(
  "1B. XIPHIAS CREATE CHECKOUT API - APPLICATION RESPONSE",
  pretty({
    ok: true,
    merchantTxnNo: order.merchantTxnNo,
    leadId: order.leadId,
    checkoutUrl: order.checkoutUrl,
    jiopay: initiate?.data?.response,
  }),
));

lines.push(block(
  "2A. JIOPAY INITIATE SALE API - cURL REQUEST SENT BY XIPHIAS SERVER",
  initiate?.data?.request
    ? [
        `curl -X POST "${process.env.JIOPAY_INITIATE_SALE_URL || "[JIOPAY_INITIATE_SALE_URL]"}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  --data '${shellJson(initiate.data.request)}'`,
      ].join("\n")
    : "Not available in the order log. Run a fresh UAT transaction after deploying the audit logging update.",
));

lines.push(block(
  "2B. JIOPAY INITIATE SALE API - RESPONSE RECEIVED BY XIPHIAS SERVER",
  pretty(initiate?.data?.response || {}),
));

lines.push(block(
  "3A. JIOPAY CALLBACK URL / S2S WEBHOOK - cURL REPRESENTATION",
  webhook?.data?.receivedPayload
    ? [
        `curl -X POST "${siteUrl}/api/payments/jiopay/webhook" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  --data '${shellJson(webhook.data.receivedPayload)}'`,
      ].join("\n")
    : "Not available in the order log. Complete S2S callback was not captured for this transaction.",
));

lines.push(block(
  "3B. JIOPAY CALLBACK URL / S2S WEBHOOK - RESPONSE RETURNED BY XIPHIAS",
  pretty(webhookResponse?.data || {}),
));

lines.push(block(
  "4A. JIOPAY RETURN URL / B2B BROWSER RETURN - cURL REPRESENTATION",
  browserReturn?.data?.receivedPayload
    ? [
        `curl -X POST "${siteUrl}/api/payments/jiopay/return" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  --data '${shellJson(browserReturn.data.receivedPayload)}'`,
      ].join("\n")
    : "Not available in the order log. Complete B2B return payload was not captured for this transaction.",
));

lines.push(block(
  "4B. JIOPAY RETURN URL / B2B BROWSER RETURN - APPLICATION RESPONSE",
  pretty(browserReturn?.data?.appResponse || {}),
));

lines.push(block("FULL ORDER EVENT AUDIT", pretty(order)));

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log(outputPath);
