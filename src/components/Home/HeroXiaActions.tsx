"use client";

// src/components/Home/HeroXiaActions.tsx
// -----------------------------------------------------------------------------
// The hero's one button. A client island, so the rest of the hero stays a
// server component and keeps its markup in the first HTML response.
// It opens XIA over the page — the same assistant as the header and the dock.
// -----------------------------------------------------------------------------

import { ArrowRight } from "lucide-react";

import { openXiaChat } from "@/components/Xia/xia-chat";

export default function HeroXiaActions() {
  return (
    <button
      type="button"
      onClick={() => openXiaChat()}
      className="inline-flex min-h-[clamp(3.25rem,calc(3rem+0.6vw),3.9rem)] items-center justify-center gap-2 rounded-full bg-[#d8ad1f] px-[clamp(2rem,2.8vw,3.5rem)] text-[clamp(1rem,calc(0.9rem+0.22vw),1.25rem)] font-black text-primary shadow-[0_12px_30px_rgba(216,173,31,0.3)] transition hover:bg-[#efc939]"
    >
      Find my second home
      <ArrowRight className="size-[1.15em]" aria-hidden="true" />
    </button>
  );
}
