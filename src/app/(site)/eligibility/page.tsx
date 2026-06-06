import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
// Dynamically import heavy client components to reduce initial JavaScript and improve
// Lighthouse performance scores. We explicitly select the default export because
// some modules may not provide a default; this avoids passing the entire module object
// to the client component (see awards page issue)【709169303420970†screenshot】.
import nextDynamic from "next/dynamic";

// Lazy-load the interactive eligibility flow; it’s a client component with heavy logic.
const FlowComponent = nextDynamic(() => import("./Flow").then((mod) => mod.default));

// Lazy-load the hero section. It contains decorative backgrounds and feature chips that aren’t critical
// for the first paint, so loading it asynchronously reduces the main bundle size.
const EligibilityHeroDynamic = nextDynamic(() =>
  import("@/components/Eligibility/EligibilityHero").then((mod) => mod.default)
);

/* ── SEO ─────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:
    "Free Immigration Eligibility Check | Residency • Citizenship • Corporate • Skilled",
  description:
    "Interactive global eligibility quiz. Answer a few smart questions and get instant results plus a personalized PDF by email.",
  keywords: [
    "eligibility check",
    "residency eligibility",
    "citizenship eligibility",
    "corporate visa eligibility",
    "skilled migration eligibility",
  ],
  alternates: { canonical: "/eligibility" },
  openGraph: {
    title:
      "Free Immigration Eligibility Check | Residency • Citizenship • Corporate • Skilled",
    description:
      "Interactive global eligibility quiz. Answer a few smart questions and get instant results plus a personalized PDF by email.",
    url: "https://www.xiphiasimmigration.com/eligibility",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Free Immigration Eligibility Check – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Free Immigration Eligibility Check | Residency • Citizenship • Corporate • Skilled",
    description:
      "Answer a few smart questions and get instant eligibility results plus a personalized PDF.",
    images: ["/xiphias-immigration.png"],
  },
};

/** Ensure this page is rendered dynamically (avoids SSG + searchParams bailouts) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this assessment free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It’s a free preliminary assessment to guide your next steps.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are the results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They’re indicative and based on your answers. Final outcomes depend on official review.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to share my email to see full results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes—after a quick preview, enter your name and email to unlock full results and download your personalized PDF.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take?",
      acceptedAnswer: { "@type": "Answer", text: "Typically 2–4 minutes." },
    },
    {
      "@type": "Question",
      name: "Is my data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We keep your information confidential and never sell it to third parties.",
      },
    },
  ],
};

/* ── Inline icons (no deps) ──────────────────────────────────────────── */
function IconZap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
    </svg>
  );
}
function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M12 22c6-3 8-6 8-10V5l-8-3-8 3v7c0 4 2 7 8 10z" />
    </svg>
  );
}
function IconFileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconMinus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function EligibilityPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="bg-white text-black dark:bg-black dark:text-white">
        {/* Single container wrapper */}
        <section className="container mx-auto lg:max-w-screen-2xl px-3 sm:px-4">
          {/* HERO (dynamically imported) */}
          <section className="py-6 text-center">
            <EligibilityHeroDynamic />
          </section>

          {/* FLOW frame */}
          <section id="start" className="scroll-mt-24">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-[1px] shadow-sm">
              <div className="rounded-2xl bg-white dark:bg-black min-w-0 overflow-hidden">
                {/* meta chips */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5 md:py-3">
                  <h2 className="text-base md:text-xl font-semibold">
                    Start your free eligibility check
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2 py-1 text-[11px] font-medium ring-1 ring-black/10 dark:ring-white/10">
                      <IconZap /> 2–4 min
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2 py-1 text-[11px] font-medium ring-1 ring-black/10 dark:ring-white/10">
                      <IconFileText /> Instant results + PDF
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2 py-1 text-[11px] font-medium ring-1 ring-black/10 dark:ring-white/10">
                      <IconShield /> Secure
                    </span>
                  </div>
                </div>

                {/* Flow (client) wrapped in Suspense for useSearchParams */}
                <div className="pb-4 pt-2 md:pb-4">
                  <div className="min-w-0">
                    <Suspense
                      fallback={
                        <div className="px-3 md:px-5 pb-4">
                          <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-black/5 dark:bg-white/10 h-28 animate-pulse" />
                        </div>
                      }
                    >
                      <FlowComponent />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Micro-benefits */}
          <section className="mt-4">
            <div className="md:grid md:grid-cols-3 md:gap-3">
              <div className="grid grid-cols-2 gap-2 md:contents">
                <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-black px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconZap />
                    <span className="font-semibold">Fast</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm">Finish in 2–4 minutes.</p>
                </div>
                <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-black px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconFileText />
                    <span className="font-semibold">Detailed PDF</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm">
                    Personalized report after the quiz.
                  </p>
                </div>
                {/* Desktop third card */}
                <div className="hidden md:block rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-black px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconShield />
                    <span className="font-semibold">Private</span>
                  </div>
                  <p className="mt-1 text-sm">Your data stays confidential.</p>
                </div>
              </div>
              {/* Mobile third card */}
              <div className="md:hidden mt-2 rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-black px-4 py-3">
                <div className="flex items-center gap-2">
                  <IconShield />
                  <span className="font-semibold">Private</span>
                </div>
                <p className="mt-1 text-xs">Your data stays confidential.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-8 mb-12">
            <h2 className="text-base md:text-lg font-semibold">FAQ</h2>
            <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/10 dark:ring-white/10 divide-y">
              <details className="group open:bg-black/[0.02] dark:open:bg-white/[0.04]">
                <summary className="list-none flex items-center justify-between px-4 md:px-5 py-3 md:py-4 cursor-pointer select-none">
                  <span className="font-medium">Is this assessment free?</span>
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-black/15 dark:ring-white/25">
                    <IconPlus className="group-open:hidden" />
                    <IconMinus className="hidden group-open:inline-block" />
                  </span>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm">
                  Yes. It’s a free preliminary assessment to guide your next steps.
                </div>
              </details>

              <details className="group open:bg-black/[0.02] dark:open:bg-white/[0.04]">
                <summary className="list-none flex items-center justify-between px-4 md:px-5 py-3 md:py-4 cursor-pointer select-none">
                  <span className="font-medium">How accurate are the results?</span>
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-black/15 dark:ring-white/25">
                    <IconPlus className="group-open:hidden" />
                    <IconMinus className="hidden group-open:inline-block" />
                  </span>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm">
                  They’re indicative and based on your answers. Final outcomes depend on official review.
                </div>
              </details>

              <details className="group open:bg-black/[0.02] dark:open:bg-white/[0.04]">
                <summary className="list-none flex items-center justify-between px-4 md:px-5 py-3 md:py-4 cursor-pointer select-none">
                  <span className="font-medium">
                    Do I need to share my email to see full results?
                  </span>
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-black/15 dark:ring-white/25">
                    <IconPlus className="group-open:hidden" />
                    <IconMinus className="hidden group-open:inline-block" />
                  </span>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm">
                  You’ll see a preview first. Enter your name and email to unlock
                  full results and download your personalized PDF.
                </div>
              </details>
            </div>
          </section>
        </section>

        {/* Sticky mobile CTA */}
        <div className="fixed inset-x-0 bottom-3 z-30 mx-auto w-full px-4 sm:hidden">
          <div className="mx-auto max-w-md rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white/95 dark:bg-black/90 backdrop-blur px-3 py-2 shadow">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Ready to start?</span>
              <a
                href="#start"
                className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-medium"
              >
                Start Free Check
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}