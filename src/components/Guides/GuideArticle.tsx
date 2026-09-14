// src/components/Guides/GuideArticle.tsx
// -----------------------------------------------------------------------------
// One renderer for every long-tail guide, so the structure — and therefore the
// schema, the internal links and the report hand-off — is identical on all of
// them and there is one place to improve it.
//
// Server component: nothing here is interactive, so none of it needs to ship as
// JavaScript. These pages are read, not used.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { ArrowRight, CalendarCheck, FileText, Quote } from "lucide-react";

import type { Guide } from "@/data/guides";
import { getGuide } from "@/data/guides";
import { REPORT_LABEL } from "@/lib/xia/report-for";
import { JsonLd } from "@/lib/seo";

const SITE = "https://www.xiphiasimmigration.com";

export default function GuideArticle({ guide }: { guide: Guide }) {
  const url = `${SITE}/${guide.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: guide.h1,
        description: guide.description,
        datePublished: guide.updated,
        dateModified: guide.updated,
        inLanguage: "en-IN",
        mainEntityOfPage: url,
        author: { "@id": `${SITE}/#organization` },
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: guide.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: guide.h1, item: url },
        ],
      },
    ],
  };

  const related = guide.related.map(getGuide).filter((item): item is Guide => Boolean(item));

  return (
    <>
      <JsonLd id={`guide-${guide.slug}-jsonld`} data={jsonLd} />

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <article className="min-w-0 max-w-3xl">
            <header>
              <p className="type-caption font-bold uppercase tracking-[0.18em] text-primary">
                {guide.eyebrow}
              </p>
              <h1 className="type-page-title mt-3 text-[#071a3a]">{guide.h1}</h1>
              <p className="type-body mt-4 font-semibold text-[#071a3a]/80">{guide.standfirst}</p>
              <p className="type-caption mt-4 text-[#071a3a]/45">
                Updated {guide.updated} · about {guide.readingMinutes} minutes ·{" "}
                Written against published government criteria
              </p>
            </header>

            {/* Contents — genuinely useful on a page this long, and it earns sitelinks. */}
            <nav aria-label="On this page" className="mt-8 rounded-xl border border-[#071a3a]/10 bg-[#071a3a]/[0.02] p-5">
              <p className="type-caption font-bold uppercase tracking-[0.1em] text-[#071a3a]/50">
                On this page
              </p>
              <ol className="mt-2.5 space-y-1.5">
                {guide.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#s${index + 1}`}
                      className="text-[14px] font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#faq" className="text-[14px] font-semibold text-primary underline-offset-4 hover:underline">
                    Common questions
                  </a>
                </li>
              </ol>
            </nav>

            {guide.sections.map((section, index) => (
              <section key={section.heading} id={`s${index + 1}`} className="mt-12 scroll-mt-28">
                <h2 className="type-section-title text-[#071a3a]">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="type-body mt-4 text-[#071a3a]/75">
                    {paragraph}
                  </p>
                ))}

                {section.callout ? (
                  <p className="mt-5 flex items-start gap-3 rounded-xl border-l-4 border-[#e1b923] bg-[#e1b923]/[0.09] p-4 text-[15px] font-bold leading-relaxed text-[#071a3a]">
                    <Quote className="mt-0.5 size-4 shrink-0 text-[#b48f10]" aria-hidden="true" />
                    {section.callout}
                  </p>
                ) : null}

                {section.table ? (
                  <figure className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-left">
                      <caption className="type-caption pb-2 text-left font-bold uppercase tracking-[0.1em] text-[#071a3a]/50">
                        {section.table.caption}
                      </caption>
                      <tbody>
                        {section.table.rows.map(([label, value]) => (
                          <tr key={label} className="border-b border-[#071a3a]/10">
                            <th scope="row" className="py-2.5 pr-4 text-[14px] font-semibold text-[#071a3a]/75">
                              {label}
                            </th>
                            <td className="py-2.5 text-[14px] font-black tabular-nums text-[#071a3a]">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </figure>
                ) : null}
              </section>
            ))}

            {/* The report, offered where the reader has just learned it exists. */}
            <section className="mt-14 overflow-hidden rounded-2xl border border-[#e1b923]/45 bg-gradient-to-br from-[#e1b923]/[0.14] via-[#e1b923]/[0.05] to-transparent p-6 sm:p-8">
              <p className="type-caption font-black uppercase tracking-[0.2em] text-[#b48f10]">
                For your own case
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-tight text-[#071a3a] sm:text-[28px]">
                {REPORT_LABEL[guide.report]}
              </h2>
              <p className="type-body mt-3 max-w-2xl text-[#071a3a]/75">{guide.reportPitch}</p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={`/get-report/${guide.report}`}
                  className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-6 text-[15px] font-black text-[#071a3a] shadow-[0_12px_30px_rgba(225,185,35,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]"
                >
                  <FileText className="size-4" aria-hidden="true" /> Get the report
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/personal-booking#schedule"
                  className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border border-[#071a3a]/25 px-5 text-[14.5px] font-bold text-[#071a3a] transition hover:border-[#071a3a]/50 hover:bg-[#071a3a]/[0.04]"
                >
                  <CalendarCheck className="size-4" aria-hidden="true" /> Talk to an advisor instead
                </Link>
              </div>
            </section>

            <section id="faq" className="mt-14 scroll-mt-28">
              <h2 className="type-section-title text-[#071a3a]">Common questions</h2>
              <div className="mt-5 space-y-4">
                {guide.faq.map((item) => (
                  <details key={item.q} className="rounded-xl border border-[#071a3a]/10 bg-white p-5">
                    <summary className="cursor-pointer list-none text-[15px] font-black text-[#071a3a] marker:hidden">
                      {item.q}
                    </summary>
                    <p className="type-small mt-3 text-[#071a3a]/70">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {related.length ? (
              <section className="mt-14">
                <h2 className="type-section-title text-[#071a3a]">Read next</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/${item.slug}`}
                        className="group block h-full rounded-xl border border-[#071a3a]/12 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/50"
                      >
                        <p className="type-caption uppercase tracking-[0.12em] text-primary">{item.eyebrow}</p>
                        <p className="mt-1.5 flex items-start gap-1.5 text-[15px] font-black leading-snug text-[#071a3a]">
                          {item.h1}
                          <ArrowRight
                            className="mt-1 size-3.5 shrink-0 text-[#071a3a]/30 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </p>
                        <p className="type-small mt-2 text-[#071a3a]/60">{item.standfirst}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="mt-10 text-[12.5px] leading-relaxed text-[#071a3a]/50">
              Written against government-published criteria as at {guide.updated}. Immigration rules
              change without notice — always confirm current requirements on the destination
              government&rsquo;s own site. XIPHIAS provides immigration consulting and documentation
              support; it is not a law firm and this page is not legal advice. Canadian representation
              is provided under CICC licence R516194.
            </p>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[#071a3a]/10 bg-[#071a3a]/[0.03] p-5">
              <h2 className="text-[15px] font-black text-[#071a3a]">Work it out for yourself</h2>
              <ul className="mt-3 space-y-2.5">
                {guide.tools.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="text-[14px] font-bold text-primary underline-offset-4 hover:underline"
                    >
                      {tool.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/25 bg-primary p-5 text-white">
              <p className="type-caption font-black uppercase tracking-[0.16em] text-[#f0cb3b]">
                Check us before you trust us
              </p>
              <p className="type-small mt-2 text-white/75">
                Our Canadian work runs under CICC licence R516194, which you can look up on the
                College&rsquo;s public register in about ten seconds.
              </p>
              <Link
                href="/verify-immigration-consultant"
                className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-black text-[#f0cb3b] underline-offset-4 hover:underline"
              >
                How to verify any consultant <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
