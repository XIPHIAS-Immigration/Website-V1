import type { Metadata } from "next";
import Image from "next/image";
import { FileCheck2, Gauge, LockKeyhole, ShieldCheck } from "lucide-react";
import SignInForm from "@/components/Platform/SignInForm";
import { hasPortalUsersConfigured } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "X-Hub Sign In | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

export default function XHubSignInPage() {
  const hasConfiguredAccess = hasPortalUsersConfigured();
  const featureItems = [
    { label: "Case tracker", icon: Gauge },
    { label: "Document vault", icon: FileCheck2 },
    { label: "Risk review", icon: ShieldCheck },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#061632] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,105,206,0.42),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(216,184,72,0.22),transparent_26%),linear-gradient(135deg,#061632_0%,#0a2555_52%,#07152d_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl shadow-black/30 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[520px] overflow-hidden bg-[#071a3a] p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-28 -top-28 size-72 rounded-full bg-[#1c57b4]/45 blur-3xl" />
            <div className="absolute -bottom-24 left-24 size-64 rounded-full bg-[#d8b848]/20 blur-3xl" />

            <div className="relative">
              <Image
                src="/images/logo/xiphias-immigration-white.png"
                alt="XIPHIAS Immigration"
                width={164}
                height={58}
                priority
                className="h-auto w-40"
              />

              <div className="mt-16 max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f4d36b]">Secure client workspace</p>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                  X-Hub for cases, documents, and advisor follow-through.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-blue-50/82 sm:text-base">
                  Approved clients and staff use one controlled workspace for profile details, document uploads,
                  case milestones, report delivery, and risk review.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {featureItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                      <Icon className="size-5 text-[#f4d36b]" />
                      <p className="mt-3 text-sm font-black">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 rounded-2xl border border-[#d8b848]/40 bg-[#081f45]/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f4d36b]">Access policy</p>
                <p className="mt-2 text-sm leading-6 text-blue-50/82">
                  Accounts are created only by XIPHIAS staff after registration or internal approval.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-[#f8fbff] p-6 text-[#071a3a] sm:p-8 lg:p-10">
            <div className="w-full">
              <div className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl bg-[#071a3a] text-[#f4d36b] shadow-lg shadow-blue-950/15">
                <LockKeyhole className="size-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1c57b4]">X-Hub login</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal text-[#071a3a]">Sign in securely</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the portal credentials issued by the XIPHIAS team.
              </p>
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                <SignInForm hasConfiguredAccess={hasConfiguredAccess} />
              </div>
              <p className="mt-5 text-xs font-semibold leading-5 text-slate-500">
                Trouble signing in? Ask your advisor to verify your account status before resetting credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
