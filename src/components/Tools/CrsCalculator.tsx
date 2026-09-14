"use client";

// src/components/Tools/CrsCalculator.tsx
// -----------------------------------------------------------------------------
// The Express Entry CRS calculator, as a public page rather than something
// buried behind a chat.
//
// Two things make this worth ranking for, against the dozens that already exist:
//
//   1. It shows the breakdown — core, spouse, transferability, additional — and
//      every assumption it had to make. Most calculators return one number and
//      leave you unable to check it.
//   2. It says what to change. A score with no lever is trivia; "two more points
//      of speaking is worth 23" is a decision.
//
// The arithmetic is the same engine the rules engine uses (lib/xia/crs.ts,
// criteria last verified against IRCC on CRS_LAST_VERIFIED), so the number here
// and the number in your report can never disagree.
// -----------------------------------------------------------------------------

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileText, RotateCcw, TrendingUp } from "lucide-react";

import {
  CRS_LAST_VERIFIED,
  CRS_SOURCE_URL,
  calculateCrs,
  expressEntryKnockouts,
  type Clb,
  type CrsInput,
  type EducationLevel,
} from "@/lib/xia/crs";

const EDUCATION: Array<{ value: EducationLevel; label: string }> = [
  { value: "secondary", label: "Secondary school" },
  { value: "one-year", label: "One-year post-secondary" },
  { value: "two-year", label: "Two-year diploma" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "two-or-more", label: "Two or more credentials (one 3-year+)" },
  { value: "masters", label: "Master's degree" },
  { value: "doctoral", label: "Doctorate" },
];

/** IELTS band → CLB, for the four abilities. Reading differs from the rest. */
const IELTS_TO_CLB: Array<{ band: string; listening: Clb; reading: Clb; writing: Clb; speaking: Clb }> = [
  { band: "9.0", listening: 10, reading: 10, writing: 10, speaking: 10 },
  { band: "8.5", listening: 10, reading: 9, writing: 9, speaking: 9 },
  { band: "8.0", listening: 10, reading: 8, writing: 9, speaking: 9 },
  { band: "7.5", listening: 9, reading: 8, writing: 8, speaking: 8 },
  { band: "7.0", listening: 9, reading: 8, writing: 7, speaking: 7 },
  { band: "6.5", listening: 8, reading: 7, writing: 7, speaking: 7 },
  { band: "6.0", listening: 7, reading: 6, writing: 6, speaking: 6 },
  { band: "5.5", listening: 6, reading: 5, writing: 5, speaking: 5 },
  { band: "5.0", listening: 5, reading: 4, writing: 5, speaking: 5 },
  { band: "Below 5.0", listening: 0, reading: 0, writing: 0, speaking: 0 },
];

const FIELD =
  "mt-1.5 w-full rounded-lg border border-[#071a3a]/15 bg-white px-3 py-2.5 text-[14px] font-semibold text-[#071a3a] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="type-caption block font-bold uppercase tracking-[0.1em] text-[#071a3a]/55">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-[#071a3a]/45">{hint}</span> : null}
    </label>
  );
}

