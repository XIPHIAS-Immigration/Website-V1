// ==============================================
// components/team/Hero.tsx – styled like your HeroPremium
// ==============================================
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Download, Open, Dot } from "@/components/Team/Icons";
import { cn } from "@/components/Team/cn";

type HeroProps = { title: string; subtitle: string; primaryHref: string; primaryText: string; secondaryHref: string; secondaryText: string; badge?: string; align?: "left" | "center"; className?: string };

export function Hero({ title, subtitle, primaryHref, primaryText, secondaryHref, secondaryText, badge = "", align = "left", className = "" }: HeroProps) {
  const alignClasses = align === "center" ? "text-center md:max-w-3xl mx-auto" : "text-left";
  const isPdf = typeof secondaryHref === "string" && secondaryHref.endsWith(".pdf");
  const heroId = "team-hero-title";

  return (
    <section aria-labelledby={heroId} className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10","bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80","dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40","text-black dark:text-white", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>
      <div className={cn("relative", alignClasses)}>
        {badge ? (<span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800"><Dot className="mr-1.5" />{badge}</span>) : null}
        <h1 id={heroId} className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">{title}</h1>
        <p className="mt-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">{subtitle}</p>
        <div className={cn("mt-6 flex flex-wrap items-center gap-3", align === "center" && "justify-center") }>
          <Link href={primaryHref} prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition" aria-label={primaryText}>{primaryText}<ArrowRight /></Link>
          {isPdf ? (
            <a href={secondaryHref} download className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition" aria-label={secondaryText}><Download />{secondaryText}</a>
          ) : (
            <Link href={secondaryHref} prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition" aria-label={secondaryText}><Open />{secondaryText}</Link>
          )}
          <span className="ml-0 md:ml-2 text-xs text-zinc-500 dark:text-zinc-400">No obligation · Response within 24 hours</span>
        </div>
      </div>
    </section>
  );
}