// Shared chrome for the XIA tools so they read as one suite (dark-gradient,
// electric-blue + gold accents). Tier-4 surface: static chrome, no scroll-entrance
// decoration — motion lives in the interactive panels themselves.
import type { ReactNode } from "react";
import { ShieldAlert, Sparkles } from "lucide-react";
import { XiaContactPanel } from "@/components/XiaTools/XiaContactPanel";

/** The canonical disclaimer required next to every figure (see skills.md). */
export const INDICATIVE_NOTE = "Indicative — varies by case, advisor review required.";

export function ToolShell({
  eyebrow,
  title,
  subtitle,
  actions,
  contactContext,
  contactId,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  actions?: ReactNode;
  contactContext?: string;
  contactId?: string;
  children: ReactNode;
}) {
  return (
    <main className="xia-type-system relative min-h-screen overflow-hidden bg-primary pt-24 font-sans text-white">

      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="type-caption inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 uppercase text-secondary">
              <Sparkles className="size-3.5" /> {eyebrow}
            </span>
            <h1 className="type-section-title mt-5">
              {title}
            </h1>
            <p className="type-body mt-3 max-w-2xl text-white/70">{subtitle}</p>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </section>

      <section className="relative mx-auto max-w-screen-2xl bg-transparent px-4 pb-24 sm:px-6 lg:px-8">
        {children}
        {contactContext ? (
          <XiaContactPanel
            context={contactContext}
            idPrefix={contactId || "xia-tool"}
          />
        ) : null}
      </section>
    </main>
  );
}

/** Small gold "indicative" pill to sit beside numbers. */
export function IndicativeChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`type-caption inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-secondary ${className}`}
    >
      <ShieldAlert className="size-3" />
      {INDICATIVE_NOTE}
    </span>
  );
}

/** Placeholder for data we deliberately do not fabricate (tax, residency days). */
export function AdvisorNote({ children }: { children: ReactNode }) {
  return (
    <span className="type-caption inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/25 bg-white/[0.03] px-2.5 py-1 font-normal text-white/60">
      <ShieldAlert className="size-3.5 text-secondary/80" />
      {children}
    </span>
  );
}
