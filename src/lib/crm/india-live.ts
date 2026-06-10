import "server-only";

import path from "node:path";
import { crmSql, getLiveCrmPool, isLiveCrmConfigured, toNumber, toText } from "@/lib/crm/live-sql";
import { resolveLegacyFilePath } from "@/lib/crm/legacy-file-storage";

const PAGE_SIZE = 40;

type DbRow = Record<string, unknown>;

function getRecordsets(result: { recordsets: unknown }) {
  return result.recordsets as DbRow[][];
}

export type CrmFileLink = {
  fileName: string;
  href: string;
  exists: boolean;
};

export type CrmMetric = {
  label: string;
  value: number;
};

export type IndiaDashboard = {
  configured: boolean;
  error?: string;
  counts: {
    clients: number;
    clientFiles: number;
    documents: number;
    applications: number;
    agreements: number;
    invoices: number;
    receipts: number;
    support: number;
    openSupport: number;
    notes: number;
    tasks: number;
    enquiries: number;
  };
  finance: {
    invoiceTotal: number;
    receiptTotal: number;
  };
  latestClients: IndiaClientListItem[];
  recentSupport: IndiaSupportItem[];
  recentTasks: IndiaTaskItem[];
  statusBreakdown: CrmMetric[];
  sourceBreakdown: CrmMetric[];
  branchBreakdown: CrmMetric[];
};

export type IndiaClientListItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  joinedOn: string;
  coordinators: string;
  active: boolean;
  status: string;
  updatedOn: string;
  updatedBy: string;
};

export type IndiaClientListResult = {
  configured: boolean;
  error?: string;
  q: string;
  status: string;
  page: number;
  pageSize: number;
  total: number;
  statuses: CrmMetric[];
  clients: IndiaClientListItem[];
};

export type IndiaClientProfile = {
  configured: boolean;
  error?: string;
  client: DbRow | null;
  documents: Array<DbRow & { links: CrmFileLink[] }>;
  applications: Array<DbRow & { links: CrmFileLink[] }>;
  agreements: Array<DbRow & { links: CrmFileLink[] }>;
  caseUpdates: Array<DbRow & { links: CrmFileLink[] }>;
  invoices: DbRow[];
  receipts: DbRow[];
  support: IndiaSupportItem[];
  notes: DbRow[];
  tasks: IndiaTaskItem[];
  education: DbRow[];
  family: DbRow[];
  language: DbRow[];
  occupation: DbRow[];
  business: DbRow[];
  coordinators: DbRow[];
};

export type IndiaDocumentItem = {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  file: string;
  links: CrmFileLink[];
};

export type IndiaDocumentWorkspace = {
  configured: boolean;
  error?: string;
  q: string;
  page: number;
  pageSize: number;
  total: number;
  documents: IndiaDocumentItem[];
  applications: Array<DbRow & { links: CrmFileLink[] }>;
  agreements: Array<DbRow & { links: CrmFileLink[] }>;
  folders: Array<{
    folder: string;
    label: string;
    total: number;
    empty: number;
    withPath: number;
  }>;
};

export type IndiaAccounts = {
  configured: boolean;
  error?: string;
  totals: {
    invoices: number;
    receipts: number;
    refunds: number;
    invoiceAmount: number;
    receiptAmount: number;
    refundAmount: number;
  };
  invoices: DbRow[];
  receipts: DbRow[];
  unpaidClients: DbRow[];
};

export type IndiaSupportItem = {
  id: number;
  clientId: number;
  client: string;
  type: string;
  subject: string;
  status: string;
  created: string;
  responsible: string;
  assigner: string;
};

export type IndiaSupportWorkspace = {
  configured: boolean;
  error?: string;
  q: string;
  page: number;
  pageSize: number;
  total: number;
  tickets: IndiaSupportItem[];
};

export type IndiaLeadWorkspace = {
  configured: boolean;
  error?: string;
  counts: {
    enquiries: number;
    opportunities: number;
    appointments: number;
    callers: number;
    missedCalls: number;
  };
  enquiries: DbRow[];
  opportunities: DbRow[];
};

export type IndiaTaskItem = {
  id: number;
  taskId: number;
  clientId: number;
  clientName: string;
  subject: string;
  note: string;
  dueDate: string;
  doneOn: string;
  assignedTo: string;
  assignedBy: string;
  status: string;
  done: boolean;
};

export type IndiaTaskWorkspace = {
  configured: boolean;
  error?: string;
  q: string;
  page: number;
  pageSize: number;
  total: number;
  openTasks: number;
  tasks: IndiaTaskItem[];
};

export type IndiaCommunicationWorkspace = {
  configured: boolean;
  error?: string;
  counts: {
    clientEmails: number;
    bulkEmailLogs: number;
    emailTemplates: number;
    mailingLists: number;
    smtpConfigs: number;
    activeSmtpConfigs: number;
    defaultSmtpConfigs: number;
    smsConfigs: number;
    activeSmsConfigs: number;
    smsTemplates: number;
    mailbox: number;
    mailboxDetails: number;
    subscribers: number;
    defaultMailers: number;
  };
  recentClientEmails: Array<DbRow & { links: CrmFileLink[] }>;
  recentBulkEmails: DbRow[];
  emailTemplates: DbRow[];
  mailingLists: DbRow[];
  mailbox: Array<DbRow & { links: CrmFileLink[] }>;
  smtpConfigs: DbRow[];
  smsConfigs: DbRow[];
  smsTemplates: DbRow[];
  defaultMailers: DbRow[];
};

export type IndiaCoverageModule = {
  module: string;
  status: "live" | "partial" | "missing";
  tables: Array<{
    table: string;
    rows: number;
    columns: number;
    usedInNext: boolean;
    notes: string;
  }>;
  functions: string[];
};

export type IndiaCoverage = {
  configured: boolean;
  error?: string;
  totals: {
    tables: number;
    views: number;
    procedures: number;
    triggers: number;
  };
  modules: IndiaCoverageModule[];
};

