// src/components/Programme/CountryDecision.tsx
// -----------------------------------------------------------------------------
// The first screen of a country page, under the hero: the routes this country
// offers, and the one thing to do next.
//
//   left  — every route in the country (what it costs, how long), and, for a
//           visitor XIA already knows, which of them is their strongest
//   right — the action card: Get started, the report, Ask XIA, the brochure,
//           a consultation
//
// Server component; the personal fit is a small client island.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { ArrowRight, CalendarCheck, ChevronRight, Download, FileText } from "lucide-react";

import { formatTimelineLong } from "@/lib/timeline";
import { REGISTRATION_PRICE_LABEL, REPORT_PRICE_LABEL } from "@/lib/xia/script";
import type { ReportProductType } from "@/lib/xia/report-for";

import AskXiaButton from "./AskXiaButton";
import CountryFit from "./CountryFit";

type Track = "skilled" | "residency" | "citizenship" | "corporate";

/** The few fields every vertical's ProgramMeta shares. */
export type CountryRoute = {
  title: string;
  programSlug: string;
  tagline?: string;
  minInvestment?: number;
  currency?: string;
  timelineMonths?: number;
  timelineLabel?: string;
};

type Props = {
  track: Track;
  countrySlug: string;
  /** Display name, e.g. "Bulgaria". */
  country: string;
  programs: CountryRoute[];
  brochure?: string;
};

const TRACK_WORD: Record<Track, string> = {
  skilled: "skilled migration",
  residency: "residency",
  citizenship: "citizenship",
  corporate: "business immigration",
};

function money(amount: number, currency?: string) {
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-IN")}`;
  }
}

export function reportFor(track: Track, countrySlug: string): ReportProductType {
  if (countrySlug === "usa" || countrySlug === "united-states") return "us_visa_report";
  if (track === "citizenship" || track === "residency") return "premium_report";
  return "route_report";
}

export default function CountryDecision({ track, countrySlug, country, programs, brochure }: Props) {
  const registration = `/registration?country=${encodeURIComponent(country)}&track=${track}`;

  return (
    <section aria-label="Decide now" className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* On phones the action card comes first; on desktop it sits at the right. */}
      <div className="order-2 min-w-0 lg:order-1">
        <CountryFit country={country} track={track} />

        <div className="rounded-2xl bg-neutral-50 p-5 ring-1 ring-neutral-200/70 dark:bg-neutral-900/40 dark:ring-neutral-800/70">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-black text-primary dark:text-white">
              {programs.length === 1 ? "The route" : `${programs.length} routes`} in {country}
            </h2>
            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400">Pick one to see its full rules</span>
          </div>
          <ul className="mt-3 divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
            {programs.map((p) => {
              const from = typeof p.minInvestment === "number" && p.minInvestment > 0 ? money(p.minInvestment, p.currency) : null;
              const timeline = formatTimelineLong(p.timelineMonths, p.timelineLabel, "");
              return (
                <li key={p.programSlug}>
                  <Link
                    href={`/${track}/${countrySlug}/${p.programSlug}`}
                    className="group flex items-center gap-3 py-3 transition hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-bold leading-snug text-primary group-hover:underline dark:text-white">{p.title}</span>
                      {from || timeline ? (
                        <span className="mt-0.5 block text-[12.5px] text-neutral-600 dark:text-neutral-400">
                          {from ? <>From <strong className="font-bold text-neutral-800 dark:text-neutral-200">{from}</strong></> : null}
                          {from && timeline ? " · " : null}
                          {timeline}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <aside
        id="decide"
        className="order-1 scroll-mt-28 rounded-2xl bg-primary p-5 text-white shadow-[0_24px_60px_-30px_rgba(7,26,58,0.7)] sm:p-6 lg:sticky lg:top-24 lg:order-2 lg:self-start"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f0cb3b]">What to do now</p>
        <h2 className="mt-2 text-[20px] font-black leading-tight">Start on {country}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
          Register once and the assessment team checks your real profile against every {country} {TRACK_WORD[track]} route&rsquo;s published rules, with the Deep Analysis report included.
        </p>
        <Link
          href={registration}
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
          <AskXiaButton seed={`${country} ${TRACK_WORD[track]} routes`} />
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
