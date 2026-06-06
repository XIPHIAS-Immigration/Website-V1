// src/app/(site)/accessibility/page.tsx
import type { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React from "react";

// ✅ Keep one canonical domain everywhere
const SITE_URL = "https://www.xiphiasimmigration.com";

// ───────────────── SEO METADATA ─────────────────
export const metadata: Metadata = {
  title: "Accessibility Statement · XIPHIAS Immigration Private Limited",
  description:
    "Our commitment to digital accessibility, conformance targets, measures we take, and how to report issues or request an accessible format.",
  alternates: { canonical: "/accessibility" },
  robots: { index: true, follow: true },

  // ✅ Include OG image here so this page doesn't lose the global image
  openGraph: {
    title: "Accessibility Statement · XIPHIAS Immigration Private Limited",
    description:
      "Commitment to accessible experiences, WCAG conformance, known limitations, and feedback channels.",
    url: `${SITE_URL}/accessibility`,
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

  // ✅ Keep consistent with your global Twitter setup
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Statement · XIPHIAS Immigration Private Limited",
    description:
      "Commitment to accessible experiences, WCAG conformance, known limitations, and feedback channels.",
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
export default function AccessibilityPage() {
  const effectiveDate = "09 Oct 2025";
  const company = {
    name: "XIPHIAS Immigration Private Limited",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    site: SITE_URL, // ✅ canonical
    email: "immigration@xiphias.in",
    altEmail: "immigration@xiphias.in",
  } as const;

  const toc = [
    { id: "commitment", label: "Commitment" },
    { id: "standard", label: "Conformance standard" },
    { id: "measures", label: "Measures we take" },
    { id: "compat", label: "Assistive tech compatibility" },
    { id: "limits", label: "Known limitations" },
    { id: "altformats", label: "Alternative formats" },
    { id: "feedback", label: "Feedback & contact" },
    { id: "enforcement", label: "Enforcement" },
    { id: "updates", label: "Updates" },
  ];

  // ✅ Page JSON-LD (safe + consistent)
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${company.site}/accessibility#webpage`,
    name: "Accessibility Statement",
    url: `${company.site}/accessibility`,
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${company.site}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Accessibility",
        item: `${company.site}/accessibility`,
      },
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
                Accessibility Statement
              </h1>
              <p className="mt-2 text-sm/6 opacity-80">Effective: {effectiveDate}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Our accessibility commitment and WCAG target.</li>
                    <li>Measures in design, code, and QA to support inclusion.</li>
                    <li>How to request accessible formats or report issues.</li>
                  </ul>
                </Card>
                <Card>
                  <p className="text-sm">
                    Related: Privacy (
                    <a className="underline" href="/privacy-policy">
                      /privacy-policy
                    </a>
                    ) · Terms (
                    <a className="underline" href="/terms">
                      /terms
                    </a>
                    )
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
            <Section id="commitment" title="1. Our commitment">
              <p>
                {company.name} is committed to providing a website that is accessible to the widest
                possible audience, regardless of technology or ability. We strive to continuously
                improve the user experience for everyone and apply relevant accessibility standards.
              </p>
            </Section>

            <Section id="standard" title="2. Conformance standard">
              <p>
                Our aim is to conform to <strong>WCAG 2.1 Level AA</strong> (or higher where feasible).
                We review templates and components against these criteria during design and development.
              </p>
            </Section>

            <Section id="measures" title="3. Measures we take">
              <ul className="list-disc pl-5 space-y-1">
                <li>Semantic HTML structure and proper labeling of interactive controls.</li>
                <li>Keyboard operability and visible focus states.</li>
                <li>Color contrast that meets or exceeds WCAG AA.</li>
                <li>Text alternatives for non-text content where applicable.</li>
                <li>Testing with screen reader/navigation patterns on key flows.</li>
              </ul>
            </Section>

            <Section id="compat" title="4. Assistive technology compatibility">
              <p className="mb-2">
                We aim to work with modern browsers and assistive technologies. Experiences may vary by
                combination of OS, browser, and AT. If you encounter barriers, please tell us.
              </p>
              <Card>
                <p className="text-sm">
                  Helpful info to include in a report: page URL, steps to reproduce, expected vs.
                  actual behavior, browser/version, OS, and assistive tech (e.g., NVDA, TalkBack,
                  VoiceOver).
                </p>
              </Card>
            </Section>

            <Section id="limits" title="5. Known limitations">
              <p>
                Despite our efforts, some content or third-party integrations may not fully meet WCAG
                criteria. We monitor user feedback and update components to address issues promptly.
              </p>
            </Section>

            <Section id="altformats" title="6. Requesting alternative formats">
              <p>
                If you need content in an alternative accessible format (e.g., large print, screen-reader
                friendly PDFs), contact us and we will make reasonable efforts to assist.
              </p>
            </Section>

            <Section id="feedback" title="7. Feedback & contact">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold mb-2">Accessibility contact</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a className="underline" href={`mailto:${company.altEmail}`}>
                      {company.altEmail}
                    </a>
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-2">Alternate contact</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a className="underline" href={`mailto:${company.email}`}>
                      {company.email}
                    </a>
                  </p>
                </Card>
              </div>
            </Section>

            <Section id="enforcement" title="8. Enforcement">
              <p>
                We take accessibility seriously. If you believe you have been unable to access content
                or functionality due to a barrier on our site, please contact us using the details
                above. We will review and endeavor to remediate where reasonable.
              </p>
            </Section>

            <Section id="updates" title="9. Updates to this statement">
              <Card>
                <h3 className="text-sm font-semibold mb-2">Version history</h3>
                <ul className="text-sm list-disc pl-5">
                  <li>v1.0 — 09 Oct 2025: Initial publication.</li>
                </ul>
              </Card>
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
    </main>
  );
}