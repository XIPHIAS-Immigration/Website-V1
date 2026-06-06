"use client";

import { useState } from "react";

export default function B2GIntakeForm() {
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/platform/b2g-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Institutional inquiry submitted." : "Could not submit inquiry.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="organizationName" placeholder="Organization" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="contactName" placeholder="Contact name" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="contactEmail" type="email" placeholder="Contact email" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="contactPhone" placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="region" placeholder="Region" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="volumeEstimate" placeholder="Volume estimate" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <textarea name="requirement" placeholder="Requirement summary" required rows={5} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 md:col-span-2" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white" type="submit">
          Submit inquiry
        </button>
        {status ? <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{status}</p> : null}
      </div>
    </form>
  );
}

