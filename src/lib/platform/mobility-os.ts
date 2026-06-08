import "server-only";

import { buildDocumentPlan, type DocumentPlanResult } from "./document-intelligence";
import { buildRegulationRadar, type RegulationRadarResult } from "./regulation-radar";
import type { CaseStage, MigrationCase, PlatformSnapshot, RiskLevel } from "./types";

export type MobilityStage = {
  key: CaseStage;
  label: string;
  description: string;
  status: "done" | "active" | "pending" | "blocked";
};

export type MobilityAction = {
  title: string;
  detail: string;
  owner: "client" | "advisor" | "operations" | "system";
  urgency: "today" | "this-week" | "watch";
};

export type MobilityAutomation = {
  title: string;
  detail: string;
  status: "ready" | "waiting" | "needs-config";
  channel: "portal" | "email" | "whatsapp" | "staff";
};

export type MobilityOSResult = {
  generatedAt: string;
  activeCase?: MigrationCase;
  readinessScore: number;
  stageLabel: string;
  riskLevel: RiskLevel;
  blockers: string[];
  nextActions: MobilityAction[];
  journey: MobilityStage[];
  automations: MobilityAutomation[];
  documentPlan: DocumentPlanResult;
  regulationRadar: RegulationRadarResult;
  safeguards: string[];
};

const STAGE_COPY: Record<CaseStage, { label: string; description: string }> = {
  intake: {
    label: "Intake",
    description: "Profile, goal, budget, family, and destination are captured.",
  },
  documents: {
    label: "Evidence",
    description: "Identity, funds, civil, corporate, or skilled evidence is collected.",
  },
  due_diligence: {
    label: "Risk",
    description: "Source of funds, mismatch flags, background, and compliance signals are reviewed.",
  },
  strategy: {
    label: "Strategy",
    description: "Advisor confirms route fit, alternatives, and case positioning.",
  },
  filing: {
    label: "Filing",
    description: "Forms, supporting evidence, and representative notes are prepared.",
  },
  government_review: {
    label: "Authority",
    description: "The file is under government, consulate, or program-unit review.",
  },
  decision: {
    label: "Decision",
    description: "Approval, rework, refusal, or further evidence request is handled.",
  },
  post_approval: {
    label: "Activation",
    description: "Landing, card/passport, renewal, tax, and family steps are tracked.",
  },
};

const STAGES = Object.keys(STAGE_COPY) as CaseStage[];

function stageLabel(stage?: CaseStage) {
  return stage ? STAGE_COPY[stage].label : "Pre-intake";
}

function daysUntil(date?: string) {
  if (!date) return null;
  const due = new Date(`${date.slice(0, 10)}T00:00:00.000Z`).getTime();
  if (Number.isNaN(due)) return null;
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.ceil((due - start) / 86_400_000);
}

function buildJourney(activeCase?: MigrationCase): MobilityStage[] {
  const activeIndex = activeCase ? STAGES.indexOf(activeCase.stage) : -1;
  return STAGES.map((stage, index) => {
    const copy = STAGE_COPY[stage];
    const blocked = activeCase?.riskLevel === "blocked" && index >= activeIndex;
    return {
      key: stage,
      label: copy.label,
      description: copy.description,
      status: blocked ? "blocked" : index < activeIndex ? "done" : index === activeIndex ? "active" : "pending",
    };
  });
}

function buildBlockers(args: {
  activeCase?: MigrationCase;
  documentPlan: DocumentPlanResult;
  snapshot: PlatformSnapshot;
}) {
  const blockers: string[] = [];
  const risk = args.snapshot.riskProfiles[0];
  const overdue = args.snapshot.documents.filter((doc) => {
    const days = daysUntil(doc.dueAt);
    return days !== null && days < 0 && ["requested", "rework"].includes(doc.status);
  });

  if (!args.activeCase) blockers.push("No active case is assigned to this account.");
  if (args.documentPlan.flags.length) blockers.push(args.documentPlan.flags[0].label);
  if (risk?.requiresStaffReview) blockers.push("Staff risk review is required.");
  if (overdue.length) blockers.push(`${overdue.length} document deadline${overdue.length === 1 ? "" : "s"} missed.`);

  return [...new Set(blockers)].slice(0, 4);
}

