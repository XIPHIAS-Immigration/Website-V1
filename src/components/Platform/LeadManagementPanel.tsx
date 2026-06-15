"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Search, Trash2, UserRound } from "lucide-react";

import type { PlatformLead } from "@/lib/platform/types";

type LeadManagementPanelProps = {
  leads: PlatformLead[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function sourceLabel(value: string) {
  return value.replaceAll("_", " ");
}

function matches(lead: PlatformLead, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.source,
    lead.status,
    lead.track,
    lead.country,
    lead.program,
    lead.message,
    lead.page,
    lead.referrer,
    ...lead.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export default function LeadManagementPanel({ leads }: LeadManagementPanelProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [deletingId, setDeletingId] = React.useState("");
  const [error, setError] = React.useState("");

  const filteredLeads = React.useMemo(
    () => leads.filter((lead) => matches(lead, query)),
    [leads, query],
  );

  const deleteLead = async (lead: PlatformLead) => {
    const ok = window.confirm(`Delete lead for ${lead.name}? This removes the lead and linked lead notes from X-Hub.`);
    if (!ok) return;

    setDeletingId(lead.id);
    setError("");
    try {
      const response = await fetch("/api/platform/admin/workflow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "lead", id: lead.id }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not delete lead");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete lead");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Captured people</p>
          <h2 className="mt-1 text-xl font-black">All submitted lead records</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            These are people who gave contact details through forms, eligibility, Programme AI, registration, partner, or B2G flows.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-primary ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900">
          {filteredLeads.length}/{leads.length} leads
        </span>
      </div>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950"
          placeholder="Search name, email, phone, country, programme, source..."
        />
      </label>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
        {filteredLeads.map((lead) => (
          <article key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-white text-primary ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <UserRound className="size-4" />
                  </span>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">{lead.name}</h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
                    {sourceLabel(lead.source)}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900">
                    {lead.status}
                  </span>
                </div>
                <p className="mt-2 break-all text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {[lead.email, lead.phone].filter(Boolean).join(" - ") || "No contact channel stored"}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(lead.createdAt)}</p>
              </div>

              <button
                type="button"
                onClick={() => void deleteLead(lead)}
                disabled={deletingId === lead.id}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <Trash2 className="size-4" />
                {deletingId === lead.id ? "Deleting" : "Delete"}
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Country</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{lead.country || "-"}</p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Programme</p>
                <p className="mt-1 line-clamp-2 font-bold text-slate-800 dark:text-slate-100">{lead.program || lead.track || "-"}</p>
              </div>
              <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Score / Tags</p>
                <p className="mt-1 line-clamp-2 font-bold text-slate-800 dark:text-slate-100">
                  {[lead.score ? `${lead.score}/100` : "", ...lead.tags.slice(0, 2)].filter(Boolean).join(" - ") || "-"}
                </p>
              </div>
            </div>

            {lead.message ? (
              <p className="mt-3 line-clamp-4 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {lead.message}
              </p>
            ) : null}

            {lead.page ? (
              <Link
                href={lead.page}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
              >
                Open source page
                <ExternalLink className="size-3.5" />
              </Link>
            ) : null}
          </article>
        ))}

        {!filteredLeads.length ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-slate-700">
            No lead records match this search.
          </p>
        ) : null}
      </div>
    </section>
  );
}
