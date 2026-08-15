import type { JiopayOrder } from "@/lib/payments/jiopay-store";

export type FactStatus = "unknown" | "provided" | "advisor-confirmed" | "verified";
export type DocumentStatus =
  | "missing"
  | "collecting"
  | "available"
  | "uploaded"
  | "verified"
  | "expired"
  | "rejected";

export type CaseFact<T> = {
  value?: T;
  status: FactStatus;
  source?: string;
  verifiedAt?: string;
};

export type ClientDocument = {
  name: string;
  applicant?: string;
  status: DocumentStatus;
  expiresOn?: string;
  notes?: string;
};

export type VerifiedCostItem = {
  label: string;
  amount: number;
  currency: string;
  source?: string;
  verifiedAt?: string;
};

export type ClientCase = {
  version: 1;
  reference: string;
  preparedAt: string;
  reviewStatus: "draft" | "advisor-reviewed" | "verified";
  identity: {
    name: CaseFact<string>;
    email: CaseFact<string>;
    phone: CaseFact<string>;
    nationality: CaseFact<string>;
    currentCountry: CaseFact<string>;
    age: CaseFact<number>;
    maritalStatus: CaseFact<string>;
    portraitUrl: CaseFact<string>;
  };
  objective: {
    goal: CaseFact<string>;
    track: CaseFact<string>;
    targetCountries: CaseFact<string[]>;
    selectedProgrammes: CaseFact<string[]>;
    fallbackProgrammes: CaseFact<string[]>;
    timelineMonths: CaseFact<number>;
    priority: CaseFact<string>;
    presence: CaseFact<string>;
    notes: CaseFact<string>;
  };
  career: {
    occupation: CaseFact<string>;
    anzscoCode: CaseFact<string>;
    field: CaseFact<string>;
    education: CaseFact<string>;
    yearsExperience: CaseFact<number>;
    languageTest: CaseFact<string>;
    languageScore: CaseFact<number>;
    languageDetails: CaseFact<string>;
    skillsAssessment: CaseFact<string>;
    cpa: CaseFact<string>;
    assessingBody: CaseFact<string>;
    professionalRecognition: CaseFact<string>;
    pointsAssessment: CaseFact<string>;
    claimedPointsTotal: CaseFact<number>;
    employerOrBusiness: CaseFact<string>;
    proposedEndeavour: CaseFact<string>;
    resumeSummary: CaseFact<string>;
  };
  family: {
    included: CaseFact<boolean>;
    dependants: CaseFact<number>;
    details: CaseFact<string>;
  };
  finances: {
    budgetUsd: CaseFact<number>;
    availableFundsUsd: CaseFact<number>;
    sourceOfFunds: CaseFact<string>;
    preferredCurrency: CaseFact<string>;
    verifiedCosts: CaseFact<VerifiedCostItem[]>;
  };
  immigration: {
    currentStatus: CaseFact<string>;
    history: CaseFact<string>;
    refusals: CaseFact<string>;
    medicalNotes: CaseFact<string>;
    characterNotes: CaseFact<string>;
  };
  evidence: {
    selected: CaseFact<string[]>;
    citations: CaseFact<number>;
    publications: CaseFact<number>;
    patents: CaseFact<number>;
    notes: CaseFact<string>;
  };
  documents: ClientDocument[];
  advisor: {
    preparedBy: CaseFact<string>;
    reviewedAt: CaseFact<string>;
    executiveSummary: CaseFact<string>;
    recommendation: CaseFact<string>;
    customRisks: CaseFact<string[]>;
    nextActions: CaseFact<string[]>;
    notes: CaseFact<string>;
    factualSources: CaseFact<string[]>;
    routeFitScore: CaseFact<number>;
    evidenceStrengthScore: CaseFact<number>;
    documentReadinessScore: CaseFact<number>;
    riskClarityScore: CaseFact<number>;
    familyReadinessScore: CaseFact<number>;
  };
};

