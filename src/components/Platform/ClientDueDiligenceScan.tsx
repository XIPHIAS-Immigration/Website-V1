"use client";

import { useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import type { ClientDocument, ClientProfile, MigrationCase, RiskProfile } from "@/lib/platform/types";

type Props = {
  activeCase?: MigrationCase;
  profile?: ClientProfile;
  documents: ClientDocument[];
};

type ScanResult = {
  profile?: RiskProfile;
  compliance?: {
    provider: string;
    mode: string;
    status: string;
    referenceId: string;
  };
};

function levelClass(level?: string) {
  if (level === "high" || level === "blocked") return "border-red-200 bg-red-50 text-red-900";
  if (level === "medium") return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-emerald-200 bg-emerald-50 text-emerald-950";
}

export default function ClientDueDiligenceScan({ activeCase, profile, documents }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  async function runScan() {
    if (!activeCase) {
      setMessage("No active case is assigned yet.");
      return;
    }

    setBusy(true);
    setMessage("Running document and profile checks...");
    setResult(null);

    const response = await fetch("/api/platform/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: activeCase.id,
        fullName: profile?.fullName || "Portal client",
        dateOfBirth: profile?.dateOfBirth,
        nationality: profile?.nationality,
        country: activeCase.country,
        program: activeCase.program,
        investmentUsd: profile?.budgetUsd,
        sourceOfFundsProvided: Boolean(profile?.sourceOfFunds) && !documents.some((doc) => doc.category === "financial" && ["requested", "rework"].includes(doc.status)),
        documents: documents.map((doc) => ({
          label: doc.label,
          status: doc.status,
          extractedName: profile?.fullName,
        })),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as ScanResult & { error?: string };
    setBusy(false);

    if (!response.ok) {
      setMessage(data.error || "Could not run the check.");
      return;
    }

    setResult(data);
    setMessage("Scan complete. Staff verification is still required before filing.");
  }

  const level = result?.profile?.level;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Due diligence layer</p>
          <h3 className="mt-1 text-lg font-black">Run a pre-check</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Checks missing documents, source-of-funds readiness, PEP/sanctions adapter status, and risk flags from the current portal record.
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-950/50">
          <ShieldCheck className="size-5" />
        </span>
      </div>

      {result?.profile ? (
        <div className={`mt-4 rounded-lg border px-3 py-3 ${levelClass(level)}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black">Risk level: {result.profile.level}</p>
            <p className="text-xs font-bold">Ref: {result.compliance?.referenceId || result.profile.id}</p>
          </div>
          <ul className="mt-2 list-inside list-disc text-sm">
            {result.profile.flags.length ? (
              result.profile.flags.map((flag) => <li key={flag.code}>{flag.label}</li>)
            ) : (
              <li>No deterministic risk flags found.</li>
            )}
          </ul>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{message}</p> : null}

      <button
        type="button"
        onClick={runScan}
        disabled={busy || !activeCase}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-black text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="size-4" />
        {busy ? "Checking..." : "Run due diligence pre-check"}
      </button>
    </div>
  );
}
