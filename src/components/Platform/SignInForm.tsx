"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type SignInFormProps = {
  demoMode: boolean;
};

export default function SignInForm({ demoMode }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@xiphias.local");
  const [password, setPassword] = useState("xiphias-admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (result?.error) {
      setError("Invalid portal credentials.");
      return;
    }
    router.push("/x-hub");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-primary focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      {demoMode ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Demo accounts in local dev: admin@xiphias.local / xiphias-admin, client@xiphias.local / xiphias-client,
          partner@xiphias.local / xiphias-partner.
        </div>
      ) : null}
    </form>
  );
}

