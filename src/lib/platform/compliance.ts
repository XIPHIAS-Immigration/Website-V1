import "server-only";

import { createHash } from "node:crypto";

export type ComplianceScreeningInput = {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  country?: string;
  program?: string;
  declaredPep?: boolean;
};

export type ComplianceScreeningResult = {
  provider: string;
  mode: "vendor" | "demo";
  status: "clear" | "review" | "blocked";
  sanctionsHit: boolean;
  pepHit: boolean;
  adverseMediaHit: boolean;
  referenceId: string;
  checkedAt: string;
  notes: string[];
};

function referenceFor(input: ComplianceScreeningInput) {
  const raw = [input.fullName, input.dateOfBirth, input.nationality, input.country, input.program]
    .filter(Boolean)
    .join("|");
  return `cmp_${createHash("sha256").update(raw || Date.now().toString()).digest("hex").slice(0, 10)}`;
}

function boolFromUnknown(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeVendorResult(data: Record<string, unknown>, input: ComplianceScreeningInput): ComplianceScreeningResult {
  const sanctionsHit = boolFromUnknown(data.sanctionsHit ?? data.sanctions_match ?? data.sanctions);
  const pepHit = boolFromUnknown(data.pepHit ?? data.pep_match ?? data.pep) || input.declaredPep === true;
  const adverseMediaHit = boolFromUnknown(data.adverseMediaHit ?? data.adverse_media);
  const rawStatus = String(data.status ?? "").toLowerCase();
  const status =
    sanctionsHit || rawStatus === "blocked"
      ? "blocked"
      : pepHit || adverseMediaHit || rawStatus === "review"
        ? "review"
        : "clear";

  return {
    provider: String(data.provider ?? process.env.COMPLIANCE_VENDOR_NAME ?? "Configured compliance vendor"),
    mode: "vendor",
    status,
    sanctionsHit,
    pepHit,
    adverseMediaHit,
    referenceId: String(data.referenceId ?? data.id ?? referenceFor(input)),
    checkedAt: new Date().toISOString(),
    notes: Array.isArray(data.notes)
      ? data.notes.map((note) => String(note)).slice(0, 8)
      : ["Vendor screening response normalized for XIPHIAS risk review."],
  };
}

function demoScreen(input: ComplianceScreeningInput): ComplianceScreeningResult {
  const text = [input.fullName, input.nationality, input.country, input.program].join(" ").toLowerCase();
  const sanctionsHit = /\b(sanction|blocked|watchlist)\b/.test(text);
  const adverseMediaHit = /\b(adverse|fraud|litigation|criminal)\b/.test(text);
  const pepHit = input.declaredPep === true || /\b(minister|senator|mayor|politician|government official)\b/.test(text);
  const status = sanctionsHit ? "blocked" : pepHit || adverseMediaHit ? "review" : "clear";
  const notes = [
    "Demo screening only. Connect a sanctions/PEP provider before relying on live results.",
    sanctionsHit ? "Potential sanctions keyword detected in demo input." : "No demo sanctions keyword detected.",
    pepHit ? "PEP review is required." : "No demo PEP signal detected.",
    adverseMediaHit ? "Adverse media review is required." : "No demo adverse-media signal detected.",
  ];

  return {
    provider: "XIPHIAS demo compliance screen",
    mode: "demo",
    status,
    sanctionsHit,
    pepHit,
    adverseMediaHit,
    referenceId: referenceFor(input),
    checkedAt: new Date().toISOString(),
    notes,
  };
}

export async function screenApplicant(input: ComplianceScreeningInput): Promise<ComplianceScreeningResult> {
  const endpoint = process.env.COMPLIANCE_VENDOR_ENDPOINT;
  if (!endpoint) return demoScreen(input);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.COMPLIANCE_VENDOR_API_KEY
          ? { Authorization: `Bearer ${process.env.COMPLIANCE_VENDOR_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        nationality: input.nationality,
        country: input.country,
        program: input.program,
        declaredPep: input.declaredPep === true,
      }),
    });

    if (!response.ok) {
      return {
        ...demoScreen(input),
        status: "review",
        notes: [
          `Compliance vendor returned ${response.status}. Staff review is required.`,
          "The demo fallback remains visible so the workflow can continue.",
        ],
      };
    }

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return normalizeVendorResult(data, input);
  } catch (error) {
    return {
      ...demoScreen(input),
      status: "review",
      notes: [
        error instanceof Error ? error.message : "Compliance vendor request failed.",
        "Staff review is required because live screening could not complete.",
      ],
    };
  }
}
