"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarClock, Lock, Quote } from "lucide-react";
import { CharReveal, Reveal } from "@/components/motion";

const POINTS = [
  { icon: CalendarClock, label: "45-minute private session" },
  { icon: BadgeCheck, label: "Tailored route & cost plan" },
  { icon: Lock, label: "NDA-backed confidentiality" },
];

/** Premium highlight for the paid senior-advisor consultation. */
export default function AdvisorChapter() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-br from-[#0a1c44] via-[#0c2350] to-[#05080f] py-24 text-white">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-secondary/15 blur-[150px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-primary/30 blur-[150px]" />

      <div className="relative mx-auto grid w-full max-w-screen-2xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        {/* Copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary">
              Private client desk
            </span>
          </Reveal>

          <h2 className="mt-6 text-[clamp(2.1rem,5vw,4rem)] font-black leading-[1.05]">
            <CharReveal text="Speak to a senior CBI / RBI advisor." />
          </h2>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
              A focused, paid consultation with a senior strategist — not a sales call. Walk away with a
              clear route, realistic costs and a documented next step for you and your family.
            </p>
          </Reveal>

          <div className="mt-7 flex flex-wrap gap-3">
            {POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.label} delay={0.15 + i * 0.07}>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[13px] font-semibold text-white/85">
                    <Icon className="size-4 text-secondary" />
                    {p.label}
                  </span>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.35}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/booking?plan=paid"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-[14px] font-bold text-[#0a1c44] shadow-lg transition hover:gap-3 hover:bg-[#f0cb3b]"
              >
                Book a private consultation
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/personal-booking"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Advisor card */}
        <Reveal delay={0.15}>
          <motion.div
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="relative mx-auto w-full max-w-xl rounded-[32px] border border-white/12 bg-white/[0.05] p-8 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-10"
          >
            <div className="flex items-center gap-6">
              <span className="relative size-28 shrink-0 overflow-hidden rounded-3xl ring-2 ring-secondary/50 sm:size-32">
                <Image
                  src="/images/avtar/varun-singh-md-xiphias.jpg"
                  alt="Varun Singh, MD"
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                />
              </span>
              <div>
                <p className="text-2xl font-black sm:text-3xl">Varun Singh</p>
                <p className="mt-0.5 text-[15px] text-white/60">Managing Director, XIPHIAS</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-secondary">
                  <BadgeCheck className="size-4" /> 17+ years advising HNWIs
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-black/20 p-5">
              <Quote className="size-6 text-secondary/70" />
              <p className="mt-2 text-[16px] leading-relaxed text-white/85">
                Every family&apos;s situation is different. In one focused session we map the route that
                actually fits — your goals, your timeline, your risk.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { v: "10k+", l: "Families" },
                { v: "50+", l: "Countries" },
                { v: "98%", l: "Success" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.04] py-4">
                  <p className="text-2xl font-black text-secondary">{s.v}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/55">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