export default function CrsCalculator() {
  const [age, setAge] = useState(30);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [education, setEducation] = useState<EducationLevel>("bachelor");
  const [bandIndex, setBandIndex] = useState(4); // IELTS 7.0
  const [canadianWorkYears, setCanadianWorkYears] = useState(0);
  const [foreignWorkYears, setForeignWorkYears] = useState(3);
  const [provincialNomination, setProvincialNomination] = useState(false);
  const [siblingInCanada, setSiblingInCanada] = useState(false);
  const [frenchClb7Plus, setFrenchClb7Plus] = useState(false);
  const [spouseEducation, setSpouseEducation] = useState<EducationLevel>("bachelor");

  const input: CrsInput = useMemo(() => {
    const band = IELTS_TO_CLB[bandIndex];
    return {
      age,
      hasSpouse,
      education,
      firstLanguage: {
        speaking: band.speaking,
        listening: band.listening,
        reading: band.reading,
        writing: band.writing,
      },
      canadianWorkYears,
      foreignWorkYears,
      provincialNomination,
      siblingInCanada,
      frenchClb7Plus,
      ...(hasSpouse
        ? { spouse: { education: spouseEducation, canadianWorkYears: 0 } }
        : {}),
    };
  }, [
    age, hasSpouse, education, bandIndex, canadianWorkYears, foreignWorkYears,
    provincialNomination, siblingInCanada, frenchClb7Plus, spouseEducation,
  ]);

  const result = useMemo(() => calculateCrs(input), [input]);
  const knockouts = useMemo(() => expressEntryKnockouts(input), [input]);

  /**
   * What one more step would be worth. The point of a calculator is not the
   * number, it is which lever to pull — so we re-run the engine with each single
   * change and show only the ones that actually move it.
   */
  const levers = useMemo(() => {
    const base = result.total;
    const candidates: Array<{ label: string; next: CrsInput }> = [];

    if (bandIndex > 0) {
      candidates.push({
        label: `Get IELTS ${IELTS_TO_CLB[bandIndex - 1].band} instead of ${IELTS_TO_CLB[bandIndex].band}`,
        next: {
          ...input,
          firstLanguage: {
            speaking: IELTS_TO_CLB[bandIndex - 1].speaking,
            listening: IELTS_TO_CLB[bandIndex - 1].listening,
            reading: IELTS_TO_CLB[bandIndex - 1].reading,
            writing: IELTS_TO_CLB[bandIndex - 1].writing,
          },
        },
      });
    }
    if (education !== "masters" && education !== "doctoral") {
      candidates.push({ label: "Finish a master's degree", next: { ...input, education: "masters" } });
    }
    if (!frenchClb7Plus) {
      candidates.push({ label: "Reach CLB 7 in French", next: { ...input, frenchClb7Plus: true } });
    }
    if (foreignWorkYears < 3) {
      candidates.push({
        label: "Reach three years of skilled work",
        next: { ...input, foreignWorkYears: 3 },
      });
    }
    if (canadianWorkYears < 1) {
      candidates.push({
        label: "Work one year in Canada",
        next: { ...input, canadianWorkYears: 1 },
      });
    }
    if (!provincialNomination) {
      candidates.push({ label: "Win a provincial nomination", next: { ...input, provincialNomination: true } });
    }

    return candidates
      .map((candidate) => ({ label: candidate.label, gain: calculateCrs(candidate.next).total - base }))
      .filter((candidate) => candidate.gain > 0)
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 4);
  }, [input, result.total, bandIndex, education, frenchClb7Plus, foreignWorkYears, canadianWorkYears, provincialNomination]);

  const flags: Array<{ label: string; value: boolean; set: (next: boolean) => void; note?: string }> = [
    {
      label: "Provincial nomination",
      value: provincialNomination,
      set: setProvincialNomination,
      note: "Worth 600 points on its own.",
    },
    { label: "CLB 7+ in French, all four abilities", value: frenchClb7Plus, set: setFrenchClb7Plus },
    { label: "A sibling who is a Canadian citizen or PR", value: siblingInCanada, set: setSiblingInCanada },
  ];

  function reset() {
    setAge(30);
    setHasSpouse(false);
    setEducation("bachelor");
    setBandIndex(4);
    setCanadianWorkYears(0);
    setForeignWorkYears(3);
    setProvincialNomination(false);
    setSiblingInCanada(false);
    setFrenchClb7Plus(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      {/* ------------------------------ inputs ------------------------------ */}
      <div className="space-y-4 rounded-2xl border border-[#071a3a]/10 bg-white p-5 shadow-[0_18px_55px_rgba(15,58,138,0.10)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Your age" hint="Age is the single biggest lever after language.">
            <input
              type="number" min={17} max={60} inputMode="numeric" className={FIELD}
              value={age}
              onChange={(event) => setAge(Math.max(17, Math.min(60, Number(event.target.value) || 0)))}
            />
          </Row>

          <Row label="Highest qualification">
            <select className={FIELD} value={education} onChange={(event) => setEducation(event.target.value as EducationLevel)}>
              {EDUCATION.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Row>

          <Row label="IELTS — your lowest band" hint="Converted to CLB per ability, the way IRCC does it.">
            <select className={FIELD} value={bandIndex} onChange={(event) => setBandIndex(Number(event.target.value))}>
              {IELTS_TO_CLB.map((band, position) => (
                <option key={band.band} value={position}>IELTS {band.band}</option>
              ))}
            </select>
          </Row>

          <Row label="Years of skilled work (outside Canada)">
            <input
              type="number" min={0} max={40} inputMode="numeric" className={FIELD}
              value={foreignWorkYears}
              onChange={(event) => setForeignWorkYears(Math.max(0, Number(event.target.value) || 0))}
            />
          </Row>

          <Row label="Years of skilled work in Canada">
            <input
              type="number" min={0} max={20} inputMode="numeric" className={FIELD}
              value={canadianWorkYears}
              onChange={(event) => setCanadianWorkYears(Math.max(0, Number(event.target.value) || 0))}
            />
          </Row>

          <Row label="Applying with a spouse or partner?">
            <select
              className={FIELD}
              value={hasSpouse ? "yes" : "no"}
              onChange={(event) => setHasSpouse(event.target.value === "yes")}
            >
              <option value="no">No — single applicant</option>
              <option value="yes">Yes</option>
            </select>
          </Row>

          {hasSpouse ? (
            <Row label="Spouse's highest qualification">
              <select
                className={FIELD}
                value={spouseEducation}
                onChange={(event) => setSpouseEducation(event.target.value as EducationLevel)}
              >
                {EDUCATION.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Row>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-[#071a3a]/10 pt-4">
          {flags.map((flag) => (
            <label key={flag.label} className="flex items-start gap-2.5 text-[13.5px] font-semibold text-[#071a3a]/75">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-[#071a3a]/25 text-primary focus:ring-primary"
                checked={flag.value}
                onChange={(event) => flag.set(event.target.checked)}
              />
              <span>
                {flag.label}
                {flag.note ? <span className="ml-1.5 text-[#071a3a]/45">{flag.note}</span> : null}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
        </button>
      </div>

      {/* ------------------------------ result ------------------------------ */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-primary text-white shadow-[0_22px_60px_rgba(15,58,138,0.25)]">
          <div className="p-6 text-center">
            <p className="type-caption font-black uppercase tracking-[0.18em] text-[#f0cb3b]">Your CRS score</p>
            <p className="mt-1 text-[64px] font-black leading-none tabular-nums">{result.total}</p>
            <p className="type-caption mt-1 text-white/50">out of {result.maximum}</p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-white/10">
            {([
              { label: "Core / human capital", value: result.core },
              { label: "Spouse factors", value: result.spouse },
              { label: "Skill transferability", value: result.transferability },
              { label: "Additional points", value: result.additional },
            ] as Array<{ label: string; value: number }>).map((part) => (
              <div key={part.label} className="bg-primary px-4 py-3">
                <dt className="type-caption text-white/55">{part.label}</dt>
                <dd className="text-[18px] font-black tabular-nums">{part.value}</dd>
              </div>
            ))}
          </dl>

          {knockouts.length ? (
            <div className="border-t border-white/10 bg-[#b3341f]/20 px-5 py-4">
              <p className="type-caption font-black uppercase tracking-[0.12em] text-[#ffb4a1]">
                Before the score matters
              </p>
              <ul className="mt-2 space-y-1.5">
                {knockouts.map((item) => (
                  <li key={item} className="text-[13px] leading-snug text-white/80">{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {levers.length ? (
            <div className="border-t border-white/10 px-5 py-4">
              <p className="type-caption flex items-center gap-1.5 font-black uppercase tracking-[0.12em] text-[#f0cb3b]">
                <TrendingUp className="size-3.5" aria-hidden="true" /> Worth the most to you
              </p>
              <ul className="mt-2.5 space-y-2">
                {levers.map((lever) => (
                  <li key={lever.label} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="text-white/75">{lever.label}</span>
                    <span className="shrink-0 rounded-md bg-[#e1b923] px-2 py-0.5 font-black tabular-nums text-[#071a3a]">
                      +{lever.gain}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2 border-t border-white/10 p-5">
            <Link
              href="/get-report/route_report"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-5 text-[14.5px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              <FileText className="size-4" aria-hidden="true" /> Get the full report
            </Link>
            <Link
              href="/personal-booking#schedule"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-[14px] font-bold text-white transition hover:bg-white/10"
            >
              Talk it through with an advisor <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {result.assumptions.length ? (
          <div className="mt-4 rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-4">
            <p className="type-caption font-bold uppercase tracking-[0.1em] text-[#071a3a]/50">
              What this had to assume
            </p>
            <ul className="mt-2 space-y-1">
              {result.assumptions.map((assumption) => (
                <li key={assumption} className="text-[12.5px] leading-snug text-[#071a3a]/60">
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-3 text-[12px] leading-relaxed text-[#071a3a]/45">
          Criteria last checked against{" "}
          <a href={CRS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            IRCC&rsquo;s published CRS grid
          </a>{" "}
          on {CRS_LAST_VERIFIED}. An estimate, not an IRCC decision.
        </p>
      </div>
    </div>
  );
}
