"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Clock, Users, Globe,
  CheckCircle2, User, Mail, Phone, FileSearch,
} from "lucide-react";

const STATS = [
  { value: "17+",  label: "Years of Excellence" },
  { value: "50+",  label: "Countries Covered" },
  { value: "10K+", label: "Families Relocated" },
  { value: "98%",  label: "Visa Success Rate" },
];

const TRUST = [
  "No spam — ever",
  "Free consultation",
  "Response within 24 hrs",
];

export default function Hero() {
  const [form, setForm]     = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/platform/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          source: "website",
          page: "hero",
          consent: true,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  /* Shared class for each input field wrapper (label) */
  const fieldCls = [
    "relative flex flex-1 min-w-0 items-center gap-2.5 px-4 py-3.5",
    "transition-colors duration-150 cursor-text",
    /* subtle separator — only a thin right line on desktop */
    "sm:[&:not(:last-of-type)]:border-r sm:[&:not(:last-of-type)]:border-white/10",
    "border-b border-white/10 sm:border-b-0",
    /* gold bottom accent that slides in on focus — our custom indicator */
    "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:rounded-full",
    "after:bg-secondary after:scale-x-0 focus-within:after:scale-x-100",
    "after:transition-transform after:duration-250 after:ease-out after:origin-center",
  ].join(" ");

  /* Inline style applied to every <input> — forces outline: none across all browsers */
  const inputStyle: React.CSSProperties = {
    outline: "none",
    boxShadow: "none",
    WebkitAppearance: "none",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <section
      id="main-banner"
      aria-labelledby="home-hero-title"
      className="relative isolate z-0 overflow-hidden min-h-[100svh] flex flex-col items-center justify-center"
    >
      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt="Immigration consultants helping clients with global visas"
          fill priority fetchPriority="high"
          className="object-cover object-center scale-[1.03]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b2a6b]/90 via-[#0f3a8a]/80 to-[#1c57b4]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,255,255,0.04),transparent)]" />
      </div>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/30 blur-[100px]" />

      {/* ── Content ── */}
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 flex flex-col items-center text-center pt-36 pb-24">

        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
          India&apos;s Most Trusted Immigration Consultancy
        </div>

        {/* Headline */}
        <h1
          id="home-hero-title"
          className="mx-auto max-w-4xl font-bold leading-[1.1] tracking-tight text-white"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.25rem)" }}
        >
          Your Gateway to Global{" "}
          <span className="relative whitespace-nowrap text-secondary">
            Residency
            <svg aria-hidden className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
              <path d="M2 6 C80 2, 220 2, 298 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>{" "}
          &amp; Citizenship
        </h1>

        {/* Subheadline */}
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
          Expert advisory across Residency by Investment, Citizenship by Investment,
          Skilled Migration &amp; Corporate Mobility — 50+ countries, one trusted partner.
        </p>

        {/* Stats strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-secondary leading-none">{value}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/55">{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-10 w-16 border-t border-white/20" />

        {/* ── Quick Contact Form ── */}
        <div className="mt-8 w-full max-w-3xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/45">
            Get a free consultation
          </p>

          {status === "done" ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 px-8 py-6">
              <CheckCircle2 className="h-10 w-10 text-secondary" />
              <p className="text-[15px] font-semibold text-white">Thank you! We&apos;ll reach out within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col overflow-hidden rounded-2xl border border-secondary/40 bg-white/[0.08] shadow-[0_4px_32px_rgba(225,185,35,0.15),0_8px_40px_rgba(0,0,0,0.35)] sm:flex-row"
            >
              {/* Name field */}
              <label className={fieldCls}>
                <User className="h-4 w-4 text-secondary/60 shrink-0" />
                <input
                  required name="name" type="text" autoComplete="name"
                  placeholder="Full Name"
                  value={form.name} onChange={handleChange}
                  className="flex-1 min-w-0 bg-transparent text-[14px] text-white placeholder-white/40"
                  style={inputStyle}
                />
              </label>

              {/* Email field */}
              <label className={fieldCls}>
                <Mail className="h-4 w-4 text-secondary/60 shrink-0" />
                <input
                  required name="email" type="email" autoComplete="email"
                  placeholder="Email Address"
                  value={form.email} onChange={handleChange}
                  className="flex-1 min-w-0 bg-transparent text-[14px] text-white placeholder-white/40"
                  style={inputStyle}
                />
              </label>

              {/* Phone field */}
              <label className={fieldCls}>
                <Phone className="h-4 w-4 text-secondary/60 shrink-0" />
                <input
                  required name="phone" type="tel" autoComplete="tel"
                  placeholder="Phone Number"
                  value={form.phone} onChange={handleChange}
                  className="flex-1 min-w-0 bg-transparent text-[14px] text-white placeholder-white/40"
                  style={inputStyle}
                />
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="group/btn shrink-0 relative inline-flex items-center justify-center gap-2 overflow-hidden bg-secondary px-6 py-3.5 text-[13.5px] font-bold text-primary transition-colors hover:bg-[#f0cb3b] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {/* Shimmer sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:translate-x-full transition-transform duration-500 ease-in-out" />
                {status === "sending" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                ) : (
                  <>
                    <span className="relative">Get Free Consultation</span>
                    <ArrowRight className="relative h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust signals */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary/80 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Secondary CTAs ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

          {/* Check Your Eligibility — primary ghost pill */}
          <Link
            href="/eligibility"
            className="group inline-flex items-center gap-2.5 rounded-full border border-secondary/50 bg-secondary/10 px-6 py-2.5 text-[13.5px] font-semibold text-secondary backdrop-blur-sm hover:bg-secondary hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
          >
            <FileSearch className="h-4 w-4 shrink-0" />
            Check Your Eligibility
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* Download Guide */}
          <Link
            href="/images/residency/xiphias-corporate-mobility.pdf"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-[13.5px] font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Clock className="h-4 w-4 text-secondary shrink-0" />
            Download Guide
          </Link>
        </div>
      </div>

      {/* ── Mouse scroll cue ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none">
        <div className="relative flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/35 pt-1.5">
          <span className="h-1.5 w-1 rounded-full bg-white/60 animate-[scrollDot_1.8s_ease-in-out_infinite]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">Scroll</span>
      </div>

      <style>{`
        @keyframes scrollDot {
          0%   { opacity: 1; transform: translateY(0); }
          60%  { opacity: 0; transform: translateY(10px); }
          61%  { opacity: 0; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