function buildNextActions(args: {
  activeCase?: MigrationCase;
  documentPlan: DocumentPlanResult;
  radar: RegulationRadarResult;
}): MobilityAction[] {
  const actions: MobilityAction[] = [];
  const due = daysUntil(args.activeCase?.nextActionDue);

  if (args.activeCase?.nextAction) {
    actions.push({
      title: args.activeCase.nextAction,
      detail:
        due === null
          ? "Advisor-set next action."
          : due < 0
            ? "This action is overdue and should be handled now."
            : due === 0
              ? "Due today."
              : `Due in ${due} day${due === 1 ? "" : "s"}.`,
      owner: "client",
      urgency: due !== null && due <= 0 ? "today" : "this-week",
    });
  }

  args.documentPlan.nextActions.slice(0, 2).forEach((action) => {
    actions.push({
      title: action,
      detail: "Generated from the document intelligence checklist.",
      owner: action.toLowerCase().includes("advisor") ? "advisor" : "client",
      urgency: "this-week",
    });
  });

  if (args.radar.signals.some((signal) => signal.priority === "urgent" || signal.priority === "review")) {
    actions.push({
      title: "Review regulation radar signals",
      detail: "A source-backed content or rule signal may affect the selected route.",
      owner: "advisor",
      urgency: "watch",
    });
  }

  return actions.slice(0, 5);
}

function buildAutomations(args: {
  documentPlan: DocumentPlanResult;
  radar: RegulationRadarResult;
  activeCase?: MigrationCase;
}): MobilityAutomation[] {
  const automations: MobilityAutomation[] = [
    ...args.documentPlan.automationPlan.map((item) => ({
      title: item.title,
      detail: item.description,
      channel: item.channel,
      status: item.ready ? ("ready" as const) : ("waiting" as const),
    })),
    {
      title: "Rule-change impact alert",
      detail: "Notify staff when source-backed content signals match this case country or track.",
      channel: "staff",
      status: args.radar.signals.length ? ("ready" as const) : ("waiting" as const),
    },
    {
      title: "Next-action reminder",
      detail: "Send a portal or WhatsApp reminder before the next case deadline.",
      channel: "whatsapp",
      status: args.activeCase?.nextActionDue ? ("ready" as const) : ("waiting" as const),
    },
  ];

  return automations.slice(0, 7);
}

function calculateReadiness(activeCase: MigrationCase | undefined, documentPlan: DocumentPlanResult, blockers: string[]) {
  const caseProgress = activeCase?.progress ?? 12;
  const riskPenalty = activeCase?.riskLevel === "blocked" ? 22 : activeCase?.riskLevel === "high" ? 12 : activeCase?.riskLevel === "medium" ? 5 : 0;
  const blockerPenalty = Math.min(12, blockers.length * 3);
  const stageMomentum = activeCase ? 14 : 0;
  const raw = Math.round((caseProgress * 0.52) + (documentPlan.readinessScore * 0.34) + stageMomentum - riskPenalty - blockerPenalty);
  return Math.max(activeCase?.progress ?? 8, Math.min(98, raw));
}

export function buildMobilityOS(snapshot: PlatformSnapshot): MobilityOSResult {
  const activeCase = snapshot.cases[0];
  const activeDocs = activeCase ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id) : snapshot.documents;
  const documentPlan = buildDocumentPlan({
    user: snapshot.user,
    activeCase,
    documents: activeDocs,
  });
  const regulationRadar = buildRegulationRadar({
    activeCase,
    contentTasks: snapshot.contentTasks,
    limit: 5,
  });
  const blockers = buildBlockers({ activeCase, documentPlan, snapshot });
  const readinessScore = calculateReadiness(activeCase, documentPlan, blockers);

  return {
    generatedAt: new Date().toISOString(),
    activeCase,
    readinessScore,
    stageLabel: stageLabel(activeCase?.stage),
    riskLevel: activeCase?.riskLevel ?? "low",
    blockers,
    nextActions: buildNextActions({ activeCase, documentPlan, radar: regulationRadar }),
    journey: buildJourney(activeCase),
    automations: buildAutomations({ documentPlan, radar: regulationRadar, activeCase }),
    documentPlan,
    regulationRadar,
    safeguards: [
      "No CRM sync is required for this layer; it works from portal records and approved website content.",
      "The intelligence is deterministic and source-backed. Any optional small model should only rewrite tone, not invent rules.",
      "Public pages stay light because this module is behind authenticated portal routes.",
      "Advisor approval remains mandatory for filings, fees, timelines, and content changes.",
    ],
  };
}
