// components/about/Timeline.tsx
import React from "react";

type Milestone = {
  year: string;
  title: string;
  text: string;
  tone?: "brand" | "legal"; // optional chip to distinguish legal vs brand milestones
  meta?: string;
};

const milestones: Milestone[] = [
  {
    year: "2009",
    title: "Founded in Bangalore",
    text:
      "XIPHIAS established with a regulation-first approach across skilled, investor and corporate tracks.",
    tone: "brand",
  },
  {
    year: "2015",
    title: "Incorporated as Xiphias Immigration Private Limited",
    text: "Legal incorporation in India (RoC-Bangalore).",
    tone: "legal",
    meta: "CIN: U74900KA2015PTC078396",
  },
  {
    year: "2017",
    title: "Enterprise Mobility",
    text:
      "Scaled corporate immigration and compliance programs for multi-country deployments.",
    tone: "brand",
  },
  {
    year: "2021",
    title: "HNI Investment Migration",
    text:
      "Expanded Golden Visa and investment migration advisory with white-glove handling.",
    tone: "brand",
  },
  {
    year: "2024",
    title: "Multi-country Footprint",
    text:
      "On-ground presence and representation across key markets, including the Gulf & EU corridors.",
    tone: "brand",
  },
  {
    year: "2025",
    title: "Thought Leadership Elevation",
    text:
      "Strengthened positioning in investment migration via strategic communications and media features.",
    tone: "brand",
  },
];

export default function Timeline() {
  const titleId = "timeline-title";

  return (
    <section
      id="timeline"
      className="py-6 md:py-6"
      aria-labelledby={titleId}
    >
      {/* container aligned with hero + overflow safety */}
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">
        {/* gradient, ringed wrapper (hero aesthetic) */}
        <div
          className={[
            "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
            "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
            "ring-1 ring-blue-100/80 shadow-sm",
            "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
            "text-black dark:text-white",
          ].join(" ")}
        >
          {/* soft background accents (clipped) */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="hidden sm:block absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="hidden sm:block absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
            <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          </div>

          {/* header */}
          <header className="relative mb-6 md:mb-8">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
              <Dot className="mr-1.5" />
              Our Journey
            </span>

            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px] break-words"
            >
              Milestones That Shape Our Expertise
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
              A decade-plus of building trust through diligent work and measurable outcomes.
            </p>
          </header>

          {/* legend */}
          <div className="relative mb-4 flex flex-wrap gap-2 text-[11px]">
            <LegendChip tone="brand">Brand milestone</LegendChip>
            <LegendChip tone="legal">Legal/registration milestone</LegendChip>
          </div>

          {/* timeline */}
          <ol className="relative border-l border-blue-100 pl-6 dark:border-blue-900/40">
            {milestones.map((m) => (
              <li key={`${m.year}-${m.title}`} className="mb-8 last:mb-0">
                {/* node */}
                <span
                  className={[
                    "absolute -left-[7px] inline-block h-3.5 w-3.5 rounded-full ring-2",
                    m.tone === "legal"
                      ? "bg-amber-400 ring-amber-200 dark:bg-amber-300 dark:ring-amber-900/40"
                      : "bg-blue-600 ring-blue-100 dark:bg-blue-300 dark:ring-blue-900/40",
                  ].join(" ")}
                />

                <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-blue-100/70 backdrop-blur dark:bg:white/5 dark:ring-blue-900/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-widest text-blue-700 dark:text-blue-300">
                      {m.year}
                    </p>
                    {m.tone && (
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                          m.tone === "legal"
                            ? "bg-amber-500/10 text-amber-800 ring-amber-300 dark:text-amber-200 dark:ring-amber-700"
                            : "bg-blue-600/10 text-blue-800 ring-blue-300 dark:text-blue-200 dark:ring-blue-800",
                        ].join(" ")}
                      >
                        {m.tone === "legal" ? "Legal" : "Brand"}
                      </span>
                    )}
                    {m.meta && (
                      <span className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] ring-1 ring-zinc-200 dark:bg-black/30 dark:ring-white/10">
                        {m.meta}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 text-base font-semibold leading-tight break-words">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 break-words">
                    {m.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* disclaimer */}
          <p className="relative mt-4 text-[11px] text-zinc-600 dark:text-zinc-400">
            *Timeline blends brand and legal milestones sourced from publicly available records and
            company materials. No guarantees. Eligibility & rules apply.
          </p>
        </div>
      </div>
    </section>
  );
}

/* tiny UI atoms */
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}
function LegendChip({
  tone,
  children,
}: {
  tone: "brand" | "legal";
  children: React.ReactNode;
}) {
  const cls =
    tone === "legal"
      ? "bg-amber-500/10 text-amber-800 ring-amber-300 dark:text-amber-200 dark:ring-amber-700"
      : "bg-blue-600/10 text-blue-800 ring-blue-300 dark:text-blue-200 dark:ring-blue-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}