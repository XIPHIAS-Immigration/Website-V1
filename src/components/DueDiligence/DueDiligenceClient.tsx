"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Fingerprint,
  Globe2,
  GraduationCap,
  Landmark,
  LockKeyhole,
  LoaderCircle,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { GlassSelect, type GlassOption } from "@/components/XiaTools/GlassSelect";
import { MeterBar } from "@/components/XiaTools/MeterBar";
import { ToolShell } from "@/components/XiaTools/ToolShell";
import {
  assessImmigrationDueDiligence,
  defaultDueDiligenceInput,
  type DeclarationState,
  type DueDiligenceDimension,
  type DueDiligenceInput,
  type DueDiligenceSeverity,
  type DueDiligenceTrack,
  type EvidenceState,
} from "@/lib/due-diligence";
import { getProductConfig } from "@/lib/payments/product-catalog";

const DUE_DILIGENCE_PRICE_INR = getProductConfig("due_diligence_report")?.priceInr ?? 499;

type StepKey = "pathway" | "history" | "evidence" | "review";

const steps: Array<{ key: StepKey; label: string; short: string; icon: ComponentType<{ className?: string }> }> = [
  { key: "pathway", label: "Pathway & people", short: "Pathway", icon: Globe2 },
  { key: "history", label: "Identity & history", short: "History", icon: Fingerprint },
  { key: "evidence", label: "Evidence & funds", short: "Evidence", icon: FileSearch },
  { key: "review", label: "Declarations & review", short: "Review", icon: ShieldCheck },
];

const trackOptions: Array<{
  value: DueDiligenceTrack;
  label: string;
  copy: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "exploring", label: "Exploring options", copy: "I have not selected a route yet.", icon: Globe2 },
  { value: "skilled", label: "Skilled migration", copy: "Work, talent or points-tested migration.", icon: GraduationCap },
  { value: "residency", label: "Residency", copy: "Golden Visa, investor or long-term residence.", icon: Landmark },
  { value: "citizenship", label: "Citizenship", copy: "Citizenship by investment or another pathway.", icon: BadgeCheck },
  { value: "corporate", label: "Corporate mobility", copy: "Sponsor, founder, transfer or business route.", icon: BriefcaseBusiness },
  { value: "family", label: "Family migration", copy: "Partner, dependant, parent or family route.", icon: UsersRound },
];

const evidenceOptions: GlassOption[] = [
  { value: "complete", label: "Complete — records are available" },
  { value: "partial", label: "Partial — some records are missing" },
  { value: "missing", label: "Missing — not assembled yet" },
  { value: "not-applicable", label: "Not applicable" },
];

const declarationOptions: GlassOption[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
  { value: "unsure", label: "Unsure — needs review" },
  { value: "not-provided", label: "Not provided" },
];

const applicantOptions: GlassOption[] = [
  { value: "individual", label: "One applicant" },
  { value: "couple", label: "Applicant and partner" },
  { value: "family", label: "Family with dependants" },
];

const jurisdictionOptions: GlassOption[] = [
  { value: "one", label: "One country" },
  { value: "two-three", label: "Two or three countries" },
  { value: "four-plus", label: "Four or more countries" },
];

const fundingOptions: GlassOption[] = [
  { value: "savings", label: "Salary or personal savings" },
  { value: "business", label: "Business income or dividends" },
  { value: "asset-sale", label: "Property, company or asset sale" },
  { value: "inheritance", label: "Inheritance or trust distribution" },
  { value: "gift-loan", label: "Gift or loan from another party" },
  { value: "mixed", label: "Multiple sources" },
  { value: "not-decided", label: "Not decided" },
];

const counterpartyOptions: GlassOption[] = [
  { value: "verified", label: "Checked with supporting evidence" },
  { value: "partially-checked", label: "Some checks completed" },
  { value: "not-checked", label: "Not checked" },
  { value: "not-applicable", label: "No material counterparty" },
];

