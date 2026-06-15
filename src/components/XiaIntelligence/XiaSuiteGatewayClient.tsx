"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, GraduationCap, Route, Sparkles } from "lucide-react";

const suiteOptions = [
  {
    href: "/route-intelligence",
    label: "Route Intelligence",
    copy: "Compare route options by goal, destination, budget, timeline, family needs, and physical presence.",
    icon: Route,
  },
  {
    href: "/deep-analysis",
    label: "Deep Analysis",
    copy: "Add education, experience, skills, CV notes, and evidence markers for a more detailed review.",
    icon: GraduationCap,
  },
  {
    href: "/us-visa-intelligence",
    label: "US Visa Intelligence",
    copy: "Review US visa directions including EB1A, EB2 NIW, O1A, H-1B, L1, founder, and employer routes.",
    icon: BrainCircuit,
  },
] as const;

export default function XiaSuiteGatewayClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pt-8 text-slate-950 transition-colors dark:bg-darkmode dark:text-white">
      <section className="container py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-screen-xl rounded-xl border border-slate-200 bg-white p-5 shadow-cause-shadow dark:border-slate-800 dark:bg-darklight sm:p-8 lg:p-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-primary dark:border-blue-900 dark:bg-white/5 dark:text-blue-200">
            <Sparkles className="size-4" />
            XIA assessment suite
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-midnight_text dark:text-white sm:text-5xl">
                Choose the assessment you want to run.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/82 sm:text-base">
                Select one assessment area. Each page asks for the relevant details and prepares a focused route
                direction for XIPHIAS advisor review.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
              This is an assessment aid, not a final visa decision. Final eligibility and filing strategy require
              XIPHIAS advisor review.
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {suiteOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.href}
                  type="button"
                  onClick={() => router.push(option.href)}
                  className="group rounded-xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950"
                >
                  <span className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-lg bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white dark:bg-white/10 dark:text-blue-200">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-white/45">
                      0{index + 1}
                    </span>
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-midnight_text dark:text-white">{option.label}</h2>
                  <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600 dark:text-white/72">{option.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-blue-200">
                    Open module
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            After generation, the input area stays available at the top while the results remain the main focus.
          </div>
        </motion.div>
      </section>
    </div>
  );
}
