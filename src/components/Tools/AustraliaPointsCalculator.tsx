"use client";

// src/components/Tools/AustraliaPointsCalculator.tsx
// -----------------------------------------------------------------------------
// The SkillSelect points test, as a public page.
//
// Same shape as the CRS calculator and for the same reasons: show the breakdown,
// show the assumptions, and say which single change is worth the most. The
// arithmetic is the engine the rules engine already uses, so this page and a paid
// report can never disagree.
//
// One thing that matters more here than in Canada: 65 points is a floor, not a
// target. Invitations go to the highest scores in each occupation, so clearing 65
// and stopping is how people wait three years for nothing. The page says so.
// -----------------------------------------------------------------------------

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileText, RotateCcw, TrendingUp } from "lucide-react";

import {
  AU_PASS_MARK,
  AU_POINTS_LAST_VERIFIED,
  AU_POINTS_SOURCE_URL,
  calculateAustraliaPoints,
  type AuEnglish,
  type AuPartnerStatus,
  type AuPointsInput,
  type AuQualification,
} from "@/lib/xia/australia-points";

const QUALIFICATIONS: Array<{ value: AuQualification; label: string }> = [
  { value: "none", label: "No recognised qualification" },
  { value: "trade-or-diploma", label: "Trade qualification or diploma" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "masters-or-bachelor-with-research", label: "Master's, or bachelor with research" },
  { value: "doctorate", label: "Doctorate" },
];

const ENGLISH: Array<{ value: AuEnglish; label: string; hint: string }> = [
  { value: "competent", label: "Competent", hint: "IELTS 6 each band — 0 points" },
  { value: "proficient", label: "Proficient", hint: "IELTS 7 each band — 10 points" },
  { value: "superior", label: "Superior", hint: "IELTS 8 each band — 20 points" },
];

const PARTNERS: Array<{ value: AuPartnerStatus; label: string }> = [
  { value: "no-partner", label: "I have no partner" },
  { value: "partner-citizen-or-pr", label: "Partner is an Australian citizen or PR" },
  { value: "partner-skilled", label: "Partner is skilled and under 45 with competent English" },
  { value: "partner-competent-english", label: "Partner has competent English only" },
  { value: "partner-none-of-these", label: "Partner meets none of these" },
];

const NOMINATIONS: Array<{ value: NonNullable<AuPointsInput["nomination"]>; label: string }> = [
  { value: "none", label: "No nomination (189 independent)" },
  { value: "state-190", label: "State nomination — subclass 190" },
  { value: "state-or-family-491", label: "State or family sponsorship — subclass 491" },
];

const FIELD =
  "mt-1.5 w-full rounded-lg border border-[#071a3a]/15 bg-white px-3 py-2.5 text-[14px] font-semibold text-[#071a3a] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

