"use client";

import { useState } from "react";

type Props = {
  entityType: "lead" | "partner_referral" | "b2g_inquiry" | "document" | "case";
  id: string;
  value: string;
  options: string[];
  label?: string;
  payload?: Record<string, string | number | boolean | undefined>;
};

export default function WorkflowStatusSelect({ entityType, id, value, options, label, payload }: Props) {
  const [status, setStatus] = useState(value);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function update(nextStatus: string) {
    setStatus(nextStatus);
    setBusy(true);
    setMessage("Saving...");
    const response = await fetch("/api/platform/admin/workflow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, id, status: nextStatus, ...payload }),
    });
    setBusy(false);
    setMessage(response.ok ? "Saved" : "Could not save");
    if (response.ok) setTimeout(() => window.location.reload(), 450);
  }

  return (
    <label className="block">
      {label ? <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span> : null}
      <select
        value={status}
        disabled={busy}
        onChange={(event) => update(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {message ? <span className="mt-1 block text-xs font-semibold text-slate-500">{message}</span> : null}
    </label>
  );
}
