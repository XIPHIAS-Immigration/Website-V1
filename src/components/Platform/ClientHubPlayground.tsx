"use client";

import { useState } from "react";
import { Gauge, MessageSquareText, Sparkles } from "lucide-react";
import type { ClientProfile, MigrationCase } from "@/lib/platform/types";

type Props = {
  activeCase?: MigrationCase;
  profile?: ClientProfile;
};

export default function ClientHubPlayground({ activeCase, profile }: Props) {
  const [targetCountry, setTargetCountry] = useState(profile?.targetCountry || activeCase?.country || "");
  const [budgetUsd, setBudgetUsd] = useState(profile?.budgetUsd ? String(profile.budgetUsd) : "");
  const [timelineMonths, setTimelineMonths] = useState(profile?.timelineMonths ? String(profile.timelineMonths) : "");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveScenario() {
    setBusy(true);
    setStatus("Saving scenario...");
    try {
      const profileResponse = await fetch("/api/platform/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile?.fullName,
          email: profile?.email,
          phone: profile?.phone,
          preferredTrack: activeCase?.track || profile?.preferredTrack,
          targetCountry,
          targetProgram: activeCase?.program || profile?.targetProgram,
          budgetUsd,
          timelineMonths,
          notes: note,
        }),
      });
      if (!profileResponse.ok) throw new Error("Profile save failed.");

      await fetch("/api/platform/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scenario_saved",
          caseId: activeCase?.id,
          message: `Scenario: ${targetCountry || "country pending"}, budget ${budgetUsd || "pending"}, timeline ${timelineMonths || "pending"} months. ${note}`,
        }),
      });
      setStatus("Saved to your client activity timeline.");
    } catch {
      setStatus("Could not save the scenario. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function recordAction(action: string, message: string) {
    setBusy(true);
    setStatus("Recording action...");
    try {
      const response = await fetch("/api/platform/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, caseId: activeCase?.id, message }),
      });
      if (!response.ok) throw new Error("Activity failed.");
      setStatus("Added to Recent portal activity.");
    } catch {
      setStatus("Could not record the action.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
        <div className="relative p-5 sm:p-6">
          <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-blue-100 blur-2xl dark:bg-blue-900/30" />
          <p className="relative text-xs font-black uppercase tracking-[0.16em] text-primary">Client playground</p>
          <h3 className="relative mt-1 text-2xl font-black">Try a route scenario before advisor review</h3>
          <p className="relative mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Change the assumptions, save notes, request review, and see the action appear in your Hub timeline.
            This gives clients something useful to do now, while CRM sync can become the source of truth later.
          </p>

          <div className="relative mt-5 grid gap-3 md:grid-cols-3">
            <label className="block text-sm font-black">
              Target country
              <input
                value={targetCountry}
                onChange={(event) => setTargetCountry(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950"
                placeholder="Canada, Portugal, UAE"
              />
            </label>
            <label className="block text-sm font-black">
              Budget USD
              <input
                value={budgetUsd}
                onChange={(event) => setBudgetUsd(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950"
                placeholder="300000"
                inputMode="numeric"
              />
            </label>
            <label className="block text-sm font-black">
              Timeline months
              <input
                value={timelineMonths}
                onChange={(event) => setTimelineMonths(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950"
                placeholder="12"
                inputMode="numeric"
              />
            </label>
          </div>

          <label className="relative mt-4 block text-sm font-black">
            Note for advisor
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Example: I want low physical stay and family inclusion."
            />
          </label>

          <div className="relative mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void saveScenario()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              Save scenario
            </button>
            <button
              type="button"
              onClick={() => void recordAction("advisor_request", note || "Client requested advisor review from the Hub playground.")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <MessageSquareText className="size-4" />
              Request advisor review
            </button>
          </div>
          {status ? <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{status}</p> : null}
        </div>

        <div className="border-t border-blue-100 bg-[#071b3d] p-5 text-white xl:border-l xl:border-t-0">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#d8b848] text-[#071b3d]">
            <Gauge className="size-6" />
          </div>
          <h4 className="mt-4 text-xl font-black">What this controls</h4>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-blue-50/85">
            <li>Updates the logged-in client profile.</li>
            <li>Adds a saved interaction to Recent portal activity.</li>
            <li>Can request advisor review and update the next case action.</li>
            <li>Works now without fees in demo mode; payment can unlock formal onboarding later.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
