import type { Metadata } from "next";
import Link from "next/link";

import CrsCalculator from "@/components/Tools/CrsCalculator";
import { CRS_LAST_VERIFIED, CRS_SOURCE_URL } from "@/lib/xia/crs";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CRS Calculator 2026 | Express Entry Points Calculator for India",
  description:
    "Work out your Express Entry CRS score against IRCC's published grid, see the full breakdown, and find out which single change is worth the most points. Free, no sign-up.",
  alternates: { canonical: "/tools/crs-calculator" },
  openGraph: {
    title: "CRS Calculator 2026 — Express Entry points, with the breakdown",
    description:
      "Your Comprehensive Ranking System score, the four component totals behind it, and the one change worth the most points.",
    url: "https://www.xiphiasimmigration.com/tools/crs-calculator",
    type: "website",
  },
};

const FAQ = [
  {
    q: "What CRS score do I need for Canada PR in 2026?",
    a: "There is no fixed pass mark. IRCC invites the highest-ranked profiles in each draw, so the cut-off moves every round and differs by draw type. General draws have been settling in the high 400s to low 500s, while category-based draws for healthcare, trades, education and French speakers have cleared considerably lower. A score in the 470s is competitive for a general draw; below 450 you are usually relying on a category draw or a provincial nomination.",
  },
  {
    q: "How is the CRS score calculated?",
    a: "Four blocks add up to a maximum of 1,200. Core human capital (age, education, official languages, Canadian work experience) is worth up to 500 with a spouse or 600 without. Spouse factors add up to 40. Skill transferability — the combinations of education, language and experience — adds up to 100. Additional points cover a provincial nomination (600), French ability, a sibling in Canada, and Canadian study.",
  },
  {
    q: "How can I increase my CRS score quickly?",
    a: "Language is almost always the fastest lever, because it is scored directly and again through transferability. Moving from CLB 7 to CLB 9 across all four abilities can be worth more than 50 points and takes a retest, not years. After that: a provincial nomination is decisive at 600 points, French at CLB 7 adds up to 50, and a spouse's language test and credential assessment are frequently left uncollected.",
  },
  {
    q: "Does a job offer still give CRS points?",
    a: "No. IRCC removed the points for an arranged employment offer in 2025. A job offer can still matter for a provincial nomination or a work permit, but it no longer adds to your CRS score, and any calculator still awarding 50 or 200 points for one is out of date.",
  },
  {
    q: "Is this calculator accurate?",
    a: "It uses the same engine as our paid assessments, scored against IRCC's published CRS grid, last checked on " + CRS_LAST_VERIFIED + ". It shows every assumption it had to make so you can check the working. It is an estimate of your score, not an IRCC decision, and it cannot tell you whether your work experience will be accepted as skilled — that is a judgement about your duties, not your points.",
  },
];

