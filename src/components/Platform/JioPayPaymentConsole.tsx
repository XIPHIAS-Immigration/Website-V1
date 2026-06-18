"use client";

import { useState } from "react";
import { ArrowRight, Copy, ExternalLink, Loader2, ReceiptIndianRupee } from "lucide-react";

type CheckoutResponse = {
  ok: boolean;
  error?: string;
  merchantTxnNo?: string;
  leadId?: string;
  checkoutUrl?: string;
  jiopay?: Record<string, unknown>;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  amountInr: string;
  productName: string;
  productType: string;
  track: string;
  country: string;
  program: string;
  notes: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  amountInr: "5000",
  productName: "XIPHIAS custom immigration payment",
  productType: "custom_payment",
  track: "residency",
  country: "",
  program: "",
  notes: "",
};

function payloadFromState(state: FormState) {
  return {
    name: state.name,
    email: state.email,
    phone: state.phone,
    amountInr: Number(state.amountInr),
    productType: state.productType || "custom_payment",
    productName: state.productName || "XIPHIAS custom immigration payment",
    track: state.track,
    country: state.country,
    program: state.program,
    page: "/x-hub/admin/payments",
    consent: true,
    answers: {
      source: "x-hub-admin-payment-console",
      notes: state.notes,
    },
  };
}

export default function JioPayPaymentConsole() {
  const [form, setForm] = useState<FormState>(initialState);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createCheckout() {
    setLoading(true);
    setError("");
    setCopied("");
    setResult(null);

    try {
      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromState(form)),
      });
      const data = (await response.json().catch(() => ({}))) as CheckoutResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not create JioPay checkout.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create JioPay checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function copyValue(label: string, value?: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              JioPay production console
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Create a custom payment link</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Use this for report unlocks, registration payments, advisor retainers, or manually quoted service fees.
              The checkout is created server-side and saved as a payment lead in X-Hub.
            </p>
          </div>
          <span className="hidden rounded-lg bg-blue-50 p-3 text-primary dark:bg-blue-950/40 sm:inline-flex">
            <ReceiptIndianRupee className="size-6" />
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Client name</span>
            <input
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="Client full name"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email</span>
            <input
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="client@email.com"
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Phone / WhatsApp</span>
            <input
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="+91..."
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Amount INR</span>
            <input
              value={form.amountInr}
              onChange={(event) => setField("amountInr", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              min="1"
              step="1"
              type="number"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Payment title</span>
            <input
              value={form.productName}
              onChange={(event) => setField("productName", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="XIA personalised immigration report"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Product type</span>
            <select
              value={form.productType}
              onChange={(event) => setField("productType", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="custom_payment">Custom payment</option>
              <option value="premium_report">Premium report</option>
              <option value="registration">Registration</option>
              <option value="advisor_retainer">Advisor retainer</option>
              <option value="document_review">Document review</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Track</span>
            <select
              value={form.track}
              onChange={(event) => setField("track", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="residency">Residency</option>
              <option value="citizenship">Citizenship</option>
              <option value="skilled">Skilled</option>
              <option value="corporate">Corporate</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Country</span>
            <input
              value={form.country}
              onChange={(event) => setField("country", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="United States, Canada, UAE..."
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Programme</span>
            <input
              value={form.program}
              onChange={(event) => setField("program", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="EB-2 NIW, Express Entry..."
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Internal notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => setField("notes", event.target.value)}
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder="Optional staff note for the lead/order record"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={createCheckout}
          disabled={loading}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Create JioPay link
        </button>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Payment output</p>
        <h2 className="mt-1 text-xl font-semibold">Send this to the client</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Once the client pays, JioPay will call the S2S webhook and the order will be recorded in the runtime store.
        </p>

        {result?.checkoutUrl ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Merchant transaction</p>
              <p className="mt-2 break-all font-mono text-sm font-bold">{result.merchantTxnNo}</p>
              <button
                type="button"
                onClick={() => copyValue("merchantTxnNo", result.merchantTxnNo)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <Copy className="size-4" />
                Copy transaction ID
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Checkout link</p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-700 dark:text-slate-200">
                {result.checkoutUrl}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyValue("checkoutUrl", result.checkoutUrl)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-primary dark:border-slate-700"
                >
                  <Copy className="size-4" />
                  Copy link
                </button>
                <a
                  href={result.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#e1b923] px-3 py-2 text-sm font-semibold text-[#071b3d]"
                >
                  <ExternalLink className="size-4" />
                  Open checkout
                </a>
              </div>
            </div>

            {copied ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
                Copied {copied}.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            Fill the client and amount fields, then create a link. The generated URL can be sent by email, WhatsApp, or copied into an invoice.
          </div>
        )}
      </aside>
    </div>
  );
}
