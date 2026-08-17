"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileDown, Loader2, Minus, Plus, Users } from "lucide-react";

import { GlassSelect } from "@/components/XiaTools/GlassSelect";
import { ToolShell } from "@/components/XiaTools/ToolShell";
import { estimateCost, COST_DISCLAIMER, type CostProgram } from "@/lib/cost-estimator";
import { getProductConfig } from "@/lib/payments/product-catalog";

const COST_REPORT_PRICE_INR = getProductConfig("cost_report")?.priceInr ?? 499;
const TRACKS = [
  { value: "all", label: "All" },
  { value: "citizenship", label: "Citizenship" },
  { value: "residency", label: "Residency" },
  { value: "skilled", label: "Skilled" },
  { value: "corporate", label: "Corporate" },
] as const;

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function CostEstimatorClient({ programs }: { programs: CostProgram[] }) {
  const [track, setTrack] = useState<(typeof TRACKS)[number]["value"]>("all");
  const [selectedId, setSelectedId] = useState("");
  const [dependents, setDependents] = useState(0);
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", consent: false });
  const [checkout, setCheckout] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  const filtered = useMemo(() => programs.filter((program) => track === "all" || program.track === track), [programs, track]);
  const selected = programs.find((program) => program.id === selectedId);
  const breakdown = selected ? estimateCost(selected, dependents) : null;

  const changeTrack = (value: typeof track) => {
    setTrack(value);
    setSelectedId("");
  };

  async function startCheckout() {
    if (!selected || !breakdown) return;
    if (!buyer.name.trim() || !buyer.email.trim() || !buyer.consent) {
      setCheckout({ loading: false, error: "Add your name and email, then confirm consent to continue." });
      return;
    }
    setCheckout({ loading: true, error: null });
    try {
      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buyer,
          productType: "cost_report",
          productName: `Cost and budget report — ${selected.title}`,
          track: selected.track,
          country: selected.country,
          program: selected.title,
          page: "/cost-estimator",
          answers: {
            program: selected.title,
            dependents,
            familySize: breakdown.familySize,
            knownCatalogueAmountUsd: breakdown.totalUsd,
            costsPendingVerification: true,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (data?.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }
      setCheckout({ loading: false, error: data?.error || "Could not start checkout. Please try again." });
    } catch {
      setCheckout({ loading: false, error: "Could not start checkout. Please try again." });
    }
  }

  return (
    <ToolShell
      eyebrow="XIA · Cost Estimator"
      title="Build a Transparent Immigration Cost Plan"
      subtitle="Select a programme and family size to see which financial information is actually available and which amounts still require verification. XIA displays catalogue investment figures separately from government charges, due-diligence costs, dependant fees and professional fees, so an incomplete fee schedule is never presented as a complete total. The result gives you a responsible starting budget, a clear list of unanswered cost questions and a direct route to a personalised cost report or advisor review."
      benefits={["Supplied costs only", "Pending fees identified", "Family-specific questions"]}
      contactContext="Cost Planning"
      contactId="cost-estimator"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7">
          <p className="type-caption uppercase text-secondary">Your information</p>
          <h2 className="type-card-title mt-2 text-white">Choose the programme and family size to review.</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRACKS.map((option) => <button key={option.value} type="button" onClick={() => changeTrack(option.value)} className={`rounded-lg px-3 py-2 text-sm font-bold ${track === option.value ? "bg-secondary text-primary" : "border border-white/15 bg-white/[0.05] text-white/70"}`}>{option.label}</button>)}
          </div>
          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-white/85">Programme</span>
            <GlassSelect value={selectedId} onChange={setSelectedId} searchable options={filtered.map((program) => ({ value: program.id, label: `${program.country} — ${program.title}` }))} placeholder="Select a programme" ariaLabel="Select a programme" />
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.05] p-4">
            <span className="flex items-center gap-2 text-sm text-white/80"><Users className="size-4 text-secondary" />Dependants besides you</span>
            <div className="flex items-center gap-3"><button type="button" aria-label="Fewer dependants" onClick={() => setDependents((value) => Math.max(0, value - 1))} className="grid size-9 place-items-center rounded-lg border border-white/20"><Minus className="size-4" /></button><span className="w-5 text-center font-black">{dependents}</span><button type="button" aria-label="More dependants" onClick={() => setDependents((value) => Math.min(8, value + 1))} className="grid size-9 place-items-center rounded-lg border border-white/20"><Plus className="size-4" /></button></div>
          </div>
        </section>

        <section className="rounded-xl border border-white/20 bg-black/10 p-5 sm:p-7" aria-live="polite">
          {!selected || !breakdown ? <div className="grid min-h-64 place-items-center text-center text-white/65"><div><p className="type-caption uppercase text-secondary">Cost review</p><p className="mt-3">Select a programme to view supplied and pending cost items.</p></div></div> : <>
            <p className="type-caption uppercase text-secondary">Known catalogue amount</p>
            <div className="mt-2 text-4xl font-black text-white">{breakdown.totalUsd > 0 ? usd(breakdown.totalUsd) : "Not provided"}</div>
            <p className="mt-2 text-sm text-white/65">This is not an all-in total. Currency conversion is intentionally not applied without a live, dated FX source.</p>
            <ul className="mt-6 divide-y divide-white/10 rounded-lg border border-white/15 bg-white/[0.04]">
              {breakdown.lineItems.map((item) => <li key={item.key} className="flex items-start justify-between gap-4 p-4"><span><span className="block text-sm font-bold text-white">{item.label}</span><span className="mt-1 block text-xs leading-5 text-white/50">{item.note}</span></span><span className="shrink-0 text-sm font-black text-white">{item.includedInKnownTotal ? usd(item.amountUsd) : "Pending verification"}</span></li>)}
            </ul>
            <p className="mt-4 text-xs leading-5 text-white/55">{COST_DISCLAIMER}</p>
            <Link href={selected.href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-secondary">Review programme information <ArrowRight className="size-4" /></Link>

            <div className="mt-6 border-t border-white/15 pt-6">
              <p className="type-caption uppercase text-secondary">Personalised report checkout</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">{(["name", "email", "phone"] as const).map((field) => <input key={field} className="h-11 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-secondary" value={buyer[field]} onChange={(event) => setBuyer((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === "phone" ? "Phone / WhatsApp" : field[0].toUpperCase() + field.slice(1)} type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} />)}</div>
              <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/65"><input type="checkbox" checked={buyer.consent} onChange={(event) => setBuyer((current) => ({ ...current, consent: event.target.checked }))} className="mt-0.5 size-4 accent-secondary" />I confirm these details and consent to their use for checkout, report generation and delivery.</label>
              <button type="button" onClick={startCheckout} disabled={checkout.loading} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-black text-primary disabled:opacity-60">{checkout.loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}Buy full report · INR {COST_REPORT_PRICE_INR}</button>
              {checkout.error ? <p className="mt-2 text-xs font-semibold text-amber-200">{checkout.error}</p> : null}
            </div>
          </>}
        </section>
      </div>
    </ToolShell>
  );
}
