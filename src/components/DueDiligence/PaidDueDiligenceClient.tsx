"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Download, FileCheck2, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { ToolShell } from "@/components/XiaTools/ToolShell";
import { defaultPaidDueDiligenceInput, type PaidDueDiligenceInput } from "@/lib/due-diligence-paid";
import { getProductConfig } from "@/lib/payments/product-catalog";

const DUE_DILIGENCE_PRICE_INR = getProductConfig("due_diligence_report")?.priceInr ?? 499;

type OrderSummary = {
  reference: string;
  amountInr: number;
  customer: { name: string; email: string; phone?: string };
  track?: string;
  country?: string;
  program?: string;
  completed: boolean;
};

const steps = ["Identity & objective", "History & chronology", "Evidence", "Funds & counterparties", "Declaration"];

const evidenceOptions = [
  ["complete", "Declared complete"],
  ["partial", "Partial"],
  ["missing", "Missing"],
  ["not-provided", "Not provided"],
  ["not-applicable", "Not applicable"],
];

function Field({ label, helper, required, children }: { label: string; helper?: string; required?: boolean; children: ReactNode }) {
  return <label className="block"><span className="text-sm font-bold text-white">{label}{required ? "*" : ""}</span>{helper ? <span className="mt-1 block text-xs leading-5 text-white/45">{helper}</span> : null}<span className="mt-2.5 block">{children}</span></label>;
}

const inputClass = "h-11 w-full rounded-lg border border-white/20 bg-black/15 px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const areaClass = "min-h-28 w-full resize-y rounded-lg border border-white/20 bg-black/15 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 hover:border-white/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20";

function EvidenceSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{evidenceOptions.map(([option, label]) => <option key={option} value={option} className="bg-primary">{label}</option>)}</select>;
}

