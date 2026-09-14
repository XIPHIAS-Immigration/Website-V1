import type { Metadata } from "next";
import Link from "next/link";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import { toCostProgram, type CostProgram } from "@/lib/cost-estimator";
import CostEstimatorClient from "@/components/CostEstimator/CostEstimatorClient";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canada PR & Immigration Cost Calculator from India | Every Fee, 2026",
  description:
    "What immigration actually costs from India — government fees, professional fees, language tests, credential assessment, medicals, proof of funds and the costs nobody mentions until you are committed.",
  alternates: { canonical: "/cost-estimator" },
  openGraph: {
    title: "What immigration really costs from India — every fee, itemised",
    description:
      "An indicative, family-tailored cost for residency, citizenship, skilled and corporate routes. Itemised, with dependants and timeline.",
    url: "https://www.xiphiasimmigration.com/cost-estimator",
    type: "website",
  },
};

export const revalidate = 86400;

const FAQ = [
  {
    q: "How much does Canada PR cost from India in 2026?",
    a: "For a single applicant through Express Entry, the unavoidable government and third-party costs — IELTS, an Educational Credential Assessment, biometrics, the medical, the PR application fee and the Right of Permanent Residence Fee — typically land between ₹1.5 and ₹2.5 lakh. On top of that sits proof of settlement funds, which is not a fee but must genuinely exist in your account: roughly CAD 14,700 for one person and CAD 18,300 for two, rising with family size. Professional fees, if you use a licensed representative, are separate again.",
  },
  {
    q: "What is proof of funds and do I actually need it?",
    a: "It is money you must show you hold, unencumbered, to support yourself on arrival. You do not pay it to anyone — but it must be in your own account, documented, and it cannot be borrowed. It is waived if you are applying under the Canadian Experience Class or already hold a valid Canadian job offer. It is the single largest line in most people's budget and the one most often left out of quotes.",
  },
  {
    q: "Why do consultants quote such different fees?",
    a: "Because professional fees are unregulated in India while government fees are fixed and public. Any two firms quoting you wildly different totals are almost always differing on their own fee, on what they have chosen to leave out, or on whether they have included proof of funds as though it were a cost. Ask for the government fees itemised separately from the professional fee — a firm that will not separate them is telling you something.",
  },
  {
    q: "Are the fees refundable if my application is refused?",
    a: "Government application fees are generally not refundable once processing begins, though the Right of Permanent Residence Fee is refunded if you are not approved. Professional fees depend entirely on your service agreement — read the refund clause before you sign, not after a refusal.",
  },
];

export default function CostEstimatorPage() {
  const { items } = getProgrammeExplorerData();
  const programs: CostProgram[] = items.map(toCostProgram);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "XIPHIAS Immigration Cost Estimator",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.xiphiasimmigration.com/cost-estimator",
        description:
          "Itemised cost estimate for residency, citizenship, skilled and corporate immigration routes, adjusted for family size and timeline.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        provider: { "@id": "https://www.xiphiasimmigration.com/#organization" },
      },
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
      <JsonLd id="cost-estimator-jsonld" data={jsonLd} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <header className="max-w-3xl">
          <p className="type-caption font-bold uppercase tracking-[0.18em] text-primary">
            Free tool · no sign-up
          </p>
          <h1 className="type-page-title mt-3 text-[#071a3a]">
            What immigration actually costs from India
          </h1>
          <p className="type-body mt-4 text-[#071a3a]/70">
            Not the headline fee — the whole bill. Government charges, language tests, credential
            assessment, medicals, police clearances, dependants, and the settlement funds you have to
            show but nobody quotes. Adjust for your family and your timeline below.
          </p>
        </header>
      </div>

      <CostEstimatorClient programs={programs} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 pb-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <article className="max-w-3xl">
            <h2 className="type-section-title text-[#071a3a]">The four costs people forget</h2>
            <ul className="mt-5 space-y-3">
              {[
                [
                  "Proof of settlement funds",
                  "Not a fee — money you must hold and document, and cannot borrow. Around CAD 14,700 for one applicant and CAD 18,300 for two, rising with family size. It is the biggest number in most budgets and the one most often missing from a quote.",
                ],
                [
                  "Everyone's tests, not just yours",
                  "A spouse's language test and credential assessment cost the same as your own, and are frequently the difference between an invitation and another year in the pool. Budget for two of everything if two of you are coming.",
                ],
                [
                  "Re-sitting the language test",
                  "Most applicants sit IELTS more than once, because the difference between band 7 and band 8 is worth more points than almost anything else they could do. Assume two attempts and be pleasantly surprised.",
                ],
                [
                  "The first three months after landing",
                  "Rent deposits, a car, health cover before provincial coverage starts, and a job search that takes longer than anyone plans for. This is what the settlement funds requirement exists to cover, and it is why the figure is not negotiable.",
                ],
              ].map(([term, detail]) => (
                <li key={term} className="rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.02] p-5">
                  <p className="text-[15px] font-black text-[#071a3a]">{term}</p>
                  <p className="type-small mt-1.5 text-[#071a3a]/70">{detail}</p>
                </li>
              ))}
            </ul>

            <h2 className="type-section-title mt-12 text-[#071a3a]">
              How to read any consultant&rsquo;s quote
            </h2>
            <p className="type-body mt-4 text-[#071a3a]/75">
              Government fees are fixed and published. Professional fees are not regulated in India at
              all. So ask any firm — including us — to itemise the two separately. If a quote arrives
              as one number, you cannot tell what you are paying for, and you cannot compare it with
              anyone else&rsquo;s.
            </p>
            <p className="type-body mt-4 text-[#071a3a]/75">
              The second question worth asking: what happens to the fee if the application is refused.
              That answer lives in the service agreement, and it is worth reading before you sign
              rather than after.
            </p>

            <h2 className="type-section-title mt-12 text-[#071a3a]">Common questions</h2>
            <div className="mt-5 space-y-4">
              {FAQ.map((item) => (
                <details key={item.q} className="rounded-xl border border-[#071a3a]/10 bg-white p-5">
                  <summary className="cursor-pointer list-none text-[15px] font-black text-[#071a3a] marker:hidden">
                    {item.q}
                  </summary>
                  <p className="type-small mt-3 text-[#071a3a]/70">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="mt-8 text-[12.5px] leading-relaxed text-[#071a3a]/50">
              Figures are indicative and move with government fee schedules and exchange rates. Always
              confirm current fees on the destination government&rsquo;s own site before budgeting.
              XIPHIAS provides immigration consulting and documentation support; it is not a law firm.
            </p>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-5">
              <h2 className="text-[15px] font-black text-[#071a3a]">Work out the rest of it</h2>
              <ul className="mt-3 space-y-2.5">
                {[
                  ["Your Canada CRS score", "/tools/crs-calculator"],
                  ["Your Australia points total", "/tools/australia-points-calculator"],
                  ["Which programmes you qualify for", "/xia-intelligence"],
                  ["Verify any consultant's licence", "/verify-immigration-consultant"],
                  ["Talk the numbers through", "/personal-booking#schedule"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[14px] font-bold text-primary underline-offset-4 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
