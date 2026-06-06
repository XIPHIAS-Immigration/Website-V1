"use client";

import { useState } from "react";
import Link from "next/link";
import type { XiaRecommendation } from "@/lib/platform/types";

export default function XiaAdvisorClient() {
  const [message, setMessage] = useState("I want a residency option for my family with low physical presence.");
  const [track, setTrack] = useState("residency");
  const [country, setCountry] = useState("");
  const [result, setResult] = useState<XiaRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/platform/xia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, track, country }),
    });
    const data = (await response.json()) as { recommendation?: XiaRecommendation };
    setResult(data.recommendation ?? null);
    setLoading(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4">
          <label>
            <span className="text-sm font-semibold">Request</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label>
            <span className="text-sm font-semibold">Track</span>
            <select
              value={track}
              onChange={(event) => setTrack(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="residency">Residency</option>
              <option value="citizenship">Citizenship</option>
              <option value="corporate">Corporate</option>
              <option value="skilled">Skilled</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-semibold">Country focus</span>
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Optional"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Get advisory result"}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {result ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {result.intent.replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Confidence {result.confidence}
              </span>
              {result.handoffRequired ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Staff review</span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.summary}</p>
            {result.criteria?.length ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Criteria</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {result.criteria.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-5 grid gap-3">
              {result.recommendedPrograms.map((program) => (
                <div key={`${program.name}-${program.country}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{program.name}</h3>
                      {program.country ? <p className="text-sm text-slate-500">{program.country}</p> : null}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {program.score}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{program.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {result.actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`rounded-md px-3 py-2 text-sm font-bold ${
                    action.type === "primary"
                      ? "bg-primary text-white"
                      : "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
            {result.sources?.length ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Sources</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.sources.slice(0, 5).map((source) => (
                    <Link
                      key={`${source.label}-${source.href}`}
                      href={source.href}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      {source.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center text-center text-sm text-slate-500">
            XIA Lite results will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
