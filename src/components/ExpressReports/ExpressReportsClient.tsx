"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/eligibility/analytics";
import {
  Check,
  CreditCard,
  FileCheck2,
  LoaderCircle,
} from "lucide-react";

export type ExpressReportProduct = {
  productType:
    | "premium_report"
    | "route_report"
    | "deep_analysis_report"
    | "us_visa_report"
    | "cost_report"
    | "compare_report"
    | "docs_report"
    | "due_diligence_report";
  title: string;
  shortTitle: string;
  priceInr: number;
  description: string;
  delivery: string;
  includes: string[];
  requiresIntake?: boolean;
  featured?: boolean;
};

export type ExpressProgrammeOption = {
  id: string;
  title: string;
  country: string;
  track: "residency" | "citizenship" | "corporate" | "skilled";
};

type ProductType = ExpressReportProduct["productType"];

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  track: "residency" | "citizenship" | "corporate" | "skilled";
  country: string;
  program: string;
  goal: string;
  profile: string;
  priority: string;
  budget: string;
  timeline: string;
  family: boolean;
  dependents: string;
  age: string;
  occupation: string;
  field: string;
  education: string;
  yearsExperience: string;
  languageTest: string;
  languageScore: string;
  citationCount: string;
  publicationCount: string;
  patentCount: string;
  programmes: string;
  documentsAvailable: string;
  documentsMissing: string;
  profileSummary: string;
  dateOfBirth: string;
  nationality: string;
  residenceCountry: string;
  aliases: string;
  visaHistory: string;
  refusalDetails: string;
  legalDetails: string;
  passportEvidence: string;
  documentInconsistencies: string;
  sourceOfFunds: string;
  availableFunds: string;
  counterpartyName: string;
  counterpartyCountry: string;
  adverseConcerns: string;
  cpaAssessment: string;
  assessingBody: string;
  consent: boolean;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  track: "skilled",
  country: "",
  program: "",
  goal: "not-sure",
  profile: "",
  priority: "",
  budget: "",
  timeline: "",
  family: false,
  dependents: "0",
  age: "",
  occupation: "",
  field: "",
  education: "unknown",
  yearsExperience: "",
  languageTest: "not-provided",
  languageScore: "",
  citationCount: "",
  publicationCount: "",
  patentCount: "",
  programmes: "",
  documentsAvailable: "",
  documentsMissing: "",
  profileSummary: "",
  dateOfBirth: "",
  nationality: "",
  residenceCountry: "",
  aliases: "",
  visaHistory: "",
  refusalDetails: "",
  legalDetails: "",
  passportEvidence: "not-provided",
  documentInconsistencies: "",
  sourceOfFunds: "",
  availableFunds: "",
  counterpartyName: "",
  counterpartyCountry: "",
  adverseConcerns: "",
  cpaAssessment: "",
  assessingBody: "",
  consent: false,
};

const evidenceOptions = [
  ["advancedDegree", "Advanced degree"],
  ["awards", "Recognised awards"],
  ["publications", "Publications"],
  ["citations", "Citations"],
  ["patents", "Patents or IP"],
  ["media", "Media coverage"],
  ["judging", "Judging or peer review"],
  ["criticalRole", "Critical role"],
  ["highSalary", "High salary evidence"],
  ["leadership", "Leadership or founder role"],
  ["businessImpact", "Business impact"],
  ["nationalInterest", "National-interest impact"],
  ["jobOffer", "Job offer"],
  ["employerSponsor", "Employer sponsor"],
] as const;

