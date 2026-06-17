"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";

import { useCurrency } from "@/lib/CurrencyProvider";

export type GlassOption = { value: string; label: string };

/**
 * Premium, fully-controlled dropdown (replaces native <select>, whose option
 * popup can't be styled and rendered white-on-white on the dark suite). Glass
 * panel, rounded, animated open/close, optional search, internal scroll,
 * click-outside + Escape, reduced-motion safe.
 */
export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchable = false,
  className = "",
  buttonClassName = "",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: GlassOption[];
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-left text-[14px] font-medium text-white transition hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8cff]/40 ${buttonClassName}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? selected.label : <span className="text-white/40">{placeholder}</span>}
        </span>
        <ChevronDown className={`size-4 shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 z-[60] mt-2 w-full min-w-[13rem] origin-top overflow-hidden rounded-2xl border border-white/15 bg-[#0b1730] shadow-2xl shadow-black/60"
            role="listbox"
          >
            {searchable && (
              <div className="border-b border-white/10 p-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
                  <Search className="size-3.5 text-white/40" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full bg-transparent text-[13px] text-white placeholder-white/35 outline-none"
                  />
                </div>
              </div>
            )}
            <ul data-lenis-prevent className="max-h-64 overflow-y-auto p-1.5 [scrollbar-width:thin]">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-[13px] text-white/40">No matches</li>
              ) : (
                filtered.map((o) => {
                  const active = o.value === value;
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(o.value);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] transition ${
                          active ? "bg-[#1c57b4] text-white" : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{o.label}</span>
                        {active && <Check className="size-4 shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CURRENCIES: GlassOption[] = [
  { value: "USD", label: "USD $" },
  { value: "INR", label: "INR ₹" },
  { value: "AED", label: "AED د.إ" },
  { value: "EUR", label: "EUR €" },
];

/** Currency picker built on GlassSelect (visible on the dark suite). */
export function CurrencyGlassSelect() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="flex items-center gap-2 text-[13px] font-medium text-white/65">
      <span className="uppercase tracking-wide">Currency</span>
      <GlassSelect
        value={currency}
        onChange={(v) => setCurrency(v as "USD" | "INR" | "AED" | "EUR")}
        options={CURRENCIES}
        className="w-[112px]"
        ariaLabel="Select display currency"
      />
    </div>
  );
}
