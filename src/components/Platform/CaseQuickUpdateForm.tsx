"use client";

import { useState } from "react";
import type { MigrationCase } from "@/lib/platform/types";

type Props = {
  item: MigrationCase;
};

export default function CaseQuickUpdateForm({ item }: Props) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Saving...");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/platform/admin/workflow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType: "case",
        id: item.id,
        status: item.stage,
        ...body,
      }),
    });
    setBusy(false);
    setMessage(response.ok ? "Case updated" : "Could not update case");
    if (response.ok) setTimeout(() => window.location.reload(), 500);
  }

  return (
    <form onSubmit={submit} className="grid gap-2">
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Progress</span>
        <input
          name="progress"
          type="number"
          min="0"
          max="100"
          defaultValue={item.progress}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Next action</span>
        <input
          name="nextAction"
          defaultValue={item.nextAction}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Risk</span>
          <select
            name="riskLevel"
            defaultValue={item.riskLevel}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {["low", "medium", "high", "blocked"].map((risk) => (
              <option key={risk} value={risk}>
                {risk}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save
        </button>
      </div>
      {message ? <p className="text-xs font-semibold text-slate-500">{message}</p> : null}
    </form>
  );
}
