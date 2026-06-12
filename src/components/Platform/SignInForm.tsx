"use client";

import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

type SignInFormProps = {
  hasConfiguredAccess: boolean;
};

export default function SignInForm({ hasConfiguredAccess }: SignInFormProps) {
  const router = useRouter();
  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const errorId = `${uid}-error`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (result?.error) {
      setError("Incorrect email or password. Please try again.");
      return;
    }
    router.replace("/x-hub");
    router.refresh();
  }

  const hasError = !!error;
  const borderCls = hasError
    ? "border-[#CF3127] focus-within:ring-[#CF3127]"
    : "border-[#E1E1E1] hover:border-[#1c57b4]/60 focus-within:ring-[#1c57b4]";

  const fieldWrap =
    `relative flex items-center rounded-lg border bg-white transition-colors focus-within:ring-2 focus-within:ring-offset-1 ${borderCls}`;

  const inputCls =
    "block w-full bg-transparent py-2.5 text-[14px] text-[#263238] placeholder-[#b0b7c3] focus:outline-none disabled:opacity-50";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">

      {/* Email */}
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#505050]">
          Email
        </label>
        <div className={fieldWrap}>
          <Mail
            className="ml-3 mr-2.5 size-[15px] shrink-0 text-[#1c57b4]/60"
            aria-hidden="true"
          />
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={hasError ? errorId : undefined}
            aria-invalid={hasError}
            disabled={submitting}
            placeholder="you@xiphias.in"
            className={`${inputCls} pr-3.5`}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#505050]">
          Password
        </label>
        <div className={fieldWrap}>
          <Lock
            className="ml-3 mr-2.5 size-[15px] shrink-0 text-[#1c57b4]/60"
            aria-hidden="true"
          />
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={hasError}
            disabled={submitting}
            placeholder="••••••••"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="mr-3 ml-1 shrink-0 rounded text-[#9ca3af] transition-colors hover:text-[#1c57b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c57b4] focus-visible:ring-offset-1"
            tabIndex={0}
          >
            {showPassword
              ? <EyeOff className="size-[15px]" aria-hidden="true" />
              : <Eye className="size-[15px]" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* Error */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#CF3127]"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !hasConfiguredAccess}
        aria-busy={submitting}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c57b4] px-4 py-2.5 text-[13.5px] font-bold tracking-wide text-white transition-colors hover:bg-[#1648a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c57b4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {submitting ? (
          <>
            <span
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          "Sign in to X-Hub"
        )}
      </button>

      {/* Config warning */}
      {!hasConfiguredAccess && (
        <p
          role="alert"
          className="rounded-lg border border-[#e1b923]/50 bg-[#e1b923]/10 px-3.5 py-2.5 text-[12px] font-semibold leading-5 text-[#7a5f00]"
        >
          Portal access is not configured. Add an admin account in environment
          variables before using X-Hub.
        </p>
      )}
    </form>
  );
}
