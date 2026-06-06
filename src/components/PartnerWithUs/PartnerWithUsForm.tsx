"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  User2,
} from "lucide-react";

type Props = {
  id?: string;
  className?: string;
};

type FormState = {
  partnerName: string;
  companyName: string;
  partnerType: string;
  partnerEmail: string;
  partnerPhone: string;
  partnershipGoal: string;
  consent: boolean;
  websiteField: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  partnerName: "",
  companyName: "",
  partnerType: "",
  partnerEmail: "",
  partnerPhone: "",
  partnershipGoal: "",
  consent: false,
  websiteField: "",
};

const partnerTypes = [
  "Immigration consultant",
  "Wealth manager / family office",
  "Legal / tax / compliance advisor",
  "HR / global mobility team",
  "Real estate / developer network",
  "Education / relocation advisor",
  "Other",
];

export default function PartnerWithUsForm({ id = "partner-form", className = "" }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(values: FormState) {
    const nextErrors: FormErrors = {};

    if (values.websiteField.trim()) {
      nextErrors.websiteField = "Bot submission blocked.";
    }
    if (values.partnerName.trim().length < 2) {
      nextErrors.partnerName = "Enter your full name.";
    }
    if (values.partnerType.trim().length < 2) {
      nextErrors.partnerType = "Choose the kind of partnership.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(values.partnerEmail.trim())) {
      nextErrors.partnerEmail = "Enter a valid business email address.";
    }
    if (!/^[0-9+()\-\s]{7,}$/i.test(values.partnerPhone.trim())) {
      nextErrors.partnerPhone = "Enter a valid phone number.";
    }
    if (values.partnershipGoal.trim().length < 20) {
      nextErrors.partnershipGoal = "Add a short summary of your partnership enquiry.";
    }
    if (!values.consent) {
      nextErrors.consent = "Please confirm consent before submitting.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      setServerMessage("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setStatus("submitting");
      setServerMessage("");

      const response = await fetch("/api/partner-with-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          page: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "We could not submit your partnership request.");
      }

      setStatus("success");
      setServerMessage("Thanks for reaching out. Our partnerships desk will get back to you shortly.");
      setForm(initialState);
      setErrors({});
    } catch (error: any) {
      setStatus("error");
      setServerMessage(error?.message || "Something went wrong while sending your request.");
    }
  }

  return (
    <aside
      id={id}
      className={[
        "relative overflow-hidden rounded-[28px] border border-blue-100/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,58,132,0.12)] backdrop-blur",
        "dark:border-blue-900/50 dark:bg-slate-950/75",
        className,
      ].join(" ")}
      aria-labelledby="partner-form-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-700/15" />
        <div className="absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-700/15" />
      </div>

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-100 dark:ring-blue-900/50">
          <ShieldCheck className="h-3.5 w-3.5" />
          Partner enquiry
        </div>
        <h2 id="partner-form-title" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Start the conversation
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Tell us who you are and the kind of partnership you have in mind. We will take it from there.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="websiteField"
            value={form.websiteField}
            onChange={(event) => setField("websiteField", event.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <InputField
            label="Your name"
            name="partnerName"
            value={form.partnerName}
            onChange={(value) => setField("partnerName", value)}
            placeholder="Your full name"
            icon={<User2 className="h-4 w-4" />}
            error={errors.partnerName}
            required
            autoComplete="name"
          />
          <SelectField
            label="Partner type"
            name="partnerType"
            value={form.partnerType}
            onChange={(value) => setField("partnerType", value)}
            options={partnerTypes}
            error={errors.partnerType}
            required
          />
          <InputField
            label="Company / firm"
            name="companyName"
            value={form.companyName}
            onChange={(value) => setField("companyName", value)}
            placeholder="Optional"
            icon={<Building2 className="h-4 w-4" />}
            autoComplete="organization"
          />
          <InputField
            label="Business email"
            name="partnerEmail"
            type="email"
            value={form.partnerEmail}
            onChange={(value) => setField("partnerEmail", value)}
            placeholder="name@company.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.partnerEmail}
            required
            autoComplete="email"
          />
          <InputField
            label="Phone"
            name="partnerPhone"
            value={form.partnerPhone}
            onChange={(value) => setField("partnerPhone", value)}
            placeholder="+91 98XXXXXXXX"
            icon={<Phone className="h-4 w-4" />}
            error={errors.partnerPhone}
            required
            inputMode="tel"
            autoComplete="tel"
            className="md:col-span-2"
          />

          <TextAreaField
            label="How can we work together?"
            name="partnershipGoal"
            value={form.partnershipGoal}
            onChange={(value) => setField("partnershipGoal", value)}
            placeholder="Tell us briefly about your partnership requirement."
            icon={<MessageSquare className="h-4 w-4" />}
            error={errors.partnershipGoal}
            required
            className="md:col-span-2"
            rows={4}
          />

          <div className="md:col-span-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => setField("consent", event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>I consent to XIPHIAS contacting me regarding this partnership enquiry.</span>
            </label>
            {errors.consent ? <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">{errors.consent}</p> : null}
          </div>

          {serverMessage ? (
            <div
              className={[
                "md:col-span-2 rounded-2xl px-4 py-3 text-sm",
                status === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100"
                  : "border border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100",
              ].join(" ")}
            >
              {serverMessage}
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? "Submitting..." : "Send enquiry"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We usually respond within 1 business day.
            </p>
          </div>
        </form>
      </div>
    </aside>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  required,
  className = "",
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <span
        className={[
          "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm transition",
          error
            ? "border-red-300 ring-2 ring-red-100 dark:border-red-800 dark:ring-red-900/40"
            : "border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/60 dark:focus-within:border-blue-800 dark:focus-within:ring-blue-900/40",
        ].join(" ")}
      >
        {icon ? <span className="text-slate-400 dark:text-slate-500">{icon}</span> : null}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <span
        className={[
          "flex items-center rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm transition",
          error
            ? "border-red-300 ring-2 ring-red-100 dark:border-red-800 dark:ring-red-900/40"
            : "border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/60 dark:focus-within:border-blue-800 dark:focus-within:ring-blue-900/40",
        ].join(" ")}
      >
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-slate-900 outline-none dark:text-white"
        >
          <option value="">Select one</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  required,
  className = "",
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <span
        className={[
          "flex gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm transition",
          error
            ? "border-red-300 ring-2 ring-red-100 dark:border-red-800 dark:ring-red-900/40"
            : "border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/60 dark:focus-within:border-blue-800 dark:focus-within:ring-blue-900/40",
        ].join(" ")}
      >
        {icon ? <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span> : null}
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full resize-y bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{error}</span> : null}
    </label>
  );
}
