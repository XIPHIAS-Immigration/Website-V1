"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMessageSquare,
} from "react-icons/fi";

type Props = {
  className?: string;
  id?: string; // for #referral-form anchor
  onSuccessRedirect?: string;
};

export default function ReferralForm({
  className = "",
  id,
  onSuccessRedirect,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notesLen, setNotesLen] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();

  const titleId = "referral-form-title";

  const get = (name: string) =>
    (
      formRef.current?.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null
    )?.value || "";

  // validators
  const vName = (s: string) => s.trim().length >= 2;
  const vPhone = (s: string) =>
    !s.trim() || /^[0-9+()\-\s]{7,}$/.test(s.trim()); // optional
  const vEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(s.trim());
  const vMsg = (s: string) => !s.trim() || s.trim().length >= 10;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    const referrerName = get("referrerName");
    const referrerEmail = get("referrerEmail");
    const referrerPhone = get("referrerPhone");

    const friendName = get("friendName");
    const friendEmail = get("friendEmail");
    const friendPhone = get("friendPhone");

    const notes = get("notes");

    if (touched.referrerName && !vName(referrerName))
      e.referrerName = "Please enter at least 2 characters.";
    if (touched.referrerEmail && !vEmail(referrerEmail))
      e.referrerEmail = "Enter a valid email address.";
    if (touched.referrerPhone && !vPhone(referrerPhone))
      e.referrerPhone = "Enter a valid phone number or leave it empty.";

    if (touched.friendName && !vName(friendName))
      e.friendName = "Please enter at least 2 characters.";
    if (touched.friendEmail && !vEmail(friendEmail))
      e.friendEmail = "Enter a valid email address.";
    if (touched.friendPhone && !vPhone(friendPhone))
      e.friendPhone = "Enter a valid phone number or leave it empty.";

    if (touched.notes && !vMsg(notes))
      e.notes = "Please add at least 10 characters or leave this blank.";

    return e;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched]);

  const markTouched = (name: string) =>
    setTouched((t) => ({ ...t, [name]: true }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;

    // Honeypot – bots only
    if ((f.elements.namedItem("company") as HTMLInputElement)?.value) return;

    const payload = Object.fromEntries(new FormData(f).entries());

    const referrerName = String(payload.referrerName || "");
    const referrerEmail = String(payload.referrerEmail || "");
    const friendName = String(payload.friendName || "");
    const friendEmail = String(payload.friendEmail || "");

    if (
      !vName(referrerName) ||
      !vEmail(referrerEmail) ||
      !vName(friendName) ||
      !vEmail(friendEmail)
    ) {
      setTouched({
        referrerName: true,
        referrerEmail: true,
        friendName: true,
        friendEmail: true,
      });
      toast.error("Please fill in the required fields correctly.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          page:
            typeof window !== "undefined" ? window.location.pathname : "",
          referrerUrl:
            typeof document !== "undefined" ? document.referrer || "" : "",
        }),
      });

      if (!res.ok) {
        let message = "Failed to submit referral.";
        try {
          const data = await res.json();
          if (data?.error) message = String(data.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      toast.success(
        "Thank you! Your referral has been submitted. Our team will reach out shortly."
      );

      f.reset();
      setTouched({});
      setNotesLen(0);

      if (onSuccessRedirect) router.push(onSuccessRedirect);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id={id}
      className={[
        "relative w-full max-w-xl mx-auto",
        "rounded-2xl bg-white dark:bg-neutral-950",
        "ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm",
        "p-4 sm:p-6",
        className,
      ].join(" ")}
      aria-labelledby={titleId}
    >
      <CardBG />

      {/* header */}
      <header className="relative">
        <div className="inline-flex items-center gap-2 text-[12px] text-primary">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-semibold">Client Referral</span>
        </div>
        <h2
          id={titleId}
          className="mt-1.5 text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-50"
        >
          Introduce a friend or family member
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Share basic details below. We’ll contact them discreetly, mention your
          name, and keep you updated.
        </p>
      </header>

      {/* form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="relative mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {/* Your details */}
        <div className="md:col-span-2 mt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Your details
          </p>
        </div>

        <Field
          id="referrer-name"
          name="referrerName"
          label="Your full name"
          icon={<FiUser />}
          placeholder="Jane Doe"
          onBlur={() => markTouched("referrerName")}
          invalid={!!errors.referrerName}
          help={errors.referrerName}
          required
          autoComplete="name"
        />

        <Field
          id="referrer-email"
          name="referrerEmail"
          label="Your email"
          icon={<FiMail />}
          placeholder="you@example.com"
          type="email"
          onBlur={() => markTouched("referrerEmail")}
          invalid={!!errors.referrerEmail}
          help={errors.referrerEmail}
          required
          autoComplete="email"
        />

        <Field
          id="referrer-phone"
          name="referrerPhone"
          label="Your phone (optional)"
          icon={<FiPhone />}
          placeholder="+91 99860 72700"
          onBlur={() => markTouched("referrerPhone")}
          invalid={!!errors.referrerPhone}
          help={errors.referrerPhone || "Digits, +, -, () are ok."}
          inputMode="tel"
          pattern="[0-9+\\-()\\s]{7,}"
          autoComplete="tel"
          className="md:col-span-2"
        />

        <Field
          id="referrer-client-id"
          name="referrerClientId"
          label="Your client ID / case no. (optional)"
          placeholder="If you are an existing client"
          onBlur={() => markTouched("referrerClientId")}
          invalid={!!errors.referrerClientId}
          help={errors.referrerClientId}
          className="md:col-span-2"
        />

        {/* Friend details */}
        <div className="md:col-span-2 mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Friend / family details
          </p>
        </div>

        <Field
          id="friend-name"
          name="friendName"
          label="Friend’s full name"
          icon={<FiUser />}
          placeholder="Friend’s name"
          onBlur={() => markTouched("friendName")}
          invalid={!!errors.friendName}
          help={errors.friendName}
          required
          autoComplete="off"
        />

        <Field
          id="friend-email"
          name="friendEmail"
          label="Friend’s email"
          icon={<FiMail />}
          placeholder="friend@example.com"
          type="email"
          onBlur={() => markTouched("friendEmail")}
          invalid={!!errors.friendEmail}
          help={errors.friendEmail}
          required
        />

        <Field
          id="friend-phone"
          name="friendPhone"
          label="Friend’s phone (optional)"
          icon={<FiPhone />}
          placeholder="+971 5x xxx xxxx"
          onBlur={() => markTouched("friendPhone")}
          invalid={!!errors.friendPhone}
          help={errors.friendPhone || "Digits, +, -, () are ok."}
          inputMode="tel"
          pattern="[0-9+\\-()\\s]{7,}"
        />

        <Field
          id="friend-country"
          name="friendCountry"
          label="Country interested in"
          icon={<FiGlobe />}
          placeholder="Canada, Australia, UAE, etc."
          onBlur={() => markTouched("friendCountry")}
          invalid={!!errors.friendCountry}
          help={errors.friendCountry}
        />

        <Textarea
          id="notes"
          name="notes"
          label="Anything we should know? (optional)"
          icon={<FiMessageSquare />}
          placeholder="Briefly describe their plan, timeline, or any special notes…"
          onBlur={() => markTouched("notes")}
          onInput={(len) => setNotesLen(len)}
          invalid={!!errors.notes}
          help={errors.notes || `${notesLen}/800`}
          rows={4}
          maxLength={800}
          className="md:col-span-2"
        />

        <label className="md:col-span-2 flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="consent"
            value="yes"
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary focus:ring-2 focus:ring-primary"
          />
          I confirm I have permission to share these details and understand that
          XIPHIAS will contact my referral about immigration services only.
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold",
              "bg-primary text-white hover:brightness-110",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "transition-all",
            ].join(" ")}
          >
            {loading ? (
              <>
                <Loader />
                <span>Submitting referral…</span>
              </>
            ) : (
              "Submit referral"
            )}
          </button>
          <p className="mt-2 text-[11px] sm:text-[12px] text-neutral-600 dark:text-neutral-400">
            We treat all referrals with strict confidentiality. By submitting,
            you accept our{" "}
            <a href="/privacy-policy" className="underline text-primary">
              privacy policy
            </a>
            .
          </p>
        </div>
      </form>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Client Referral",
            description:
              "Existing clients can refer friends and family to XIPHIAS Immigration via a simple online form.",
          }),
        }}
      />
    </section>
  );
}

