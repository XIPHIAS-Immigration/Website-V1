import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Panel, StatusPill, money, text } from "@/components/crm/CrmUi";
import { getIndiaAccounts, valueBool, valueNumber, valueText } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Accounts | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Table({ rows, columns }: { rows: Record<string, unknown>[]; columns: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr key={`${valueText(row, "ID")}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-950">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-top">
                  {column.render ? column.render(row) : text(row[column.key], "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CrmAccountsPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const accounts = await getIndiaAccounts();

  return (
    <CrmShell
      user={user}
      active="accounts"
      title="Accounts"
      subtitle="Invoices, receipts, refunds, payment rows, and client account lists from the Indian CRM finance tables."
      actions={
        <>
          <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
            <Plus className="size-4" />
            New invoice
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
            <Download className="size-4" />
            Export
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={accounts.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Invoices" value={accounts.totals.invoices} hint={money(accounts.totals.invoiceAmount)} tone="cyan" />
          <MetricCard label="Receipts" value={accounts.totals.receipts} hint={money(accounts.totals.receiptAmount)} tone="emerald" />
          <MetricCard label="Refunds" value={accounts.totals.refunds} hint={money(accounts.totals.refundAmount)} tone="amber" />
          <MetricCard label="Balance view" value={accounts.unpaidClients.length} hint="Latest account clients" tone="slate" />
          <MetricCard label="Invoice rows" value={accounts.invoices.length} hint="Preview loaded" tone="slate" />
          <MetricCard label="Receipt rows" value={accounts.receipts.length} hint="Preview loaded" tone="slate" />
        </div>

        <Panel title="Recent invoices" eyebrow="vw_InvoiceView">
          <Table
            rows={accounts.invoices}
            columns={[
              { key: "IID", label: "Invoice" },
              { key: "CLIENT", label: "Client", render: (row) => <Link href={`/crm/clients/${valueText(row, "CLIENT_ID")}`} className="font-black hover:text-cyan-700">{valueText(row, "CLIENT")}</Link> },
              { key: "DATE", label: "Date" },
              { key: "AMOUNT", label: "Amount", render: (row) => money(valueNumber(row, "AMOUNT")) },
              { key: "PAY_MODE", label: "Mode" },
              { key: "APPROVE", label: "Approval", render: (row) => <StatusPill active={valueBool(row, "APPROVE")} label={valueBool(row, "APPROVE") ? "Approved" : "Pending"} /> },
              { key: "COORDINATORS", label: "Coordinator" },
            ]}
          />
        </Panel>

        <Panel title="Recent receipts" eyebrow="vw_Receipt">
          <Table
            rows={accounts.receipts}
            columns={[
              { key: "ID", label: "Receipt" },
              { key: "CLIENT_ID", label: "Client", render: (row) => <Link href={`/crm/clients/${valueText(row, "CLIENT_ID")}`} className="font-black hover:text-cyan-700">#{valueText(row, "CLIENT_ID")}</Link> },
              { key: "RECEIPT_DATE", label: "Date" },
              { key: "DESCRIPTION", label: "Description" },
              { key: "AMOUNT", label: "Amount", render: (row) => money(valueNumber(row, "AMOUNT")) },
              { key: "PAY_MODE", label: "Mode" },
              { key: "TRANS_ID", label: "Transaction" },
            ]}
          />
        </Panel>

        <Panel title="Client account list" eyebrow="ClientListWithAccounts">
          <Table
            rows={accounts.unpaidClients}
            columns={[
              { key: "NAME", label: "Client", render: (row) => <Link href={`/crm/clients/${valueText(row, "ID")}`} className="font-black hover:text-cyan-700">{valueText(row, "NAME")}</Link> },
              { key: "EMAIL", label: "Email" },
              { key: "PHONE", label: "Phone" },
              { key: "CLIENT_STATUS", label: "Status" },
              { key: "IDATE", label: "Invoice date" },
              { key: "RDATE", label: "Receipt date" },
              { key: "SALES", label: "Sales" },
            ]}
          />
        </Panel>
      </div>
    </CrmShell>
  );
}
