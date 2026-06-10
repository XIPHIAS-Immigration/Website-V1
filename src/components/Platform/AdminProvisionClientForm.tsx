"use client";

import { useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";

type ProvisionResponse = {
  ok?: boolean;
  error?: string;
  user?: {
    email: string;
    clientId?: string;
    portalStatus?: string;
    mustChangePassword?: boolean;
  };
  caseId?: string;
  temporaryPassword?: string;
  credentialsSent?: string;
};

const tracks = ["residency", "citizenship", "skilled", "corporate"] as const;

export default function AdminProvisionClientForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProvisionResponse | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    body.sendEmail = formData.has("sendEmail") ? "true" : "false";

    const response = await fetch("/api/platform/registration/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as ProvisionResponse;
    setBusy(false);
    setResult(response.ok ? data : { ok: false, error: data.error || "Could not provision client." });
    if (response.ok) form.reset();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-950/50">
          <UserPlus className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Manual payment confirmation</p>
          <h2 className="mt-1 text-xl font-black">Provision a client Hub account</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Use this after you manually confirm the INR 10,000 Topmate payment. It creates the client login,
            opens a case, adds onboarding documents, and records the payment reference.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3">
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
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Payment reference</span>
            <input name="paymentReference" required placeholder="Topmate booking/payment ID" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
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
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Amount</span>
            <input name="amount" defaultValue="10000" inputMode="numeric" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Country focus</span>
            <input name="country" placeholder="Canada, UAE, Portugal..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Programme</span>
            <input name="program" placeholder="Detailed assessment and advisor report" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input name="sendEmail" type="checkbox" defaultChecked className="size-4 rounded border-slate-300" />
          Email login credentials to the client
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <UserPlus className="size-4" />
            {busy ? "Provisioning..." : "Confirm payment and create access"}
          </button>
        </div>
      </form>

      {result ? (
        <div className={`mt-4 rounded-lg border p-4 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950"}`}>
          {result.ok ? (
            <div className="space-y-2">
              <p className="font-black">Client account created.</p>
              <p>Email: {result.user?.email}</p>
              <p>Client ID: {result.user?.clientId}</p>
              <p>Case ID: {result.caseId}</p>
              <p>Credential email: {result.credentialsSent}</p>
              {result.temporaryPassword ? (
                <div className="mt-3 rounded-md border border-emerald-300 bg-white p-3">
                  <p className="inline-flex items-center gap-2 font-black">
                    <KeyRound className="size-4" />
                    Temporary password
                  </p>
                  <p className="mt-1 font-mono text-base">{result.temporaryPassword}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-800">
                    Show this to staff now. The client will be asked to change it after sign-in.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="font-bold">{result.error}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
