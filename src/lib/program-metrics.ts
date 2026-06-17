// src/lib/program-metrics.ts
// -----------------------------------------------------------------------------
// Shared metric helpers for the Program Comparison and Program Index tools.
// Centralizes the passport-power join and the honest labels for fields we must
// NOT fabricate (physical presence is the residency proxy; tax is unsourced).
// Pure + client-safe (passport-index is static data).
// -----------------------------------------------------------------------------

import { passportRecords, type PassportRecord } from "@/data/passport-index";

function norm(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Programme-explorer country strings sometimes come from slugs (e.g. "Usa",
// "Uae", "Saintkitts"); map them onto the passport snapshot's country names.
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "United States",
  "united states of america": "United States",
  uae: "United Arab Emirates",
  uk: "United Kingdom",
  "great britain": "United Kingdom",
  "south korea": "Korea",
  "republic of korea": "Korea",
};

const byNorm = new Map<string, PassportRecord>(passportRecords.map((record) => [norm(record.country), record]));

/**
 * Join a programme's country onto the passport-power snapshot.
 * The snapshot only covers a curated set of passports, so this often returns
 * undefined — callers MUST handle the miss with an "advisor review" placeholder.
 */
export function passportRecordForCountry(country?: string): PassportRecord | undefined {
  if (!country) return undefined;
  const n = norm(country);
  if (byNorm.has(n)) return byNorm.get(n);
  const alias = COUNTRY_ALIASES[n];
  return alias ? byNorm.get(norm(alias)) : undefined;
}

export type PresenceKey = "low" | "moderate" | "high" | "variable";

/** Honest physical-presence descriptors — the residency proxy, never day counts. */
export const PRESENCE_LABEL: Record<PresenceKey, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  variable: "Variable",
};

export const PRESENCE_DETAIL: Record<PresenceKey, string> = {
  low: "Minimal stay to maintain status (route dependent).",
  moderate: "Periodic presence / ties expected at renewal.",
  high: "Settlement or sustained presence expected.",
  variable: "Depends on the chosen sub-route — advisor review.",
};

/** We do not model tax — render this placeholder until a sourced position exists. */
export const TAX_ADVISOR_NOTE = "Not modelled — advisor review";
