"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Globe2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  findWorkPermitCountry,
  workPermitCountries,
  type WorkPermitCountry,
} from "@/lib/work-permits";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; leadId: string }
  | { status: "error"; message: string };

const permitSteps = [
  "Resume review",
  "Permit route match",
  "Document readiness",
  "Advisor follow-up",
];

export default function WorkPermitsClient({
  initialCountrySlug,
}: {
  initialCountrySlug?: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const initialCountry = findWorkPermitCountry(initialCountrySlug) || workPermitCountries[0];
  const [selectedSlug, setSelectedSlug] = useState(initialCountry.slug);
  const [selectedPermit, setSelectedPermit] = useState(initialCountry.permitTypes[0]);
  const [fileName, setFileName] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const intakeRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(
    () => findWorkPermitCountry(selectedSlug) || workPermitCountries[0],
    [selectedSlug],
  );

  function selectCountry(country: WorkPermitCountry) {
    setSelectedSlug(country.slug);
    setSelectedPermit(country.permitTypes[0]);
    router.replace(`/work-permits?country=${country.slug}`, { scroll: false });
    intakeRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("country", selectedCountry.country);
    formData.set("countrySlug", selectedCountry.slug);
    formData.set("permitType", selectedPermit);
    formData.set("page", "/work-permits");

    try {
      const response = await fetch("/api/work-permit", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        leadId?: string;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not submit your work permit review.");
      }

      setSubmitState({ status: "success", leadId: payload.leadId || "" });
      form.reset();
      setFileName("");
      window.setTimeout(() => {
        router.replace(`/work-permits?submitted=1&country=${selectedCountry.slug}`);
      }, 1800);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not submit your work permit review.",
      });
    }
  }

  return (
    <main className="bg-[#f4f7fb] text-midnight_text dark:bg-[#070b12] dark:text-white">
      <section className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-br from-primary via-[#123d83] to-[#07152d] text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-screen-xl gap-10 px-4 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-secondary">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden />
              Work Permit Advisory
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-normal text-white md:text-6xl">
              Work permits without the job consultancy noise.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/82 md:text-lg">
              XIPHIAS reviews work permit routes, resume fit, employer documentation,
              and filing readiness. We do not provide job placement; we help you understand
              whether the permit side is workable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#work-permit-intake"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-black text-primary shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]"
              >
                Upload resume for review
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/skilled"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                View skilled pathways
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#081a37]">
              <Image
                src={selectedCountry.image}
                alt={`${selectedCountry.country} work permit advisory`}
                width={840}
                height={560}
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="aspect-[4/3] w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07152d] via-[#07152d]/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-secondary">
                  Selected route desk
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">{selectedCountry.country}</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/78">
                  {selectedCountry.advisoryFocus}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-14 lg:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-primary dark:text-secondary">
              Countries covered
            </p>
            <h2 className="mt-2 text-3xl font-black text-midnight_text dark:text-white">
              Choose a work permit destination
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-steel_blue dark:text-white/68">
            Country cards use current XIPHIAS assets and connect directly to the resume intake below.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {workPermitCountries.map((country, index) => {
            const active = country.slug === selectedCountry.slug;
            return (
              <motion.button
                key={country.slug}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: Math.min(index * 0.04, 0.22), duration: 0.42 }}
                onClick={() => selectCountry(country)}
                className={[
                  "group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition duration-300",
                  "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/12",
                  "dark:bg-[#0b1730]",
                  active ? "border-secondary ring-2 ring-secondary/40" : "border-slate-200 dark:border-white/10",
                ].join(" ")}
              >
                <div className="relative">
                  <Image
                    src={country.image}
                    alt={`${country.country} permit options`}
                    width={520}
                    height={320}
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 92vw"
                    className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-white/92 px-2.5 py-1 text-xs font-black text-primary">
                        {country.code}
                      </span>
                      <h3 className="mt-2 text-xl font-black text-white">{country.country}</h3>
                    </div>
                    {active ? <CheckCircle2 className="h-6 w-6 text-secondary" aria-hidden /> : null}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70 dark:text-secondary/80">
                    {country.region}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-steel_blue dark:text-white/68">
                    {country.processingSignal}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <motion.div
            key={`${selectedCountry.slug}-readiness`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1730]"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary dark:text-secondary">
                  {selectedCountry.country} permit intelligence
                </p>
                <h3 className="mt-2 text-2xl font-black text-midnight_text dark:text-white">
                  Route readiness snapshot
                </h3>
              </div>
              <Link
                href={selectedCountry.href}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-sm font-black text-primary transition hover:bg-primary hover:text-white dark:border-white/15 dark:text-white"
              >
                View related programme
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {selectedCountry.routeReadiness.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/52">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-black text-primary dark:text-secondary">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-steel_blue dark:text-white/66">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            key={`${selectedCountry.slug}-documents`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1730]"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary dark:text-secondary">
              Document readiness
            </p>
            <h3 className="mt-2 text-2xl font-black text-midnight_text dark:text-white">
              What the advisor will ask for
            </h3>
            <div className="mt-5 grid gap-3">
              {selectedCountry.documentChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-midnight_text dark:bg-white/5 dark:text-white/78">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-secondary" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={intakeRef} id="work-permit-intake" className="mx-auto max-w-screen-xl px-4 pb-20 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1730]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary dark:bg-white/10 dark:text-secondary">
                <Globe2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary dark:text-secondary">
                  Route context
                </p>
                <h2 className="text-2xl font-black">{selectedCountry.country}</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {selectedCountry.permitTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedPermit(type)}
                  className={[
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                    selectedPermit === type
                      ? "border-secondary bg-secondary/15 text-primary dark:text-secondary"
                      : "border-slate-200 text-midnight_text hover:border-primary/30 dark:border-white/10 dark:text-white/82",
                  ].join(" ")}
                >
                  {type}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-steel_blue dark:text-white/56">
                XIPHIAS will check
              </p>
              <div className="mt-4 grid gap-3">
                {selectedCountry.advisorChecks.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm font-semibold text-midnight_text dark:text-white/78">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-xl shadow-primary/5 dark:border-white/10 dark:bg-[#0b1730]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary dark:text-secondary">
                  Resume intake
                </p>
                <h2 className="mt-1 text-2xl font-black">Send your profile for permit review</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-steel_blue dark:text-white/68">
                  Your resume and contact details are emailed to the work permit desk and saved as an X-Hub lead.
                </p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-primary dark:bg-white/10 dark:text-secondary">
                {selectedCountry.country}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Your full name" required />
              <Field label="Email" name="email" type="email" placeholder="name@email.com" required />
              <Field label="Phone / WhatsApp" name="phone" placeholder="+91..." required />
              <Field label="Current role" name="currentRole" placeholder="Software engineer, manager..." />
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/58">
                  Experience
                </span>
                <select
                  name="experience"
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-midnight_text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-[#071225] dark:text-white"
                  defaultValue="3-5 years"
                >
                  <option>0-2 years</option>
                  <option>3-5 years</option>
                  <option>6-10 years</option>
                  <option>10+ years</option>
                </select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/58">
                  Selected permit direction
                </span>
                <input
                  value={`${selectedCountry.country} - ${selectedPermit}`}
                  readOnly
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-midnight_text outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/58">
                  Resume / CV
                </span>
                <span className="group flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-blue-50/60 px-5 py-6 text-center transition hover:border-secondary hover:bg-secondary/10 dark:border-white/15 dark:bg-white/5">
                  <UploadCloud className="h-8 w-8 text-primary transition group-hover:-translate-y-0.5 dark:text-secondary" aria-hidden />
                  <span className="mt-3 text-sm font-black text-midnight_text dark:text-white">
                    {fileName || "Upload resume"}
                  </span>
                  <span className="mt-1 text-xs font-semibold text-steel_blue dark:text-white/58">
                    PDF, DOC, DOCX, or TXT up to 6 MB
                  </span>
                  <input
                    name="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    required
                    className="sr-only"
                    onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name || "")}
                  />
                </span>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/58">
                  Notes for advisor
                </span>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Current country, target timeline, employer situation, family needs, or refusal history..."
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-midnight_text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-[#071225] dark:text-white"
                />
              </label>
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm font-semibold text-steel_blue dark:text-white/72">
              <input
                name="consent"
                type="checkbox"
                value="true"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              I agree that XIPHIAS may contact me about this work permit review.
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={submitState.status === "submitting"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-[#154a9a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitState.status === "submitting" ? "Sending..." : "Send resume for review"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <p className="text-xs font-semibold text-steel_blue dark:text-white/58">
                Sent to the XIPHIAS work permit desk and stored in X-Hub leads.
              </p>
            </div>

            <AnimatePresence>
              {submitState.status === "success" ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                >
                  Resume received. Our work permit desk will review it and get back to you shortly.
                </motion.div>
              ) : null}
              {submitState.status === "error" ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
                >
                  {submitState.message}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {permitSteps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1730]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-black text-primary">
                {index + 1}
              </div>
              <p className="mt-4 text-sm font-black text-midnight_text dark:text-white">{step}</p>
              <p className="mt-2 text-xs leading-5 text-steel_blue dark:text-white/58">
                {index === 0
                  ? "CV and role signals are captured."
                  : index === 1
                    ? "Country and permit direction are shortlisted."
                    : index === 2
                      ? "Missing evidence is flagged."
                      : "A specialist reviews the next step."}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-secondary/40 bg-[#fff8db] p-6 text-sm leading-7 text-midnight_text dark:border-secondary/30 dark:bg-secondary/10 dark:text-white/82">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-secondary" aria-hidden />
            <p>
              Work permit review is not job placement and does not guarantee visa approval.
              XIPHIAS uses the resume and intake details to assess route-fit, document readiness,
              and whether advisor verification is needed before any filing strategy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-steel_blue dark:text-white/58">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-midnight_text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-[#071225] dark:text-white"
      />
    </label>
  );
}