const emptyDashboard: IndiaDashboard = {
  configured: false,
  counts: {
    clients: 0,
    clientFiles: 0,
    documents: 0,
    applications: 0,
    agreements: 0,
    invoices: 0,
    receipts: 0,
    support: 0,
    openSupport: 0,
    notes: 0,
    tasks: 0,
    enquiries: 0,
  },
  finance: {
    invoiceTotal: 0,
    receiptTotal: 0,
  },
  latestClients: [],
  recentSupport: [],
  recentTasks: [],
  statusBreakdown: [],
  sourceBreakdown: [],
  branchBreakdown: [],
};

function unavailable<T extends { configured: boolean; error?: string }>(fallback: T, error = "XIPHIAS_CRM_SQL_PASSWORD is not configured.") {
  return { ...fallback, configured: false, error };
}

async function withIndiaPool<T extends { configured: boolean; error?: string }>(
  fallback: T,
  callback: (pool: Awaited<ReturnType<typeof getLiveCrmPool>>) => Promise<T>
) {
  if (!isLiveCrmConfigured()) return unavailable(fallback);

  try {
    return await callback(await getLiveCrmPool("india"));
  } catch (error) {
    return unavailable(fallback, error instanceof Error ? error.message : "Unable to query the Indian CRM database.");
  }
}

export function valueText(row: DbRow, key: string) {
  return toText(row[key]);
}

export function valueNumber(row: DbRow, key: string) {
  return toNumber(row[key]);
}

export function valueBool(row: DbRow, key: string) {
  const value = row[key];
  return value === true || value === 1 || value === "1";
}

function cleanPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function parseListParams(searchParams?: Record<string, string | string[] | undefined>) {
  return {
    q: toText(searchParams?.q || ""),
    status: toText(searchParams?.status || ""),
    page: cleanPage(searchParams?.page),
  };
}

function rowName(row: DbRow) {
  const direct = toText(row.NAME || row.CLIENT);
  if (direct) return direct;
  const pieces = [row.FIRST_NAME, row.MIDDLE_NAME, row.LAST_NAME].map(toText).filter(Boolean);
  return pieces.join(" ") || `Client #${toNumber(row.ID || row.CLIENT_ID)}`;
}

function mapClient(row: DbRow): IndiaClientListItem {
  return {
    id: toNumber(row.ID),
    name: rowName(row),
    email: toText(row.EMAIL),
    phone: toText(row.PHONE),
    dob: toText(row.DOB),
    joinedOn: toText(row.DOJ),
    coordinators: toText(row.COORDINATORS || row.Cordinators),
    active: valueBool(row, "STATUS"),
    status: toText(row.CLIENT_STATUS) || (valueBool(row, "STATUS") ? "Active" : "Inactive"),
    updatedOn: toText(row.LAST_UPDATED),
    updatedBy: toText(row.UPDATED_BY),
  };
}

function mapMetric(row: DbRow): CrmMetric {
  return {
    label: toText(row.Label) || "Unknown",
    value: toNumber(row.Total),
  };
}

function mapSupport(row: DbRow): IndiaSupportItem {
  return {
    id: toNumber(row.ID),
    clientId: toNumber(row.CLIENT_ID),
    client: rowName(row),
    type: toText(row.TYPE),
    subject: toText(row.SUBJECT),
    status: valueBool(row, "STATUS") ? "Open" : "Closed",
    created: toText(row.CREATED),
    responsible: toText(row.RESPONSIBLE || row.Coordinators),
    assigner: toText(row.ASSIGNER),
  };
}

function mapTask(row: DbRow): IndiaTaskItem {
  const firstName = toText(row.FIRST_NAME);
  const middleName = toText(row.MIDDLE_NAME);
  const lastName = toText(row.LAST_NAME);
  return {
    id: toNumber(row.ID),
    taskId: toNumber(row.TASK_ID || row.ID),
    clientId: toNumber(row.CLIENT_ID),
    clientName: rowName(row) || [firstName, middleName, lastName].filter(Boolean).join(" "),
    subject: toText(row.SUBJECT),
    note: toText(row.NOTE),
    dueDate: toText(row.DUE_DATE),
    doneOn: toText(row.DONE_ON),
    assignedTo: toText(row.ASSIGNED_TO),
    assignedBy: toText(row.ASSIGNED_BY),
    status: toText(row.CLIENT_STATUS),
    done: valueBool(row, "DONE"),
  };
}

function normalizeFileName(raw: unknown) {
  const text = toText(raw);
  if (!text) return "";
  const base = path.basename(text);
  if (!base || base !== text || base.includes("..")) return "";
  return base;
}

export function splitLegacyFiles(raw: unknown) {
  return toText(raw)
    .split(/[;,]/)
    .map((item) => normalizeFileName(item.trim()))
    .filter(Boolean);
}

export function makeLegacyFileLinks(folder: string, raw: unknown): CrmFileLink[] {
  return splitLegacyFiles(raw).map((fileName) => {
    const resolved = resolveLegacyFilePath(folder, fileName);
    return {
      fileName,
      href: `/api/crm/legacy-files/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`,
      exists: Boolean(resolved?.exists),
    };
  });
}

