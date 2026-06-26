import Link from "next/link";
import { ArrowRight, Check, Clock, Wallet, Sparkles } from "lucide-react";

import { getSolution, type SolutionSlug } from "@/lib/solutions";

const TRACK_PILL: Record<string, string> = {
  citizenship: "Citizenship",
  residency: "Residency",
  skilled: "Skilled",
  corporate: "Corporate",
};

export default function SolutionPage({ slug }: { slug: SolutionSlug }) {
  const { config, programmes } = getSolution(slug);

  return (
    <main className="bg-[#fdfbf7] pb-20 pt-28 dark:bg-darkmode">
      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0a1f44]/15 bg-white px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a1f44] dark:border-white/15 dark:bg-white/5 dark:text-white">
            <Sparkles className="size-3.5 text-[#c2992f]" /> {config.eyebrow}
          </span>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.05] tracking-tight text-[#0a1f44] dark:text-white">
            {config.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#4a5568] dark:text-white/65">
            {config.intro}
          </p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {config.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px] text-[#0a1f44] dark:text-white/80">
                <Check className="mt-0.5 size-4 shrink-0 text-[#c2992f]" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/personal-booking"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c2992f] px-6 py-3.5 text-[14px] font-bold text-[#0a1f44] shadow-sm transition hover:bg-[#d8ad1f]"
            >
              Book a consultation <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/eligibility#start"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0a1f44]/20 bg-white px-6 py-3.5 text-[14px] font-bold text-[#0a1f44] transition hover:border-[#c2992f]/60 dark:border-white/20 dark:bg-white/5 dark:text-white"
            >
              Check eligibility
            </Link>
          </div>
        </div>
      </section>

      {/* Featured programmes */}
      {programmes.length > 0 && (
        <section className="mx-auto mt-14 max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-[18px] font-black tracking-tight text-[#0a1f44] dark:text-white">
            Programmes that fit
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-[#0a1f44]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c2992f]/50 hover:shadow-md dark:border-white/10 dark:bg-[#0b1322]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#0a1f44]/5 px-2.5 py-1 text-[11px] font-semibold text-[#0a1f44] dark:bg-white/10 dark:text-white/80">
                    {TRACK_PILL[item.track]}
                  </span>
                  <span className="text-[12px] font-semibold text-[#8a94a6]">{item.country}</span>
                </div>
                <h3 className="mt-3 text-[16px] font-bold text-[#0a1f44] dark:text-white">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[#4a5568] dark:text-white/65">
                  {item.summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-[#0a1f44] dark:text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-[#c2992f]" /> {item.investmentLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#c2992f]" /> {item.timelineLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tools */}
      <section className="mx-auto mt-14 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-[18px] font-black tracking-tight text-[#0a1f44] dark:text-white">
          Plan it with our tools
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {config.tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group flex flex-col rounded-2xl border border-[#0a1f44]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c2992f]/50 hover:shadow-md dark:border-white/10 dark:bg-[#0b1322]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0a1f44] dark:text-white">{t.label}</h3>
                <ArrowRight className="size-4 text-[#c2992f] transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-[13px] text-[#4a5568] dark:text-white/65">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
