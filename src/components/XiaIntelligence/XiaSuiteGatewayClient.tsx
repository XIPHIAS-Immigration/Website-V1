"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Calculator,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  Route,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  FileText,
} from "lucide-react";
import { GradientText, TextType, TiltCard } from "@/components/motion";

const suiteOptions = [
  {
    href: "/reports",
    label: "Express Reports",
    copy: "Choose a focused personalised PDF, complete only the relevant intake and purchase it directly.",
    icon: FileText,
    glow: "#e1b923",
  },
  {
    href: "/route-intelligence",
    label: "Route Intelligence",
    copy: "Compare Immigration Routes by Goal, Destination, Budget, Timeline, Family Needs and Physical Presence.",
    icon: Route,
    glow: "#e1b923",
  },
  {
    href: "/deep-analysis",
    label: "Deep Analysis",
    copy: "Add Education, Experience, Skills, CV Notes and Evidence Markers for a more detailed review.",
    icon: GraduationCap,
    glow: "#e1b923",
  },
  {
    href: "/due-diligence-intelligence",
    label: "Immigration Due Diligence",
    copy: "Check Identity, Immigration History, Documents, Funds, Family Evidence and Counterparties before You Apply.",
    icon: ShieldAlert,
    glow: "#e1b923",
  },
  {
    href: "/us-visa-intelligence",
    label: "US Visa Intelligence",
    copy: "Review US Visa directions including EB1A, EB2 NIW, O1A, H-1B, L1, Founder and Employer routes.",
    icon: BrainCircuit,
    glow: "#e1b923",
  },
  {
    href: "/cost-estimator",
    label: "Cost Estimator",
    copy: "Estimate an indicative Family Cost, Government Fees, Due Diligence, Dependants and Timeline.",
    icon: Calculator,
    glow: "#e1b923",
  },
  {
    href: "/document-readiness",
    label: "Document Readiness",
    copy: "Review CV, Funds, Employment, Education and Family Evidence before Advisor Verification.",
    icon: ClipboardCheck,
    glow: "#e1b923",
  },
  {
    href: "/compare-programs",
    label: "Compare Programs",
    copy: "Put 2–4 Routes side by side on Cost, Timeline, Presence, Tax Position and Passport Power gained.",
    icon: Scale,
    glow: "#e1b923",
  },
  {
    href: "/xiphias-program-index",
    label: "Program Index",
    copy: "A documented composite benchmark ranking Programmes across six weighted Factors.",
    icon: Gauge,
    glow: "#e1b923",
  },
] as const;

const RING_ICONS = [Route, GraduationCap, BrainCircuit];

export default function XiaSuiteGatewayClient({ embedded = false }: { embedded?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <section id={embedded ? "xia-intelligence" : undefined} aria-labelledby="xia-suite-heading" className={`xia-type-system relative scroll-mt-24 overflow-hidden bg-primary font-sans text-white ${embedded ? "py-16 sm:py-20" : "min-h-screen pb-24 pt-24"}`}>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="type-caption inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 uppercase text-secondary">
              <Sparkles className="size-3.5" /> XIA Intelligence Suite
            </span>

            <h2 id="xia-suite-heading" className="type-page-title mt-6">
              Choose the assessment you want to run.
            </h2>

            <p className="type-body mt-5 max-w-xl text-white/70">
              Each module asks for the right details and prepares a focused, evidence-led route direction —{" "}
              <GradientText colors={["#ffffff", "#e1b923", "#ffffff"]}>ready for XIPHIAS Advisor Review</GradientText>.
            </p>

            <p className="type-small mt-6 inline-flex items-start gap-2.5 rounded-lg border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-amber-100">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" />
              An assessment aid — not a final visa decision. Eligibility and filing strategy require advisor review.
            </p>
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
                    <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/15 text-secondary shadow-lg">
                      <Icon className="size-4" />
                    </span>
                  </span>
                </motion.div>
              );
            })}

            <motion.div
              className="absolute size-[42%] rounded-full bg-secondary/20 blur-2xl"
              animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
            />
            <div className="relative flex size-[34%] flex-col items-center justify-center rounded-full bg-black/15 shadow-[0_0_55px_rgba(225,185,35,0.28)] ring-1 ring-white/25">
              <Sparkles className="size-8 text-secondary" />
              <span className="type-caption mt-1 uppercase text-white/70">XIA</span>
            </div>

            <div className="absolute -bottom-2 left-1/2 w-[90%] -translate-x-1/2 rounded-lg border border-white/20 bg-black/15 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#3cd278]" />
                <span className="type-caption uppercase text-white/50">Engine</span>
              </div>
              <TextType
                className="type-small mt-1 block text-white/85"
                text={["Reading your profile…", "Scoring eligibility…", "Auditing documents…", "Checking due-diligence risks…", "Mapping your routes…"]}
                speed={42}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Module cards ── */}
      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <p className="type-caption uppercase text-white">Select a Module</p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {suiteOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div key={option.href}>
                <TiltCard className="h-full" max={7}>
                  <Link
                    href={option.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/25 bg-black/10 p-7 backdrop-blur-sm transition duration-300 hover:border-secondary/70 hover:bg-black/15"
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
                    <h2 className="type-card-title mt-6 text-white">{option.label}</h2>
                    <p className="type-small mt-2.5 flex-1 text-white/65">{option.copy}</p>
                    <span className="type-small mt-6 inline-flex items-center gap-2 font-bold text-white">
                      Open Module
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </TiltCard>
              </div>
            );
          })}
        </div>

        <p className="type-small mt-6 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-white/60">
          After generation, the input area stays available at the top while your results remain the main focus.
        </p>
      </section>
    </section>
  );
}