export async function getIndiaDashboard(): Promise<IndiaDashboard> {
  return withIndiaPool(emptyDashboard, async (pool) => {
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Client) AS clients,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_ClientFile) AS clientFiles,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_ClientDocuments) AS documents,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_ClientApplications) AS applications,
        ((SELECT COUNT_BIG(1) FROM dbo.tbl_ClientAgreements) + (SELECT COUNT_BIG(1) FROM dbo.tbl_AgreementUpload)) AS agreements,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_InvoiceDetails) AS invoices,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Receipt) AS receipts,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Support) AS support,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Support WHERE STATUS = 1) AS openSupport,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Notes) AS notes,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Tasks) AS tasks,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Enquiry) AS enquiries,
        (SELECT COALESCE(SUM(COALESCE(TOTAL, AMOUNT + TAX, AMOUNT, 0)), 0) FROM dbo.tbl_InvoiceDetails) AS invoiceTotal,
        (SELECT COALESCE(SUM(COALESCE(AMOUNT, 0)), 0) FROM dbo.tbl_Receipt) AS receiptTotal;

      SELECT TOP (8) ID, NAME, EMAIL, PHONE, DOB, DOJ, COORDINATORS, STATUS, CLIENT_STATUS, LAST_UPDATED, UPDATED_BY
      FROM dbo.vw_ClientList
      ORDER BY ID DESC;

      SELECT TOP (8) ID, CAT_ID, TYPE, SUBJECT, STATUS, CREATED, CLIENT, RESPONSIBLE, ASSIGNER, CLIENT_ID, COORDINATOR, ASSIGNOR, Coordinators
      FROM dbo.vw_Support
      ORDER BY ID DESC;

      SELECT TOP (8) FIRST_NAME, MIDDLE_NAME, LAST_NAME, ID, TASK_ID, DONE, DUE_DATE, DURATION, DONE_ON, SUBJECT, NOTE,
        LAST_UPDATED, UPDATED_BY, ASSIGNED_TO, ASSIGNED_BY, ASSIGNED_DATE, CLIENT_ID, FEEDBACK, CLIENT_STATUS
      FROM dbo.vw_TaskLog
      ORDER BY ID DESC;

      SELECT TOP (12) COALESCE(NULLIF(CLIENT_STATUS, ''), 'Unknown') AS Label, COUNT_BIG(1) AS Total
      FROM dbo.tbl_Client
      GROUP BY COALESCE(NULLIF(CLIENT_STATUS, ''), 'Unknown')
      ORDER BY Total DESC;

      SELECT TOP (12) COALESCE(NULLIF(SOURCE, ''), 'Unknown') AS Label, COUNT_BIG(1) AS Total
      FROM dbo.tbl_Client
      GROUP BY COALESCE(NULLIF(SOURCE, ''), 'Unknown')
      ORDER BY Total DESC;

      SELECT TOP (12) COALESCE(NULLIF(BR_ID, ''), 'Unknown') AS Label, COUNT_BIG(1) AS Total
      FROM dbo.tbl_Client
      GROUP BY COALESCE(NULLIF(BR_ID, ''), 'Unknown')
      ORDER BY Total DESC;
    `);

    const sets = getRecordsets(result);
    const counts = sets[0]?.[0] ?? {};

    return {
      configured: true,
      counts: {
        clients: toNumber(counts.clients),
        clientFiles: toNumber(counts.clientFiles),
        documents: toNumber(counts.documents),
        applications: toNumber(counts.applications),
        agreements: toNumber(counts.agreements),
        invoices: toNumber(counts.invoices),
        receipts: toNumber(counts.receipts),
        support: toNumber(counts.support),
        openSupport: toNumber(counts.openSupport),
        notes: toNumber(counts.notes),
        tasks: toNumber(counts.tasks),
        enquiries: toNumber(counts.enquiries),
      },
      finance: {
        invoiceTotal: toNumber(counts.invoiceTotal),
        receiptTotal: toNumber(counts.receiptTotal),
      },
      latestClients: (sets[1] ?? []).map(mapClient),
      recentSupport: (sets[2] ?? []).map(mapSupport),
      recentTasks: (sets[3] ?? []).map(mapTask),
      statusBreakdown: (sets[4] ?? []).map(mapMetric),
      sourceBreakdown: (sets[5] ?? []).map(mapMetric),
      branchBreakdown: (sets[6] ?? []).map(mapMetric),
    };
  });
}

export async function getIndiaClients(params: { q?: string; status?: string; page?: number }): Promise<IndiaClientListResult> {
  const q = toText(params.q);
  const status = toText(params.status);
  const page = params.page && params.page > 0 ? params.page : 1;
  const fallback: IndiaClientListResult = {
    configured: false,
    q,
    status,
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    statuses: [],
    clients: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const where: string[] = ["1 = 1"];
    const request = pool.request();
    request.input("offset", crmSql.Int, (page - 1) * PAGE_SIZE);
    request.input("pageSize", crmSql.Int, PAGE_SIZE);

    if (q) {
      request.input("q", crmSql.NVarChar(300), `%${q}%`);
      where.push("(NAME LIKE @q OR EMAIL LIKE @q OR PHONE LIKE @q OR CAST(ID AS varchar(30)) LIKE @q)");
    }

    if (status) {
      request.input("status", crmSql.VarChar(50), status);
      where.push("CLIENT_STATUS = @status");
    }

    const whereSql = where.join(" AND ");
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS Total
      FROM dbo.vw_ClientList
      WHERE ${whereSql};

      SELECT ID, NAME, EMAIL, PHONE, DOB, DOJ, COORDINATORS, STATUS, CLIENT_STATUS, LAST_UPDATED, UPDATED_BY
      FROM dbo.vw_ClientList
      WHERE ${whereSql}
      ORDER BY ID DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

      SELECT TOP (40) COALESCE(NULLIF(CLIENT_STATUS, ''), 'Unknown') AS Label, COUNT_BIG(1) AS Total
      FROM dbo.tbl_Client
      GROUP BY COALESCE(NULLIF(CLIENT_STATUS, ''), 'Unknown')
      ORDER BY Total DESC;
    `);

    const sets = getRecordsets(result);

    return {
      ...fallback,
      configured: true,
      total: toNumber(sets[0]?.[0]?.Total),
      clients: (sets[1] ?? []).map(mapClient),
      statuses: (sets[2] ?? []).map(mapMetric),
    };
  });
}

