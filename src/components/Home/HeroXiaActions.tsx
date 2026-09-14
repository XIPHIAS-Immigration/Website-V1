"use client";

// src/components/Home/HeroXiaActions.tsx
// -----------------------------------------------------------------------------
// The two XIA entries in the hero. A client island, so the rest of the hero
// stays a server component and keeps its markup in the first HTML response —
// which is what the page is ranked on.
//
// "Ask XIA" opens the assistant over the page. "Route Intelligence" goes to the
// tool for people who would rather drive it themselves.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { LayoutGrid, Sparkles } from "lucide-react";

import { openXiaChat } from "@/components/Xia/xia-chat";

const SHELL =
  "inline-flex min-h-[clamp(3rem,calc(2.8rem+0.5vw),3.5rem)] items-center justify-center gap-2 rounded-full px-[clamp(1.25rem,1.7vw,2.25rem)] text-[clamp(0.95rem,calc(0.86rem+0.18vw),1.15rem)] font-black backdrop-blur-sm transition";

export default function HeroXiaActions() {
  return (
    <>
      <button
        type="button"
        onClick={() => openXiaChat()}
        className={`${SHELL} border border-[#f0c83f]/55 bg-[#f0c83f]/10 text-[#f0c83f] hover:bg-[#f0c83f]/20`}
      >
        <Sparkles className="size-[1.15em]" aria-hidden="true" />
        Ask XIA
      </button>
      <Link
        href="/xia-intelligence"
        className={`${SHELL} border border-white/35 bg-white/10 text-white hover:bg-white/15`}
      >
        <LayoutGrid className="size-[1.15em]" aria-hidden="true" />
        Route Intelligence
      </Link>
    </>
  );
}