function Field({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
  return (
    <div>
      <div className="type-small font-semibold text-white">{label}</div>
      {helper ? <p className="mt-1 text-xs leading-5 text-white/50">{helper}</p> : null}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function TextInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="type-small font-semibold text-white">{label}</span>
      <input
        {...props}
        className="type-small mt-2.5 h-11 w-full rounded-lg border border-white/25 bg-black/10 px-3.5 text-white outline-none transition placeholder:text-white/35 hover:border-white/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </label>
  );
}

function Choice<T extends string>({
  value,
  onChange,
  options,
  columns = "sm:grid-cols-2",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; copy?: string }>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-2.5 ${columns}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 ${
              active
                ? "border-secondary bg-secondary/10 shadow-[inset_0_0_0_1px_rgba(225,185,35,0.2)]"
                : "border-white/15 bg-black/10 hover:border-white/35 hover:bg-white/[0.04]"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  active ? "border-secondary bg-secondary text-primary" : "border-white/30"
                }`}
              >
                {active ? <Check className="size-3" /> : null}
              </span>
              {option.label}
            </span>
            {option.copy ? <span className="mt-1.5 block pl-7 text-xs leading-5 text-white/50">{option.copy}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function TrackChoice({ value, onChange }: { value: DueDiligenceTrack; onChange: (value: DueDiligenceTrack) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {trackOptions.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-32 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 ${
              active ? "border-secondary bg-secondary/10" : "border-white/15 bg-black/10 hover:-translate-y-0.5 hover:border-white/40"
            }`}
          >
            <span className={`grid size-10 place-items-center rounded-lg ${active ? "bg-secondary text-primary" : "bg-white/10 text-white"}`}>
              <Icon className="size-5" />
            </span>
            <span className="mt-3 block text-sm font-bold text-white">{option.label}</span>
            <span className="mt-1 block text-xs leading-5 text-white/55">{option.copy}</span>
          </button>
        );
      })}
    </div>
  );
}

function severityStyle(severity: DueDiligenceSeverity | "ready-for-review") {
  if (severity === "hold") return "border-red-300/40 bg-red-400/10 text-red-100";
  if (severity === "high") return "border-secondary/50 bg-secondary/15 text-secondary";
  if (severity === "attention") return "border-white/25 bg-white/[0.06] text-white";
  return "border-blue-200/30 bg-blue-300/10 text-blue-100";
}

function statusLabel(status: DueDiligenceSeverity) {
  if (status === "hold") return "Hold";
  if (status === "high") return "High review";
  if (status === "attention") return "Prepare";
  return "Declared ready";
}

