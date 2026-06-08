"use client";

import { useState } from "react";
import { CheckCircle2, Send, TriangleAlert } from "lucide-react";

type Health = {
  generatedAt: string;
  storage: {
    mode: string;
    storePath?: string;
    counts: Record<string, number>;
  };
  email: {
    configured: boolean;
    hostConfigured: boolean;
    userConfigured: boolean;
    fromConfigured: boolean;
    generalRecipient: string;
    partnerRecipient: string;
    b2gRecipient: string;
  };
  whatsapp: {
    configured: boolean;
    tokenConfigured: boolean;
    phoneNumberIdConfigured: boolean;
    defaultRecipientConfigured: boolean;
    webhookVerifyTokenConfigured: boolean;
  };
  registration: {
    topmateUrlConfigured: boolean;
    webhookSecretConfigured: boolean;
    provisioningMode: string;
  };
  compliance: {
    mode: string;
    endpointConfigured: boolean;
    apiKeyConfigured: boolean;
    provider: string;
  };
  uploads: {
    mode: string;
    configuredDirectory: string;
  };
};

type Props = {
  initialHealth: Health;
};

function ReadinessCard({ title, ready, children }: { title: string; ready: boolean; children: React.ReactNode }) {
  const Icon = ready ? CheckCircle2 : TriangleAlert;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          <Icon className="size-4" />
          {ready ? "Ready" : "Needs config"}
        </span>
      </div>
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default function PlatformHealthClient({ initialHealth }: Props) {
  const [health, setHealth] = useState(initialHealth);
  const [testMessage, setTestMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/platform/admin/health");
    const data = (await response.json()) as { ok: boolean } & Health;
    if (data.ok) setHealth(data);
  }

  async function testWhatsApp() {
    setBusy(true);
    setTestMessage("Testing...");
    const response = await fetch("/api/platform/whatsapp/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await response.json().catch(() => ({}))) as { result?: { status?: string; reason?: string } };
    setBusy(false);
    setTestMessage(data.result?.status === "sent" ? "WhatsApp test sent." : data.result?.reason || "WhatsApp test did not send.");
    await refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Deployment readiness</p>
        <h2 className="mt-1 text-xl font-bold">Platform health check</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Use this screen before a demo or launch to confirm storage, SMTP, WhatsApp, compliance, and uploads are configured.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
      <ReadinessCard title="Platform storage" ready={health.storage.mode !== "memory"}>
        <p>
          Mode: <strong>{health.storage.mode}</strong>
        </p>
        {health.storage.storePath ? <p className="mt-1 break-all">Store: {health.storage.storePath}</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(health.storage.counts).map(([key, value]) => (
            <div key={key} className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <span className="block text-xs uppercase tracking-[0.12em] text-slate-500">{key}</span>
              <span className="text-lg font-bold">{value}</span>
            </div>
          ))}
        </div>
      </ReadinessCard>

      <ReadinessCard title="SMTP email" ready={health.email.configured}>
        <p>Partner recipient: {health.email.partnerRecipient}</p>
        <p>B2G recipient: {health.email.b2gRecipient}</p>
        <p>General recipient: {health.email.generalRecipient}</p>
      </ReadinessCard>

      <ReadinessCard title="WhatsApp Cloud API" ready={health.whatsapp.configured}>
        <div className="grid gap-1">
          <p>Token: {health.whatsapp.tokenConfigured ? "configured" : "missing"}</p>
          <p>Phone number ID: {health.whatsapp.phoneNumberIdConfigured ? "configured" : "missing"}</p>
          <p>Default recipient: {health.whatsapp.defaultRecipientConfigured ? "configured" : "missing"}</p>
          <p>Webhook verify token: {health.whatsapp.webhookVerifyTokenConfigured ? "configured" : "missing"}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={testWhatsApp}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            <Send className="size-4" />
            Send test
          </button>
          {testMessage ? <span className="text-sm font-semibold">{testMessage}</span> : null}
        </div>
      </ReadinessCard>

      <ReadinessCard
        title="Paid registration"
        ready={health.registration.topmateUrlConfigured && health.registration.provisioningMode !== "blocked"}
      >
        <div className="grid gap-1">
          <p>Topmate INR 10,000 URL: {health.registration.topmateUrlConfigured ? "configured" : "missing"}</p>
          <p>Provisioning secret: {health.registration.webhookSecretConfigured ? "configured" : "missing"}</p>
          <p>Provisioning mode: {health.registration.provisioningMode}</p>
          <p className="mt-2">
            Payment completion should POST to <strong>/api/platform/registration/provision</strong>.
          </p>
        </div>
      </ReadinessCard>

      <ReadinessCard title="Compliance screening" ready={health.compliance.mode === "vendor"}>
        <p>Mode: {health.compliance.mode}</p>
        <p>Provider: {health.compliance.provider}</p>
        <p>Endpoint: {health.compliance.endpointConfigured ? "configured" : "not configured"}</p>
        <p>API key: {health.compliance.apiKeyConfigured ? "configured" : "not configured"}</p>
      </ReadinessCard>

      <ReadinessCard title="Document uploads" ready>
        <p>Mode: {health.uploads.mode}</p>
        <p className="break-all">Directory: {health.uploads.configuredDirectory}</p>
      </ReadinessCard>
      </div>
    </div>
  );
}
