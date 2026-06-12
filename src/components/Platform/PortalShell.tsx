import Link from "next/link";
import {
  Bot,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FileSearch,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Orbit,
  ShieldCheck,
  UserRound,
  Workflow,
} from "lucide-react";
import type { PlatformUser, PortalRole } from "@/lib/platform/types";

type PortalShellProps = {
  user: PlatformUser;
  active: string;
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  description: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: PortalRole[];
};

const navItems: NavItem[] = [
  {
    href: "/x-hub",
    label: "X-Hub",
    description: "Case home",
    key: "dashboard",
    icon: LayoutDashboard,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/account",
    label: "Account",
    description: "Login settings",
    key: "account",
    icon: KeyRound,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/profile",
    label: "Client Profile",
    description: "Single client record",
    key: "profile",
    icon: UserRound,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/mobility-os",
    label: "Mobility OS",
    description: "Journey intelligence",
    key: "mobility-os",
    icon: Orbit,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/documents",
    label: "Documents",
    description: "Evidence planner",
    key: "documents",
    icon: FileSearch,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/imt",
    label: "Case Tracker",
    description: "IMT milestones",
    key: "imt",
    icon: Gauge,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/xia",
    label: "XIA Advisor",
    description: "Program triage",
    key: "xia",
    icon: Bot,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/x-passport",
    label: "X-Passport",
    description: "Country fit score",
    key: "passport",
    icon: Globe2,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/partners",
    label: "Partner Desk",
    description: "Referral tracking",
    key: "partners",
    icon: BriefcaseBusiness,
    roles: ["partner", "staff", "admin"],
  },
  {
    href: "/x-hub/b2g",
    label: "B2G Desk",
    description: "Institutional intake",
    key: "b2g",
    icon: Building2,
    roles: ["b2g", "staff", "admin"],
  },
  {
    href: "/x-hub/admin/operations",
    label: "Operations",
    description: "Staff pipeline",
    key: "operations",
    icon: FileCheck2,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/analytics",
    label: "Site Analytics",
    description: "Visitors and intent",
    key: "analytics",
    icon: BarChart3,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/reports",
    label: "Paid Reports",
    description: "Manual PDF desk",
    key: "reports",
    icon: FileText,
    roles: ["staff", "admin"],
  },
  {
    href: "/crm",
    label: "CRM Migration",
    description: "Legacy map",
    key: "crm",
    icon: Workflow,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/risk",
    label: "Risk Review",
    description: "Due diligence",
    key: "risk",
    icon: ShieldCheck,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/health",
    label: "Health Check",
    description: "System readiness",
    key: "health",
    icon: Gauge,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/content-review",
    label: "Content Review",
    description: "Approval queue",
    key: "content",
    icon: ClipboardCheck,
    roles: ["staff", "admin"],
  },
];

function roleLabel(role: PortalRole) {
  return role.toUpperCase();
}

export default function PortalShell({ user, active, children }: PortalShellProps) {
  const items = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <section className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-screen-2xl gap-5">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Link href="/x-hub" className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-white">
                <ShieldCheck className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">X-Hub</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Secure portal</span>
              </span>
            </Link>

            <nav className="mt-4 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const selected = item.key === active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={`${item.label}: ${item.description}`}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
                      <span className={`block truncate text-[11px] font-medium ${selected ? "text-white/75" : "text-slate-500 dark:text-slate-400"}`}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">X-Hub</p>
                <h1 className="mt-1 text-2xl font-bold tracking-normal sm:text-3xl">Client and mobility operations</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold dark:border-slate-700">
                  {roleLabel(user.role)}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {user.email}
                </span>
                <Link
                  href="/api/auth/signout"
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Sign out
                </Link>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={`${item.label}: ${item.description}`}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                      item.key === active
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {user.mustChangePassword ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
              This account is using a temporary registration password. Open{" "}
              <Link href="/x-hub/account" className="underline">
                Account Settings
              </Link>{" "}
              to change it.
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </section>
  );
}
