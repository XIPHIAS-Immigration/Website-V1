"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Landmark, Plane, Sparkles } from "lucide-react";
import { CharReveal, HorizontalScroll, Reveal, TiltCard } from "@/components/motion";

type Pathway = {
  key: string;
  title: string;
  href: string;
  blurb: string;
  stat: string;
  gradient: string;
  image: string;
  icon: typeof Landmark;
};

const PATHWAYS: Pathway[] = [
  {
    key: "citizenship",
    title: "Citizenship by Investment",
    href: "/citizenship",
    blurb: "Second passports through donation or real estate — visa-free travel, security, and a genuine global plan B for your family.",
    stat: "8+ programmes",
    gradient: "from-[#b8860b]/80 to-[#0a1c44]/90",
    image: "/images/citizenship/grenada/grenada-citizenship.webp",
    icon: Landmark,
  },
  {
    key: "residency",
    title: "Residency by Investment",
    href: "/residency",
    blurb: "Golden visas and investor residence permits across Europe, the Gulf and beyond — live, study and grow on your terms.",
    stat: "19+ countries",
    gradient: "from-[#0e7c66]/80 to-[#0a1c44]/90",
    image: "/images/residency/portugal/portugal-golden-visa.webp",
    icon: Plane,
  },
  {
    key: "skilled",
    title: "Skilled Migration",
    href: "/skilled",
    blurb: "Points-based permanent residency and work visas for talent — Canada, Australia, Germany and the UK, mapped to your profile.",
    stat: "Points-based PR",
    gradient: "from-[#2563eb]/80 to-[#10204a]/90",
    image: "/images/skilled/canada/canada-express-entry.webp",
    icon: Sparkles,
  },
  {
    key: "corporate",
    title: "Corporate Mobility",
    href: "/corporate",
    blurb: "Intra-company transfers, market entry and global workforce mobility — compliant relocation for teams and founders.",
    stat: "Enterprise-ready",
    gradient: "from-[#7c3aed]/80 to-[#10204a]/90",
    image: "/images/corporate/singapore/singapore.webp",
    icon: Briefcase,
  },
];

export default function PathwaysShowcase() {
  return (
    <div className="bg-grey dark:bg-darkmode">
      <div className="mx-auto max-w-screen-2xl px-4 pb-2 pt-16 sm:px-6 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-primary/40 dark:bg-primary/10 dark:text-[#7fb0ff]">
            Four ways we move you
          </span>
        </Reveal>
        <h2 className="mt-5 max-w-3xl text-[2rem] font-bold leading-tight tracking-tight text-midnight_text dark:text-white sm:text-[2.6rem]">
          <CharReveal text="Choose the pathway to your global future." />
        </h2>
        <p className="mt-3 max-w-xl text-[15px] text-light_grey dark:text-white/60">
          Keep scrolling to glide through each route — then dive into the destinations and programmes.
        </p>
      </div>

      <HorizontalScroll className="bg-grey dark:bg-darkmode" ariaLabel="Migration pathways">
        {PATHWAYS.map((p, i) => {
          const Icon = p.icon;
          return (
            <article key={p.key} className="h-[60vh] max-h-[540px] w-[82vw] max-w-[540px] shrink-0">
              <TiltCard className="group relative h-full overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/40">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width:1024px) 82vw, 540px"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

                <div className="relative flex h-full flex-col p-8 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                      <Icon className="size-7" />
                    </span>
                    <span className="text-[64px] font-black leading-none text-white/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-auto text-[1.7rem] font-bold leading-tight">{p.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85">{p.blurb}</p>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[12.5px] font-bold text-white backdrop-blur-sm">
                      {p.stat}
                    </span>
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0a1c44] transition hover:bg-secondary group-hover:gap-3"
                    >
                      Explore
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </article>
          );
        })}
      </HorizontalScroll>
    </div>
  );
}
