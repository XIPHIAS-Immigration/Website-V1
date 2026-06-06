import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSeedPlatformState } from "./seed";
import type {
  AuditAction,
  AuditLog,
  B2GInquiry,
  ContentReviewTask,
  ContentReviewStatus,
  ConversationMessage,
  ClientDocument,
  DocumentStatus,
  MigrationCase,
  MilestoneStatus,
  PartnerReferral,
  PlatformLead,
  PlatformSnapshot,
  PlatformUser,
  RiskProfile,
} from "./types";

type PlatformState = ReturnType<typeof createSeedPlatformState>;

type CreateLeadInput = Omit<PlatformLead, "id" | "status" | "tags" | "createdAt" | "updatedAt"> & {
  status?: PlatformLead["status"];
  tags?: string[];
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

function getStorePath() {
  return process.env.XIPHIAS_PLATFORM_STORE_PATH
    ? path.resolve(process.env.XIPHIAS_PLATFORM_STORE_PATH)
    : path.join(process.cwd(), ".xiphias-platform", "platform-store.json");
}

function shouldUseFileStore() {
  if (process.env.XIPHIAS_PLATFORM_STORAGE === "memory") return false;
  if (process.env.XIPHIAS_PLATFORM_STORAGE === "file") return true;
  return process.env.NODE_ENV !== "production";
}

function normalizeState(input: Partial<PlatformState> | null | undefined): PlatformState {
  const seed = createSeedPlatformState();
  return {
    users: Array.isArray(input?.users) ? input!.users! : seed.users,
    leads: Array.isArray(input?.leads) ? input!.leads! : seed.leads,
    cases: Array.isArray(input?.cases) ? input!.cases! : seed.cases,
    documents: Array.isArray(input?.documents) ? input!.documents! : seed.documents,
    milestones: Array.isArray(input?.milestones) ? input!.milestones! : seed.milestones,
    conversations: Array.isArray(input?.conversations) ? input!.conversations! : seed.conversations,
    riskProfiles: Array.isArray(input?.riskProfiles) ? input!.riskProfiles! : seed.riskProfiles,
    contentTasks: Array.isArray(input?.contentTasks) ? input!.contentTasks! : seed.contentTasks,
    partnerReferrals: Array.isArray(input?.partnerReferrals) ? input!.partnerReferrals! : seed.partnerReferrals,
    b2gInquiries: Array.isArray(input?.b2gInquiries) ? input!.b2gInquiries! : seed.b2gInquiries,
    auditLogs: Array.isArray(input?.auditLogs) ? input!.auditLogs! : seed.auditLogs,
  };
}

class PlatformRepositoryImpl {
  private state: PlatformState;
  private readonly storePath = getStorePath();
  private readonly persistToFile = shouldUseFileStore();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): PlatformState {
    if (!this.persistToFile) return createSeedPlatformState();

    try {
      if (!existsSync(this.storePath)) {
        const seeded = createSeedPlatformState();
        this.writeState(seeded);
        return seeded;
      }

      const raw = readFileSync(this.storePath, "utf8");
      return normalizeState(JSON.parse(raw) as Partial<PlatformState>);
    } catch (error) {
      console.warn("[x-hub] Could not load platform store; using seed state.", error);
      return createSeedPlatformState();
    }
  }

  private writeState(state: PlatformState) {
    if (!this.persistToFile) return;
    try {
      mkdirSync(path.dirname(this.storePath), { recursive: true });
      writeFileSync(this.storePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.warn("[x-hub] Could not persist platform store.", error);
    }
  }

  private persist() {
    this.writeState(this.state);
  }

  getUserByEmail(email: string) {
    const needle = email.trim().toLowerCase();
    return this.state.users.find((user) => user.email.toLowerCase() === needle) ?? null;
  }

  getUserById(userId: string) {
    return this.state.users.find((user) => user.id === userId) ?? null;
  }

  listUsers() {
    return [...this.state.users];
  }

  createLead(input: CreateLeadInput) {
    const createdAt = nowIso();
    const lead: PlatformLead = {
      ...input,
      id: id("lead"),
      status: input.status ?? "new",
      tags: input.tags ?? [],
      createdAt,
      updatedAt: createdAt,
    };
    this.state.leads.unshift(lead);
    this.audit("lead.created", "lead", lead.id, undefined, {
      source: lead.source,
      track: lead.track,
    });
    this.persist();
    return lead;
  }

  updateLeadStatus(idValue: string, status: PlatformLead["status"]) {
    const lead = this.state.leads.find((item) => item.id === idValue);
    if (!lead) return null;
    lead.status = status;
    lead.updatedAt = nowIso();
    this.audit("lead.updated", "lead", lead.id, undefined, { status });
    this.persist();
    return lead;
  }

  createConversation(input: Omit<ConversationMessage, "id" | "createdAt">) {
    const message: ConversationMessage = {
      ...input,
      id: id("msg"),
      createdAt: nowIso(),
    };
    this.state.conversations.unshift(message);
    this.audit("conversation.created", "conversation", message.id, undefined, {
      channel: message.channel,
      leadId: message.leadId,
      caseId: message.caseId,
    });
    this.persist();
    return message;
  }

  addRiskProfile(input: Omit<RiskProfile, "id" | "createdAt">) {
    const profile: RiskProfile = {
      ...input,
      id: id("risk"),
      createdAt: nowIso(),
    };
    this.state.riskProfiles.unshift(profile);
    this.audit("risk.evaluated", "risk_profile", profile.id, undefined, {
      level: profile.level,
      flags: profile.flags.map((flag) => flag.code),
    });
    this.persist();
    return profile;
  }

  createContentReviewTask(input: Omit<ContentReviewTask, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: ContentReviewStatus;
  }) {
    const createdAt = nowIso();
    const task: ContentReviewTask = {
      ...input,
      id: id("cr"),
      status: input.status ?? "needs_review",
      createdAt,
      updatedAt: createdAt,
    };
    this.state.contentTasks.unshift(task);
    this.audit("content_review.created", "content_review", task.id, undefined, {
      sourceUrl: task.sourceUrl,
      targetPath: task.targetPath,
    });
    this.persist();
    return task;
  }

  updateContentReviewTask(idValue: string, patch: Partial<Pick<ContentReviewTask, "status" | "reviewerNotes">>) {
    const task = this.state.contentTasks.find((item) => item.id === idValue);
    if (!task) return null;
    Object.assign(task, patch, { updatedAt: nowIso() });
    this.audit("content_review.updated", "content_review", task.id, undefined, patch);
    if (patch.status === "published") {
      this.audit("content_review.published", "content_review", task.id, undefined, {
        targetPath: task.targetPath,
      });
    }
    this.persist();
    return task;
  }

  createPartnerReferral(input: Omit<PartnerReferral, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: PartnerReferral["status"];
  }) {
    const createdAt = nowIso();
    const referral: PartnerReferral = {
      ...input,
      id: id("pr"),
      status: input.status ?? "submitted",
      createdAt,
      updatedAt: createdAt,
    };
    this.state.partnerReferrals.unshift(referral);
    this.audit("partner_referral.created", "partner_referral", referral.id, undefined, {
      targetCountry: referral.targetCountry,
      targetProgram: referral.targetProgram,
    });
    this.persist();
    return referral;
  }

  updatePartnerReferral(
    idValue: string,
    patch: Partial<Pick<PartnerReferral, "status" | "notes">>,
  ) {
    const referral = this.state.partnerReferrals.find((item) => item.id === idValue);
    if (!referral) return null;
    Object.assign(referral, patch, { updatedAt: nowIso() });
    this.audit("partner_referral.updated", "partner_referral", referral.id, undefined, patch);
    this.persist();
    return referral;
  }

  createB2GInquiry(input: Omit<B2GInquiry, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: B2GInquiry["status"];
  }) {
    const createdAt = nowIso();
    const inquiry: B2GInquiry = {
      ...input,
      id: id("b2g"),
      status: input.status ?? "submitted",
      createdAt,
      updatedAt: createdAt,
    };
    this.state.b2gInquiries.unshift(inquiry);
    this.audit("b2g_inquiry.created", "b2g_inquiry", inquiry.id, undefined, {
      region: inquiry.region,
      volumeEstimate: inquiry.volumeEstimate,
    });
    this.persist();
    return inquiry;
  }

  updateB2GInquiry(idValue: string, patch: Partial<Pick<B2GInquiry, "status">>) {
    const inquiry = this.state.b2gInquiries.find((item) => item.id === idValue);
    if (!inquiry) return null;
    Object.assign(inquiry, patch, { updatedAt: nowIso() });
    this.audit("b2g_inquiry.updated", "b2g_inquiry", inquiry.id, undefined, patch);
    this.persist();
    return inquiry;
  }

  listContentTasks() {
    return [...this.state.contentTasks];
  }

  listLeads() {
    return [...this.state.leads];
  }

  listCases() {
    return [...this.state.cases];
  }

  listDocuments() {
    return [...this.state.documents];
  }

  listRiskProfiles() {
    return [...this.state.riskProfiles];
  }

  listPartnerReferrals() {
    return [...this.state.partnerReferrals];
  }

  listB2GInquiries() {
    return [...this.state.b2gInquiries];
  }

  getCasesForUser(user: PlatformUser): MigrationCase[] {
    if (["admin", "staff"].includes(user.role)) return [...this.state.cases];
    if (user.role === "client" && user.clientId) {
      return this.state.cases.filter((item) => item.clientId === user.clientId);
    }
    return [];
  }

  getDocumentById(idValue: string) {
    return this.state.documents.find((doc) => doc.id === idValue) ?? null;
  }

  updateDocument(
    idValue: string,
    patch: Partial<
      Pick<
        ClientDocument,
        "status" | "uploadedAt" | "uploadedBy" | "fileName" | "fileSize" | "mimeType" | "storageKey" | "notes" | "reviewedAt"
      >
    >,
  ) {
    const doc = this.state.documents.find((item) => item.id === idValue);
    if (!doc) return null;
    Object.assign(doc, patch);
    this.audit(patch.storageKey ? "document.uploaded" : "document.updated", "document", doc.id, undefined, {
      caseId: doc.caseId,
      status: doc.status,
      fileName: doc.fileName,
    });
    this.persist();
    return doc;
  }

  updateDocumentStatus(idValue: string, status: DocumentStatus, notes?: string) {
    return this.updateDocument(idValue, {
      status,
      notes,
      reviewedAt: ["accepted", "rework"].includes(status) ? nowIso() : undefined,
    });
  }

  updateCase(
    idValue: string,
    patch: Partial<Pick<MigrationCase, "stage" | "nextAction" | "nextActionDue" | "riskLevel" | "progress">>,
  ) {
    const migrationCase = this.state.cases.find((item) => item.id === idValue);
    if (!migrationCase) return null;
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined && value !== ""),
    ) as typeof patch;
    Object.assign(migrationCase, cleanPatch, { updatedAt: nowIso() });
    this.audit("case.updated", "case", migrationCase.id, undefined, cleanPatch);
    this.persist();
    return migrationCase;
  }

  updateMilestoneStatus(idValue: string, status: MilestoneStatus) {
    const milestone = this.state.milestones.find((item) => item.id === idValue);
    if (!milestone) return null;
    milestone.status = status;
    if (status === "complete") milestone.completedAt = nowIso().slice(0, 10);
    this.audit("case.updated", "milestone", milestone.id, undefined, { status });
    this.persist();
    return milestone;
  }

  snapshotForUser(user: PlatformUser): PlatformSnapshot {
    const cases = this.getCasesForUser(user);
    const caseIds = new Set(cases.map((item) => item.id));
    const leadIds = new Set(cases.map((item) => item.leadId).filter(Boolean));
    const canSeeOps = user.role === "admin" || user.role === "staff";

    return {
      user,
      cases,
      documents: canSeeOps
        ? [...this.state.documents]
        : this.state.documents.filter((doc) => caseIds.has(doc.caseId)),
      milestones: canSeeOps
        ? [...this.state.milestones]
        : this.state.milestones.filter((milestone) => caseIds.has(milestone.caseId)),
      leads: canSeeOps
        ? [...this.state.leads]
        : this.state.leads.filter((lead) => leadIds.has(lead.id)),
      conversations: canSeeOps
        ? [...this.state.conversations]
        : this.state.conversations.filter((message) => {
            return (message.caseId && caseIds.has(message.caseId)) || (message.leadId && leadIds.has(message.leadId));
          }),
      riskProfiles: canSeeOps
        ? [...this.state.riskProfiles]
        : this.state.riskProfiles.filter((profile) => {
            return (profile.caseId && caseIds.has(profile.caseId)) || (profile.leadId && leadIds.has(profile.leadId));
          }),
      contentTasks: canSeeOps ? [...this.state.contentTasks] : [],
      partnerReferrals:
        canSeeOps || user.role === "partner"
          ? this.state.partnerReferrals.filter((item) => canSeeOps || item.partnerId === user.partnerId)
          : [],
      b2gInquiries:
        canSeeOps || user.role === "b2g"
          ? this.state.b2gInquiries
          : [],
      auditLogs: canSeeOps ? [...this.state.auditLogs] : [],
    };
  }

  audit(
    action: AuditAction,
    entityType: string,
    entityId: string,
    actorId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const log: AuditLog = {
      id: id("aud"),
      actorId,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: nowIso(),
    };
    this.state.auditLogs.unshift(log);
    this.writeState(this.state);
    return log;
  }

  storageMode() {
    return {
      mode: this.persistToFile ? "file" : "memory",
      storePath: this.persistToFile ? this.storePath : undefined,
      counts: {
        users: this.state.users.length,
        leads: this.state.leads.length,
        cases: this.state.cases.length,
        documents: this.state.documents.length,
        riskProfiles: this.state.riskProfiles.length,
        contentTasks: this.state.contentTasks.length,
        partnerReferrals: this.state.partnerReferrals.length,
        b2gInquiries: this.state.b2gInquiries.length,
      },
    };
  }
}

const globalForPlatform = globalThis as unknown as {
  __xiphiasPlatformRepository?: PlatformRepositoryImpl;
};

export type PlatformRepository = PlatformRepositoryImpl;

export function getPlatformRepository(): PlatformRepository {
  if (!globalForPlatform.__xiphiasPlatformRepository) {
    globalForPlatform.__xiphiasPlatformRepository = new PlatformRepositoryImpl();
  }
  return globalForPlatform.__xiphiasPlatformRepository;
}
