"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

type OrderStage = "pending" | "processing" | "ready" | "action_required" | "needs_support" | "payment_failed";

type StatusResponse = {
  ok?: boolean;
  stage?: OrderStage;
  message?: string;
  actionHref?: string;
  error?: string;
};

export default function OrderFulfillmentStatus({ statusUrl }: { statusUrl: string }) {
  const [stage, setStage] = useState<OrderStage>("processing");
  const [message, setMessage] = useState("Checking fulfilment status…");
  const [actionHref, setActionHref] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch(statusUrl, { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json().catch(() => ({}))) as StatusResponse;
        if (!response.ok || !data.ok || !data.stage) throw new Error(data.error || "Could not check fulfilment status.");
        if (cancelled) return;
        setStage(data.stage);
        setMessage(data.message || "Status updated.");
        setActionHref(data.actionHref || "");
        if (["ready", "action_required", "needs_support", "payment_failed"].includes(data.stage)) return;
      } catch (error) {
        if (cancelled) return;
        if (attempts >= 40) {
          setStage("needs_support");
          setMessage(error instanceof Error ? error.message : "Fulfilment is taking longer than expected.");
          return;
        }
      }
      if (!cancelled && attempts < 40) timer = window.setTimeout(poll, 3000);
    }

    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [statusUrl]);

  const complete = stage === "ready";
  const attention = stage === "needs_support" || stage === "payment_failed";
  const Icon = complete ? CheckCircle2 : attention ? ShieldAlert : LoaderCircle;

  return (
    <div className={`mt-6 rounded-xl border p-5 ${complete ? "border-emerald-200 bg-emerald-50" : attention ? "border-amber-200 bg-amber-50" : "border-[#c8daf0] bg-[#f4f8fd]"}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${!complete && !attention ? "animate-spin" : ""} ${complete ? "text-emerald-700" : attention ? "text-amber-700" : "text-[#1f5fbc]"}`} aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[#071a3a]">{complete ? "Fulfilment complete" : attention ? "Order preserved" : "Preparing your purchase"}</p>
          <p className="mt-1 text-sm leading-6 text-[#536277]" aria-live="polite">{message}</p>
          {actionHref ? <Link href={actionHref} className="mt-3 inline-flex rounded-lg bg-[#1f5fbc] px-4 py-2.5 text-sm font-semibold text-white">Continue to X-Hub</Link> : null}
          {stage === "needs_support" ? <Link href="/contact" className="mt-3 inline-flex rounded-lg bg-[#1f5fbc] px-4 py-2.5 text-sm font-semibold text-white">Contact support with your order reference</Link> : null}
        </div>
      </div>
    </div>
  );
}
