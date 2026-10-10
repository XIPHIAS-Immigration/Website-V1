"use client";

// src/components/Xia/RouteNextStep.tsx
// -----------------------------------------------------------------------------
// The bar that follows a visitor down a programme page and answers "so what do
// I do now?".
//
// With a case: how THIS route scores for them, what it still needs, and the one
// next step — Get started — with the report and the way back to their options
// beside it. Without one: the three-tap Start page.
//
// Reads the same case as XIA; fetches the shortlist once. Fixed to the bottom
// edge, above the Ask XIA dock, and only after the hero has scrolled past so it
// never covers the page's own buttons on arrival. On phones it appears only
// once the visitor has answers, since the decision panel already offers the
// Start page.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, Sparkles, X } from "lucide-react";

import type { CaseMatch } from "@/lib/xia/case";
import { reportForMatch } from "@/lib/xia/report-for";
import { REGISTRATION_PRICE_LABEL, REPORT_PRICE_LABEL, registrationHref } from "@/lib/xia/script";

import { openXiaChat } from "./xia-chat";

const SNAPSHOT_KEY = "xia_case_snapshot";

type Props = {
  /** The route's own country slug and track, so a sibling route can still speak. */
  country: string;
  track: "skilled" | "residency" | "citizenship" | "corporate";
  title: string;
};

function hasCase(): boolean {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return false;
    const item = JSON.parse(raw) as { goal?: string; profile?: string };
    return Boolean(item.goal || item.profile);
  } catch {
    return false;
  }
}

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

export default function RouteNextStep({ country, track, title }: Props) {
  const pathname = usePathname() || "";
  const [known, setKnown] = useState<boolean | null>(null);
  const [match, setMatch] = useState<CaseMatch | null>(null);
  const [sibling, setSibling] = useState<CaseMatch | null>(null);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const has = hasCase();
    setKnown(has);
    if (!has) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/xia/match?limit=12&closed=1", { credentials: "same-origin" });
        const data = await response.json();
        if (cancelled) return;
        const matches: CaseMatch[] = data?.matches ?? [];
        const exact = matches.find((entry) => entry.href === pathname) ?? null;
        setMatch(exact);
        if (!exact) {
          const want = norm(country);
          setSibling(
            matches.find((entry) => entry.state !== "closed" && entry.track === track && norm(entry.country).includes(want)) ??
              matches.find((entry) => entry.state !== "closed") ??
              null,
          );
        }
      } catch {
        /* the bar still offers the Start page */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, country, track]);

  // Appear once the hero is behind the visitor.
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (known === null || dismissed || !shown) return null;

  const open = match?.state === "open";
  const closed = match?.state === "closed";
  const gaps = match ? match.gaps.filter((gap) => gap !== match.reason).slice(0, 2) : [];
  const status = match
    ? open
      ? "You clear it"
      : closed
        ? "Not open to you"
        : `Nearly there${match.gaps.length ? ` — ${match.gaps.length} ${match.gaps.length === 1 ? "gap" : "gaps"}` : ""}`
    : null;

  return (
    <div
      role="region"
      aria-label="Your next step"
      className={`fixed inset-x-0 bottom-[4.75rem] z-[870] px-3 sm:bottom-0 sm:px-5 sm:pb-4 sm:pr-[11.5rem] ${known ? "" : "hidden sm:block"}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl border border-[#d8ad1f]/50 bg-primary p-3.5 text-white shadow-[0_24px_60px_-20px_rgba(7,26,58,0.7)] sm:flex-row sm:items-center sm:gap-5 sm:p-4">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide this bar"
          className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white sm:static sm:order-last sm:size-8"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1 pr-7 sm:pr-0">
          {match ? (
            <>
              <p className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#f0cb3b]">
                Your fit for this route
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] tracking-[0.04em] ${
                    open ? "bg-emerald-400/20 text-emerald-200" : closed ? "bg-white/10 text-white/70" : "bg-[#e1b923]/20 text-[#f0cb3b]"
                  }`}
                >
                  {open ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
                  {status}
                </span>
              </p>
              <p className="mt-1 truncate text-[14px] font-bold text-white">{match.title}</p>
              {gaps.length ? (
                <p className="mt-0.5 hidden truncate text-[12.5px] text-white/60 md:block">Still needs: {gaps.join(" · ")}</p>
              ) : match.reason ? (
                <p className="mt-0.5 hidden truncate text-[12.5px] text-white/60 md:block">{match.reason}</p>
              ) : null}
            </>
          ) : sibling ? (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f0cb3b]">Your options</p>
              <p className="mt-1 text-[14px] font-bold text-white">
                Your strongest route is <span className="text-[#f0cb3b]">{sibling.title}</span> ({sibling.country}).
              </p>
            </>
          ) : known ? (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f0cb3b]">Your options</p>
              <p className="mt-1 text-[14px] font-bold text-white">This route is not on your shortlist yet.</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f0cb3b]">Not sure this is your route?</p>
              <p className="mt-1 text-[14px] font-bold text-white">Tell us about you and XIPHIAS shows the routes you actually clear.</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {known ? (
            <>
              <Link
                href={registrationHref(match ?? sibling)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-primary transition hover:bg-[#f0cb3b]"
              >
                Get started — {REGISTRATION_PRICE_LABEL}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={`/get-report/${reportForMatch(match ?? sibling ?? { country, track, programmeId: "", title, href: pathname, state: "gaps", score: null, gaps: [], reason: "" })}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#e1b923]/50 px-3.5 text-[13.5px] font-bold text-[#f0cb3b] transition hover:bg-[#e1b923]/10"
              >
                <FileText className="size-4" aria-hidden="true" /> {REPORT_PRICE_LABEL} report
              </Link>
              <button
                type="button"
                onClick={() => openXiaChat({ resume: true })}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/25 px-3.5 text-[13.5px] font-bold text-white/85 transition hover:bg-white/10"
              >
                ← My options
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openXiaChat()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-primary transition hover:bg-[#f0cb3b]"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Find my route
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
