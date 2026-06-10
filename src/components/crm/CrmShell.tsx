import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  FileCheck2,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  ListChecks,
  Mail,
  UsersRound,
} from "lucide-react";
import PortalShell from "@/components/Platform/PortalShell";
import type { PlatformUser } from "@/lib/platform/types";

type CrmShellProps = {
  user: PlatformUser;
  active: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const crmNav = [
  { href: "/crm", key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/clients", key: "clients", label: "Clients", icon: UsersRound },
  { href: "/crm/documents", key: "documents", label: "Documents", icon: FolderOpen },
  { href: "/crm/accounts", key: "accounts", label: "Accounts", icon: BriefcaseBusiness },
  { href: "/crm/support", key: "support", label: "Support", icon: Headphones },
  { href: "/crm/communication", key: "communication", label: "Communication", icon: Mail },
  { href: "/crm/leads", key: "leads", label: "Pre-sales", icon: BarChart3 },
  { href: "/crm/tasks", key: "tasks", label: "Tasks", icon: ListChecks },
  { href: "/crm/schema", key: "schema", label: "Data map", icon: Database },
];

export default function CrmShell({ user, active, title, subtitle, actions, children }: CrmShellProps) {
  return (
    <PortalShell user={user} active="crm">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white dark:border-slate-800 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                <ClipboardList className="size-4" />
                India employee CRM
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-5">
          {crmNav.map((item) => {
            const Icon = item.icon;
            const selected = item.key === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                  selected
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="bg-slate-100 p-4 dark:bg-slate-950 sm:p-5">{children}</div>
      </section>
    </PortalShell>
  );
}

export function CrmActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400"
    >
      <FileCheck2 className="size-4" />
      {children}
    </Link>
  );
}
