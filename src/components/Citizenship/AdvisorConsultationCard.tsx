"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/* --------------------------------- Props --------------------------------- */
type Props = {
  // Person
  advisorName?: string;
  role?: string;
  avatarSrc?: string;
  credentials?: string;
  languages?: string;
  timezone?: string;

  // Copy
  title?: string;
  subtitle?: string;

  // Social proof
  rating?: number;           // 4.9
  reviewsCount?: number;     // 312
  clientsServed?: number;    // 1200

  // Highlights list (bullets on the left)
  highlights?: string[];

  // Pricing
  priceAmount?: number;      // 25500
  currency?: "INR" | "USD" | "AED" | "EUR";
  durationLabel?: string;    // "90 mins (in-depth)"
  demandHint?: string;       // "High demand this week"

  // CTA
  bookingHref?: string;      // navigates if onBookAction not provided
  onBookAction?: (args?: { plan?: "free" | "paid" }) => void; // Next 15-safe name

  // Optional second action
  brochureUrl?: string;

  // Notes
  paymentNote?: string;
  guaranteeNote?: string;
  complianceNote?: string;

  className?: string;
};

/* --------------------------------- Utils --------------------------------- */
function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}
function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

/* -------------------------------- Component ------------------------------- */
export default function AdvisorConsultationCard({
  advisorName = "Varun Singh",
  role = "Global CBI & RBI Specialist",
  avatarSrc = "/images/avtar/varun-singh.png",
  credentials = "Fellow (FIMC) & Certified Investment Migration Consultant (Cert IM)",
  languages = "English • Hindi",
  timezone = "Gulf / IST friendly",

  title = "Talk to a senior CBI advisor",
  subtitle = "Book a confidential, paid consultation to understand your eligibility, timelines, investment routes, and the best-fit programs for your long-term global goals.",

  rating = 4.9,
  reviewsCount = 312,
  clientsServed = 1200,

  highlights = [
    "IMC Fellow–led advisory focused on ethics, compliance, and clear ROI insights.",
    "Expert guidance on the source of funds, risk assessment, and program selection.",
    "Accurate country comparisons with updated policies and complete documentation support.",
  ],

  priceAmount = 25000,
  currency = "INR",
  durationLabel = "60 mins",
  demandHint = "High demand this week",

  bookingHref = "/booking?plan=paid",
  onBookAction,
  brochureUrl,

  paymentNote = "UPI • Cards • Bank Wire",
  guaranteeNote = "If we can’t help, we’ll say so — no upsell.",
  complianceNote = "Advisory only; not legal/financial advice. Subject to KYC & eligibility.",

  className = "",
}: Props) {
  const priceDisplay = money(priceAmount, currency);

  return (
    <section
      aria-labelledby="advisor-card-title"
      className={cx(
        "relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8",
        // gradient like your HeroPremium
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        "text-black dark:text-white",
        "mx-auto max-w-screen-2xl px-4 py-5",
        className
      )}
    >
      {/* subtle background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-30 dark:opacity-15 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      {/* top stripe */}
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2 ring-1 ring-blue-100/70 dark:bg-white/5 dark:ring-blue-900/40">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-800 dark:text-zinc-100">
          <BadgeDollar className="h-4 w-4" />
          <span>Paid 1:1 consultation</span>
          <Dot />
          <span>{durationLabel}</span>
          <Dot />
          <strong>{priceDisplay}</strong>
        </div>
        <span className="text-[12px] text-emerald-700 dark:text-emerald-300">{demandHint}</span>
      </div>

      {/* body layout: fills width on desktop, stacks on mobile */}
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        {/* LEFT */}
        <div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full ring-2 ring-blue-500/10 ring-offset-2 ring-offset-white dark:ring-offset-transparent">
              <Image src={avatarSrc} alt={advisorName} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 id="advisor-card-title" className="text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{subtitle}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {advisorName} — {role}
              </p>
            </div>
          </div>

          {/* chips */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Chip icon={<BadgeId className="h-3.5 w-3.5" />}>{credentials}</Chip>
            <Chip icon={<GlobeIcon className="h-3.5 w-3.5" />}>{languages}</Chip>
            <Chip icon={<ClockIcon className="h-3.5 w-3.5" />}>{timezone}</Chip>
            <Chip tone="success" icon={<StarIcon className="h-3.5 w-3.5" />}>
              {rating.toFixed(1)} · {reviewsCount.toLocaleString()} reviews
            </Chip>
            <Chip icon={<UsersIcon className="h-3.5 w-3.5" />}>
              {clientsServed.toLocaleString()}+ clients served
            </Chip>
            <Chip icon={<ShieldIcon className="h-3.5 w-3.5" />}>Confidential & secured</Chip>
          </div>

          {/* bullets */}
          <ul className="mt-5 grid gap-2 text-sm text-zinc-800 dark:text-zinc-200 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <DotSmall />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* trust row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1">
              <LockIcon className="h-3.5 w-3.5" /> Secure checkout
            </span>
            <span className="inline-flex items-center gap-1">
              <PrivacyIcon className="h-3.5 w-3.5" /> Confidential
            </span>
            <span className="inline-flex items-center gap-1">
              <CreditCardIcon className="h-3.5 w-3.5" /> {paymentNote}
            </span>
          </div>
          {guaranteeNote && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{guaranteeNote}</p>
          )}
        </div>

        {/* RIGHT: compact CTA panel (prevents empty right space) */}
        <aside className="rounded-2xl bg-white/85 p-4 ring-1 ring-blue-100/70 dark:bg-white/5 dark:ring-blue-900/40">
          <div className="text-sm text-zinc-800 dark:text-zinc-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Consultation</span>
              <span className="text-zinc-500">{durationLabel}</span>
            </div>
            <div className="mt-1 text-2xl font-semibold">{priceDisplay}</div>
          </div>

          <Link
            href={bookingHref}
            prefetch={false}
            onClick={(e) => {
              if (onBookAction) {
                e.preventDefault();
                onBookAction({ plan: "paid" });
              }
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Book paid consultation"
          >
            Book paid consultation
            <ArrowRight />
          </Link>

          {brochureUrl && (
            <a
              href={brochureUrl}
              download
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
            >
              <Download /> Expert Overview
            </a>
          )}
        </aside>
      </div>

      {complianceNote && (
        <p className="relative mt-5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {complianceNote}
        </p>
      )}
    </section>
  );
}

/* ---------------------------- Small UI helpers ---------------------------- */
function Chip({
  children,
  icon,
  tone = "neutral",
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "neutral" | "success";
}) {
  const base = "inline-flex items-center gap-1 rounded-full ring-1 px-2.5 py-1";
  const styles =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800"
      : "bg-white/80 text-zinc-800 ring-blue-100/80 dark:bg-white/5 dark:text-zinc-200 dark:ring-blue-900/40";
  return <span className={cx(base, styles)}>{icon}{children}</span>;
}
function Dot() { return <span className="mx-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />; }
function DotSmall() { return <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />; }

/* ------------------------------- Inline Icons ---------------------------- */
function BadgeDollar({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 1a1 1 0 011 1v1.07c2.28.2 4 1.6 4 3.43 0 1.97-1.76 3.05-4.36 3.47L10 10.2V13h3a1 1 0 110 2h-3v2.06c2.47.17 4 .97 4 2.44 0 1.64-1.84 2.76-4.25 2.89V22a1 1 0 11-2 0v-1.62c-2.28-.2-4-1.6-4-3.43 0-1.97 1.76-3.05 4.36-3.47L12 13.8V11H9a1 1 0 110-2h3V6.94c-2.47-.17-4-.97-4-2.44 0-1.64 1.84-2.76 4.25-2.89V2a1 1 0 011-1z"/></svg>;
}
function StarIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden><path d="M10 1.5l2.472 5.007 5.528.804-4 3.896.944 5.506L10 13.99 5.056 16.713 6 11.207l-4-3.896 5.528-.804L10 1.5z"/></svg>;
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z"/></svg>;
}
function UsersIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M16 11c1.66 0 2.99-1.79 2.99-4S17.66 3 16 3s-3 1.79-3 4 1.34 4 3 4zm-8 0c1.66 0 3-1.79 3-4S9.66 3 8 3 5 4.79 5 7s1.34 4 3 4zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
function ClockIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.5a.75.75 0 10-1.5 0v4.25c0 .2.08.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6.5z"/></svg>;
}
function CalendarIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM18 9H2v7a2 2 0 002 2h12a2 2 0 002-2V9z"/></svg>;
}
function Download({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className ?? "h-4 w-4"}>
      <path
        fill="currentColor"
        d="M12 3.75a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L6.97 11.03a.75.75 0 0 1 1.06-1.06l2.72 2.72V4.5A.75.75 0 0 1 12 3.75zM4.5 18a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2a.75.75 0 0 1 1.5 0v2A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3v-2a.75.75 0 0 1 1.5 0v2z"
      />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function PrivacyIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 2l8 4v6c0 5.5-3.9 10.7-8 12-4.1-1.3-8-6.5-8-12V6l8-4zm0 6a4 4 0 00-4 4v3h8v-3a4 4 0 00-4-4z"/></svg>;
}
function CreditCardIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v2H2V6zm0 4h20v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8zm3 5h6a1 1 0 010 2H5a1 1 0 010-2z"/></svg>;
}
function LockIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden><path d="M5 9V7a5 5 0 1110 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7a1 1 0 011-1h2zm2-2v2h6V7a3 3 0 10-6 0z"/></svg>;
}
function BadgeId({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M7 2h10v2h3a1 1 0 011 1v15a2 2 0 01-2 2H5a2 2 0 01-2-2V5a1 1 0 011-1h3V2zm2 0v2h6V2H9zm-3 6h12v10H6V8zm2 2v2h4v-2H8zm0 3v2h6v-2H8z"/></svg>;
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm5.93 7H15.8c-.27-2.02-1.04-3.73-2.01-4.66A8.03 8.03 0 0117.93 9zM12 4.07C10.1 5.86 8.88 8.84 8.7 11h6.6c-.18 2.16-1.4 5.14-3.3 6.93A8.01 8.01 0 0112 4.07zM6.07 11h2.13c.27-2.02 1.04-3.73 2.01-4.66A8.03 8.03 0 006.07 11zm0 2a8.03 8.03 0 004.14 4.66c-.97-.93-1.74-2.64-2.01-4.66H6.07zM12 19.93c1.9-1.79 3.12-4.77 3.3-6.93H8.7c.18 2.16 1.4 5.14 3.3 6.93zM17.93 13a8.03 8.03 0 01-4.14 4.66c.97-.93 1.74-2.64 2.01-4.66h2.13z" />
    </svg>
  );
}
