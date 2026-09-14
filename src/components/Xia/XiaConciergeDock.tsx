"use client";

// src/components/Xia/XiaConciergeDock.tsx
// -----------------------------------------------------------------------------
// The floating "Ask XIA" button.
//
// It used to open a small panel in the corner — a second, cramped copy of the
// assistant with its own state. Now it opens the same full-screen chat as every
// other entry point, so there is one conversation and one case, wherever it was
// started from.
// -----------------------------------------------------------------------------

import ConciergeOrb from "./ConciergeOrb";
import { openXiaChat } from "./xia-chat";

export default function XiaConciergeDock() {
  return (
    <button
      type="button"
      onClick={() => openXiaChat()}
      aria-label="Ask XIA, the immigration assistant"
      className="fixed bottom-5 right-5 z-[880] inline-flex items-center gap-2 rounded-full border border-white/15 bg-primary py-2 pl-2 pr-5 text-[15px] font-black text-white shadow-[0_16px_40px_rgba(3,16,40,0.45)] transition hover:bg-[#1f62c9]"
    >
      <ConciergeOrb state="idle" size={38} />
      Ask XIA
    </button>
  );
}
