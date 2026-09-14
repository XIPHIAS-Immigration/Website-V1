"use client";

// src/components/Home/XiaBand.tsx
// -----------------------------------------------------------------------------
// The section directly under the hero.
//
// It replaces the old "choose a module" gateway, which asked a first-time
// visitor to pick between Express Reports, Route Intelligence and Deep Analysis
// before telling them what any of those were. Nobody arrives knowing which
// assessment they need — that is the whole reason they came.
//
// So: who XIA is, in one line, and one place to start typing. The placeholder
// types real sentences on a loop, because an empty box asks you to invent a
// question and a box that shows you one does not.
//
// The tools still exist; they are one link away for people who want to browse.
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";

import ConciergeOrb from "@/components/Xia/ConciergeOrb";
import { openXiaChat } from "@/components/Xia/xia-chat";

const EXAMPLES = [
  "I'm a software architect in Bangalore and I want Canada PR",
  "I run a manufacturing business and want a second passport",
  "I'm a postdoc looking at the US on my publications",
  "I want to move my family to Australia in two years",
];

const TYPE_MS = 42;
const ERASE_MS = 18;
const HOLD_MS = 1900;

function useTypedPlaceholder(active: boolean) {
  const [text, setText] = useState("");
  const state = useRef({ line: 0, char: 0, erasing: false });

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(EXAMPLES[0]);
      return;
    }

    let timer = 0;
    const tick = () => {
      const current = state.current;
      const line = EXAMPLES[current.line];

      if (!current.erasing) {
        current.char += 1;
        setText(line.slice(0, current.char));
        if (current.char >= line.length) {
          current.erasing = true;
          timer = window.setTimeout(tick, HOLD_MS);
          return;
        }
        timer = window.setTimeout(tick, TYPE_MS);
        return;
      }

      current.char -= 1;
      setText(line.slice(0, Math.max(0, current.char)));
      if (current.char <= 0) {
        current.erasing = false;
        current.line = (current.line + 1) % EXAMPLES.length;
      }
      timer = window.setTimeout(tick, ERASE_MS);
    };

    timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [active]);

  return text;
}

export default function XiaBand() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const placeholder = useTypedPlaceholder(!value && !focused);

  // Everything arrives on a stagger the first time the band comes into view.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        (async () => {
          try {
            const { animate, stagger } = await import("animejs");
            if (cancelled) return;
            animate(node.querySelectorAll("[data-rise]"), {
              opacity: [0, 1],
              translateY: [28, 0],
              duration: 720,
              delay: stagger(90),
              ease: "out(4)",
            });
          } catch {
            /* the content is visible by default; motion is the bonus */
          }
        })();
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="xia-concierge"
      aria-labelledby="xia-band-title"
      className="xia-band relative overflow-hidden bg-primary text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="xia-band-aurora xia-band-aurora--gold" />
        <span className="xia-band-aurora xia-band-aurora--sky" />
        <span
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div
        ref={rootRef}
        className="relative mx-auto flex max-w-4xl flex-col items-center px-5 py-16 text-center sm:px-8 lg:py-24"
      >
        <div data-rise>
          <ConciergeOrb state="listening" size={168} />
        </div>

        <h2
          id="xia-band-title"
          data-rise
          className="xia-band-title mt-6 text-[clamp(2.25rem,calc(1.7rem+2.4vw),4.25rem)] font-black uppercase leading-[1.05] tracking-tight"
        >
          XIA Intelligence
        </h2>

        <p
          data-rise
          className="mt-3 text-[clamp(1.05rem,calc(0.95rem+0.4vw),1.5rem)] font-bold text-[#f0cb3b]"
        >
          Your personal immigration assistant.
        </p>

        <p data-rise className="type-body mt-5 max-w-2xl text-white/70">
          Tell XIA what you do and where you want to go. It checks you against the published rules of
          every programme XIPHIAS works on and says plainly which you clear, which you are close to,
          and which are shut — then sends the full report to your inbox.
        </p>

        <form
          data-rise
          onSubmit={(event) => {
            event.preventDefault();
            openXiaChat(value);
          }}
          className="mt-9 w-full max-w-2xl"
        >
          <div className="flex flex-col gap-2 rounded-2xl border border-white/25 bg-white/[0.08] p-2 transition-all duration-300 focus-within:border-[#e1b923]/70 focus-within:shadow-[0_0_0_5px_rgba(225,185,35,0.12)] sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Tell XIA what you do"
                autoComplete="off"
                className="w-full bg-transparent px-4 py-3.5 text-left text-[16px] text-white outline-none"
              />
              {!value ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[16px] text-white/45"
                >
                  {focused ? "Tell me what you do…" : placeholder}
                  {!focused ? <span className="xia-band-caret" /> : null}
                </span>
              ) : null}
            </div>
            <button
              type="submit"
              className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-7 text-[15px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              <Sparkles className="size-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
              Ask XIA
            </button>
          </div>
        </form>

        <ul data-rise className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLES.slice(0, 3).map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => openXiaChat(example)}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-white/55 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e1b923]/60 hover:text-white"
              >
                &ldquo;{example}&rdquo;
              </button>
            </li>
          ))}
        </ul>

        <Link
          data-rise
          href="/xia-intelligence"
          className="group mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-white/55 underline-offset-4 transition hover:text-white hover:underline"
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          Prefer to browse? Open Route Intelligence
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <style jsx>{`
        .xia-band-aurora {
          position: absolute;
          border-radius: 9999px;
          filter: blur(130px);
          will-change: transform;
        }
        .xia-band-aurora--gold {
          width: 40vw;
          height: 40vw;
          top: -12vw;
          right: -6vw;
          background: rgba(225, 185, 35, 0.2);
          animation: xiaBandDriftA 24s ease-in-out infinite;
        }
        .xia-band-aurora--sky {
          width: 46vw;
          height: 46vw;
          bottom: -18vw;
          left: -10vw;
          background: rgba(120, 175, 255, 0.22);
          animation: xiaBandDriftB 29s ease-in-out infinite;
        }
        @keyframes xiaBandDriftA {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-5vw, 4vw, 0) scale(1.14); }
        }
        @keyframes xiaBandDriftB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(6vw, -4vw, 0) scale(1.1); }
        }
        .xia-band-title {
          background: linear-gradient(100deg, #ffffff 0%, #ffffff 38%, #f5d260 52%, #ffffff 66%, #ffffff 100%);
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: xiaSheen 7s ease-in-out infinite;
        }
        @keyframes xiaSheen {
          0%, 100% { background-position: 130% 0; }
          50% { background-position: -30% 0; }
        }
        .xia-band-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 3px;
          vertical-align: -0.18em;
          background: #e1b923;
          animation: xiaBandBlink 0.9s steps(2) infinite;
        }
        @keyframes xiaBandBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .xia-band-aurora, .xia-band-title, .xia-band-caret { animation: none; }
          .xia-band-title { color: #ffffff; -webkit-text-fill-color: #ffffff; }
        }
      `}</style>
    </section>
  );
}
