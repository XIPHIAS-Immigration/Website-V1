import type { Metadata } from "next";
import JioPayPaymentConsole from "@/components/Platform/JioPayPaymentConsole";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "JioPay Payments | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const user = await requirePortalUser(["staff", "admin"]);

  return (
    <PortalShell user={user} active="payments">
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Payments</p>
        <h2 className="mt-1 text-xl font-semibold">JioPay payment link desk</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Create production checkout links for custom quoted amounts. Keep the MID and secret key only in server env.
        </p>
      </section>

      <JioPayPaymentConsole />
    </PortalShell>
  );
}
