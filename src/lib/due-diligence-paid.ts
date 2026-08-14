import type { DueDiligenceInput } from "@/lib/due-diligence";

export type PaidDueDiligenceInput = {
  fullLegalName: string;
  dateOfBirth: string;
  nationality: string;
  residenceCountry: string;
  passportExpiry: string;
  aliases: string;
  familyMembers: string;
  countriesLivedIn: string;
  travelHistory: string;
  visaHistory: string;
  refusalDetails: string;
  overstayDetails: string;
  legalDetails: string;
  pepDetails: string;
  employmentTimeline: string;
  educationTimeline: string;
  timelineGaps: string;
  passportEvidence: string;
  addressEvidence: string;
  policeEvidence: string;
  employmentEvidenceDetail: string;
  educationEvidenceDetail: string;
  cpaAssessment: string;
  assessingBody: string;
  familyEvidenceDetail: string;
  documentInconsistencies: string;
  sourceOfWealth: string;
  sourceOfFunds: string;
  availableFunds: string;
  annualIncome: string;
  fundsHeldPeriod: string;
  largeDeposits: string;
  thirdPartyDetails: string;
  financialEvidence: string;
  counterpartyType: string;
  counterpartyName: string;
  counterpartyCountry: string;
  counterpartyChecks: string;
  paymentInstructions: string;
  adverseConcerns: string;
  objectives: string;
  reviewerQuestions: string;
  accuracyConfirmed: boolean;
  consentConfirmed: boolean;
};

export type PaidDueDiligenceFinding = {
  code: string;
  area: string;
  severity: "information" | "attention" | "high" | "hold";
  title: string;
  observation: string;
  action: string;
};

export type PaidDueDiligenceAnalysis = {
  completeness: number;
  overall: "prepared" | "attention" | "high" | "hold";
  overallLabel: string;
  findings: PaidDueDiligenceFinding[];
  evidenceRows: Array<[string, string, string]>;
  declaredFacts: Array<[string, string]>;
  nextActions: string[];
};

export const defaultPaidDueDiligenceInput: PaidDueDiligenceInput = {
  fullLegalName: "",
  dateOfBirth: "",
  nationality: "",
  residenceCountry: "",
  passportExpiry: "",
  aliases: "",
  familyMembers: "",
  countriesLivedIn: "",
  travelHistory: "",
  visaHistory: "",
  refusalDetails: "",
  overstayDetails: "",
  legalDetails: "",
  pepDetails: "",
  employmentTimeline: "",
  educationTimeline: "",
  timelineGaps: "",
  passportEvidence: "not-provided",
  addressEvidence: "not-provided",
  policeEvidence: "not-provided",
  employmentEvidenceDetail: "not-provided",
  educationEvidenceDetail: "not-provided",
  cpaAssessment: "",
  assessingBody: "",
  familyEvidenceDetail: "not-applicable",
  documentInconsistencies: "",
  sourceOfWealth: "",
  sourceOfFunds: "",
  availableFunds: "",
  annualIncome: "",
  fundsHeldPeriod: "",
  largeDeposits: "",
  thirdPartyDetails: "",
  financialEvidence: "not-provided",
  counterpartyType: "none",
  counterpartyName: "",
  counterpartyCountry: "",
  counterpartyChecks: "not-applicable",
  paymentInstructions: "",
  adverseConcerns: "",
  objectives: "",
  reviewerQuestions: "",
  accuracyConfirmed: false,
  consentConfirmed: false,
};

