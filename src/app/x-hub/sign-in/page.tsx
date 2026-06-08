import type { Metadata } from "next";
import SignInForm from "@/components/Platform/SignInForm";

export const metadata: Metadata = {
  title: "XIPHIAS Hub Sign In | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

export default function XHubSignInPage() {
  const demoMode = process.env.NODE_ENV !== "production" || process.env.XIPHIAS_PORTAL_DEMO_MODE === "true";

  return (
    <section className="min-h-screen bg-slate-100 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">XIPHIAS Hub</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
            XIPHIAS client, partner, and institutional portal
          </h1>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            {[
              "Case tracker with milestones and next actions",
              "Document vault with upload and review status",
              "XIA Advisor for no-LLM pathway triage",
              "Partner and institutional workflow tracking",
            ].map((item) => (
              <div key={item} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Use an approved XIPHIAS portal account.
          </p>
          <div className="mt-5">
            <SignInForm demoMode={demoMode} />
          </div>
        </div>
      </div>
    </section>
  );
}
