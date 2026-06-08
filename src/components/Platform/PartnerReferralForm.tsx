"use client";

import { useState } from "react";

export default function PartnerReferralForm() {
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch("/api/platform/partner-referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Referral submitted." : "Could not submit referral.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Partner workflow</p>
        <h2 className="mt-1 text-xl font-bold">Submit a referred client</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Partners can register a lead, attach the target country or program, and then track whether XIPHIAS is screening, accepting, or opening the case.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="partnerName" placeholder="Partner name" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="companyName" placeholder="Company" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="contactEmail" type="email" placeholder="Partner email" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="contactPhone" placeholder="Partner phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="clientName" placeholder="Client name" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="clientEmail" type="email" placeholder="Client email" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="targetCountry" placeholder="Target country" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="targetProgram" placeholder="Target program" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <textarea name="notes" placeholder="Notes" rows={4} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 md:col-span-2" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white" type="submit">
          Submit referral
        </button>
        {status ? <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{status}</p> : null}
      </div>
    </form>
  );
}
