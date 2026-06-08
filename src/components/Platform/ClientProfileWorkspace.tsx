"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  MessageSquareText,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ClientProfile, PlatformSnapshot } from "@/lib/platform/types";
import type { Track } from "@/lib/eligibility/types";

type Props = {
  initialProfile: ClientProfile;
  snapshot: PlatformSnapshot;
  targetClientId: string;
};

const trackOptions: { value: Track; label: string }[] = [
  { value: "residency", label: "Residency" },
  { value: "citizenship", label: "Citizenship" },
  { value: "skilled", label: "Skilled migration" },
  { value: "corporate", label: "Corporate mobility" },
];

function statusClass(value: string) {
  if (["accepted", "complete", "qualified", "approved"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["reviewing", "active", "case_opened", "uploaded"].includes(value)) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }
  if (["rework", "blocked", "high"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function inputClass() {
  return "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary transition focus:ring-2";
}

export default function ClientProfileWorkspace({ initialProfile, snapshot, targetClientId }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const related = useMemo(() => {
    const cases = snapshot.cases.filter((item) => item.clientId === targetClientId);
    const caseIds = new Set(cases.map((item) => item.id));
    const leadIds = new Set(cases.map((item) => item.leadId).filter(Boolean));
    return {
      cases,
      documents: snapshot.documents.filter((doc) => caseIds.has(doc.caseId)),
      milestones: snapshot.milestones.filter((item) => caseIds.has(item.caseId)),
      riskProfiles: snapshot.riskProfiles.filter((item) => {
        return (item.caseId && caseIds.has(item.caseId)) || (item.leadId && leadIds.has(item.leadId));
      }),
      leads: snapshot.leads.filter((lead) => leadIds.has(lead.id) || lead.email === profile.email),
      conversations: snapshot.conversations.filter((item) => {
        return (item.caseId && caseIds.has(item.caseId)) || (item.leadId && leadIds.has(item.leadId));
      }),
    };
  }, [profile.email, snapshot, targetClientId]);

  function update<K extends keyof ClientProfile>(key: K, value: ClientProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/platform/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, clientId: targetClientId }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; profile?: ClientProfile; error?: string };
    setSaving(false);

    if (!response.ok || !data.profile) {
      setMessage(data.error || "Could not save profile.");
      return;
    }

    setProfile(data.profile);
    setMessage("Profile saved and linked to this client workspace.");
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg border border-[#d8b848]/45 bg-[#071b3d] p-5 text-white shadow-xl shadow-blue-950/10">
        <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-[#d8b848]/25 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[1fr_420px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#f4d36b]">
              <UserRound className="size-4" />
              Single client profile
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-normal sm:text-4xl">
              One profile connects the client, case, documents, risk, and advisor work.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
              Anything the client updates here is saved against <strong>{targetClientId}</strong>. The same identifier links cases, document vault items, milestones, risk reviews, and conversations.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/x-hub/mobility-os" className="rounded-md bg-[#d8b848] px-4 py-2.5 text-sm font-black text-[#071b3d] transition hover:bg-[#f2cf54]">
                Open Mobility OS
              </Link>
              <Link href="/x-hub/documents" className="rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
                Open documents
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{related.cases.length}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Cases</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{related.documents.length}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Documents</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{related.milestones.length}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Milestones</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black text-[#f4d36b]">{related.riskProfiles.length}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Risk reviews</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form onSubmit={save} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Editable client record</p>
              <h3 className="mt-1 text-2xl font-black">Profile and goal details</h3>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>

          {message ? (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${message.includes("Could") ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
              {message}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <input className={inputClass()} value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} />
            </Field>
            <Field label="Email">
              <input className={inputClass()} value={profile.email ?? ""} onChange={(event) => update("email", event.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={inputClass()} value={profile.phone ?? ""} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="Nationality">
              <input className={inputClass()} value={profile.nationality ?? ""} onChange={(event) => update("nationality", event.target.value)} />
            </Field>
            <Field label="Current residence country">
              <input className={inputClass()} value={profile.residenceCountry ?? ""} onChange={(event) => update("residenceCountry", event.target.value)} />
            </Field>
            <Field label="Date of birth">
              <input className={inputClass()} type="date" value={profile.dateOfBirth ?? ""} onChange={(event) => update("dateOfBirth", event.target.value)} />
            </Field>
            <Field label="Family members">
              <input className={inputClass()} value={profile.familyMembers ?? ""} onChange={(event) => update("familyMembers", event.target.value)} placeholder="Example: spouse + 1 child" />
            </Field>
            <Field label="Occupation">
              <input className={inputClass()} value={profile.occupation ?? ""} onChange={(event) => update("occupation", event.target.value)} />
            </Field>
            <Field label="Company name">
              <input className={inputClass()} value={profile.companyName ?? ""} onChange={(event) => update("companyName", event.target.value)} />
            </Field>
            <Field label="Preferred pathway">
              <select className={inputClass()} value={profile.preferredTrack ?? "residency"} onChange={(event) => update("preferredTrack", event.target.value as Track)}>
                {trackOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target country">
              <input className={inputClass()} value={profile.targetCountry ?? ""} onChange={(event) => update("targetCountry", event.target.value)} />
            </Field>
            <Field label="Target program">
              <input className={inputClass()} value={profile.targetProgram ?? ""} onChange={(event) => update("targetProgram", event.target.value)} />
            </Field>
            <Field label="Budget USD">
              <input className={inputClass()} type="number" min="0" value={profile.budgetUsd ?? ""} onChange={(event) => update("budgetUsd", Number(event.target.value) || undefined)} />
            </Field>
            <Field label="Timeline months">
              <input className={inputClass()} type="number" min="1" value={profile.timelineMonths ?? ""} onChange={(event) => update("timelineMonths", Number(event.target.value) || undefined)} />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Source of funds summary">
              <textarea className={inputClass()} rows={5} value={profile.sourceOfFunds ?? ""} onChange={(event) => update("sourceOfFunds", event.target.value)} />
            </Field>
            <Field label="Advisor notes / client goals">
              <textarea className={inputClass()} rows={5} value={profile.notes ?? ""} onChange={(event) => update("notes", event.target.value)} />
            </Field>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="text-lg font-black">Data relationship</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-black">Portal user</p>
                <p className="break-all text-slate-600">{snapshot.user.email}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-black">Client ID</p>
                <p className="break-all text-slate-600">{targetClientId}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-black">Profile ID</p>
                <p className="break-all text-slate-600">{profile.id}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary" />
              <h3 className="text-lg font-black">Active case links</h3>
            </div>
            <div className="mt-4 space-y-3">
              {related.cases.map((item) => (
                <article key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.country} - {item.program}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusClass(item.stage)}`}>{item.stage.replaceAll("_", " ")}</span>
                  </div>
                </article>
              ))}
              {!related.cases.length ? <p className="text-sm text-slate-500">No case is linked yet.</p> : null}
            </div>
          </section>
        </aside>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="text-xl font-black">Linked documents</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {related.documents.map((doc) => (
              <article key={doc.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{doc.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{doc.category}{doc.fileName ? ` - ${doc.fileName}` : ""}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusClass(doc.status)}`}>{doc.status}</span>
                </div>
              </article>
            ))}
            {!related.documents.length ? <p className="text-sm text-slate-500">No documents are linked yet.</p> : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <h3 className="text-xl font-black">Milestones and risk</h3>
          </div>
          <div className="mt-4 space-y-3">
            {related.milestones.map((item) => (
              <article key={item.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                </div>
              </article>
            ))}
            {related.riskProfiles.map((risk) => (
              <article key={risk.id} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <p className="font-black">Risk review: {risk.level}</p>
                <p className="mt-1 text-sm">{risk.flags.map((flag) => flag.label).join(", ") || "Staff review record"}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="size-5 text-primary" />
            <h3 className="text-xl font-black">Lead history</h3>
          </div>
          <div className="mt-4 space-y-3">
            {related.leads.map((lead) => (
              <article key={lead.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{lead.source} lead</p>
                    <p className="mt-1 text-sm text-slate-600">{lead.country || "No country"} - {lead.program || lead.track || "General"}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusClass(lead.status)}`}>{lead.status.replaceAll("_", " ")}</span>
                </div>
              </article>
            ))}
            {!related.leads.length ? <p className="text-sm text-slate-500">No lead history is linked yet.</p> : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-5 text-primary" />
            <h3 className="text-xl font-black">Messages</h3>
          </div>
          <div className="mt-4 space-y-3">
            {related.conversations.slice(0, 5).map((messageItem) => (
              <article key={messageItem.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black">{messageItem.from}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700">{messageItem.channel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{messageItem.body}</p>
              </article>
            ))}
            {!related.conversations.length ? <p className="text-sm text-slate-500">No messages are linked yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
