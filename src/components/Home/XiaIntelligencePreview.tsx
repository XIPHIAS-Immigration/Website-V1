import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  Route,
  Scale,
  ShieldCheck,
} from "lucide-react";

const PRIMARY_TOOLS = [
  {
    href: "/eligibility",
    title: "Check my eligibility",
    copy: "Answer a few questions and see which immigration directions may deserve closer review.",
    icon: ClipboardCheck,
    action: "Start eligibility check",
  },
  {
    href: "/route-intelligence",
    title: "Find my best route",
    copy: "Compare destinations and programmes against your goal, profile, budget and timeline.",
    icon: Route,
    action: "Explore route options",
  },
  {
    href: "/due-diligence-intelligence",
    title: "Check immigration risks",
    copy: "Review immigration history, evidence and document concerns before taking the next step.",
    icon: ShieldCheck,
    action: "Run due diligence",
  },
] as const;

const MORE_TOOLS = [
  { href: "/cost-estimator", label: "Cost estimator", icon: Calculator },
  { href: "/compare-programs", label: "Compare programmes", icon: Scale },
  { href: "/document-readiness", label: "Document readiness", icon: FileCheck2 },
  { href: "/us-visa-intelligence", label: "US visa intelligence", icon: BrainCircuit },
] as const;

export default function XiaIntelligencePreview() {
  return (
    <section aria-labelledby="xia-intelligence-heading" className="border-y border-slate-200 bg-slate-50 py-12 text-slate-950 sm:py-14">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="type-caption inline-flex items-center gap-2 uppercase text-primary">
              <BrainCircuit className="size-4" aria-hidden="true" />
              XIA Immigration Intelligence
            </p>
            <h2 id="xia-intelligence-heading" className="type-section-title mt-3 max-w-3xl">
              Explore your options before deciding what to do next.
            </h2>
            <p className="type-body mt-3 max-w-3xl text-slate-600">
              Not ready to purchase or register? Start with one focused XIA tool and investigate the question that matters now.
            </p>
          </div>
          <Link href="/xia-intelligence" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:brightness-110">
            View all XIA tools <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {PRIMARY_TOOLS.map(({ href, title, copy, icon: Icon, action }, index) => (
            <Link key={href} href={href} className="group flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                <span className="text-xs font-black text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{copy}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                {action} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {MORE_TOOLS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-primary">
                <Icon className="size-4 text-[#b48d10]" aria-hidden="true" /> {label}
              </Link>
            ))}
          </div>
          <p className="shrink-0 text-xs font-semibold text-slate-400">Indicative guidance · Verify before filing</p>
        </div>
      </div>
    </section>
  );
}
