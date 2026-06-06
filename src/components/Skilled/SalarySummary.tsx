// src/components/Skilled/SalarySummary.tsx
import React from "react";
import type { ProgramMeta } from "@/lib/skilled-content";

export default function SalarySummary({
  program,
  className = "",
  label = "Min salary / min. cost",
}: {
  program: ProgramMeta;
  className?: string;
  label?: string;
}) {
  const amount = program.minSalary ?? program.minInvestment;
  return (
    <div className={["rounded-xl p-3 bg-black/5 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-neutral-700", className].join(" ")}>
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">
        {formatMoney(amount, program.currency)}
      </div>
    </div>
  );
}

function formatMoney(v?: number, currency?: string) {
  if (typeof v !== "number") return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${currency ?? ""} ${v.toLocaleString()}`.trim();
  }
}
