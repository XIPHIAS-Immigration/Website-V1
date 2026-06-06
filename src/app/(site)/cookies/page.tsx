// FILE: src/app/(site)/cookies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React from "react";

// ✅ Keep one canonical domain everywhere
const SITE_URL = "https://www.xiphiasimmigration.com";

// ───────────────── SEO METADATA ─────────────────
export const metadata: Metadata = {
  title: "Cookies Policy · XIPHIAS Immigration Private Limited",
  description:
    "How XIPHIAS Immigration Private Limited uses cookies and similar technologies, and how you can manage your preferences.",
  alternates: { canonical: "/cookies" },
  robots: { index: true, follow: true },

  openGraph: {
    title: "Cookies Policy · XIPHIAS Immigration Private Limited",
    description:
      "How we use cookies and similar technologies, and how to manage your preferences.",
    url: `${SITE_URL}/cookies`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "XIPHIAS Immigration",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Cookies Policy · XIPHIAS Immigration Private Limited",
    description:
      "How we use cookies and similar technologies, and how to manage your preferences.",
    images: ["/xiphias-immigration.png"],
  },
};

// ──────────────── SMALL UI HELPERS (black/white only) ────────────────
const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
    <h2
      id={`${id}-title`}
      className="text-xl md:text-2xl font-semibold tracking-tight mb-3 text-black dark:text-white"
    >
      {title}
    </h2>
    <div className="max-w-none text-black dark:text-white">{children}</div>
  </section>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm text-black dark:text-white">
    {children}
  </div>
);

