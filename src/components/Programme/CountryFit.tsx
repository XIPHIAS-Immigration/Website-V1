"use client";

// src/components/Programme/CountryFit.tsx
// -----------------------------------------------------------------------------
// On a country page, for a visitor XIA already knows: which of this country's
// routes is their strongest, and the one next step for it. Renders nothing for
// a new visitor — the routes list and the action card already speak to them.
// Reads the same case as XIA; one fetch.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { CaseMatch } from "@/lib/xia/case";
import { REGISTRATION_PRICE_LABEL, registrationHref } from "@/lib/xia/script";

const SNAPSHOT_KEY = "xia_case_snapshot";

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

export default function CountryFit({ country, track }: { country: string; track: string }) {
  const [match, setMatch] = useState<CaseMatch | null>(null);

  useEffect(() => {
    if (!hasCase()) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/xia/match?limit=12&closed=1", { credentials: "same-origin" });
        const data = await response.json();
        if (cancelled) return;
        const matches: CaseMatch[] = data?.matches ?? [];
        const want = norm(country);
        setMatch(matches.find((entry) => entry.state !== "closed" && entry.track === track && norm(entry.country).includes(want)) ?? null);
      } catch {
        /* nothing to add */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country, track]);

  if (!match) return null;

  const open = match.state === "open";
  const status = open ? "You clear it" : `Nearly there${match.gaps.length ? ` — ${match.gaps.length} ${match.gaps.length === 1 ? "gap" : "gaps"}` : ""}`;
  const gaps = match.gaps.filter((gap) => gap !== match.reason).slice(0, 2);

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#d8ad1f]/50 bg-[#fff8df] p-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#8a6a0a]">
          Your strongest route in {country}
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] tracking-[0.04em] ${open ? "bg-emerald-100 text-emerald-800" : "bg-[#e1b923]/25 text-[#6b5208]"}`}>
            {open ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
            {status}
          </span>
        </p>
        <Link href={match.href} className="mt-1 block text-[15px] font-black text-primary underline-offset-4 hover:underline">
          {match.title}
        </Link>
        {gaps.length ? (
          <p className="mt-0.5 text-[12.5px] text-neutral-700">Still needs: {gaps.join(" · ")}</p>
        ) : match.reason ? (
          <p className="mt-0.5 text-[12.5px] text-neutral-700">{match.reason}</p>
        ) : null}
      </div>
      <Link
        href={registrationHref(match)}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-primary transition hover:bg-[#f0cb3b]"
      >
        Get started — {REGISTRATION_PRICE_LABEL}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
