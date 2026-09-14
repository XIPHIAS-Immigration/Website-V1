import type { Metadata } from "next";
import Link from "next/link";

import AustraliaPointsCalculator from "@/components/Tools/AustraliaPointsCalculator";
import { AU_PASS_MARK, AU_POINTS_LAST_VERIFIED, AU_POINTS_SOURCE_URL } from "@/lib/xia/australia-points";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Australia PR Points Calculator 2026 | Subclass 189, 190 & 491",
  description:
    "Work out your Australian skilled migration points against the official Home Affairs test, with the full breakdown and the single change worth the most points. Free, no sign-up.",
  alternates: { canonical: "/tools/australia-points-calculator" },
  openGraph: {
    title: "Australia PR Points Calculator 2026 — with the breakdown",
    description:
      "Your SkillSelect points total, every component behind it, and which one change is worth the most.",
    url: "https://www.xiphiasimmigration.com/tools/australia-points-calculator",
    type: "website",
  },
};

const FAQ = [
  {
    q: "How many points do I need for Australian PR in 2026?",
    a: `${AU_PASS_MARK} points is the minimum to submit an Expression of Interest — but it is a floor, not a target. Invitations go to the highest scores within each occupation, and for popular occupations such as software engineering and accounting, invited scores have sat well above the floor. Treating 65 as "enough" is the most common reason people wait years in the pool without an invitation.`,
  },
  {
    q: "What is the difference between subclass 189, 190 and 491?",
    a: "189 is the independent visa — permanent, no sponsor, no obligation to live anywhere in particular, and the hardest to get on points alone. 190 is permanent but requires a state to nominate you, adds 5 points, and commits you to that state. 491 is a five-year regional provisional visa, adds 15 points, and leads to permanent residence through subclass 191 once you have met the regional work and income conditions.",
  },
  {
    q: "Does my partner affect my points score?",
    a: "Yes, and more than people expect. A partner who is skilled, under 45 and has competent English adds 10 points. Competent English alone adds 5. Having no partner at all, or a partner who is already an Australian citizen or permanent resident, also scores 10 — so an unmarried applicant is not disadvantaged. The loss falls on applicants whose partner has taken no English test, which is usually fixable.",
  },
  {
    q: "How is skilled work experience counted?",
    a: "Only work after your skills were assessed as meeting the standard for your nominated occupation normally counts, and only at the skilled level. Overseas experience is capped at 15 points, reached at eight years. Australian experience is capped at 20 points at eight years. The two can be combined but the total experience points are capped at 20.",
  },
  {
    q: "Is a skills assessment the same as this points test?",
    a: "No, and this is the step that catches people out. Before points matter at all, the assessing authority named for your occupation — ACS for most IT roles, Engineers Australia for engineering, VETASSESS for many others — must assess your qualification and experience. A high points score with a failed or missing skills assessment is worth nothing.",
  },
];

export default function AustraliaPointsCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "XIPHIAS Australia PR Points Calculator",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://www.xiphiasimmigration.com/tools/australia-points-calculator",
        description:
          "Australian skilled migration points calculator for subclass 189, 190 and 491, with a full breakdown and the highest-value improvement for your profile.",
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
      <JsonLd id="au-points-calculator-jsonld" data={jsonLd} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <header className="max-w-3xl">
          <p className="type-caption font-bold uppercase tracking-[0.18em] text-primary">
            Free tool · no sign-up
          </p>
          <h1 className="type-page-title mt-3 text-[#071a3a]">Australia PR Points Calculator</h1>
          <p className="type-body mt-4 text-[#071a3a]/70">
            Your SkillSelect score for subclass 189, 190 and 491, against the points test Home Affairs
            actually publishes. It shows every component behind the total, the things that stop an
            application before points matter, and which single change is worth the most to you.
          </p>
        </header>

        <div className="mt-10">
          <AustraliaPointsCalculator />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <article className="max-w-3xl">
            <h2 className="type-section-title text-[#071a3a]">
              {AU_PASS_MARK} points is a floor, not a target
            </h2>
            <p className="type-body mt-4 text-[#071a3a]/75">
              This is the single most expensive misunderstanding in Australian skilled migration.
              Clearing {AU_PASS_MARK} points lets you <em>submit</em> an Expression of Interest. It
              does not put you anywhere near the front of the queue.
            </p>
            <p className="type-body mt-4 text-[#071a3a]/75">
              Invitations are issued to the highest-ranked candidates within each occupation. For
              crowded occupations — software engineers, accountants, general managers — people sitting
              at {AU_PASS_MARK} have waited years and been invited never, while people at 85 to 90 in
              the same occupation were invited in months. If your score is close to the floor, the
              honest options are to raise it or to look at a state-nominated or regional route, not to
              submit and hope.
            </p>

            <h2 className="type-section-title mt-12 text-[#071a3a]">The step before points</h2>
            <p className="type-body mt-4 text-[#071a3a]/75">
              Before any of this counts, the assessing authority for your occupation has to assess
              you: ACS for most IT roles, Engineers Australia for engineering, VETASSESS for a long
              list of others. They decide how much of your experience is recognised as skilled — and
              routinely discount the first two to four years. A 90-point profile built on experience
              the assessor will not recognise is a 65-point profile that has not found out yet.
            </p>

            <h2 className="type-section-title mt-12 text-[#071a3a]">
              The points people leave on the table
            </h2>
            <ul className="mt-5 space-y-3">
              {[
                ["Your partner's English test — 5 to 10 points", "A partner who never sat IELTS is the most common unclaimed 10 points in the whole test."],
                ["NAATI community language accreditation — 5 points", "For many Indian applicants this is a credential they could already sit for, in a language they already speak."],
                ["Professional Year — 5 points", "Only for applicants who studied in Australia, but frequently forgotten by those who did."],
                ["State nomination — 5 or 15 points", "The difference between 189 and 190 or 491 is often the difference between waiting and going."],
              ].map(([term, detail]) => (
                <li key={term} className="rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.02] p-5">
                  <p className="text-[15px] font-black text-[#071a3a]">{term}</p>
                  <p className="type-small mt-1.5 text-[#071a3a]/70">{detail}</p>
                </li>
              ))}
            </ul>

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
              Scored against{" "}
              <a href={AU_POINTS_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
                the Department of Home Affairs points test
              </a>
              , last checked {AU_POINTS_LAST_VERIFIED}. XIPHIAS provides immigration consulting and
              documentation support; it is not a law firm, and this page is not legal advice.
              Australian immigration assistance is provided under MARA registration 1680615.
            </p>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-5">
              <h2 className="text-[15px] font-black text-[#071a3a]">Next steps that are worth it</h2>
              <ul className="mt-3 space-y-2.5">
                {[
                  ["Canada CRS calculator", "/tools/crs-calculator"],
                  ["Check every route, not just Australia", "/xia-intelligence"],
                  ["Australia consultants in Bangalore", "/australia-immigration-consultants-in-bangalore"],
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
