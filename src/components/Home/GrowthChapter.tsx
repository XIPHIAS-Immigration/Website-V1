"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Building2, Globe2, Scale, Users, type LucideIcon } from "lucide-react";
import { GradientText } from "@/components/motion";

type Card = { icon: LucideIcon; title: string; body: string };

const CARDS: Card[] = [
  { icon: Globe2, title: "17+ years, 25+ jurisdictions", body: "Deep, continuously updated programme knowledge across Europe, the Middle East, Asia and the Americas." },
  { icon: Scale, title: "In-house legal & compliance", body: "Licensed attorneys, audited processes and enterprise-grade documentation — no surprises, just rigour." },
  { icon: Users, title: "360° relocation support", body: "Visas, company setup, housing and schooling handled by one accountable team, end to end." },
  { icon: Building2, title: "Trusted by Fortune 500s", body: "Corporate policies, transparent reporting and SLAs built for HR and global mobility leaders." },
];

function CardFace({ card, index }: { card: Card; index: number }) {
  const Icon = card.icon;
  return (
    <div className="w-full max-w-xl rounded-[28px] border border-white/12 bg-white/[0.04] p-8 backdrop-blur-sm sm:p-10">
      <div className="flex items-center justify-between">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
          <Icon className="size-8" />
        </span>
        <span className="text-[72px] font-black leading-none text-white/10">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-6 text-[1.9rem] font-bold leading-tight text-white">{card.title}</h3>
      <p className="mt-3 text-[16px] leading-relaxed text-white/70">{card.body}</p>
    </div>
  );
}

/**
 * Pinned "chapter" — a big statement on the left while the four proof cards
 * take the limelight one at a time as the section scrolls.
 */
export default function GrowthChapter() {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(CARDS.length - 1, Math.max(0, Math.floor(p * CARDS.length)));
    setActive(idx);
  });

  if (reduce) {
    return (
      <section className="bg-gradient-to-b from-[#0a1c44] to-[#05080f] py-20 text-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight">
            A partner for global growth.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {CARDS.map((c, i) => (
              <CardFace key={c.title} card={c} index={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={outer} style={{ height: `${60 + CARDS.length * 46}vh` }} className="relative bg-gradient-to-b from-[#0a1c44] to-[#05080f] text-white">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/30 blur-[140px]" />
        <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-secondary/15 blur-[140px]" />

        <div className="relative mx-auto grid w-full max-w-screen-2xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-secondary">Why XIPHIAS</p>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-black leading-[1.05]">
              A partner for{" "}
              <GradientText colors={["#e1b923", "#ffe08a", "#e1b923"]}>global growth</GradientText>.
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/65">
              Reliable, compliant and outcome-focused — we turn complex cross-border moves into a calm,
              guided journey.
            </p>
            <div className="mt-7 flex gap-2">
              {CARDS.map((c, i) => (
                <span
                  key={c.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-secondary" : "w-3 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-[340px] items-center justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 40, rotateX: -8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 1000 }}
                className="w-full"
              >
                <CardFace card={CARDS[active]} index={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
