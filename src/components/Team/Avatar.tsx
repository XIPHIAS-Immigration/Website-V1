// ==============================================
// components/primitives/Avatar.tsx
// ==============================================
import React from "react";
export function Avatar({ src, alt, size = "md" }: { src?: string; alt: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-8 w-8" : "h-12 w-12";
  return (
    <div className={`shrink-0 overflow-hidden rounded-2xl ring-1 ring-blue-100 bg-gradient-to-br from-white to-zinc-50 ${cls}`} aria-label={alt}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy"/>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">No Image</div>
      )}
    </div>
  );
}