import type { Metadata } from "next";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import PortalShell from "@/components/Platform/PortalShell";
import ChangePasswordForm from "@/components/Platform/ChangePasswordForm";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Account Settings | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusCopy(status?: string) {
  if (status === "invited") return "Invited: temporary credentials issued";
  if (status === "active") return "Active";
  if (status === "disabled") return "Disabled";
  return "Configured portal account";
}

export default async function AccountPage() {
  const user = await requirePortalUser();
  const stored = getPlatformRepository().getUserByEmail(user.email);
  const canChangePassword = Boolean(stored?.passwordSha256);
  const mustChangePassword = Boolean(stored?.mustChangePassword);

  return (
    <PortalShell user={user} active="account">
      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary dark:bg-blue-950/50">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Account profile</p>
              <h2 className="mt-1 text-2xl font-bold">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Role</p>
              <p className="mt-1 text-lg font-bold capitalize">{user.role}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Portal status</p>
              <p className="mt-1 text-lg font-bold">{statusCopy(stored?.portalStatus)}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Client ID</p>
              <p className="mt-1 text-lg font-bold">{user.clientId || "-"}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Registration ref</p>
              <p className="mt-1 text-lg font-bold">{stored?.registrationPaymentRef || "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <KeyRound className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Security</p>
              <h2 className="mt-1 text-xl font-bold">Change password</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Paid-registration clients can replace the temporary Hub password here.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ChangePasswordForm canChangePassword={canChangePassword} mustChangePassword={mustChangePassword} />
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">How this connects to registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              After the dedicated Topmate registration payment is confirmed, the provisioning endpoint creates this Hub account,
              opens a client case, assigns document requests, starts milestones, and sends the login details by email.
            </p>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