const FACT_STATUSES = new Set<FactStatus>(["unknown", "provided", "advisor-confirmed", "verified"]);
const DOCUMENT_STATUSES = new Set<DocumentStatus>([
  "missing",
  "collecting",
  "available",
  "uploaded",
  "verified",
  "expired",
  "rejected",
]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function numberValue(value: unknown): number | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(text(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  const normalized = text(value).toLowerCase();
  if (["true", "yes", "1", "included"].includes(normalized)) return true;
  if (["false", "no", "0", "none", "primary applicant"].includes(normalized)) return false;
  return undefined;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  const raw = text(value);
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map(text).filter(Boolean);
    } catch {
      // Fall through to the human-friendly delimiter format.
    }
  }
  return raw.split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);
}

function statusFor(value: unknown, requested?: unknown, reviewStatus?: ClientCase["reviewStatus"]): FactStatus {
  const requestedStatus = text(requested).toLowerCase() as FactStatus;
  if (FACT_STATUSES.has(requestedStatus)) return requestedStatus;
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
  if (!hasValue) return "unknown";
  if (reviewStatus === "verified") return "verified";
  if (reviewStatus === "advisor-reviewed") return "advisor-confirmed";
  return "provided";
}

function fact<T>(value: T | undefined, args: { status?: unknown; source?: unknown; verifiedAt?: unknown; reviewStatus?: ClientCase["reviewStatus"] } = {}): CaseFact<T> {
  return {
    ...(value !== undefined ? { value } : {}),
    status: statusFor(value, args.status, args.reviewStatus),
    ...(text(args.source) ? { source: text(args.source) } : {}),
    ...(text(args.verifiedAt) ? { verifiedAt: text(args.verifiedAt) } : {}),
  };
}

function parseDocuments(value: unknown): ClientDocument[] {
  if (!value) return [];
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return value
        .split(/\n+/)
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name): ClientDocument => ({ name, status: "available" }));
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): ClientDocument[] => {
    if (typeof entry === "string") {
      const name = entry.trim();
      return name ? [{ name, status: "available" }] : [];
    }
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const name = text(item.name ?? item.document);
    if (!name) return [];
    const candidate = text(item.status).toLowerCase() as DocumentStatus;
    return [{
      name,
      status: DOCUMENT_STATUSES.has(candidate) ? candidate : "available",
      ...(text(item.applicant) ? { applicant: text(item.applicant) } : {}),
      ...(text(item.expiresOn ?? item.expiry) ? { expiresOn: text(item.expiresOn ?? item.expiry) } : {}),
      ...(text(item.notes) ? { notes: text(item.notes) } : {}),
    }];
  });
}

function parseVerifiedCosts(value: unknown): VerifiedCostItem[] {
  if (!value) return [];
  let raw: unknown = value;
  if (typeof value === "string") {
    try { raw = JSON.parse(value); } catch { return []; }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): VerifiedCostItem[] => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const label = text(item.label ?? item.name);
    const amount = numberValue(item.amount);
    if (!label || amount === undefined) return [];
    return [{
      label,
      amount,
      currency: text(item.currency) || "USD",
      ...(text(item.source) ? { source: text(item.source) } : {}),
      ...(text(item.verifiedAt) ? { verifiedAt: text(item.verifiedAt) } : {}),
    }];
  });
}

function evidenceList(answers: Record<string, unknown>): string[] {
  const explicit = list(answers.evidenceSelected ?? answers.evidence);
  const flags = Object.entries(answers)
    .filter(([key, value]) => key.startsWith("evidence_") && booleanValue(value) === true)
    .map(([key]) => key.slice("evidence_".length));
  return Array.from(new Set([...explicit, ...flags]));
}

