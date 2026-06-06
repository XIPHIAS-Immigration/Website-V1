// src/app/(site)/client-referrals/thank-you/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

const CANONICAL = "/client-referrals/thank-you";

export const metadata: Metadata = {
  title: "Thank You for Your Referral | XIPHIAS Immigration",
  description:
    "We’ve received your referral. Our team will reach out to your contact shortly and keep you updated as their case progresses.",
  alternates: {
    canonical: CANONICAL,
  },
  robots: { index: false, follow: true }, // you can change to true if you want it indexed
};

export default function ReferralThankYouPage() {
  const heroId = "referral-thank-you-title";

  return (
    <main
      id="main"
      className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 text-black dark:text-white"
    >
      <section
        aria-labelledby={heroId}
        className={[
          "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
          "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
          "text-black dark:text-white",
        ].join(" ")}
      >
        {/* Background accents (same style as other premium heroes) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        <div className="relative text-left md:max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <Dot className="mr-1.5" />
            Referral submitted
          </span>

          <h1
            id={heroId}
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
          >
            Thank you for your referral.
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
            We’ve received your details and the information of the person you’ve
            referred. Our team will review the submission and contact them
            shortly to understand their plans and guide them on the best
            options.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              • Your referral will hear from us via phone or email on working
              days.
            </li>
            <li>
              • If they sign up and progress with a case, your referral rewards
              will be processed as per the program terms.
            </li>
            <li>• You can always share this page again to refer more people.</li>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/client-referrals"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
            >
              Refer another client
              <ArrowRight />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
            >
              Go back to homepage
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-3">
        <Breadcrumb />
      </div>
    </main>
  );
}

/* icons */

function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}