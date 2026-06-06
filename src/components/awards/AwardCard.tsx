"use client";

import React from "react";
import Link from "next/link";
import type { Award } from "./awards.data";

type Props = { award: Award; compact?: boolean };

export function AwardCard({ award, compact = false }: Props) {
  const Tag = award.href ? (Link as any) : ("div" as any);
  const tagProps = award.href ? { href: award.href as string, prefetch: false } : {};

  return (
    <Tag
      {...tagProps}
      className={[
        "aw-card group relative block rounded-3xl focus:outline-none h-full",
        "transition-transform duration-300 hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0f14]",
        compact ? "w-[300px] max-w-full" : "w-full",
      ].join(" ")}
      aria-label={`${award.tag} — ${award.year}`}
    >
      {/* frame */}
      <div className="aw-frame rounded-3xl p-[1.25px] h-full">
        {/* surface */}
        <div className="aw-surface relative rounded-[calc(1.5rem-1.25px)] p-5 md:p-6 overflow-hidden h-full flex flex-col">
          {/* background graphics (subtle, not too much gold) */}
          <span aria-hidden className="aw-beams absolute inset-0 rounded-[calc(1.5rem-1.25px)]" />
          <span aria-hidden className="aw-corner absolute right-0 bottom-0 h-28 w-28 md:h-32 md:w-32" />

          {/* ribbon */}
          <div className="aw-ribbon absolute left-4 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Star className="h-3.5 w-3.5" />
            {award.tag}
          </div>

          {/* content */}
          <div className="pt-8">
            <h3 className="text-base md:text-lg font-semibold leading-snug">
              <span className="aw-title bg-clip-text text-transparent">
                {award.title}
              </span>
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {award.issuer}
            </p>
          </div>

          {/* footer */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="aw-coin inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold">
              {award.year}
            </span>

            {award.href ? (
              <span className="aw-link inline-flex items-center gap-1 transition group-hover:translate-x-0.5">
                View <Arrow className="h-4 w-4" />
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-300/70">Recognized</span>
            )}
          </div>

          {/* subtle sheen */}
          <span className="aw-sheen pointer-events-none absolute inset-0 rounded-[calc(1.5rem-1.25px)]" />
        </div>
      </div>

      <style jsx>{`
        /* Subtle premium: mostly white/neutral, gold only as accents */

        .aw-frame {
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.10),
            rgba(212, 175, 55, 0.28),
            rgba(255, 241, 184, 0.18)
          );
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        }
        :global(.dark) .aw-frame {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.10),
            rgba(212, 175, 55, 0.22),
            rgba(0, 0, 0, 0.06)
          );
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
        }

        .aw-surface {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 252, 0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(8px);
        }
        :global(.dark) .aw-surface {
          background: linear-gradient(180deg, rgba(11, 15, 20, 0.82), rgba(13, 18, 26, 0.74));
          border: 1px solid rgba(255, 255, 255, 0.10);
        }

        .aw-title {
          background-image: linear-gradient(90deg, #1f2937, #8a5a00, #d4af37);
        }
        :global(.dark) .aw-title {
          background-image: linear-gradient(90deg, #f8fafc, #fff1b8, #f5d76e);
        }

        .aw-beams {
          background-image:
            linear-gradient(120deg, rgba(212, 175, 55, 0.10), rgba(212, 175, 55, 0) 60%),
            linear-gradient(300deg, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0) 60%);
          mix-blend-mode: overlay;
          opacity: 0.55;
        }
        :global(.dark) .aw-beams {
          background-image:
            linear-gradient(120deg, rgba(255, 241, 184, 0.10), rgba(255, 241, 184, 0) 60%),
            linear-gradient(300deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 60%);
          opacity: 0.34;
        }

        .aw-corner {
          background: radial-gradient(
            120px 120px at 100% 100%,
            rgba(245, 215, 110, 0.18),
            rgba(245, 215, 110, 0) 60%
          );
        }
        :global(.dark) .aw-corner {
          background: radial-gradient(
            120px 120px at 100% 100%,
            rgba(255, 241, 184, 0.12),
            rgba(255, 241, 184, 0) 60%
          );
        }

        .aw-ribbon {
          color: rgba(15, 23, 42, 0.92);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.90), rgba(255, 247, 223, 0.75));
          border: 1px solid rgba(184, 134, 11, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 10px 22px rgba(15, 23, 42, 0.06);
        }
        :global(.dark) .aw-ribbon {
          color: rgba(255, 241, 184, 0.95);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 241, 184, 0.18);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
        }

        .aw-coin {
          color: rgba(15, 23, 42, 0.92);
          background: radial-gradient(
            110% 110% at 50% 0%,
            #ffffff,
            #fff7df 55%,
            rgba(245, 215, 110, 0.55) 120%
          );
          border: 1px solid rgba(184, 134, 11, 0.18);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }
        :global(.dark) .aw-coin {
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

        .aw-link {
          color: #8a5a00;
        }
        :global(.dark) .aw-link {
          color: rgba(245, 215, 110, 0.95);
        }

        .aw-sheen {
          background: linear-gradient(
            110deg,
            rgba(255, 255, 255, 0),
            rgba(255, 241, 184, 0.28) 50%,
            rgba(255, 255, 255, 0)
          );
          transform: translateX(-120%);
          transition: transform 0.85s ease;
          mix-blend-mode: overlay;
          opacity: 0.35;
        }
        .aw-card:hover .aw-sheen {
          transform: translateX(120%);
        }
      `}</style>
    </Tag>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 3l2.47 5.16L20 9.27l-4 3.9.94 5.48L12 16.99 7.06 18.65 8 13.17 4 9.27l5.53-1.11L12 3z" />
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z" />
    </svg>
  );
}