const EVIDENCE_ALIASES: Record<string, string> = {
  "advanced degree": "advancedDegree",
  education: "advancedDegree",
  award: "awards",
  awards: "awards",
  publication: "publications",
  publications: "publications",
  citation: "citations",
  citations: "citations",
  patent: "patents",
  patents: "patents",
  media: "media",
  judging: "judging",
  "critical role": "criticalRole",
  "high salary": "highSalary",
  leadership: "leadership",
  "business impact": "businessImpact",
  "national interest": "nationalInterest",
  "job offer": "jobOffer",
  sponsor: "employerSponsor",
  "employer sponsor": "employerSponsor",
  "company transfer": "companyTransfer",
  recommendation: "recommendations",
  recommendations: "recommendations",
};

export function applyCaseCompatibilityAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const next = { ...answers };
  for (const label of evidenceList(answers)) {
    const normalized = label.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    const compact = normalized.replace(/\s+/g, "");
    const key = EVIDENCE_ALIASES[normalized] ?? Object.values(EVIDENCE_ALIASES).find((candidate) => candidate.toLowerCase() === compact.toLowerCase());
    if (key) next[`evidence_${key}`] = true;
  }
  if (next.family == null && next.familyIncluded != null) next.family = next.familyIncluded;
  if (next.familyMembers == null && next.familyDetails != null) next.familyMembers = next.familyDetails;
  if (next.profile == null && next.occupation != null) next.profile = next.occupation;
  if (next.role == null && next.occupation != null) next.role = next.occupation;
  if (next.destination == null && next.targetCountries != null) next.destination = list(next.targetCountries)[0];
  if (next.programmes == null && next.selectedProgrammes != null) next.programmes = next.selectedProgrammes;
  if (next.documents == null && (next.documentsAvailable != null || next.documentsMissing != null)) {
    const available = list(next.documentsAvailable).map((name) => ({ name, status: "available" }));
    const missing = list(next.documentsMissing).map((name) => ({ name, status: "missing" }));
    next.documents = JSON.stringify([...available, ...missing]);
  }
  return next;
}

export function withClientCaseAnswers(order: JiopayOrder): JiopayOrder {
  return { ...order, answers: applyCaseCompatibilityAnswers((order.answers ?? {}) as Record<string, unknown>) };
}