export default function CrsCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "XIPHIAS CRS Calculator",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://www.xiphiasimmigration.com/tools/crs-calculator",
        description:
          "Express Entry Comprehensive Ranking System calculator with a full score breakdown and the highest-value improvement for your profile.",
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
      <JsonLd id="crs-calculator-jsonld" data={jsonLd} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <header className="max-w-3xl">
          <p className="type-caption font-bold uppercase tracking-[0.18em] text-primary">
            Free tool · no sign-up
          </p>
          <h1 className="type-page-title mt-3 text-[#071a3a]">CRS Calculator 2026</h1>
          <p className="type-body mt-4 text-[#071a3a]/70">
            Your Express Entry score, scored against IRCC&rsquo;s own published grid. Unlike most
            calculators, this one shows the four component totals behind the number, every assumption
            it had to make, and which single change would be worth the most points to you.
          </p>
        </header>

        <div className="mt-10">
          <CrsCalculator />
        </div>

        {/* ------------------------- ranking content ------------------------- */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <article className="max-w-3xl">
            <h2 className="type-section-title text-[#071a3a]">What the CRS score actually is</h2>
            <p className="type-body mt-4 text-[#071a3a]/75">
              The Comprehensive Ranking System is how Immigration, Refugees and Citizenship Canada
              ranks everyone sitting in the Express Entry pool. It is a queue, not an exam. You are
              not scored against a pass mark — you are scored against everyone else waiting, and
              IRCC invites down from the top until it has issued the number of invitations it wanted
              that round.
            </p>
            <p className="type-body mt-4 text-[#071a3a]/75">
              That distinction matters more than any single number. A score of 470 is strong in a
              category-based draw for healthcare and weak in a general draw held the same month. This
              is why &ldquo;what score do I need&rdquo; has no honest fixed answer, and why anyone
              quoting you one should be treated carefully.
            </p>

            <h2 className="type-section-title mt-12 text-[#071a3a]">The four blocks, and where the points hide</h2>
            <dl className="mt-5 space-y-5">
              {[
                ["Core human capital — up to 500 with a spouse, 600 without",
                  "Age, education, official language ability and Canadian work experience. Age peaks between 20 and 29 and falls away sharply after 35; by 45 it contributes nothing at all. Nothing you do recovers those points, which is why filing early beats filing perfectly."],
                ["Spouse factors — up to 40",
                  "Your partner's education, language test and Canadian work experience. These points are routinely left on the table because the spouse never sat a language test. Forty points is often the difference between an invitation and another six months of waiting."],
                ["Skill transferability — up to 100",
                  "Combinations: good language plus a credential, good language plus foreign experience, Canadian experience plus foreign experience. This block is why language improvements pay twice — once directly, once here."],
                ["Additional points — up to 600",
                  "A provincial nomination is 600 and effectively guarantees an invitation. French at CLB 7 across all four abilities is worth up to 50. A sibling in Canada is 15. Canadian study is 15 to 30."],
              ].map(([term, definition]) => (
                <div key={term} className="rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.02] p-5">
                  <dt className="text-[15px] font-black text-[#071a3a]">{term}</dt>
                  <dd className="type-small mt-2 text-[#071a3a]/70">{definition}</dd>
                </div>
              ))}
            </dl>

            <h2 className="type-section-title mt-12 text-[#071a3a]">One thing most calculators get wrong</h2>
            <p className="type-body mt-4 text-[#071a3a]/75">
              IRCC removed the points for an arranged employment offer in 2025. Any calculator still
              adding 50 or 200 points for a job offer is scoring you against a grid that no longer
              exists, and will hand you a number 50 to 200 points too high. If you have been told your
              score is above 500 because of an offer letter, run it here again.
            </p>

            <h2 className="type-section-title mt-12 text-[#071a3a]">Common questions</h2>
            <div className="mt-5 space-y-4">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-xl border border-[#071a3a]/10 bg-white p-5">
                  <summary className="cursor-pointer list-none text-[15px] font-black text-[#071a3a] marker:hidden">
                    {item.q}
                  </summary>
                  <p className="type-small mt-3 text-[#071a3a]/70">{item.a}</p>
                </details>
              ))}
            </div>

            <p className="mt-8 text-[12.5px] leading-relaxed text-[#071a3a]/50">
              Scored against{" "}
              <a href={CRS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
                IRCC&rsquo;s published CRS criteria
              </a>
              , last checked {CRS_LAST_VERIFIED}. XIPHIAS provides immigration consulting and
              documentation support; it is not a law firm, and this page is not legal advice.
            </p>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-5">
              <h2 className="text-[15px] font-black text-[#071a3a]">Next steps that are worth it</h2>
              <ul className="mt-3 space-y-2.5">
                {[
                  ["Check every route, not just Express Entry", "/xia-intelligence"],
                  ["Australia points calculator", "/route-intelligence?destination=australia"],
                  ["What Canada PR actually costs from India", "/cost-estimator"],
                  ["Verify any consultant's licence", "/verify-immigration-consultant"],
                  ["Talk to a senior advisor", "/personal-booking#schedule"],
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
