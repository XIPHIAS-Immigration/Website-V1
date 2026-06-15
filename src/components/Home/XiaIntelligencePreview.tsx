import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Route, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "Route fit",
    copy: "Compare destination, timeline, budget, family, and physical presence preferences.",
    icon: Route,
  },
  {
    title: "Evidence review",
    copy: "Add skills, education, work history, funds, CV notes, and document signals.",
    icon: FileText,
  },
  {
    title: "Advisor handoff",
    copy: "Save the assessment into X-Hub so the XIPHIAS team can review it.",
    icon: ShieldCheck,
  },
];

export default function XiaIntelligencePreview() {
  return (
    <section aria-labelledby="xia-home-heading" className="py-10 sm:py-14">
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-7 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-200 dark:ring-blue-900/50">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              XIA Intelligence by XIPHIAS
            </span>

            <h2
              id="xia-home-heading"
              className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl md:text-5xl"
            >
              Start with a guided route assessment before choosing a programme.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-300 sm:text-lg">
              XIA helps visitors shortlist immigration directions from XIPHIAS programme knowledge,
              then keeps the result ready for advisor review and X-Hub follow-up.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/xia-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Open XIA Intelligence
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/route-intelligence"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
              >
                Try quick route check
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="xia-home-line" aria-hidden="true" />
            <div className="relative grid gap-3">
              {steps.map(({ title, copy, icon: Icon }, index) => (
                <article
                  key={title}
                  className="group flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:ring-blue-200 dark:bg-white/5 dark:ring-white/10 dark:hover:ring-blue-800"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-200 dark:ring-blue-900/40">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">0{index + 1}</span>
                      {title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-zinc-700 dark:text-zinc-300">{copy}</span>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .xia-home-line {
          position: absolute;
          inset: 28px auto 28px 38px;
          width: 2px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(28,87,180,0.15), rgba(225,185,35,0.85), rgba(28,87,180,0.15));
          animation: xiaHomeSignal 2.8s ease-in-out infinite;
        }
        @keyframes xiaHomeSignal {
          0%, 100% { opacity: 0.45; transform: translateY(-8px); }
          50% { opacity: 1; transform: translateY(8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .xia-home-line { animation: none; }
        }
      `}</style>
    </section>
  );
}
