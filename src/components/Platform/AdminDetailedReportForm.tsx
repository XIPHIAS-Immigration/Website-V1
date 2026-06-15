"use client";

import { useState } from "react";
import { Download, Mail, ShieldCheck } from "lucide-react";

const tracks = ["residency", "citizenship", "skilled", "corporate"] as const;

type ApiMessage = {
  ok?: boolean;
  error?: string;
  filename?: string;
  clientEmail?: { status: string; reason?: string };
};

export default function AdminDetailedReportForm() {
  const [busy, setBusy] = useState<"download" | "email" | "">("");
  const [message, setMessage] = useState("");

  async function submit(form: HTMLFormElement, mode: "download" | "email") {
    setBusy(mode);
    setMessage("");

    const body = Object.fromEntries(new FormData(form).entries());
    body.mode = mode;

    const response = await fetch("/api/platform/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (mode === "download" && response.ok) {
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "XIPHIAS_Detailed_Report.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage("Detailed report generated and downloaded.");
      setBusy("");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as ApiMessage;
    setBusy("");
    if (!response.ok || !data.ok) {
      setMessage(data.error || "Could not process the detailed report.");
      return;
    }
    setMessage(
      mode === "email"
        ? `Report email status: ${data.clientEmail?.status || "sent"}.`
        : "Detailed report generated.",
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget, "download");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#a47700] dark:bg-amber-950/40">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a47700]">Paid report desk</p>
          <h2 className="mt-1 text-xl font-black">Generate the detailed PDF manually</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Hidden behind admin login. Use this after payment confirmation if Topmate does not send an automatic success webhook.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Client name</span>
            <input name="name" required className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Client email</span>
            <input name="email" type="email" required className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Phone</span>
            <input name="phone" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Client profile / role</span>
            <input name="profile" placeholder="Software engineer, investor, founder..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Current location</span>
            <input name="currentCountry" placeholder="India, UAE, Canada..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Payment reference</span>
            <input name="paymentReference" required className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Track</span>
            <select name="track" defaultValue="residency" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {tracks.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Country focus</span>
            <input name="country" required placeholder="USA, Canada, Qatar..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Programme</span>
            <input name="program" placeholder="EB-5, Golden Visa, Skilled Worker..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Budget USD</span>
            <input name="budgetUsd" inputMode="numeric" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Timeline months</span>
            <input name="timelineMonths" inputMode="numeric" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Family details</span>
            <input name="familyMembers" placeholder="Spouse, dependents..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Route fit score</span>
            <input name="routeFitScore" inputMode="numeric" placeholder="82" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Evidence strength</span>
            <input name="evidenceStrength" inputMode="numeric" placeholder="68" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Document readiness</span>
            <input name="documentReadiness" inputMode="numeric" placeholder="56" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Risk clarity</span>
            <input name="riskClarity" inputMode="numeric" placeholder="72" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Goals and advisor notes</span>
          <textarea name="goals" rows={4} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Source of funds notes</span>
          <textarea name="sourceOfFunds" rows={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Download className="size-4" />
            {busy === "download" ? "Generating..." : "Download detailed PDF"}
          </button>
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={(event) => void submit(event.currentTarget.form!, "email")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <Mail className="size-4" />
            {busy === "email" ? "Sending..." : "Email detailed PDF"}
          </button>
        </div>
        {message ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{message}</p> : null}
      </form>
    </section>
  );
}
