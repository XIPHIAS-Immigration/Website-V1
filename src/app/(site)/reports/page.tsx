import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Clock3, FileText, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { getPublicReportProducts } from "@/lib/payments/report-store";
import ConciergeOrb from "@/components/Xia/ConciergeOrb";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Immigration Reports from ₹499 | Personalised PDF, Emailed to You",
  description:
    "A focused immigration report built from your own profile against published government criteria — filing order, timing, real costs and every gap named. From ₹499, delivered as a PDF.",
  alternates: { canonical: "/reports" },
  openGraph: {
    title: "Immigration reports from ₹499 — your case, not a template",
    description:
      "Your profile against the published rules, with the filing order, the timing and the real costs. Emailed as a PDF.",
    url: "https://www.xiphiasimmigration.com/reports",
    type: "website",
  },
};

function price(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

const INSIDE = [
  {
    icon: ShieldCheck,
    title: "Checked, not guessed",
    body: "Every requirement is tested against the destination government's own published criteria, with the source URL and the date it was last verified printed in the report.",
  },
  {
    icon: FileText,
    title: "Gaps named, not hinted at",
    body: "Not a score. The specific thing standing between you and each route — the band you need, the assessment you are missing, the year of experience that does not yet count.",
  },
  {
    icon: Clock3,
    title: "Filing order and timing",
    body: "What to do first, what waits on what, and where the months actually go. Most of a timeline is spent before anything is submitted.",
  },
  {
    icon: Mail,
    title: "In your inbox as a PDF",
    body: "Delivered by email the moment payment clears, yours to keep, and readable by any advisor you want a second opinion from — including one who is not us.",
  },
];

const FAQ = [
  {
    q: "What is actually in the report?",
    a: "Your profile scored against the published criteria of the programmes relevant to your question, with every requirement marked as met, missing or untestable; the specific gaps named; the filing order and realistic timing; and an itemised cost including the fees people forget. Length depends on the report — the page range is shown on each card.",
  },
  {
    q: "How is this different from the free tools?",
    a: "The free calculators score what you type into them. The report works from the profile you have given us and applies the rules across every programme at once, including the knock-outs that stop an application before points matter — nationality exclusions, prior refusals, sponsor requirements. It also gives you something to hold, take away, and show to someone else.",
  },
  {
    q: "How quickly do I get it?",
    a: "The PDF is generated and emailed once payment is confirmed. There is no queue and no callback in between.",
  },
  {
    q: "Is the report a guarantee that I will get a visa?",
    a: "No, and any document that claims to be is worth nothing. It tells you where you stand against published criteria and what would have to change. Government decisions are not ours to predict, and the report says so in as many words.",
  },
  {
    q: "Can I use the report with a different consultant?",
    a: "Yes. It is your document, it cites its sources, and nothing in it is written to lock you in. If it tells you that no route currently fits and you should not spend money yet, that is the honest outcome and it is in there.",
  },
];

export default function ReportsPage() {
  const products = getPublicReportProducts();
  const cheapest = products.reduce((low, item) => Math.min(low, item.priceInr), Number.POSITIVE_INFINITY);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...products.map((product) => ({
        "@type": "Product",
        name: product.shortTitle,
        description: product.description,
        brand: { "@id": "https://www.xiphiasimmigration.com/#organization" },
        offers: {
          "@type": "Offer",
          price: String(product.priceInr),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `https://www.xiphiasimmigration.com/get-report/${product.productType}`,
        },
      })),
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd id="reports-jsonld" data={jsonLd} />

      <div className="relative overflow-hidden bg-primary text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="xia-aurora xia-aurora--gold" />
          <span className="xia-aurora xia-aurora--sky" />
          <span className="xia-dots" />
        </div>

        {/* ------------------------------- hero ------------------------------- */}
        <header className="relative mx-auto max-w-screen-2xl px-4 pb-4 pt-14 sm:px-6 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-3xl">
              <p className="type-caption font-black uppercase tracking-[0.2em] text-[#f0cb3b]">
                From {price(cheapest)} · emailed as a PDF
              </p>
              <h1 className="xia-sheen mt-3 text-[clamp(2.25rem,calc(1.8rem+2vw),3.75rem)] font-black leading-[1.08] tracking-tight">
                Your case, written down
              </h1>
              <p className="type-body mt-5 text-white/70">
                Not a template with your name at the top. Your profile run against the published
                criteria of the programmes that matter to your question — with every gap named, the
                filing order set out, and the real cost itemised including the fees nobody quotes.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
                {["Sources cited and dated", "No callback in between", "Yours to take anywhere"].map((claim) => (
                  <p key={claim} className="flex items-center gap-2 text-[13.5px] font-semibold text-white/60">
                    <Check className="size-4 text-[#7ce8a8]" aria-hidden="true" />
                    {claim}
                  </p>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <ConciergeOrb state="resolved" size={200} />
            </div>
          </div>
        </header>

        {/* ------------------------------ the cards ---------------------------- */}
        <section className="relative !bg-transparent mx-auto max-w-screen-2xl px-4 pb-16 pt-10 sm:px-6 lg:px-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.productType}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(3,16,40,0.6)] ${
                  product.featured
                    ? "border-[#e1b923]/70 bg-gradient-to-b from-[#e1b923]/[0.22] to-[#0f3d85]/70"
                    : "border-white/25 bg-[#0f3d85]/60 hover:border-white/50 hover:bg-[#0f3d85]/80"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-all duration-700 group-hover:left-full"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <span className="grid size-12 place-items-center rounded-xl bg-[#e1b923]/15 text-[#f0cb3b]">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  {product.featured ? (
                    <span className="rounded-full bg-[#e1b923] px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.08em] text-[#071a3a]">
                      Most detailed
                    </span>
                  ) : null}
                </div>

                <h2 className="relative mt-5 text-[19px] font-black leading-snug">{product.shortTitle}</h2>
                <p className="type-small relative mt-2.5 text-white/60">{product.description}</p>

                <ul className="relative mt-5 space-y-2">
                  {product.includes.slice(0, 3).map((line) => (
                    <li key={line} className="flex gap-2 text-[12.5px] leading-snug text-white/70">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[#7ce8a8]" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-6">
                  <p className="flex items-baseline gap-2">
                    <span className="text-[30px] font-black leading-none text-[#f0cb3b]">{price(product.priceInr)}</span>
                    <span className="type-caption text-white/40">one-off</span>
                  </p>
                  <p className="type-caption mt-1 text-white/40">{product.pageRange}</p>
                  <Link
                    href={`/get-report/${product.productType}`}
                    className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-black transition ${
                      product.featured
                        ? "bg-[#e1b923] text-[#071a3a] shadow-[0_12px_30px_rgba(225,185,35,0.3)] hover:bg-[#f0cb3b]"
                        : "border border-white/30 bg-white/[0.08] text-white hover:border-white/60 hover:bg-white/[0.16]"
                    }`}
                  >
                    Get this report
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-[13.5px] text-white/45">
            <Sparkles className="size-4 text-[#f0cb3b]" aria-hidden="true" />
            Not sure which one?{" "}
            <Link href="/xia-intelligence" className="font-bold text-[#f0cb3b] underline-offset-4 hover:underline">
              Let Route Intelligence pick it for you
            </Link>
          </p>
        </section>

        {/* ---------------------------- what's inside --------------------------- */}
        <section className="relative !bg-[#154a9d] border-t border-white/10">
          <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
            <h2 className="type-section-title max-w-2xl">What is actually in one</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INSIDE.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/20 bg-[#0f3d85]/55 p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#e1b923]/15 text-[#f0cb3b]">
                    <point.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15.5px] font-black">{point.title}</h3>
                  <p className="type-small mt-2 text-white/60">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------- FAQ -------------------------------- */}
        <section className="relative !bg-transparent mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <div className="max-w-3xl">
              <h2 className="type-section-title">Before you buy one</h2>
              <div className="mt-6 space-y-3">
                {FAQ.map((item) => (
                  <details key={item.q} className="rounded-xl border border-white/20 bg-[#0f3d85]/55 p-5">
                    <summary className="cursor-pointer list-none text-[15px] font-black marker:hidden">
                      {item.q}
                    </summary>
                    <p className="type-small mt-3 text-white/65">{item.a}</p>
                  </details>
                ))}
              </div>
              <p className="mt-8 text-[12.5px] leading-relaxed text-white/40">
                Reports are generated from the information you supply and from published government
                criteria current at the date of issue. They are an assessment aid, not a visa
                decision, and not legal advice. Canadian representation is provided under CICC licence
                R516194.
              </p>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-[#e1b923]/45 bg-gradient-to-br from-[#e1b923]/[0.14] to-transparent p-6">
                <p className="type-caption font-black uppercase tracking-[0.18em] text-[#f0cb3b]">
                  Rather have a person
                </p>
                <h2 className="mt-2 text-[21px] font-black leading-tight">Sixty minutes with Varun Singh</h2>
                <p className="type-small mt-3 text-white/70">
                  Managing Director, seventeen years, thirty-nine awards. He reads your case the way a
                  visa officer will and tells you plainly when a route is not worth your money —
                  including ours.
                </p>
                <Link
                  href="/personal-booking#schedule"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-5 text-[14.5px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
                >
                  <CalendarCheck className="size-4" aria-hidden="true" /> Book a consultation
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
