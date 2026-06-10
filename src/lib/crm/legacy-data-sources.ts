export type LegacySqlDatabaseSource = {
  key: "india" | "dubai" | "hrms";
  label: string;
  path: string;
  sizeGb: number;
  databaseName: string;
  priority: "primary" | "secondary";
  notes: string;
};

export type LegacyUploadFolder = {
  key: string;
  label: string;
  folder: string;
  alternatePaths?: string[];
  dbColumns: string[];
  purpose: string;
};

export type LegacySqlBackupSource = {
  key: string;
  label: string;
  path: string;
  sizeGb: number;
  likelyDatabase: string;
  notes: string;
};

export const legacySqlDatabaseSources: LegacySqlDatabaseSource[] = [
  {
    key: "india",
    label: "India CRM",
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\Database\\India-CRM\\india-crm.sql",
    sizeGb: 17.6,
    databaseName: "immigration_com",
    priority: "primary",
    notes: "Main CRM SQL Server script. Contains database schema and INSERT data.",
  },
  {
    key: "dubai",
    label: "Dubai CRM",
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\Database\\Dubai-CRM\\dubai.sql",
    sizeGb: 0.65,
    databaseName: "Dubai CRM",
    priority: "secondary",
    notes: "Dubai CRM SQL Server script. Keep separate until branch/entity mapping is confirmed.",
  },
  {
    key: "hrms",
    label: "HRMS",
    path: "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\Database\\HRMS\\HRMS.sql",
    sizeGb: 1.17,
    databaseName: "HRMS",
    priority: "secondary",
    notes: "HR and payroll database. Not part of the first client CRM cutover.",
  },
];

export const legacySqlBackupSources: LegacySqlBackupSource[] = [
  {
    key: "backupindiancrm",
    label: "India CRM backup",
    path: "E:\\XIPHIAS_data_backup\\backupindiancrm",
    sizeGb: 5.74,
    likelyDatabase: "immigration_com",
    notes: "SQL Server backup-format file. Prefer this for restore if SQL Server accepts it.",
  },
  {
    key: "backupdubaicrm",
    label: "Dubai CRM backup",
    path: "E:\\XIPHIAS_data_backup\\backupdubaicrm",
    sizeGb: 0.44,
    likelyDatabase: "Dubai CRM",
    notes: "SQL Server backup-format file for Dubai CRM.",
  },
  {
    key: "backuphrm",
    label: "HRMS backup",
    path: "E:\\XIPHIAS_data_backup\\backupHCRM",
    sizeGb: 0.18,
    likelyDatabase: "HRMS",
    notes: "SQL Server backup-format file for HR/CRM support data.",
  },
  {
    key: "backupimmigrationevent",
    label: "Immigration event backup",
    path: "E:\\XIPHIAS_data_backup\\backupimmigrationevent",
    sizeGb: 3.62,
    likelyDatabase: "immigration_com_event",
    notes: "SQL Server backup-format file for event/history data.",
  },
];

export const defaultLegacyUploadRoot =
  "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\wwwroot\\xiphiasimmigration.com\\XIPHIAS\\XIPHIAS_IMMIGRATION\\IMMIGRATION_CRM_TRAIL_PRIVATE";

export const fallbackLegacyUploadRoots = [
  defaultLegacyUploadRoot,
  "G:\\2026-06-01\\XIPHIAS_IMMIGRATION\\IMMIGRATION_CRM_TRAIL_PRIVATE",
  "G:\\Accounts Data\\Immigration data\\INDIAN CRM\\XCRM\\XIPHIAS\\IMMIGRATION_CRM_TRAIL_PRIVATE",
];

export const legacyUploadFolders: LegacyUploadFolder[] = [
  {
    key: "client-docs",
    label: "Client documents",
    folder: "ClientDocs",
    dbColumns: ["tbl_ClientDocuments.FILE"],
    purpose: "Passport, police clearance, education, employment, and other client-submitted documents.",
  },
  {
    key: "agreement-uploads",
    label: "Signed agreements",
    folder: "AgreementUploads",
    alternatePaths: ["G:\\AgreementUploads"],
    dbColumns: ["tbl_AgreementUpload.AGREEMENT", "tbl_ClientAgreements.AGREEMENT"],
    purpose: "Signed client agreements uploaded from staff/client agreement flows.",
  },
  {
    key: "agreement-templates",
    label: "Agreement templates",
    folder: "AgreementTemps",
    dbColumns: ["tbl_AgreementTemplate.AGREEMENT", "tbl_InitAgreement.AGREEMENT"],
    purpose: "Generated or unsigned agreement templates used before client signing.",
  },
  {
    key: "case-updates",
    label: "Case update files",
    folder: "StatusUpdates",
    dbColumns: ["tbl_CaseStatus.FILE"],
    purpose: "Files attached to case status updates and government request updates.",
  },
  {
    key: "support-files",
    label: "Support attachments",
    folder: "SupportFiles",
    dbColumns: ["tbl_Support.FILES", "tbl_SupportComments.FILES"],
    purpose: "Support ticket and support comment attachments.",
  },
  {
    key: "account-templates",
    label: "Account templates",
    folder: "AccountTemplates",
    dbColumns: ["tbl_SpecialInvoices.FILENAME"],
    purpose: "Invoice PDFs and account-related generated files.",
  },
  {
    key: "client-forms",
    label: "Client forms",
    folder: "ClientForms",
    dbColumns: ["tbl_ClientApplications.APPLICATION"],
    purpose: "Application forms linked from client application screens.",
  },
  {
    key: "app-uploads",
    label: "Application uploads",
    folder: "AppUploads",
    dbColumns: ["tbl_ApplicationForm.APPLICATION"],
    purpose: "Application approval and uploaded application files.",
  },
  {
    key: "communication-attachments",
    label: "Communication attachments",
    folder: "CommAttachments",
    dbColumns: ["tbl_client_Email.files", "tbl_MailBox.ATTACHMENT", "tbl_MailBox_Detail.ATTACHMENT"],
    purpose: "Email and mailbox attachments from the legacy communication module.",
  },
  {
    key: "client-pics",
    label: "Client photos",
    folder: "ClientPics",
    dbColumns: ["tbl_ClientUser.PHOTO"],
    purpose: "Client profile photos used by assessment/profile screens.",
  },
];

export function getLegacyUploadRoot() {
  return process.env.XIPHIAS_CRM_FILE_STORAGE_ROOT?.trim() || defaultLegacyUploadRoot;
}

export function getLegacyUploadRoots() {
  const configured = process.env.XIPHIAS_CRM_FILE_STORAGE_ROOTS?.trim();
  if (configured) {
    return configured
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const primary = getLegacyUploadRoot();
  return Array.from(new Set([primary, ...fallbackLegacyUploadRoots]));
}

export function getLegacySqlRoot() {
  return (
    process.env.XIPHIAS_CRM_SQL_ROOT?.trim() ||
    "G:\\XIPHIAS-IMMIGRATION-Server-Backup-2023\\Database"
  );
}
