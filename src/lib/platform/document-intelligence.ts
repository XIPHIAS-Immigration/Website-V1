import "server-only";

import type { CaseStage, ClientDocument, MigrationCase, PlatformUser } from "./types";
import type { Track } from "@/lib/eligibility/types";

export type DocumentPlanItem = {
  label: string;
  category: ClientDocument["category"];
  reason: string;
  priority: "critical" | "standard" | "advisor";
  status: ClientDocument["status"] | "missing";
  dueAt?: string;
  matchedDocumentId?: string;
  automation?: string;
};

export type DocumentPlanSection = {
  title: string;
  subtitle: string;
  items: DocumentPlanItem[];
};

export type DocumentPlanFlag = {
  code: string;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export type DocumentPlanResult = {
  generatedAt: string;
  track: Track;
  country: string;
  program: string;
  stage?: CaseStage;
  readinessScore: number;
  summary: string;
  nextActions: string[];
  sections: DocumentPlanSection[];
  flags: DocumentPlanFlag[];
  automationPlan: {
    title: string;
    description: string;
    channel: "portal" | "email" | "whatsapp" | "staff";
    ready: boolean;
  }[];
};

type RequiredDoc = {
  label: string;
  category: ClientDocument["category"];
  reason: string;
  priority?: DocumentPlanItem["priority"];
  automation?: string;
};

const COMMON_DOCS: RequiredDoc[] = [
  {
    label: "Primary applicant passport",
    category: "identity",
    reason: "Confirms identity, nationality, validity, and spelling before any route review.",
    priority: "critical",
    automation: "Send reminder if passport copy is not accepted within 48 hours of paid registration.",
  },
  {
    label: "Address and contact proof",
    category: "identity",
    reason: "Supports onboarding, KYC review, courier planning, and jurisdiction checks.",
  },
  {
    label: "Client declaration and consent",
    category: "other",
    reason: "Records consent for advisory, document handling, and staff review workflow.",
    priority: "critical",
  },
];

const TRACK_DOCS: Record<Track, RequiredDoc[]> = {
  residency: [
    {
      label: "Proof of funds",
      category: "financial",
      reason: "Shows the capital base required for residency-by-investment or business residence routes.",
      priority: "critical",
      automation: "Escalate to advisor if financial proof is still requested near the review date.",
    },
    {
      label: "Source of funds narrative",
      category: "financial",
      reason: "Explains how the funds were generated and supports due diligence checks.",
      priority: "critical",
    },
    {
      label: "Civil documents for dependents",
      category: "civil",
      reason: "Needed when spouse, children, or dependent family members are included.",
    },
    {
      label: "Police clearance or background record",
      category: "civil",
      reason: "Most residence programs require a background or good-conduct check.",
      priority: "advisor",
    },
    {
      label: "Investment route evidence",
      category: "investment",
      reason: "Property, fund, donation, company, or business records depend on the selected route.",
      priority: "advisor",
    },
  ],
  citizenship: [
    {
      label: "Birth and family civil records",
      category: "civil",
      reason: "Citizenship routes rely heavily on identity, lineage, family, and dependent records.",
      priority: "critical",
    },
    {
      label: "Police clearance certificates",
      category: "civil",
      reason: "CBI and naturalisation routes require clean background evidence.",
      priority: "critical",
    },
    {
      label: "Source of funds and wealth evidence",
      category: "financial",
      reason: "Enhanced due diligence needs bank statements, business records, tax records, or asset-sale proof.",
      priority: "critical",
    },
    {
      label: "Due diligence questionnaire",
      category: "other",
      reason: "Captures travel history, refusals, litigation, political exposure, and compliance notes.",
    },
  ],
  skilled: [
    {
      label: "Education credentials",
      category: "education",
      reason: "Points-based and employer-backed routes need degree, diploma, transcript, or assessment evidence.",
      priority: "critical",
    },
    {
      label: "Employment reference letters",
      category: "employment",
      reason: "Confirms role, duties, tenure, salary, and occupation match.",
      priority: "critical",
    },
    {
      label: "Language test or booking proof",
      category: "education",
      reason: "Language scores are a major eligibility input for many skilled migration routes.",
    },
    {
      label: "Resume and professional profile",
      category: "employment",
      reason: "Gives the advisor a clean view of skill history and gaps.",
    },
  ],
  corporate: [
    {
      label: "Company incorporation records",
      category: "employment",
      reason: "Confirms ownership, group structure, entity age, and sponsor eligibility.",
      priority: "critical",
    },
    {
      label: "Shareholding and directorship proof",
      category: "employment",
      reason: "Shows the applicant or sponsor relationship to the company.",
      priority: "critical",
    },
    {
      label: "Company financial statements",
      category: "financial",
      reason: "Supports business credibility, employee movement, and sponsor strength.",
      priority: "critical",
    },
    {
      label: "Employee transfer or hiring plan",
      category: "employment",
      reason: "Required to explain the business case for relocation, expansion, or hiring.",
    },
    {
      label: "Local setup or office evidence",
      category: "investment",
      reason: "Supports entity-plus-visa, investor, establishment card, or branch setup routes.",
      priority: "advisor",
    },
  ],
};

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function title(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function matchExisting(required: RequiredDoc, docs: ClientDocument[]) {
  const requiredLabel = normalize(required.label);
  const requiredTokens = new Set(requiredLabel.split(" ").filter((token) => token.length > 3));

  return docs.find((doc) => {
    const label = normalize([doc.label, doc.category, doc.notes].join(" "));
    if (label.includes(requiredLabel) || requiredLabel.includes(label)) return true;
    let overlap = 0;
    requiredTokens.forEach((token) => {
      if (label.includes(token)) overlap += 1;
    });
    return overlap >= Math.min(2, requiredTokens.size);
  });
}

function daysUntil(date?: string) {
  if (!date) return null;
  const due = new Date(`${date.slice(0, 10)}T00:00:00.000Z`).getTime();
  if (Number.isNaN(due)) return null;
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.ceil((due - start) / 86_400_000);
}

function routeSpecificDocs(track: Track, country: string, program: string): RequiredDoc[] {
  const route = normalize([country, program].join(" "));
  const extras: RequiredDoc[] = [];

  if (/\busa|united states|eb 5|eb5\b/.test(route)) {
    extras.push({
      label: "Investment source trail for EB-5 review",
      category: "financial",
      reason: "EB-5 style files need a clear trail from earning or sale event to investment capital.",
      priority: "critical",
    });
  }

  if (/\buae|dubai|qatar|bahrain|saudi|oman\b/.test(route)) {
    extras.push({
      label: "GCC medical and identity readiness",
      category: "identity",
      reason: "GCC residence routes commonly require medical, Emirates/GCC ID style steps, and local sponsor or entity documents.",
      priority: "advisor",
    });
  }

  if (/\bcanada|australia|new zealand|uk|united kingdom\b/.test(route) && track === "skilled") {
    extras.push({
      label: "Skills assessment or occupation match evidence",
      category: "education",
      reason: "Skilled routes need occupation alignment before filing strategy is finalised.",
      priority: "critical",
    });
  }

  if (/\bportugal|greece|malta|cyprus|spain|latvia\b/.test(route)) {
    extras.push({
      label: "EU residency background packet",
      category: "civil",
      reason: "European residence routes usually require civil status, background, insurance, and apostille/legalisation planning.",
      priority: "advisor",
    });
  }

  if (/\bcaribbean|grenada|dominica|antigua|saint|st kitts|vanuatu|nauru|egypt|turkey\b/.test(route)) {
    extras.push({
      label: "Enhanced CBI due diligence packet",
      category: "other",
      reason: "Citizenship-by-investment files need stronger background declarations and supporting evidence.",
      priority: "critical",
    });
  }

  return extras;
}

function buildItem(required: RequiredDoc, docs: ClientDocument[]): DocumentPlanItem {
  const existing = matchExisting(required, docs);
  return {
    label: required.label,
    category: required.category,
    reason: required.reason,
    priority: required.priority ?? "standard",
    status: existing?.status ?? "missing",
    dueAt: existing?.dueAt,
    matchedDocumentId: existing?.id,
    automation: required.automation,
  };
}

function dedupeRequired(items: RequiredDoc[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreReadiness(items: DocumentPlanItem[], flags: DocumentPlanFlag[]) {
  if (!items.length) return 0;
  const weights: Record<DocumentPlanItem["status"], number> = {
    accepted: 1,
    reviewing: 0.72,
    uploaded: 0.62,
    requested: 0.28,
    rework: 0.15,
    missing: 0,
  };
  const base = items.reduce((sum, item) => sum + weights[item.status], 0) / items.length;
  const penalty = flags.reduce((sum, flag) => sum + (flag.severity === "high" ? 0.12 : flag.severity === "medium" ? 0.07 : 0.03), 0);
  return Math.max(8, Math.min(98, Math.round((base - penalty) * 100)));
}

function buildFlags(items: DocumentPlanItem[], docs: ClientDocument[]): DocumentPlanFlag[] {
  const flags: DocumentPlanFlag[] = [];
  const criticalMissing = items.filter((item) => item.priority === "critical" && ["missing", "requested", "rework"].includes(item.status));
  const overdue = items.filter((item) => {
    const days = daysUntil(item.dueAt);
    return days !== null && days < 0 && ["missing", "requested", "rework"].includes(item.status);
  });
  const rework = docs.filter((doc) => doc.status === "rework");
  const mismatch = docs.filter((doc) => normalize(doc.notes).includes("mismatch"));

  if (criticalMissing.length) {
    flags.push({
      code: "critical_documents_pending",
      label: "Critical documents pending",
      detail: `${criticalMissing.length} critical item${criticalMissing.length === 1 ? "" : "s"} still need upload or advisor clearance.`,
      severity: criticalMissing.length > 2 ? "high" : "medium",
    });
  }

  if (overdue.length) {
    flags.push({
      code: "overdue_document_action",
      label: "Document deadline missed",
      detail: `${overdue.length} document action${overdue.length === 1 ? " is" : "s are"} past the due date.`,
      severity: "high",
    });
  }

  if (rework.length || mismatch.length) {
    flags.push({
      code: "document_rework_or_mismatch",
      label: "Rework or mismatch review",
      detail: "One or more uploaded records need correction or staff verification before the file should move forward.",
      severity: "medium",
    });
  }

  if (items.some((item) => normalize(item.label).includes("source of funds") && item.status !== "accepted")) {
    flags.push({
      code: "source_of_funds_not_cleared",
      label: "Source of funds not cleared",
      detail: "Financial source narrative is not fully accepted yet, so due diligence should stay open.",
      severity: "medium",
    });
  }

  return flags;
}

function nextActions(items: DocumentPlanItem[], flags: DocumentPlanFlag[]) {
  const actions = items
    .filter((item) => ["missing", "requested", "rework"].includes(item.status))
    .sort((a, b) => {
      const priorityRank = { critical: 0, advisor: 1, standard: 2 };
      return priorityRank[a.priority] - priorityRank[b.priority];
    })
    .slice(0, 3)
    .map((item) => `${item.status === "rework" ? "Correct" : "Upload"} ${item.label.toLowerCase()}.`);

  if (flags.some((flag) => flag.code === "source_of_funds_not_cleared")) {
    actions.unshift("Prepare a concise source-of-funds explanation for advisor review.");
  }

  return actions.length ? actions.slice(0, 4) : ["All expected documents are uploaded or under review. Wait for advisor clearance before filing."];
}

export function buildDocumentPlan(args: {
  user?: PlatformUser;
  activeCase?: MigrationCase | null;
  documents?: ClientDocument[];
  track?: Track;
  country?: string;
  program?: string;
}): DocumentPlanResult {
  const activeCase = args.activeCase ?? null;
  const track = args.track ?? activeCase?.track ?? "residency";
  const country = args.country || activeCase?.country || "Selected destination";
  const program = args.program || activeCase?.program || `${title(track)} route`;
  const docs = args.documents ?? [];

  const required = dedupeRequired([
    ...COMMON_DOCS,
    ...TRACK_DOCS[track],
    ...routeSpecificDocs(track, country, program),
  ]);

  const items = required.map((item) => buildItem(item, docs));
  const critical = items.filter((item) => item.priority === "critical");
  const advisor = items.filter((item) => item.priority === "advisor");
  const standard = items.filter((item) => item.priority === "standard");
  const flags = buildFlags(items, docs);
  const rawReadinessScore = scoreReadiness(items, flags);
  const hasActiveEvidence = docs.some((doc) => ["uploaded", "reviewing", "accepted", "rework"].includes(doc.status));
  const readinessScore = Math.max(hasActiveEvidence ? 28 : rawReadinessScore, rawReadinessScore);

  const sections: DocumentPlanSection[] = [
    {
      title: "Core identity and consent",
      subtitle: "The minimum record set needed before serious review.",
      items: items.filter((item) => item.category === "identity" || normalize(item.label).includes("consent")),
    },
    {
      title: `${title(track)} evidence`,
      subtitle: "Route-specific documents that make the recommendation defensible.",
      items: [...critical, ...advisor].filter((item) => item.category !== "identity" && !normalize(item.label).includes("consent")),
    },
    {
      title: "Supporting packet",
      subtitle: "Useful records that reduce back-and-forth during staff review.",
      items: standard.filter((item) => item.category !== "identity"),
    },
  ].filter((section) => section.items.length);

  return {
    generatedAt: new Date().toISOString(),
    track,
    country,
    program,
    stage: activeCase?.stage,
    readinessScore,
    summary:
      readinessScore >= 78
        ? "The document file is in a strong review position. Advisor verification can focus on rule fit and final evidence quality."
        : readinessScore >= 48
          ? "The file has a workable base, but critical items still need attention before a premium assessment or filing pack feels complete."
          : "The file is still early-stage. Identity, financial, and route-specific evidence should be collected before deep advisor review.",
    nextActions: nextActions(items, flags),
    sections,
    flags,
    automationPlan: [
      {
        title: "Smart document nudge",
        description: "Send a short reminder for missing or rework documents with the exact item name.",
        channel: "whatsapp",
        ready: items.some((item) => ["missing", "requested", "rework"].includes(item.status)),
      },
      {
        title: "Advisor review queue",
        description: "Move files with critical pending documents or risk flags into staff review.",
        channel: "staff",
        ready: flags.length > 0,
      },
      {
        title: "Portal checklist sync",
        description: "Keep the client-facing checklist aligned with the selected track and destination.",
        channel: "portal",
        ready: true,
      },
      {
        title: "Evidence trail summary",
        description: "Prepare a concise evidence summary for the paid detailed report.",
        channel: "email",
        ready: readinessScore >= 45,
      },
    ],
  };
}
