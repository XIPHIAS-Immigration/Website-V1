import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BellDot,
  CheckCircle2,
  CircleDashed,
  FileSearch,
  Gauge,
  LockKeyhole,
  RadioTower,
  Route,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { MobilityAutomation, MobilityOSResult, MobilityStage } from "@/lib/platform/mobility-os";
import type { PortalRole, RiskLevel } from "@/lib/platform/types";

type Props = {
  result: MobilityOSResult;
  role: PortalRole;
};

const riskTone: Record<RiskLevel, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-red-200 bg-red-50 text-red-800",
  blocked: "border-red-300 bg-red-100 text-red-900",
};

const stageTone: Record<MobilityStage["status"], string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-900",
  active: "border-blue-300 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-100",
  pending: "border-slate-200 bg-white text-slate-700",
  blocked: "border-red-200 bg-red-50 text-red-900",
};

const automationTone: Record<MobilityAutomation["status"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  waiting: "border-slate-200 bg-slate-50 text-slate-700",
  "needs-config": "border-amber-200 bg-amber-50 text-amber-900",
};

function ownerLabel(owner: string) {
  return owner.charAt(0).toUpperCase() + owner.slice(1).replace("-", " ");
}

function channelIcon(channel: MobilityAutomation["channel"]) {
  if (channel === "whatsapp") return BellDot;
  if (channel === "staff") return ShieldCheck;
  if (channel === "email") return RadioTower;
  return LockKeyhole;
}