export async function getIndiaClientProfile(clientId: number): Promise<IndiaClientProfile> {
  const fallback: IndiaClientProfile = {
    configured: false,
    client: null,
    documents: [],
    applications: [],
    agreements: [],
    caseUpdates: [],
    invoices: [],
    receipts: [],
    support: [],
    notes: [],
    tasks: [],
    education: [],
    family: [],
    language: [],
    occupation: [],
    business: [],
    coordinators: [],
  };

  if (!Number.isFinite(clientId) || clientId <= 0) return unavailable(fallback, "Invalid client id.");

  return withIndiaPool(fallback, async (pool) => {
    const result = await pool
      .request()
      .input("clientId", crmSql.BigInt, clientId)
      .query(`
        SELECT TOP (1) *
        FROM dbo.vw_ClientView
        WHERE ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) ID, CLIENT_ID, TITLE, DESCRIPTION, [FILE]
        FROM dbo.vw_ClientDocs
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) ID, CLIENT_ID, APP_ID, APPLICATION, UP_DATE, APPROVED, APPROVER, REMARKS, LAST_UPDATED, UPDATED_BY
        FROM dbo.tbl_ClientApplications
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM (
          SELECT 'ClientAgreements' AS SOURCE_TABLE, ID, CLIENT_ID, AGREEMENT, UP_DATE, APPROVED, APPROVER, REMARKS, LAST_UPDATED, UPDATED_BY
          FROM dbo.tbl_ClientAgreements
          WHERE CLIENT_ID = @clientId
          UNION ALL
          SELECT 'AgreementUpload' AS SOURCE_TABLE, ID, CLIENT_ID, AGREEMENT, NULL AS UP_DATE, NULL AS APPROVED, NULL AS APPROVER, NULL AS REMARKS, LAST_UPDATED, UPDATED_BY
          FROM dbo.tbl_AgreementUpload
          WHERE CLIENT_ID = @clientId
        ) agreements
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM dbo.vw_CaseStatus
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM dbo.vw_ClientInvoices
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM dbo.vw_Receipt
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM dbo.vw_Support
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) *
        FROM dbo.vw_Notes
        WHERE ClientId = @clientId
        ORDER BY ID DESC;

        SELECT TOP (120) FIRST_NAME, MIDDLE_NAME, LAST_NAME, ID, TASK_ID, DONE, DUE_DATE, DURATION, DONE_ON, SUBJECT, NOTE,
          LAST_UPDATED, UPDATED_BY, ASSIGNED_TO, ASSIGNED_BY, ASSIGNED_DATE, CLIENT_ID, FEEDBACK, CLIENT_STATUS
        FROM dbo.vw_TaskLog
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientEducation
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientFamily
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientLanguage
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientOccupation
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientBusiness
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;

        SELECT TOP (50) *
        FROM dbo.tbl_ClientCoordinators
        WHERE CLIENT_ID = @clientId
        ORDER BY ID DESC;
      `);

    const sets = getRecordsets(result);
    const client = (sets[0] ?? [])[0] ?? null;

    return {
      configured: true,
      client,
      documents: (sets[1] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("ClientDocs", row.FILE),
      })),
      applications: (sets[2] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("ClientForms", row.APPLICATION),
      })),
      agreements: (sets[3] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("AgreementUploads", row.AGREEMENT),
      })),
      caseUpdates: (sets[4] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("StatusUpdates", row.FILE),
      })),
      invoices: sets[5] ?? [],
      receipts: sets[6] ?? [],
      support: (sets[7] ?? []).map(mapSupport),
      notes: sets[8] ?? [],
      tasks: (sets[9] ?? []).map(mapTask),
      education: sets[10] ?? [],
      family: sets[11] ?? [],
      language: sets[12] ?? [],
      occupation: sets[13] ?? [],
      business: sets[14] ?? [],
      coordinators: sets[15] ?? [],
    };
  });
}

