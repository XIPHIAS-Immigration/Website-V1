export type DocumentStatus =
  | "not-provided"
  | "available"
  | "partial"
  | "expired"
  | "translation"
  | "verification";

export type DocumentReadinessKey =
  | "identity"
  | "civil"
  | "education"
  | "employment"
  | "language"
  | "funds"
  | "sourceOfFunds"
  | "family"
  | "police"
  | "medical";

export type DocumentReadinessInput = Record<DocumentReadinessKey, DocumentStatus> & {
  destination: string;
  programme: string;
  notes: string;
};

export const documentGroups: Array<{ key: DocumentReadinessKey; label: string; help: string }> = [
  { key: "identity", label: "Identity documents", help: "Passport and government identity records." },
  { key: "civil", label: "Civil-status records", help: "Birth, marriage, divorce or name-change records." },
  { key: "education", label: "Education records", help: "Degrees, transcripts and relevant assessments." },
  { key: "employment", label: "Employment evidence", help: "References, contracts, payslips and role evidence." },
  { key: "language", label: "Language results", help: "Accepted test results where the route requires them." },
  { key: "funds", label: "Proof of funds", help: "Banking and asset evidence for available funds." },
  { key: "sourceOfFunds", label: "Source of funds", help: "Traceable records explaining how funds were obtained." },
  { key: "family", label: "Family records", help: "Spouse and dependant identity and relationship evidence." },
  { key: "police", label: "Police certificates", help: "Jurisdiction-specific certificates, if applicable." },
  { key: "medical", label: "Medical evidence", help: "Required medical examinations, if applicable." },
];

export const emptyDocumentReadinessInput: DocumentReadinessInput = {
  destination: "",
  programme: "",
  notes: "",
  identity: "not-provided",
  civil: "not-provided",
  education: "not-provided",
  employment: "not-provided",
  language: "not-provided",
  funds: "not-provided",
  sourceOfFunds: "not-provided",
  family: "not-provided",
  police: "not-provided",
  medical: "not-provided",
};

const STATUS_SCORE: Record<Exclude<DocumentStatus, "not-provided">, number> = {
  available: 100,
  partial: 55,
  expired: 20,
  translation: 45,
  verification: 45,
};

export function assessDocumentReadiness(input: DocumentReadinessInput) {
  const reviewed = documentGroups.filter(({ key }) => input[key] !== "not-provided");
  if (!reviewed.length) {
    return { status: "not-started" as const, percent: null, reviewed: 0, ready: [], action: [], notProvided: documentGroups.map(({ label }) => label) };
  }

  const percent = Math.round(
    reviewed.reduce((total, { key }) => total + STATUS_SCORE[input[key] as Exclude<DocumentStatus, "not-provided">], 0) /
      reviewed.length,
  );
  const ready = reviewed.filter(({ key }) => input[key] === "available").map(({ label }) => label);
  const action = reviewed.filter(({ key }) => input[key] !== "available").map(({ label, key }) => ({ label, status: input[key] }));
  const notProvided = documentGroups.filter(({ key }) => input[key] === "not-provided").map(({ label }) => label);

  return { status: "assessed" as const, percent, reviewed: reviewed.length, ready, action, notProvided };
}