export default function PaidDueDiligenceClient({ order, expires, token }: { order: string; expires: string; token: string }) {
  const [input, setInput] = useState<PaidDueDiligenceInput>(defaultPaidDueDiligenceInput);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const accessQuery = useMemo(() => new URLSearchParams({ order, expires, token }).toString(), [order, expires, token]);

  useEffect(() => {
    if (!order || !expires || !token) {
      setError("This paid-intake link is incomplete. Return from JioPay or use the secure link sent to your email.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetch(`/api/due-diligence/paid-intake?${accessQuery}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; order?: OrderSummary; intake?: PaidDueDiligenceInput };
        if (!response.ok || !data.ok || !data.order) throw new Error(data.error || "Could not open the paid intake.");
        if (cancelled) return;
        setSummary(data.order);
        setInput({ ...defaultPaidDueDiligenceInput, ...(data.intake ?? {}), fullLegalName: data.intake?.fullLegalName || data.order.customer.name });
        if (data.order.completed) setDownloadUrl(`/api/payments/jiopay/report-download?${accessQuery}`);
      })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not open the paid intake."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [accessQuery, expires, order, token]);

  const update = <K extends keyof PaidDueDiligenceInput>(key: K, value: PaidDueDiligenceInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const textInput = (key: keyof PaidDueDiligenceInput, placeholder = "") => <input className={inputClass} value={String(input[key] ?? "")} placeholder={placeholder} onChange={(event) => update(key, event.target.value as never)} />;
  const textArea = (key: keyof PaidDueDiligenceInput, placeholder = "") => <textarea className={areaClass} value={String(input[key] ?? "")} placeholder={placeholder} onChange={(event) => update(key, event.target.value as never)} />;

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/due-diligence/paid-intake?${accessQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: input }),
      });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; message?: string; downloadUrl?: string };
      if (!response.ok || !data.ok || !data.downloadUrl) throw new Error(data.error || data.message || "The report could not be generated.");
      setDownloadUrl(data.downloadUrl);
      setSummary((current) => current ? { ...current, completed: true } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The report could not be generated.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ToolShell
      eyebrow="XIA Paid Immigration Due Diligence"
      title="Complete Your Full Due-Diligence Intake"
      subtitle={`Your verified ₹${DUE_DILIGENCE_PRICE_INR} payment gives you access to the expanded evidence intake and personalised immigration due-diligence PDF.`}
      steps={[
        { title: "Confirm the paid assessment", description: "The payment reference and customer details are checked before the expanded intake is displayed." },
        { title: "Provide detailed case evidence", description: "Complete identity, immigration, financial, family and verification sections with the information actually available." },
        { title: "Generate and download the report", description: "Receive the personalised PDF with declared risks, missing evidence and verification boundaries made explicit." },
      ]}
      benefits={["Expanded evidence intake", "Personalised due-diligence PDF", "Clear verification boundaries"]}
      contactContext="Paid Due Diligence"
      contactId="paid-due-diligence"
    >
      {loading ? <div className="grid min-h-80 place-items-center rounded-xl border border-white/15 bg-black/10"><LoaderCircle className="size-8 animate-spin text-secondary" aria-label="Loading paid intake" /></div> : error && !summary ? (
        <div className="rounded-xl border border-red-300/30 bg-red-400/10 p-6 text-red-100"><AlertTriangle className="size-6" /><h2 className="mt-3 text-xl font-bold">Paid intake unavailable</h2><p className="mt-2 text-sm leading-6">{error}</p></div>
      ) : summary ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-secondary/35 bg-black/10 p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Payment confirmed</p><h2 className="mt-2 text-2xl font-black text-white">{summary.customer.name}</h2><p className="mt-2 text-sm text-white/55">Reference {summary.reference} - ₹{summary.amountInr}</p></div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary/35 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary"><LockKeyhole className="size-4" /> Secure paid intake</span>
            </div>
          </section>

          {summary.completed && downloadUrl ? (
            <section className="rounded-xl border border-secondary/40 bg-secondary/[0.08] p-6 sm:p-8">
              <FileCheck2 className="size-9 text-secondary" />
              <h2 className="mt-4 text-3xl font-black text-white">Your due-diligence report is ready.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">The completed intake has been saved with this payment reference. Your report was also sent to the checkout email address.</p>
              <a href={downloadUrl} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-black text-primary"><Download className="size-4" /> Download personalised PDF</a>
            </section>
          ) : (
            <section className="overflow-hidden rounded-xl border border-white/20 bg-black/10">
              <div className="border-b border-white/10 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-secondary">Step {step + 1} of {steps.length}</p><h2 className="mt-1 text-xl font-black text-white">{steps[step]}</h2></div><span className="text-sm font-bold text-white/50">{Math.round(((step + 1) / steps.length) * 100)}%</span></div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
                <div className="mt-4 hidden grid-cols-5 gap-2 md:grid">{steps.map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-lg border px-2 py-2 text-[11px] font-bold ${index === step ? "border-secondary bg-secondary/10 text-secondary" : "border-white/10 text-white/45"}`}>{label}</button>)}</div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                {step === 0 ? <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Full legal name" required>{textInput("fullLegalName", "As shown on passport")}</Field>
                  <Field label="Date of birth" required><input type="date" className={inputClass} value={input.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} /></Field>
                  <Field label="Nationality" required>{textInput("nationality")}</Field>
                  <Field label="Current residence country" required>{textInput("residenceCountry")}</Field>
                  <Field label="Passport expiry"><input type="date" className={inputClass} value={input.passportExpiry} onChange={(event) => update("passportExpiry", event.target.value)} /></Field>
                  <Field label="Other names or aliases" helper="Include maiden, former and transliterated names.">{textInput("aliases", "Enter None if not applicable")}</Field>
                  <Field label="Family members included">{textInput("familyMembers", "Names, relationships and ages")}</Field>
                  <Field label="Countries lived in" helper="Include nationality, residence, study and employment jurisdictions.">{textInput("countriesLivedIn")}</Field>
                  <div className="md:col-span-2"><Field label="What do you want this due-diligence report to assess?" required>{textArea("objectives", "Describe the destination, programme, immigration objective and main concerns.")}</Field></div>
                </div> : null}

                {step === 1 ? <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Travel history" helper="Summarise material international travel and long stays.">{textArea("travelHistory")}</Field>
                  <Field label="Visa and immigration status history" required>{textArea("visaHistory", "Include applications, approvals, current status and expiry dates.")}</Field>
                  <Field label="Refusals or cancellations">{textArea("refusalDetails", "Enter None or provide dates, country and reason.")}</Field>
                  <Field label="Overstays, removals or status issues">{textArea("overstayDetails", "Enter None or explain fully.")}</Field>
                  <Field label="Criminal, civil, regulatory or litigation matters">{textArea("legalDetails", "Enter None or explain the event and outcome.")}</Field>
                  <Field label="PEP or public-office connections">{textArea("pepDetails", "Enter None or describe the person, role, dates and relationship.")}</Field>
                  <Field label="Employment chronology">{textArea("employmentTimeline", "Employer, country, role and month/year dates.")}</Field>
                  <Field label="Education chronology">{textArea("educationTimeline", "Institution, qualification, country and dates.")}</Field>
                  <div className="md:col-span-2"><Field label="Known timeline gaps or overlaps">{textArea("timelineGaps", "Enter None or explain gaps and overlapping study/employment.")}</Field></div>
                </div> : null}

                {step === 2 ? <div className="grid gap-6 md:grid-cols-2">
                  {([[
                    "passportEvidence", "Passport evidence", "All relevant pages and validity"
                  ], ["addressEvidence", "Address/residence evidence", "Current address or residence status"], ["policeEvidence", "Police/character evidence", "Certificates for relevant jurisdictions"], ["employmentEvidenceDetail", "Employment evidence", "References, contracts, payroll and tax"], ["educationEvidenceDetail", "Education evidence", "Awards, transcripts and assessments"], ["familyEvidenceDetail", "Family/civil evidence", "Birth, marriage, custody or dependency"], ["financialEvidence", "Financial evidence", "Bank, tax, ownership and transaction records"]] as Array<[keyof PaidDueDiligenceInput, string, string]>).map(([key, label, helper]) => <Field key={key} label={label} helper={helper}><EvidenceSelect value={String(input[key])} onChange={(value) => update(key, value as never)} /></Field>)}
                  <Field label="CPA / candidate profile assessment" helper="Enter the supplied assessment position; do not recalculate it.">{textArea("cpaAssessment", "Enter Not provided if no assessment exists.")}</Field>
                  <Field label="Assessing body or authority" helper="Enter the case-specific body, if known.">{textInput("assessingBody", "For example, ACS or Not provided")}</Field>
                  <Field label="Known document differences or integrity concerns" helper="Names, dates, titles, amounts, altered files or issuer concerns.">{textArea("documentInconsistencies", "Enter None or explain each discrepancy.")}</Field>
                </div> : null}

                {step === 3 ? <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Source of wealth" helper="How total wealth was accumulated.">{textArea("sourceOfWealth")}</Field>
                  <Field label="Source of funds" helper="The exact money intended for this immigration objective.">{textArea("sourceOfFunds")}</Field>
                  <Field label="Available funds and currency">{textInput("availableFunds", "For example ₹25,000,000")}</Field>
                  <Field label="Annual income and currency">{textInput("annualIncome")}</Field>
                  <Field label="How long have the funds been held?">{textInput("fundsHeldPeriod")}</Field>
                  <Field label="Large or unusual deposits">{textArea("largeDeposits", "Enter None or describe amount, date and origin.")}</Field>
                  <Field label="Third-party funds">{textArea("thirdPartyDetails", "Enter None or identify donors, lenders, companies or trusts.")}</Field>
                  <Field label="Counterparty type"><select value={input.counterpartyType} onChange={(event) => update("counterpartyType", event.target.value)} className={inputClass}><option value="none" className="bg-primary">No material counterparty</option><option value="employer" className="bg-primary">Employer or sponsor</option><option value="agent" className="bg-primary">Agent or intermediary</option><option value="developer" className="bg-primary">Developer or property seller</option><option value="fund" className="bg-primary">Fund or investment manager</option><option value="business" className="bg-primary">Business or company</option><option value="other" className="bg-primary">Other</option></select></Field>
                  <Field label="Counterparty name">{textInput("counterpartyName")}</Field>
                  <Field label="Counterparty country">{textInput("counterpartyCountry")}</Field>
                  <Field label="Counterparty checks"><EvidenceSelect value={input.counterpartyChecks} onChange={(value) => update("counterpartyChecks", value)} /></Field>
                  <Field label="Payment instructions or proposed recipient">{textArea("paymentInstructions")}</Field>
                  <Field label="Adverse information or concerns">{textArea("adverseConcerns", "Enter None or explain what caused concern.")}</Field>
                </div> : null}

                {step === 4 ? <div>
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><Field label="Questions for the professional reviewer">{textArea("reviewerQuestions", "List the decisions or concerns you want a XIPHIAS reviewer to address.")}</Field><div className="rounded-xl border border-secondary/30 bg-secondary/[0.07] p-5"><ShieldCheck className="size-6 text-secondary" /><h3 className="mt-3 text-lg font-black text-white">Report boundary</h3><p className="mt-2 text-sm leading-6 text-white/60">The report analyses the information you provide. It does not claim that external databases, issuing authorities or uploaded originals were checked.</p></div></div>
                  <div className="mt-6 space-y-3 rounded-xl border border-white/15 bg-white/[0.03] p-5">
                    <label className="flex items-start gap-3 text-sm leading-6 text-white/70"><input type="checkbox" checked={input.accuracyConfirmed} onChange={(event) => update("accuracyConfirmed", event.target.checked)} className="mt-1 size-4 accent-[#e1b923]" /><span>I confirm that the information is accurate to the best of my knowledge and that missing information remains explicitly missing.</span></label>
                    <label className="flex items-start gap-3 text-sm leading-6 text-white/70"><input type="checkbox" checked={input.consentConfirmed} onChange={(event) => update("consentConfirmed", event.target.checked)} className="mt-1 size-4 accent-[#e1b923]" /><span>I consent to XIPHIAS processing this information to generate and deliver the purchased due-diligence report.</span></label>
                  </div>
                  <button type="button" onClick={submit} disabled={submitting || !input.accuracyConfirmed || !input.consentConfirmed} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-black text-primary disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}{submitting ? "Generating and emailing your report..." : "Generate my personalised report"}</button>
                  {error ? <p className="mt-3 text-sm font-semibold text-red-200" role="alert">{error}</p> : null}
                </div> : null}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4 sm:px-6">
                <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-bold text-white disabled:opacity-30"><ArrowLeft className="size-4" /> Previous</button>
                {step < steps.length - 1 ? <button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} className="inline-flex h-11 items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-black text-primary">Continue <ArrowRight className="size-4" /></button> : null}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </ToolShell>
  );
}