export function buildClientCase(order: JiopayOrder): ClientCase {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const reviewStatusRaw = text(a.reviewStatus).toLowerCase();
  const reviewStatus: ClientCase["reviewStatus"] =
    reviewStatusRaw === "verified" ? "verified" : reviewStatusRaw === "advisor-reviewed" ? "advisor-reviewed" : "draft";
  const source = text(a.dataSource) || (a.manuallyPrepared ? "Advisor report desk" : "Client assessment");
  const verifiedAt = text(a.verifiedAt ?? a.reviewedAt);
  const meta = (key: string) => ({
    status: a[`${key}Status`],
    source: a[`${key}Source`] ?? source,
    verifiedAt,
    reviewStatus,
  });

  const targetCountries = list(a.targetCountries ?? a.destination ?? a.country ?? order.country);
  const selectedProgrammes = list(a.selectedProgrammes ?? a.programmes ?? a.programs ?? a.program ?? order.program);
  const familyIncluded = booleanValue(a.familyIncluded ?? a.family ?? a.familyMembers);
  const dependantCount = numberValue(a.dependants ?? a.dependents ?? a.dependantCount ?? a.familySize);
  const evidence = evidenceList(a);

  return {
    version: 1,
    reference: order.merchantTxnNo,
    preparedAt: text(a.preparedAt) || new Date().toISOString(),
    reviewStatus,
    identity: {
      name: fact(text(order.customer.name) || undefined, meta("name")),
      email: fact(text(order.customer.email) || undefined, meta("email")),
      phone: fact(text(order.customer.phone) || undefined, meta("phone")),
      nationality: fact(text(a.nationality) || undefined, meta("nationality")),
      currentCountry: fact(text(a.currentCountry ?? a.currentLocation) || undefined, meta("currentCountry")),
      age: fact(numberValue(a.age), meta("age")),
      maritalStatus: fact(text(a.maritalStatus) || undefined, meta("maritalStatus")),
      portraitUrl: fact(text(a.portraitUrl ?? a.photoUrl) || undefined, meta("portraitUrl")),
    },
    objective: {
      goal: fact(text(a.goal ?? a.objective ?? a.goals) || undefined, meta("goal")),
      track: fact(text(order.track ?? a.track) || undefined, meta("track")),
      targetCountries: fact(targetCountries.length ? targetCountries : undefined, meta("targetCountries")),
      selectedProgrammes: fact(selectedProgrammes.length ? selectedProgrammes : undefined, meta("selectedProgrammes")),
      fallbackProgrammes: fact(list(a.fallbackProgrammes ?? a.alternativeProgrammes), meta("fallbackProgrammes")),
      timelineMonths: fact(numberValue(a.timelineMonths ?? a.timeline), meta("timelineMonths")),
      priority: fact(text(a.priority) || undefined, meta("priority")),
      presence: fact(text(a.presence) || undefined, meta("presence")),
      notes: fact(text(a.goals ?? a.notes) || undefined, meta("notes")),
    },
    career: {
      occupation: fact(text(a.occupation ?? a.role ?? a.profile) || undefined, meta("occupation")),
      anzscoCode: fact(
        text(
          a.anzscoCode ??
            a.anzsco ??
            a.ANZSCO ??
            a.occupationCode ??
            a.nominatedOccupationCode ??
            a.proposedOccupationCode,
        ) || undefined,
        meta("anzscoCode"),
      ),
      field: fact(text(a.field ?? a.industry) || undefined, meta("field")),
      education: fact(text(a.education ?? a.qualification) || undefined, meta("education")),
      yearsExperience: fact(numberValue(a.yearsExperience ?? a.experience), meta("yearsExperience")),
      languageTest: fact(text(a.languageTest) || undefined, meta("languageTest")),
      languageScore: fact(numberValue(a.languageScore ?? a.ielts), meta("languageScore")),
      languageDetails: fact(text(a.languageDetails) || undefined, meta("languageDetails")),
      skillsAssessment: fact(text(a.skillsAssessment) || undefined, meta("skillsAssessment")),
      cpa: fact(
        text(
          a.cpa ??
            a.cpaAssessment ??
            a.candidateProfileAssessment ??
            a.profileAssessment ??
            a.assessmentPotential ??
            a.skillsAssessmentPotential ??
            a.acsAssessmentPotential,
        ) || undefined,
        meta("cpa"),
      ),
      assessingBody: fact(
        text(
          a.assessingBody ??
            a.assessingAuthority ??
            a.assessmentAuthority ??
            a.skillsAssessingAuthority,
        ) || undefined,
        meta("assessingBody"),
      ),
      professionalRecognition: fact(text(a.professionalRecognition) || undefined, meta("professionalRecognition")),
      pointsAssessment: fact(text(a.pointsAssessment) || undefined, meta("pointsAssessment")),
      claimedPointsTotal: fact(numberValue(a.claimedPointsTotal), meta("claimedPointsTotal")),
      employerOrBusiness: fact(text(a.employerOrBusiness ?? a.employer ?? a.business) || undefined, meta("employerOrBusiness")),
      proposedEndeavour: fact(text(a.proposedEndeavour) || undefined, meta("proposedEndeavour")),
      resumeSummary: fact(text(a.profileSummary ?? a.resumeSummary ?? a.summary) || undefined, meta("resumeSummary")),
    },
    family: {
      included: fact(familyIncluded, meta("familyIncluded")),
      dependants: fact(dependantCount, meta("dependants")),
      details: fact(text(a.familyDetails ?? a.familyMembers) || undefined, meta("familyDetails")),
    },
    finances: {
      budgetUsd: fact(numberValue(a.budgetUsd ?? a.budget), meta("budgetUsd")),
      availableFundsUsd: fact(numberValue(a.availableFundsUsd ?? a.availableFunds), meta("availableFundsUsd")),
      sourceOfFunds: fact(text(a.sourceOfFunds) || undefined, meta("sourceOfFunds")),
      preferredCurrency: fact(text(a.preferredCurrency ?? a.currency) || undefined, meta("preferredCurrency")),
      verifiedCosts: fact(parseVerifiedCosts(a.verifiedCosts), meta("verifiedCosts")),
    },
    immigration: {
      currentStatus: fact(text(a.currentImmigrationStatus ?? a.currentStatus) || undefined, meta("currentStatus")),
      history: fact(text(a.immigrationHistory) || undefined, meta("immigrationHistory")),
      refusals: fact(text(a.refusals ?? a.visaRefusals) || undefined, meta("refusals")),
      medicalNotes: fact(text(a.medicalNotes) || undefined, meta("medicalNotes")),
      characterNotes: fact(text(a.characterNotes ?? a.criminalHistory) || undefined, meta("characterNotes")),
    },
    evidence: {
      selected: fact(evidence.length ? evidence : undefined, meta("evidenceSelected")),
      citations: fact(numberValue(a.citationCount ?? a.citations), meta("citations")),
      publications: fact(numberValue(a.publicationCount ?? a.publications), meta("publications")),
      patents: fact(numberValue(a.patentCount ?? a.patents), meta("patents")),
      notes: fact(text(a.evidenceNotes) || undefined, meta("evidenceNotes")),
    },
    documents: parseDocuments(a.documents ?? a.documentInventory),
    advisor: {
      preparedBy: fact(text(a.preparedBy ?? a.advisorName) || undefined, meta("preparedBy")),
      reviewedAt: fact(verifiedAt || undefined, meta("reviewedAt")),
      executiveSummary: fact(text(a.executiveSummary) || undefined, meta("executiveSummary")),
      recommendation: fact(text(a.advisorRecommendation ?? a.recommendation) || undefined, meta("advisorRecommendation")),
      customRisks: fact(list(a.customRisks), meta("customRisks")),
      nextActions: fact(list(a.nextActions), meta("nextActions")),
      notes: fact(text(a.advisorNotes) || undefined, meta("advisorNotes")),
      factualSources: fact(list(a.factualSources), meta("factualSources")),
      routeFitScore: fact(numberValue(a.routeFitScore ?? a.fitScore ?? a.routeFit), meta("routeFitScore")),
      evidenceStrengthScore: fact(numberValue(a.evidenceStrengthScore ?? a.evidenceStrength), meta("evidenceStrengthScore")),
      documentReadinessScore: fact(numberValue(a.documentReadinessScore ?? a.documentReadiness), meta("documentReadinessScore")),
      riskClarityScore: fact(numberValue(a.riskClarityScore ?? a.riskClarity), meta("riskClarityScore")),
      familyReadinessScore: fact(numberValue(a.familyReadinessScore ?? a.familyReadiness), meta("familyReadinessScore")),
    },
  };
}