export async function getIndiaDocuments(params: { q?: string; page?: number }): Promise<IndiaDocumentWorkspace> {
  const q = toText(params.q);
  const page = params.page && params.page > 0 ? params.page : 1;
  const fallback: IndiaDocumentWorkspace = {
    configured: false,
    q,
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    documents: [],
    applications: [],
    agreements: [],
    folders: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const where: string[] = ["1 = 1"];
    const request = pool.request();
    request.input("offset", crmSql.Int, (page - 1) * PAGE_SIZE);
    request.input("pageSize", crmSql.Int, PAGE_SIZE);

    if (q) {
      request.input("q", crmSql.NVarChar(300), `%${q}%`);
      where.push("(d.TITLE LIKE @q OR d.[FILE] LIKE @q OR c.NAME LIKE @q OR c.EMAIL LIKE @q OR CAST(d.CLIENT_ID AS varchar(30)) LIKE @q)");
    }

    const whereSql = where.join(" AND ");
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS Total
      FROM dbo.vw_ClientDocs d
      LEFT JOIN dbo.vw_ClientList c ON c.ID = d.CLIENT_ID
      WHERE ${whereSql};

      SELECT d.ID, d.CLIENT_ID, c.NAME AS CLIENT, d.TITLE, d.DESCRIPTION, d.[FILE]
      FROM dbo.vw_ClientDocs d
      LEFT JOIN dbo.vw_ClientList c ON c.ID = d.CLIENT_ID
      WHERE ${whereSql}
      ORDER BY d.ID DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

      SELECT TOP (40) ca.ID, ca.CLIENT_ID, c.NAME AS CLIENT, ca.APP_ID, ca.APPLICATION, ca.UP_DATE, ca.APPROVED, ca.APPROVER, ca.REMARKS
      FROM dbo.tbl_ClientApplications ca
      LEFT JOIN dbo.vw_ClientList c ON c.ID = ca.CLIENT_ID
      ORDER BY ca.ID DESC;

      SELECT TOP (40) *
      FROM (
        SELECT 'ClientAgreements' AS SOURCE_TABLE, ca.ID, ca.CLIENT_ID, c.NAME AS CLIENT, ca.AGREEMENT, ca.UP_DATE, ca.APPROVED, ca.APPROVER, ca.REMARKS, ca.LAST_UPDATED, ca.UPDATED_BY
        FROM dbo.tbl_ClientAgreements ca
        LEFT JOIN dbo.vw_ClientList c ON c.ID = ca.CLIENT_ID
        UNION ALL
        SELECT 'AgreementUpload' AS SOURCE_TABLE, au.ID, au.CLIENT_ID, c.NAME AS CLIENT, au.AGREEMENT, NULL AS UP_DATE, NULL AS APPROVED, NULL AS APPROVER, NULL AS REMARKS, au.LAST_UPDATED, au.UPDATED_BY
        FROM dbo.tbl_AgreementUpload au
        LEFT JOIN dbo.vw_ClientList c ON c.ID = au.CLIENT_ID
      ) agreements
      ORDER BY ID DESC;

      SELECT 'ClientDocs' AS Folder, 'Client documents' AS Label, COUNT_BIG(1) AS Total,
        SUM(CASE WHEN [FILE] IS NULL OR LTRIM(RTRIM([FILE])) = '' THEN 1 ELSE 0 END) AS Empty,
        SUM(CASE WHEN [FILE] LIKE '%/%' OR [FILE] LIKE '%\\%' THEN 1 ELSE 0 END) AS WithPath
      FROM dbo.tbl_ClientDocuments
      UNION ALL
      SELECT 'ClientForms', 'Client applications', COUNT_BIG(1),
        SUM(CASE WHEN APPLICATION IS NULL OR LTRIM(RTRIM(APPLICATION)) = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN APPLICATION LIKE '%/%' OR APPLICATION LIKE '%\\%' THEN 1 ELSE 0 END)
      FROM dbo.tbl_ClientApplications
      UNION ALL
      SELECT 'AgreementUploads', 'Signed agreements', COUNT_BIG(1),
        SUM(CASE WHEN AGREEMENT IS NULL OR LTRIM(RTRIM(AGREEMENT)) = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN AGREEMENT LIKE '%/%' OR AGREEMENT LIKE '%\\%' THEN 1 ELSE 0 END)
      FROM dbo.tbl_AgreementUpload
      UNION ALL
      SELECT 'StatusUpdates', 'Case update files', COUNT_BIG(1),
        SUM(CASE WHEN [FILE] IS NULL OR LTRIM(RTRIM([FILE])) = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN [FILE] LIKE '%/%' OR [FILE] LIKE '%\\%' THEN 1 ELSE 0 END)
      FROM dbo.tbl_CaseStatus
      UNION ALL
      SELECT 'SupportFiles', 'Support attachments', COUNT_BIG(1),
        SUM(CASE WHEN FILES IS NULL OR LTRIM(RTRIM(FILES)) = '' THEN 1 ELSE 0 END),
        SUM(CASE WHEN FILES LIKE '%/%' OR FILES LIKE '%\\%' THEN 1 ELSE 0 END)
      FROM dbo.tbl_Support;
    `);

    const sets = getRecordsets(result);

    return {
      ...fallback,
      configured: true,
      total: toNumber(sets[0]?.[0]?.Total),
      documents: (sets[1] ?? []).map((row) => ({
        id: toNumber(row.ID),
        clientId: toNumber(row.CLIENT_ID),
        clientName: rowName(row),
        title: toText(row.TITLE),
        description: toText(row.DESCRIPTION),
        file: toText(row.FILE),
        links: makeLegacyFileLinks("ClientDocs", row.FILE),
      })),
      applications: (sets[2] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("ClientForms", row.APPLICATION),
      })),
      agreements: (sets[3] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("AgreementUploads", row.AGREEMENT),
      })),
      folders: (sets[4] ?? []).map((row) => ({
        folder: toText(row.Folder),
        label: toText(row.Label),
        total: toNumber(row.Total),
        empty: toNumber(row.Empty),
        withPath: toNumber(row.WithPath),
      })),
    };
  });
}

export async function getIndiaAccounts(): Promise<IndiaAccounts> {
  const fallback: IndiaAccounts = {
    configured: false,
    totals: {
      invoices: 0,
      receipts: 0,
      refunds: 0,
      invoiceAmount: 0,
      receiptAmount: 0,
      refundAmount: 0,
    },
    invoices: [],
    receipts: [],
    unpaidClients: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT_BIG(1) FROM dbo.tbl_InvoiceDetails) AS invoices,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Receipt) AS receipts,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Refund) AS refunds,
        (SELECT COALESCE(SUM(COALESCE(TOTAL, AMOUNT + TAX, AMOUNT, 0)), 0) FROM dbo.tbl_InvoiceDetails) AS invoiceAmount,
        (SELECT COALESCE(SUM(COALESCE(AMOUNT, 0)), 0) FROM dbo.tbl_Receipt) AS receiptAmount,
        (SELECT COALESCE(SUM(COALESCE(AMOUNT, 0)), 0) FROM dbo.tbl_Refund) AS refundAmount;

      SELECT TOP (60) ID, IID, CLIENT, DATE, AMOUNT, PAY_MODE, DESCRIPTION, TRANS_ID, APPROVE, COORDINATORS, BR_ID, CLIENT_ID, PROGRAM_ID
      FROM dbo.vw_InvoiceView
      ORDER BY ID DESC;

      SELECT TOP (60) ID, BR_ID, CLIENT_ID, COORD_ID, RECEIPT_DATE, DESCRIPTION, AMOUNT, PAY_MODE, TRANS_ID, PROMO_CODE, VERIFIED_BY, SENT_RECEIPT, ENT_BY, ENT_DATE, LAST_UPDATED, UPDATED_BY, PROGRAM_ID
      FROM dbo.vw_Receipt
      ORDER BY ID DESC;

      SELECT TOP (60) ID, NAME, EMAIL, PHONE, DOJ, COORDINATORS, CLIENT_STATUS, IDATE, IID, RDATE, RID, SALES, PROGRAM_ID
      FROM dbo.ClientListWithAccounts
      ORDER BY ID DESC;
    `);

    const sets = getRecordsets(result);
    const totals = sets[0]?.[0] ?? {};
    return {
      configured: true,
      totals: {
        invoices: toNumber(totals.invoices),
        receipts: toNumber(totals.receipts),
        refunds: toNumber(totals.refunds),
        invoiceAmount: toNumber(totals.invoiceAmount),
        receiptAmount: toNumber(totals.receiptAmount),
        refundAmount: toNumber(totals.refundAmount),
      },
      invoices: sets[1] ?? [],
      receipts: sets[2] ?? [],
      unpaidClients: sets[3] ?? [],
    };
  });
}

