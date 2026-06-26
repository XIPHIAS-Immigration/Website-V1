"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export type PortalDest = {
  name: string;
  track: string;
  image: string;
  href: string;
};

type Props = {
  dest: PortalDest;
  /** Screen-space point the iris grows from (the clicked beacon / pill). */
  origin: { x: number; y: number };
  /** Cancel the pending navigation and return to the globe. */
  onCancel: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Full-bleed cinematic transition shown for ~2s after a beacon / pill click.
 * The destination image irises open from the click point and a determinate gold
 * line fills as the countdown runs; the PARENT owns the authoritative timer and
 * router.push, so this overlay is purely presentational + cancelable (Esc / tap).
 */
export default function PortalTransition({ dest, origin, onCancel }: Props) {
  // A radius that always covers the viewport from the click point. Same unit (px)
  // on both ends so framer can interpolate the clipPath cleanly.
  const maxR = useMemo(
    () =>
      typeof window !== "undefined"
        ? Math.hypot(window.innerWidth, window.innerHeight) * 1.15
        : 1600,
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <motion.div
      role="dialog"
      aria-label={`Entering ${dest.name}`}
      className="fixed inset-0 z-[60] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.32, ease: EASE } }}
    >
      {/* iris-revealed destination image */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
        animate={{ clipPath: `circle(${maxR}px at ${origin.x}px ${origin.y}px)` }}
        exit={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.04 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 2, ease: "linear" }}
        >
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        {/* warm gold core tint + readability gradient + vignette */}
        <div className="absolute inset-0 bg-[#ffd24a]/[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1e] via-[#050b1e]/45 to-[#050b1e]/20" />
        <div className="absolute inset-0 shadow-[inset_0_0_240px_80px_rgba(5,11,30,0.85)]" />
      </motion.div>

      {/* centered destination identity */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.45, ease: EASE }}
          className="rounded-full bg-black/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary backdrop-blur-sm"
        >
          {dest.track}
        </motion.span>
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5, ease: EASE }}
          className="mt-4 text-[clamp(2.25rem,7vw,4.5rem)] font-black leading-none text-white drop-shadow-2xl"
        >
          {dest.name}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5, ease: EASE }}
          className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-white/80"
        >
          Entering {dest.name}
          <ArrowRight className="size-4 text-secondary" />
        </motion.p>
      </div>

      {/* apex blue-white arrival flash */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#dbe8ff]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.5, 0] }}
        transition={{ duration: 2, ease: "easeOut", times: [0, 0.78, 0.9, 1] }}
      />

      {/* determinate countdown line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-secondary to-[#fff0c2]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "linear" }}
      />

      {/* cancel affordance */}
      <motion.button
        type="button"
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
      >
        <X className="size-3.5" />
        Press Esc / tap to stay
      </motion.button>
    </motion.div>
  );
}
