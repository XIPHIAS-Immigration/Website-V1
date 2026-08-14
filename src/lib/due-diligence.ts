export type DueDiligenceTrack =
  | "exploring"
  | "skilled"
  | "residency"
  | "citizenship"
  | "corporate"
  | "family";

export type EvidenceState = "complete" | "partial" | "missing" | "not-applicable";
export type DeclarationState = "no" | "yes" | "unsure" | "not-provided";
export type DueDiligenceSeverity = "clear" | "attention" | "high" | "hold";
export type DueDiligenceScope = "essential" | "enhanced" | "private-client" | "institutional";

export type DueDiligenceInput = {
  track: DueDiligenceTrack;
  destination: string;
  programme: string;
  applicants: "individual" | "couple" | "family";
  jurisdictions: "one" | "two-three" | "four-plus";
  identityEvidence: EvidenceState;
  identityConsistent: DeclarationState;
  immigrationHistory: EvidenceState;
  priorVisaIssue: DeclarationState;
  legalIssue: DeclarationState;
  pepExposure: DeclarationState;
  employmentEvidence: EvidenceState;
  educationEvidence: EvidenceState;
  familyEvidence: EvidenceState;
  fundsRequired: boolean;
  fundingSource: "savings" | "business" | "asset-sale" | "inheritance" | "gift-loan" | "mixed" | "not-decided";
  fundsEvidence: EvidenceState;
  thirdPartyFunds: DeclarationState;
  counterpartyStatus: "verified" | "partially-checked" | "not-checked" | "not-applicable";
  documentConcern: DeclarationState;
};

export type DueDiligenceDimension = {
  key:
    | "identity"
    | "immigration-history"
    | "legal"
    | "pep-sanctions"
    | "employment"
    | "education"
    | "family"
    | "source-of-funds"
    | "documents"
    | "counterparties";
  label: string;
  status: DueDiligenceSeverity;
  summary: string;
  basis: string;
};

export type DueDiligenceFinding = {
  code: string;
  title: string;
  severity: Exclude<DueDiligenceSeverity, "clear">;
  dimension: DueDiligenceDimension["key"];
  observation: string;
  whyItMatters: string;
  remediation: string;
  evidenceState: "declared" | "missing" | "unverified";
};

export type DueDiligenceResult = {
  scope: DueDiligenceScope;
  scopeLabel: string;
  overall: Exclude<DueDiligenceSeverity, "clear"> | "ready-for-review";
  overallLabel: string;
  readiness: number;
  completeness: number;
  headline: string;
  summary: string;
  dimensions: DueDiligenceDimension[];
  findings: DueDiligenceFinding[];
  nextActions: string[];
  verificationBoundary: string[];
};

export const defaultDueDiligenceInput: DueDiligenceInput = {
  track: "exploring",
  destination: "",
  programme: "",
  applicants: "individual",
  jurisdictions: "one",
  identityEvidence: "missing",
  identityConsistent: "not-provided",
  immigrationHistory: "missing",
  priorVisaIssue: "not-provided",
  legalIssue: "not-provided",
  pepExposure: "not-provided",
  employmentEvidence: "not-applicable",
  educationEvidence: "not-applicable",
  familyEvidence: "not-applicable",
  fundsRequired: false,
  fundingSource: "not-decided",
  fundsEvidence: "not-applicable",
  thirdPartyFunds: "not-provided",
  counterpartyStatus: "not-applicable",
  documentConcern: "not-provided",
};

const dimensionLabels: Record<DueDiligenceDimension["key"], string> = {
  identity: "Identity",
  "immigration-history": "Immigration history",
  legal: "Criminal & legal",
  "pep-sanctions": "PEP & sanctions",
  employment: "Employment",
  education: "Education",
  family: "Family evidence",
  "source-of-funds": "Source of funds",
  documents: "Document integrity",
  counterparties: "Counterparties",
};

const severityRank: Record<DueDiligenceSeverity, number> = {
  clear: 0,
  attention: 1,
  high: 2,
  hold: 3,
};

