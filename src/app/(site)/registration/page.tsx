import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileSearch, FolderLock, Route, UserRoundCheck } from "lucide-react";
import RegistrationCheckout from "@/components/Registration/RegistrationCheckout";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Full Immigration Assessment ₹4,999 | Profile Review + Deep Analysis Report",
  description:
    "A structured immigration assessment of your real profile against the published rules — Deep Analysis report included, secure client CRM access, and an advisor-ready plan. ₹4,999 including GST.",
  alternates: { canonical: "/registration" },
  openGraph: {
    title: "Full immigration assessment — ₹4,999, report included",
    description:
      "Your profile against the published criteria of every programme we work on, the Deep Analysis report, and a named next step.",
    url: "https://www.xiphiasimmigration.com/registration",
    type: "website",
  },
};

const FAQ = [
  {
    q: "What do I actually get for ₹4,999?",
    a: "A structured assessment of your real profile against the published criteria of the programmes we work on, the Deep Analysis report that sets out where you stand and what each route still needs from you, and access to the client CRM where your documents, milestones and case notes live. It ends with a named next step rather than a sales call.",
  },
  {
    q: "How is this different from the free tools on this site?",
    a: "The free tools score you against published rules using what you type into a form. The paid assessment works from your actual documents and employment history, which is where the differences that matter show up — whether your duties match the occupation code you assumed, whether your experience will be recognised as skilled, whether a past refusal changes the route. Those are judgements, not calculations.",
  },
  {
    q: "Is the ₹4,999 refundable?",
    a: "It pays for the assessment work itself, which is delivered whatever the outcome — including when the honest outcome is that no route currently fits and you should not spend further. What you are buying is the answer, not a positive answer.",
  },
  {
    q: "Does registering mean you file my application?",
    a: "No. Registration buys the assessment and the report. If a route is worth pursuing, filing is a separate engagement with its own agreement and fee, and Canadian matters are handled under CICC licence R516194. You are free to take the report and file yourself.",
  },
  {
    q: "How long does the assessment take?",
    a: "The report is produced from what you supply, so the timeline depends mostly on how quickly the profile is completed after payment. A complete profile is normally turned around within a few working days.",
  },
];

export default function RegistrationPage() {
  const priceInr = getProductConfig("registration")?.priceInr ?? 5000;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Full immigration assessment",
        serviceType: "Immigration assessment and advisory",
        provider: { "@id": "https://www.xiphiasimmigration.com/#organization" },
        areaServed: { "@type": "Country", name: "India" },
        url: "https://www.xiphiasimmigration.com/registration",
        offers: {
          "@type": "Offer",
          price: String(priceInr),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: "https://www.xiphiasimmigration.com/registration",
        },
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
    <main className="min-h-screen bg-[#eef3f9] pb-24 pt-24 text-[#071a3a]">
      <JsonLd id="registration-jsonld" data={jsonLd} />
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-screen-xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c83f]">XIPHIAS full assessment</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Register once. Get the analysis and your client CRM.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">For ₹4,999 including GST, start a structured immigration assessment, receive the included Deep Analysis and manage the next steps in the XIPHIAS client CRM.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Deep Analysis report included", "Secure client CRM access", "Registration and payment visible in CRM", "Advisor handoff and next-step plan"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-white/75"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3" /></span>{item}</div>)}
            </div>
            <a href="#registration-checkout" className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-[#d8ad1f] px-7 text-base font-black text-primary">Register for ₹{priceInr.toLocaleString("en-IN")} <ArrowRight className="size-5" /></a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [FileSearch, "Assessment", "Build the evidence-led profile"],
              [Route, "Deep Analysis", "Review route fit and gaps"],
              [FolderLock, "Client CRM", "Organise documents and milestones"],
              [UserRoundCheck, "Handoff", "Prepare the case for advisor review"],
            ].map(([Icon, title, copy], index) => {
              const ItemIcon = Icon as typeof FileSearch;
              return <div key={String(title)} className="rounded-2xl border border-white/15 bg-white/[0.055] p-5"><ItemIcon className="size-6 text-[#f0c83f]" /><p className="mt-4 text-xs font-black text-[#f0c83f]">0{index + 1}</p><h2 className="mt-1 text-lg font-black">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-white/50">{String(copy)}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-screen-xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0b4ea2]">What happens next</p>
          <ol className="mt-6 space-y-6">
            {[
              ["Pay securely", "Complete the short checkout form and pay through JioPay."],
              ["Open the client CRM", "Your CRM client ID, paid receipt and secure access are created after verified payment."],
              ["Complete the profile", "Add the full personal, education, employment and document history securely after payment."],
              ["Receive the assessment", "The Deep Analysis and advisor-ready next steps use the information actually supplied."],
            ].map(([title, copy], index) => <li key={title} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#071a3a] text-xs font-black text-[#d8ad1f]">{index + 1}</span><div><h2 className="font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p></div></li>)}
          </ol>
          <p className="mt-7 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">Registration does not guarantee visa eligibility or approval. Supplied facts remain authoritative; missing information stays explicit until provided and verified.</p>
          <Link href="/reports" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0b4ea2]">Only need a standalone report? <ArrowRight className="size-4" /></Link>
        </aside>
        <RegistrationCheckout priceInr={priceInr} />
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <article className="max-w-3xl">
            <h2 className="text-[26px] font-black leading-tight text-[#071a3a]">
              What a real assessment looks at, and a calculator cannot
            </h2>
            <p className="mt-4 text-[16px] leading-8 text-[#071a3a]/75">
              Every free points calculator on the internet, including ours, scores you against what
              you type into it. That is useful and it is honest, but it takes your answers at face
              value — and the answers people get wrong are not the ones they know they are guessing at.
            </p>
            <p className="mt-4 text-[16px] leading-8 text-[#071a3a]/75">
              The occupation code is the usual one. People pick the code that matches their job title
              rather than their actual duties, score themselves on it, and only discover the mismatch
              when an employment reference letter has to describe those duties in writing. At that
              point the experience does not count, and the score that earned the invitation was never
              real.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["Whether your experience counts as skilled", "Assessing authorities routinely discount the first two to four years. A profile built on experience that will not be recognised is a different profile."],
                ["Whether your duties match the code you claimed", "The reference letter has to say it. If it cannot, the points go."],
                ["What a past refusal actually changes", "Refusals are rarely fatal and almost always change the route. Undisclosed ones are a different matter entirely."],
                ["Whether the funds will document", "Money that appears shortly before filing is treated as borrowed, whoever it belongs to."],
              ].map(([term, detail]) => (
                <li key={term} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-[15px] font-black text-[#071a3a]">{term}</p>
                  <p className="mt-1.5 text-[14px] leading-7 text-slate-500">{detail}</p>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 text-[26px] font-black leading-tight text-[#071a3a]">Common questions</h2>
            <div className="mt-5 space-y-4">
              {FAQ.map((item) => (
                <details key={item.q} className="rounded-xl border border-slate-200 bg-white p-5">
                  <summary className="cursor-pointer list-none text-[15px] font-black text-[#071a3a] marker:hidden">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-[14px] leading-7 text-slate-500">{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0b4ea2]">
                Not ready to register?
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  ["Score yourself free — Canada CRS", "/tools/crs-calculator"],
                  ["Score yourself free — Australia", "/tools/australia-points-calculator"],
                  ["Which programmes you qualify for", "/xia-intelligence"],
                  ["A single report from ₹499", "/reports"],
                  ["Verify our licence first", "/verify-immigration-consultant"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[14px] font-bold text-[#0b4ea2] underline-offset-4 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
