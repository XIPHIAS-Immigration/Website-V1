export type LegacyCrmSource = {
  path: string;
  role: "primary-source" | "deployment-copy" | "deployment-snapshot";
  summary: string;
};

export type LegacyCrmModule = {
  area: string;
  controllers: number;
  views: number;
  responsibility: string;
  migrationPriority: "p1" | "p2" | "p3";
  target: string;
};

export type LegacyCrmSchemaGroup = {
  label: string;
  tables: string[];
  hubLink: string;
};

export type LegacyCrmPhase = {
  title: string;
  status: "mapped" | "ready-next" | "blocked";
  detail: string;
};

export const legacyCrmSources: LegacyCrmSource[] = [
  {
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023",
    role: "primary-source",
    summary:
      "Primary server backup found on the drive. Contains India/Dubai/HRMS SQL Server scripts plus the deployed CRM webroot and private upload folders.",
  },
  {
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\Database\\India-CRM\\india-crm.sql",
    role: "deployment-copy",
    summary:
      "Main India CRM SQL Server script. It contains schema plus INSERT data and should be restored before Prisma introspection.",
  },
  {
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\wwwroot\\xiphiasimmigration.com\\XIPHIAS\\XIPHIAS_IMMIGRATION\\IMMIGRATION_CRM_TRAIL_PRIVATE",
    role: "deployment-snapshot",
    summary:
      "Main private upload archive for ClientDocs, AgreementUploads, StatusUpdates, SupportFiles, AccountTemplates, ClientForms, and related CRM files.",
  },
];

export const legacyCrmModules: LegacyCrmModule[] = [
  {
    area: "Opportunity",
    controllers: 21,
    views: 59,
    responsibility: "Leads, enquiries, appointments, opportunities, tasks, call tracking, references, live chat, and lead import.",
    migrationPriority: "p1",
    target: "Modern staff pipeline linked to website leads and X-Hub client profiles.",
  },
  {
    area: "Clients",
    controllers: 22,
    views: 68,
    responsibility: "Client records, applications, documents, approvals, agreements, case updates, notes, and logs.",
    migrationPriority: "p1",
    target: "Single client profile, case timeline, document workspace, agreement tracking, and advisor notes.",
  },
  {
    area: "Assessment",
    controllers: 8,
    views: 29,
    responsibility: "Express assessment, assessment content, advisor scoring, points, and assessment mail.",
    migrationPriority: "p1",
    target: "Connect website eligibility, paid report funnel, and staff assessment review.",
  },
  {
    area: "Communication",
    controllers: 10,
    views: 28,
    responsibility: "Bulk mail, simple mail, email API/sync, courier, news, gallery, and testimonials.",
    migrationPriority: "p2",
    target: "Template-based SMTP email, communication logs, courier notes, and public content approval.",
  },
  {
    area: "System",
    controllers: 30,
    views: 123,
    responsibility: "Branches, countries, programs, fees, documents, SMTP, SMS, templates, tax, promo codes, and sources.",
    migrationPriority: "p2",
    target: "Admin-controlled master data backing CRM, Hub, reports, and content workflows.",
  },
  {
    area: "Accounts",
    controllers: 21,
    views: 63,
    responsibility: "Invoices, receipts, refunds, expenses, commissions, outstanding amounts, and approvals.",
    migrationPriority: "p3",
    target: "Read-only finance history first. Active website payments remain with Topmate unless changed.",
  },
  {
    area: "Administration",
    controllers: 5,
    views: 18,
    responsibility: "Users, roles, access controls, page-level access, and rename user flows.",
    migrationPriority: "p2",
    target: "Role-based access using the current portal auth model and audit logs.",
  },
  {
    area: "Events",
    controllers: 5,
    views: 19,
    responsibility: "Events, attendees, event tickets, guest tickets, and user event tickets.",
    migrationPriority: "p3",
    target: "Later event management module or integrate with marketing/content operations.",
  },
  {
    area: "Help",
    controllers: 5,
    views: 20,
    responsibility: "Support, FAQ, blog posts, and official updates.",
    migrationPriority: "p3",
    target: "Support knowledge base and content review queue.",
  },
  {
    area: "Reporting",
    controllers: 3,
    views: 4,
    responsibility: "Coordinator, task, and assessment point reports.",
    migrationPriority: "p3",
    target: "Modern dashboards after the operational data model is migrated.",
  },
];

export const legacyCrmSchemaGroups: LegacyCrmSchemaGroup[] = [
  {
    label: "Lead and opportunity",
    tables: ["tbl_Enquiry", "tbl_LeadDetails", "tbl_Opportunities", "tbl_Tasks", "tbl_TaskLog", "tbl_SourceMaster"],
    hubLink: "PlatformLead and operations pipeline",
  },
  {
    label: "Client profile",
    tables: [
      "tbl_Client",
      "tbl_ClientContact",
      "tbl_ClientFamily",
      "tbl_ClientEducation",
      "tbl_ClientLanguage",
      "tbl_ClientOccupation",
      "tbl_ClientBusiness",
    ],
    hubLink: "ClientProfile and X-Hub profile page",
  },
  {
    label: "Case and documents",
    tables: [
      "tbl_ClientApplications",
      "tbl_ClientDocuments",
      "tbl_ClientDocsApproval",
      "tbl_DocumentMaster",
      "tbl_DocumentMapping",
      "tbl_AgreementUpload",
    ],
    hubLink: "MigrationCase, ClientDocument, milestones, and document intelligence",
  },
  {
    label: "Assessment",
    tables: [
      "tbl_Assessment",
      "tbl_Assessment_points",
      "tbl_AssessmentContent",
      "tbl_AssessmentStatus",
      "tbl_AssessedContent",
      "tbl_ExpVisaPointCalculation",
    ],
    hubLink: "Eligibility, assessment report, and advisor review",
  },
  {
    label: "Communication",
    tables: ["tbl_EmailLog", "tbl_EmailTemplates", "tbl_SMTPConfig", "tbl_SMSConfig", "tbl_MailBox", "tbl_PostAgreementMailLogs"],
    hubLink: "ConversationMessage, email templates, WhatsApp/SMS/email logs",
  },
  {
    label: "Finance history",
    tables: ["tbl_InvoiceDetails", "tbl_Receipt", "tbl_Refund", "tbl_OnlinePayments", "tbl_PayuResponse", "tbl_FeeMaster"],
    hubLink: "Invoice/payment history only; Topmate remains live checkout",
  },
];

export const legacyCrmConversionPhases: LegacyCrmPhase[] = [
  {
    title: "Source inventory",
    status: "mapped",
    detail: "Primary data source identified as the 2023 G-drive server backup. Older 2019/2020 backups remain fallback cross-checks.",
  },
  {
    title: "Schema access",
    status: "mapped",
    detail: "India CRM SQL script is present and includes schema plus INSERT data. SQL Server restore is still required before Prisma db pull.",
  },
  {
    title: "SQL Server restore",
    status: "blocked",
    detail: "Local SQL Server/sqlcmd is not available in this environment yet, so the dump cannot be restored or introspected live from here.",
  },
  {
    title: "Opportunity module",
    status: "ready-next",
    detail: "Best first port because website leads, eligibility leads, and X-Hub profiles all depend on it.",
  },
  {
    title: "Client and documents",
    status: "ready-next",
    detail: "Second port. This connects old CRM client records to the new single client profile and document workspace.",
  },
  {
    title: "Communication",
    status: "ready-next",
    detail: "SMTP/SMS modules are identified. Credentials must stay in env/secret storage, not source code.",
  },
];
