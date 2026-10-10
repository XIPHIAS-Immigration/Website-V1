// src/components/Programme/ProgrammeDecision.tsx
// -----------------------------------------------------------------------------
// The first screen of a programme page, under the hero: everything a visitor
// needs to decide, then and there.
//
//   left  — the key facts, "Is this for you?" and "Not for you if"
//   right — the action card: Get started, the report, Ask XIA, the brochure,
//           a consultation
//
// Server component. The XIA rule for this page (when one exists) carries the
// chosen route into registration, and the personal fit is added by the
// RouteNextStep bar, which reads the visitor's case on the client.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Download, FileText, XCircle } from "lucide-react";

import { formatTimelineLong } from "@/lib/timeline";
import { programmeRules } from "@/lib/xia/programme-requirements";
import { REGISTRATION_PRICE_LABEL, REPORT_PRICE_LABEL, registrationHref } from "@/lib/xia/script";
import type { ReportProductType } from "@/lib/xia/report-for";

import AskXiaButton from "./AskXiaButton";

type Track = "skilled" | "residency" | "citizenship" | "corporate";

type Props = {
  track: Track;
  countrySlug: string;
  programSlug: string;
  /** The page's frontmatter. Only well-known fields are read. */
  meta: Record<string, unknown>;
  brochure?: string;
};

type Fact = { label: string; value: string };

function money(amount: number, currency?: string) {
  const code = (currency || "USD").toUpperCase();
  try {
    // Lakh grouping only for rupees; everyone else reads €250,000, not €2,50,000.
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-IN")}`;
  }
}

function factsFor(meta: Record<string, unknown>, track: Track): Fact[] {
  const facts: Fact[] = [];
  const minInvestment = meta.minInvestment;
  if (typeof minInvestment === "number" && minInvestment > 0) {
    facts.push({ label: track === "citizenship" || track === "residency" ? "From" : "Minimum investment", value: money(minInvestment, meta.currency as string | undefined) });
  }
  if (typeof meta.passMark === "number") facts.push({ label: "Pass mark", value: `${meta.passMark} points` });
  const timeline = formatTimelineLong(meta.timelineMonths as number | undefined, meta.timelineLabel as string | undefined, "");
  if (timeline) facts.push({ label: "Typical timeline", value: timeline });
  const hold = meta.holdingPeriodMonths;
  if (typeof hold === "number" && hold > 0) facts.push({ label: "Holding period", value: hold % 12 === 0 ? `${hold / 12} years` : `${hold} months` });
  const jobOffer = meta.jobOffer as { required?: boolean } | undefined;
  if (jobOffer && typeof jobOffer.required === "boolean") facts.push({ label: "Job offer", value: jobOffer.required ? "Required" : "Not required" });
  const family = meta.familyMatrix as { spouse?: boolean; childrenUpTo?: number; parentsFromAge?: number | null } | undefined;
  if (family) {
    const parts = [family.spouse !== false ? "spouse" : "", family.childrenUpTo ? `children to ${family.childrenUpTo}` : "", family.parentsFromAge !== undefined && family.parentsFromAge !== null ? "parents" : ""].filter(Boolean);
    if (parts.length) facts.push({ label: "Family", value: parts.join(", ") });
  }
  if ((track === "residency" || track === "citizenship") && typeof meta.routeType === "string" && meta.routeType) {
    facts.push({ label: "Route", value: meta.routeType.charAt(0).toUpperCase() + meta.routeType.slice(1) });
  }
  return facts.slice(0, 4);
}

function reportFor(track: Track, countrySlug: string): ReportProductType {
  if (countrySlug === "usa" || countrySlug === "united-states") return "us_visa_report";
  if (track === "citizenship" || track === "residency") return "premium_report";
  return "route_report";
}

export default function ProgrammeDecision({ track, countrySlug, programSlug, meta, brochure }: Props) {
  const pathname = `/${track}/${countrySlug}/${programSlug}`;
  const rule = programmeRules.find((entry) => entry.href === pathname) ?? null;
  const requirements = (Array.isArray(meta.requirements) ? meta.requirements : []).filter((r): r is string => typeof r === "string").slice(0, 5);
  const disqualifiers = (Array.isArray(meta.disqualifiers) ? meta.disqualifiers : []).filter((r): r is string => typeof r === "string").slice(0, 3);
  const facts = factsFor(meta, track);
  const country = typeof meta.country === "string" ? meta.country : countrySlug;
  const title = typeof meta.title === "string" ? meta.title : programSlug;

  return (
    <section aria-label="Decide now" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* On phones the action card comes first; on desktop it sits at the right. */}
      <div className="order-2 min-w-0 lg:order-1">
        {facts.length ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-neutral-200/70 dark:bg-neutral-900/40 dark:ring-neutral-800/70">
                <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">{fact.label}</dt>
                <dd className="mt-1 text-[16px] font-black leading-tight text-primary dark:text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {requirements.length ? (
            <div className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-200/60 dark:bg-sky-950/30 dark:ring-sky-900/50">
              <h2 className="text-[17px] font-black text-primary dark:text-white">Is this for you?</h2>
              <ul className="mt-3 space-y-2">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] leading-6 text-primary/85 dark:text-white/85">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {disqualifiers.length ? (
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-900/40">
              <h2 className="text-[17px] font-black text-amber-900 dark:text-amber-300">Not for you if</h2>
              <ul className="mt-3 space-y-2">
                {disqualifiers.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] leading-6 text-amber-900/90 dark:text-amber-100/90">
                    <XCircle className="mt-1 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] text-amber-900/80 dark:text-amber-100/80">
                Not a match?{" "}
                <Link href={`/${track}/${countrySlug}`} className="font-bold underline underline-offset-4">
                  Other routes in {country}
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="order-1 rounded-2xl bg-primary p-5 text-white shadow-[0_24px_60px_-30px_rgba(7,26,58,0.7)] sm:p-6 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f0cb3b]">What to do now</p>
        <h2 className="mt-2 text-[20px] font-black leading-tight">Start on {title}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Register once and the assessment team checks your real profile against this route&rsquo;s published rules, with the Deep Analysis report included.
        </p>
        <Link
          href={registrationHref(rule ? { programmeId: rule.id } : null)}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[15px] font-black text-primary shadow-[0_10px_26px_rgba(225,185,35,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]"
        >
          Get started — {REGISTRATION_PRICE_LABEL}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Link
            href={`/get-report/${reportFor(track, countrySlug)}`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#e1b923]/50 px-3 text-[13.5px] font-bold text-[#f0cb3b] transition hover:bg-[#e1b923]/10"
          >
            <FileText className="size-4" aria-hidden="true" /> {REPORT_PRICE_LABEL} report
          </Link>
          <AskXiaButton seed={`${title}, ${country}`} />
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-[13.5px]">
          {brochure ? (
            <a href={brochure} download className="inline-flex items-center gap-2 font-bold text-white/80 transition hover:text-white">
              <Download className="size-4" aria-hidden="true" /> Download the brochure
            </a>
          ) : null}
          <Link href="/personal-booking#schedule" className="inline-flex items-center gap-2 font-bold text-white/80 transition hover:text-white">
            <CalendarCheck className="size-4" aria-hidden="true" /> Book a consultation with Varun Singh
          </Link>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-white/40">
          ₹4,999 including GST. Registration buys the assessment and the report, not a visa outcome.
        </p>
      </aside>
    </section>
  );
}
