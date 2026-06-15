"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/* ──────────────────────────── Props ──────────────────────────── */
type Props = {
  advisorName?: string;
  role?: string;
  avatarSrc?: string;
  languages?: string;
  timezone?: string;
  title?: string;
  subtitle?: string;
  rating?: number;
  reviewsCount?: number;
  clientsServed?: number;
  highlights?: string[];
  includes?: string[];
  priceAmount?: number;
  currency?: "INR" | "USD" | "AED" | "EUR";
  durationLabel?: string;
  demandHint?: string;
  bookingHref?: string;
  onBookAction?: (args?: { plan?: "free" | "paid" }) => void;
  brochureUrl?: string;
  paymentNote?: string;
  guaranteeNote?: string;
  complianceNote?: string;
  className?: string;
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}
function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

/* ──────────────────────────── Component ──────────────────────────── */
export default function AdvisorConsultationCard({
  advisorName = "Varun Singh",
  role = "Global CBI & RBI Specialist",
  avatarSrc = "/images/avtar/varun-singh.png",
  languages = "English • Hindi",
  timezone = "Gulf / IST friendly",
  title = "Talk to a Senior CBI-RBI Advisor",
  subtitle = "A confidential, structured session to map your eligibility, investment routes, and the best-fit program for your goals.",
  rating = 4.9,
  reviewsCount = 312,
  clientsServed = 1200,
  highlights = [
    "IMC Fellow-led — ethics-first, compliance-grade.",
    "Source-of-funds review & program selection.",
    "Live country comparisons with updated policy data.",
    "For HNWIs, executives & multi-gen families.",
  ],
  includes = [
    "60-min structured 1:1 advisory",
    "Eligibility & program fit mapping",
    "Investment route & fund-source analysis",
    "Post-session written summary note",
  ],
  priceAmount = 25000,
  currency = "INR",
  durationLabel = "60 mins",
  demandHint = "High demand this week",
  bookingHref = "/booking?plan=paid",
  onBookAction,
  brochureUrl,
  paymentNote = "UPI • Cards • Bank Wire",
  guaranteeNote = "If we can't help, we'll say so — no upsell.",
  complianceNote = "Advisory only; not legal/financial advice. Subject to KYC & eligibility.",
  className = "",
}: Props) {
  const priceDisplay = money(priceAmount, currency);

  return (
    <section
      aria-labelledby="advisor-card-title"
      className={cx(
        "relative grid overflow-hidden rounded-2xl text-white",
        "grid-cols-1 lg:grid-cols-3",
        className,
      )}
    >
      {/* Gold hairline — spans all columns */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-[#e1b923] to-transparent" />

      {/* ══════════════════════════════════════
           COL 1 — Advisor portrait
          ══════════════════════════════════════ */}
      <div className="relative h-72 lg:h-auto">
        <Image
          src={avatarSrc}
          alt={advisorName}
          fill
          sizes="(max-width:1024px) 100vw, 33vw"
          className="object-cover object-[center_15%]"
          priority
        />
        {/* Dark scrim at bottom for text readability only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Available badge */}
        <div className="absolute left-3 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[9.5px] font-semibold text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Available now
        </div>

        {/* Name / role / rating — overlaid on photo */}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="text-[14px] font-bold leading-tight text-white">{advisorName}</p>
          <p className="mt-0.5 text-[10.5px] text-white/60">{role}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#e1b923]">★ {rating.toFixed(1)}</span>
            <span className="text-[9.5px] text-white/45">{reviewsCount}+ reviews · {clientsServed.toLocaleString()}+ clients</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
           COL 2 — Advisory info
          ══════════════════════════════════════ */}
      <div className="relative flex flex-col gap-3 overflow-hidden bg-[#1c57b4] p-4 sm:p-5">
        {/* Dot texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "20px 20px" }}
        />
        {/* Globe wireframe */}
        <svg
          aria-hidden
          viewBox="0 0 240 240"
          className="pointer-events-none absolute -right-3 -top-3 h-36 w-36 opacity-[0.08] sm:h-44 sm:w-44"
          fill="none"
          stroke="white"
          strokeWidth="0.6"
        >
          <circle cx="120" cy="120" r="100" />
          <ellipse cx="120" cy="120" rx="50" ry="100" />
          <ellipse cx="120" cy="120" rx="100" ry="36" />
          <ellipse cx="120" cy="120" rx="100" ry="68" />
          <line x1="20" y1="120" x2="220" y2="120" />
          <line x1="120" y1="20" x2="120" y2="220" />
        </svg>

        {/* Eyebrow + demand */}
        <div className="relative flex items-center justify-between gap-2">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#e1b923]/65">
            XIPHIAS Immigration · Premium Advisory
          </p>
          <span className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {demandHint}
          </span>
        </div>

        {/* Title + subtitle */}
        <div className="relative">
          <h3
            id="advisor-card-title"
            className="text-[1.3rem] font-black leading-[1.15] text-white sm:text-[1.5rem]"
          >
            {title}
          </h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
            {subtitle}
          </p>
        </div>

        {/* Credentials + verified memberships */}
        <div className="relative rounded-xl border border-white/[0.12] bg-white/[0.07] p-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#e1b923]/22 bg-[#e1b923]/10 px-2 py-0.5 text-[9.5px] font-bold text-[#e1b923]/80">
              <BadgeIcon className="h-2.5 w-2.5 shrink-0" />
              FIMC · Cert IM
            </span>
            <span className="text-[10.5px] text-white/40">
              {clientsServed.toLocaleString()}+ clients
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.07] pt-1.5">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Verified</span>
            <a
              href="https://investmentmigration.org/fellow-members-directory/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[9px] text-white/50 transition hover:bg-white/[0.15]"
            >
              <Image src="/images/personal/credentials/imc-fellow-logo.svg" alt="IMC" width={34} height={9} className="h-[9px] w-auto brightness-0 invert opacity-65" />
              <span>Fellow Directory</span>
              <ExternalLinkIcon className="h-2 w-2 text-white/28" />
            </a>
            <a
              href="https://www.imidaily.com/imi-professionals/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[9px] text-white/50 transition hover:bg-white/[0.15]"
            >
              <Image src="/images/personal/credentials/imi-professionals-logo.png" alt="IMI" width={22} height={9} className="h-[9px] w-auto brightness-0 invert opacity-65" />
              <span>IMI Professionals</span>
              <ExternalLinkIcon className="h-2 w-2 text-white/28" />
            </a>
          </div>
        </div>

        {/* Features 2 × 2 */}
        <div className="relative grid grid-cols-2 gap-x-3 gap-y-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-[2px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-white/[0.12] ring-1 ring-[#e1b923]/30">
                <CheckIcon className="h-2.5 w-2.5 text-[#e1b923]" />
              </span>
              <span className="text-[11.5px] leading-snug text-white/62">{h}</span>
            </div>
          ))}
        </div>

        {/* Meta chips */}
        <div className="relative flex flex-wrap gap-1.5">
          <MetaChip icon={<GlobeIcon className="h-3 w-3" />}>{languages}</MetaChip>
          <MetaChip icon={<ClockIcon className="h-3 w-3" />}>{timezone}</MetaChip>
          <MetaChip icon={<ShieldIcon className="h-3 w-3" />}>Confidential</MetaChip>
          <MetaChip icon={<CreditCardIcon className="h-3 w-3" />}>{paymentNote}</MetaChip>
        </div>

        {/* Compliance */}
        {complianceNote && (
          <p className="relative text-[9px] leading-relaxed text-white/22">{complianceNote}</p>
        )}
      </div>

      {/* ══════════════════════════════════════
           COL 3 — Booking panel
          ══════════════════════════════════════ */}
      <div className="relative flex flex-col bg-[#1551a0] p-5 sm:p-6">
        {/* Thin left border (desktop) */}
        <div className="absolute inset-y-0 left-0 hidden w-px bg-white/10 lg:block" />

        <p className="mb-3 text-[8.5px] font-black uppercase tracking-[0.22em] text-white/38">
          Paid Consultation
        </p>

        {/* Price */}
        <div className="mb-3">
          <div className="text-[1.9rem] font-black leading-none text-white sm:text-[2.1rem]">
            {priceDisplay}
          </div>
          <div className="mt-0.5 text-[9.5px] text-white/40">
            {durationLabel} · All-inclusive
          </div>
        </div>

        <div className="mb-3 h-px bg-white/10" />

        {/* What's included */}
        <p className="mb-2 text-[8.5px] font-black uppercase tracking-widest text-white/35">
          What's Included
        </p>
        <ul className="mb-4 space-y-1.5">
          {includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[11px] text-white/58">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#e1b923]/65" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA — pushed to bottom */}
        <Link
          href={bookingHref}
          prefetch={false}
          onClick={(e) => {
            if (onBookAction) { e.preventDefault(); onBookAction({ plan: "paid" }); }
          }}
          className="group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 py-3 text-[13px] font-black text-[#1551a0] shadow-[0_3px_18px_rgba(225,185,35,0.28)] transition-all hover:bg-[#f0cb3b] hover:shadow-[0_5px_26px_rgba(225,185,35,0.44)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1b923] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1551a0]"
          aria-label="Book paid consultation"
        >
          Book Consultation
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {brochureUrl && (
          <a href={brochureUrl} download className="mt-2 text-center text-[9.5px] text-white/32 underline underline-offset-2 hover:text-white/55">
            Download overview
          </a>
        )}

        {guaranteeNote && (
          <p className="mt-2.5 text-center text-[9.5px] italic text-white/28">"{guaranteeNote}"</p>
        )}
      </div>
    </section>
  );
}