export async function getIndiaSupport(params: { q?: string; page?: number }): Promise<IndiaSupportWorkspace> {
  const q = toText(params.q);
  const page = params.page && params.page > 0 ? params.page : 1;
  const fallback: IndiaSupportWorkspace = {
    configured: false,
    q,
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    tickets: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const where: string[] = ["1 = 1"];
    const request = pool.request();
    request.input("offset", crmSql.Int, (page - 1) * PAGE_SIZE);
    request.input("pageSize", crmSql.Int, PAGE_SIZE);

    if (q) {
      request.input("q", crmSql.NVarChar(300), `%${q}%`);
      where.push("(SUBJECT LIKE @q OR CLIENT LIKE @q OR TYPE LIKE @q OR CAST(CLIENT_ID AS varchar(30)) LIKE @q)");
    }

    const whereSql = where.join(" AND ");
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS Total
      FROM dbo.vw_Support
      WHERE ${whereSql};

      SELECT ID, CAT_ID, TYPE, SUBJECT, STATUS, CREATED, CLIENT, RESPONSIBLE, ASSIGNER, CLIENT_ID, COORDINATOR, ASSIGNOR, Coordinators
      FROM dbo.vw_Support
      WHERE ${whereSql}
      ORDER BY ID DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `);

    const sets = getRecordsets(result);

    return {
      ...fallback,
      configured: true,
      total: toNumber(sets[0]?.[0]?.Total),
      tickets: (sets[1] ?? []).map(mapSupport),
    };
  });
}

export async function getIndiaLeads(): Promise<IndiaLeadWorkspace> {
  const fallback: IndiaLeadWorkspace = {
    configured: false,
    counts: {
      enquiries: 0,
      opportunities: 0,
      appointments: 0,
      callers: 0,
      missedCalls: 0,
    },
    enquiries: [],
    opportunities: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Enquiry) AS enquiries,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Opportunities) AS opportunities,
        (SELECT COUNT_BIG(1) FROM dbo.Appointment) AS appointments,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_caller) AS callers,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_MissedCallData) AS missedCalls;

      SELECT TOP (80) ID, NAME, EMAIL, PHONE, ENQUIRY, ENT_DATE, CODE
      FROM dbo.tbl_Enquiry
      ORDER BY ID DESC;

      SELECT TOP (80) COLOR_CODE, ID, EMAIL, PHONE, SALUTATION, FIRST_NAME, MIDDLE_NAME, LAST_NAME, CLIENT_STATUS, SOURCE, CLOSING, ASSIGNED_TO, BR_ID, LAST_UPDATED, UPDATED_BY
      FROM dbo.vw_OpportunitiesViewList
      ORDER BY ID DESC;
    `);

    const sets = getRecordsets(result);
    const counts = sets[0]?.[0] ?? {};
    return {
      configured: true,
      counts: {
        enquiries: toNumber(counts.enquiries),
        opportunities: toNumber(counts.opportunities),
        appointments: toNumber(counts.appointments),
        callers: toNumber(counts.callers),
        missedCalls: toNumber(counts.missedCalls),
      },
      enquiries: sets[1] ?? [],
      opportunities: sets[2] ?? [],
    };
  });
}

export async function getIndiaTasks(params: { q?: string; page?: number }): Promise<IndiaTaskWorkspace> {
  const q = toText(params.q);
  const page = params.page && params.page > 0 ? params.page : 1;
  const fallback: IndiaTaskWorkspace = {
    configured: false,
    q,
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    openTasks: 0,
    tasks: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const where: string[] = ["1 = 1"];
    const request = pool.request();
    request.input("offset", crmSql.Int, (page - 1) * PAGE_SIZE);
    request.input("pageSize", crmSql.Int, PAGE_SIZE);

    if (q) {
      request.input("q", crmSql.NVarChar(300), `%${q}%`);
      where.push("(SUBJECT LIKE @q OR NOTE LIKE @q OR ASSIGNED_TO LIKE @q OR CAST(CLIENT_ID AS varchar(30)) LIKE @q)");
    }

    const whereSql = where.join(" AND ");
    const result = await request.query(`
      SELECT COUNT_BIG(1) AS Total
      FROM dbo.vw_TaskLog
      WHERE ${whereSql};

      SELECT COUNT_BIG(1) AS OpenTasks
      FROM dbo.tbl_Tasks
      WHERE DONE = 0 OR DONE IS NULL;

      SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, ID, TASK_ID, DONE, DUE_DATE, DURATION, DONE_ON, SUBJECT, NOTE,
        LAST_UPDATED, UPDATED_BY, ASSIGNED_TO, ASSIGNED_BY, ASSIGNED_DATE, CLIENT_ID, FEEDBACK, CLIENT_STATUS
      FROM dbo.vw_TaskLog
      WHERE ${whereSql}
      ORDER BY ID DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `);

    const sets = getRecordsets(result);

    return {
      ...fallback,
      configured: true,
      total: toNumber(sets[0]?.[0]?.Total),
      openTasks: toNumber(sets[1]?.[0]?.OpenTasks),
      tasks: (sets[2] ?? []).map(mapTask),
    };
  });
}

