import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type JiopayOrderStatus =
  | "initiated"
  | "checkout_created"
  | "returned"
  | "paid"
  | "failed"
  | "provisioned";

export type JiopayOrder = {
  merchantTxnNo: string;
  leadId?: string;
  amountInr: number;
  productType: string;
  productName: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  track?: string;
  country?: string;
  program?: string;
  answers?: Record<string, unknown>;
  status: JiopayOrderStatus;
  checkoutUrl?: string;
  lastResponseCode?: string;
  lastStatusLabel?: string;
  createdAt: string;
  updatedAt: string;
  events: {
    type: string;
    at: string;
    data?: Record<string, unknown>;
  }[];
};

type JiopayStore = {
  orders: JiopayOrder[];
};

function nowIso() {
  return new Date().toISOString();
}

function getStorePath() {
  return process.env.JIOPAY_STORE_PATH
    ? path.resolve(process.env.JIOPAY_STORE_PATH)
    : path.join(process.cwd(), ".xiphias-platform", "jiopay-orders.json");
}

function emptyStore(): JiopayStore {
  return { orders: [] };
}

function readStore(): JiopayStore {
  const storePath = getStorePath();
  try {
    if (!existsSync(storePath)) return emptyStore();
    const parsed = JSON.parse(readFileSync(storePath, "utf8")) as Partial<JiopayStore>;
    return { orders: Array.isArray(parsed.orders) ? parsed.orders : [] };
  } catch (error) {
    console.warn("[jiopay] Could not read Jiopay store.", error);
    return emptyStore();
  }
}

function writeStore(store: JiopayStore) {
  const storePath = getStorePath();
  try {
    mkdirSync(path.dirname(storePath), { recursive: true });
    writeFileSync(storePath, JSON.stringify(store, null, 2));
  } catch (error) {
    console.warn("[jiopay] Could not persist Jiopay store.", error);
  }
}

export function getJiopayStorePath() {
  return getStorePath();
}

export function saveJiopayOrder(order: Omit<JiopayOrder, "createdAt" | "updatedAt" | "events"> & {
  createdAt?: string;
  updatedAt?: string;
  events?: JiopayOrder["events"];
}) {
  const store = readStore();
  const createdAt = order.createdAt ?? nowIso();
  const next: JiopayOrder = {
    ...order,
    createdAt,
    updatedAt: order.updatedAt ?? createdAt,
    events: order.events ?? [{ type: "created", at: createdAt }],
  };
  const index = store.orders.findIndex((item) => item.merchantTxnNo === next.merchantTxnNo);
  if (index >= 0) store.orders[index] = next;
  else store.orders.unshift(next);
  writeStore(store);
  return next;
}

export function getJiopayOrder(merchantTxnNo: string) {
  const needle = merchantTxnNo.trim();
  return readStore().orders.find((order) => order.merchantTxnNo === needle) ?? null;
}

export function updateJiopayOrder(
  merchantTxnNo: string,
  patch: Partial<Omit<JiopayOrder, "merchantTxnNo" | "createdAt" | "events">>,
  event?: JiopayOrder["events"][number],
) {
  const store = readStore();
  const order = store.orders.find((item) => item.merchantTxnNo === merchantTxnNo);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: nowIso() });
  if (event) order.events.unshift(event);
  writeStore(store);
  return order;
}

