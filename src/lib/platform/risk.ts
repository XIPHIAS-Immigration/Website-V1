import "server-only";

import type { RiskFlag, RiskLevel } from "./types";

export type RiskEvaluationInput = {
  fullName?: string;
  country?: string;
  program?: string;
  investmentUsd?: number;
  documents?: { label: string; status?: string; extractedName?: string }[];
  sourceOfFundsProvided?: boolean;
  pepDeclared?: boolean;
  sanctionsHit?: boolean;
};

function maxSeverity(flags: RiskFlag[]): RiskLevel {
  if (flags.some((flag) => flag.severity === "blocked")) return "blocked";
  if (flags.some((flag) => flag.severity === "high")) return "high";
  if (flags.some((flag) => flag.severity === "medium")) return "medium";
  return "low";
}

export function evaluateRisk(input: RiskEvaluationInput) {
  const flags: RiskFlag[] = [];
  const documents = input.documents ?? [];
  const name = (input.fullName ?? "").trim().toLowerCase();

  if (!name) {
    flags.push({
      code: "missing_identity_name",
      label: "Missing applicant name",
      severity: "medium",
      detail: "A named applicant is required before any due diligence review.",
    });
  }

  if (input.sanctionsHit) {
    flags.push({
      code: "sanctions_review_required",
      label: "Sanctions review required",
      severity: "blocked",
      detail: "A potential sanctions match must be reviewed by compliance staff before proceeding.",
    });
  }

  if (input.pepDeclared) {
    flags.push({
      code: "pep_review_required",
      label: "PEP review required",
      severity: "high",
      detail: "Politically exposed person declarations require senior compliance review.",
    });
  }

  if (!input.sourceOfFundsProvided && (input.investmentUsd ?? 0) >= 100000) {
    flags.push({
      code: "source_of_funds_missing",
      label: "Source of funds missing",
      severity: "high",
      detail: "Investment migration files need source-of-funds documentation before filing.",
    });
  }

  const missingDocs = documents.filter((doc) => doc.status === "requested" || !doc.status);
  if (missingDocs.length) {
    flags.push({
      code: "documents_pending",
      label: "Documents pending",
      severity: "medium",
      detail: `${missingDocs.length} document item(s) still need upload or review.`,
    });
  }

  const mismatches = documents.filter((doc) => {
    return doc.extractedName && name && doc.extractedName.trim().toLowerCase() !== name;
  });
  if (mismatches.length) {
    flags.push({
      code: "document_name_mismatch",
      label: "Document name mismatch",
      severity: "high",
      detail: "One or more extracted document names differ from the applicant profile.",
    });
  }

  const level = maxSeverity(flags);
  return {
    level,
    flags,
    requiresStaffReview: flags.length > 0,
  };
}

