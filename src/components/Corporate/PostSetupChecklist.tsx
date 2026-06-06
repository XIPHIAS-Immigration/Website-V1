// components/Corporate/PostSetupChecklist.tsx
"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

type PostSetupChecklistProps = {
  title?: string;
  items: string[];
  className?: string;
};

export default function PostSetupChecklist({
  title = "Post-setup checklist",
  items,
  className,
}: PostSetupChecklistProps) {
  return (
    <section
      className={`rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/40 p-5 ${className || ""}`}
      aria-labelledby="post-setup-title"
    >
      <header className="mb-4">
        <h2 id="post-setup-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm opacity-70">
          Typical actions after license & visas are issued.
        </p>
      </header>

      <ol className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 p-3 bg-black/5 dark:bg-white/10"
          >
            <div className="mt-0.5">
              <CheckCircle2 className="h-5 w-5 opacity-80" aria-hidden="true" />
            </div>
            <div className="text-sm leading-6">{item}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
