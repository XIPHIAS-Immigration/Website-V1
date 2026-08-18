// Shared chrome for the XIA tools so they read as one suite (dark-gradient,
// electric-blue + gold accents). Tier-4 surface: static chrome, no scroll-entrance
// decoration — motion lives in the interactive panels themselves.
import type { ReactNode } from "react";
import { CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { XiaContactPanel } from "@/components/XiaTools/XiaContactPanel";

/** The canonical disclaimer required next to every figure (see skills.md). */
export const INDICATIVE_NOTE = "Indicative — varies by case, advisor review required.";

export type ToolStep = {
  title: string;
  description: string;
};

const DEFAULT_STEPS: ToolStep[] = [
  { title: "Tell us your objective", description: "Choose the outcome you are considering and provide the facts requested by this tool." },
  { title: "XIA organises the evidence", description: "Your answers are checked for route fit, missing information and points that need verification." },
  { title: "Review the next steps", description: "Receive a clear result you can use for further research or discuss with a XIPHIAS advisor." },
];

export function ToolShell({
  eyebrow,
  title,
  subtitle,
  actions,
  steps = DEFAULT_STEPS,
  benefits = ["Personalised assessment", "Evidence and risk gaps", "Advisor-ready next steps"],
  contactContext,
  contactId,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  actions?: ReactNode;
  steps?: ToolStep[];
  benefits?: string[];
  contactContext?: string;
  contactId?: string;
  children: ReactNode;
}) {
  return (
    <main className="xia-type-system relative min-h-screen overflow-hidden bg-primary pt-24 font-sans text-white">

      <section className="relative mx-auto max-w-screen-xl bg-transparent px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-start lg:gap-12">
          <div className="max-w-2xl">
            <span className="type-caption inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 uppercase text-secondary">
              <Sparkles className="size-3.5" /> {eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-white/78 sm:text-lg">{subtitle}</p>
            {actions ? <div className="mt-6">{actions}</div> : null}
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/10 p-5 shadow-cause-shadow sm:p-6">
            <p className="type-caption uppercase tracking-[0.16em] text-secondary">How it works</p>
            <ol className="mt-4 space-y-4">
              {steps.slice(0, 3).map((step, index) => (
                <li key={`${step.title}-${index}`} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="grid size-10 place-items-center rounded-xl border border-secondary/40 bg-secondary/10 text-sm font-black text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/65">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6">
          <p className="type-caption uppercase tracking-[0.16em] text-white/55">What you receive</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3" aria-label="Assessment benefits">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex min-h-16 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/90">
                <CheckCircle2 className="size-5 shrink-0 text-secondary" aria-hidden="true" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-screen-xl bg-transparent px-4 pb-24 sm:px-6 lg:px-8">
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
