"use client";

// src/components/Xia/GetReportClient.tsx
// The last step. Everything already known is shown, not asked. The only fields
// that can appear are the three we are legally obliged to collect.

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, LockKeyhole } from "lucide-react";

import type { CaseMatch } from "@/lib/xia/case";

type Prefill = {
  name: string; email: string; phone: string;
  destination: string; goal: string;
  programmes: string[];
  matches: CaseMatch[];
};

export default function GetReportClient({
  productType, label, priceInr, prefill,
}: {
  productType: string; label: string; priceInr: number; prefill: Prefill;
}) {
  const [name, setName] = useState(prefill.name);
  const [email, setEmail] = useState(prefill.email);
  const [phone, setPhone] = useState(prefill.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const needsDetails = !prefill.name || !prefill.email || !prefill.phone;

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      // Keep the case current before leaving the site for the gateway.
      await fetch("/api/xia/case?source=checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, event: { kind: "started-checkout", detail: productType } }),
      });

      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType, name, email, phone,
          country: prefill.destination,
          answers: {
            country: prefill.destination,
            focus: prefill.goal,
            programmes: prefill.programmes.join(", "),
            notes: prefill.matches.map((m) => `${m.title}: ${m.reason}`).join(" | ").slice(0, 1000),
          },
        }),
      });
      const data = await response.json();
      if (!data?.ok || !data?.redirectUrl) {
        setError(data?.error || "Checkout could not be opened. Please try again in a moment.");
        setBusy(false);
        return;
      }
      window.location.href = data.redirectUrl as string;
    } catch {
      setError("Something went wrong reaching the payment gateway.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary py-16 text-white">
      <div className="mx-auto w-full max-w-2xl px-5">
        <p className="type-caption uppercase tracking-[0.2em] text-[#e1b923]">Your report</p>
        <h1 className="type-section-title mt-2 text-white">{label}</h1>

        {prefill.programmes.length ? (
          <div className="mt-7 rounded-xl border border-white/15 bg-white/[0.06] p-5">
            <p className="type-caption uppercase tracking-[0.16em] text-white/45">Built around</p>
            <ul className="mt-3 space-y-2">
              {prefill.matches.map((match) => (
                <li key={match.programmeId} className="flex items-start gap-2.5 text-[14px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#e1b923]" aria-hidden="true" />
                  <span>
                    <strong className="font-bold">{match.title}</strong>
                    <span className="block text-[13px] text-white/60">{match.reason}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <form onSubmit={pay} className="mt-7">
          {needsDetails ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "r-name", value: name, set: setName, label: "Full name", type: "text", auto: "name" },
                { id: "r-email", value: email, set: setEmail, label: "Email", type: "email", auto: "email" },
                { id: "r-phone", value: phone, set: setPhone, label: "Phone", type: "tel", auto: "tel" },
              ].map((field) => (
                <label key={field.id} htmlFor={field.id} className="block">
                  <span className="type-caption block uppercase tracking-[0.1em] text-white/45">{field.label}</span>
                  <input
                    id={field.id}
                    type={field.type}
                    autoComplete={field.auto}
                    required
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2.5 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#e1b923]"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="type-small text-white/60">
              Sending to <strong className="text-white">{email}</strong>. Not you?{" "}
              <button type="button" onClick={() => { setEmail(""); setName(""); setPhone(""); }} className="underline">
                Change
              </button>
            </p>
          )}

          {error ? (
            <p role="alert" className="mt-4 rounded-lg border border-red-300/40 bg-red-500/15 px-4 py-3 text-[13px] font-semibold">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-7 text-base font-black text-[#071a3a] transition hover:bg-[#f0cb3b] disabled:opacity-60"
          >
            {busy ? (
              <><LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Opening secure checkout…</>
            ) : (
              <>Pay ₹{priceInr.toLocaleString("en-IN")} and get the report <ArrowRight className="size-5" aria-hidden="true" /></>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/45">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Secure payment via JioPay. The report is generated as soon as payment clears.
          </p>
        </form>
      </div>
    </div>
  );
}
