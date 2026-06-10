import type {
  AuditLog,
  B2GInquiry,
  CaseMilestone,
  ClientDocument,
  ClientProfile,
  ContentReviewTask,
  ConversationMessage,
  MigrationCase,
  PartnerReferral,
  PlatformLead,
  PlatformUser,
  RiskProfile,
} from "./types";

export function createSeedPlatformState() {
  return {
    users: [] as PlatformUser[],
    clientProfiles: [] as ClientProfile[],
    leads: [] as PlatformLead[],
    cases: [] as MigrationCase[],
    documents: [] as ClientDocument[],
    milestones: [] as CaseMilestone[],
    conversations: [] as ConversationMessage[],
    riskProfiles: [] as RiskProfile[],
    contentTasks: [] as ContentReviewTask[],
    partnerReferrals: [] as PartnerReferral[],
    b2gInquiries: [] as B2GInquiry[],
    auditLogs: [] as AuditLog[],
  };
}
