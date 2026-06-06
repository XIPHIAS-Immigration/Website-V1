"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";
import type { RiskProfile } from "@/lib/platform/types";

type ComplianceResult = {
  provider: string;
  mode: "vendor" | "demo";
  status: "clear" | "review" | "blocked";
  sanctionsHit: boolean;
  pepHit: boolean;
  adverseMediaHit: boolean;
  referenceId: string;
  checkedAt: string;
  notes: string[];
};

type Props = {
  initialProfiles: RiskProfile[];
  caseId?: string;
};

function tone(level: string) {
  if (level === "blocked" || level === "high") return "red" as const;
  if (level === "medium" || level === "review") return "amber" as const;
  return "green" as const;
}

export default function RiskReviewClient({ initialProfiles, caseId }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Running checks...");
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/platform/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...raw,
        caseId,
        investmentUsd: Number(raw.investmentUsd || 0),
        sourceOfFundsProvided: raw.sourceOfFundsProvided === "on",
        pepDeclared: raw.pepDeclared === "on",
        documents: [
          { label: "Identity document", status: raw.identityStatus || "requested", extractedName: raw.extractedName },
          { label: "Source of funds", status: raw.fundsStatus || "requested" },
        ],
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      profile?: RiskProfile;
      compliance?: ComplianceResult;
      error?: string;
    };
    setBusy(false);

    if (!response.ok || !data.profile) {
      setMessage(data.error || "Risk review failed.");
      return;
    }

    setProfiles((prev) => [data.profile!, ...prev]);
    setCompliance(data.compliance ?? null);
    setMessage("Risk review created.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold">Run due diligence</h2>
        <p className="mt-1 text-sm text-slate-500">Deterministic document checks plus vendor-ready PEP/sanctions screening.</p>
        <div className="mt-4 grid gap-3">
          <input name="fullName" placeholder="Applicant full name" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="dateOfBirth" placeholder="Date of birth" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <input name="nationality" placeholder="Nationality" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="country" placeholder="Target country" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <input name="program" placeholder="Program" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <input name="investmentUsd" type="number" placeholder="Investment USD" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select name="identityStatus" defaultValue="uploaded" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {["requested", "uploaded", "reviewing", "accepted", "rework"].map((status) => (
                <option key={status} value={status}>
                  Identity: {status}
                </option>
              ))}
            </select>
            <select name="fundsStatus" defaultValue="requested" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {["requested", "uploaded", "reviewing", "accepted", "rework"].map((status) => (
                <option key={status} value={status}>
                  Funds: {status}
                </option>
              ))}
            </select>
          </div>
          <input name="extractedName" placeholder="Extracted name from document" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="sourceOfFundsProvided" type="checkbox" className="size-4" />
            Source of funds provided
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="pepDeclared" type="checkbox" className="size-4" />
            PEP declared
          </label>
          <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Running checks" : "Create risk review"}
          </button>
          {message ? <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{message}</p> : null}
        </div>
      </form>

      <div className="grid gap-4">
        {compliance ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Compliance screening</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {compliance.provider} - {compliance.mode === "vendor" ? "live vendor mode" : "demo mode"}
                </p>
              </div>
              <StatusPill tone={tone(compliance.status)}>{compliance.status}</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatusPill tone={compliance.sanctionsHit ? "red" : "green"}>Sanctions {compliance.sanctionsHit ? "hit" : "clear"}</StatusPill>
              <StatusPill tone={compliance.pepHit ? "amber" : "green"}>PEP {compliance.pepHit ? "review" : "clear"}</StatusPill>
              <StatusPill tone={compliance.adverseMediaHit ? "amber" : "green"}>Media {compliance.adverseMediaHit ? "review" : "clear"}</StatusPill>
            </div>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {compliance.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Risk history</h2>
          <div className="mt-4 grid gap-3">
            {profiles.map((profile) => (
              <article key={profile.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold">Review {profile.id}</h3>
                  <StatusPill tone={tone(profile.level)}>{profile.level}</StatusPill>
                </div>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {profile.flags.length ? (
                    profile.flags.map((flag) => <li key={flag.code}>{flag.label}: {flag.detail}</li>)
                  ) : (
                    <li>No deterministic risk flags found.</li>
                  )}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
