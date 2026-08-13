"use client";

import { useState } from "react";
import { Download, Eye, Mail, ShieldCheck } from "lucide-react";

const reportTypes = [
  ["premium_report", "Personal Immigration Strategy"],
  ["us_visa_report", "US Visa Strategy"],
  ["deep_analysis_report", "High-Skill Deep Analysis"],
  ["route_report", "Route Intelligence"],
  ["cost_report", "Cost & Budget"],
  ["compare_report", "Programme Comparison"],
  ["docs_report", "Document Readiness"],
] as const;

const tracks = ["residency", "citizenship", "skilled", "corporate"] as const;
type Mode = "preview" | "download" | "email";

type ApiMessage = {
  ok?: boolean;
  error?: string;
  filename?: string;
  clientEmail?: { status: string; reason?: string };
};

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950";
const sectionClass = "grid gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800";

function Label({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{title}</span>
      {children}
    </label>
  );
}

export default function AdminDetailedReportForm() {
  const [busy, setBusy] = useState<Mode | "">("");
  const [message, setMessage] = useState("");

  async function submit(form: HTMLFormElement, mode: Mode) {
    setBusy(mode);
    setMessage("");
    const body = Object.fromEntries(new FormData(form).entries());
    body.mode = mode;

    const response = await fetch("/api/platform/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if ((mode === "preview" || mode === "download") && response.ok) {
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "XIPHIAS_Personal_Report.pdf";
      const url = URL.createObjectURL(blob);
      if (mode === "preview") window.open(url, "_blank", "noopener,noreferrer");
      else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage(mode === "preview" ? "Preview opened in a new tab." : "Personalised report downloaded.");
      setBusy("");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as ApiMessage;
    setBusy("");
    if (!response.ok || !data.ok) {
      setMessage(data.error || "Could not process the report.");
      return;
    }
    setMessage(`Report email status: ${data.clientEmail?.status || "sent"}.`);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget, "preview");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#a47700] dark:bg-amber-950/40">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a47700]">Paid report desk</p>
          <h2 className="mt-1 text-xl font-black">Prepare a verified personal report</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Choose a template, record only supported client facts, preview the PDF, and mark it reviewed before emailing.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-4">
        <fieldset className={sectionClass}>
          <legend className="px-1 text-sm font-black">Report and client</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <Label title="Report template">
              <select name="productType" defaultValue="premium_report" className={inputClass}>
                {reportTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Label>
            <Label title="Review status">
              <select name="reviewStatus" defaultValue="draft" className={inputClass}>
                <option value="draft">Draft</option>
                <option value="advisor-reviewed">Advisor reviewed</option>
                <option value="verified">Verified against documents</option>
              </select>
            </Label>
            <Label title="Client name"><input name="name" required className={inputClass} /></Label>
            <Label title="Client email"><input name="email" type="email" required className={inputClass} /></Label>
            <Label title="Phone"><input name="phone" className={inputClass} /></Label>
            <Label title="Payment reference"><input name="paymentReference" required className={inputClass} /></Label>
            <Label title="Prepared by"><input name="preparedBy" placeholder="Advisor name" className={inputClass} /></Label>
            <Label title="Verified / reviewed date"><input name="verifiedAt" type="date" className={inputClass} /></Label>
          </div>
        </fieldset>

        <fieldset className={sectionClass}>
          <legend className="px-1 text-sm font-black">Identity and objective</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <Label title="Nationality"><input name="nationality" className={inputClass} /></Label>
            <Label title="Current country"><input name="currentCountry" className={inputClass} /></Label>
            <Label title="Age"><input name="age" type="number" min="0" max="100" className={inputClass} /></Label>
            <Label title="Marital status"><input name="maritalStatus" className={inputClass} /></Label>
            <Label title="Track">
              <select name="track" defaultValue="skilled" className={inputClass}>{tracks.map((track) => <option key={track}>{track}</option>)}</select>
            </Label>
            <Label title="Goal"><input name="goal" placeholder="Permanent residency, work visa..." className={inputClass} /></Label>
            <Label title="Target countries"><input name="targetCountries" placeholder="Australia, Canada" className={inputClass} /></Label>
            <Label title="Timeline months"><input name="timelineMonths" type="number" min="0" className={inputClass} /></Label>
            <Label title="Selected programmes"><input name="selectedProgrammes" placeholder="Subclass 189; Subclass 190" className={inputClass} /></Label>
            <Label title="Fallback programmes"><input name="fallbackProgrammes" placeholder="Only advisor-approved alternatives" className={inputClass} /></Label>
            <Label title="Decision priority"><input name="priority" placeholder="Stability, speed, cost..." className={inputClass} /></Label>
            <Label title="Presence preference"><input name="presence" placeholder="Low, moderate, full relocation" className={inputClass} /></Label>
          </div>
          <Label title="Goals and client constraints"><textarea name="goals" rows={3} className={inputClass} /></Label>
        </fieldset>

        <fieldset className={sectionClass}>
          <legend className="px-1 text-sm font-black">Career and route evidence</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <Label title="Occupation / role"><input name="occupation" className={inputClass} /></Label>
            <Label title="Field / industry"><input name="field" className={inputClass} /></Label>
            <Label title="Highest education"><input name="education" className={inputClass} /></Label>
            <Label title="Years of experience"><input name="yearsExperience" type="number" min="0" className={inputClass} /></Label>
            <Label title="Language test"><input name="languageTest" placeholder="IELTS, PTE..." className={inputClass} /></Label>
            <Label title="Language score"><input name="languageScore" inputMode="decimal" className={inputClass} /></Label>
            <Label title="Skills assessment"><input name="skillsAssessment" placeholder="Authority, occupation and status" className={inputClass} /></Label>
            <Label title="Employer / business"><input name="employerOrBusiness" className={inputClass} /></Label>
          </div>
          <Label title="Proposed endeavour / intended work"><textarea name="proposedEndeavour" rows={3} className={inputClass} /></Label>
          <Label title="CV-based profile summary"><textarea name="profileSummary" rows={5} className={inputClass} /></Label>
          <Label title="Evidence categories"><input name="evidenceSelected" placeholder="Awards; publications; patents; job offer; recommendations" className={inputClass} /></Label>
          <div className="grid gap-3 md:grid-cols-3">
            <Label title="Citations"><input name="citationCount" type="number" min="0" className={inputClass} /></Label>
            <Label title="Publications"><input name="publicationCount" type="number" min="0" className={inputClass} /></Label>
            <Label title="Patents"><input name="patentCount" type="number" min="0" className={inputClass} /></Label>
          </div>
          <Label title="Evidence quality notes"><textarea name="evidenceNotes" rows={3} className={inputClass} /></Label>
        </fieldset>

        <fieldset className={sectionClass}>
          <legend className="px-1 text-sm font-black">Family, funds and immigration history</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <Label title="Family included?">
              <select name="familyIncluded" defaultValue="false" className={inputClass}><option value="false">No</option><option value="true">Yes</option></select>
            </Label>
            <Label title="Number of dependants"><input name="dependants" type="number" min="0" max="20" className={inputClass} /></Label>
            <Label title="Budget USD"><input name="budgetUsd" inputMode="decimal" className={inputClass} /></Label>
            <Label title="Available funds USD"><input name="availableFundsUsd" inputMode="decimal" className={inputClass} /></Label>
            <Label title="Preferred currency"><input name="preferredCurrency" placeholder="INR, USD, AED..." className={inputClass} /></Label>
            <Label title="Current immigration status"><input name="currentImmigrationStatus" className={inputClass} /></Label>
          </div>
          <Label title="Family details"><textarea name="familyMembers" rows={2} className={inputClass} /></Label>
          <Label title="Source of funds"><textarea name="sourceOfFunds" rows={3} className={inputClass} /></Label>
          <Label title="Verified cost items (JSON)"><textarea name="verifiedCosts" rows={4} placeholder={'[{"label":"Government fee","amount":4640,"currency":"AUD","source":"Official fee page","verifiedAt":"2026-08-12"}]'} className={inputClass} /></Label>
          <Label title="Immigration history"><textarea name="immigrationHistory" rows={3} className={inputClass} /></Label>
          <Label title="Visa refusals / cancellations"><textarea name="refusals" rows={2} className={inputClass} /></Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Label title="Medical notes"><textarea name="medicalNotes" rows={2} className={inputClass} /></Label>
            <Label title="Character / police notes"><textarea name="characterNotes" rows={2} className={inputClass} /></Label>
          </div>
        </fieldset>

        <fieldset className={sectionClass}>
          <legend className="px-1 text-sm font-black">Documents and advisor sign-off</legend>
          <Label title="Document inventory (JSON or one available document per line)">
            <textarea name="documentInventory" rows={5} placeholder={'[{"name":"Passport","status":"verified"},{"name":"Police clearance","status":"collecting"}]'} className={inputClass} />
          </Label>
          <Label title="Factual sources"><textarea name="factualSources" rows={3} placeholder="Official URLs or internal source references, one per line" className={inputClass} /></Label>
          <Label title="Custom executive summary"><textarea name="executiveSummary" rows={4} placeholder="Client-specific findings only; do not repeat generic programme copy" className={inputClass} /></Label>
          <Label title="Advisor recommendation"><textarea name="advisorRecommendation" rows={3} placeholder="Primary recommendation and its conditions" className={inputClass} /></Label>
          <Label title="Client-specific risks"><textarea name="customRisks" rows={3} placeholder="One risk per line" className={inputClass} /></Label>
          <Label title="Client-specific next actions"><textarea name="nextActions" rows={3} placeholder="One action per line" className={inputClass} /></Label>
          <Label title="Advisor conclusions and caveats"><textarea name="advisorNotes" rows={4} className={inputClass} /></Label>
          <div className="grid gap-3 md:grid-cols-3">
            <Label title="Route fit score"><input name="routeFitScore" type="number" min="0" max="100" className={inputClass} /></Label>
            <Label title="Evidence score"><input name="evidenceStrengthScore" type="number" min="0" max="100" className={inputClass} /></Label>
            <Label title="Document score"><input name="documentReadinessScore" type="number" min="0" max="100" className={inputClass} /></Label>
            <Label title="Risk clarity score"><input name="riskClarityScore" type="number" min="0" max="100" className={inputClass} /></Label>
            <Label title="Family readiness score"><input name="familyReadinessScore" type="number" min="0" max="100" className={inputClass} /></Label>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={Boolean(busy)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
            <Eye className="size-4" />{busy === "preview" ? "Generating..." : "Preview PDF"}
          </button>
          <button type="button" disabled={Boolean(busy)} onClick={(event) => void submit(event.currentTarget.form!, "download")} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-800 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <Download className="size-4" />{busy === "download" ? "Generating..." : "Download PDF"}
          </button>
          <button type="button" disabled={Boolean(busy)} onClick={(event) => void submit(event.currentTarget.form!, "email")} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-800 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <Mail className="size-4" />{busy === "email" ? "Sending..." : "Email reviewed PDF"}
          </button>
        </div>
        {message ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{message}</p> : null}
      </form>
    </section>
  );
}
