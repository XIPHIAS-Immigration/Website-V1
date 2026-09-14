// src/components/PersonalBooking/AdvisoryAuthority.tsx
// -----------------------------------------------------------------------------
// The credibility layer around the consultation scheduler.
//
// Server components on purpose: everything here is static text and therefore
// indexable. The scheduler stays a client component; this does not need to be.
//
// AdvisoryHero   renders above <ConsultationBookingClient />
// AdvisorProof   renders below it
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  CheckCircle2,
  FileText,
  Gavel,
  Quote,
  Route,
  ShieldCheck,
  Star,
} from "lucide-react";

import { awardsData } from "@/components/awards/awards.data";
import { credentials, firmFacts, offices } from "@/data/credentials";

const ADVISOR = {
  name: "Varun Singh",
  title: "Managing Director, XIPHIAS Immigration",
  postNominals: "Fellow IMC · Cert IMC",
  portrait: "/images/avtar/varun-singh-md-xiphias.jpg",
  linkedin: "https://www.linkedin.com/in/varunxiphias/",
} as const;

/** Awards carried on the booking page, newest first. The full list lives at /awards. */
const FEATURED_AWARD_IDS = [
  "most-trusted-global-mobility-brand-2025",
  "top-influential-business-leaders-2024",
  "brand-of-the-year-2024",
  "most-trusted-consultant-india-2023",
  "best-immigration-consultant-2022",
  "international-kohinoor-award-2017",
  "india-5000-best-msme-2016",
  "apj-abdul-kalam-excellence-2016",
];

const featuredAwards = FEATURED_AWARD_IDS
  .map((id) => awardsData.find((award) => award.id === id))
  .filter((award): award is (typeof awardsData)[number] => Boolean(award));

const remainingAwards = awardsData
  .filter((award) => !FEATURED_AWARD_IDS.includes(award.id))
  .sort((a, b) => b.year - a.year);

const AGENDA = [
  {
    icon: Route,
    minutes: "First 15 minutes",
    title: "Your position, stated plainly",
    body: "Nationality, family, funds, timeline, any previous refusal. The advisor establishes what is actually true before discussing any programme.",
  },
  {
    icon: Gavel,
    minutes: "Next 25 minutes",
    title: "Routes that survive your constraints",
    body: "Which programmes you are plausibly eligible for, which are ruled out and why, and where the published requirements are stricter than the marketing suggests.",
  },
  {
    icon: FileText,
    minutes: "Final 20 minutes",
    title: "Evidence, cost and sequence",
    body: "The documents that decide the case, realistic government and professional costs, and the order the steps have to happen in.",
  },
] as const;

const DIFFERENCE = [
  {
    from: "A sales desk quotes the programme it earns most on.",
    to: "A senior advisor tells you when the answer is that no route currently fits — and what would have to change.",
  },
  {
    from: "You are handed a brochure of every country.",
    to: "You leave with a shortlist, the reason each one made it, and the reason the others did not.",
  },
  {
    from: "Costs appear later, once you have committed.",
    to: "Government fees, due-diligence charges, dependant costs and professional fees are set out in the call.",
  },
  {
    from: "Nobody names the risk in your file.",
    to: "Previous refusals, source-of-funds gaps and document problems are raised in the first hour, not the sixth month.",
  },
] as const;