const evidenceLabels: Record<string, string> = {
  complete: "Declared complete",
  partial: "Partial",
  missing: "Missing",
  "not-provided": "Not provided",
  "not-applicable": "Not applicable",
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function display(value: unknown) {
  return clean(value) || "Not provided";
}

function evidenceStatus(value: string) {
  return evidenceLabels[value] || display(value);
}

function addEvidenceFinding(
  findings: PaidDueDiligenceFinding[],
  area: string,
  code: string,
  label: string,
  value: string,
  action: string,
) {
  if (value === "missing" || value === "not-provided") {
    findings.push({
      code,
      area,
      severity: "high",
      title: `${label} is ${value === "missing" ? "missing" : "not provided"}`,
      observation: `The paid intake does not contain a complete ${label.toLowerCase()} evidence position.`,
      action,
    });
  } else if (value === "partial") {
    findings.push({
      code,
      area,
      severity: "attention",
      title: `${label} is incomplete`,
      observation: `The applicant reported that only part of the ${label.toLowerCase()} evidence is available.`,
      action,
    });
  }
}

export function paidInputFromAnswers(answers: Record<string, unknown> | undefined): PaidDueDiligenceInput {
  const source = answers ?? {};
  const output = { ...defaultPaidDueDiligenceInput };
  for (const key of Object.keys(output) as Array<keyof PaidDueDiligenceInput>) {
    if (key === "accuracyConfirmed" || key === "consentConfirmed") {
      const value = source[key];
      output[key] = (value === true || value === "true" || value === "yes") as never;
    } else if (source[key] != null) {
      output[key] = clean(source[key]) as never;
    }
  }
  return output;
}

export function paidAnswers(input: PaidDueDiligenceInput, freeInput?: DueDiligenceInput) {
  return {
    ...input,
    ...(freeInput ? { freeAssessment: JSON.stringify(freeInput) } : {}),
    paidIntakeCompleted: true,
    paidIntakeVersion: 1,
    dataSource: "Client paid due-diligence intake",
    reviewStatus: "draft",
  };
}

export function analysePaidDueDiligence(input: PaidDueDiligenceInput): PaidDueDiligenceAnalysis {
  const findings: PaidDueDiligenceFinding[] = [];

  if (!clean(input.fullLegalName) || !clean(input.dateOfBirth) || !clean(input.nationality)) {
    findings.push({
      code: "identity-core-incomplete",
      area: "Identity",
      severity: "hold",
      title: "Core identity information is incomplete",
      observation: "Full legal name, date of birth and nationality are required to establish the subject of review.",
      action: "Complete the core identity record and reconcile it against a valid passport.",
    });
  }
  addEvidenceFinding(findings, "Identity", "passport-evidence", "Passport evidence", input.passportEvidence, "Provide a clear valid passport copy, including all relevant pages.");
  addEvidenceFinding(findings, "Identity", "address-evidence", "Address evidence", input.addressEvidence, "Provide current address or residence evidence where the programme or screening scope requires it.");

  if (!clean(input.visaHistory)) {
    findings.push({
      code: "visa-history-not-provided",
      area: "Immigration history",
      severity: "high",
      title: "Immigration history is not documented",
      observation: "No consolidated visa, status, refusal or application history was supplied.",
      action: "Prepare a dated chronology covering visas, applications, refusals, cancellations, overstays and removals.",
    });
  }
  if (clean(input.refusalDetails) && !/\b(no|none|not applicable|never)\b/i.test(input.refusalDetails)) {
    findings.push({
      code: "refusal-declared",
      area: "Immigration history",
      severity: "high",
      title: "Previous visa issue requires reconciliation",
      observation: input.refusalDetails,
      action: "Obtain the decision record and keep the explanation consistent across every future filing.",
    });
  }
  if (clean(input.overstayDetails) && !/\b(no|none|not applicable|never)\b/i.test(input.overstayDetails)) {
    findings.push({
      code: "status-issue-declared",
      area: "Immigration history",
      severity: "hold",
      title: "Status, cancellation or overstay issue declared",
      observation: input.overstayDetails,
      action: "Pause filing strategy until the event, dates, legal consequences and required disclosure are professionally reviewed.",
    });
  }
  if (clean(input.legalDetails) && !/\b(no|none|not applicable|never)\b/i.test(input.legalDetails)) {
    findings.push({
      code: "legal-issue-declared",
      area: "Legal and character",
      severity: "hold",
      title: "Legal or regulatory matter declared",
      observation: input.legalDetails,
      action: "Collect the relevant court, police, regulatory and disposition records for authorised professional review.",
    });
  }
  if (clean(input.pepDetails) && !/\b(no|none|not applicable|never)\b/i.test(input.pepDetails)) {
    findings.push({
      code: "pep-context-declared",
      area: "PEP and sanctions",
      severity: "high",
      title: "Political exposure context requires enhanced review",
      observation: input.pepDetails,
      action: "Document the position, dates, relationships, wealth sources and public records before provider screening.",
    });
  }

  addEvidenceFinding(findings, "Character", "police-evidence", "Police or character evidence", input.policeEvidence, "Confirm which police certificates are required and obtain current versions.");
  addEvidenceFinding(findings, "Employment", "employment-evidence", "Employment evidence", input.employmentEvidenceDetail, "Reconcile the CV against references, contracts, payroll and tax evidence.");
  addEvidenceFinding(findings, "Education", "education-evidence", "Education evidence", input.educationEvidenceDetail, "Add award certificates, transcripts and any formal assessment outcome.");

  if (clean(input.timelineGaps) && !/\b(no|none|not applicable)\b/i.test(input.timelineGaps)) {
    findings.push({
      code: "timeline-gaps",
      area: "Chronology",
      severity: "attention",
      title: "Timeline gaps or overlaps need explanation",
      observation: input.timelineGaps,
      action: "Build one month-by-month residence, study and employment chronology with supporting records.",
    });
  }
  if (clean(input.documentInconsistencies) && !/\b(no|none|not applicable)\b/i.test(input.documentInconsistencies)) {
    findings.push({
      code: "document-inconsistency",
      area: "Document integrity",
      severity: "hold",
      title: "Document inconsistency has been declared",
      observation: input.documentInconsistencies,
      action: "Do not submit conflicting evidence. Preserve originals and resolve the discrepancy with issuer-supported records.",
    });
  }

  const fundsRelevant = Boolean(clean(input.sourceOfFunds) || clean(input.availableFunds) || clean(input.financialEvidence) && input.financialEvidence !== "not-applicable");
  if (fundsRelevant) {
    if (!clean(input.sourceOfWealth) || !clean(input.sourceOfFunds)) {
      findings.push({
        code: "funds-origin-incomplete",
        area: "Source of funds",
        severity: "high",
        title: "Wealth and fund origins are incomplete",
        observation: "The intake does not separately explain how wealth was created and which source will fund the immigration objective.",
        action: "Describe each wealth-generating event and each account or transfer in the proposed funding path.",
      });
    }
    addEvidenceFinding(findings, "Source of funds", "financial-evidence", "Financial evidence", input.financialEvidence, "Prepare bank, tax, ownership and transaction records linking origin to intended use.");
  }
  if (clean(input.largeDeposits) && !/\b(no|none|not applicable)\b/i.test(input.largeDeposits)) {
    findings.push({
      code: "large-deposits",
      area: "Source of funds",
      severity: "high",
      title: "Large or unusual deposits need a source trail",
      observation: input.largeDeposits,
      action: "Match every material deposit to a lawful generating event and its supporting documents.",
    });
  }
  if (clean(input.thirdPartyDetails) && !/\b(no|none|not applicable)\b/i.test(input.thirdPartyDetails)) {
    findings.push({
      code: "third-party-funds",
      area: "Source of funds",
      severity: "high",
      title: "Third-party funding expands the due-diligence scope",
      observation: input.thirdPartyDetails,
      action: "Identify the provider, relationship, capacity, lawful origin and complete transfer path.",
    });
  }

  if (input.counterpartyType !== "none") {
    if (!clean(input.counterpartyName) || input.counterpartyChecks === "not-provided") {
      findings.push({
        code: "counterparty-incomplete",
        area: "Counterparty",
        severity: "high",
        title: "Material counterparty is not sufficiently identified",
        observation: `Type: ${display(input.counterpartyType)}; name: ${display(input.counterpartyName)}; checks: ${evidenceStatus(input.counterpartyChecks)}.`,
        action: "Confirm the legal entity, licence, ownership, key people, regulatory status and payment instructions.",
      });
    }
  }
  if (clean(input.adverseConcerns) && !/\b(no|none|not applicable)\b/i.test(input.adverseConcerns)) {
    findings.push({
      code: "adverse-concern",
      area: "Counterparty",
      severity: "hold",
      title: "Adverse concern requires independent review",
      observation: input.adverseConcerns,
      action: "Do not transfer money or rely on the counterparty until ownership, authority and adverse information are resolved.",
    });
  }

  const completenessFields: Array<keyof PaidDueDiligenceInput> = [
    "fullLegalName", "dateOfBirth", "nationality", "residenceCountry", "countriesLivedIn", "visaHistory",
    "employmentTimeline", "educationTimeline", "passportEvidence", "policeEvidence", "objectives",
  ];
  const completed = completenessFields.filter((key) => clean(input[key]) && input[key] !== "not-provided").length;
  const completeness = Math.round((completed / completenessFields.length) * 100);
  const overall = findings.some((finding) => finding.severity === "hold")
    ? "hold"
    : findings.filter((finding) => finding.severity === "high").length >= 2
      ? "high"
      : findings.length
        ? "attention"
        : "prepared";
  const overallLabel = overall === "hold"
    ? "Pause for professional review"
    : overall === "high"
      ? "Enhanced evidence review required"
      : overall === "attention"
        ? "Evidence preparation required"
        : "Prepared for independent verification";

  const evidenceRows: Array<[string, string, string]> = [
    ["Passport", evidenceStatus(input.passportEvidence), "Identity and nationality"],
    ["Address/residence", evidenceStatus(input.addressEvidence), "Residence and jurisdiction"],
    ["Police/character", evidenceStatus(input.policeEvidence), "Character and admissibility"],
    ["Employment", evidenceStatus(input.employmentEvidenceDetail), "Experience and occupation claims"],
    ["Education", evidenceStatus(input.educationEvidenceDetail), "Qualification and assessing-body claims"],
    ["Family/civil", evidenceStatus(input.familyEvidenceDetail), "Relationship and dependant claims"],
    ["Financial", evidenceStatus(input.financialEvidence), "Wealth and transaction trail"],
    ["Counterparty", evidenceStatus(input.counterpartyChecks), "Ownership, authority and reputation"],
  ];
  const declaredFacts: Array<[string, string]> = [
    ["Full legal name", display(input.fullLegalName)],
    ["Date of birth", display(input.dateOfBirth)],
    ["Nationality", display(input.nationality)],
    ["Current residence", display(input.residenceCountry)],
    ["Passport expiry", display(input.passportExpiry)],
    ["Other names / aliases", display(input.aliases)],
    ["Countries lived in", display(input.countriesLivedIn)],
    ["Available funds", display(input.availableFunds)],
  ];
  const nextActions = findings
    .sort((a, b) => ({ hold: 4, high: 3, attention: 2, information: 1 }[b.severity] - { hold: 4, high: 3, attention: 2, information: 1 }[a.severity]))
    .map((finding) => finding.action)
    .filter((action, index, all) => all.indexOf(action) === index)
    .slice(0, 8);
  if (!nextActions.length) {
    nextActions.push(
      "Submit the declared evidence for independent document and identity verification.",
      "Run provider-backed PEP, sanctions and adverse-media screening.",
      "Have a XIPHIAS advisor confirm programme-specific disclosure and filing requirements.",
    );
  }

  return { completeness, overall, overallLabel, findings, evidenceRows, declaredFacts, nextActions };
}
