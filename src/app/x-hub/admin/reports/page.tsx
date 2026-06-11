import type { Metadata } from "next";
import AdminDetailedReportForm from "@/components/Platform/AdminDetailedReportForm";
import AdminProvisionClientForm from "@/components/Platform/AdminProvisionClientForm";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Paid Reports | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await requirePortalUser(["staff", "admin"]);

  return (
    <PortalShell user={user} active="reports">
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Admin only</p>
        <h2 className="mt-1 text-xl font-black">Paid registration and report desk</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Use this page when Topmate payment is checked manually. Staff can provision the client account,
          open the Hub case, and generate or email the detailed personal PDF.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminProvisionClientForm />
        <AdminDetailedReportForm />
      </div>
    </PortalShell>
  );
}