const FAQ = [
  {
    q: "Who will I actually be speaking to?",
    a: "A senior XIPHIAS advisor. Where the matter concerns Canada, the Canadian practice is delivered under the supervision of the firm's Regulated Canadian Immigration Consultant, licence R516194, whose status you can confirm yourself on the College's public register.",
  },
  {
    q: "What do I receive afterwards?",
    a: "A written summary of the routes discussed, the eligibility questions still open, and the documents that would need to be produced. It is yours to keep whether or not you engage XIPHIAS.",
  },
  {
    q: "Is the fee adjusted if I go ahead?",
    a: "The consultation fee is a separate professional fee for the advisor's time. Any engagement that follows is quoted separately, in writing, before any work begins.",
  },
  {
    q: "Can you guarantee my visa will be approved?",
    a: "No, and nobody may. Decisions rest entirely with the immigration authority of the destination country. What an advisor can do is tell you honestly how strong your case looks against the published criteria, and what would strengthen it.",
  },
  {
    q: "Is this legal advice?",
    a: firmFacts.serviceBoundary,
  },
  {
    q: "What if I need to reschedule?",
    a: "Reply to the confirmation email and the desk will move the appointment to the next available slot at no additional charge.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Hero — sits above the scheduler                                            */
/* -------------------------------------------------------------------------- */

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** What the fee actually buys. Lives here, not in the scheduler, so it is read before the price. */
const SESSION_INCLUDES = [
  "Profile and objective review",
  "Country and route comparison",
  "Key risks and evidence gaps",
  "Practical next-step direction",
] as const;

export function AdvisoryHero({
  priceInr,
  durationMinutes,
}: {
  priceInr: number;
  durationMinutes: number;
}) {
  const sessionFacts = [
    { icon: Clock3, label: `${durationMinutes} minutes` },
    { icon: CreditCard, label: formatInr(priceInr) },
    { icon: ShieldCheck, label: "Confidential" },
    { icon: CalendarDays, label: "Online session" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#1551a0] text-white" aria-labelledby="advisor-heading">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_18%_0%,rgba(7,26,58,0.55),transparent_72%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:px-10">
        <div>
          <p className="type-caption uppercase tracking-[0.24em] text-[#e1b923]">
            XIPHIAS Private Advisory
          </p>

          <h1 id="advisor-heading" className="type-page-title mt-4 max-w-3xl text-white">
            One hour with the advisor who built the practice.
          </h1>

          <p className="type-body mt-5 max-w-2xl text-white/70">
            {ADVISOR.name}, {ADVISOR.title}, has led the
            practice since {firmFacts.foundedYear} and spent {firmFacts.advisorYearsExperience} years
            on residence, citizenship and skilled-migration files. This is a private
            consultation — not a discovery call, not a sales pitch. You bring your
            situation; you leave with a written view of what is genuinely open to you.
          </p>

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-bold text-white/75">
            <Star className="size-4 shrink-0 fill-[#e1b923] text-[#e1b923]" aria-hidden="true" />
            <span className="text-white">{awardsData.length} industry awards</span>
            <span className="text-white/40">since {firmFacts.foundedYear}</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <span className="text-white/60">Forbes India · The Times of India · Silicon India · Corporate Vision</span>
          </p>

          {/* What the session is and what it costs — stated before the CTA, not after it. */}
          <div className="mt-8 grid gap-5 rounded-xl border border-white/15 bg-white/[0.06] p-5 sm:grid-cols-2 sm:gap-8">
            <div>
              <p className="type-caption uppercase tracking-[0.16em] text-white/45">The session</p>
              <ul className="mt-3 grid grid-cols-2 gap-2.5">
                {sessionFacts.map((fact) => {
                  const FactIcon = fact.icon;
                  return (
                    <li
                      key={fact.label}
                      className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2.5 text-[13px] font-bold"
                    >
                      <FactIcon className="size-4 shrink-0 text-[#e1b923]" aria-hidden="true" />
                      {fact.label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="type-caption uppercase tracking-[0.16em] text-white/45">What it covers</p>
              <ul className="mt-3 space-y-2">
                {SESSION_INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-white/80">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#e1b923] text-[#071a3a]">
                      <Check className="size-2.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#schedule"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#e1b923] px-6 text-sm font-bold text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a consultation
            </Link>
            <a
              href={ADVISOR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {ADVISOR.name} on LinkedIn
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          {/* Verifiable credentials — each one links to the regulator's own register. */}
          <div className="mt-10">
            <p className="type-caption uppercase tracking-[0.18em] text-white/45">
              Licensed and verifiable
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {credentials.map((credential) => (
                <li key={credential.id}>
                  <a
                    href={credential.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-1 rounded-lg border border-white/15 bg-white/[0.04] p-4 transition hover:border-[#e1b923]/60 hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-2 text-[13px] font-black text-[#e1b923]">
                      <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                      {credential.label}
                    </span>
                    <span className="type-small text-white/70">{credential.authorityShort} · {credential.country}</span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 transition group-hover:text-white/80">
                      Verify on the register
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-2xl text-[12px] leading-5 text-white/40">
              Licence R516194 is held by Lijun Wang, RCIC Class L2, listed on the College
              of Immigration and Citizenship Consultants public register against XIPHIAS
              Immigration Pvt Ltd. Confirmed 13 September 2026. {firmFacts.serviceBoundary}
            </p>
          </div>
        </div>

        {/* Portrait + proof rail */}
        <aside className="lg:pt-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/40">
            <Image
              src={ADVISOR.portrait}
              alt={`${ADVISOR.name}, ${ADVISOR.title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover object-[50%_18%]"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f438f] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-black leading-tight">{ADVISOR.name}</p>
              <p className="type-small text-white/70">{ADVISOR.title}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#e1b923]">
                {ADVISOR.postNominals}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10">
            <Stat value={`${firmFacts.advisorYearsExperience}+`} label="Years advising" />
            <Stat value={String(firmFacts.officeCount)} label="Global offices" />
            <Stat value={String(awardsData.length)} label="Awards won" />
            <Stat value={`${firmFacts.googleRating}★`} label="Google rating" />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#1551a0] px-4 py-4 text-center">
      <dd className="text-2xl font-black tabular-nums text-white">{value}</dd>
      <dt className="type-caption mt-1 uppercase tracking-[0.1em] text-white/45">{label}</dt>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Proof — sits below the scheduler                                           */
/* -------------------------------------------------------------------------- */

export function AdvisorProof() {
  return (
    <div className="bg-white text-slate-800">
      {/* What the hour contains */}
      <section className="border-b border-slate-200 py-16" aria-labelledby="agenda-heading">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <p className="type-caption uppercase tracking-[0.2em] text-primary">Inside the consultation</p>
          <h2 id="agenda-heading" className="type-section-title mt-2 max-w-2xl text-slate-950">
            Sixty minutes, structured.
          </h2>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-3">
            {AGENDA.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex flex-col gap-3 bg-white p-6">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="type-caption uppercase tracking-[0.12em] text-slate-400">
                    {item.minutes}
                  </span>
                  <h3 className="type-card-title text-slate-950">{item.title}</h3>
                  <p className="type-small text-slate-600">{item.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="type-small max-w-3xl text-slate-700">
              <strong className="font-black text-slate-950">You keep the written summary.</strong>{" "}
              Routes discussed, eligibility questions still open, and the documents that would
              decide the case — sent after the call, yours whether or not you engage XIPHIAS.
            </p>
          </div>
        </div>
      </section>

      {/* Senior advisor vs sales desk */}
      <section className="border-b border-slate-200 bg-slate-50 py-16" aria-labelledby="difference-heading">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <p className="type-caption uppercase tracking-[0.2em] text-primary">Why it is priced like this</p>
          <h2 id="difference-heading" className="type-section-title mt-2 max-w-2xl text-slate-950">
            A senior advisor is not a free consultation with a longer script.
          </h2>

          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200">
            {DIFFERENCE.map((row, index) => (
              <div
                key={row.to}
                className={`grid gap-4 bg-white p-5 md:grid-cols-2 md:gap-10 md:p-6 ${
                  index ? "border-t border-slate-200" : ""
                }`}
              >
                <p className="type-small flex gap-3 text-slate-500">
                  <span aria-hidden="true" className="mt-2 h-px w-5 shrink-0 bg-slate-300" />
                  {row.from}
                </p>
                <p className="type-small flex gap-3 font-bold text-slate-900">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0f6b47]" aria-hidden="true" />
                  {row.to}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="border-b border-slate-200 py-16" aria-labelledby="recognition-heading">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-caption uppercase tracking-[0.2em] text-primary">Recognition</p>
              <h2 id="recognition-heading" className="type-section-title mt-2 text-slate-950">
                {awardsData.length} awards since {firmFacts.foundedYear}.
              </h2>
            </div>
            <Link href="/awards" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              See every award <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-9 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            {featuredAwards.map((award) => (
              <li key={award.id} className="flex flex-col gap-2 bg-white p-5">
                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#9a6a05]">
                  <Star className="size-3.5 shrink-0 fill-[#e1b923] text-[#e1b923]" aria-hidden="true" />
                  <span className="tabular-nums">{award.year}</span>
                </span>
                <h3 className="type-card-title leading-snug text-slate-950">{award.title}</h3>
                <p className="type-small mt-auto pt-2 text-slate-500">{award.issuer}</p>
              </li>
            ))}
          </ul>

          <details className="group mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <summary className="cursor-pointer list-none text-sm font-bold text-primary marker:hidden">
              <span className="group-open:hidden">Show the other {remainingAwards.length} awards</span>
              <span className="hidden group-open:inline">Hide the full list</span>
            </summary>
            <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
              {remainingAwards.map((award) => (
                <li key={award.id} className="type-small flex gap-3 text-slate-600">
                  <span className="w-10 shrink-0 font-bold tabular-nums text-slate-400">{award.year}</span>
                  <span>
                    {award.title}
                    <span className="block text-slate-400">{award.issuer}</span>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* Offices */}
      <section className="border-b border-slate-200 bg-slate-50 py-14" aria-labelledby="offices-heading">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <p className="type-caption uppercase tracking-[0.2em] text-primary">Where we operate</p>
          <h2 id="offices-heading" className="type-section-title mt-2 text-slate-950">
            {firmFacts.officeCount} offices, headquartered in {firmFacts.headquarters}.
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {offices.map((office) => (
              <li
                key={`${office.city}-${office.country}`}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <Building2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-black text-slate-950">
                    {office.city}
                    {office.headquarters ? (
                      <span className="ml-2 rounded bg-[#e1b923]/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7a5c00]">
                        HQ
                      </span>
                    ) : null}
                  </span>
                  <span className="type-caption text-slate-500">
                    {[office.region, office.country].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <p className="type-caption uppercase tracking-[0.2em] text-primary">Before you book</p>
          <h2 id="faq-heading" className="type-section-title mt-2 text-slate-950">
            Straight answers.
          </h2>

          <dl className="mt-9 max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((item) => (
              <div key={item.q} className="grid gap-2 py-5 md:grid-cols-[320px_minmax(0,1fr)] md:gap-10">
                <dt className="type-card-title text-slate-950">{item.q}</dt>
                <dd className="type-small text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl bg-[#071a3a] p-6 text-white sm:p-8">
            <Quote className="size-6 shrink-0 text-[#e1b923]" aria-hidden="true" />
            <p className="type-body max-w-2xl flex-1 text-white/80">
              &ldquo;My journey began with a strong belief that global opportunities should be
              accessible to everyone, not just a privileged few.&rdquo;
              <span className="type-small mt-2 block text-white/50">
                {ADVISOR.name}, {ADVISOR.title}
              </span>
            </p>
            <Link
              href="#schedule"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#e1b923] px-6 text-sm font-bold text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book the consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** FAQ entries reused by the page's JSON-LD so the markup and the copy cannot drift. */
export const consultationFaq = FAQ;
