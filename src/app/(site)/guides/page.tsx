import type { Metadata } from "next";
import Link from "next/link";

import { guides } from "@/data/guides";
import {
  SITE_URL,
  breadcrumbSchema,
  jsonLdScript,
  organizationSchema,
} from "@/lib/seo/schema";

const SLUG = "guides";
const TITLE = "Immigration Guides for Indians | Costs, Timelines, Points";
const DESCRIPTION =
  "Straight answers on Canada PR, Australian skilled migration, Portugal's Golden Visa, Caribbean citizenship and the EB-2 NIW — written for applicants from India, with the numbers shown.";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [`${SITE_URL}/xiphias-immigration.png`],
  },
};

/** Groups come from the guide's own eyebrow ("Canada · Express Entry"), so a new
 *  guide joins the right group automatically without touching this file. */
const GROUP_ORDER = [
  "Canada",
  "Australia",
  "Portugal",
  "Caribbean",
  "United States",
];

function groupOf(eyebrow: string) {
  return eyebrow.split("·")[0]?.trim() || "Other";
}

export default function Page() {
  const groups = new Map<string, typeof guides>();
  for (const guide of guides) {
    const key = groupOf(guide.eyebrow);
    const bucket = groups.get(key);
    if (bucket) bucket.push(guide);
    else groups.set(key, [guide]);
  }

  const ordered = [...groups.entries()].sort(
    (a, b) =>
      (GROUP_ORDER.indexOf(a[0]) + 1 || 99) - (GROUP_ORDER.indexOf(b[0]) + 1 || 99),
  );

  const graph = [
    organizationSchema(),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/${SLUG}#webpage`,
      url: `${SITE_URL}/${SLUG}`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      hasPart: guides.map((guide) => ({
        "@type": "Article",
        "@id": `${SITE_URL}/${guide.slug}#article`,
        url: `${SITE_URL}/${guide.slug}`,
        headline: guide.h1,
        description: guide.description,
      })),
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Guides", path: `/${SLUG}` },
    ]),
  ];

  return (
    <>
      <main className="bg-white">
        <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
          <div className="mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12">
            <p className="type-caption uppercase text-primary">Guides</p>
            <h1 className="type-section-title mt-3 max-w-3xl text-slate-950">
              Immigration guides for applicants from India
            </h1>
            <p className="type-body mt-5 max-w-2xl text-slate-600">
              Costs, processing times, points tables and document lists — written against the
              published criteria of each destination, with the figures shown rather than
              summarised. Every guide says plainly where a profile does not work.
            </p>
            <p className="type-small mt-4 max-w-2xl text-slate-500">
              {guides.length} guides. Nothing here is legal advice; XIPHIAS Immigration is a
              licensed consultancy (CICC R516194, MARA 1680615), not a law firm.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-screen-xl space-y-14 px-5 sm:px-8 lg:px-12">
            {ordered.map(([group, items]) => (
              <div key={group}>
                <h2 className="type-card-title text-slate-950">{group}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((guide) => (
                    <article
                      key={guide.slug}
                      className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-primary/40"
                    >
                      <p className="type-caption uppercase text-primary">{guide.eyebrow}</p>
                      <h3 className="type-card-title mt-3 text-slate-950">
                        <Link href={`/${guide.slug}`} className="hover:text-primary">
                          {guide.h1}
                        </Link>
                      </h3>
                      <p className="type-small mt-3 flex-1 text-slate-600">{guide.standfirst}</p>
                      <p className="type-caption mt-4 text-slate-400">
                        {guide.readingMinutes} min read
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12">
            <h2 className="type-card-title text-slate-950">Before you engage anyone</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { href: "/verify-immigration-consultant", label: "Verify a consultant against the official register" },
                { href: "/immigration-lawyer-or-consultant-bangalore", label: "Immigration lawyer or licensed consultant — which do you need?" },
                { href: "/immigration-consultants-in-bangalore", label: "Immigration consultants in Bangalore" },
                { href: "/top-immigration-consultants-in-india", label: "Top immigration consultants in India" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-small text-slate-700 hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
    </>
  );
}
