"use client";

// src/components/Xia/StartCta.tsx
// -----------------------------------------------------------------------------
// The header's one call to action. "Find my route" for a new visitor; "My routes"
// once they have answered. Both open XIA over the current page — "My routes"
// resumes straight on the routes, so nothing restarts.
// Reads the same local snapshot XIA keeps, so it costs no request.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { openXiaChat } from "./xia-chat";

const SNAPSHOT_KEY = "xia_case_snapshot";

function hasAnswers(): boolean {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return false;
    const item = JSON.parse(raw) as { goal?: string; profile?: string };
    return Boolean(item.goal && item.profile);
  } catch {
    return false;
  }
}

export default function StartCta({ className = "" }: { className?: string }) {
  const [known, setKnown] = useState(false);
  const pathname = usePathname();

  // Re-read on every page change, on storage events, and whenever XIA opens or
  // closes — so the label flips to "My routes" the moment the chat is put away.
  useEffect(() => {
    setKnown(hasAnswers());
    const sync = () => setKnown(hasAnswers());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SNAPSHOT_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("xiphias-chat-state", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("xiphias-chat-state", sync);
    };
  }, [pathname]);

  return (
    <button type="button" onClick={() => openXiaChat({ resume: known })} className={className}>
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
      {known ? "My routes" : "Find my route"}
    </button>
  );
}
