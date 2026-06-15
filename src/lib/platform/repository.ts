import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSeedPlatformState } from "./seed";
import type {
  AuditAction,
  AuditLog,
  B2GInquiry,
  CaseMilestone,
  ClientProfile,
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

type CreateUserInput = Omit<PlatformUser, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateLeadInput = Omit<PlatformLead, "id" | "status" | "tags" | "createdAt" | "updatedAt"> & {
  status?: PlatformLead["status"];
  tags?: string[];
};

type UpsertClientProfileInput = Omit<ClientProfile, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateCaseInput = Omit<MigrationCase, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateDocumentInput = Omit<ClientDocument, "id"> & {
  id?: string;
};

type CreateMilestoneInput = Omit<CaseMilestone, "id"> & {
  id?: string;
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
  return true;
}

function normalizeState(input: Partial<PlatformState> | null | undefined): PlatformState {
  const seed = createSeedPlatformState();
  return {
    users: Array.isArray(input?.users) ? input!.users! : seed.users,
    clientProfiles: Array.isArray(input?.clientProfiles) ? input!.clientProfiles! : seed.clientProfiles,
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

function scrubLegacyDemoState(state: PlatformState): PlatformState {
  if (process.env.XIPHIAS_PLATFORM_KEEP_DEMO_DATA === "true") return state;

  const demoUserIds = new Set(["usr_admin", "usr_client", "usr_partner", "usr_b2g"]);
  const demoEmails = new Set([
    "admin@xiphias.local",
    "client@xiphias.local",
    "partner@xiphias.local",
    "mobility@gov.local",
  ]);
  const demoClientIds = new Set(["cli_aarav"]);
  const demoLeadIds = new Set(["lead_001"]);
  const demoCaseIds = new Set(["case_001"]);
  const demoPartnerIds = new Set(["ptr_global"]);
  const demoOrgIds = new Set(["org_public"]);

  return {
    users: state.users.filter(
      (item) =>
        !demoUserIds.has(item.id) &&
        !demoEmails.has(item.email.toLowerCase()) &&
        !(item.clientId && demoClientIds.has(item.clientId)) &&
        !(item.partnerId && demoPartnerIds.has(item.partnerId)) &&
        !(item.organizationId && demoOrgIds.has(item.organizationId)),
    ),
    clientProfiles: state.clientProfiles.filter((item) => !demoClientIds.has(item.clientId)),
    leads: state.leads.filter((item) => !demoLeadIds.has(item.id) && item.email !== "aarav@example.com"),
    cases: state.cases.filter((item) => !demoCaseIds.has(item.id) && !demoClientIds.has(item.clientId)),
    documents: state.documents.filter((item) => !demoCaseIds.has(item.caseId)),
    milestones: state.milestones.filter((item) => !demoCaseIds.has(item.caseId)),
    conversations: state.conversations.filter(
      (item) => !(item.leadId && demoLeadIds.has(item.leadId)) && !(item.caseId && demoCaseIds.has(item.caseId)),
    ),
    riskProfiles: state.riskProfiles.filter(
      (item) => !(item.leadId && demoLeadIds.has(item.leadId)) && !(item.caseId && demoCaseIds.has(item.caseId)),
    ),
    contentTasks: state.contentTasks.filter((item) => item.id !== "cr_001"),
    partnerReferrals: state.partnerReferrals.filter(
      (item) => item.id !== "pr_001" && !(item.partnerId && demoPartnerIds.has(item.partnerId)),
    ),
    b2gInquiries: state.b2gInquiries.filter((item) => item.id !== "b2g_001"),
    auditLogs: state.auditLogs.filter(
      (item) =>
        !demoUserIds.has(item.entityId) &&
        !demoLeadIds.has(item.entityId) &&
        !demoCaseIds.has(item.entityId),
    ),
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
      const parsed = JSON.parse(raw) as Partial<PlatformState>;
      const normalized = scrubLegacyDemoState(normalizeState(parsed));
      if (!Array.isArray(parsed.clientProfiles) || JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        this.writeState(normalized);
      }
      return normalized;
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

  syncFromStore() {
    if (!this.persistToFile || !existsSync(this.storePath)) return;

    try {
      const raw = readFileSync(this.storePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<PlatformState>;
      this.state = scrubLegacyDemoState(normalizeState(parsed));
    } catch (error) {
      console.warn("[x-hub] Could not refresh platform store; keeping active state.", error);
    }
  }

  cleanupLegacyDemoData() {
    const cleaned = scrubLegacyDemoState(this.state);
    if (JSON.stringify(cleaned) !== JSON.stringify(this.state)) {
      this.state = cleaned;
      this.persist();
    }
  }

  private clientProfiles() {
    if (!Array.isArray(this.state.clientProfiles)) {
      this.state.clientProfiles = [];
    }
    return this.state.clientProfiles;
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

  getClientProfile(clientId: string) {
    return this.clientProfiles().find((profile) => profile.clientId === clientId) ?? null;
  }

  listClientProfiles() {
    return [...this.clientProfiles()];
  }

  upsertClientProfile(input: UpsertClientProfileInput, actorId?: string) {
    const profiles = this.clientProfiles();
    const existing = profiles.find((profile) => profile.clientId === input.clientId);
    const cleanPatch = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as UpsertClientProfileInput;

    if (existing) {
      Object.assign(existing, cleanPatch, { updatedAt: nowIso() });
      this.audit("profile.updated", "client_profile", existing.id, actorId, {
        clientId: existing.clientId,
        preferredTrack: existing.preferredTrack,
        targetCountry: existing.targetCountry,
      });
      this.persist();
      return existing;
    }

    const createdAt = input.createdAt ?? nowIso();
    const profile: ClientProfile = {
      ...cleanPatch,
      id: input.id ?? id("prof"),
      createdAt,
      updatedAt: input.updatedAt ?? createdAt,
    };
    profiles.unshift(profile);
    this.audit("profile.created", "client_profile", profile.id, actorId, {
      clientId: profile.clientId,
      preferredTrack: profile.preferredTrack,
      targetCountry: profile.targetCountry,
    });
    this.persist();
    return profile;
  }

  createUser(input: CreateUserInput) {
    const createdAt = input.createdAt ?? nowIso();
    const user: PlatformUser = {
      ...input,
      id: input.id ?? id("usr"),
      createdAt,
      updatedAt: input.updatedAt ?? createdAt,
    };
    this.state.users.unshift(user);
    this.audit("user.provisioned", "user", user.id, undefined, {
      role: user.role,
      clientId: user.clientId,
      portalStatus: user.portalStatus,
    });
    this.persist();
    return user;
  }

  updateUser(identifier: string, patch: Partial<PlatformUser>) {
    const needle = identifier.trim().toLowerCase();
    const user = this.state.users.find(
      (item) => item.id === identifier || item.email.toLowerCase() === needle,
    );
    if (!user) return null;
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as Partial<PlatformUser>;
    Object.assign(user, cleanPatch, { updatedAt: nowIso() });
    this.audit("user.updated", "user", user.id, undefined, {
      role: user.role,
      portalStatus: user.portalStatus,
      mustChangePassword: user.mustChangePassword,
    });
    this.persist();
    return user;
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

  deleteLead(idValue: string, actorId?: string) {
    const index = this.state.leads.findIndex((item) => item.id === idValue);
    if (index < 0) return null;
    const [lead] = this.state.leads.splice(index, 1);
    this.state.conversations = this.state.conversations.filter((item) => item.leadId !== lead.id);
    this.state.riskProfiles = this.state.riskProfiles.filter((item) => item.leadId !== lead.id);
    for (const migrationCase of this.state.cases) {
      if (migrationCase.leadId === lead.id) migrationCase.leadId = undefined;
    }
    this.audit("lead.deleted", "lead", lead.id, actorId, {
      source: lead.source,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    });
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

  createCase(input: CreateCaseInput) {
    const createdAt = input.createdAt ?? nowIso();
    const migrationCase: MigrationCase = {
      ...input,
      id: input.id ?? id("case"),
      createdAt,
      updatedAt: input.updatedAt ?? createdAt,
    };
    this.state.cases.unshift(migrationCase);
    this.audit("case.created", "case", migrationCase.id, undefined, {
      clientId: migrationCase.clientId,
      track: migrationCase.track,
      country: migrationCase.country,
      program: migrationCase.program,
    });
    this.persist();
    return migrationCase;
  }

  createDocument(input: CreateDocumentInput) {
    const doc: ClientDocument = {
      ...input,
      id: input.id ?? id("doc"),
    };
    this.state.documents.unshift(doc);
    this.audit("document.created", "document", doc.id, undefined, {
      caseId: doc.caseId,
      status: doc.status,
      category: doc.category,
    });
    this.persist();
    return doc;
  }

  createMilestone(input: CreateMilestoneInput) {
    const milestone: CaseMilestone = {
      ...input,
      id: input.id ?? id("ms"),
    };
    this.state.milestones.unshift(milestone);
    this.audit("milestone.created", "milestone", milestone.id, undefined, {
      caseId: milestone.caseId,
      status: milestone.status,
    });
    this.persist();
    return milestone;
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
      clientProfiles: canSeeOps
        ? [...this.clientProfiles()]
        : user.clientId
          ? this.clientProfiles().filter((profile) => profile.clientId === user.clientId)
          : [],
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
        clientProfiles: this.clientProfiles().length,
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
  if (
    !globalForPlatform.__xiphiasPlatformRepository ||
    typeof globalForPlatform.__xiphiasPlatformRepository.upsertClientProfile !== "function" ||
    typeof globalForPlatform.__xiphiasPlatformRepository.cleanupLegacyDemoData !== "function" ||
    typeof globalForPlatform.__xiphiasPlatformRepository.syncFromStore !== "function"
  ) {
    globalForPlatform.__xiphiasPlatformRepository = new PlatformRepositoryImpl();
  }
  globalForPlatform.__xiphiasPlatformRepository.syncFromStore();
  globalForPlatform.__xiphiasPlatformRepository.cleanupLegacyDemoData();
  return globalForPlatform.__xiphiasPlatformRepository;
}
