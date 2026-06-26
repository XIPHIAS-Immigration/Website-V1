"use client";

import Link from "next/link";
import * as React from "react";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Track, Result, AnswerMap } from "@/lib/eligibility/types";
import { trackEvent } from "@/lib/eligibility/analytics";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";

type Props = {
  track: Track;
  result: Result;
  name: string;
  email?: string;
  phone?: string;
  answers: AnswerMap;
  /** Server-Action-safe handler to satisfy Next rule */
  onBackAction?: () => void | Promise<void>;
};

const SPRING = { type: "spring", stiffness: 340, damping: 32, mass: 0.72 };
const DETAILED_REPORT_PRICE_INR = process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PRICE_INR || "10000";
const DETAILED_REPORT_PAYMENT_URL = process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PAYMENT_URL || TOPMATE_REGISTRATION_URL;

function formatInr(value: string) {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return `INR ${value}`;
  return `INR ${numeric.toLocaleString("en-IN")}`;
}

export function ResultCard({ track, result, name, email, phone, answers, onBackAction }: Props) {
  const reduceMotion = useReducedMotion();
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const detailedReportPrice = useMemo(() => formatInr(DETAILED_REPORT_PRICE_INR), []);

  // Guard: ensure shape is always safe to render
  const safeResult: Result = {
    tier: result?.tier ?? "Borderline",
    summary: result?.summary ?? "We could not render the full summary. You can still download the preview PDF or talk to an expert.",
    programs: Array.isArray(result?.programs) ? result.programs : [],
    confidence: result?.confidence,
    criteria: result?.criteria,
    sources: result?.sources,
    handoffRequired: result?.handoffRequired,
    countryFocus: result?.countryFocus,
  };

  const whatsappLink = useMemo(() => {
    const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
    if (!num) return null;
    const text = encodeURIComponent(
      `Hi! I just checked my ${track} eligibility. Name: ${name || "-"}`
    );
    return `https://wa.me/${num}?text=${text}`;
  }, [track, name]);

  const handleDownload = async () => {
    try {
      setStatus("Preparing your preview PDF...");
      setDownloading(true);
      const res = await fetch("/api/eligibility/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, track, answers }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `XIPHIAS_Assessment_Preview_${track}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      trackEvent("pdf_download", { track });
      setStatus("Download started.");
    } catch {
      setStatus("Sorry - could not generate the preview PDF. Please try again.");
    } finally {
      setDownloading(false);
      // auto-clear the status after a moment
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const recordDetailedReportIntent = () => {
    trackEvent("detailed_report_cta_click", { track });
    const payload = JSON.stringify({
      source: "registration",
      name,
      email,
      phone,
      track,
      country: safeResult.countryFocus,
      program: safeResult.programs?.[0]?.name,
      message: "Clicked INR 10,000 detailed report registration CTA.",
      page: typeof window !== "undefined" ? window.location.pathname : "/eligibility",
      tags: ["detailed-report-intent", "topmate-registration"],
      consent: true,
    });

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/platform/lead", blob);
      return;
    }

    void fetch("/api/platform/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  };

  const programs = safeResult.programs;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? undefined : SPRING}
      className={[
        "rounded-2xl",
        "bg-white text-black dark:bg-black dark:text-white",
        "ring-1 ring-black/10 dark:ring-white/10",
        "p-4 sm:p-5 md:p-6",
      ].join(" ")}
      aria-labelledby="result-title"
    >
      {/* Top bar */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
            Free assessment preview
          </p>
          <h3 id="result-title" className="mt-1 text-lg sm:text-xl md:text-2xl font-semibold">
            Your XIPHIAS route direction
          </h3>
        </div>
        {onBackAction ? (
          <button
            type="button"
            onClick={onBackAction}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/15 dark:hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Go back"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M7.5 2.5L4 6l3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        ) : null}
      </div>

      {/* Summary stripe */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ring-1 ring-black/10 dark:ring-white/15">
          <BadgeDot /> {capitalize(track)}
        </span>
        <TierBadge tier={safeResult.tier} />
        {safeResult.countryFocus ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900">
            {safeResult.countryFocus}
          </span>
        ) : null}
        {typeof safeResult.confidence === "number" ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            Confidence {safeResult.confidence}
          </span>
        ) : null}
        {safeResult.handoffRequired ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900">
            Staff review
          </span>
        ) : null}
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-black/75 dark:text-white/75 sm:text-base">
        <span className="font-semibold">{safeResult.tier}</span> - {safeResult.summary}
      </p>

      {/* Programs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {programs.length > 0 ? (
          programs.map((p, idx) => (
            <article
              key={`${p.name}-${p.why ?? ""}-${idx}`}
              className={[
                "rounded-xl p-4",
                "ring-1 ring-black/10 dark:ring-white/10",
                "bg-slate-50/70 dark:bg-white/[0.03]",
                "hover:shadow-sm transition",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{p.name}</h4>
                  {p.country ? (
                    <p className="mt-0.5 text-xs text-black/55 dark:text-white/55">{p.country}</p>
                  ) : null}
                </div>
                {typeof p.score === "number" ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900">
                    {p.score}
                  </span>
                ) : null}
              </div>
              {p.why ? (
                <p className="mt-2 line-clamp-5 text-xs leading-6 text-black/70 dark:text-white/70">{p.why}</p>
              ) : null}
              {p.href ? (
                <Link href={p.href} className="mt-3 inline-flex text-xs font-bold text-blue-700 hover:text-blue-900 dark:text-blue-300">
                  View source page
                </Link>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 p-4 text-sm">
            We did not detect a clear recommended program from your answers. You can still download
            the preview PDF or talk to an expert.
          </div>
        )}
      </div>

      {safeResult.criteria?.length ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Criteria used
          </p>
          <ul className="mt-2 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
            {safeResult.criteria.slice(0, 6).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {safeResult.sources?.length ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Sources
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {safeResult.sources.slice(0, 6).map((source) => (
              <Link
                key={`${source.label}-${source.href}`}
                href={source.href}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {source.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#d8b650]/50 bg-[#071a3a] text-white shadow-lg shadow-blue-950/10">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6d86d]">
              Detailed personal report
            </p>
            <h4 className="mt-2 text-xl font-black sm:text-2xl">
              Unlock the 20-30 page assessment after registration
            </h4>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              The full report expands this preview into route comparison, document checklist,
              risk flags, timeline, country/product fit, and advisor notes for your profile.
            </p>
            <div className="mt-4 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <CheckIcon /> Personal route matrix
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <CheckIcon /> Document and risk review
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <CheckIcon /> X-Hub onboarding
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <CheckIcon /> Advisor follow-up path
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 text-[#071a3a] ring-1 ring-white/20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Registration
            </p>
            <p className="mt-2 text-3xl font-black">{detailedReportPrice}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Paid registration uses a dedicated Topmate registration product. After payment,
              X-Hub opens the client case, checklist, milestones, and detailed report workflow.
            </p>
            <Link
              href={DETAILED_REPORT_PAYMENT_URL}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b650]"
              onClick={recordDetailedReportIntent}
            >
              Register for detailed report
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white ring-1 ring-blue-700/20 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
          onClick={() => trackEvent("consult_cta_click", { track })}
        >
          Book Free Consultation
          <ArrowRightIcon />
        </Link>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_click", { track })}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/15 dark:hover:ring-white/25"
          >
            Chat on WhatsApp
            <WhatsappIcon />
          </a>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-4 py-2.5",
            "ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/15 dark:hover:ring-white/25",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            "transition",
          ].join(" ")}
          aria-live="polite"
        >
          {downloading ? (
            <>
              <Spinner /> Preparing preview...
            </>
          ) : (
            <>
              Download preview PDF
              <DownloadIcon />
            </>
          )}
        </button>

        <Link
          href="/eligibility"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/15 dark:hover:ring-white/25 transition"
        >
          Assess another pathway
          <OpenIcon />
        </Link>
      </div>

      {/* live status message for screen readers + subtle UI */}
      {status ? (
        <p className="mt-2 text-xs text-black/70 dark:text-white/70" aria-live="polite">
          {status}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-6 text-black/55 dark:text-white/55">
        This is an indicative result based on approved site content and deterministic rules. Final eligibility, fees, timelines, and risk flags require advisor verification.
      </p>
    </motion.section>
  );
}

/* ------------------ tiny inline icons & helpers ------------------ */

function TierBadge({ tier }: { tier: Result["tier"] }) {
  const classes =
    tier === "Eligible"
      ? "bg-green-100/60 text-green-900 ring-green-300/60 dark:bg-green-900/30 dark:text-green-200 dark:ring-green-800/50"
      : tier === "Borderline"
      ? "bg-yellow-100/60 text-yellow-900 ring-yellow-300/60 dark:bg-yellow-900/30 dark:text-yellow-100 dark:ring-yellow-800/50"
      : "bg-red-100/60 text-red-900 ring-red-300/60 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800/50";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ring-1 ${classes}`}>
      Tier: <strong className="font-semibold">{tier}</strong>
    </span>
  );
}

function BadgeDot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-black/70 dark:bg-white/70" />;
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300">
      <path
        fill="currentColor"
        d="M9.55 17.25 4.8 12.5l1.4-1.4 3.35 3.35 8.25-8.25 1.4 1.4-9.65 9.65z"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4.9A10 10 0 0 0 3.6 19.7L3 22l2.4-.6A10 10 0 1 0 20 4.9ZM6.2 18.4l-.2.1-.3.1.1-.3.6-2a8 8 0 1 1 2.5 2.3l-2 .8Zm10.4-5.4c-.1-.1-.7-.4-1.1-.5s-.3-.1-.5.2-.6.7-.7.8-.2.1-.4 0a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4l.3-.4c.1-.2.2-.3.2-.5a.5.5 0 0 0 0-.4c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.4a.8.8 0 0 0-.5.2 2 2 0 0 0-.7 1.4 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 3 9.2 9.2 0 0 0 1.7.7 1.7 1.7 0 0 0 1.5-.9c.2-.3.2-.7.1-.8Z"
      />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.75a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L6.97 11.03a.75.75 0 0 1 1.06-1.06l2.72 2.72V4.5A.75.75 0 0 1 12 3.75zM4.5 18a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2a.75.75 0 0 1 1.5 0v2A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3v-2a.75.75 0 0 1 1.5 0v2z"
      />
    </svg>
  );
}
function OpenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 0 0 2h3.586l-7.293 7.293a1 1 0 0 0 1.414 1.414L19 6.414V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4a1 1 0 1 0-2 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2H5z"
      />
    </svg>
  );
}
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-current" strokeWidth="3" opacity="0.25" />
      <path className="fill-current" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
