"use client";

import React from "react";
import type { Award } from "./awards.data";
import { AwardCard } from "./AwardCard";

export function AwardsGrid({ items }: { items: Award[] }) {
  const sorted = [...items].sort((a, b) => b.year - a.year);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
      {sorted.map((a, i) => (
        <div
          key={a.id}
          className="h-full animate-[awRise_.6s_cubic-bezier(.16,.84,.44,1)_both]"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <AwardCard award={a} />
        </div>
      ))}

      <style jsx>{`
        @keyframes awRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
