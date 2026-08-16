"use client";

import { useState } from "react";
import { ArrowRight, Download, LoaderCircle, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/eligibility/analytics";

type Props = {
  defaults: {
    country?: string;
    program?: string;
    occupation?: string;
  };
};

const evidenceOptions = [
  ["advancedDegree", "Advanced degree"], ["awards", "Recognised awards"], ["publications", "Publications"],
  ["citations", "Citations"], ["patents", "Patents or IP"], ["media", "Media coverage"],
  ["judging", "Judging or peer review"], ["criticalRole", "Critical role"], ["highSalary", "High salary evidence"],
  ["leadership", "Leadership / founder role"], ["businessImpact", "Business impact"], ["nationalInterest", "National-interest impact"],
  ["jobOffer", "Job offer"], ["employerSponsor", "Employer sponsor"],
] as const;

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-[#0b4ea2] focus:ring-2 focus:ring-[#0b4ea2]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const areaClass = `${inputClass} min-h-28 py-3`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-bold">{label}</span>{hint ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}{children}</label>;
}

export default function RegistrationDeepAnalysisIntake({ defaults }: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    country: defaults.country || "",
    program: defaults.program || "",
    occupation: defaults.occupation || "",
    field: "technology",
    goal: "permanent-residency",
    age: "",
    education: "unknown",
    yearsExperience: "",
    languageTest: "not-provided",
    languageScore: "",
    publicationCount: "",
    citationCount: "",
    patentCount: "",
    cpaAssessment: "",
    assessingBody: "",
    proposedEndeavour: "",
    profileSummary: "",
    documentsAvailable: "",
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function continueToEvidence() {
    setError("");
    if (!form.occupation.trim() || !form.age.trim() || form.education === "unknown" || !form.yearsExperience.trim()) {
      setError("Add your occupation, age, education and experience before continuing.");
      return;
    }
    setStep(1);
  }

  async function generate() {
    setError("");
    if (form.profileSummary.trim().length < 80) {
      setError("Add a specific profile summary of at least 80 characters so the report is genuinely personal.");
      return;
    }
    setBusy(true);
    trackEvent("included_deep_analysis_generation_started", { source: "x-hub-registration" });
    try {
      const response = await fetch("/api/platform/reports/deep-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, evidence }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "The report could not be generated.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/i)?.[1] || "XIPHIAS-Deep-Analysis.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      trackEvent("included_deep_analysis_downloaded", { source: "x-hub-registration" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The report could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-[#071a3a] p-6 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d8b650]/40 bg-[#d8b650]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-[#f6d86d]"><ShieldCheck className="size-4" /> Included with registration</span>
        <h1 className="mt-4 text-3xl font-black">Build your Deep Analysis report</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-blue-50/75">Complete the case-specific facts below. The draft PDF uses only what you supply; missing CPA, assessing-body or evidence details remain “Not provided” until verified.</p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-2">
          {["Profile facts", "Evidence & download"].map((label, index) => <div key={label} className={`rounded-lg border px-3 py-2 text-xs font-black ${step === index ? "border-[#d8ad1f] bg-[#d8ad1f]/10 text-[#8a6a00] dark:text-[#f6d86d]" : "border-slate-200 text-slate-400 dark:border-slate-700"}`}>{index + 1}. {label}</div>)}
        </div>

        {step === 0 ? <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field label="Target country"><input className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} /></Field>
          <Field label="Programme or visa family"><input className={inputClass} value={form.program} onChange={(event) => update("program", event.target.value)} /></Field>
          <Field label="Occupation or current role"><input className={inputClass} value={form.occupation} onChange={(event) => update("occupation", event.target.value)} /></Field>
          <Field label="Professional field"><select className={inputClass} value={form.field} onChange={(event) => update("field", event.target.value)}><option value="technology">Technology</option><option value="science">Science</option><option value="business">Business</option><option value="healthcare">Healthcare</option><option value="academia">Academia</option><option value="arts">Arts</option><option value="sports">Sports</option><option value="other">Other</option></select></Field>
          <Field label="Objective"><select className={inputClass} value={form.goal} onChange={(event) => update("goal", event.target.value)}><option value="permanent-residency">Permanent residence</option><option value="temporary-work">Temporary work</option><option value="talent-visa">Talent visa</option><option value="founder">Founder route</option><option value="not-sure">Not sure</option></select></Field>
          <Field label="Age"><input className={inputClass} inputMode="numeric" value={form.age} onChange={(event) => update("age", event.target.value)} /></Field>
          <Field label="Highest education"><select className={inputClass} value={form.education} onChange={(event) => update("education", event.target.value)}><option value="unknown">Select education</option><option value="bachelor">Bachelor&apos;s</option><option value="master">Master&apos;s</option><option value="phd">Doctorate / PhD</option></select></Field>
          <Field label="Years of experience"><input className={inputClass} inputMode="numeric" value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} /></Field>
          <Field label="Language test"><select className={inputClass} value={form.languageTest} onChange={(event) => update("languageTest", event.target.value)}><option value="not-provided">Not provided</option><option value="ielts">IELTS</option><option value="pte">PTE</option><option value="toefl">TOEFL</option><option value="oet">OET</option><option value="celpip">CELPIP</option><option value="other">Other</option></select></Field>
          <Field label="Overall language score"><input className={inputClass} value={form.languageScore} onChange={(event) => update("languageScore", event.target.value)} /></Field>
          <div className="md:col-span-2 flex justify-end"><button type="button" onClick={continueToEvidence} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#d8ad1f] px-6 text-sm font-black text-[#071a3a]">Continue <ArrowRight className="size-4" /></button></div>
        </div> : null}

        {step === 1 ? <div className="mt-7 space-y-6">
          <div className="grid gap-5 md:grid-cols-3"><Field label="Publications"><input className={inputClass} inputMode="numeric" value={form.publicationCount} onChange={(event) => update("publicationCount", event.target.value)} /></Field><Field label="Citations"><input className={inputClass} inputMode="numeric" value={form.citationCount} onChange={(event) => update("citationCount", event.target.value)} /></Field><Field label="Patents / registered IP"><input className={inputClass} inputMode="numeric" value={form.patentCount} onChange={(event) => update("patentCount", event.target.value)} /></Field></div>
          <div><p className="text-sm font-bold">Evidence you can document</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{evidenceOptions.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700"><input type="checkbox" checked={Boolean(evidence[key])} onChange={(event) => setEvidence((current) => ({ ...current, [key]: event.target.checked }))} className="size-4 accent-[#d8ad1f]" />{label}</label>)}</div></div>
          <div className="grid gap-5 md:grid-cols-2"><Field label="CPA / assessment potential" hint="Use only a supplied assessment outcome; otherwise leave blank."><textarea className={areaClass} value={form.cpaAssessment} onChange={(event) => update("cpaAssessment", event.target.value)} /></Field><Field label="Assessing body" hint="For example Australian Computer Society (ACS). Leave blank if unknown."><textarea className={areaClass} value={form.assessingBody} onChange={(event) => update("assessingBody", event.target.value)} /></Field></div>
          <Field label="Proposed endeavour or intended work"><textarea className={areaClass} value={form.proposedEndeavour} onChange={(event) => update("proposedEndeavour", event.target.value)} /></Field>
          <Field label="Detailed profile summary" hint="At least 80 characters. Include measurable achievements, responsibilities and immigration priorities."><textarea className={areaClass} value={form.profileSummary} onChange={(event) => update("profileSummary", event.target.value)} /></Field>
          <Field label="Documents currently available"><textarea className={areaClass} value={form.documentsAvailable} onChange={(event) => update("documentsAvailable", event.target.value)} /></Field>
          <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setStep(0)} className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold dark:border-slate-700">Back</button><button type="button" onClick={generate} disabled={busy} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#d8ad1f] px-6 text-sm font-black text-[#071a3a] disabled:opacity-60">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}{busy ? "Generating personalised PDF…" : "Generate and download included report"}</button></div>
        </div> : null}

        {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
