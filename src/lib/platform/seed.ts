import type {
  B2GInquiry,
  AuditLog,
  CaseMilestone,
  ClientProfile,
  ClientDocument,
  ContentReviewTask,
  ConversationMessage,
  MigrationCase,
  PartnerReferral,
  PlatformLead,
  PlatformUser,
  RiskProfile,
} from "./types";

const now = "2026-06-01T06:30:00.000Z";

export function createSeedPlatformState() {
  const users: PlatformUser[] = [
    {
      id: "usr_admin",
      email: "admin@xiphias.local",
      name: "XIPHIAS Admin",
      role: "admin",
      createdAt: now,
    },
    {
      id: "usr_client",
      email: "client@xiphias.local",
      name: "Aarav Mehta",
      role: "client",
      clientId: "cli_aarav",
      createdAt: now,
    },
    {
      id: "usr_partner",
      email: "partner@xiphias.local",
      name: "Partner Desk",
      role: "partner",
      partnerId: "ptr_global",
      createdAt: now,
    },
    {
      id: "usr_b2g",
      email: "mobility@gov.local",
      name: "Institution Desk",
      role: "b2g",
      organizationId: "org_public",
      createdAt: now,
    },
  ];

  const leads: PlatformLead[] = [
    {
      id: "lead_001",
      source: "eligibility",
      status: "qualified",
      name: "Aarav Mehta",
      email: "aarav@example.com",
      phone: "+919800000000",
      track: "residency",
      country: "Portugal",
      program: "Portugal alternative routes",
      message: "Interested in investment-linked residency with family inclusion.",
      page: "/residency/portugal",
      consent: true,
      score: 82,
      tags: ["hnwi", "family", "residency"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const clientProfiles: ClientProfile[] = [
    {
      id: "prof_aarav",
      clientId: "cli_aarav",
      userId: "usr_client",
      fullName: "Aarav Mehta",
      email: "aarav@example.com",
      phone: "+919800000000",
      nationality: "India",
      residenceCountry: "India",
      familyMembers: "Spouse and one dependent child",
      occupation: "Founder / investor",
      companyName: "Mehta Ventures",
      preferredTrack: "residency",
      targetCountry: "Portugal",
      targetProgram: "Alternative investment route",
      budgetUsd: 300000,
      timelineMonths: 12,
      sourceOfFunds: "Business income, retained earnings, and liquid investments.",
      notes: "Prefers a low-physical-presence route with family inclusion.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const cases: MigrationCase[] = [
    {
      id: "case_001",
      clientId: "cli_aarav",
      leadId: "lead_001",
      track: "residency",
      country: "Portugal",
      program: "Alternative investment route",
      stage: "documents",
      title: "Portugal residency strategy",
      advisorName: "Senior Global Mobility Desk",
      nextAction: "Upload proof of funds and dependent passports.",
      nextActionDue: "2026-06-06",
      riskLevel: "medium",
      progress: 38,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const documents: ClientDocument[] = [
    {
      id: "doc_001",
      caseId: "case_001",
      label: "Primary applicant passport",
      category: "identity",
      status: "accepted",
      uploadedAt: "2026-05-30T10:00:00.000Z",
    },
    {
      id: "doc_002",
      caseId: "case_001",
      label: "Proof of funds",
      category: "financial",
      status: "requested",
      dueAt: "2026-06-06",
    },
    {
      id: "doc_003",
      caseId: "case_001",
      label: "Civil documents for dependents",
      category: "civil",
      status: "reviewing",
      uploadedAt: "2026-05-31T10:00:00.000Z",
    },
  ];

  const milestones: CaseMilestone[] = [
    {
      id: "ms_001",
      caseId: "case_001",
      title: "Profile strategy",
      description: "Program-fit discussion and route shortlist.",
      status: "complete",
      completedAt: "2026-05-29",
    },
    {
      id: "ms_002",
      caseId: "case_001",
      title: "Document collection",
      description: "Identity, financial, civil, and source-of-funds records.",
      status: "active",
      dueAt: "2026-06-06",
    },
    {
      id: "ms_003",
      caseId: "case_001",
      title: "Due diligence review",
      description: "Risk checks and document consistency review.",
      status: "pending",
      dueAt: "2026-06-10",
    },
  ];

  const riskProfiles: RiskProfile[] = [
    {
      id: "risk_001",
      caseId: "case_001",
      level: "medium",
      requiresStaffReview: true,
      flags: [
        {
          code: "source_of_funds_pending",
          label: "Source of funds pending",
          severity: "medium",
          detail: "Proof of funds and source narrative have not been accepted yet.",
        },
      ],
      createdAt: now,
    },
  ];

  const conversations: ConversationMessage[] = [
    {
      id: "msg_001",
      leadId: "lead_001",
      caseId: "case_001",
      channel: "portal",
      direction: "internal",
      from: "XIPHIAS",
      to: "Aarav Mehta",
      body: "Document collection is active. Please upload proof of funds this week.",
      createdAt: now,
    },
  ];

  const contentTasks: ContentReviewTask[] = [
    {
      id: "cr_001",
      title: "Portugal route rules review",
      sourceUrl: "https://www.xiphiasimmigration.com/residency/portugal",
      targetPath: "content/residency/portugal/_country.mdx",
      status: "needs_review",
      suggestedSummary:
        "Review wording around property-linked routes and alternative compliant pathways.",
      proposedChanges: [
        "Check investment threshold language against current program guidance.",
        "Add staff-approved disclaimer that rules and timelines are indicative.",
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const partnerReferrals: PartnerReferral[] = [
    {
      id: "pr_001",
      partnerId: "ptr_global",
      partnerName: "Partner Desk",
      companyName: "Global Channel Partner",
      contactEmail: "partner@example.com",
      clientName: "Riya Shah",
      targetCountry: "UAE",
      targetProgram: "Investor residency",
      status: "screening",
      notes: "Potential founder relocation inquiry.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const b2gInquiries: B2GInquiry[] = [
    {
      id: "b2g_001",
      organizationName: "Institutional Mobility Office",
      contactName: "Mobility Coordinator",
      contactEmail: "mobility@example.org",
      requirement: "Bulk advisory support for students and skilled workers.",
      region: "India to Europe",
      volumeEstimate: "100-250 profiles",
      status: "triage",
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users,
    clientProfiles,
    leads,
    cases,
    documents,
    milestones,
    conversations,
    riskProfiles,
    contentTasks,
    partnerReferrals,
    b2gInquiries,
    auditLogs: [] as AuditLog[],
  };
}
