import "server-only";

import sql from "mssql";

export { sql as crmSql };

export type CrmRegionKey = "india" | "dubai";

export type LiveCrmRegionSummary = {
  key: CrmRegionKey;
  label: string;
  database: string;
  available: boolean;
  error?: string;
  counts: {
    clients: number;
    documents: number;
    clientFiles: number;
    invoices: number;
    receipts: number;
    agreements: number;
    supportTickets: number;
  };
  finance: {
    invoiceTotal: number;
    receiptTotal: number;
  };
  latestClients: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    branch: string;
    joinedOn: string;
  }>;
};

export type LiveCrmDashboard = {
  configured: boolean;
  checkedAt: string;
  regions: LiveCrmRegionSummary[];
};

type PoolKey = `${CrmRegionKey}:${string}`;

const pools = globalThis as typeof globalThis & {
  xiphiasCrmSqlPools?: Map<PoolKey, Promise<sql.ConnectionPool>>;
};

function env(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function getDatabaseName(region: CrmRegionKey) {
  return region === "india"
    ? env("XIPHIAS_CRM_INDIA_DATABASE", "immigration_com")
    : env("XIPHIAS_CRM_DUBAI_DATABASE", "dubai_crm");
}

export function isLiveCrmConfigured() {
  return Boolean(env("XIPHIAS_CRM_SQL_PASSWORD"));
}

function getSqlConfig(region: CrmRegionKey): sql.config {
  return {
    server: env("XIPHIAS_CRM_SQL_HOST", "localhost"),
    port: Number(env("XIPHIAS_CRM_SQL_PORT", "14333")),
    user: env("XIPHIAS_CRM_SQL_USER", "sa"),
    password: env("XIPHIAS_CRM_SQL_PASSWORD"),
    database: getDatabaseName(region),
    options: {
      encrypt: env("XIPHIAS_CRM_SQL_ENCRYPT", "true").toLowerCase() === "true",
      trustServerCertificate: env("XIPHIAS_CRM_SQL_TRUST_SERVER_CERTIFICATE", "true").toLowerCase() === "true",
    },
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
    requestTimeout: 30_000,
    connectionTimeout: 15_000,
  };
}

export async function getLiveCrmPool(region: CrmRegionKey) {
  const database = getDatabaseName(region);
  const key: PoolKey = `${region}:${database}`;
  if (!pools.xiphiasCrmSqlPools) pools.xiphiasCrmSqlPools = new Map();

  const existing = pools.xiphiasCrmSqlPools.get(key);
  if (existing) return existing;

  const poolPromise = new sql.ConnectionPool(getSqlConfig(region)).connect();
  pools.xiphiasCrmSqlPools.set(key, poolPromise);
  return poolPromise;
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clientName(row: Record<string, unknown>) {
  const parts = [row.FIRST_NAME, row.MIDDLE_NAME, row.LAST_NAME].map(toText).filter(Boolean);
  return parts.join(" ") || toText(row.EMAIL) || `Client #${row.ID}`;
}

const emptyCounts: LiveCrmRegionSummary["counts"] = {
  clients: 0,
  documents: 0,
  clientFiles: 0,
  invoices: 0,
  receipts: 0,
  agreements: 0,
  supportTickets: 0,
};

function unavailableRegion(region: CrmRegionKey, error?: string): LiveCrmRegionSummary {
  return {
    key: region,
    label: region === "india" ? "India CRM" : "Dubai CRM",
    database: getDatabaseName(region),
    available: false,
    error,
    counts: { ...emptyCounts },
    finance: {
      invoiceTotal: 0,
      receiptTotal: 0,
    },
    latestClients: [],
  };
}

export async function getLiveCrmRegionSummary(region: CrmRegionKey): Promise<LiveCrmRegionSummary> {
  if (!isLiveCrmConfigured()) return unavailableRegion(region, "XIPHIAS_CRM_SQL_PASSWORD is not configured.");

  try {
    const pool = await getLiveCrmPool(region);
    const summary = await pool.request().query(`
      SELECT
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Client) AS clients,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_ClientDocuments) AS documents,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_ClientFile) AS clientFiles,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_InvoiceDetails) AS invoices,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Receipt) AS receipts,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_AgreementUpload) AS agreements,
        (SELECT COUNT_BIG(1) FROM dbo.tbl_Support) AS supportTickets,
        (SELECT COALESCE(SUM(COALESCE(TOTAL, AMOUNT + TAX, AMOUNT, 0)), 0) FROM dbo.tbl_InvoiceDetails) AS invoiceTotal,
        (SELECT COALESCE(SUM(COALESCE(AMOUNT, 0)), 0) FROM dbo.tbl_Receipt) AS receiptTotal;
    `);

    const clients = await pool.request().query(`
      SELECT TOP (8)
        ID,
        EMAIL,
        PHONE,
        FIRST_NAME,
        MIDDLE_NAME,
        LAST_NAME,
        CLIENT_STATUS,
        STATUS,
        SOURCE,
        BR_ID,
        DOJ,
        LAST_UPDATED
      FROM dbo.tbl_Client
      ORDER BY ID DESC;
    `);

    const row = summary.recordset[0] ?? {};

    return {
      key: region,
      label: region === "india" ? "India CRM" : "Dubai CRM",
      database: getDatabaseName(region),
      available: true,
      counts: {
        clients: toNumber(row.clients),
        documents: toNumber(row.documents),
        clientFiles: toNumber(row.clientFiles),
        invoices: toNumber(row.invoices),
        receipts: toNumber(row.receipts),
        agreements: toNumber(row.agreements),
        supportTickets: toNumber(row.supportTickets),
      },
      finance: {
        invoiceTotal: toNumber(row.invoiceTotal),
        receiptTotal: toNumber(row.receiptTotal),
      },
      latestClients: clients.recordset.map((client) => ({
        id: toNumber(client.ID),
        name: clientName(client),
        email: toText(client.EMAIL),
        phone: toText(client.PHONE),
        status: toText(client.CLIENT_STATUS) || (client.STATUS ? "Active" : "Inactive"),
        source: toText(client.SOURCE),
        branch: toText(client.BR_ID),
        joinedOn: toText(client.DOJ || client.LAST_UPDATED),
      })),
    };
  } catch (error) {
    return unavailableRegion(region, error instanceof Error ? error.message : "Unable to query SQL Server.");
  }
}

export async function getLiveCrmDashboard(): Promise<LiveCrmDashboard> {
  const regions = await Promise.all([
    getLiveCrmRegionSummary("india"),
    getLiveCrmRegionSummary("dubai"),
  ]);

  return {
    configured: isLiveCrmConfigured(),
    checkedAt: new Date().toISOString(),
    regions,
  };
}