function Row({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="type-caption block font-bold uppercase tracking-[0.1em] text-[#071a3a]/55">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-[#071a3a]/45">{hint}</span> : null}
    </label>
  );
}

export default function AustraliaPointsCalculator() {
  const [age, setAge] = useState(30);
  const [english, setEnglish] = useState<AuEnglish>("proficient");
  const [overseasSkilledYears, setOverseasSkilledYears] = useState(5);
  const [australianSkilledYears, setAustralianSkilledYears] = useState(0);
  const [qualification, setQualification] = useState<AuQualification>("bachelor");
  const [partner, setPartner] = useState<AuPartnerStatus>("no-partner");
  const [nomination, setNomination] = useState<NonNullable<AuPointsInput["nomination"]>>("none");
  const [australianStudy, setAustralianStudy] = useState(false);
  const [specialistEducation, setSpecialistEducation] = useState(false);
  const [regionalStudy, setRegionalStudy] = useState(false);
  const [professionalYear, setProfessionalYear] = useState(false);
  const [accreditedCommunityLanguage, setAccreditedCommunityLanguage] = useState(false);

  const input: AuPointsInput = useMemo(
    () => ({
      age,
      english,
      overseasSkilledYears,
      australianSkilledYears,
      qualification,
      partner,
      nomination,
      australianStudy,
      specialistEducation,
      regionalStudy,
      professionalYear,
      accreditedCommunityLanguage,
    }),
    [
      age, english, overseasSkilledYears, australianSkilledYears, qualification, partner,
      nomination, australianStudy, specialistEducation, regionalStudy, professionalYear,
      accreditedCommunityLanguage,
    ],
  );

  const result = useMemo(() => calculateAustraliaPoints(input), [input]);

  /** Which single change is worth the most. The number alone is not advice. */
  const levers = useMemo(() => {
    const base = result.total;
    const candidates: Array<{ label: string; next: AuPointsInput }> = [];

    if (english !== "superior") {
      candidates.push({
        label: english === "competent" ? "Reach Proficient English (IELTS 7)" : "Reach Superior English (IELTS 8)",
        next: { ...input, english: english === "competent" ? "proficient" : "superior" },
      });
    }
    if (qualification !== "doctorate" && qualification !== "masters-or-bachelor-with-research") {
      candidates.push({
        label: "Finish a master's degree",
        next: { ...input, qualification: "masters-or-bachelor-with-research" },
      });
    }
    if (nomination === "none") {
      candidates.push({ label: "Win a state nomination (190)", next: { ...input, nomination: "state-190" } });
      candidates.push({
        label: "Win regional sponsorship (491)",
        next: { ...input, nomination: "state-or-family-491" },
      });
    }
    if (overseasSkilledYears < 8) {
      candidates.push({
        label: "Reach eight years of skilled work overseas",
        next: { ...input, overseasSkilledYears: 8 },
      });
    }
    if (!accreditedCommunityLanguage) {
      candidates.push({
        label: "Get NAATI community-language accreditation",
        next: { ...input, accreditedCommunityLanguage: true },
      });
    }
    if (!professionalYear) {
      candidates.push({ label: "Complete an Australian Professional Year", next: { ...input, professionalYear: true } });
    }

    return candidates
      .map((candidate) => ({
        label: candidate.label,
        gain: calculateAustraliaPoints(candidate.next).total - base,
      }))
      .filter((candidate) => candidate.gain > 0)
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 4);
  }, [input, result.total, english, qualification, nomination, overseasSkilledYears, accreditedCommunityLanguage, professionalYear]);

  const flags: Array<{ label: string; value: boolean; set: (next: boolean) => void; note?: string }> = [
    { label: "Two years of study in Australia", value: australianStudy, set: setAustralianStudy },
    { label: "Specialist education qualification (STEM research)", value: specialistEducation, set: setSpecialistEducation },
    { label: "Studied in regional Australia", value: regionalStudy, set: setRegionalStudy },
    { label: "Completed a Professional Year", value: professionalYear, set: setProfessionalYear },
    {
      label: "NAATI accredited community language",
      value: accreditedCommunityLanguage,
      set: setAccreditedCommunityLanguage,
      note: "Worth 5 points and widely missed.",
    },
  ];

  function reset() {
    setAge(30);
    setEnglish("proficient");
    setOverseasSkilledYears(5);
    setAustralianSkilledYears(0);
    setQualification("bachelor");
    setPartner("no-partner");
    setNomination("none");
    setAustralianStudy(false);
    setSpecialistEducation(false);
    setRegionalStudy(false);
    setProfessionalYear(false);
    setAccreditedCommunityLanguage(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <div className="space-y-4 rounded-2xl border border-[#071a3a]/10 bg-white p-5 shadow-[0_18px_55px_rgba(15,58,138,0.10)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Your age" hint="25–32 is the peak band at 30 points. 45 and over scores nothing.">
            <input
              type="number" min={17} max={60} inputMode="numeric" className={FIELD}
              value={age}
              onChange={(event) => setAge(Math.max(17, Math.min(60, Number(event.target.value) || 0)))}
            />
          </Row>

          <Row label="English level">
            <select className={FIELD} value={english} onChange={(event) => setEnglish(event.target.value as AuEnglish)}>
              {ENGLISH.map((option) => (
                <option key={option.value} value={option.value}>{option.label} — {option.hint}</option>
              ))}
            </select>
          </Row>

          <Row label="Skilled work outside Australia (years)" hint="Capped at 20 points, reached at eight years.">
            <input
              type="number" min={0} max={40} inputMode="numeric" className={FIELD}
              value={overseasSkilledYears}
              onChange={(event) => setOverseasSkilledYears(Math.max(0, Number(event.target.value) || 0))}
            />
          </Row>

          <Row label="Skilled work in Australia (years)">
            <input
              type="number" min={0} max={20} inputMode="numeric" className={FIELD}
              value={australianSkilledYears}
              onChange={(event) => setAustralianSkilledYears(Math.max(0, Number(event.target.value) || 0))}
            />
          </Row>

          <Row label="Highest qualification">
            <select
              className={FIELD}
              value={qualification}
              onChange={(event) => setQualification(event.target.value as AuQualification)}
            >
              {QUALIFICATIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Row>

          <Row label="Partner status">
            <select
              className={FIELD}
              value={partner}
              onChange={(event) => setPartner(event.target.value as AuPartnerStatus)}
            >
              {PARTNERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Row>

          <Row label="Nomination or sponsorship" className="sm:col-span-2">
            <select
              className={FIELD}
              value={nomination}
              onChange={(event) => setNomination(event.target.value as NonNullable<AuPointsInput["nomination"]>)}
            >
              {NOMINATIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Row>
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
            <p className="type-caption font-black uppercase tracking-[0.18em] text-[#f0cb3b]">Your points total</p>
            <p className="mt-1 text-[64px] font-black leading-none tabular-nums">{result.total}</p>
            <p
              className={`type-caption mt-1 font-bold ${
                result.passesFloor ? "text-[#7ce8a8]" : "text-[#ffb4a1]"
              }`}
            >
              {result.passesFloor
                ? `Clears the ${AU_PASS_MARK}-point floor`
                : `Below the ${AU_PASS_MARK}-point floor`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-white/10">
            {Object.entries(result.detail).map(([label, value]) => (
              <div key={label} className="bg-primary px-4 py-3">
                <dt className="type-caption capitalize text-white/55">{label}</dt>
                <dd className="text-[18px] font-black tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          {result.knockouts.length ? (
            <div className="border-t border-white/10 bg-[#b3341f]/20 px-5 py-4">
              <p className="type-caption font-black uppercase tracking-[0.12em] text-[#ffb4a1]">
                Before the score matters
              </p>
              <ul className="mt-2 space-y-1.5">
                {result.knockouts.map((item) => (
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

        {result.notes.length ? (
          <div className="mt-4 rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-4">
            <p className="type-caption font-bold uppercase tracking-[0.1em] text-[#071a3a]/50">
              What this had to assume
            </p>
            <ul className="mt-2 space-y-1">
              {result.notes.map((note) => (
                <li key={note} className="text-[12.5px] leading-snug text-[#071a3a]/60">{note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-3 text-[12px] leading-relaxed text-[#071a3a]/45">
          Scored against{" "}
          <a href={AU_POINTS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Home Affairs&rsquo; published points test
          </a>{" "}
          on {AU_POINTS_LAST_VERIFIED}. An estimate, not a Home Affairs decision.
        </p>
      </div>
    </div>
  );
}