function maxSeverity(current: DueDiligenceSeverity, candidate: DueDiligenceSeverity) {
  return severityRank[candidate] > severityRank[current] ? candidate : current;
}

function evidenceScore(value: EvidenceState) {
  if (value === "complete" || value === "not-applicable") return 1;
  if (value === "partial") return 0.55;
  return 0;
}

function declarationScore(value: DeclarationState) {
  if (value === "yes" || value === "no") return 1;
  if (value === "unsure") return 0.45;
  return 0;
}

function statusForEvidence(value: EvidenceState): DueDiligenceSeverity {
  if (value === "complete" || value === "not-applicable") return "clear";
  return value === "partial" ? "attention" : "high";
}

function evidenceSummary(value: EvidenceState, complete: string, partial: string, missing: string) {
  if (value === "complete") return complete;
  if (value === "partial") return partial;
  if (value === "not-applicable") return "Not applicable to the selected profile.";
  return missing;
}

function scopeFor(input: DueDiligenceInput, findings: DueDiligenceFinding[]): DueDiligenceScope {
  if (input.track === "corporate") return "institutional";
  if (
    input.pepExposure === "yes" ||
    input.legalIssue === "yes" ||
    input.jurisdictions === "four-plus" ||
    (input.fundsRequired && ["business", "inheritance", "gift-loan", "mixed"].includes(input.fundingSource))
  ) {
    return "private-client";
  }
  if (
    input.track === "citizenship" ||
    input.fundsRequired ||
    input.priorVisaIssue === "yes" ||
    findings.some((finding) => finding.severity === "high" || finding.severity === "hold")
  ) {
    return "enhanced";
  }
  return "essential";
}

const scopeLabels: Record<DueDiligenceScope, string> = {
  essential: "Essential immigration review",
  enhanced: "Enhanced immigration due diligence",
  "private-client": "Private Client enhanced due diligence",
  institutional: "Institutional and corporate due diligence",
};

