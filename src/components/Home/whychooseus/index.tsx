"use client";

// FILE: src/components/Home/whychooseus/index.tsx
import Link from "next/link";
import { BOOKING_ROUTE } from "@/components/PersonalBooking/booking-flow";
import CardSlider from "../Hero/slider";

import {
  ArrowRight,
  ShieldCheck,
  Globe2,
  Scale,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";

/* ---------------------------------------------
   Content
---------------------------------------------- */
const FEATURES = [
  {
    icon: Globe2,
    title: "17+ Years, 25+ Jurisdictions",
    blurb:
      "Deep, up-to-date program knowledge across Europe, the Middle East, and Asia.",
  },
  {
    icon: Scale,
    title: "In-house Legal & Compliance",
    blurb:
      "Licensed attorneys, audited processes, and enterprise-grade documentation.",
  },
  {
    icon: Users,
    title: "360° Relocation Support",
    blurb:
      "Visas, company setup, housing, schooling—one accountable team throughout.",
  },
  {
    icon: Building2,
    title: "Trusted by Fortune 500s",
    blurb:
      "Corporate policies, reporting, and SLAs tailored for HR & Mobility leaders.",
  },
];

const HIGHLIGHTS = [
  "92% success across programs",
  "10K+ clients empowered",
  "ISO-style process discipline",
  "Transparent fees & timelines",
];

/* ---------------------------------------------
   Component
---------------------------------------------- */
export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-heading"
      className="py-10 sm:py-16 md:py-10"
    >
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">

        {/* ======= MOVED SLIDER HERE ======= */}
        <div className="mb-10">
          <CardSlider />
        </div>

        {/* ======= HEADER ======= */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Why choose XIPHIAS
          </span>

          <h2
            id="why-choose-heading"
            className="mt-3 break-words text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl md:text-5xl"
          >
            A partner for{" "}
            <span className="text-blue-600 dark:text-blue-400">global growth</span> — reliable,
            compliant, outcome-focused
          </h2>

          <p className="mt-4 max-w-2xl text-base text-zinc-700 dark:text-zinc-300 sm:text-lg">
            We help entrepreneurs, investors, families, and enterprises navigate residency and
            citizenship pathways with clarity. No surprises—just a transparent process built for
            results.
          </p>
        </div>

        {/* ======= VALUE PROPS ======= */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5 md:gap-6">
          {FEATURES.map(({ icon: Icon, title, blurb }) => (
            <article
              key={title}
              className="group h-full rounded-2xl bg-white p-5 ring-1 ring-zinc-200 shadow-sm transition hover:shadow-md dark:bg-white/5 dark:ring-white/10"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/40">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white break-words">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300 break-words">
                    {blurb}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ======= TRUST STRIP ======= */}
        <div className="mt-8 sm:mt-10">
          <ul
            className="grid grid-cols-2 gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-4 sm:gap-4"
            aria-label="Highlights"
          >
            {HIGHLIGHTS.map((t) => (
              <li
                key={t}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-center ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                <span className="break-words">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ======= CTA ROW ======= */}
        <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <Link
            href={BOOKING_ROUTE}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Book a Private Consultation
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
          >
            Learn more about us
          </Link>
        </div>

        
      </div>
    </section>
  );
}