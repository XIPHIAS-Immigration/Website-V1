import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileText, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section id="main-banner" aria-labelledby="home-hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-primary pt-28 text-white sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-primary/80" />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-[clamp(3rem,7vh,7rem)] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[clamp(0.75rem,calc(0.68rem+0.18vw),0.95rem)] font-bold uppercase tracking-[0.18em] text-[#f0c83f]">
            Immigration strategy, reports and advisory
          </p>
          <h1
            id="home-hero-title"
            className="mt-[clamp(1rem,2vh,1.5rem)] text-[clamp(2.5rem,calc(2rem+2.1vw),4.75rem)] font-bold leading-[1.06] tracking-normal"
          >
            Best Immigration Consultant in India
          </h1>
          <p className="mx-auto mt-[clamp(1.25rem,2.5vh,1.75rem)] max-w-4xl text-[clamp(1rem,calc(0.85rem+0.3vw),1.35rem)] font-normal leading-[1.65] text-white/75">
            Explore skilled migration, residency, citizenship, investment and corporate mobility routes across 50+ countries—with a clear way to register or buy the exact report you need.
          </p>

          <div className="mt-[clamp(2rem,4.5vh,3rem)] flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/registration"
              className="inline-flex min-h-[clamp(3.5rem,calc(3rem+1.3vw),4.5rem)] items-center justify-center gap-2.5 rounded-md bg-[#d8ad1f] px-[clamp(1.5rem,2.2vw,2.75rem)] text-[clamp(1rem,calc(0.85rem+0.25vw),1.2rem)] font-black text-primary shadow-[0_12px_30px_rgba(216,173,31,0.25)] transition hover:bg-[#efc939]"
            >
              Register for full assessment — INR 4,999 incl. GST
              <ArrowRight className="size-[clamp(1.25rem,1.5vw,1.5rem)]" aria-hidden="true" />
            </Link>
            <Link
              href="/reports"
              className="inline-flex min-h-[clamp(3.5rem,calc(3rem+1.3vw),4.5rem)] items-center justify-center gap-2.5 rounded-md border border-white/35 bg-white/10 px-[clamp(1.5rem,2.2vw,2.75rem)] text-[clamp(1rem,calc(0.85rem+0.25vw),1.2rem)] font-black text-white transition hover:bg-white/15"
            >
              Choose a report — from INR 499
              <FileText className="size-[clamp(1.25rem,1.5vw,1.5rem)]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mx-auto mt-[clamp(2.25rem,5vh,3.5rem)] grid max-w-5xl gap-4 text-left sm:grid-cols-3">
            {[
              ["01", "Choose", "See every report and price"],
              ["02", "Enter details", "Only information the report needs"],
              ["03", "Pay & download", "Secure JioPay and PDF delivery"],
            ].map(([number, title, copy]) => (
              <div
                key={number}
                className="flex min-h-[clamp(6.5rem,calc(5rem+2.8vw),8.75rem)] flex-col justify-center rounded-lg border border-white/15 bg-black/15 p-[clamp(1rem,1.5vw,1.625rem)] backdrop-blur-sm"
              >
                <p className="text-[clamp(0.75rem,calc(0.68rem+0.12vw),0.875rem)] font-black text-[#f0c83f]">{number}</p>
                <p className="mt-2 flex items-center gap-2.5 text-[clamp(0.95rem,calc(0.8rem+0.22vw),1.125rem)] font-black">
                  <Check className="size-[clamp(1rem,1.2vw,1.25rem)] text-[#f0c83f]" />
                  {title}
                </p>
                <p className="mt-1.5 text-[clamp(0.8rem,calc(0.72rem+0.16vw),1rem)] leading-6 text-white/60">{copy}</p>
              </div>
            ))}
          </div>

          <p className="mt-[clamp(1.5rem,3vh,2rem)] inline-flex items-center gap-2.5 text-[clamp(0.75rem,calc(0.68rem+0.12vw),0.875rem)] font-semibold text-white/60">
            <ShieldCheck className="size-[clamp(1rem,1.2vw,1.25rem)] text-emerald-300" /> Catalogue prices are enforced by the server; missing information is never invented.
          </p>
        </div>
      </div>
    </section>
  );
}