export function assessImmigrationDueDiligence(input: DueDiligenceInput): DueDiligenceResult {
  const findings: DueDiligenceFinding[] = [];
  const dimensionStatus = new Map<DueDiligenceDimension["key"], DueDiligenceSeverity>();

  const addFinding = (finding: DueDiligenceFinding) => {
    findings.push(finding);
    dimensionStatus.set(
      finding.dimension,
      maxSeverity(dimensionStatus.get(finding.dimension) ?? "clear", finding.severity),
    );
  };

  if (!input.destination.trim()) {
    addFinding({
      code: "destination-not-selected",
      title: "Destination not selected",
      severity: "attention",
      dimension: "immigration-history",
      observation: "No target destination was supplied.",
      whyItMatters: "Admissibility questions, police records and disclosure requirements vary by jurisdiction.",
      remediation: "Select the first destination under consideration before requesting programme-specific review.",
      evidenceState: "missing",
    });
  }

  if (input.identityEvidence === "missing") {
    addFinding({
      code: "identity-evidence-missing",
      title: "Identity evidence is missing",
      severity: "high",
      dimension: "identity",
      observation: "The assessment records no complete passport or identity evidence.",
      whyItMatters: "Identity, nationality, document validity and name spelling must be established before reliable screening.",
      remediation: "Prepare a clear valid passport copy and the requested address or national identity evidence.",
      evidenceState: "missing",
    });
  } else if (input.identityEvidence === "partial") {
    addFinding({
      code: "identity-evidence-partial",
      title: "Identity evidence is incomplete",
      severity: "attention",
      dimension: "identity",
      observation: "Only part of the expected identity evidence is available.",
      whyItMatters: "Incomplete identity evidence reduces confidence in name, date-of-birth and nationality matching.",
      remediation: "Complete the identity pack and ensure all pages, validity dates and machine-readable details are visible.",
      evidenceState: "unverified",
    });
  }

  if (input.identityConsistent === "no") {
    addFinding({
      code: "identity-inconsistency",
      title: "Name or identity details may be inconsistent",
      severity: "hold",
      dimension: "identity",
      observation: "The user reported different identity details across records.",
      whyItMatters: "Unexplained name, date-of-birth or nationality differences can undermine every application form and screening result.",
      remediation: "Create an alias and name-change schedule with legal supporting records before proceeding.",
      evidenceState: "declared",
    });
  } else if (["unsure", "not-provided"].includes(input.identityConsistent)) {
    addFinding({
      code: "identity-consistency-unconfirmed",
      title: "Identity consistency has not been confirmed",
      severity: "attention",
      dimension: "identity",
      observation: "Consistency across passports, civil records, education and employment evidence remains unconfirmed.",
      whyItMatters: "Small spelling and transliteration differences can create screening false positives or application contradictions.",
      remediation: "Compare the legal name, aliases, date of birth and nationality across every record.",
      evidenceState: "unverified",
    });
  }

  if (input.immigrationHistory === "missing") {
    addFinding({
      code: "immigration-history-missing",
      title: "Immigration history is not documented",
      severity: "high",
      dimension: "immigration-history",
      observation: "A complete visa, refusal and travel history has not been assembled.",
      whyItMatters: "New applications often require consistent disclosure of previous applications, refusals, stays and status issues.",
      remediation: "Build a dated history of visas, refusals, cancellations, overstays and significant travel.",
      evidenceState: "missing",
    });
  } else if (input.immigrationHistory === "partial") {
    addFinding({
      code: "immigration-history-partial",
      title: "Immigration history has gaps",
      severity: "attention",
      dimension: "immigration-history",
      observation: "The available immigration and travel chronology is incomplete.",
      whyItMatters: "Timeline gaps can cause accidental inconsistent disclosure between jurisdictions.",
      remediation: "Reconcile passport stamps, prior forms, decision letters and residence records into one chronology.",
      evidenceState: "unverified",
    });
  }

  if (input.priorVisaIssue === "yes") {
    addFinding({
      code: "prior-visa-issue",
      title: "Previous immigration issue requires review",
      severity: "high",
      dimension: "immigration-history",
      observation: "A refusal, cancellation, removal, deportation or overstay was declared.",
      whyItMatters: "The facts and wording of the previous matter may affect disclosure and strategy for the new application.",
      remediation: "Obtain every decision letter and prior application, then prepare a fact-checked explanation for advisor review.",
      evidenceState: "declared",
    });
  } else if (["unsure", "not-provided"].includes(input.priorVisaIssue)) {
    addFinding({
      code: "prior-visa-status-unknown",
      title: "Previous visa issues are not confirmed",
      severity: "attention",
      dimension: "immigration-history",
      observation: "No definitive declaration was supplied about refusals, cancellations, overstays or removals.",
      whyItMatters: "An omitted immigration event can be more serious than the underlying event itself.",
      remediation: "Answer after reviewing all prior applications and government correspondence.",
      evidenceState: "missing",
    });
  }

  if (input.legalIssue === "yes") {
    addFinding({
      code: "legal-issue-declared",
      title: "Criminal, litigation or regulatory history declared",
      severity: "hold",
      dimension: "legal",
      observation: "A criminal matter, charge, investigation, material litigation or regulatory issue was declared.",
      whyItMatters: "Its relevance depends on the facts, disposition, jurisdiction and destination-country rules.",
      remediation: "Pause filing conclusions until certified records and a qualified legal or immigration review are available.",
      evidenceState: "declared",
    });
  } else if (["unsure", "not-provided"].includes(input.legalIssue)) {
    addFinding({
      code: "legal-history-unconfirmed",
      title: "Legal history is unconfirmed",
      severity: "attention",
      dimension: "legal",
      observation: "The assessment does not contain a definitive legal-history declaration.",
      whyItMatters: "Police, court and regulatory disclosures can be mandatory even when a matter was dismissed or considered minor.",
      remediation: "Complete the declaration and obtain jurisdiction-specific records where required.",
      evidenceState: "missing",
    });
  }

  if (input.pepExposure === "yes") {
    addFinding({
      code: "pep-exposure-declared",
      title: "Political exposure requires enhanced review",
      severity: "high",
      dimension: "pep-sanctions",
      observation: "The applicant or a close family member/associate may be politically exposed.",
      whyItMatters: "Political exposure is not wrongdoing, but it generally requires enhanced source-of-wealth and relationship review.",
      remediation: "Document the position, dates, relationships, wealth sources and relevant public disclosures for compliance review.",
      evidenceState: "declared",
    });
  } else if (["unsure", "not-provided"].includes(input.pepExposure)) {
    addFinding({
      code: "pep-status-unverified",
      title: "PEP and watchlist screening has not been completed",
      severity: "attention",
      dimension: "pep-sanctions",
      observation: "This self-assessment has no verified PEP, sanctions, enforcement or adverse-media result.",
      whyItMatters: "A declaration alone cannot replace name, alias, date-of-birth and entity screening through reliable sources.",
      remediation: "Run provider-backed screening and have potential matches resolved by authorised compliance staff.",
      evidenceState: "unverified",
    });
  }

  if (input.track === "skilled" || input.track === "corporate") {
    if (input.employmentEvidence === "missing") {
      addFinding({
        code: "employment-evidence-missing",
        title: "Employment claims are unsupported",
        severity: "high",
        dimension: "employment",
        observation: "Required employment evidence was marked missing.",
        whyItMatters: "Role, duties, dates, salary and employer identity can determine occupation, points and visa eligibility.",
        remediation: "Collect employer references, contracts, payslips, tax records and corroborating corporate evidence.",
        evidenceState: "missing",
      });
    } else if (input.employmentEvidence === "partial") {
      addFinding({
        code: "employment-evidence-partial",
        title: "Employment evidence needs reconciliation",
        severity: "attention",
        dimension: "employment",
        observation: "Some employment proof exists, but the record is incomplete.",
        whyItMatters: "Unreconciled dates or duties can change experience calculations and assessing-body conclusions.",
        remediation: "Create one employment timeline and reconcile it against references, CV, payroll and tax evidence.",
        evidenceState: "unverified",
      });
    }

    if (input.educationEvidence === "missing") {
      addFinding({
        code: "education-evidence-missing",
        title: "Education evidence is missing",
        severity: "high",
        dimension: "education",
        observation: "Degree, diploma, transcript or professional-assessment evidence is not available.",
        whyItMatters: "Qualifications can affect points, occupation alignment, licences and formal assessment outcomes.",
        remediation: "Obtain complete credentials and confirm the appropriate assessing or licensing authority.",
        evidenceState: "missing",
      });
    } else if (input.educationEvidence === "partial") {
      addFinding({
        code: "education-evidence-partial",
        title: "Qualification verification is incomplete",
        severity: "attention",
        dimension: "education",
        observation: "Some qualification evidence is available but formal verification is incomplete.",
        whyItMatters: "A claimed qualification should not be treated as formally assessed without the relevant authority outcome.",
        remediation: "Add transcripts, award certificates and any required assessment or licence result.",
        evidenceState: "unverified",
      });
    }
  }

  if (input.applicants !== "individual" && input.familyEvidence !== "complete") {
    addFinding({
      code: "family-evidence-incomplete",
      title: "Family relationship evidence is incomplete",
      severity: input.familyEvidence === "missing" ? "high" : "attention",
      dimension: "family",
      observation: "The assessment does not record a complete civil evidence pack for all accompanying applicants.",
      whyItMatters: "Marriage, birth, custody and dependency evidence can control whether family members may be included.",
      remediation: "Prepare civil records for every dependant, including translations, legalisation and custody evidence where applicable.",
      evidenceState: input.familyEvidence === "missing" ? "missing" : "unverified",
    });
  }

  if (input.fundsRequired) {
    if (input.fundingSource === "not-decided") {
      addFinding({
        code: "funding-source-undefined",
        title: "Funding source is not defined",
        severity: "high",
        dimension: "source-of-funds",
        observation: "The capital source has not been selected or explained.",
        whyItMatters: "Investment and financial-capacity claims require a lawful, traceable origin and transaction path.",
        remediation: "Identify each wealth-generating event and the accounts through which the funds will travel.",
        evidenceState: "missing",
      });
    }
    if (input.fundsEvidence === "missing") {
      addFinding({
        code: "funds-evidence-missing",
        title: "Source-of-funds evidence is missing",
        severity: "hold",
        dimension: "source-of-funds",
        observation: "No evidence trail supports the funds required for the proposed route.",
        whyItMatters: "Unexplained capital can prevent compliance clearance and create avoidable filing risk.",
        remediation: "Build a transaction-level evidence chain from wealth generation to the proposed investment or settlement funds.",
        evidenceState: "missing",
      });
    } else if (input.fundsEvidence === "partial") {
      addFinding({
        code: "funds-evidence-partial",
        title: "The financial trail has gaps",
        severity: "high",
        dimension: "source-of-funds",
        observation: "Some financial evidence exists, but the complete origin and movement of funds is not demonstrated.",
        whyItMatters: "Missing transaction legs, tax records or ownership evidence can prevent a reviewer from following the money.",
        remediation: "Map every amount, currency, account holder, date and transfer to its supporting record.",
        evidenceState: "unverified",
      });
    }
    if (input.thirdPartyFunds === "yes") {
      addFinding({
        code: "third-party-funding",
        title: "Donor or lender due diligence is required",
        severity: "high",
        dimension: "source-of-funds",
        observation: "The proposed funds include money supplied by another person or entity.",
        whyItMatters: "The relationship, donor/lender capacity, lawful origin and transfer path must also be established.",
        remediation: "Add the third party as a related subject and collect identity, relationship, wealth and transfer evidence.",
        evidenceState: "declared",
      });
    } else if (["unsure", "not-provided"].includes(input.thirdPartyFunds)) {
      addFinding({
        code: "third-party-funding-unconfirmed",
        title: "Third-party funding is unconfirmed",
        severity: "attention",
        dimension: "source-of-funds",
        observation: "It is not yet clear whether a donor, lender, company or trust will contribute funds.",
        whyItMatters: "Late identification of a third-party funder can substantially expand the evidence and screening scope.",
        remediation: "Confirm all beneficial fund providers before the financial evidence plan is approved.",
        evidenceState: "missing",
      });
    }
  }

  if (input.documentConcern === "yes") {
    addFinding({
      code: "document-integrity-concern",
      title: "Document integrity concern declared",
      severity: "hold",
      dimension: "documents",
      observation: "The user reported a document alteration, authenticity concern or unexplained inconsistency.",
      whyItMatters: "Potentially altered or misleading evidence must never be submitted or silently replaced.",
      remediation: "Stop use of the document, preserve the original, obtain issuing-source evidence and escalate for senior review.",
      evidenceState: "declared",
    });
  } else if (["unsure", "not-provided"].includes(input.documentConcern)) {
    addFinding({
      code: "document-integrity-unverified",
      title: "Document integrity has not been verified",
      severity: "attention",
      dimension: "documents",
      observation: "No technical or issuing-source verification was performed in this self-assessment.",
      whyItMatters: "Visual appearance alone cannot establish authenticity, issuer validity or absence of alteration.",
      remediation: "Use secure document capture and verification, followed by human review of exceptions.",
      evidenceState: "unverified",
    });
  }

  if (input.counterpartyStatus === "not-checked") {
    addFinding({
      code: "counterparty-not-checked",
      title: "A material counterparty has not been checked",
      severity: "high",
      dimension: "counterparties",
      observation: "An employer, sponsor, agent, developer, fund, business or intermediary remains unverified.",
      whyItMatters: "Counterparty ownership, authority, regulatory status and reputation can affect both financial safety and immigration credibility.",
      remediation: "Verify the legal entity, licences, ownership, key people, litigation, enforcement and payment instructions.",
      evidenceState: "missing",
    });
  } else if (input.counterpartyStatus === "partially-checked") {
    addFinding({
      code: "counterparty-partial",
      title: "Counterparty review is incomplete",
      severity: "attention",
      dimension: "counterparties",
      observation: "Some counterparty checks were completed, but ownership or risk coverage is incomplete.",
      whyItMatters: "A registration certificate alone does not establish beneficial ownership, authority or absence of adverse findings.",
      remediation: "Complete entity, beneficial-owner, sanctions, enforcement and adverse-media checks.",
      evidenceState: "unverified",
    });
  }

  const dimensions: DueDiligenceDimension[] = [
    {
      key: "identity",
      label: dimensionLabels.identity,
      status: dimensionStatus.get("identity") ?? statusForEvidence(input.identityEvidence),
      summary: evidenceSummary(input.identityEvidence, "Identity evidence declared complete.", "Identity pack is incomplete.", "Identity evidence is missing."),
      basis: "Self-declared; identity provider and document review not run.",
    },
    {
      key: "immigration-history",
      label: dimensionLabels["immigration-history"],
      status: dimensionStatus.get("immigration-history") ?? statusForEvidence(input.immigrationHistory),
      summary: evidenceSummary(input.immigrationHistory, "History declared complete.", "Chronology has gaps.", "History is missing."),
      basis: "Self-declared; prior government records not independently retrieved.",
    },
    {
      key: "legal",
      label: dimensionLabels.legal,
      status: dimensionStatus.get("legal") ?? (input.legalIssue === "no" ? "clear" : "attention"),
      summary: input.legalIssue === "no" ? "No issue declared." : input.legalIssue === "yes" ? "An issue was declared." : "Not confirmed.",
      basis: "Declaration only; police, court and regulatory searches not run.",
    },
    {
      key: "pep-sanctions",
      label: dimensionLabels["pep-sanctions"],
      status: dimensionStatus.get("pep-sanctions") ?? (input.pepExposure === "no" ? "attention" : "high"),
      summary: input.pepExposure === "yes" ? "Political exposure declared." : "Provider-backed screening still required.",
      basis: "No sanctions, PEP, enforcement or adverse-media provider was queried.",
    },
    {
      key: "employment",
      label: dimensionLabels.employment,
      status: dimensionStatus.get("employment") ?? statusForEvidence(input.employmentEvidence),
      summary: evidenceSummary(input.employmentEvidence, "Evidence declared complete.", "Evidence is partial.", "Evidence is missing."),
      basis: "Self-declared; employer verification not run.",
    },
    {
      key: "education",
      label: dimensionLabels.education,
      status: dimensionStatus.get("education") ?? statusForEvidence(input.educationEvidence),
      summary: evidenceSummary(input.educationEvidence, "Evidence declared complete.", "Verification is incomplete.", "Evidence is missing."),
      basis: "Self-declared; institution or assessing-body verification not run.",
    },
    {
      key: "family",
      label: dimensionLabels.family,
      status: dimensionStatus.get("family") ?? statusForEvidence(input.familyEvidence),
      summary: evidenceSummary(input.familyEvidence, "Family evidence declared complete.", "Family evidence is partial.", "Family evidence is missing."),
      basis: "Self-declared; civil records not reviewed.",
    },
    {
      key: "source-of-funds",
      label: dimensionLabels["source-of-funds"],
      status: dimensionStatus.get("source-of-funds") ?? statusForEvidence(input.fundsEvidence),
      summary: input.fundsRequired
        ? evidenceSummary(input.fundsEvidence, "Financial trail declared complete.", "Financial trail has gaps.", "Financial trail is missing.")
        : "Not marked as required for this preliminary profile.",
      basis: "Self-declared; accounts, tax records and transactions not reviewed.",
    },
    {
      key: "documents",
      label: dimensionLabels.documents,
      status: dimensionStatus.get("documents") ?? (input.documentConcern === "no" ? "attention" : "high"),
      summary: input.documentConcern === "yes" ? "A concern was declared." : "Technical verification has not been run.",
      basis: "No files were uploaded or technically inspected in this public assessment.",
    },
    {
      key: "counterparties",
      label: dimensionLabels.counterparties,
      status: dimensionStatus.get("counterparties") ?? (input.counterpartyStatus === "verified" || input.counterpartyStatus === "not-applicable" ? "clear" : "attention"),
      summary:
        input.counterpartyStatus === "verified"
          ? "Counterparties reported as checked."
          : input.counterpartyStatus === "not-applicable"
            ? "No material counterparty identified."
            : "Counterparty coverage is incomplete.",
      basis: "Self-declared; corporate registry and beneficial-ownership checks not run.",
    },
  ];

  const applicableEvidence = [
    input.identityEvidence,
    input.immigrationHistory,
    input.employmentEvidence,
    input.educationEvidence,
    input.familyEvidence,
    input.fundsRequired ? input.fundsEvidence : "not-applicable",
  ];
  const completenessChecks = [
    ...applicableEvidence.map(evidenceScore),
    declarationScore(input.identityConsistent),
    declarationScore(input.priorVisaIssue),
    declarationScore(input.legalIssue),
    declarationScore(input.pepExposure),
    declarationScore(input.documentConcern),
    input.fundsRequired ? declarationScore(input.thirdPartyFunds) : 1,
    input.destination.trim() ? 1 : 0,
  ];
  const completeness = Math.round(
    (completenessChecks.reduce((total, value) => total + value, 0) / completenessChecks.length) * 100,
  );

  const riskPenalty = findings.reduce((total, finding) => {
    if (finding.severity === "hold") return total + 16;
    if (finding.severity === "high") return total + 9;
    return total + 3;
  }, 0);
  const readiness = Math.max(4, Math.min(96, Math.round(completeness * 0.72 + 24 - riskPenalty)));
  const hasHold = findings.some((finding) => finding.severity === "hold");
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const overall: DueDiligenceResult["overall"] = hasHold
    ? "hold"
    : highCount >= 2
      ? "high"
      : findings.length > 0
        ? "attention"
        : "ready-for-review";
  const overallLabel =
    overall === "hold"
      ? "Pause and obtain expert review"
      : overall === "high"
        ? "Enhanced review required"
        : overall === "attention"
          ? "Evidence preparation required"
          : "Ready for professional verification";
  const scope = scopeFor(input, findings);

  const nextActions = findings
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity])
    .map((finding) => finding.remediation)
    .filter((action, index, all) => all.indexOf(action) === index)
    .slice(0, 6);

  if (!nextActions.length) {
    nextActions.push(
      "Submit the declared evidence for document and identity verification.",
      "Run provider-backed PEP, sanctions, enforcement and adverse-media screening.",
      "Have a XIPHIAS advisor confirm the programme-specific filing requirements.",
    );
  }

  return {
    scope,
    scopeLabel: scopeLabels[scope],
    overall,
    overallLabel,
    readiness,
    completeness,
    headline: hasHold
      ? "Resolve the identified hold points before relying on this profile."
      : highCount
        ? "Your profile needs enhanced evidence and verification before it is filing-ready."
        : "Your preliminary profile can move into structured evidence verification.",
    summary: findings.length
      ? `${findings.length} preparation or verification item${findings.length === 1 ? "" : "s"} identified across ${dimensions.filter((dimension) => dimension.status !== "clear").length} due-diligence dimensions.`
      : `${dimensions.filter((dimension) => dimension.status !== "clear").length} dimensions still require independent verification; no risk issue was declared in the completed answers.`,
    dimensions,
    findings,
    nextActions,
    verificationBoundary: [
      "No identity, biometric or document-authenticity provider was queried.",
      "No police, court, sanctions, PEP, enforcement or adverse-media search was completed.",
      "No employer, institution, bank, corporate registry, assessing authority or government record was independently contacted.",
      "The result is based on the answers supplied and is not an eligibility, admissibility or legal determination.",
    ],
  };
}
