import type { AnswerMap, Track } from "@/lib/eligibility/types";

export type PortalRole = "client" | "staff" | "admin" | "partner" | "b2g";
export type PortalStatus = "invited" | "active" | "disabled";

export type PlatformUser = {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  clientId?: string;
  partnerId?: string;
  organizationId?: string;
  passwordSha256?: string;
  mustChangePassword?: boolean;
  portalStatus?: PortalStatus;
  registrationPaymentRef?: string;
  createdAt: string;
  updatedAt?: string;
};

export type LeadSource =
  | "website"
  | "chat"
  | "whatsapp"
  | "eligibility"
  | "registration"
  | "programme_ai"
  | "partner"
  | "b2g";

export type LeadStatus =
  | "new"
  | "qualified"
  | "consultation_booked"
  | "case_opened"
  | "closed";

export type PlatformLead = {
  id: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  email?: string;
  phone?: string;
  track?: Track;
  country?: string;
  program?: string;
  message?: string;
  page?: string;
  referrer?: string;
  consent?: boolean;
  score?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ClientProfile = {
  id: string;
  clientId: string;
  userId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  residenceCountry?: string;
  dateOfBirth?: string;
  familyMembers?: string;
  occupation?: string;
  companyName?: string;
  preferredTrack?: Track;
  targetCountry?: string;
  targetProgram?: string;
  budgetUsd?: number;
  timelineMonths?: number;
  sourceOfFunds?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationChannel = "website-chat" | "whatsapp" | "email" | "portal";
export type ConversationDirection = "inbound" | "outbound" | "internal";

export type ConversationMessage = {
  id: string;
  leadId?: string;
  caseId?: string;
  channel: ConversationChannel;
  direction: ConversationDirection;
  from: string;
  to?: string;
  body: string;
  providerMessageId?: string;
  createdAt: string;
};

export type CaseStage =
  | "intake"
  | "documents"
  | "due_diligence"
  | "strategy"
  | "filing"
  | "government_review"
  | "decision"
  | "post_approval";

export type MigrationCase = {
  id: string;
  clientId: string;
  leadId?: string;
  track: Track;
  country: string;
  program: string;
  stage: CaseStage;
  title: string;
  advisorName: string;
  nextAction: string;
  nextActionDue: string;
  riskLevel: RiskLevel;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentStatus = "requested" | "uploaded" | "reviewing" | "accepted" | "rework";

export type ClientDocument = {
  id: string;
  caseId: string;
  label: string;
  category: "identity" | "financial" | "education" | "employment" | "civil" | "investment" | "other";
  status: DocumentStatus;
  dueAt?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  storageKey?: string;
  reviewedAt?: string;
  notes?: string;
};

export type MilestoneStatus = "pending" | "active" | "complete" | "blocked";

export type CaseMilestone = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueAt?: string;
  completedAt?: string;
};

export type RiskLevel = "low" | "medium" | "high" | "blocked";

export type RiskFlag = {
  code: string;
  label: string;
  severity: RiskLevel;
  detail: string;
};

export type RiskProfile = {
  id: string;
  caseId?: string;
  leadId?: string;
  level: RiskLevel;
  flags: RiskFlag[];
  requiresStaffReview: boolean;
  createdAt: string;
};

export type ContentReviewStatus = "needs_review" | "approved" | "rejected" | "published";

export type ContentReviewTask = {
  id: string;
  title: string;
  sourceUrl: string;
  targetPath?: string;
  status: ContentReviewStatus;
  suggestedSummary: string;
  proposedChanges: string[];
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PartnerReferralStatus =
  | "submitted"
  | "screening"
  | "accepted"
  | "case_opened"
  | "not_a_fit";

export type PartnerReferral = {
  id: string;
  partnerId?: string;
  partnerName: string;
  companyName?: string;
  contactEmail: string;
  contactPhone?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  targetCountry?: string;
  targetProgram?: string;
  status: PartnerReferralStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type B2GInquiryStatus = "submitted" | "triage" | "proposal" | "active" | "closed";

export type B2GInquiry = {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  requirement: string;
  region?: string;
  volumeEstimate?: string;
  status: B2GInquiryStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuditAction =
  | "user.provisioned"
  | "user.updated"
  | "password.changed"
  | "registration.provisioned"
  | "profile.created"
  | "profile.updated"
  | "lead.created"
  | "lead.updated"
  | "lead.deleted"
  | "conversation.created"
  | "case.created"
  | "case.updated"
  | "document.created"
  | "document.uploaded"
  | "document.updated"
  | "document.plan.generated"
  | "milestone.created"
  | "risk.evaluated"
  | "compliance.screened"
  | "content_review.created"
  | "content_review.updated"
  | "content_review.published"
  | "partner_referral.created"
  | "partner_referral.updated"
  | "b2g_inquiry.created"
  | "b2g_inquiry.updated"
  | "whatsapp.tested"
  | "portal.viewed";

export type AuditLog = {
  id: string;
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type XiaRequest = {
  message?: string;
  track?: Track;
  answers?: AnswerMap;
  goals?: string[];
  country?: string;
};

export type XiaRecommendation = {
  intent: string;
  summary: string;
  criteria: string[];
  confidence: number;
  handoffRequired: boolean;
  knowledge?: {
    coverageSummary: string;
    totalDocs: number;
    programPages: number;
    countryPages: number;
    insightPages: number;
    requestedCountry?: string;
    exactCountryDocs?: number;
    exactProgramPages?: number;
    availableVerticals?: string[];
    gaps?: string[];
  };
  recommendedPrograms: {
    name: string;
    country?: string;
    reason: string;
    score: number;
    href?: string;
  }[];
  actions: { label: string; href: string; type: "primary" | "secondary" }[];
  sources: { label: string; href: string }[];
  evidence?: { title: string; href: string; excerpt: string }[];
};

export type PassportEngineRequest = {
  nationality?: string;
  targetRegions?: string[];
  budgetUsd?: number;
  timelineMonths?: number;
  includeFamily?: boolean;
  priorities?: string[];
};

export type PassportEngineResult = {
  generatedAt: string;
  criteria: string[];
  matches: {
    name: string;
    country: string;
    pathway: string;
    score: number;
    rationale: string[];
    caution?: string;
  }[];
};

export type PlatformSnapshot = {
  user: PlatformUser;
  clientProfiles: ClientProfile[];
  cases: MigrationCase[];
  documents: ClientDocument[];
  milestones: CaseMilestone[];
  leads: PlatformLead[];
  conversations: ConversationMessage[];
  riskProfiles: RiskProfile[];
  contentTasks: ContentReviewTask[];
  partnerReferrals: PartnerReferral[];
  b2gInquiries: B2GInquiry[];
  auditLogs: AuditLog[];
};
