// components/awards/Showcase.tsx
import React from "react";
import { awardsData, Award } from "./awards.data";
import { AwardsGrid } from "./AwardsGrid";
import { AwardsMarquee } from "./AwardsMarquee";

type Props = {
  /** "page" shows hero + grid. "preview" shows the auto-scroll strip. */
  variant?: "page" | "preview";
  items?: Award[];
  className?: string; // custom container padding if needed
};

export function Awards({ variant = "page", items = awardsData, className = "" }: Props) {
  if (variant === "preview") {
    return <AwardsMarquee items={items} className={className || "mx-auto max-w-screen-2xl px-4 py-5"} />;
  }

  return (
    <section className={className || "mx-auto max-w-7xl px-4 py-10 md:py-12"}>
      <HeroBlock />
      <div className="mt-10 md:mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Awards & Recognition</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            A curated selection of our most meaningful honors.
          </p>
        </div>
        <AwardsGrid items={items} />
      </div>
    </section>
  );
}

/* compact hero that matches blue→purple theme */
function HeroBlock() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10 ring-1 bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-blue-100/80 text-slate-900 dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40 dark:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl dark:bg-indigo-700/15" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-blue-700/15" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      <div className="relative">
        <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          Recognition
        </span>

        <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
          Awards &amp; Recognition
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
          Independent publications have highlighted our innovation, industry leadership, and client-first execution.
        </p>
      </div>
    </div>
  );
}
