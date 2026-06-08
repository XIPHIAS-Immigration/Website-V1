"use client";

import { useState } from "react";
import type { PassportEngineResult } from "@/lib/platform/types";

export default function PassportEngineClient() {
  const [targetRegions, setTargetRegions] = useState("Europe, UAE");
  const [budgetUsd, setBudgetUsd] = useState("300000");
  const [timelineMonths, setTimelineMonths] = useState("12");
  const [includeFamily, setIncludeFamily] = useState(true);
  const [result, setResult] = useState<PassportEngineResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/platform/passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRegions: targetRegions.split(",").map((item) => item.trim()).filter(Boolean),
        budgetUsd: Number(budgetUsd),
        timelineMonths: Number(timelineMonths),
        includeFamily,
        priorities: ["low presence"],
      }),
    });
    const data = (await response.json()) as { result?: PassportEngineResult };
    setResult(data.result ?? null);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Global mobility index</p>
        <h2 className="mt-1 text-xl font-bold">X-Passport Engine</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          This ranks suitable country and program options by practical fit: region, budget, timeline, family inclusion, low-presence preference, and advisory caution.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4">
          <label>
            <span className="text-sm font-semibold">Target regions</span>
            <input
              value={targetRegions}
              onChange={(event) => setTargetRegions(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label>
            <span className="text-sm font-semibold">Budget USD</span>
            <input
              value={budgetUsd}
              onChange={(event) => setBudgetUsd(event.target.value)}
              type="number"
              min="0"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label>
            <span className="text-sm font-semibold">Timeline months</span>
            <input
              value={timelineMonths}
              onChange={(event) => setTimelineMonths(event.target.value)}
              type="number"
              min="1"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              checked={includeFamily}
              onChange={(event) => setIncludeFamily(event.target.checked)}
              type="checkbox"
              className="size-4"
            />
            Include family
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Ranking..." : "Rank programs"}
          </button>
        </div>
      </form>

      <div className="grid gap-3">
        {result?.criteria?.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Ranking criteria</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600 dark:text-slate-300">
              {result.criteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {(result?.matches ?? []).map((match) => (
          <article
            key={`${match.name}-${match.country}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{match.name}</h3>
                <p className="text-sm text-slate-500">{match.country} - {match.pathway}</p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">{match.score}</span>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {match.rationale.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {match.caution ? <p className="mt-3 text-xs text-amber-700">{match.caution}</p> : null}
          </article>
        ))}
        {!result ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            Set the mobility preferences to generate a ranked shortlist for advisor review.
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
