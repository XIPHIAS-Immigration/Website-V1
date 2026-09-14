// src/lib/xia/case-store.ts
// -----------------------------------------------------------------------------
// Server-side persistence for XIA cases.
//
// Same file-store approach as jiopay-store and the platform repository, so it
// needs no new infrastructure and survives a deploy. Cases are small and expire,
// so a single JSON file is honest for the current volume — the read/write API
// below is what a database swap would replace, and nothing outside this file
// knows how storage works.
// -----------------------------------------------------------------------------

import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CASE_TTL_DAYS, createCase, mergeCase, type CaseSource, type XiaCase } from "./case";

type StoreShape = { version: 1; cases: Record<string, XiaCase> };

function storePath() {
  const configured = process.env.XIA_CASE_STORE_PATH;
  if (configured) return path.resolve(configured);
  const base = process.env.XIPHIAS_PLATFORM_STORE_PATH
    ? path.dirname(path.resolve(process.env.XIPHIAS_PLATFORM_STORE_PATH))
    : path.join(process.cwd(), ".xiphias-platform");
  return path.join(base, "xia-cases.json");
}

let cache: StoreShape | null = null;

function read(): StoreShape {
  if (cache) return cache;
  const file = storePath();
  if (!existsSync(file)) {
    cache = { version: 1, cases: {} };
    return cache;
  }
  try {
    cache = JSON.parse(readFileSync(file, "utf8")) as StoreShape;
    if (!cache?.cases) cache = { version: 1, cases: {} };
  } catch (error) {
    console.warn("[xia] Case store unreadable; starting a fresh one.", error);
    cache = { version: 1, cases: {} };
  }
  return cache;
}

function write(state: StoreShape) {
  const file = storePath();
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(state));
    cache = state;
  } catch (error) {
    // A case that cannot be persisted is not a reason to fail a visitor's
    // request — the client copy carries on and the next write may succeed.
    console.warn("[xia] Could not persist the case store.", error);
  }
}

/** Drop anything past its TTL. Called on write, so the file cannot grow forever. */
function prune(state: StoreShape) {
  const cutoff = Date.now() - CASE_TTL_DAYS * 86_400_000;
  for (const [id, item] of Object.entries(state.cases)) {
    if (Date.parse(item.updatedAt) < cutoff) delete state.cases[id];
  }
}

export function getCase(id: string): XiaCase | null {
  if (!id) return null;
  return read().cases[id] ?? null;
}

export function openCase(source: CaseSource): XiaCase {
  const state = read();
  const item = createCase(source);
  state.cases[item.id] = item;
  prune(state);
  write(state);
  return item;
}

/**
 * Merge a patch into an existing case, or open one if the id is unknown —
 * a visitor whose cookie outlived a store reset should not hit an error.
 */
export function saveCase(id: string | undefined, patch: Partial<XiaCase>, source: CaseSource = "unknown") {
  const state = read();
  const existing = id ? state.cases[id] : undefined;
  const base = existing ?? createCase(source);
  const next = mergeCase(base, patch);
  state.cases[next.id] = next;
  prune(state);
  write(state);
  return next;
}

/** For the report builder and X-Hub: the case behind a paid order. */
export function findCaseByEmail(email: string): XiaCase | null {
  if (!email) return null;
  const needle = email.trim().toLowerCase();
  const all = Object.values(read().cases).filter((item) => item.email?.toLowerCase() === needle);
  if (!all.length) return null;
  return all.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
}

export function caseStoreStatus() {
  const state = read();
  return { path: storePath(), count: Object.keys(state.cases).length };
}
