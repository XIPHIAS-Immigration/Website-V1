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

      <div className="mx-auto w-full max-w-screen-2xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c83f]">Immigration strategy, reports and advisory</p>
          <h1 id="home-hero-title" className="type-page-title mt-4">
            Best Immigration Consultant in India
          </h1>
          <p className="type-body mx-auto mt-5 max-w-3xl text-white/75">
            Explore skilled migration, residency, citizenship, investment and corporate mobility routes across 50+ countries—with a clear way to register or buy the exact report you need.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/registration"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#d8ad1f] px-7 text-base font-black text-primary shadow-[0_12px_30px_rgba(216,173,31,0.25)] transition hover:bg-[#efc939]"
            >
              Register for full assessment — INR 4,999 incl. GST
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/reports"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-7 text-base font-black text-white transition hover:bg-white/15"
            >
              Choose a report — from INR 499
              <FileText className="size-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mx-auto mt-9 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {[
              ["01", "Choose", "See every report and price"],
              ["02", "Enter details", "Only information the report needs"],
              ["03", "Pay & download", "Secure JioPay and PDF delivery"],
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-lg border border-white/15 bg-black/15 p-4 backdrop-blur-sm">
                <p className="text-xs font-black text-[#f0c83f]">{number}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-black"><Check className="size-4 text-[#f0c83f]" />{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">{copy}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-white/55">
            <ShieldCheck className="size-4 text-emerald-300" /> Catalogue prices are enforced by the server; missing information is never invented.
          </p>
        </div>
      </div>
    </section>
  );
}
