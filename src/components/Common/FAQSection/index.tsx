// src/components/Common/FAQSection/index.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import ContactForm from "@/components/ContactForm";

/* ------------------------------ Types ------------------------------ */
export type FAQ = { question: string; answer: string };

export type FAQWithFormProps = {
  title?: string;
  highlight?: string;
  subtitle?: string;
  faqs?: FAQ[];
  /** which FAQ is open initially; set to -1 for none */
  defaultOpen?: number;
  /** kept for backward-compat but ignored (hover-to-open removed) */
  peekOnHover?: boolean;
  className?: string;
  /** Inject a custom form (defaults to your ContactForm) */
  formSlot?: React.ReactNode;
};

/* --------------------------- Default content ------------------------ */
const DEFAULT_FAQS: FAQ[] = [
  {
    question: "What services do you provide?",
    answer:
      "We provide end-to-end, IMC-standard advisory across residency, citizenship, investment migration, and corporate mobility, delivering a fully managed, precision-crafted experience from strategy to successful landing.",
  },
  {
    question: "How much time does a process take?",
    answer:
      "Depending on the Country, timelines differ, but we offer a clear milestone roadmap and oversee each phase to guarantee the quickest possible compliant implementation.",
  },
  {
    question: "For whom is the consultation intended?",
    answer:
      "HNI/UHNI investors, families, business owners, and corporate decision-makers want to expand their business internationally or move globally strategically.",
  },
  {
    question: "What takes place following the consultation?",
    answer:
      "To start your residency or business migration journey, you receive a customized action plan with next actions, documentation pathways, program guidance, and concierge-style onboarding.",
  },
];

/* ----------------------------- Component --------------------------- */
export default function FAQWithForm({
  title = "Your journey with XIPHIAS",
  highlight = "We’re here to help.",
  subtitle = "Quick answers to common questions. If you don’t see yours, send us a message.",
  faqs = DEFAULT_FAQS,
  defaultOpen = 0,
  // hover open removed; prop ignored to keep API stable
  peekOnHover, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = "",
  formSlot,
}: FAQWithFormProps) {
  const uid = React.useId(); // ✅ unique per component instance

  const initialOpen =
    Number.isFinite(defaultOpen) && defaultOpen! >= 0 && defaultOpen! < faqs.length
      ? defaultOpen!
      : -1;

  const [openIdx, setOpenIdx] = React.useState<number>(initialOpen);

  const onToggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section
      className={["container mx-auto px-4 lg:max-w-screen-2xl", className].join(" ")}
      aria-labelledby={`faq-heading-${uid}`}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]">
        {/* ------------------ Left: FAQs ------------------ */}
        <div className="min-w-0">
          {/* Header */}
          <div className="rounded-2xl ring-1 ring-blue-100/80 bg-white/80 p-4 dark:ring-blue-900/40 dark:bg-white/[0.03]">
            <div className="inline-flex items-center gap-2 text-[12px]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span className="font-semibold">FAQs</span>
            </div>
            <h2
              id={`faq-heading-${uid}`}
              className="mt-2 text-xl md:text-2xl font-semibold tracking-tight"
            >
              {title} <span className="text-blue-700 dark:text-blue-300">{highlight}</span>
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-black/70 dark:text-white/70">{subtitle}</p>
            )}
          </div>

          {/* List */}
          <ul className="mt-4 space-y-2">
            {faqs.map((item, idx) => {
              const isOpen = openIdx === idx;
              const qId = `faq-q-${uid}-${idx}`;
              const aId = `faq-a-${uid}-${idx}`;

              return (
                <li key={idx}>
                  <div className="overflow-hidden rounded-xl ring-1 ring-blue-100/80 bg-white/90 dark:ring-blue-900/40 dark:bg-white/[0.03]">
                    <button
                      id={qId}
                      aria-expanded={isOpen}
                      aria-controls={aId}
                      onClick={() => onToggle(idx)}
                      className={[
                        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-medium",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                      ].join(" ")}
                    >
                      <span className="min-w-0 truncate">{item.question}</span>
                      <ChevronDown
                        className={[
                          "h-5 w-5 shrink-0",
                          isOpen
                            ? "rotate-180 text-blue-700 dark:text-blue-300"
                            : "text-black/50 dark:text-white/60",
                        ].join(" ")}
                        aria-hidden
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={aId}
                        role="region"
                        aria-labelledby={qId}
                        className="px-4 pb-4 text-sm text-zinc-800 dark:text-zinc-300"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ------------------ Right: Form ------------------ */}
        <aside className="min-w-0 md:pl-2 lg:pl-3">
          <div className="pb-5">{formSlot ?? <ContactForm />}</div>
        </aside>
      </div>
    </section>
  );
}