export function factValue<T>(value: CaseFact<T>): T | undefined {
  return value.value;
}

export function isKnown<T>(value: CaseFact<T>): boolean {
  return value.status !== "unknown" && value.value !== undefined;
}

export function isConfirmed<T>(value: CaseFact<T>): boolean {
  return (value.status === "advisor-confirmed" || value.status === "verified") && value.value !== undefined;
}

export function factLabel<T>(value: CaseFact<T>, formatter: (entry: T) => string = String): string {
  return value.value === undefined ? "Not provided" : formatter(value.value);
}

/**
 * Candidate-specific occupation context for report covers. ANZSCO is reproduced only
 * from supplied case data; it is never inferred from the destination or occupation.
 */
export function caseCoverProfileLine(clientCase: ClientCase): string | undefined {
  const occupation = factValue(clientCase.career.occupation)?.trim();
  const suppliedCode = factValue(clientCase.career.anzscoCode)?.trim();
  const routeContext = [
    ...(factValue(clientCase.objective.targetCountries) ?? []),
    ...(factValue(clientCase.objective.selectedProgrammes) ?? []),
  ].join(" ");
  const australiaRelevant = /\baustralia\b|\bskillselect\b|\bsubclass\s*(?:189|190|491|186|482)\b/i.test(routeContext);
  const code = suppliedCode?.replace(/^anzsco\s*[:#-]?\s*/i, "").trim();
  const parts: string[] = [];
  if (occupation) parts.push(`Occupation: ${occupation}`);
  if (code) parts.push(`ANZSCO ${code}`);
  else if (australiaRelevant) parts.push("ANZSCO: Not provided");
  return parts.length ? parts.join(" | ") : undefined;
}

export function verifiedDocumentReadiness(documents: ClientDocument[]): {
  score?: number;
  verified: number;
  available: number;
  incomplete: number;
  problems: number;
} {
  if (!documents.length) return { verified: 0, available: 0, incomplete: 0, problems: 0 };
  const verified = documents.filter((item) => item.status === "verified").length;
  const available = documents.filter((item) => ["available", "uploaded", "verified"].includes(item.status)).length;
  const problems = documents.filter((item) => ["expired", "rejected"].includes(item.status)).length;
  const incomplete = documents.length - available;
  const score = Math.max(0, Math.min(100, Math.round(((verified * 1 + (available - verified) * 0.65 - problems * 0.5) / documents.length) * 100)));
  return { score, verified, available, incomplete, problems };
}

export function clientCaseCompleteness(clientCase: ClientCase): number {
  const core = [
    clientCase.identity.nationality,
    clientCase.identity.currentCountry,
    clientCase.identity.age,
    clientCase.objective.goal,
    clientCase.objective.targetCountries,
    clientCase.objective.timelineMonths,
    clientCase.career.occupation,
    clientCase.career.education,
    clientCase.career.yearsExperience,
    clientCase.family.included,
    clientCase.finances.budgetUsd,
    clientCase.immigration.refusals,
  ];
  return Math.round((core.filter((entry) => entry.status !== "unknown" && entry.value !== undefined).length / core.length) * 100);
}

export type PersonalisationAssessment = {
  completeness: number;
  confirmedFacts: number;
  providedFacts: number;
  unknownFacts: number;
  limitations: string[];
};

export type EligibilityGate = {
  label: string;
  status: "confirmed" | "review" | "missing";
  detail: string;
};

export function assessPersonalisation(clientCase: ClientCase): PersonalisationAssessment {
  const facts: CaseFact<unknown>[] = [
    clientCase.identity.nationality,
    clientCase.identity.currentCountry,
    clientCase.identity.age,
    clientCase.objective.goal,
    clientCase.objective.targetCountries,
    clientCase.objective.selectedProgrammes,
    clientCase.objective.timelineMonths,
    clientCase.career.occupation,
    clientCase.career.education,
    clientCase.career.yearsExperience,
    clientCase.career.languageTest,
    clientCase.career.languageScore,
    clientCase.family.included,
    clientCase.family.dependants,
    clientCase.finances.budgetUsd,
    clientCase.finances.sourceOfFunds,
    clientCase.immigration.history,
    clientCase.immigration.refusals,
  ];
  const confirmedFacts = facts.filter(isConfirmed).length;
  const providedFacts = facts.filter((entry) => entry.status === "provided" && entry.value !== undefined).length;
  const unknownFacts = facts.filter((entry) => !isKnown(entry)).length;
  const limitations: string[] = [];
  if (!isKnown(clientCase.identity.nationality)) limitations.push("Nationality was not provided; nationality-dependent restrictions are not assessed.");
  if (!isKnown(clientCase.identity.age)) limitations.push("Age was not provided; points and age-limit checks remain unconfirmed.");
  if (!isKnown(clientCase.career.education)) limitations.push("Education was not provided; qualification and credential checks remain open.");
  if (!isKnown(clientCase.career.yearsExperience)) limitations.push("Work-experience duration was not provided.");
  if (!isKnown(clientCase.immigration.refusals)) limitations.push("Visa refusal and cancellation history was not confirmed.");
  if (!isKnown(clientCase.finances.budgetUsd)) limitations.push("Budget was not confirmed; affordability comparisons are indicative only.");
  if (!clientCase.documents.length) limitations.push("No document inventory was supplied; document readiness cannot be scored.");
  if (clientCase.reviewStatus === "draft") limitations.push("This is a draft generated from unverified inputs and must not be treated as filing advice.");
  return {
    completeness: clientCaseCompleteness(clientCase),
    confirmedFacts,
    providedFacts,
    unknownFacts,
    limitations,
  };
}

export function eligibilityGates(clientCase: ClientCase): EligibilityGate[] {
  const track = (clientCase.objective.track.value ?? "").toLowerCase();
  const goal = (clientCase.objective.goal.value ?? "").toLowerCase();
  const routes = clientCase.objective.selectedProgrammes.value ?? [];
  const routeText = routes.join(" ").toLowerCase();
  const skilled = track === "skilled" || /(skill|work|employment|189|190|491|express entry|h-1|eb-|o-1)/.test(`${goal} ${routeText}`);
  const investment = /(invest|citizenship|golden|residency)/.test(`${track} ${goal} ${routeText}`);
  const sponsorRoute = /(h-?1b|o-?1|l-?1|186|482|employer|sponsor)/.test(routeText);
  const docs = verifiedDocumentReadiness(clientCase.documents);
  const gates: EligibilityGate[] = [
    {
      label: "Identity and nationality",
      status: isConfirmed(clientCase.identity.nationality) ? "confirmed" : isKnown(clientCase.identity.nationality) ? "review" : "missing",
      detail: factLabel(clientCase.identity.nationality),
    },
    {
      label: "Age and route limits",
      status: isConfirmed(clientCase.identity.age) ? "confirmed" : isKnown(clientCase.identity.age) ? "review" : "missing",
      detail: factLabel(clientCase.identity.age, (value) => `${value} years`),
    },
    {
      label: "Programme selection",
      status: routes.length && isConfirmed(clientCase.objective.selectedProgrammes) ? "confirmed" : routes.length ? "review" : "missing",
      detail: routes.length ? routes.join("; ") : "No programme selected",
    },
  ];
  if (skilled) {
    gates.push({
      label: "Occupation and qualifications",
      status: isConfirmed(clientCase.career.occupation) && isConfirmed(clientCase.career.education) ? "confirmed" : isKnown(clientCase.career.occupation) && isKnown(clientCase.career.education) ? "review" : "missing",
      detail: `${factLabel(clientCase.career.occupation)} · ${factLabel(clientCase.career.education)}`,
    });
    gates.push({
      label: "Experience and language",
      status: isConfirmed(clientCase.career.yearsExperience) && (isConfirmed(clientCase.career.languageScore) || /usa|united states/.test((clientCase.objective.targetCountries.value ?? []).join(" ").toLowerCase())) ? "confirmed" : isKnown(clientCase.career.yearsExperience) ? "review" : "missing",
      detail: `${factLabel(clientCase.career.yearsExperience, (value) => `${value} years`)} · ${factLabel(clientCase.career.languageTest)}`,
    });
  }
  if (sponsorRoute) {
    gates.push({
      label: "Employer or petitioner",
      status: isConfirmed(clientCase.career.employerOrBusiness) ? "confirmed" : isKnown(clientCase.career.employerOrBusiness) ? "review" : "missing",
      detail: factLabel(clientCase.career.employerOrBusiness),
    });
  }
  if (investment) {
    gates.push({
      label: "Funds and source of funds",
      status: isConfirmed(clientCase.finances.availableFundsUsd) && isConfirmed(clientCase.finances.sourceOfFunds) ? "confirmed" : isKnown(clientCase.finances.budgetUsd) || isKnown(clientCase.finances.sourceOfFunds) ? "review" : "missing",
      detail: `${factLabel(clientCase.finances.availableFundsUsd, (value) => `USD ${value.toLocaleString("en-US")}`)} · ${factLabel(clientCase.finances.sourceOfFunds)}`,
    });
  }
  gates.push({
    label: "Admissibility history",
    status: isConfirmed(clientCase.immigration.refusals) && isConfirmed(clientCase.immigration.characterNotes) ? "confirmed" : isKnown(clientCase.immigration.refusals) || isKnown(clientCase.immigration.characterNotes) ? "review" : "missing",
    detail: `Refusals: ${factLabel(clientCase.immigration.refusals)} · Character: ${factLabel(clientCase.immigration.characterNotes)}`,
  });
  gates.push({
    label: "Document evidence",
    status: docs.verified > 0 && docs.incomplete === 0 && docs.problems === 0 ? "confirmed" : clientCase.documents.length ? "review" : "missing",
    detail: clientCase.documents.length ? `${docs.verified} verified · ${docs.incomplete} incomplete · ${docs.problems} problem records` : "No inventory supplied",
  });
  return gates;
}

export function reportBasis(clientCase: ClientCase, assessment = assessPersonalisation(clientCase)) {
  return {
    reviewStatus: clientCase.reviewStatus,
    ...assessment,
    executiveSummary: clientCase.advisor.executiveSummary.value,
    recommendation: clientCase.advisor.recommendation.value,
    advisorNotes: clientCase.advisor.notes.value,
    cpa: clientCase.career.cpa.value,
    assessingBody: clientCase.career.assessingBody.value,
    anzscoCode: clientCase.career.anzscoCode.value,
    occupation: clientCase.career.occupation.value,
    education: clientCase.career.education.value,
    yearsExperience: clientCase.career.yearsExperience.value,
    languageTest: clientCase.career.languageTest.value,
    languageScore: clientCase.career.languageScore.value,
    languageDetails: clientCase.career.languageDetails.value,
    skillsAssessment: clientCase.career.skillsAssessment.value,
    professionalRecognition: clientCase.career.professionalRecognition.value,
    pointsAssessment: clientCase.career.pointsAssessment.value,
    claimedPointsTotal: clientCase.career.claimedPointsTotal.value,
    employerOrBusiness: clientCase.career.employerOrBusiness.value,
    familyIncluded: clientCase.family.included.value,
    dependants: clientCase.family.dependants.value,
    budgetUsd: clientCase.finances.budgetUsd.value,
    availableFundsUsd: clientCase.finances.availableFundsUsd.value,
    sourceOfFunds: clientCase.finances.sourceOfFunds.value,
    currentImmigrationStatus: clientCase.immigration.currentStatus.value,
    immigrationHistory: clientCase.immigration.history.value,
    refusals: clientCase.immigration.refusals.value,
    medicalNotes: clientCase.immigration.medicalNotes.value,
    characterNotes: clientCase.immigration.characterNotes.value,
    sources: clientCase.advisor.factualSources.value,
    customRisks: clientCase.advisor.customRisks.value,
    nextActions: clientCase.advisor.nextActions.value,
    gates: eligibilityGates(clientCase),
  };
}

export function referenceMatches(candidate: string, reference: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const candidateText = normalize(candidate);
  const referenceText = normalize(reference);
  if (!referenceText) return false;
  if (candidateText.includes(referenceText) || referenceText.includes(candidateText)) return true;
  const referenceTokens = referenceText.split(" ").filter((token) => token.length > 1);
  const candidateTokens = new Set(candidateText.split(" "));
  const matches = referenceTokens.filter((token) => candidateTokens.has(token)).length;
  return matches >= Math.min(2, referenceTokens.length) && matches / Math.max(1, referenceTokens.length) >= 0.6;
}
