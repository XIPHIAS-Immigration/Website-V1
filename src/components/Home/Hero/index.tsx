import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import HeroXiaActions from "@/components/Home/HeroXiaActions";

// Popular destination chips — every link is a live programme page.
const DESTINATIONS: { name: string; flag: string; href: string }[] = [
  { name: "Canada", flag: "canada.png", href: "/skilled/canada" },
  { name: "Australia", flag: "Australia.png", href: "/skilled/australia" },
  { name: "USA", flag: "USA.png", href: "/skilled/usa" },
  { name: "UK", flag: "uk.png", href: "/skilled/united-kingdom" },
  { name: "Portugal", flag: "Portugal.png", href: "/residency/portugal" },
  { name: "Greece", flag: "Greece.png", href: "/residency/greece" },
  { name: "UAE", flag: "UAE.png", href: "/residency/uae" },
  { name: "New Zealand", flag: "New-zeland.png", href: "/skilled/new-zealand" },
];

const STEPS: [string, string][] = [
  ["01", "Tell us about you"],
  ["02", "See your routes"],
  ["03", "Get started"],
];

export default function Hero() {
  return (
    <section id="main-banner" aria-labelledby="home-hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-primary pt-28 text-white sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-100">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover object-[35%_center]"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/90 via-primary/55 to-primary/95" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-[clamp(1.5rem,3vh,2.5rem)] sm:px-6 lg:px-10">
        {/* Main block — vertically centred in the remaining space. */}
        <div className="mx-auto my-auto w-full max-w-7xl py-[clamp(1.5rem,4vh,3rem)] text-center">
          <p className="text-[clamp(0.75rem,calc(0.68rem+0.18vw),1rem)] font-bold uppercase tracking-[0.18em] text-[#f0c83f] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Immigration strategy, reports and advisory
          </p>
          <h1
            id="home-hero-title"
            className="mt-[clamp(1.25rem,3vh,2rem)] text-[clamp(2.5rem,calc(2rem+2.1vw),5rem)] font-bold leading-[1.12] tracking-normal drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)]"
          >
            Top Immigration Consultants in India
          </h1>
          <p className="mx-auto mt-[clamp(1.5rem,3.5vh,2.25rem)] max-w-4xl text-[clamp(1rem,calc(0.85rem+0.3vw),1.45rem)] font-normal leading-[1.75] text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Tell us what you do, where you want to go and what the move should achieve. We check you against the published rules of every programme we work on and show your routes, strongest first.
          </p>

          {/* One front door. The old four equal pills asked a first-time visitor to
              choose between registering, a report, a chat and a tool before they
              knew which route was theirs. Ask XIA still floats on every page. */}
          <div className="mt-[clamp(2rem,5vh,3rem)] flex flex-wrap items-center justify-center gap-[clamp(0.75rem,1vw,1.25rem)]">
            <HeroXiaActions />
          </div>

          {/* Popular destinations — functional filler, every chip is a live page. */}
          <p className="mt-[clamp(2.25rem,5.5vh,3.5rem)] text-[clamp(0.7rem,calc(0.64rem+0.12vw),0.85rem)] font-bold uppercase tracking-[0.22em] text-white/50">
            Popular destinations
          </p>
          <div className="mx-auto mt-[clamp(0.875rem,2vh,1.25rem)] flex max-w-5xl flex-wrap items-center justify-center gap-[clamp(0.625rem,0.9vw,1rem)]">
            {DESTINATIONS.map((destination) => (
              <Link
                key={destination.name}
                href={destination.href}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/25 py-[clamp(0.5rem,0.7vw,0.75rem)] pl-[clamp(0.625rem,0.8vw,0.875rem)] pr-[clamp(1rem,1.2vw,1.375rem)] text-[clamp(0.85rem,calc(0.78rem+0.16vw),1.05rem)] font-bold text-white/85 backdrop-blur-md transition hover:border-[#f0c83f]/60 hover:bg-black/40 hover:text-white"
              >
                <span className="relative h-[1.35em] w-[1.9em] shrink-0 overflow-hidden rounded-[0.25em] ring-1 ring-white/25">
                  <Image src={`/images/flags/${destination.flag}`} alt="" fill sizes="40px" className="object-cover" />
                </span>
                {destination.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Slim orientation strip pinned to the hero's bottom edge. */}
        <div className="mx-auto w-full max-w-6xl border-t border-white/15 pt-[clamp(0.875rem,2vh,1.375rem)] text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-[clamp(1.25rem,2.2vw,2.5rem)] gap-y-2">
            {STEPS.map(([number, title]) => (
              <p key={number} className="flex items-center gap-2 text-[clamp(0.8rem,calc(0.74rem+0.14vw),0.95rem)] font-bold text-white/75">
                <span className="font-black text-[#f0c83f]">{number}</span>
                {title}
              </p>
            ))}
            <p className="flex items-center gap-2 text-[clamp(0.75rem,calc(0.7rem+0.12vw),0.9rem)] font-semibold text-white/55">
              <ShieldCheck className="size-[1.3em] text-emerald-300" aria-hidden="true" />
              Server-enforced catalogue prices
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
