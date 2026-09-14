// src/components/LocalSeo/LocalLandingPage.tsx
// -----------------------------------------------------------------------------
// One template for every local landing page. Server component: all of it is
// text in the HTML, which is the entire point of these pages.
// -----------------------------------------------------------------------------

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { credentials, firmFacts } from "@/data/credentials";
import {
  getLocalLanding,
  headOffice,
  napOffices,
  openingHours,
  type LocalLanding,
} from "@/data/local-seo";
import { awardsData } from "@/components/awards/awards.data";

function telHref(value: string) {
  return `tel:${value.replace(/\s+/g, "")}`;
}

function prettyPhone(value: string) {
  // +918049768088 -> +91 80 4976 8088
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    const rest = digits.slice(2);
    return `+91 ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`;
  }
  return value;
}

export default function LocalLandingPage({ landing }: { landing: LocalLanding }) {
  const related = landing.related
    .map((slug) => getLocalLanding(slug))
    .filter((item): item is LocalLanding => Boolean(item));

  return (
    <div className="bg-white text-slate-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1551a0] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_18%_0%,rgba(7,26,58,0.55),transparent_72%)]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-screen-2xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <nav aria-label="Breadcrumb" className="type-caption uppercase tracking-[0.16em] text-white/45">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden="true" className="px-2">/</span>
            <span className="text-[#e1b923]">{landing.eyebrow}</span>
          </nav>

          <h1 className="type-page-title mt-5 max-w-4xl text-white">{landing.h1}</h1>
          <p className="type-body mt-5 max-w-2xl text-white/75">{landing.standfirst}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/personal-booking#schedule"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#e1b923] px-6 text-sm font-bold text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a consultation
            </Link>
            {headOffice.phones?.[0] ? (
              <a
                href={telHref(headOffice.phones[0])}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Phone className="size-4" aria-hidden="true" />
                {prettyPhone(headOffice.phones[0])}
              </a>
            ) : null}
          </div>

          {/* Credentials — the differentiator, above the fold, each one checkable */}
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {credentials.map((credential) => (
              <li key={credential.id}>
                <a
                  href={credential.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col gap-1 rounded-lg border border-white/15 bg-white/[0.05] p-4 transition hover:border-[#e1b923]/60 hover:bg-white/[0.09]"
                >
                  <span className="flex items-center gap-2 text-[13px] font-black text-[#e1b923]">
                    <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                    {credential.label}
                  </span>
                  <span className="type-small text-white/70">
                    {credential.authorityShort} · {credential.country}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 transition group-hover:text-white/80">
                    Verify on the register
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200 bg-slate-50">
        <dl className="mx-auto grid max-w-screen-2xl grid-cols-2 divide-x divide-slate-200 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
          {[
            { value: `${firmFacts.advisorYearsExperience}+`, label: "Years advising" },
            { value: String(awardsData.length), label: "Industry awards" },
            { value: String(firmFacts.officeCount), label: "Global offices" },
            { value: `${firmFacts.googleRating}★`, label: "Google rating" },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-6 text-center sm:px-6">
              <dd className="text-3xl font-bold tabular-nums text-primary">{stat.value}</dd>
              <dt className="type-caption mt-2 uppercase text-slate-500">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-12">
        <article>
          {landing.sections.map((section) => (
            <section key={section.heading} className="mb-12 last:mb-0">
              <h2 className="type-section-title text-slate-950">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="type-body mt-4 max-w-[68ch] text-slate-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {/* FAQ */}
          <section className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="type-section-title text-slate-950">Common questions</h2>
            <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {landing.faq.map((item) => (
                <div key={item.q} className="grid gap-2 py-5 md:grid-cols-[300px_minmax(0,1fr)] md:gap-8">
                  <dt className="type-card-title text-slate-950">{item.q}</dt>
                  <dd className="type-small max-w-[62ch] text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Related pages — internal linking is most of what makes a cluster work */}
          {related.length ? (
            <section className="mt-14">
              <h2 className="type-card-title text-slate-950">Related</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/${item.slug}`}
                      className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-primary"
                    >
                      <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
                      <span>
                        <span className="type-card-title block text-slate-950">{item.h1}</span>
                        <span className="type-small mt-1 block text-slate-500">{item.standfirst}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        {/* Sidebar — NAP, identical everywhere, matching the Google listing */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="type-caption uppercase tracking-[0.16em] text-primary">Bengaluru office</p>
            <address className="type-small mt-3 not-italic text-slate-700">
              <strong className="block font-black text-slate-950">XIPHIAS Immigration Pvt Ltd</strong>
              {headOffice.streetAddress}
              <br />
              {headOffice.locality}, {headOffice.region} {headOffice.postalCode}
              <br />
              {headOffice.country}
            </address>

            <div className="mt-4 space-y-2">
              {headOffice.phones?.map((phone) => (
                <a key={phone} href={telHref(phone)} className="type-small flex items-center gap-2 font-bold text-primary hover:underline">
                  <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                  {prettyPhone(phone)}
                </a>
              ))}
              {headOffice.email ? (
                <a href={`mailto:${headOffice.email}`} className="type-small block font-bold text-primary hover:underline">
                  {headOffice.email}
                </a>
              ) : null}
            </div>

            <p className="type-small mt-4 text-slate-600">
              {openingHours.days[0]}–{openingHours.days[openingHours.days.length - 1]},{" "}
              {openingHours.opens}–{openingHours.closes} IST
            </p>

            {headOffice.mapsQuery ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${headOffice.mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Open in Google Maps
              </a>
            ) : null}

            <Link
              href="/personal-booking#schedule"
              className="mt-6 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a consultation
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 p-6">
            <p className="type-caption uppercase tracking-[0.16em] text-primary">Also at</p>
            <ul className="mt-3 space-y-2">
              {napOffices
                .filter((office) => !office.headquarters)
                .map((office) => (
                  <li key={office.id} className="type-small flex items-center gap-2 text-slate-600">
                    <Building2 className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    {office.locality}, {office.country}
                  </li>
                ))}
            </ul>
          </div>

          <p className="type-caption mt-5 leading-5 text-slate-400">{firmFacts.serviceBoundary}</p>
        </aside>
      </div>
    </div>
  );
}
