import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corporate Immigration Eligibility Check (Free)",
  description:
    "Assess corporate immigration options for entity setup, sponsorship, and global mobility. Instant results + downloadable summary.",
  keywords: [
    "corporate immigration eligibility",
    "entity setup",
    "employer sponsorship",
    "global mobility",
    "business immigration check",
  ],
  alternates: { canonical: "/corporate/eligibility-check" },
  openGraph: {
    title: "Corporate Immigration Eligibility Check (Free)",
    description:
      "Assess corporate immigration options for entity setup, sponsorship, and global mobility. Instant results + downloadable summary.",
    url: "https://www.xiphiasimmigration.com/corporate/eligibility-check",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Corporate Immigration Eligibility Check – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Immigration Eligibility Check (Free)",
    description:
      "Assess corporate immigration options for entity setup, sponsorship, and global mobility. Instant results + downloadable summary.",
    images: ["/xiphias-immigration.png"],
  },
  robots: { index: true, follow: true },
};

export default function CorporateEligibilityPage() {
  const heroId = "corporate-eligibility-title";

  const features = [
    "Entity setup readiness",
    "Employer sponsorship",
    "Global mobility planning",
    "Instant feasibility signal",
  ];

  const steps = [
    {
      k: "01",
      t: "Answer 5–7 quick questions",
      d: "Tell us your target countries, headcount, hiring model, and timelines.",
    },
    {
      k: "02",
      t: "Get instant eligibility",
      d: "See high-level feasibility for incorporation, sponsorship, and relocation.",
    },
    {
      k: "03",
      t: "Download a clean summary",
      d: "Export a shareable PDF for internal review and decision-making.",
    },
    {
      k: "04",
      t: "Next steps guidance",
      d: "Receive tailored routes, basic costs, and compliance notes (no obligation).",
    },
  ];

  const faqs = [
    {
      q: "Which jurisdictions are covered?",
      a: "We focus on major business hubs and common expansion destinations. Coverage grows continuously and the checker will indicate if a country is in-scope before you begin.",
    },
    {
      q: "Do I need to create an account?",
      a: "No sign-up is required to run the check. You can optionally share an email to receive the PDF.",
    },
    {
      q: "Is this legal advice?",
      a: "The tool is an initial feasibility screen and not a substitute for legal advice. For complex cases we offer an expert review.",
    },
    {
      q: "Can I run multiple scenarios?",
      a: "Yes. You can re-run the check with different countries, headcount, or timelines to compare outcomes.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-black/80 dark:text-zinc-300">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-black/10 hover:bg-black/5 dark:ring-zinc-700 dark:hover:bg-zinc-900"
            >
              <HomeIcon />
              Home
            </Link>
          </li>
        <li className="mx-1 text-black/40 dark:text-zinc-500">/</li>
          <li>
            <Link
              href="/corporate"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-black/10 hover:bg-black/5 dark:ring-zinc-700 dark:hover:bg-zinc-900"
            >
              Corporate
            </Link>
          </li>
          <li className="mx-1 text-black/40 dark:text-zinc-500">/</li>
          <li aria-current="page" className="font-medium text-black dark:text-zinc-100">
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
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800 text-black dark:text-white">
            <Dot className="mr-1.5" /> Corporate Service
          </span>

          <h1
            id={heroId}
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-black dark:text-white"
          >
            Corporate Immigration Eligibility Check (Free)
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-black/80 dark:text-zinc-300 md:text-base">
            For founders, HR, and mobility teams. Check feasibility for entity setup, staff relocation, and employer-sponsored visas across key jurisdictions.
          </p>

          {/* Feature chips */}
          <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
            {features.map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 ring-1 ring-blue-200 backdrop-blur text-black dark:text-white dark:bg-white/5 dark:ring-blue-800"
              >
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/eligibility?track=corporate"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
              aria-label="Start Corporate Eligibility Check"
            >
              Start Corporate Check
              <ArrowRightIcon />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
            >
              How it works
              <OpenIcon />
            </a>

            <span className="ml-0 md:ml-2 text-xs text-black/60 dark:text-zinc-400">
              No sign-up · Instant result · Free
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {steps.map((s) => (
            <li
              key={s.k}
              className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="absolute right-4 top-4 text-3xl font-extrabold text-black/10 group-hover:text-black/20 dark:text-zinc-700 dark:group-hover:text-zinc-600">
                {s.k}
              </div>
              <h3 className="text-base font-medium text-black dark:text-white">{s.t}</h3>
              <p className="mt-1 text-sm text-black/70 dark:text-zinc-400">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Highlights */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white">
          Why use this checker?
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Built for teams"
            desc="Capture the key details your finance, HR, and legal stakeholders care about."
          />
          <Card
            title="Clarity, fast"
            desc="Instant screen to rule-in/-out common routes before deep-dive advisory."
          />
          <Card
            title="Shareable output"
            desc="Download a neat summary to circulate internally or attach to a ticket."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-black dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-4 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5 open:bg-black/[0.03] dark:open:bg-zinc-950/40">
              <summary className="cursor-pointer list-none text-base font-medium marker:hidden text-black dark:text-white">
                <span className="inline-flex items-center gap-2">
                  <ChevronIcon /> {f.q}
                </span>
              </summary>
              <p className="mt-2 text-sm text-black/75 dark:text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Secondary CTA card */}
      <section aria-labelledby="contact-cta" className="mt-12">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/20">
          <h2 id="contact-cta" className="text-lg md:text-xl font-semibold text-black dark:text-white">
            Complex scenario or multi-country rollout?
          </h2>
          <p className="mt-1 text-sm text-black/80 dark:text-zinc-300">
            Our team can validate edge cases, timelines, and costs for board approval.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/eligibility?track=corporate"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
            >
              Start the free check
              <ArrowRightIcon />
            </Link>
            <Link
              href="/contact"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
            >
              Talk to an expert
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
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Corporate", item: "/corporate" },
              {
                "@type": "ListItem",
                position: 3,
                name: "Eligibility Check",
                item: "/corporate/eligibility-check",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </main>
  );
}

/* -------------------- Small UI atoms (inline, no extra deps) -------------------- */

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-medium text-black dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-black/70 dark:text-zinc-400">{desc}</p>
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