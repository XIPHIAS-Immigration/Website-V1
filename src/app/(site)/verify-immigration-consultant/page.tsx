import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

import { credentials, firmFacts } from "@/data/credentials";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Verify an Immigration Consultant Is Licensed | Free Check, India",
  description:
    "Check any immigration consultant against the official CICC, MARA and OISC registers before you pay. Direct register links, what a real licence number looks like, and the warning signs.",
  alternates: { canonical: "/verify-immigration-consultant" },
  openGraph: {
    title: "Verify your immigration consultant — before you pay",
    description:
      "The official registers, how to read them, and the red flags. Including our own licence, so you can check us on the same page.",
    url: "https://www.xiphiasimmigration.com/verify-immigration-consultant",
    type: "website",
  },
};

const REGISTERS = [
  {
    country: "Canada",
    body: "College of Immigration and Citizenship Consultants (CICC)",
    was: "Called ICCRC until 23 November 2021. Same regulator, new name — a consultant advertising an “ICCRC licence” is not necessarily out of date, but the number must still appear on the CICC register today.",
    format: "R followed by six digits, e.g. R516194.",
    url: "https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx",
    check:
      "Search by the person's name or the R-number. The register shows their class (RCIC or RISIA), their status, and — critically — whether they are Entitled to Practise. Anything other than that word means they cannot represent you right now.",
  },
  {
    country: "Australia",
    body: "Office of the Migration Agents Registration Authority (OMARA)",
    was: "",
    format: "Seven digits, e.g. 1680615. The first two digits are the year of first registration.",
    url: "https://portal.mara.gov.au/search-the-register-of-migration-agents/",
    check:
      "Search the Register of Migration Agents by name or MARN. It shows whether registration is current, and any conditions or past disciplinary decisions against the agent.",
  },
  {
    country: "United Kingdom",
    body: "Immigration Advice Authority (formerly OISC)",
    was: "Renamed from the Office of the Immigration Services Commissioner in 2024.",
    format: "A reference number in the form 'F' + year + digits.",
    url: "https://www.gov.uk/find-an-immigration-adviser",
    check:
      "Advisers are regulated at Level 1, 2 or 3. Level 1 cannot handle appeals. Check the level covers what you are hiring them for, not just that they appear.",
  },
];

const RED_FLAGS = [
  {
    flag: "No licence number anywhere on the website",
    why: "A regulated consultant is required to display it. Absence is not an oversight — an unregulated agent cannot display what they do not hold.",
  },
  {
    flag: "“We have a tie-up with a licensed consultant”",
    why: "Ask for the number and check whose name it sits under. A genuine arrangement appears on the register with the firm listed against it.",
  },
  {
    flag: "A guaranteed visa, or a promised score",
    why: "Nobody can guarantee a government decision. In Canada it is a breach of the CICC Code of Professional Conduct to imply one, and it is the most reliable single sign that you are being sold to rather than advised.",
  },
  {
    flag: "Pressure to pay today for a draw that closes tomorrow",
    why: "Express Entry draws run continuously. A closing date that only exists inside a sales call is not a closing date.",
  },
  {
    flag: "Payment into a personal account, or in cash",
    why: "A firm that will not invoice through a company account is a firm you cannot recover money from.",
  },
  {
    flag: "They fill your forms but will not be named on them",
    why: "If a consultant is paid to represent you, they must be declared to the department. “Ghost consulting” is illegal in Canada and Australia, and if it surfaces your application is the one that suffers.",
  },
];

const FAQ = [
  {
    q: "How do I check if an immigration consultant is genuine in India?",
    a: "India has no licensing body for immigration consultants, which is exactly why the question is hard here. The check that works is to verify them against the regulator of the destination country instead: the CICC register for Canada, OMARA for Australia, the Immigration Advice Authority for the UK. If a consultant is charging you for Canadian advice and nobody on their team appears on the CICC register, nobody on that file is accountable to a regulator.",
  },
  {
    q: "Is ICCRC the same as CICC?",
    a: "Yes. The Immigration Consultants of Canada Regulatory Council became the College of Immigration and Citizenship Consultants on 23 November 2021. Licence numbers carried over unchanged. A consultant using the old name is not automatically a problem, but the number must be live on the CICC register today.",
  },
  {
    q: "What does 'Entitled to Practise' mean on the CICC register?",
    a: "It is the only status that means the consultant may represent you right now. A licence can appear on the register while suspended, lapsed, or restricted. Read the status line, not just the presence of a name.",
  },
  {
    q: "Can an Indian immigration consultant legally handle a Canadian application?",
    a: "They can help you prepare documents. They cannot represent you to IRCC for a fee unless they are a licensed RCIC, a Canadian lawyer, or a Quebec notary — wherever in the world they are sitting. If someone is paid to advise on your Canadian file, ask who the licensed representative is and check that name.",
  },
  {
    q: "What if my consultant is not registered anywhere?",
    a: "It is not automatically illegal to give general information. It is a problem when they take a fee to represent you, complete forms in your name, or advise on how to answer. If money has already changed hands, keep every receipt and message, and get a second opinion from a licensed representative before anything is filed.",
  },
];

