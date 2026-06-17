"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Calculator,
  Gauge,
  GraduationCap,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CharReveal, GradientText, Reveal, Stagger, StaggerItem, TextType, TiltCard } from "@/components/motion";

const suiteOptions = [
  {
    href: "/route-intelligence",
    label: "Route Intelligence",
    copy: "Compare route options by goal, destination, budget, timeline, family needs and physical presence.",
    icon: Route,
    glow: "#4f8cff",
  },
  {
    href: "/deep-analysis",
    label: "Deep Analysis",
    copy: "Add education, experience, skills, CV notes and evidence markers for a more detailed review.",
    icon: GraduationCap,
    glow: "#a78bfa",
  },
  {
    href: "/us-visa-intelligence",
    label: "US Visa Intelligence",
    copy: "Review US visa directions including EB1A, EB2 NIW, O1A, H-1B, L1, founder and employer routes.",
    icon: BrainCircuit,
    glow: "#e1b923",
  },
  {
    href: "/cost-estimator",
    label: "Cost Estimator",
    copy: "Estimate an indicative, family-tailored cost — government fees, due diligence, dependants and timeline.",
    icon: Calculator,
    glow: "#3cd278",
  },
  {
    href: "/compare-programs",
    label: "Compare Programs",
    copy: "Put 2–4 routes side by side on cost, timeline, presence, tax position and passport power gained.",
    icon: Scale,
    glow: "#4f8cff",
  },
  {
    href: "/xiphias-program-index",
    label: "Program Index",
    copy: "A documented composite benchmark ranking programmes across six weighted factors.",
    icon: Gauge,
    glow: "#e1b923",
  },
] as const;

const RING_ICONS = [Route, GraduationCap, BrainCircuit];

export default function XiaSuiteGatewayClient() {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#060b1a] via-[#0a1530] to-[#0a1c44] pt-24 text-white">
      <div className="pointer-events-none absolute -right-24 top-24 h-[28rem] w-[28rem] rounded-full bg-[#4f8cff]/20 blur-[150px]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 rounded-full bg-secondary/12 blur-[150px]" />

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#4f8cff]/40 bg-[#4f8cff]/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9cc0ff]">
                <Sparkles className="size-3.5" /> XIA Intelligence Suite
              </span>
            </Reveal>

            <h1 className="mt-6 text-[clamp(2.2rem,5.4vw,4rem)] font-black leading-[1.04] tracking-tight">
              <CharReveal text="Choose the assessment you want to run." />
            </h1>

            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
                Each module asks for the right details and prepares a focused, evidence-led route direction —{" "}
                <GradientText colors={["#9cc0ff", "#4f8cff", "#e1b923", "#9cc0ff"]}>ready for XIPHIAS advisor review</GradientText>.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <p className="mt-6 inline-flex items-start gap-2.5 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-[13.5px] leading-relaxed text-amber-100">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" />
                An assessment aid — not a final visa decision. Eligibility and filing strategy require advisor review.
              </p>
            </Reveal>
          </div>

          {/* Animated AI core with the three modules orbiting */}
          <div className="relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center">
            {[0, 1, 2].map((i) => {
              const size = 58 + i * 21;
              const Icon = RING_ICONS[i];
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/12"
                  style={{ width: `${size}%`, height: `${size}%` }}
                  animate={reduce ? undefined : { rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 28 - i * 6, ease: "linear", repeat: Infinity }}
                >
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <span className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#0a1530] text-[#9cc0ff] shadow-lg">
                      <Icon className="size-4" />
                    </span>
                  </span>
                </motion.div>
              );
            })}

            <motion.div
              className="absolute size-[42%] rounded-full bg-[#4f8cff]/30 blur-2xl"
              animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
            />
            <div className="relative flex size-[34%] flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#1c57b4] to-[#0a1c44] shadow-[0_0_60px_rgba(79,140,255,0.5)] ring-1 ring-white/20">
              <Sparkles className="size-8 text-secondary" />
              <span className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">XIA</span>
            </div>

            <div className="absolute -bottom-2 left-1/2 w-[90%] -translate-x-1/2 rounded-2xl border border-white/12 bg-[#0a1530]/90 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#3cd278]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Engine</span>
              </div>
              <TextType
                className="mt-1 block text-[13.5px] font-medium text-white/85"
                text={["Reading your profile…", "Scoring eligibility…", "Auditing documents…", "Mapping your routes…"]}
                speed={42}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Module cards ── */}
      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9cc0ff]">Select a module</p>
        </Reveal>

        <Stagger className="mt-6 grid gap-5 md:grid-cols-3">
          {suiteOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <StaggerItem key={option.href}>
                <TiltCard className="h-full" max={7}>
                  <Link
                    href={option.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur-sm transition duration-300 hover:border-white/30"
                  >
                    <span
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
                      style={{ background: option.glow }}
                    />
                    <span className="flex items-center justify-between">
                      <span
                        className="grid size-14 place-items-center rounded-2xl text-white"
                        style={{ background: `${option.glow}26`, color: option.glow }}
                      >
                        <Icon className="size-6" />
                      </span>
                      <span className="text-[40px] font-black leading-none text-white/10">0{index + 1}</span>
                    </span>
                    <h2 className="mt-6 text-[1.4rem] font-bold text-white">{option.label}</h2>
                    <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-white/65">{option.copy}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-white">
                      Open module
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.1}>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[13.5px] leading-relaxed text-white/55">
            After generation, the input area stays available at the top while your results remain the main focus.
          </p>
        </Reveal>
      </section>
    </main>
  );
}
