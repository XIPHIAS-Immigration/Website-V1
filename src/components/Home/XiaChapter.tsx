"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, FileCheck2, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { GradientText, Reveal, Stagger, StaggerItem, TextType } from "@/components/motion";

const CAPABILITIES = [
  { icon: Gauge, label: "Eligibility scoring" },
  { icon: ShieldCheck, label: "Risk radar" },
  { icon: FileCheck2, label: "Document intelligence" },
  { icon: Compass, label: "Route matching" },
];

const RING_NODES = [Gauge, ShieldCheck, FileCheck2, Compass];

/** Dedicated, distinctive XIA Intelligence chapter with an animated AI core. */
export default function XiaChapter() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-br from-[#060b1a] via-[#0a1530] to-[#0a1c44] py-24 text-white">
      <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-[#4f8cff]/20 blur-[150px]" />
      <div className="pointer-events-none absolute -left-20 bottom-1/4 h-80 w-80 rounded-full bg-secondary/15 blur-[150px]" />

      <div className="relative mx-auto grid w-full max-w-screen-2xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4f8cff]/40 bg-[#4f8cff]/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9cc0ff]">
              <Sparkles className="size-3.5" /> XIA Intelligence
            </span>
          </Reveal>

          <h2 className="mt-6 text-[clamp(2.2rem,5.2vw,4.2rem)] font-black leading-[1.04] tracking-tight">
            Your AI <GradientText colors={["#9cc0ff", "#4f8cff", "#e1b923", "#9cc0ff"]}>migration strategist</GradientText>.
          </h2>

          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
            XIA reads your profile, scores every route on eligibility and risk, audits your documents and
            drafts a personalised mobility roadmap — in seconds, not weeks.
          </p>

          <Stagger className="mt-7 flex flex-wrap gap-2.5">
            {CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <StaggerItem key={c.label}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-2 text-[13px] font-semibold text-white/85 backdrop-blur-sm">
                    <Icon className="size-4 text-[#9cc0ff]" />
                    {c.label}
                  </span>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <Link
              href="/xia-intelligence"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-[#0a1c44] shadow-lg transition hover:gap-3 hover:bg-secondary"
            >
              Open XIA Intelligence
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        {/* Animated AI core */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center">
          {/* concentric rings */}
          {[0, 1, 2].map((i) => {
            const size = 60 + i * 20; // %
            const Icon = RING_NODES[i];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/12"
                style={{ width: `${size}%`, height: `${size}%` }}
                animate={reduce ? undefined : { rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 26 - i * 6, ease: "linear", repeat: Infinity }}
              >
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-[#0a1530] text-[#9cc0ff] shadow-lg">
                    <Icon className="size-4" />
                  </span>
                </span>
              </motion.div>
            );
          })}

          {/* pulsing halo */}
          <motion.div
            className="absolute size-[42%] rounded-full bg-[#4f8cff]/30 blur-2xl"
            animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
          />

          {/* core */}
          <div className="relative flex size-[34%] flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#1c57b4] to-[#0a1c44] shadow-[0_0_60px_rgba(79,140,255,0.5)] ring-1 ring-white/20">
            <Sparkles className="size-8 text-secondary" />
            <span className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">XIA</span>
          </div>

          {/* live analysis strip */}
          <div className="absolute -bottom-2 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl border border-white/12 bg-[#0a1530]/90 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#3cd278]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Analysis
              </span>
            </div>
            <TextType
              className="mt-1 block text-[13.5px] font-medium text-white/85"
              text={[
                "Analysing your profile…",
                "Matching 47 global programmes…",
                "Scoring eligibility & risk…",
                "Drafting your mobility roadmap…",
              ]}
              speed={42}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
