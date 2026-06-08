"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ChangePasswordFormProps = {
  canChangePassword: boolean;
  mustChangePassword?: boolean;
};

export default function ChangePasswordForm({ canChangePassword, mustChangePassword }: ChangePasswordFormProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ tone: "error", message: "The new password and confirmation do not match." });
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/platform/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setSubmitting(false);

    if (!response.ok || !data.ok) {
      setStatus({ tone: "error", message: data.error || "Password could not be changed." });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus({ tone: "success", message: "Password changed. Your Hub account is now active." });
    router.refresh();
  }

  if (!canChangePassword) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        This account is managed through configured portal credentials. Password changes for this account are handled by the administrator.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mustChangePassword ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Please replace the temporary password sent after registration.
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current password</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={10}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm new password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={10}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </label>

      {status ? (
        <p className={`text-sm font-semibold ${status.tone === "success" ? "text-emerald-700" : "text-red-600"}`}>
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Change password"}
      </button>
    </form>
  );
}
