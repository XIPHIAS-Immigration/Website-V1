// ==============================================
// components/team/_Social.tsx – shared tiny parts
// ==============================================
import React from "react";
import Link from "next/link";
import { Social } from "@/components/Team/team";
import { SearchIcon } from "@/components/Team/Icons"; // re-exported usage example

export function SocialLink({ s }: { s: Social }) {
  return (
    <Link href={s.url} prefetch={false} target="_blank" className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300">
      <SocialIcon s={s} />
      <span className="underline-offset-2 hover:underline capitalize">{s.platform}</span>
    </Link>
  );
}

export function SocialIcon({ s }: { s: Social }) {
  const size = "h-4 w-4";
  switch (s.platform) {
    case "linkedin": return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.6c0-1.57-.03-3.58-2.18-3.58-2.18 0-2.51 1.7-2.51 3.46V23h-4V8.5z"/></svg>);
    case "x": return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M18.244 2H21.5l-7.5 8.568L23 22h-6.5l-5.088-6.318L5.5 22H2.244l8.01-9.154L1 2h6.6l4.61 5.843L18.244 2z"/></svg>);
    case "github": return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.65.07-.64.07-.64 1.02.07 1.56 1.07 1.56 1.07.9 1.59 2.36 1.13 2.94.86.09-.67.35-1.13.63-1.39-2.22-.26-4.55-1.15-4.55-5.14 0-1.14.39-2.07 1.03-2.8-.1-.26-.45-1.31.1-2.73 0 0 .85-.28 2.8 1.07a9.25 9.25 0 0 1 5.1 0c1.96-1.35 2.8-1.07 2.8-1.07.55 1.42.2 2.47.1 2.73.64.73 1.03 1.66 1.03 2.8 0 4-2.34 4.88-4.57 5.14.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.83 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>);
    case "dribbble": return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm6.93 6.58a8.2 8.2 0 0 1 1.01 3.88c-1.08-.22-2.6-.35-4.24-.12-.1-.24-.2-.49-.32-.73-.17-.35-.36-.7-.56-1.04 2.45-1.04 3.71-2.6 4.11-3.99zM12 3.8c1.9 0 3.63.72 4.94 1.9-.33 1.1-1.41 2.55-3.82 3.52-1-1.84-2.2-3.55-3.35-4.9A8.17 8.17 0 0 1 12 3.8zM8.6 5.25c1.16 1.3 2.42 3 3.46 4.88-3.25.97-6.54.95-8.55.83A8.23 8.23 0 0 1 8.6 5.25zM3.13 12.1v-.2c2.2.14 6.06.1 9.22-1.06.2.35.38.71.55 1.07.17.38.31.75.44 1.12-4.6 1.32-7.07 4.82-7.76 5.88A8.18 8.18 0 0 1 3.13 12.1zM12 20.2a8.1 8.1 0 0 1-4.5-1.35c.57-.92 2.95-4.5 7.92-5.69.6 1.61 1.06 3.4 1.27 5.41A8.17 8.17 0 0 1 12 20.2zm6.07-2.5c-.2-1.72-.62-3.3-1.17-4.7 1.44-.19 2.72-.1 3.53.07a8.19 8.19 0 0 1-2.36 4.63z"/></svg>);
    case "youtube": return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.13C19.57 3.5 12 3.5 12 3.5s-7.57 0-9.38.57A3.02 3.02 0 0 0 .5 6.2C0 8.02 0 12 0 12s0 3.98.5 5.8a3.02 3.02 0 0 0 2.12 2.13C4.43 20.5 12 20.5 12 20.5s7.57 0 9.38-.57a3.02 3.02 0 0 0 2.12-2.13C24 15.98 24 12 24 12s0-3.98-.5-5.8zM9.75 15.5v-7L16 12l-6.25 3.5z"/></svg>);
    default: return (<svg viewBox="0 0 24 24" aria-hidden="true" className={size}><path fill="currentColor" d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16.2A7.2 7.2 0 1 1 12 5.8a7.2 7.2 0 0 1 0 14.4z"/></svg>);
  }
}