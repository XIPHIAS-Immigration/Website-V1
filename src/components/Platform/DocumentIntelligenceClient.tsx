"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileSearch,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { DocumentPlanItem, DocumentPlanResult } from "@/lib/platform/document-intelligence";
import type { Track } from "@/lib/eligibility/types";

type Props = {
  initialPlan: DocumentPlanResult;
};

const trackOptions: { value: Track; label: string }[] = [
  { value: "residency", label: "Residency" },
  { value: "citizenship", label: "Citizenship" },
  { value: "skilled", label: "Skilled migration" },
  { value: "corporate", label: "Corporate mobility" },
];

const statusTone: Record<DocumentPlanItem["status"], string> = {
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  reviewing: "border-blue-200 bg-blue-50 text-blue-800",
  uploaded: "border-blue-200 bg-blue-50 text-blue-800",
  requested: "border-amber-200 bg-amber-50 text-amber-900",
  rework: "border-red-200 bg-red-50 text-red-800",
  missing: "border-slate-200 bg-slate-50 text-slate-700",
};

const priorityTone: Record<DocumentPlanItem["priority"], string> = {
  critical: "bg-red-50 text-red-800",
  advisor: "bg-blue-50 text-blue-800",
  standard: "bg-slate-100 text-slate-700",
};

function statusIcon(status: DocumentPlanItem["status"]) {
  if (status === "accepted") return CheckCircle2;
  if (status === "reviewing" || status === "uploaded") return Clock3;
  if (status === "rework") return TriangleAlert;
  return FileSearch;
}

export default function DocumentIntelligenceClient({ initialPlan }: Props) {
  const [track, setTrack] = useState<Track>(initialPlan.track);
  const [country, setCountry] = useState(initialPlan.country);
  const [program, setProgram] = useState(initialPlan.program);
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const items = plan.sections.flatMap((section) => section.items);
    return {
      all: items.length,
      open: items.filter((item) => ["missing", "requested", "rework"].includes(item.status)).length,
      accepted: items.filter((item) => item.status === "accepted").length,
      critical: items.filter((item) => item.priority === "critical" && item.status !== "accepted").length,
    };
  }, [plan]);

  async function regenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/platform/document-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track, country, program }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; plan?: DocumentPlanResult; error?: string };
    setLoading(false);

    if (!response.ok || !data.plan) {
      setError(data.error || "Could not generate the document plan.");
      return;
    }

    setPlan(data.plan);
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg border border-[#d8b848]/45 bg-[#071b3d] p-5 text-white shadow-xl shadow-blue-950/10">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#d8b848]/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_360px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#f4d36b]">
              <FileCheck2 className="size-4" />
              Evidence graph
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-normal sm:text-4xl">Document intelligence planner</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
              Generate a route-specific evidence checklist, spot missing critical items, and prepare automation-ready reminders without waiting for the CRM.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{plan.readinessScore}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Readiness</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{totals.open}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Open items</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{totals.accepted}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Accepted</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{totals.critical}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Critical gaps</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form onSubmit={regenerate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#b89415]" />
            <h3 className="text-lg font-black">Generate checklist</h3>
          </div>
          <div className="mt-4 grid gap-4">
            <label>
              <span className="text-sm font-bold">Pathway</span>
              <select
                value={track}
                onChange={(event) => setTrack(event.target.value as Track)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2"
              >
                {trackOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Country focus</span>
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2"
                placeholder="Example: Portugal"
              />
            </label>
            <label>
              <span className="text-sm font-bold">Program or route</span>
              <input
                value={program}
                onChange={(event) => setProgram(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2"
                placeholder="Example: Golden Visa"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {loading ? "Generating..." : "Generate document plan"}
            </button>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p> : null}
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
            {plan.country} - {plan.program}
          </p>
          <h3 className="mt-1 text-2xl font-black">Advisor-ready evidence plan</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{plan.summary}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {plan.nextActions.map((action) => (
              <div key={action} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-800">
                {action}
              </div>
            ))}
          </div>
        </section>
      </div>

      {plan.flags.length ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-5" />
            <h3 className="text-lg font-black">Review flags</h3>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {plan.flags.map((flag) => (
              <article key={flag.code} className="rounded-lg border border-amber-200 bg-white/70 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em]">{flag.severity}</p>
                <h4 className="mt-1 font-black">{flag.label}</h4>
                <p className="mt-2 text-sm leading-6">{flag.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          {plan.sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h3 className="text-xl font-black">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {section.items.map((item) => {
                  const Icon = statusIcon(item.status);
                  return (
                    <div key={`${section.title}-${item.label}`} className="rounded-lg border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-md border ${statusTone[item.status]}`}>
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black">{item.label}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${priorityTone[item.priority]}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.reason}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                            <span className={`rounded-full border px-2 py-1 ${statusTone[item.status]}`}>{item.status}</span>
                            {item.dueAt ? <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Due {item.dueAt}</span> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <FileSearch className="size-5 text-primary" />
            <h3 className="text-lg font-black">Automation plan</h3>
          </div>
          <div className="mt-4 space-y-3">
            {plan.automationPlan.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-black">{item.title}</h4>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-black ${item.ready ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                    {item.ready ? "ready" : "waiting"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-primary">{item.channel}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