/* ──────────────────── Sub-components ──────────────────── */
function MetaChip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/48">
      {icon}
      {children}
    </span>
  );
}

/* ──────────────────── Icons ──────────────────── */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
function CheckMiniIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
      <polyline points="1.5,5 4,7.5 8.5,2.5" />
    </svg>
  );
}
// CheckMiniIcon kept for potential future use
void CheckMiniIcon;
function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l2.4 4.8 5.3.8-3.85 3.75.9 5.3L12 14.25l-4.75 2.4.9-5.3L4.3 7.6l5.3-.8z" />
    </svg>
  );
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 17.93V18a1 1 0 00-1-1H8v-2a2 2 0 00-2-2H4.07A8.01 8.01 0 014 12c0-.34.02-.67.07-1H6a2 2 0 002-2V8l2-2V4.07A7.97 7.97 0 0112 4c.34 0 .67.02 1 .07V6h-1a1 1 0 00-1 1v1l2 2 1-1h1.93A8.01 8.01 0 0116 12v1h-3v1l2 2v2.93A7.97 7.97 0 0111 19.93z" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.5a.75.75 0 10-1.5 0v4.25c0 .2.08.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6.5z" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" />
    </svg>
  );
}
function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v2H2V6zm0 4h20v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8z" />
    </svg>
  );
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5 12.75h11.19l-3.72 3.72a.75.75 0 101.06 1.06l5.25-5.25a.75.75 0 000-1.06L13.53 5.97a.75.75 0 10-1.06 1.06l3.72 3.72H5a.75.75 0 000 1.5z" />
    </svg>
  );
}
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
