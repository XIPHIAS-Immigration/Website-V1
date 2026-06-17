// Shared chrome for the XIA tools so they read as one suite (dark-gradient,
// electric-blue + gold accents). Tier-4 surface: static chrome, no scroll-entrance
// decoration — motion lives in the interactive panels themselves.
import type { ReactNode } from "react";
import { ShieldAlert, Sparkles } from "lucide-react";

/** The canonical disclaimer required next to every figure (see skills.md). */
export const INDICATIVE_NOTE = "Indicative — varies by case, advisor review required.";

export function ToolShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#060b1a] via-[#0a1530] to-[#0a1c44] pt-24 text-white">
      <div className="pointer-events-none absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-[#4f8cff]/18 blur-[150px]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 rounded-full bg-secondary/12 blur-[150px]" />

      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4f8cff]/40 bg-[#4f8cff]/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9cc0ff]">
              <Sparkles className="size-3.5" /> {eyebrow}
            </span>
            <h1 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)] font-black leading-[1.06] tracking-tight">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/65">{subtitle}</p>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </section>

      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-24 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  );
}

/** Small gold "indicative" pill to sit beside numbers. */
export function IndicativeChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary ${className}`}
    >
      <ShieldAlert className="size-3" />
      {INDICATIVE_NOTE}
    </span>
  );
}

/** Placeholder for data we deliberately do not fabricate (tax, residency days). */
export function AdvisorNote({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/25 bg-white/[0.03] px-2.5 py-1 text-[12px] font-medium text-white/55">
      <ShieldAlert className="size-3.5 text-secondary/80" />
      {children}
    </span>
  );
}
