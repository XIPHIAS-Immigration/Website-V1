// ==============================================
// components/team/CTA.tsx
// ==============================================
import React from "react";
import Link from "next/link";
import { ArrowRight, Download } from "@/components/Team/Icons";

export function CTA(){
  return (
    <section aria-labelledby="cta-title" className="mt-16">
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100 dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900 text-black dark:text-white">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" aria-hidden="true" />
        <div className="relative md:flex items-center justify-between gap-6">
          <div>
            <h2 id="cta-title" className="text-2xl md:text-3xl font-semibold tracking-tight">Build with the senior team.</h2>
            <p className="mt-2 text-sm md:text-base text-zinc-700 dark:text-zinc-300">Book a zero-pressure discovery call. We respond within 24 hours.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/contact" prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition">Book a Call <ArrowRight /></Link>
            <Link href="/capability-deck.pdf" prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition">Download Deck <Download /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}