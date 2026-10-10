"use client";

// src/components/Programme/AskXiaButton.tsx
// Opens the XIA chat seeded with this programme, so the first answer is about
// the page the visitor is already on.

import { Sparkles } from "lucide-react";

import { openXiaChat } from "@/components/Xia/xia-chat";

export default function AskXiaButton({ seed }: { seed?: string }) {
  return (
    <button
      type="button"
      onClick={() => openXiaChat(seed ? `I am looking at ${seed}. Do I qualify?` : undefined)}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/25 px-3 text-[13.5px] font-bold text-white/90 transition hover:bg-white/10"
    >
      <Sparkles className="size-4" aria-hidden="true" /> Ask XIA
    </button>
  );
}
