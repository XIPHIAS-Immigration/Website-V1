import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gauge, FileCheck2, ShieldCheck } from "lucide-react";
import SignInForm from "@/components/Platform/SignInForm";
import { hasPortalUsersConfigured } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "X-Hub Sign In | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

const FEATURES = [
  { label: "Cases",     icon: Gauge },
  { label: "Documents", icon: FileCheck2 },
  { label: "Risk",      icon: ShieldCheck },
] as const;

type SignInSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function XHubSignInPage({
  searchParams,
}: {
  searchParams?: SignInSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const loggedOut = params.loggedOut === "1";
  const hasConfiguredAccess = hasPortalUsersConfigured();

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040f24] px-4 py-12"
      aria-label="X-Hub portal sign-in"
    >
      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b2a6b] via-[#061632] to-[#040f24]" />
        {/* Ambient glows */}
        <div className="absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-[#1c57b4]/25 blur-[120px]" />
        <div className="absolute right-[8%] bottom-[15%] h-64 w-64 rounded-full bg-[#e1b923]/12 blur-[100px]" />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10">

        {/* ━━ Dark branding zone ━━ */}
        <div className="relative bg-[#071a3a] px-7 pt-6 pb-7">
          {/* Inner glow */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e1b923]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e1b923]/40 to-transparent" />
          </div>

          {/* Logo + badge */}
          <div className="relative flex items-start justify-between">
            <Image
              src="/images/logo/xiphias-immigration-white.png"
              alt="XIPHIAS Immigration"
              width={130}
              height={46}
              priority
              className="h-auto w-[112px]"
            />
            <span className="mt-0.5 rounded-full border border-[#e1b923]/35 bg-[#e1b923]/10 px-2.5 py-[3px] text-[9px] font-black uppercase tracking-[0.22em] text-[#e1b923]">
              X-Hub
            </span>
          </div>

          {/* Portal description */}
          <div className="relative mt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e1b923]/80">
              Secure Client Portal
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-[1.6] text-white/75">
              Unified workspace for immigration case management
              and advisor collaboration.
            </p>
          </div>

          {/* Feature chips */}
          <div className="relative mt-5 flex flex-wrap gap-2" aria-label="Portal features">
            {FEATURES.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11.5px] font-semibold text-white/70"
              >
                <Icon className="size-3 text-[#e1b923]/80" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ━━ White form zone ━━ */}
        <div className="bg-white px-7 pb-7 pt-6">
          <h1 className="text-[1.25rem] font-black leading-tight tracking-tight text-[#263238]">
            Sign in
          </h1>

          {loggedOut ? (
            <div className="mt-4 rounded-lg border border-[#dce6f7] bg-[#f4f8ff] px-3.5 py-3 text-[12.5px] font-semibold leading-5 text-[#24466f]">
              You have been signed out securely.
              <Link href="/" className="ml-2 font-black text-[#1c57b4] underline underline-offset-4">
                Return to website
              </Link>
            </div>
          ) : null}

          <div className="mt-5">
            <SignInForm hasConfiguredAccess={hasConfiguredAccess} />
          </div>
          {!loggedOut ? (
            <Link
              href="/"
              className="mt-4 inline-flex text-[12.5px] font-bold text-[#1c57b4] underline underline-offset-4"
            >
              Return to website
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
