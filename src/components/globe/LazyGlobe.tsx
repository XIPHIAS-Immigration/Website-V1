"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

import GlobeFallback from "./GlobeFallback";
import type { XiphiasGlobeProps } from "./XiphiasGlobe";
import type { GlobeTheme } from "./types";

const XiphiasGlobe = dynamic(() => import("./XiphiasGlobe"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-56 w-56 animate-pulse rounded-full bg-[#1c57b4]/20 blur-xl" />
    </div>
  ),
});

type Props = Omit<XiphiasGlobeProps, "theme"> & {
  /** Force a palette regardless of the site theme (e.g. always-dark panels). */
  theme?: GlobeTheme;
};

/**
 * Client wrapper around the WebGL globe. Code-splits three.js (ssr:false),
 * resolves the active theme (or uses an explicit override), and degrades to a
 * static <GlobeFallback> when the user prefers reduced motion or before
 * hydration.
 */
export default function LazyGlobe({ theme: forcedTheme, ...props }: Props) {
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const theme = forcedTheme ?? (resolvedTheme === "light" ? "light" : "dark");

  if (!mounted || reduce) {
    return <GlobeFallback className={props.className} markers={props.markers} theme={theme} />;
  }

  return <XiphiasGlobe theme={theme} {...props} />;
}