// ───────────────── PAGE ─────────────────
export default function CookiesPage() {
  const effectiveDate = "09 Oct 2025";
  const company = {
    name: "XIPHIAS Immigration Private Limited",
    site: SITE_URL,
    privacyEmail: "immigration@xiphias.in",
  } as const;

  const toc = [
    { id: "what", label: "What are cookies" },
    { id: "how", label: "How we use them" },
    { id: "types", label: "Cookie types" },
    { id: "manage", label: "Manage preferences" },
    { id: "gpc", label: "Global Privacy Control (GPC)" },
    { id: "updates", label: "Updates" },
    { id: "contact", label: "Contact" },
  ];

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${company.site}/cookies#webpage`,
    name: "Cookies Policy",
    url: `${company.site}/cookies`,
    dateModified: "2025-10-09",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${company.site}/#website`,
      name: "XIPHIAS Immigration",
      url: company.site,
    },
  };

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${company.site}/` },
      { "@type": "ListItem", position: 2, name: "Cookies Policy", item: `${company.site}/cookies` },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-900 text-black dark:text-white">
      {/* Skip link for keyboard users */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-black focus:text-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Breadcrumb />
      </div>

      {/* Hero */}
      <header className="border-b border-black/10 dark:border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Cookies Policy
              </h1>
              <p className="mt-2 text-sm/6 opacity-80">Effective: {effectiveDate}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>What cookies are and why we use them.</li>
                    <li>Types: essential, analytics, advertising.</li>
                    <li>How to manage your preferences at any time.</li>
                    <li>How we honor Global Privacy Control (GPC).</li>
                  </ul>
                </Card>

                <Card>
                  <p className="text-sm">
                    See also the{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </Card>
              </div>
            </div>

            {/* Right rail (desktop TOC) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav aria-label="On this page" className="sticky top-28">
                <p className="text-xs uppercase tracking-wide opacity-70 mb-2">
                  On this page
                </p>
                <ul className="space-y-1">
                  {toc.map((n) => (
                    <li key={n.id}>
                      <a
                        href={`#${n.id}`}
                        className="block rounded-md px-2 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </header>

      {/* Body */}
      <div id="content" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 space-y-10">
            <Section id="what" title="1. What are cookies?">
              <p>
                Cookies are small text files placed on your device by a website. They can be
                first-party (set by this site) or third-party (set by partners). We may also use
                similar technologies like local storage and SDKs in apps.
              </p>
            </Section>

            <Section id="how" title="2. How we use cookies">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Essential</strong> — to keep the site secure, load pages, and remember
                  your session or preferences.
                </li>
                <li>
                  <strong>Analytics</strong> — to understand performance, popular content, and
                  improve features.
                </li>
                <li>
                  <strong>Advertising</strong> — to measure campaigns, avoid showing the same ad
                  repeatedly, and personalize where permitted.
                </li>
              </ul>
            </Section>

            <Section id="types" title="3. Cookie types & retention">
              <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm">
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-semibold">Type</th>
                      <th className="p-2 text-left font-semibold">Purpose</th>
                      <th className="p-2 text-left font-semibold">Examples</th>
                      <th className="p-2 text-left font-semibold">Retention</th>
                      <th className="p-2 text-left font-semibold">First/Third party</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Essential</td>
                      <td className="p-2">Security, session, load balancing</td>
                      <td className="p-2">session_id, csrf_token</td>
                      <td className="p-2">Session / up to 12 months</td>
                      <td className="p-2">First-party</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Analytics</td>
                      <td className="p-2">Performance, usage insights</td>
                      <td className="p-2">page_view, feature_usage</td>
                      <td className="p-2">13–24 months (aggregated)</td>
                      <td className="p-2">First-party / Third-party</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Advertising</td>
                      <td className="p-2">Attribution, frequency capping</td>
                      <td className="p-2">ad_attrib, freq_cap</td>
                      <td className="p-2">Up to 24 months</td>
                      <td className="p-2">Third-party</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm">
                Vendors and exact cookie names may change over time. We update this table
                periodically.
              </p>
            </Section>

            <Section id="manage" title="4. Manage your preferences">
              <p>
                You can change your settings anytime by opening your cookie preferences. Most browsers
                also let you block or delete cookies in settings.
              </p>

              <Card>
                {/* Link styled as a button; safe for server component */}
                <a
                  href="#open-cookie-preferences"
                  role="button"
                  className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Open cookie preferences
                </a>

                <p className="text-xs mt-2 opacity-80">
                  This link opens the cookie preference modal via{" "}
                  <code>#open-cookie-preferences</code>.
                </p>
              </Card>

              <p className="mt-3 text-sm">
                California residents can also use the{" "}
                <Link href="/contact" className="underline">
                  contact page
                </Link>{" "}
                to request assistance with opt-out preferences where applicable.
              </p>
            </Section>

            <Section id="gpc" title="5. Global Privacy Control (GPC)">
              <p>
                We make reasonable efforts to honor the Global Privacy Control signal where supported,
                treating it as a request to opt out of sale/sharing for the current browser.
              </p>
            </Section>

            <Section id="updates" title="6. Updates to this policy">
              <p>
                We may update this Cookies Policy from time to time. If changes are material, we will
                post a prominent notice on this page. The date at the top indicates the last update.
              </p>
            </Section>

            <Section id="contact" title="7. Contact">
              <p>
                Questions about this policy? Email{" "}
                <a className="underline" href={`mailto:${company.privacyEmail}`}>
                  {company.privacyEmail}
                </a>
                .
              </p>
            </Section>
          </div>

          {/* Mobile TOC */}
          <div className="lg:col-span-3">
            <div className="lg:hidden sticky top-24 border rounded-xl border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-2">On this page</p>
              <div className="flex flex-wrap gap-2">
                {toc.map((n) => (
                  <a
                    key={n.id}
                    href={`#${n.id}`}
                    className="inline-flex items-center rounded-md border px-2 py-1 text-xs border-black/15 dark:border-white/25 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {n.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD (SEO) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      {/* Hash-trigger helper: if CMP is present, auto-open on #open-cookie-preferences */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(location.hash==="#open-cookie-preferences"){window.showCookiePreferences&&window.showCookiePreferences();}}catch(e){}})();`,
        }}
      />
    </main>
  );
}
