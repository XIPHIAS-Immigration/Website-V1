"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, CircleAlert } from "lucide-react";

import { ToolShell } from "@/components/XiaTools/ToolShell";
import {
  assessDocumentReadiness,
  documentGroups,
  emptyDocumentReadinessInput,
  type DocumentReadinessInput,
  type DocumentReadinessKey,
  type DocumentStatus,
} from "@/lib/document-readiness";

const statusOptions: Array<{ value: DocumentStatus; label: string }> = [
  { value: "not-provided", label: "Not provided" },
  { value: "available", label: "Available and current" },
  { value: "partial", label: "Partially available" },
  { value: "expired", label: "Expired" },
  { value: "translation", label: "Needs translation" },
  { value: "verification", label: "Needs verification" },
];

const inputClass = "h-11 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-secondary [&>option]:bg-primary";

export default function DocumentReadinessClient() {
  const [input, setInput] = useState<DocumentReadinessInput>(emptyDocumentReadinessInput);
  const [generated, setGenerated] = useState(false);
  const result = useMemo(() => assessDocumentReadiness(input), [input]);

  const updateStatus = (key: DocumentReadinessKey, value: DocumentStatus) => {
    setInput((current) => ({ ...current, [key]: value }));
    setGenerated(false);
  };

  return (
    <ToolShell
      eyebrow="XIA · Document Readiness"
      title="Document and Evidence Readiness"
      subtitle="Understand which immigration documents are ready, which need attention and which have not yet been reviewed. Every status comes from your answers—XIA never assumes that missing evidence exists."
      steps={[
        { title: "Identify the route", description: "Add the destination and programme so the document review has the right immigration context." },
        { title: "Mark each evidence status", description: "Record whether identity, civil, education, employment, financial and family documents are current, partial, expired or unavailable." },
        { title: "Receive a collection plan", description: "See ready items, remediation work and unreviewed categories before report purchase or advisor handoff." },
      ]}
      benefits={["Document-level status", "Missing and remediation list", "Programme-aware advisor handoff"]}
      contactContext="Document Readiness"
      contactId="document-readiness"
    >
      <section className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7">
        <p className="type-caption uppercase text-secondary">Your information</p>
        <h2 className="type-card-title mt-2 text-white">Tell us which evidence is available and what still needs work.</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/85">Destination<input className={inputClass} value={input.destination} onChange={(event) => setInput((current) => ({ ...current, destination: event.target.value }))} placeholder="Country or region" /></label>
          <label className="grid gap-2 text-sm text-white/85">Programme or route<input className={inputClass} value={input.programme} onChange={(event) => setInput((current) => ({ ...current, programme: event.target.value }))} placeholder="Not provided" /></label>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {documentGroups.map((group) => (
            <label key={group.key} className="rounded-lg border border-white/15 bg-white/[0.05] p-4">
              <span className="text-sm font-bold text-white">{group.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/55">{group.help}</span>
              <select className={`${inputClass} mt-3`} value={input[group.key]} onChange={(event) => updateStatus(group.key, event.target.value as DocumentStatus)}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>
        <label className="mt-5 grid gap-2 text-sm text-white/85">Notes<textarea className="min-h-24 rounded-lg border border-white/20 bg-white/10 p-3 text-white outline-none placeholder:text-white/45 focus:border-secondary" value={input.notes} onChange={(event) => setInput((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional concerns, deadlines or evidence details" /></label>
        <button type="button" onClick={() => setGenerated(true)} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-black text-primary">
          <ClipboardCheck className="size-4" /> Generate readiness review
        </button>
      </section>

      {generated ? (
        <section className="mt-6 rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7" aria-live="polite">
          <p className="type-caption uppercase text-secondary">Your result</p>
          {result.status === "not-started" ? (
            <div className="mt-3">
              <h2 className="type-section-title text-white">Not started</h2>
              <p className="mt-3 text-white/75">No document statuses were provided, so XIA has not calculated a readiness percentage.</p>
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-end gap-4"><span className="text-5xl font-black text-white">{result.percent}%</span><span className="pb-1 text-sm text-white/65">based on {result.reviewed} reviewed categories</span></div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <ResultList title="Ready" icon={CheckCircle2} items={result.ready.length ? result.ready : ["No category is marked fully available."]} />
                <ResultList title="Needs action" icon={CircleAlert} items={result.action.length ? result.action.map((item) => `${item.label}: ${item.status.replace(/-/g, " ")}`) : ["No action item was identified from supplied statuses."]} />
                <ResultList title="Not provided" icon={ClipboardCheck} items={result.notProvided.length ? result.notProvided : ["Every category has been reviewed."]} />
              </div>
            </>
          )}
        </section>
      ) : null}
    </ToolShell>
  );
}

function ResultList({ title, icon: Icon, items }: { title: string; icon: typeof CheckCircle2; items: string[] }) {
  return <div className="rounded-lg border border-white/15 bg-white/[0.05] p-4"><h3 className="flex items-center gap-2 font-bold text-white"><Icon className="size-4 text-secondary" />{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
