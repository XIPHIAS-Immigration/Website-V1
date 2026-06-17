"use client";

import { CharReveal, Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";

const STATS = [
  { to: 17, suffix: "+", label: "Years of excellence" },
  { to: 50, suffix: "+", label: "Countries covered" },
  { to: 10000, suffix: "+", label: "Families relocated" },
  { to: 98, suffix: "%", label: "Visa success rate" },
];

/** Bold proof-points band with count-up numbers. */
export default function StatsBand() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-white dark:bg-[#0a1c44]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-secondary">
            The numbers behind the trust
          </p>
          <h2 className="mt-3 text-[2rem] font-bold leading-tight sm:text-[2.5rem]">
            <CharReveal text="Outcomes, not promises." />
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <Counter
                to={s.to}
                suffix={s.suffix}
                className="block text-[2.75rem] font-black leading-none text-secondary sm:text-[3.5rem]"
              />
              <span className="mt-2 block text-[13px] font-medium uppercase tracking-[0.14em] text-white/70">
                {s.label}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
