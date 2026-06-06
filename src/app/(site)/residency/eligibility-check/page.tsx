import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Residency Eligibility Check (Free) | Interactive Assessment",
  description:
    "Check your residency eligibility in minutes. Answer a few questions and get instant results plus a personalized PDF report.",
  keywords: [
    "residency eligibility check",
    "residency by investment",
    "residency by family",
    "fast-track residency",
    "global mobility eligibility",
  ],
  alternates: { canonical: "/residency/eligibility-check" },
  openGraph: {
    title: "Residency Eligibility Check (Free) | Interactive Assessment",
    description:
      "Check your residency eligibility in minutes. Answer a few questions and get instant results plus a personalized PDF report.",
    url: "https://www.xiphiasimmigration.com/residency/eligibility-check",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Residency Eligibility Check – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Residency Eligibility Check (Free) | Interactive Assessment",
    description:
      "Check your residency eligibility in minutes. Answer a few questions and get instant results plus a personalized PDF report.",
    images: ["/xiphias-immigration.png"],
  },
  robots: { index: true, follow: true },
};

export default function ResidencyEligibilityPage() {
  const heroId = "residency-eligibility-title";

  const features = [
    "Investment-based routes",
    "Family inclusion",
    "Fast-track jurisdictions",
    "Instant eligibility signal",
  ];

  const steps = [
    {
      k: "01",
      t: "Answer a few quick questions",
      d: "Tell us your goals, family members, budget, and target countries.",
    },
    {
      k: "02",
      t: "Get instant guidance",
      d: "See high-level feasibility across key residency routes.",
    },
    {
      k: "03",
      t: "Download your PDF",
      d: "A personalized summary to review or share.",
    },
    {
      k: "04",
      t: "Follow clear next steps",
      d: "Timeline, documents, and path to proceed with confidence.",
    },
  ];

  const faqs = [
    {
      q: "Which countries can I check?",
      a: "Popular residency destinations with investment, employment, and family options. Coverage expands regularly and you’ll see what’s in-scope before you start.",
    },
    {
      q: "Do I need to sign up?",
      a: "No. You can optionally add your email to receive the PDF report.",
    },
    {
      q: "Is this legal advice?",
      a: "It’s an initial feasibility screen. For complex cases, an expert review is available.",
    },
    {
      q: "Can dependents be included?",
      a: "Yes. Indicate spouse/children in the checker to reflect eligibility accurately.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-black dark:text-white">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-black dark:text-white">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:ring-zinc-700 dark:hover:bg-zinc-900"
            >
              <HomeIcon />
              Home
            </Link>
          </li>
          <li className="mx-1 text-black/60 dark:text-white/60">/</li>
          <li>
            <Link
              href="/residency"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:ring-zinc-700 dark:hover:bg-zinc-900"
            >
              Residency
            </Link>
          </li>
          <li className="mx-1 text-black/60 dark:text-white/60">/</li>
          <li aria-current="page" className="font-medium text-black dark:text-white">
            Eligibility Check
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section
        aria-labelledby={heroId}
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80 text-black dark:text-white dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40"
      >
        {/* decorative */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <Dot className="mr-1.5" /> Private Client Service
          </span>

          <h1
            id={heroId}
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
          >
            Residency Eligibility Check (Free)
          </h1>

          <p className="mt-3 text-[15px] leading-7 md:text-base">
            Check your eligibility for investment, family, work, and fast-track
            residency routes in minutes. Quick, interactive, and confidential.
          </p>

          {/* Feature chips */}
          <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
            {features.map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800"
              >
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/eligibility?track=residency"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
              aria-label="Start Residency Eligibility Check"
            >
              Start Residency Check
              <ArrowRightIcon />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
            >
              How it works
              <OpenIcon />
            </a>

            <span className="ml-0 md:ml-2 text-xs text-black/70 dark:text-white/70">
              No sign-up · Instant result · Free
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {steps.map((s) => (
            <li
              key={s.k}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="absolute right-4 top-4 text-3xl font-extrabold text-black/10 group-hover:text-black/20 dark:text-white/10 dark:group-hover:text-white/20">
                {s.k}
              </div>
              <h3 className="text-base font-medium">{s.t}</h3>
              <p className="mt-1 text-sm text-black dark:text-white">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Highlights */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Why use this checker?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Clear options" desc="See likely routes by country with high-level requirements." />
          <Card title="Fast signal" desc="Rule-in/-out paths before deep advisory or document collection." />
          <Card title="Shareable output" desc="Download a neat PDF summary for personal records or counsel." />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5 open:bg-zinc-50 dark:open:bg-zinc-950/40">
              <summary className="cursor-pointer list-none text-base font-medium marker:hidden">
                <span className="inline-flex items-center gap-2">
                  <ChevronIcon /> {f.q}
                </span>
              </summary>
              <p className="mt-2 text-sm text-black dark:text-white">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Secondary CTA card */}
      <section aria-labelledby="contact-cta" className="mt-12">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/20">
          <h2 id="contact-cta" className="text-lg md:text-xl font-semibold">
            Complex situation or urgent timeline?
          </h2>
          <p className="mt-1 text-sm text-black dark:text-white">
            Speak with an advisor for bespoke guidance and document planning.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/eligibility?track=residency"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
            >
              Start the free check
              <ArrowRightIcon />
            </Link>
            <Link
              href="/contact"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
            >
              Talk to an advisor
              <OpenIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Structured data: BreadcrumbList + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
              { '@type': 'ListItem', position: 2, name: 'Residency', item: '/residency' },
              { '@type': 'ListItem', position: 3, name: 'Eligibility Check', item: '/residency/eligibility-check' },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </main>
  );
}

/* -------------------- Small UI atoms (no extra deps) -------------------- */

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 text-sm text-black dark:text-white">{desc}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-blue-600 dark:fill-blue-400">
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function OpenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 0 0 2h3.586l-7.293 7.293a1 1 0 0 0 1.414 1.414L19 6.414V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4a1 1 0 1 0-2 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2H5z"
      />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-1 h-4 w-4 opacity-70">
      <path
        fill="currentColor"
        d="M8.47 10.97a.75.75 0 0 1 1.06 0L12 13.44l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z"
      />
    </svg>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`} />
  );
}
function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M11.293 2.293a1 1 0 0 1 1.414 0l8 8A1 1 0 0 1 20.707 12H20v8a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5H11v5a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-8h-.707a1 1 0 0 1-.707-1.707l8-8z"
      />
    </svg>
  );
}