export default function VerifyConsultantPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "How to verify an immigration consultant is licensed",
        description:
          "Check any immigration consultant against the official regulator of the destination country before paying a fee.",
        step: REGISTERS.map((register, position) => ({
          "@type": "HowToStep",
          position: position + 1,
          name: `Check the ${register.country} register`,
          text: register.check,
          url: register.url,
        })),
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
      <JsonLd id="verify-consultant-jsonld" data={jsonLd} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <header className="max-w-3xl">
          <p className="type-caption font-bold uppercase tracking-[0.18em] text-primary">
            Before you pay anyone
          </p>
          <h1 className="type-page-title mt-3 text-[#071a3a]">
            How to check an immigration consultant is actually licensed
          </h1>
          <p className="type-body mt-4 text-[#071a3a]/70">
            India does not license immigration consultants. Anyone can print a brochure. The only
            check that means anything is against the regulator of the country you are moving to —
            and every one of those registers is public, free, and takes about ten seconds.
          </p>
          <p className="type-body mt-4 text-[#071a3a]/70">
            Here is how to read each one, what the warning signs look like, and our own licences at
            the bottom so you can practise on us.
          </p>
        </header>

        {/* ------------------------------ registers ------------------------------ */}
        <section className="mt-12">
          <h2 className="type-section-title text-[#071a3a]">The three registers that matter</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {REGISTERS.map((register) => (
              <div
                key={register.country}
                className="flex flex-col rounded-2xl border border-[#071a3a]/12 bg-white p-5 shadow-[0_10px_34px_rgba(15,58,138,0.07)]"
              >
                <p className="type-caption font-black uppercase tracking-[0.14em] text-primary">
                  {register.country}
                </p>
                <h3 className="mt-1.5 text-[16px] font-black leading-snug text-[#071a3a]">{register.body}</h3>
                {register.was ? (
                  <p className="mt-2 rounded-lg bg-[#e1b923]/10 p-2.5 text-[12.5px] leading-snug text-[#071a3a]/70">
                    {register.was}
                  </p>
                ) : null}
                <p className="type-small mt-3 text-[#071a3a]/70">{register.check}</p>
                <p className="mt-3 text-[12.5px] font-semibold text-[#071a3a]/55">
                  Number format: {register.format}
                </p>
                <a
                  href={register.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-black text-white transition hover:brightness-110"
                >
                  Open the official register <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------ red flags ------------------------------ */}
        <section className="mt-14">
          <h2 className="type-section-title text-[#071a3a]">Six things that should stop you</h2>
          <p className="type-body mt-3 max-w-3xl text-[#071a3a]/70">
            None of these is proof of fraud on its own. Two of them together is a reason to walk.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {RED_FLAGS.map((item) => (
              <li key={item.flag} className="rounded-xl border border-[#b3341f]/20 bg-[#b3341f]/[0.04] p-5">
                <p className="flex items-start gap-2.5 text-[15px] font-black text-[#071a3a]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#b3341f]" aria-hidden="true" />
                  {item.flag}
                </p>
                <p className="type-small mt-2 pl-[26px] text-[#071a3a]/70">{item.why}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------ our own ------------------------------ */}
        <section className="mt-14">
          <div className="rounded-2xl border border-primary/25 bg-primary p-6 text-white sm:p-8">
            <p className="type-caption flex items-center gap-2 font-black uppercase tracking-[0.18em] text-[#f0cb3b]">
              <ShieldCheck className="size-4" aria-hidden="true" /> Now check us
            </p>
            <h2 className="mt-2 text-[24px] font-black leading-tight sm:text-[28px]">
              Your Canadian file is handled under a live CICC licence
            </h2>
            <p className="type-body mt-3 max-w-3xl text-white/75">
              Licence <strong className="text-white">R516194</strong>, which you can check on the
              College&rsquo;s public register in about ten seconds using the link above. Most
              consultancies operating in India cannot show you one at all — which is the whole reason
              this page exists.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {credentials.map((credential) => (
                <a
                  key={credential.id}
                  href={credential.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-white/20 bg-white/[0.06] p-4 transition hover:border-[#e1b923]/70 hover:bg-white/[0.12]"
                >
                  <p className="type-caption uppercase tracking-[0.12em] text-white/50">
                    {credential.authorityShort} · {credential.country}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[16px] font-black text-[#f0cb3b]">
                    {credential.label}
                    <ExternalLink className="size-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-white/60">{credential.scope}</p>
                  <p className="mt-2 text-[11.5px] text-white/40">
                    Held by: {credential.heldBy}
                  </p>
                  <p className="mt-1 text-[11.5px] text-white/40">
                    Confirmed on the register {credential.lastVerified}
                  </p>
                </a>
              ))}
            </div>

            <p className="mt-5 text-[12.5px] leading-relaxed text-white/45">
              {firmFacts.serviceBoundary} Registered in India, CIN {firmFacts.cin}, operating since{" "}
              {firmFacts.foundedYear} from {firmFacts.headquarters}.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/personal-booking#schedule"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-6 text-[15px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
              >
                Book a consultation <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/xia-intelligence"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-[14.5px] font-bold text-white transition hover:bg-white/10"
              >
                Check which programmes you qualify for
              </Link>
            </div>
          </div>
        </section>

        {/* -------------------------------- FAQ -------------------------------- */}
        <section className="mt-14 max-w-3xl">
          <h2 className="type-section-title text-[#071a3a]">Common questions</h2>
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
            Register details on this page were confirmed on 13 September 2026. Regulators update
            their registers continuously — always check the live register rather than relying on any
            third-party summary, including this one.
          </p>
        </section>
      </div>
    </>
  );
}