function DimensionCard({ dimension }: { dimension: DueDiligenceDimension }) {
  return (
    <article className="min-h-44 rounded-lg border border-white/15 bg-black/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-white">{dimension.label}</h3>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${severityStyle(dimension.status)}`}>
          {statusLabel(dimension.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/75">{dimension.summary}</p>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/40">{dimension.basis}</p>
    </article>
  );
}

export default function DueDiligenceClient() {
  const [input, setInput] = useState<DueDiligenceInput>(defaultDueDiligenceInput);
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", consent: false, company: "" });
  const [checkout, setCheckout] = useState<{ loading: boolean; error: string }>({ loading: false, error: "" });
  const [checkoutStartedAt] = useState(() => Date.now());
  const result = useMemo(() => assessImmigrationDueDiligence(input), [input]);

  const update = <K extends keyof DueDiligenceInput>(key: K, value: DueDiligenceInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setGenerated(false);
  };

  const startPaidDueDiligence = async () => {
    if (!buyer.name.trim() || !buyer.email.trim() || !buyer.consent) {
      setCheckout({ loading: false, error: "Enter your name and email, then confirm consent to continue." });
      return;
    }
    setCheckout({ loading: true, error: "" });
    try {
      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "due_diligence_report",
          productName: "XIPHIAS Immigration Due Diligence Report",
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          consent: buyer.consent,
          company: buyer.company,
          startedAt: checkoutStartedAt,
          track: input.track,
          country: input.destination,
          program: input.programme,
          page: "/due-diligence-intelligence",
          answers: {
            ...input,
            freeReadiness: result.readiness,
            freeCompleteness: result.completeness,
            freeOverall: result.overall,
            freeScope: result.scope,
          },
        }),
      });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; checkoutUrl?: string; error?: string };
      if (!response.ok || !data.ok || !data.checkoutUrl) throw new Error(data.error || "Could not start secure checkout.");
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setCheckout({ loading: false, error: error instanceof Error ? error.message : "Could not start secure checkout." });
    }
  };

  const setTrack = (track: DueDiligenceTrack) => {
    const skilledOrCorporate = track === "skilled" || track === "corporate";
    const investmentLed = track === "residency" || track === "citizenship";
    setInput((current) => ({
      ...current,
      track,
      employmentEvidence: skilledOrCorporate ? (current.employmentEvidence === "not-applicable" ? "missing" : current.employmentEvidence) : "not-applicable",
      educationEvidence: track === "skilled" ? (current.educationEvidence === "not-applicable" ? "missing" : current.educationEvidence) : "not-applicable",
      fundsRequired: investmentLed || current.fundsRequired,
      fundsEvidence: investmentLed && current.fundsEvidence === "not-applicable" ? "missing" : current.fundsEvidence,
      counterpartyStatus: investmentLed || track === "corporate" ? (current.counterpartyStatus === "not-applicable" ? "not-checked" : current.counterpartyStatus) : current.counterpartyStatus,
    }));
    setGenerated(false);
  };

  const setApplicants = (applicants: DueDiligenceInput["applicants"]) => {
    setInput((current) => ({
      ...current,
      applicants,
      familyEvidence:
        applicants === "individual"
          ? "not-applicable"
          : current.familyEvidence === "not-applicable"
            ? "missing"
            : current.familyEvidence,
    }));
    setGenerated(false);
  };

  const toggleFunds = (fundsRequired: boolean) => {
    setInput((current) => ({
      ...current,
      fundsRequired,
      fundsEvidence: fundsRequired && current.fundsEvidence === "not-applicable" ? "missing" : fundsRequired ? current.fundsEvidence : "not-applicable",
      thirdPartyFunds: fundsRequired ? current.thirdPartyFunds : "not-provided",
    }));
    setGenerated(false);
  };

  const activeStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const reset = () => {
    setInput(defaultDueDiligenceInput);
    setStep(0);
    setGenerated(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ToolShell
      eyebrow="XIA Immigration Due Diligence"
      title={<>Know the risks <span className="text-secondary">before you apply.</span></>}
      subtitle="Run a structured pre-application review of identity, immigration history, document integrity, source of funds and relevant relationships. The free result separates declared concerns, unanswered questions and matters requiring enhanced review."
      steps={[
        { title: "Complete the free risk intake", description: "Provide identity, immigration, document and financial information across four short sections." },
        { title: "Review declared risks and gaps", description: "Receive a preliminary result based only on your answers, with enhanced-review triggers clearly separated." },
        { title: `Choose whether to unlock the INR ${DUE_DILIGENCE_PRICE_INR} report`, description: "After seeing the free result, continue to the expanded paid intake and personalised PDF if you need deeper preparation." },
      ]}
      benefits={["Structured risk triage", "Evidence and chronology gaps", `Detailed INR ${DUE_DILIGENCE_PRICE_INR} report option`]}
      contactContext="Due Diligence"
      contactId="due-diligence"
      actions={
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/10 px-4 py-3 text-xs text-white/70">
          <LockKeyhole className="size-4 text-secondary" />
          Answers stay in this browser session
        </div>
      }
    >
      <section className="overflow-hidden rounded-xl border border-white/20 bg-black/10 shadow-2xl shadow-black/10">
        <div className="border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-caption uppercase text-secondary">Preliminary self-assessment</p>
              <p className="mt-1 text-sm text-white/60">Step {step + 1} of {steps.length}: {activeStep.label}</p>
            </div>
            <span className="text-sm font-bold tabular-nums text-white">{Math.round(progress)}%</span>
          </div>
          <MeterBar value={progress} className="mt-4" />

          <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Assessment progress">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = index === step;
              const complete = index < step || generated;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`rounded-lg border px-2 py-3 text-center transition ${
                    active ? "border-secondary bg-secondary/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <span className={`mx-auto grid size-8 place-items-center rounded-full ${complete ? "bg-secondary text-primary" : active ? "bg-white/15 text-secondary" : "bg-white/[0.05] text-white/45"}`}>
                    {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="mt-2 hidden text-[11px] font-semibold text-white/70 sm:block">{item.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[620px] p-4 sm:p-6 lg:p-8">
          {step === 0 ? (
            <div>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/15 text-secondary"><Globe2 className="size-5" /></span>
                <div>
                  <h2 className="type-card-title text-white">What are you preparing for?</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">This determines which evidence and risk controls are relevant. It does not determine eligibility.</p>
                </div>
              </div>
              <div className="mt-6"><TrackChoice value={input.track} onChange={setTrack} /></div>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <TextInput label="Target country" placeholder="For example, Australia or Canada" value={input.destination} onChange={(event) => update("destination", event.target.value)} />
                <TextInput label="Programme or visa, if known" placeholder="For example, Subclass 189 or EB-5" value={input.programme} onChange={(event) => update("programme", event.target.value)} />
                <Field label="Who will be included?">
                  <GlassSelect value={input.applicants} onChange={(value) => setApplicants(value as DueDiligenceInput["applicants"])} options={applicantOptions} ariaLabel="Select applicants" />
                </Field>
                <Field label="How many countries are relevant?" helper="Include nationality, residence, employment, education and significant financial jurisdictions.">
                  <GlassSelect value={input.jurisdictions} onChange={(value) => update("jurisdictions", value as DueDiligenceInput["jurisdictions"])} options={jurisdictionOptions} ariaLabel="Select number of jurisdictions" />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/15 text-secondary"><Fingerprint className="size-5" /></span>
                <div>
                  <h2 className="type-card-title text-white">Identity and immigration history</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">Answer factually. “Unsure” and “Not provided” remain explicit review items.</p>
                </div>
              </div>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="Identity evidence" helper="Valid passport plus supporting identity/address records.">
                  <GlassSelect value={input.identityEvidence} onChange={(value) => update("identityEvidence", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select identity evidence status" />
                </Field>
                <Field label="Do names, birth details and nationality match across records?">
                  <GlassSelect value={input.identityConsistent} onChange={(value) => update("identityConsistent", value as DeclarationState)} options={declarationOptions} ariaLabel="Select identity consistency" />
                </Field>
                <Field label="Immigration and travel history" helper="Visas, applications, residence permits, refusals and significant travel.">
                  <GlassSelect value={input.immigrationHistory} onChange={(value) => update("immigrationHistory", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select immigration history status" />
                </Field>
                <Field label="Any visa refusal, cancellation, overstay, removal or deportation?">
                  <GlassSelect value={input.priorVisaIssue} onChange={(value) => update("priorVisaIssue", value as DeclarationState)} options={declarationOptions} ariaLabel="Select prior visa issue declaration" />
                </Field>
                <Field label="Any criminal matter, charge, investigation, material litigation or regulatory issue?">
                  <GlassSelect value={input.legalIssue} onChange={(value) => update("legalIssue", value as DeclarationState)} options={declarationOptions} ariaLabel="Select legal history declaration" />
                </Field>
                <Field label="Are you, a close family member or associate politically exposed?" helper="Political exposure is not wrongdoing; it changes the review scope.">
                  <GlassSelect value={input.pepExposure} onChange={(value) => update("pepExposure", value as DeclarationState)} options={declarationOptions} ariaLabel="Select political exposure declaration" />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/15 text-secondary"><FileSearch className="size-5" /></span>
                <div>
                  <h2 className="type-card-title text-white">Evidence, money and counterparties</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">Map what exists today. Do not treat expected or requested evidence as verified.</p>
                </div>
              </div>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                {(input.track === "skilled" || input.track === "corporate") ? (
                  <Field label="Employment evidence" helper="References, duties, dates, salary, payroll and tax evidence.">
                    <GlassSelect value={input.employmentEvidence} onChange={(value) => update("employmentEvidence", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select employment evidence status" />
                  </Field>
                ) : null}
                {input.track === "skilled" ? (
                  <Field label="Education and professional evidence" helper="Credentials, transcripts, licences and assessment outcomes.">
                    <GlassSelect value={input.educationEvidence} onChange={(value) => update("educationEvidence", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select education evidence status" />
                  </Field>
                ) : null}
                {input.applicants !== "individual" ? (
                  <Field label="Family relationship evidence" helper="Marriage, birth, dependency, custody and civil records.">
                    <GlassSelect value={input.familyEvidence} onChange={(value) => update("familyEvidence", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select family evidence status" />
                  </Field>
                ) : null}
                <Field label="Does the route require investment or material proof of funds?">
                  <Choice
                    value={input.fundsRequired ? "yes" : "no"}
                    onChange={(value) => toggleFunds(value === "yes")}
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No or not known" }]}
                  />
                </Field>
                {input.fundsRequired ? (
                  <>
                    <Field label="Primary funding source">
                      <GlassSelect value={input.fundingSource} onChange={(value) => update("fundingSource", value as DueDiligenceInput["fundingSource"])} options={fundingOptions} ariaLabel="Select funding source" />
                    </Field>
                    <Field label="Source-of-funds evidence" helper="Origin documents, tax/legal support, accounts and every material transfer.">
                      <GlassSelect value={input.fundsEvidence} onChange={(value) => update("fundsEvidence", value as EvidenceState)} options={evidenceOptions} ariaLabel="Select source of funds evidence status" />
                    </Field>
                    <Field label="Will any donor, lender, company, trust or other person provide funds?">
                      <GlassSelect value={input.thirdPartyFunds} onChange={(value) => update("thirdPartyFunds", value as DeclarationState)} options={declarationOptions} ariaLabel="Select third party funding declaration" />
                    </Field>
                  </>
                ) : null}
                <Field label="Employer, sponsor, agent, developer, fund or business checks" helper="Select not applicable if no material counterparty is involved.">
                  <GlassSelect value={input.counterpartyStatus} onChange={(value) => update("counterpartyStatus", value as DueDiligenceInput["counterpartyStatus"])} options={counterpartyOptions} ariaLabel="Select counterparty verification status" />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/15 text-secondary"><ShieldCheck className="size-5" /></span>
                <div>
                  <h2 className="type-card-title text-white">Final declaration and assessment boundary</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">This scan preserves uncertainty. It does not invent a clearance where verification has not occurred.</p>
                </div>
              </div>
              <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Field label="Any known document alteration, authenticity concern or unexplained inconsistency?">
                  <GlassSelect value={input.documentConcern} onChange={(value) => update("documentConcern", value as DeclarationState)} options={declarationOptions} ariaLabel="Select document integrity declaration" />
                </Field>
                <div className="rounded-lg border border-secondary/30 bg-secondary/[0.07] p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-secondary"><ShieldAlert className="size-4" /> What this scan does not do</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
                    <li>• It does not query sanctions, PEP, police, court or adverse-media databases.</li>
                    <li>• It does not inspect files, verify identity or contact employers, banks or authorities.</li>
                    <li>• It does not determine visa eligibility, admissibility or a government outcome.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-7 rounded-lg border border-white/15 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Ready to generate your preliminary due-diligence map?</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">Your answers remain editable. Nothing is uploaded by this assessment.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGenerated(true);
                      window.setTimeout(() => document.getElementById("due-diligence-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                    }}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-bold text-primary transition hover:bg-[#f0cb3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    Generate assessment <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4 sm:px-6">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-white/45 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="size-4" /> Previous
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-bold text-primary transition hover:bg-[#f0cb3b]"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          ) : null}
        </div>
      </section>

      {generated ? (
        <section id="due-diligence-results" aria-live="polite" className="scroll-mt-28 bg-transparent pt-10">
          <div className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${severityStyle(result.overall)}`}>
                  {result.overallLabel}
                </span>
                <h2 className="type-section-title mt-4 text-white">{result.headline}</h2>
                <p className="type-body mt-3 text-white/65">{result.summary}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/[0.08] px-3.5 py-2 text-sm font-semibold text-secondary">
                  <ClipboardCheck className="size-4" /> Recommended scope: {result.scopeLabel}
                </div>
              </div>
              <div className="grid min-w-64 grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/15 bg-white/[0.03] p-4">
                  <div className="text-3xl font-black tabular-nums text-white">{result.readiness}%</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-white/45">Review readiness</div>
                  <MeterBar value={result.readiness} className="mt-3" />
                </div>
                <div className="rounded-lg border border-white/15 bg-white/[0.03] p-4">
                  <div className="text-3xl font-black tabular-nums text-white">{result.completeness}%</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-white/45">Answer depth</div>
                  <MeterBar value={result.completeness} color="#ffffff" className="mt-3" />
                </div>
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/40">These percentages measure preparation from the supplied answers. They are not approval probabilities, eligibility scores or database clearances.</p>
          </div>

          <section className="mt-6 overflow-hidden rounded-xl border border-secondary/40 bg-black/10">
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-secondary">
                  <CreditCard className="size-4" /> Paid next step - INR {DUE_DILIGENCE_PRICE_INR}
                </div>
                <h2 className="type-section-title mt-4 text-white">Continue with the full due-diligence intake and report.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                  Payment unlocks a deeper case questionnaire covering identity particulars, immigration chronology, legal and PEP context, evidence inventory, employment, education, source of wealth, source of funds and counterparties.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Expanded paid intake after payment",
                    "Personalised evidence and risk findings",
                    "Prioritised remediation plan",
                    "Branded PDF by secure download and email",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 rounded-lg border border-white/12 bg-white/[0.035] p-3 text-sm leading-6 text-white/75">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-secondary" /> {item}
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-white/40">
                  The INR {DUE_DILIGENCE_PRICE_INR} report is an evidence-planning and declared-risk assessment. Third-party database, police, court, sanctions, identity and document-authenticity fees are not included and no clearance is implied.
                </p>
              </div>
              <div className="border-t border-white/15 bg-white/[0.045] p-5 sm:p-7 lg:border-l lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Secure JioPay checkout</p>
                <p className="mt-2 text-3xl font-black text-white">INR {DUE_DILIGENCE_PRICE_INR}</p>
                <div className="mt-5 space-y-4">
                  <TextInput label="Full name*" value={buyer.name} onChange={(event) => setBuyer((current) => ({ ...current, name: event.target.value }))} autoComplete="name" />
                  <TextInput label="Email address*" type="email" value={buyer.email} onChange={(event) => setBuyer((current) => ({ ...current, email: event.target.value }))} autoComplete="email" />
                  <TextInput label="Phone number" value={buyer.phone} onChange={(event) => setBuyer((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" />
                  <label className="hidden" aria-hidden="true">Company<input tabIndex={-1} autoComplete="off" value={buyer.company} onChange={(event) => setBuyer((current) => ({ ...current, company: event.target.value }))} /></label>
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/60">
                    <input type="checkbox" checked={buyer.consent} onChange={(event) => setBuyer((current) => ({ ...current, consent: event.target.checked }))} className="mt-1 size-4 rounded border-white/30 accent-[#e1b923]" />
                    <span>I agree to the privacy policy and to XIPHIAS processing these details for payment, report generation and advisor support.</span>
                  </label>
                  <button type="button" onClick={startPaidDueDiligence} disabled={checkout.loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-black text-primary transition hover:bg-[#f0cb3b] disabled:cursor-wait disabled:opacity-70">
                    {checkout.loading ? <LoaderCircle className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                    {checkout.loading ? "Starting secure checkout..." : `Pay INR ${DUE_DILIGENCE_PRICE_INR} and continue`}
                  </button>
                  {checkout.error ? <p className="text-xs font-semibold leading-5 text-red-200" role="alert">{checkout.error}</p> : null}
                  <p className="text-center text-[11px] leading-5 text-white/35">The server enforces the INR {DUE_DILIGENCE_PRICE_INR} catalogue price.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="type-caption uppercase text-secondary">Due-diligence matrix</p>
                <h2 className="type-card-title mt-2 text-white">What is ready, missing or still unverified</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {result.dimensions.map((dimension) => <DimensionCard key={dimension.key} dimension={dimension} />)}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary/15 text-secondary"><AlertTriangle className="size-5" /></span>
                <div>
                  <p className="type-caption uppercase text-secondary">Explainable findings</p>
                  <h2 className="type-card-title mt-1 text-white">Why each item matters</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {result.findings.length ? result.findings.map((finding, index) => (
                  <article key={finding.code} className="rounded-lg border border-white/15 bg-white/[0.025] p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-sm font-bold text-white"><span className="mr-2 text-secondary">{String(index + 1).padStart(2, "0")}</span>{finding.title}</h3>
                      <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${severityStyle(finding.severity)}`}>{statusLabel(finding.severity)}</span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-3">
                      <div><dt className="text-xs font-bold uppercase tracking-wide text-white/35">Observed</dt><dd className="mt-1 text-white/70">{finding.observation}</dd></div>
                      <div><dt className="text-xs font-bold uppercase tracking-wide text-white/35">Why it matters</dt><dd className="mt-1 text-white/70">{finding.whyItMatters}</dd></div>
                      <div><dt className="text-xs font-bold uppercase tracking-wide text-white/35">Resolve it</dt><dd className="mt-1 text-white/70">{finding.remediation}</dd></div>
                    </dl>
                  </article>
                )) : (
                  <div className="rounded-lg border border-white/15 bg-white/[0.03] p-5 text-sm text-white/70">No rule-based preparation findings were generated. Independent verification is still required.</div>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-xl border border-secondary/30 bg-secondary/[0.07] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-secondary"><Scale className="size-5" /><h2 className="type-card-title">Priority action plan</h2></div>
                <ol className="mt-5 space-y-4">
                  {result.nextActions.map((action, index) => (
                    <li key={action} className="flex gap-3 text-sm leading-6 text-white/75">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-black text-primary">{index + 1}</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-white"><LockKeyhole className="size-5 text-secondary" /><h2 className="type-card-title">Verification boundary</h2></div>
                <ul className="mt-4 space-y-3">
                  {result.verificationBoundary.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-6 text-white/60"><ShieldAlert className="mt-1 size-4 shrink-0 text-secondary" />{item}</li>
                  ))}
                </ul>
              </section>

              <button type="button" onClick={reset} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.04]">
                <RotateCcw className="size-4" /> Start a new assessment
              </button>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-4 bg-transparent md:grid-cols-3">
        {[
          { icon: Fingerprint, title: "Identity and history", copy: "Reconcile identity, aliases, travel, refusals and disclosures before formal screening." },
          { icon: Banknote, title: "Funds and wealth", copy: "Map who generated the money, how it moved and which evidence supports every material step." },
          { icon: ShieldCheck, title: "Expert-verifiable", copy: "Move high-risk or uncertain findings into provider checks and XIPHIAS compliance review." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="min-h-40 rounded-lg border border-white/15 bg-black/10 p-5">
              <Icon className="size-5 text-secondary" />
              <h2 className="mt-4 text-sm font-bold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.copy}</p>
            </article>
          );
        })}
      </section>
    </ToolShell>
  );
}
