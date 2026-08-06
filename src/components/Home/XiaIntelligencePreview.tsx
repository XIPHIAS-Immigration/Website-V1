import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const REPORT_CONTENT = [
  "Best-fit immigration route comparison",
  "Profile strengths and evidence gaps",
  "Document readiness checklist",
  "Indicative cost and timeline",
  "Risk flags requiring advisor review",
  "A prioritised action plan",
];

const REPORT_PAGES = [
  { number: "01", title: "Route direction", accent: "bg-[#1553af]", bars: ["w-full", "w-4/5", "w-3/5"] },
  { number: "02", title: "Evidence map", accent: "bg-[#d8ad1f]", bars: ["w-11/12", "w-2/3", "w-5/6"] },
  { number: "03", title: "Action plan", accent: "bg-emerald-600", bars: ["w-3/4", "w-full", "w-1/2"] },
] as const;

export default function XiaIntelligencePreview() {
  return (
    <section aria-labelledby="premium-report-heading" className="border-b border-slate-200 bg-slate-50 py-14 text-slate-950 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#1553af]">
            <FileCheck2 className="size-4" aria-hidden="true" />
            From exploration to a clear decision
          </p>
          <h2 id="premium-report-heading" className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            See the direction for free. Unlock the detail when it is useful.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            XIA first creates an indicative assessment from your answers. The premium report expands that preview into an advisor-ready plan you can review, share, and act on.
          </p>

          <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {REPORT_CONTENT.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm font-semibold leading-6 text-slate-700">
                <Check className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/deep-analysis" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#1553af] px-5 text-sm font-bold text-white transition hover:bg-[#0d438f]">
              Start Deep Analysis
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="/samples/xiphias-premium-report-sample.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-[#1553af] hover:text-[#1553af]"
            >
              View sample PDF
              <FileText className="size-4" aria-hidden="true" />
            </a>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
            Payment is requested only when you choose to unlock the detailed report.
          </p>
        </div>

        <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-slate-200 bg-[#071a3a] p-5 sm:p-8" aria-label="Example report sections">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5 text-white">
            <div>
              <p className="text-xs font-bold uppercase text-[#f0c83f]">XIPHIAS premium report</p>
              <p className="mt-1 text-lg font-bold">Built from your assessment</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white/75">
              <LockKeyhole className="size-4 text-[#f0c83f]" />
              Personalised
            </span>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3 sm:items-start">
            {REPORT_PAGES.map((page, index) => (
              <article key={page.number} className={`min-h-[285px] rounded-md bg-white p-4 text-slate-950 shadow-xl ${index === 1 ? "sm:mt-7" : index === 2 ? "sm:mt-14" : ""}`}>
                <div className={`h-1.5 w-10 rounded-full ${page.accent}`} />
                <p className="mt-5 text-[10px] font-bold uppercase text-slate-400">Section {page.number}</p>
                <h3 className="mt-1 text-base font-bold">{page.title}</h3>
                <div className="mt-5 space-y-2.5">
                  {page.bars.map((width, barIndex) => (
                    <div key={`${width}-${barIndex}`} className={`h-2 rounded-full bg-slate-100 ${width}`} />
                  ))}
                </div>
                <div className="mt-6 border-l-2 border-[#d8ad1f] bg-amber-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-amber-800">Advisor checkpoint</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Evidence and current programme rules are verified before action.</p>
                </div>
                {index > 0 && (
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <LockKeyhole className="size-3.5" /> Detailed report section
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