export async function getIndiaCommunication(): Promise<IndiaCommunicationWorkspace> {
  const fallback: IndiaCommunicationWorkspace = {
    configured: false,
    counts: {
      clientEmails: 0,
      bulkEmailLogs: 0,
      emailTemplates: 0,
      mailingLists: 0,
      smtpConfigs: 0,
      activeSmtpConfigs: 0,
      defaultSmtpConfigs: 0,
      smsConfigs: 0,
      activeSmsConfigs: 0,
      smsTemplates: 0,
      mailbox: 0,
      mailboxDetails: 0,
      subscribers: 0,
      defaultMailers: 0,
    },
    recentClientEmails: [],
    recentBulkEmails: [],
    emailTemplates: [],
    mailingLists: [],
    mailbox: [],
    smtpConfigs: [],
    smsConfigs: [],
    smsTemplates: [],
    defaultMailers: [],
  };

  return withIndiaPool(fallback, async (pool) => {
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT_BIG(1) FROM dbo.tbl_client_Email) AS clientEmails,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_EmailLog) AS bulkEmailLogs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_EmailTemplates) AS emailTemplates,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_MailingList) AS mailingLists,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMTPConfig) AS smtpConfigs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMTPConfig WHERE ACTIVE = 1) AS activeSmtpConfigs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMTPConfig WHERE IS_DEFAULT = 1) AS defaultSmtpConfigs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMSConfig) AS smsConfigs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMSConfig WHERE ACTIVE = 1) AS activeSmsConfigs,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_SMSTemplates) AS smsTemplates,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_MailBox) AS mailbox,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_MailBox_Detail) AS mailboxDetails,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Subscriber) AS subscribers,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_DefaultMailer) AS defaultMailers;

      SELECT TOP (80) ID, MAILINGTO, RECIPIENT, SUBJECT, TIME_STAMP, SENT_BY, CLIENT_ID, files
      FROM dbo.tbl_client_Email
      ORDER BY ID DESC;

      SELECT TOP (80) ID, MAILINGLIST, RECIPIENT, SUBJECT, TIME_STAMP, SENT_BY
      FROM dbo.tbl_EmailLog
      ORDER BY ID DESC;

      SELECT TOP (80) ID, CODE, SUBJECT, ACTIVE, LAST_UPDATED, UPDATED_BY, BR_ID
      FROM dbo.tbl_EmailTemplates
      ORDER BY ID DESC;

      SELECT TOP (80) ID, MAILING_LIST, DEFAULT_SENDER, NAME, DOMAIN, LAST_UPDATED, UPDATED_BY
      FROM dbo.tbl_MailingList
      ORDER BY ID DESC;

      SELECT TOP (80) MAIL_ID, FROM_ID, TO_ID, SUBJECT, ATTACHMENT, MAIL_STATUS, MAIL_TYPE, FLAG,
        [DATE] AS MAIL_DATE, [TIME] AS MAIL_TIME, BR_ID, LAST_UPDATED, UPDATED_BY
      FROM dbo.tbl_MailBox
      ORDER BY MAIL_ID DESC;

      SELECT TOP (20) ID, DOMAIN, HOST, PORT, HTML, SSL, IS_DEFAULT, ACTIVE, BR_ID, LAST_UPDATED, UPDATED_BY
      FROM dbo.tbl_SMTPConfig
      ORDER BY IS_DEFAULT DESC, ACTIVE DESC, ID DESC;

      SELECT TOP (10) ID, ACTIVE, LAST_UPDATED, UPDATED_BY
      FROM dbo.tbl_SMSConfig
      ORDER BY ID DESC;

      SELECT TOP (40) ID, CODE, ACTIVE, LAST_UPDATED, UPDATED_BY, BR_ID
      FROM dbo.tbl_SMSTemplates
      ORDER BY ID DESC;

      SELECT TOP (20) ID, CATEGORY, NAME, EMAIL, DOMAIN, LAST_UPDATED, UPDATED_BY
      FROM dbo.tbl_DefaultMailer
      ORDER BY ID DESC;
    `);

    const sets = getRecordsets(result);
    const counts = sets[0]?.[0] ?? {};

    return {
      configured: true,
      counts: {
        clientEmails: toNumber(counts.clientEmails),
        bulkEmailLogs: toNumber(counts.bulkEmailLogs),
        emailTemplates: toNumber(counts.emailTemplates),
        mailingLists: toNumber(counts.mailingLists),
        smtpConfigs: toNumber(counts.smtpConfigs),
        activeSmtpConfigs: toNumber(counts.activeSmtpConfigs),
        defaultSmtpConfigs: toNumber(counts.defaultSmtpConfigs),
        smsConfigs: toNumber(counts.smsConfigs),
        activeSmsConfigs: toNumber(counts.activeSmsConfigs),
        smsTemplates: toNumber(counts.smsTemplates),
        mailbox: toNumber(counts.mailbox),
        mailboxDetails: toNumber(counts.mailboxDetails),
        subscribers: toNumber(counts.subscribers),
        defaultMailers: toNumber(counts.defaultMailers),
      },
      recentClientEmails: (sets[1] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("CommAttachments", row.files),
      })),
      recentBulkEmails: sets[2] ?? [],
      emailTemplates: sets[3] ?? [],
      mailingLists: sets[4] ?? [],
      mailbox: (sets[5] ?? []).map((row) => ({
        ...row,
        links: makeLegacyFileLinks("CommAttachments", row.ATTACHMENT),
      })),
      smtpConfigs: sets[6] ?? [],
      smsConfigs: sets[7] ?? [],
      smsTemplates: sets[8] ?? [],
      defaultMailers: sets[9] ?? [],
    };
  });
}

const coverageBlueprint = [
  {
    module: "Clients",
    status: "live" as const,
    tables: [
      ["tbl_Client", true, "Profile root"],
      ["tbl_ClientContact", true, "Address/contact detail"],
      ["tbl_ClientFamily", true, "Family profile"],
      ["tbl_ClientEducation", true, "Education profile"],
      ["tbl_ClientLanguage", true, "Language profile"],
      ["tbl_ClientOccupation", true, "Work/NOC history"],
      ["tbl_ClientBusiness", true, "Business/net worth"],
      ["tbl_ClientCoordinators", true, "Coordinator assignment"],
    ],
    functions: ["vw_ClientList", "vw_ClientView", "sp_CreateClient", "sp_EditClient", "sp_EditClientContact"],
  },
  {
    module: "Documents and Cases",
    status: "live" as const,
    tables: [
      ["tbl_ClientDocuments", true, "Client uploaded document rows"],
      ["tbl_ClientDocsApproval", true, "Document review/approval"],
      ["tbl_ClientApplications", true, "Application form uploads"],
      ["tbl_AgreementUpload", true, "Signed agreements"],
      ["tbl_CaseStatus", true, "Case updates and attachments"],
      ["tbl_DocumentMaster", true, "Document master"],
      ["tbl_DocumentMapping", true, "Program document mapping"],
    ],
    functions: ["vw_ClientDocs", "vw_DocumentMapping", "vw_CaseStatus", "vw_AgreementUpload", "sp_ClientDocsEdit", "sp_DocApproval"],
  },
  {
    module: "Accounts",
    status: "live" as const,
    tables: [
      ["tbl_InvoiceDetails", true, "Invoices"],
      ["tbl_Receipt", true, "Receipts"],
      ["tbl_Refund", true, "Refunds"],
      ["tbl_OnlinePayments", true, "Online payments"],
      ["tbl_PaymentMaster", true, "Payment master rows"],
    ],
    functions: ["vw_InvoiceView", "vw_Receipt", "ClientListWithAccounts", "fn_TotalPaid", "sp_InvoiceDetails", "sp_Receipt"],
  },
  {
    module: "Support and Notes",
    status: "live" as const,
    tables: [
      ["tbl_Support", true, "Tickets"],
      ["tbl_SupportComments", true, "Ticket comments"],
      ["tbl_Notes", true, "Staff/client notes"],
    ],
    functions: ["vw_Support", "vw_SupportComments", "vw_Notes", "OnSupportTicketCreated"],
  },
  {
    module: "Pre-sales and Tasks",
    status: "partial" as const,
    tables: [
      ["tbl_Enquiry", true, "Incoming enquiries"],
      ["tbl_Opportunities", false, "Legacy table is empty in the restored India backup"],
      ["tbl_Tasks", true, "Tasks"],
      ["tbl_TaskLog", true, "Task history"],
      ["Appointment", true, "Appointments"],
      ["tbl_caller", true, "Caller records"],
      ["tbl_MissedCallData", true, "Missed calls"],
    ],
    functions: ["vw_OpportunitiesViewList", "vw_TaskLog", "sp_Enquiry", "sp_Tasks", "sp_Appointment"],
  },
  {
    module: "Communication and System",
    status: "partial" as const,
    tables: [
      ["tbl_client_Email", true, "Client mail logs"],
      ["tbl_EmailLog", true, "Bulk email logs"],
      ["tbl_EmailTemplates", true, "Email templates"],
      ["tbl_MailingList", true, "Bulk mail audience lists"],
      ["tbl_MailBox", true, "Internal staff mailbox"],
      ["tbl_MailBox_Detail", true, "Mailbox thread detail"],
      ["tbl_Subscriber", true, "Bulk mail subscribers"],
      ["tbl_DefaultMailer", true, "Default sender mapping"],
      ["tbl_SMTPConfig", true, "Sanitized SMTP status only; credentials stay hidden"],
      ["tbl_SMSConfig", true, "Sanitized SMS status only; provider secrets stay hidden"],
      ["tbl_SMSTemplates", true, "SMS templates"],
      ["tbl_UserDetails", false, "Legacy users contain password fields; use only for mapping"],
      ["tbl_Branch", true, "Branches"],
      ["tbl_SourceMaster", true, "Lead/client source master"],
      ["tbl_ProgramMaster", true, "Program master"],
    ],
    functions: ["vw_MailConfig", "vw_UserDetails", "sp_SMTPConfig", "sp_tbl_UserDetails", "Communication/BulkMail", "Communication/BulkSMS", "Clients/SendEmail"],
  },
];

export async function getIndiaCoverage(): Promise<IndiaCoverage> {
  const fallback: IndiaCoverage = {
    configured: false,
    totals: {
      tables: 0,
      views: 0,
      procedures: 0,
      triggers: 0,
    },
    modules: coverageBlueprint.map((module) => ({
      module: module.module,
      status: module.status,
      tables: module.tables.map(([table, usedInNext, notes]) => ({
        table: String(table),
        rows: 0,
        columns: 0,
        usedInNext: Boolean(usedInNext),
        notes: String(notes),
      })),
      functions: module.functions,
    })),
  };

  return withIndiaPool(fallback, async (pool) => {
    const result = await pool.request().query(`
      SELECT
        SUM(CASE WHEN type = 'U' THEN 1 ELSE 0 END) AS tables,
        SUM(CASE WHEN type = 'V' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN type = 'P' THEN 1 ELSE 0 END) AS procedures,
        SUM(CASE WHEN type = 'TR' THEN 1 ELSE 0 END) AS triggers
      FROM sys.objects
      WHERE is_ms_shipped = 0;

      WITH table_rows AS (
        SELECT object_id, SUM(row_count) AS RowsTotal
        FROM sys.dm_db_partition_stats
        WHERE index_id IN (0, 1)
        GROUP BY object_id
      ),
      column_counts AS (
        SELECT object_id, COUNT(1) AS ColumnTotal
        FROM sys.columns
        GROUP BY object_id
      )
      SELECT t.name AS TableName, COALESCE(r.RowsTotal, 0) AS RowsTotal, COALESCE(c.ColumnTotal, 0) AS ColumnTotal
      FROM sys.tables t
      LEFT JOIN table_rows r ON r.object_id = t.object_id
      LEFT JOIN column_counts c ON c.object_id = t.object_id;
    `);

    const sets = getRecordsets(result);
    const objectTotals = sets[0]?.[0] ?? {};
    const tableRows = new Map(
      (sets[1] ?? []).map((row) => [
        toText(row.TableName),
        {
          rows: toNumber(row.RowsTotal),
          columns: toNumber(row.ColumnTotal),
        },
      ])
    );

    return {
      configured: true,
      totals: {
        tables: toNumber(objectTotals.tables),
        views: toNumber(objectTotals.views),
        procedures: toNumber(objectTotals.procedures),
        triggers: toNumber(objectTotals.triggers),
      },
      modules: coverageBlueprint.map((module) => ({
        module: module.module,
        status: module.status,
        tables: module.tables.map(([table, usedInNext, notes]) => {
          const tableName = String(table);
          const stats = tableRows.get(tableName) ?? { rows: 0, columns: 0 };
          return {
            table: tableName,
            rows: stats.rows,
            columns: stats.columns,
            usedInNext: Boolean(usedInNext),
            notes: String(notes),
          };
        }),
        functions: module.functions,
      })),
    };
  });
}