const inputClass =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.055] px-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/30 focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const areaClass =
  "min-h-28 w-full resize-y rounded-xl border border-white/15 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 hover:border-white/30 focus:border-secondary focus:ring-2 focus:ring-secondary/20";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-white">{label}</span>
      {hint ? <span className="mt-1 block text-xs leading-5 text-white/45">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function priceLabel(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function isHighSkill(type: ProductType) {
  return type === "deep_analysis_report" || type === "us_visa_report";
}

const REPORT_DRAFT_KEY = "xiphias-express-report-draft-v1";

type SavedReportDraft = {
  selectedType: ProductType;
  form: FormState;
  evidence: Record<string, boolean>;
};

export default function ExpressReportsClient({
  products,
  programmes,
  initialReport,
  initialProgrammes = "",
}: {
  products: ExpressReportProduct[];
  programmes: ExpressProgrammeOption[];
  initialReport?: ProductType;
  initialProgrammes?: string;
}) {
  const [selectedType, setSelectedType] = useState<ProductType>(initialReport ?? "route_report");
  const [form, setForm] = useState<FormState>({ ...initialForm, programmes: initialProgrammes });
  const [evidence, setEvidence] = useState<Record<string, boolean>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());

  const selected = products.find((product) => product.productType === selectedType) ?? products[0];
  const estimatedIntakeTime = isHighSkill(selectedType) ? "Usually 8-12 minutes" : "Usually 2-4 minutes";
  const countries = useMemo(
    () => Array.from(new Set(programmes.map((item) => item.country))).sort((a, b) => a.localeCompare(b)),
    [programmes],
  );
  const matchingProgrammes = useMemo(() => {
    const country = form.country.trim().toLowerCase();
    return programmes
      .filter((item) => !country || item.country.toLowerCase() === country)
      .slice(0, 350);
  }, [form.country, programmes]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REPORT_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SavedReportDraft>;
        const canRestore = parsed.form && parsed.evidence && parsed.selectedType && (!initialReport || initialReport === parsed.selectedType);
        if (canRestore) {
          setSelectedType(parsed.selectedType as ProductType);
          setForm({ ...initialForm, ...(parsed.form as FormState), programmes: initialProgrammes || parsed.form?.programmes || "" });
          setEvidence(parsed.evidence as Record<string, boolean>);
        }
      }
    } catch {
      window.localStorage.removeItem(REPORT_DRAFT_KEY);
    } finally {
      setDraftReady(true);
    }
  }, [initialProgrammes, initialReport]);

  useEffect(() => {
    if (!draftReady) return;
    const draft: SavedReportDraft = { selectedType, form, evidence };
    window.localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(draft));
  }, [draftReady, evidence, form, selectedType]);

  const formError = (): string => {
    if (!form.name.trim()) return "Enter your full name to continue.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address to continue.";
    if (isHighSkill(selectedType)) {
      if (!form.occupation.trim()) return "Enter your occupation or current role.";
      if (!form.age.trim() || Number(form.age) < 18) return "Enter your age so the report can assess age-sensitive routes.";
      if (form.education === "unknown") return "Select your highest education.";
      if (!form.yearsExperience.trim()) return "Enter your years of experience.";
    }
    if (selectedType === "premium_report" && (!form.occupation.trim() || !form.age.trim() || form.education === "unknown" || !form.yearsExperience.trim())) {
      return "Add your occupation, age, education and experience for a useful premium strategy.";
    }
    if (selectedType === "route_report" && !form.occupation.trim() && !form.profileSummary.trim()) {
      return "Add your occupation or a short background summary so the route recommendation is personal.";
    }
    if (selectedType === "cost_report" && (!form.country.trim() || !form.program.trim())) {
      return "Enter the destination and exact programme for a meaningful cost estimate.";
    }
    if (selectedType === "compare_report" && form.programmes.split(/[,;|\n]+/).filter((item) => item.trim()).length < 2) {
      return "Choose or enter at least two programmes for a useful comparison.";
    }
    if (selectedType === "docs_report" && (!form.country.trim() || !form.program.trim())) {
      return "Enter the destination and programme to build the correct checklist.";
    }
    if (selectedType === "due_diligence_report" && (!form.country.trim() || !form.program.trim() || !form.profileSummary.trim())) {
      return "Enter the destination, route and the focus of your due-diligence review.";
    }
    if (selectedType === "due_diligence_report" && (!form.dateOfBirth || !form.nationality.trim() || !form.residenceCountry.trim() || !form.visaHistory.trim())) {
      return "Complete your date of birth, nationality, residence and visa history for the due-diligence report.";
    }
    return "";
  };

  const submit = async () => {
    setError("");
    const validationError = formError();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!form.consent) {
      setError("Please accept the privacy and report-generation consent to continue.");
      return;
    }
    if (selectedType === "compare_report" && form.programmes.split(/[,;|\n]+/).filter(Boolean).length < 2) {
      setError("Choose or enter at least two programmes for a useful comparison.");
      return;
    }

    setSubmitting(true);
    trackEvent("report_checkout_started", { product_type: selectedType, value: selected.priceInr, currency: "INR" });
    try {
      const effectiveCountry = selectedType === "us_visa_report" ? "United States" : form.country;
      const answers: Record<string, string | number | boolean> = {
        goal: form.goal,
        profile: form.profile,
        priority: form.priority,
        family: form.family,
        occupation: form.occupation,
        role: form.occupation,
        field: form.field,
        education: form.education,
        languageTest: form.languageTest,
        programmes: form.programmes,
        selectedProgrammes: form.programmes,
        documentsAvailable: form.documentsAvailable,
        documentsMissing: form.documentsMissing,
        profileSummary: form.profileSummary,
        objectives: form.profileSummary,
        fullLegalName: form.name,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        residenceCountry: form.residenceCountry,
        aliases: form.aliases,
        visaHistory: form.visaHistory,
        refusalDetails: form.refusalDetails,
        legalDetails: form.legalDetails,
        passportEvidence: form.passportEvidence,
        documentInconsistencies: form.documentInconsistencies,
        sourceOfFunds: form.sourceOfFunds,
        availableFunds: form.availableFunds,
        counterpartyName: form.counterpartyName,
        counterpartyCountry: form.counterpartyCountry,
        adverseConcerns: form.adverseConcerns,
        cpaAssessment: form.cpaAssessment,
        assessingBody: form.assessingBody,
        paidIntakeCompleted: selectedType === "due_diligence_report",
        paidIntakeVersion: selectedType === "due_diligence_report" ? 1 : 0,
        accuracyConfirmed: form.consent,
        consentConfirmed: form.consent,
        dataSource: selectedType === "due_diligence_report" ? "Client pre-payment due-diligence intake" : "Client report intake",
        reviewStatus: "draft",
        source: "express-reports",
      };
      for (const [key, raw] of [
        ["budget", form.budget],
        ["timeline", form.timeline],
        ["dependents", form.dependents],
        ["age", form.age],
        ["yearsExperience", form.yearsExperience],
        ["languageScore", form.languageScore],
        ["citationCount", form.citationCount],
        ["publicationCount", form.publicationCount],
        ["patentCount", form.patentCount],
      ] as const) {
        if (!raw.trim()) continue;
        const numeric = Number(raw);
        if (Number.isFinite(numeric)) answers[key] = numeric;
      }
      for (const [key, value] of Object.entries(evidence)) {
        answers[key] = value;
        answers[`evidence_${key}`] = value;
      }

      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          consent: form.consent,
          startedAt,
          productType: selected.productType,
          productName: selected.title,
          track: selectedType === "us_visa_report" ? "skilled" : form.track,
          country: effectiveCountry,
          program: form.program,
          page: "/express-reports",
          answers,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Secure checkout could not be started. Please try again.");
      }
      window.localStorage.removeItem(REPORT_DRAFT_KEY);
      trackEvent("report_checkout_redirect", { product_type: selectedType, value: selected.priceInr, currency: "INR" });
      window.location.assign(data.checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Secure checkout could not be started.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-primary pb-24 pt-24 text-white">
      <section className="border-b border-white/10 bg-primary">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/reports" className="text-sm font-bold text-white/55 transition hover:text-white">&larr; Change report</Link>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">Step 2 of 3 &middot; Your information</p>
              <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">Please enter the required information below and proceed to checkout.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">Your answers will be used to personalise the {selected.shortTitle}. After verified payment, the PDF is prepared for download and email delivery.</p>
            </div>
            <div className="flex shrink-0 gap-2 text-[11px] font-black uppercase tracking-wide">
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-2 text-emerald-200">1 Selected</span>
              <span className="rounded-full border border-secondary bg-secondary/10 px-3 py-2 text-secondary">2 Information</span>
              <span className="rounded-full border border-white/10 px-3 py-2 text-white/35">3 Pay &amp; download</span>
            </div>
          </div>
        </div>
      </section>

      <section id="express-report-intake" className="mx-auto max-w-screen-2xl bg-primary px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.035] shadow-2xl">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="border-b border-white/10 bg-black/15 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-black text-secondary"><FileCheck2 className="size-4" /> Selected report</span>
              <h2 className="mt-5 text-3xl font-black">{selected.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/55">{selected.description}</p>
              <p className="mt-6 text-4xl font-black text-secondary">{priceLabel(selected.priceInr)}</p>
              <p className="mt-1 text-xs text-white/40">{selected.delivery}</p>
              <div className="mt-7 space-y-3">
                {selected.includes.map((item) => <div key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/70"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3" /></span>{item}</div>)}
              </div>
              {selected.requiresIntake ? <div className="mt-7 rounded-xl border border-secondary/25 bg-secondary/[0.07] p-4 text-xs leading-6 text-white/60">After payment, the secure full due-diligence intake opens. Your PDF is generated after that intake is completed.</div> : null}
            </aside>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Report information</p><h2 className="mt-2 text-2xl font-black">Complete your details for this report.</h2></div>
                <span className="text-xs text-white/40">{estimatedIntakeTime}</span>
              </div>

              <datalist id="express-countries">{countries.map((country) => <option key={country} value={country} />)}</datalist>
              <datalist id="express-programmes">{matchingProgrammes.map((item) => <option key={item.id} value={item.title}>{item.country}</option>)}</datalist>

              <div className="mt-8 border-t border-white/10 pt-7">
                <p className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-white/40">Report information</p>
                <div className="mb-6 max-w-md"><Field label="Immigration category"><select className={inputClass} value={form.track} onChange={(event) => update("track", event.target.value as FormState["track"])} disabled={selectedType === "us_visa_report"}><option value="skilled" className="bg-primary">Skilled migration</option><option value="residency" className="bg-primary">Residency</option><option value="citizenship" className="bg-primary">Citizenship</option><option value="corporate" className="bg-primary">Corporate mobility</option></select></Field></div>
              </div>

              {selectedType === "route_report" || selectedType === "premium_report" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Preferred destination" hint="Leave blank if you want a global comparison"><input list="express-countries" className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} placeholder="For example Australia" /></Field>
                  <Field label="Primary objective"><select className={inputClass} value={form.goal} onChange={(event) => update("goal", event.target.value)}><option value="not-sure" className="bg-primary">Not sure - compare routes</option><option value="pr" className="bg-primary">Permanent residence</option><option value="work-visa" className="bg-primary">Work visa</option><option value="citizenship" className="bg-primary">Citizenship</option><option value="investment" className="bg-primary">Investment migration</option><option value="business-setup" className="bg-primary">Business setup</option><option value="family-migration" className="bg-primary">Family migration</option></select></Field>
                  <Field label="Your profile"><select className={inputClass} value={form.profile} onChange={(event) => update("profile", event.target.value)}><option value="" className="bg-primary">Select profile</option><option value="professional" className="bg-primary">Professional</option><option value="investor" className="bg-primary">Investor</option><option value="entrepreneur" className="bg-primary">Entrepreneur</option><option value="family" className="bg-primary">Family</option><option value="company" className="bg-primary">Company</option><option value="researcher" className="bg-primary">Researcher</option><option value="student" className="bg-primary">Student</option></select></Field>
                  <Field label="Main decision priority"><select className={inputClass} value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="" className="bg-primary">Select priority</option><option value="stability" className="bg-primary">Long-term stability</option><option value="speed" className="bg-primary">Speed</option><option value="cost" className="bg-primary">Lower cost</option><option value="mobility" className="bg-primary">Global mobility</option><option value="tax" className="bg-primary">Tax planning</option><option value="business" className="bg-primary">Business access</option></select></Field>
                  <Field label="Indicative budget (USD)"><input className={inputClass} inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="For example 150000" /></Field>
                  <Field label="Preferred timeline (months)"><input className={inputClass} inputMode="numeric" value={form.timeline} onChange={(event) => update("timeline", event.target.value)} /></Field>
                  <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-4 text-sm font-bold text-white"><input type="checkbox" checked={form.family} onChange={(event) => update("family", event.target.checked)} className="size-4 accent-[#e1b923]" /> Include spouse or dependants</label>
                  <Field label="Occupation or current role"><input className={inputClass} value={form.occupation} onChange={(event) => update("occupation", event.target.value)} /></Field>
                  <div className="md:col-span-2"><Field label="Relevant background and priorities" hint="Add the facts that should influence the recommendation."><textarea className={areaClass} value={form.profileSummary} onChange={(event) => update("profileSummary", event.target.value)} /></Field></div>
                </div>
              ) : null}

              {selectedType === "premium_report" ? (
                <div className="mt-7 grid gap-6 border-t border-white/10 pt-7 md:grid-cols-2">
                  <Field label="Age"><input className={inputClass} inputMode="numeric" value={form.age} onChange={(event) => update("age", event.target.value)} /></Field>
                  <Field label="Highest education"><select className={inputClass} value={form.education} onChange={(event) => update("education", event.target.value)}><option value="unknown" className="bg-primary">Select education</option><option value="bachelor" className="bg-primary">Bachelor&apos;s</option><option value="master" className="bg-primary">Master&apos;s</option><option value="phd" className="bg-primary">Doctorate / PhD</option></select></Field>
                  <Field label="Years of experience"><input className={inputClass} inputMode="numeric" value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} /></Field>
                  <Field label="Programme already being considered"><input list="express-programmes" className={inputClass} value={form.program} onChange={(event) => update("program", event.target.value)} /></Field>
                  <Field label="Language test"><select className={inputClass} value={form.languageTest} onChange={(event) => update("languageTest", event.target.value)}><option value="not-provided" className="bg-primary">Not provided</option><option value="ielts" className="bg-primary">IELTS</option><option value="pte" className="bg-primary">PTE</option><option value="toefl" className="bg-primary">TOEFL</option><option value="oet" className="bg-primary">OET</option><option value="celpip" className="bg-primary">CELPIP</option><option value="other" className="bg-primary">Other</option></select></Field>
                  <Field label="Overall language score"><input className={inputClass} value={form.languageScore} onChange={(event) => update("languageScore", event.target.value)} /></Field>
                  <div className="md:col-span-2"><Field label="Documents already available" hint="This helps the report separate route direction from practical readiness."><textarea className={areaClass} value={form.documentsAvailable} onChange={(event) => update("documentsAvailable", event.target.value)} /></Field></div>
                </div>
              ) : null}

              {isHighSkill(selectedType) ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {selectedType !== "us_visa_report" ? <Field label="Target country"><select className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)}><option value="" className="bg-primary">Global comparison</option><option value="United States" className="bg-primary">United States</option><option value="Australia" className="bg-primary">Australia</option><option value="Canada" className="bg-primary">Canada</option><option value="United Kingdom" className="bg-primary">United Kingdom</option></select></Field> : <Field label="Target country"><input className={inputClass} value="United States" disabled /></Field>}
                  <Field label="Occupation or role"><input className={inputClass} value={form.occupation} onChange={(event) => update("occupation", event.target.value)} placeholder="For example software architect" /></Field>
                  <Field label="Professional field"><select className={inputClass} value={form.field} onChange={(event) => update("field", event.target.value)}><option value="" className="bg-primary">Select field</option><option value="technology" className="bg-primary">Technology</option><option value="science" className="bg-primary">Science</option><option value="business" className="bg-primary">Business</option><option value="healthcare" className="bg-primary">Healthcare</option><option value="academia" className="bg-primary">Academia</option><option value="arts" className="bg-primary">Arts</option><option value="sports" className="bg-primary">Sports</option><option value="other" className="bg-primary">Other</option></select></Field>
                  <Field label="Objective"><select className={inputClass} value={form.goal} onChange={(event) => update("goal", event.target.value)}><option value="not-sure" className="bg-primary">Not sure</option><option value="permanent-residency" className="bg-primary">Permanent residence</option><option value="temporary-work" className="bg-primary">Temporary work</option><option value="talent-visa" className="bg-primary">Talent visa</option><option value="founder" className="bg-primary">Founder route</option></select></Field>
                  <Field label="Age"><input className={inputClass} inputMode="numeric" value={form.age} onChange={(event) => update("age", event.target.value)} /></Field>
                  <Field label="Highest education"><select className={inputClass} value={form.education} onChange={(event) => update("education", event.target.value)}><option value="unknown" className="bg-primary">Select education</option><option value="bachelor" className="bg-primary">Bachelor&apos;s</option><option value="master" className="bg-primary">Master&apos;s</option><option value="phd" className="bg-primary">Doctorate / PhD</option></select></Field>
                  <Field label="Years of experience"><input className={inputClass} inputMode="numeric" value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} /></Field>
                  <Field label="Language test"><select className={inputClass} value={form.languageTest} onChange={(event) => update("languageTest", event.target.value)}><option value="not-provided" className="bg-primary">Not provided</option><option value="ielts" className="bg-primary">IELTS</option><option value="pte" className="bg-primary">PTE</option><option value="toefl" className="bg-primary">TOEFL</option><option value="oet" className="bg-primary">OET</option><option value="celpip" className="bg-primary">CELPIP</option><option value="other" className="bg-primary">Other</option></select></Field>
                  <Field label="Overall language score"><input className={inputClass} value={form.languageScore} onChange={(event) => update("languageScore", event.target.value)} /></Field>
                </div>
              ) : null}

              {isHighSkill(selectedType) ? (
                <details className="mt-7 rounded-xl border border-white/10 bg-black/10 p-5" open={selectedType === "deep_analysis_report"}>
                  <summary className="cursor-pointer text-sm font-black text-white">Optional achievements and supporting evidence</summary>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <Field label="Publication count"><input className={inputClass} inputMode="numeric" value={form.publicationCount} onChange={(event) => update("publicationCount", event.target.value)} /></Field>
                  <Field label="Citation count"><input className={inputClass} inputMode="numeric" value={form.citationCount} onChange={(event) => update("citationCount", event.target.value)} /></Field>
                  <Field label="Patent or registered IP count"><input className={inputClass} inputMode="numeric" value={form.patentCount} onChange={(event) => update("patentCount", event.target.value)} /></Field>
                  <div className="md:col-span-2"><p className="text-sm font-bold">Evidence you can support</p><p className="mt-1 text-xs leading-5 text-white/45">Select only evidence you can document. Unselected signals remain not provided.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{evidenceOptions.map(([key, label]) => <label key={key} className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-white/70"><input type="checkbox" checked={Boolean(evidence[key])} onChange={(event) => setEvidence((current) => ({ ...current, [key]: event.target.checked }))} className="size-4 accent-[#e1b923]" />{label}</label>)}</div></div>
                  <div className="md:col-span-2"><Field label="Profile summary" hint="Include measurable achievements, responsibilities and immigration priorities."><textarea className={areaClass} value={form.profileSummary} onChange={(event) => update("profileSummary", event.target.value)} /></Field></div>
                  </div>
                </details>
              ) : null}

              {selectedType === "cost_report" ? <div className="grid gap-6 md:grid-cols-2"><Field label="Destination"><input list="express-countries" className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} /></Field><Field label="Programme"><input list="express-programmes" className={inputClass} value={form.program} onChange={(event) => update("program", event.target.value)} /></Field><Field label="Number of dependants"><input className={inputClass} inputMode="numeric" value={form.dependents} onChange={(event) => update("dependents", event.target.value)} /></Field><Field label="Budget limit (USD)"><input className={inputClass} inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} /></Field><div className="md:col-span-2"><Field label="Cost-planning notes"><textarea className={areaClass} value={form.profileSummary} onChange={(event) => update("profileSummary", event.target.value)} placeholder="Include family composition, expected move date and any cost concerns." /></Field></div></div> : null}

              {selectedType === "compare_report" ? <div className="grid gap-6 md:grid-cols-2"><div className="md:col-span-2"><Field label="Programmes to compare" hint="Enter 2-4 exact programme names, one per line."><textarea className={areaClass} value={form.programmes} onChange={(event) => update("programmes", event.target.value)} placeholder={"Australia Subclass 189\nCanada Express Entry"} /></Field></div><Field label="Decision priority"><select className={inputClass} value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="stability" className="bg-primary">Long-term stability</option><option value="speed" className="bg-primary">Speed</option><option value="cost" className="bg-primary">Cost</option><option value="mobility" className="bg-primary">Mobility</option><option value="business" className="bg-primary">Business access</option></select></Field><Field label="Budget (USD)"><input className={inputClass} inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} /></Field><label className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-4 text-sm font-bold"><input type="checkbox" checked={form.family} onChange={(event) => update("family", event.target.checked)} className="size-4 accent-[#e1b923]" /> Compare family suitability</label></div> : null}

              {selectedType === "docs_report" ? <div className="grid gap-6 md:grid-cols-2"><Field label="Destination"><input list="express-countries" className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} /></Field><Field label="Programme"><input list="express-programmes" className={inputClass} value={form.program} onChange={(event) => update("program", event.target.value)} /></Field><div className="md:col-span-2"><Field label="Documents already available" hint="List passports, education, employment, financial and civil documents."><textarea className={areaClass} value={form.documentsAvailable} onChange={(event) => update("documentsAvailable", event.target.value)} /></Field></div><div className="md:col-span-2"><Field label="Known missing or expired documents"><textarea className={areaClass} value={form.documentsMissing} onChange={(event) => update("documentsMissing", event.target.value)} /></Field></div></div> : null}

              {selectedType === "due_diligence_report" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Destination"><input list="express-countries" className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} /></Field>
                  <Field label="Programme or route"><input list="express-programmes" className={inputClass} value={form.program} onChange={(event) => update("program", event.target.value)} /></Field>
                  <Field label="Date of birth"><input type="date" className={inputClass} value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} /></Field>
                  <Field label="Nationality"><input className={inputClass} value={form.nationality} onChange={(event) => update("nationality", event.target.value)} /></Field>
                  <Field label="Current residence country"><input className={inputClass} value={form.residenceCountry} onChange={(event) => update("residenceCountry", event.target.value)} /></Field>
                  <Field label="Other names or aliases" hint="Enter None if not applicable"><input className={inputClass} value={form.aliases} onChange={(event) => update("aliases", event.target.value)} /></Field>
                  <div className="md:col-span-2"><Field label="What should the due-diligence review assess?"><textarea className={areaClass} value={form.profileSummary} onChange={(event) => update("profileSummary", event.target.value)} placeholder="Identity, visa history, funds, employer, agent, investment counterparty or another concern." /></Field></div>
                  <div className="md:col-span-2"><Field label="Visa and immigration history"><textarea className={areaClass} value={form.visaHistory} onChange={(event) => update("visaHistory", event.target.value)} placeholder="Applications, approvals, current status and relevant dates." /></Field></div>
                  <Field label="Refusals or cancellations" hint="Enter None or explain"><textarea className={areaClass} value={form.refusalDetails} onChange={(event) => update("refusalDetails", event.target.value)} /></Field>
                  <Field label="Legal, criminal or regulatory matters" hint="Enter None or explain"><textarea className={areaClass} value={form.legalDetails} onChange={(event) => update("legalDetails", event.target.value)} /></Field>
                  <Field label="Passport evidence status"><select className={inputClass} value={form.passportEvidence} onChange={(event) => update("passportEvidence", event.target.value)}><option value="not-provided" className="bg-primary">Not provided</option><option value="complete" className="bg-primary">Complete</option><option value="partial" className="bg-primary">Partial</option><option value="missing" className="bg-primary">Missing</option></select></Field>
                  <Field label="Known document inconsistencies"><textarea className={areaClass} value={form.documentInconsistencies} onChange={(event) => update("documentInconsistencies", event.target.value)} placeholder="Enter None or explain names, dates, titles or amounts that differ." /></Field>
                  <Field label="Source of funds"><textarea className={areaClass} value={form.sourceOfFunds} onChange={(event) => update("sourceOfFunds", event.target.value)} /></Field>
                  <Field label="Available funds and currency"><input className={inputClass} value={form.availableFunds} onChange={(event) => update("availableFunds", event.target.value)} /></Field>
                  <Field label="Employer, agent or other counterparty"><input className={inputClass} value={form.counterpartyName} onChange={(event) => update("counterpartyName", event.target.value)} /></Field>
                  <Field label="Counterparty country"><input className={inputClass} value={form.counterpartyCountry} onChange={(event) => update("counterpartyCountry", event.target.value)} /></Field>
                  <div className="md:col-span-2"><Field label="Adverse information or concerns"><textarea className={areaClass} value={form.adverseConcerns} onChange={(event) => update("adverseConcerns", event.target.value)} placeholder="Enter None or describe the concern." /></Field></div>
                  <Field label="CPA / assessment potential" hint="Use the supplied value; do not estimate"><textarea className={areaClass} value={form.cpaAssessment} onChange={(event) => update("cpaAssessment", event.target.value)} placeholder="Not provided" /></Field>
                  <Field label="Assessing body or authority"><input className={inputClass} value={form.assessingBody} onChange={(event) => update("assessingBody", event.target.value)} placeholder="Not provided" /></Field>
                </div>
              ) : null}

              <div className="mt-8 border-t border-white/10 pt-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Contact and delivery</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Enter where the purchased report should be delivered. These details are collected after the report information.</p>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <Field label="Full name"><input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></Field>
                  <Field label="Email address"><input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" /></Field>
                  <Field label="Phone number" hint="Optional, including country code"><input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></Field>
                  <input tabIndex={-1} aria-hidden="true" className="hidden" value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="off" />
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-secondary/25 bg-secondary/[0.07] p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs font-black uppercase tracking-[0.15em] text-secondary">Next: secure payment</p><p className="mt-1 text-sm text-white/60">{selected.title} will be delivered to {form.email || "your email"}.</p></div>
                  <p className="text-2xl font-black text-secondary">{priceLabel(selected.priceInr)}</p>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/45">Missing optional facts remain explicitly unprovided. They are not silently invented.</p>
              </div>

              <div className="mt-7 border-t border-white/10 pt-7">
                <label className="flex cursor-pointer items-start gap-3 text-xs leading-6 text-white/60"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#e1b923]" /><span>I confirm that these details are accurate and agree to their processing for checkout, report generation, delivery and relevant advisor support.</span></label>
                <button type="button" onClick={submit} disabled={submitting} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-base font-black text-primary shadow-[0_12px_30px_rgba(225,185,35,0.2)] transition hover:bg-[#f0cb3b] disabled:cursor-wait disabled:opacity-70">
                  {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <CreditCard className="size-5" />}
                  {submitting ? "Starting secure checkout..." : `Next: pay ${priceLabel(selected.priceInr)}`}
                </button>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/35"><span>Server-enforced price</span><span>Verified payment</span><span>PDF download</span><span>Email delivery</span></div>
              </div>

              {error ? <p className="mt-6 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-sm font-semibold text-red-100" role="alert">{error}</p> : null}

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