export default function MobilityOSView({ result, role }: Props) {
  const scoreStyle = {
    "--score": `${result.readinessScore}%`,
  } as CSSProperties;
  const canSeeOps = role === "admin" || role === "staff";
  const highPrioritySignals = result.regulationRadar.signals.filter((signal) => signal.priority !== "watch").length;
  const pendingDocs = result.documentPlan.sections
    .flatMap((section) => section.items)
    .filter((item) => ["missing", "requested", "rework"].includes(item.status)).length;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg border border-[#d8b848]/45 bg-[#071b3d] p-5 text-white shadow-xl shadow-blue-950/10 sm:p-6">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#d8b848]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1fr_360px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#f4d36b]">
              <Sparkles className="size-4" />
              Mobility OS
            </span>
            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
              Client journey intelligence without waiting for CRM sync.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base">
              X-Hub now calculates next actions, evidence readiness, route-risk signals, and automation triggers from portal records and approved website content.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/x-hub/documents" className="inline-flex items-center gap-2 rounded-md bg-[#d8b848] px-4 py-2.5 text-sm font-black text-[#071b3d] transition hover:bg-[#f2cf54]">
                Open evidence planner
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/x-hub/imt" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
                View case tracker
              </Link>
              {canSeeOps ? (
                <Link href="/x-hub/admin/content-review" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Review content radar
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="grid grid-cols-[132px_1fr] items-center gap-4">
              <div
                className="grid size-32 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#d8b848 ${result.readinessScore}%, rgba(255,255,255,.16) 0)`,
                }}
              >
                <div className="grid size-24 place-items-center rounded-full bg-[#071b3d]">
                  <div className="text-center">
                    <p className="text-3xl font-black">{result.readinessScore}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">readiness</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4d36b]">Current stage</p>
                <p className="mt-1 text-2xl font-black">{result.stageLabel}</p>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  {result.activeCase ? `${result.activeCase.country} - ${result.activeCase.program}` : "No active case assigned yet."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className="rounded-md border border-white/15 bg-white/10 p-3">
                <span className="block text-lg text-[#f4d36b]">{pendingDocs}</span>
                Doc gaps
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-3">
                <span className="block text-lg text-[#f4d36b]">{highPrioritySignals}</span>
                Signals
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-3">
                <span className="block text-lg text-[#f4d36b]">{result.automations.filter((item) => item.status === "ready").length}</span>
                Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Case status</p>
          <p className="mt-2 text-2xl font-black">{result.activeCase?.progress ?? 0}%</p>
          <p className="mt-1 text-sm text-slate-600">IMT progress from portal records.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Document score</p>
          <p className="mt-2 text-2xl font-black">{result.documentPlan.readinessScore}/100</p>
          <p className="mt-1 text-sm text-slate-600">Evidence readiness by route.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Risk level</p>
          <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-black capitalize ${riskTone[result.riskLevel]}`}>
            {result.riskLevel}
          </span>
          <p className="mt-2 text-sm text-slate-600">Staff clearance remains mandatory.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Blockers</p>
          <p className="mt-2 text-2xl font-black">{result.blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Open items slowing movement.</p>
        </article>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Digital twin</p>
            <h3 className="mt-1 text-xl font-black">Immigration journey map</h3>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">Fixed layout, CSS-only motion</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {result.journey.map((stage) => {
            const Icon = stage.status === "done" ? CheckCircle2 : stage.status === "blocked" ? TriangleAlert : stage.status === "active" ? Gauge : CircleDashed;
            return (
              <article key={stage.key} className={`group min-h-36 rounded-lg border p-4 transition hover:-translate-y-0.5 ${stageTone[stage.status]}`}>
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 shrink-0" />
                  <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
                    {stage.status}
                  </span>
                </div>
                <h4 className="mt-3 font-black">{stage.label}</h4>
                <p className="mt-2 text-sm leading-6 opacity-80">{stage.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Route className="size-5 text-primary" />
            <h3 className="text-xl font-black">Next best actions</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {result.nextActions.map((action, index) => (
              <article key={`${action.title}-${index}`} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{ownerLabel(action.owner)}</p>
                    <h4 className="mt-1 font-black">{action.title}</h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{action.urgency.replace("-", " ")}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#b89415]" />
            <h3 className="text-xl font-black">Automation queue</h3>
          </div>
          <div className="mt-4 space-y-3">
            {result.automations.map((automation) => {
              const Icon = channelIcon(automation.channel);
              return (
                <article key={automation.title} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-50 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-black">{automation.title}</h4>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${automationTone[automation.status]}`}>
                          {automation.status.replace("-", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{automation.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSearch className="size-5 text-primary" />
              <h3 className="text-xl font-black">Evidence intelligence</h3>
            </div>
            <Link href="/x-hub/documents" className="text-sm font-black text-primary">
              Open planner
            </Link>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{result.documentPlan.summary}</p>
          <div className="mt-4 grid gap-3">
            {result.documentPlan.flags.slice(0, 3).map((flag) => (
              <div key={flag.code} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <p className="font-black">{flag.label}</p>
                <p className="mt-1 text-sm leading-6">{flag.detail}</p>
              </div>
            ))}
            {!result.documentPlan.flags.length ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                <p className="font-black">No critical evidence flags</p>
                <p className="mt-1 text-sm">Continue advisor review before filing or investment commitment.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <RadioTower className="size-5 text-[#b89415]" />
            <h3 className="text-xl font-black">Regulation radar</h3>
          </div>
          <div className="mt-4 space-y-3">
            {result.regulationRadar.signals.slice(0, 4).map((signal) => (
              <Link key={signal.id} href={signal.href} className="block rounded-lg border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{signal.country || "Global"}</p>
                    <h4 className="mt-1 font-black">{signal.title}</h4>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-black ${signal.priority === "urgent" ? "bg-red-50 text-red-800" : signal.priority === "review" ? "bg-amber-50 text-amber-900" : "bg-blue-50 text-blue-800"}`}>
                    {signal.priority}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{signal.summary}</p>
                <p className="mt-2 text-xs font-bold text-primary">Reason: {signal.reason}</p>
              </Link>
            ))}
            {!result.regulationRadar.signals.length ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No matching content signals for this case yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h3 className="text-xl font-black">Production safeguards</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {result.safeguards.map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="sr-only" style={scoreStyle}>
        Mobility readiness score {result.readinessScore}
      </div>
    </div>
  );
}
