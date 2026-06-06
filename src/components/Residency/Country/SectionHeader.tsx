import * as React from "react";

/** Accent palette used by section headers & chips */
type ColorKey = "blue" | "green" | "violet" | "amber" | "sky" | "pink";
const colorMap: Record<
  ColorKey,
  { dot: string; chip: string; ring: string; bgSoft: string; icon: string }
> = {
  blue: {
    dot: "bg-blue-600",
    chip: "bg-blue-50 text-blue-700",
    ring: "ring-blue-100",
    bgSoft: "bg-blue-50",
    icon: "text-blue-700",
  },
  green: {
    dot: "bg-emerald-600",
    chip: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-100",
    bgSoft: "bg-emerald-50",
    icon: "text-emerald-700",
  },
  violet: {
    dot: "bg-violet-600",
    chip: "bg-violet-50 text-violet-700",
    ring: "ring-violet-100",
    bgSoft: "bg-violet-50",
    icon: "text-violet-700",
  },
  amber: {
    dot: "bg-amber-600",
    chip: "bg-amber-50 text-amber-700",
    ring: "ring-amber-100",
    bgSoft: "bg-amber-50",
    icon: "text-amber-700",
  },
  sky: {
    dot: "bg-sky-600",
    chip: "bg-sky-50 text-sky-700",
    ring: "ring-sky-100",
    bgSoft: "bg-sky-50",
    icon: "text-sky-700",
  },
  pink: {
    dot: "bg-pink-600",
    chip: "bg-pink-50 text-pink-700",
    ring: "ring-pink-100",
    bgSoft: "bg-pink-50",
    icon: "text-pink-700",
  },
};

export function Eyebrow({
  label,
  color = "blue",
}: {
  label: string;
  color?: ColorKey;
}) {
  const c = colorMap[color];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${c.chip} ${c.ring} ring-1`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

export default function SectionHeader({
  eyebrow,
  title,
  color = "blue",
  className = "",
}: {
  eyebrow: string;
  title: string;
  color?: ColorKey;
  className?: string;
}) {
  return (
    <header className={`flex flex-col gap-2 ${className}`}>
      <Eyebrow label={eyebrow} color={color} />
      <h2 className="text-lg sm:text-xl font-semibold leading-tight text-black">
        {title}
      </h2>
    </header>
  );
}

/** Small helper for sidebar icons to keep a consistent look */
export function AccentIcon({
  color = "blue",
  children,
}: {
  color?: ColorKey;
  children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <span
      className={`grid h-9 w-9 place-items-center rounded-full ${c.bgSoft} ${c.icon}`}
    >
      {children}
    </span>
  );
}
