"use client";

import React from "react";
import type { Award } from "./awards.data";

export function MiniAwardCard({ award }: { award: Award }) {
  return (
    <div
      className="mini group relative w-[240px] md:w-[260px] h-[176px] md:h-[184px] rounded-2xl p-[1px] transition-transform duration-300 hover:-translate-y-0.5"
      aria-label={`${award.tag} — ${award.year}`}
    >
      <div className="inner relative h-full rounded-[calc(1rem-1px)] p-3 flex flex-col overflow-hidden">
        <span aria-hidden className="beam absolute inset-0 rounded-[calc(1rem-1px)]" />
        <span aria-hidden className="corner absolute right-0 bottom-0 h-16 w-16" />

        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase">
          <span className="pill px-2 py-0.5 rounded-full truncate">{award.tag}</span>
        </div>

        <h3 className="mt-2 text-[13.5px] font-semibold leading-snug line-clamp-2 text-slate-900 dark:text-slate-50">
          {award.title}
        </h3>

        <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300 truncate">
          {award.issuer}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="coin px-2.5 py-0.5 text-[12px] font-semibold rounded-full">
            {award.year}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-300/70">
            Recognized
          </span>
        </div>

        {/* subtle sheen (very light) */}
        <span aria-hidden className="sheen pointer-events-none absolute inset-0 rounded-[calc(1rem-1px)]" />
      </div>

      <style jsx>{`
        /* Subtle premium: mostly white/neutral, gold only as a thin accent */

        .mini {
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.08),
            rgba(212, 175, 55, 0.22),
            rgba(255, 241, 184, 0.14)
          );
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        }
        :global(.dark) .mini {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.08),
            rgba(212, 175, 55, 0.18),
            rgba(0, 0, 0, 0.05)
          );
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
        }

        .inner {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(8px);
        }
        :global(.dark) .inner {
          background: linear-gradient(180deg, rgba(11, 15, 20, 0.82), rgba(13, 18, 26, 0.74));
          border: 1px solid rgba(255, 255, 255, 0.10);
        }

        .pill {
          color: rgba(15, 23, 42, 0.90);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.90), rgba(255, 247, 223, 0.75));
          border: 1px solid rgba(184, 134, 11, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }
        :global(.dark) .pill {
          color: rgba(255, 241, 184, 0.95);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 241, 184, 0.18);
        }

        .coin {
          color: rgba(15, 23, 42, 0.92);
          background: radial-gradient(110% 110% at 50% 0%, #ffffff, #fff7df 55%, rgba(245, 215, 110, 0.55) 120%);
          border: 1px solid rgba(184, 134, 11, 0.18);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }
        :global(.dark) .coin {
          color: rgba(255, 247, 223, 0.95);
          background: radial-gradient(
            110% 110% at 50% 0%,
            rgba(255, 255, 255, 0.18),
            rgba(245, 215, 110, 0.10) 55%,
            rgba(212, 175, 55, 0.08) 120%
          );
          border: 1px solid rgba(255, 241, 184, 0.16);
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.38);
        }

        /* keep background effects VERY light */
        .beam {
          background-image:
            linear-gradient(120deg, rgba(212, 175, 55, 0.10), rgba(212, 175, 55, 0) 60%),
            linear-gradient(300deg, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0) 60%);
          mix-blend-mode: overlay;
          opacity: 0.55;
        }
        :global(.dark) .beam {
          background-image:
            linear-gradient(120deg, rgba(255, 241, 184, 0.10), rgba(255, 241, 184, 0) 60%),
            linear-gradient(300deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 60%);
          opacity: 0.35;
        }

        .corner {
          background: radial-gradient(80px 80px at 100% 100%, rgba(245, 215, 110, 0.20), rgba(245, 215, 110, 0) 60%);
        }
        :global(.dark) .corner {
          background: radial-gradient(80px 80px at 100% 100%, rgba(255, 241, 184, 0.14), rgba(255, 241, 184, 0) 60%);
        }

        .sheen {
          background: linear-gradient(110deg, rgba(255, 255, 255, 0), rgba(255, 241, 184, 0.28) 50%, rgba(255, 255, 255, 0));
          transform: translateX(-120%);
          transition: transform 0.85s ease;
          mix-blend-mode: overlay;
          opacity: 0.35;
        }
        .mini:hover .sheen {
          transform: translateX(120%);
        }
      `}</style>
    </div>
  );
}