/* ---------- sub components ---------- */

function Field({
  id,
  name,
  label,
  icon,
  placeholder,
  help,
  invalid,
  required,
  defaultValue,
  type = "text",
  className = "",
  inputMode,
  pattern,
  autoComplete,
  onBlur,
}: {
  id: string;
  name: string;
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  help?: string;
  invalid?: boolean;
  required?: boolean;
  defaultValue?: string;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  autoComplete?: string;
  onBlur?: () => void;
}) {
  return (
    <div className={["relative", className].join(" ")}>
      <div className="relative">
        {icon ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          name={name}
          type={type}
          placeholder=" "
          aria-invalid={invalid || undefined}
          required={required}
          defaultValue={defaultValue}
          inputMode={inputMode}
          pattern={pattern}
          autoComplete={autoComplete}
          onBlur={onBlur}
          className={[
            "peer w-full rounded-xl bg-white dark:bg-neutral-950",
            "ring-1 ring-neutral-300 dark:ring-neutral-700",
            "px-10 py-3 text-sm text-neutral-900 dark:text-neutral-50",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "placeholder-transparent",
            invalid ? "ring-red-400 focus:ring-red-500" : "",
          ].join(" ")}
        />

        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-10 bg-white dark:bg-neutral-950 px-1 rounded",
            "text-neutral-500 dark:text-neutral-400 transition-all z-10",
            "opacity-0 top-2 translate-y-0 text-[12px]",
            "peer-placeholder-shown:opacity-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
          ].join(" ")}
        >
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
      </div>

      {help ? (
        <p
          className={[
            "mt-1 text-[11px] sm:text-[12px]",
            invalid
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400",
          ].join(" ")}
          role={invalid ? "alert" : undefined}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

function Textarea({
  id,
  name,
  label,
  icon,
  placeholder,
  help,
  invalid,
  required,
  defaultValue,
  rows = 4,
  className = "",
  onBlur,
  onInput,
  maxLength,
}: {
  id: string;
  name: string;
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  help?: string;
  invalid?: boolean;
  required?: boolean;
  defaultValue?: string;
  rows?: number;
  className?: string;
  onBlur?: () => void;
  onInput?: (length: number) => void;
  maxLength?: number;
}) {
  return (
    <div className={["relative", className].join(" ")}>
      <div className="relative">
        {icon ? (
          <span
            className="pointer-events-none absolute left-3 top-3 text-neutral-400 dark:text-neutral-500"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}

        <textarea
          id={id}
          name={name}
          placeholder=" "
          aria-invalid={invalid || undefined}
          required={required}
          defaultValue={defaultValue}
          rows={rows}
          maxLength={maxLength}
          onBlur={onBlur}
          onInput={(e) =>
            onInput?.((e.target as HTMLTextAreaElement).value.length)
          }
          className={[
            "peer w-full rounded-xl bg-white dark:bg-neutral-950",
            "ring-1 ring-neutral-300 dark:ring-neutral-700",
            "px-10 py-3 text-sm text-neutral-900 dark:text-neutral-50",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "resize-y placeholder-transparent",
            invalid ? "ring-red-400 focus:ring-red-500" : "",
          ].join(" ")}
        />

        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-10 bg-white dark:bg-neutral-950 px-1 rounded",
            "text-neutral-500 dark:text-neutral-400 transition-all z-10",
            "opacity-0 top-2 translate-y-0 text-[12px]",
            "peer-placeholder-shown:opacity-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm",
          ].join(" ")}
        >
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
      </div>

      {help ? (
        <p
          className={[
            "mt-1 text-[11px] sm:text-[12px]",
            invalid
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400",
          ].join(" ")}
          role={invalid ? "alert" : undefined}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

function CardBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.07]">
        <defs>
          <pattern
            id="grid-referral"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-referral)"
          className="text-primary"
        />
      </svg>
    </div>
  );
}