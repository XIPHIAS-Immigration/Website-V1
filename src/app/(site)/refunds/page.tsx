// FILE: src/app/(site)/refunds/page.tsx
// Refund Policy — black/white theme, responsive, SEO+JSON-LD, with Breadcrumb.

import type { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React from "react";

// ✅ Keep one canonical domain everywhere (matches your layout.tsx metadataBase)
const SITE_URL = "https://www.xiphiasimmigration.com";
const OG_IMAGE = "/xiphias-immigration.png";

// ───────────────── SEO METADATA ─────────────────
export const metadata: Metadata = {
  title: "Refund Policy · XIPHIAS Immigration Private Limited",
  description:
    "Refunds, cancellations, and chargeback rules for services provided by XIPHIAS Immigration Private Limited.",
  alternates: { canonical: "/refunds" },
  robots: { index: true, follow: true },

  openGraph: {
    title: "Refund Policy · XIPHIAS Immigration Private Limited",
    description:
      "Refunds, cancellations, and chargeback rules for services provided by XIPHIAS Immigration Private Limited.",
    url: `${SITE_URL}/refunds`,
    siteName: "XIPHIAS Immigration",
    type: "article",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "XIPHIAS Immigration",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Refund Policy · XIPHIAS Immigration Private Limited",
    description:
      "Refunds, cancellations, and chargeback rules for services provided by XIPHIAS Immigration Private Limited.",
    images: [OG_IMAGE],
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
export default function RefundsPage() {
  const effectiveDate = "09 Oct 2025";
  const company = {
    name: "XIPHIAS Immigration Private Limited",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    site: SITE_URL,
    contact: "immigration@xiphias.in",
  } as const;

  const toc = [
    { id: "scope", label: "Scope" },
    { id: "eligibility", label: "Eligibility" },
    { id: "nonrefundable", label: "Non-refundable items" },
    { id: "howto", label: "How to request a refund" },
    { id: "timelines", label: "Processing timelines" },
    { id: "cancellations", label: "Cancellations" },
    { id: "chargebacks", label: "Chargebacks" },
    { id: "law", label: "Governing law" },
    { id: "contact", label: "Contact" },
    { id: "changes", label: "Changes to this policy" },
  ];

  // ✅ JSON-LD with absolute URLs + stable @id
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${company.site}/refunds#webpage`,
    name: "Refund Policy",
    url: `${company.site}/refunds`,
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
      { "@type": "ListItem", position: 2, name: "Refund Policy", item: `${company.site}/refunds` },
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
                Refund Policy
              </h1>
              <p className="mt-2 text-sm/6 opacity-80">Effective: {effectiveDate}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>When refunds apply and how to request one.</li>
                    <li>Items that are non-refundable (e.g., government or third-party fees).</li>
                    <li>Processing timelines and cancellations.</li>
                    <li>Chargeback rules and contact details.</li>
                  </ul>
                </Card>

                <Card>
                  <p className="text-sm">
                    Related pages:{" "}
                    <Link href="/terms" className="underline">
                      Terms of Use
                    </Link>{" "}
                    ·{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>
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
            <Section id="scope" title="1. Scope">
              <p>
                This Refund Policy applies to fees paid for services purchased from {company.name} via
                our website or through our authorized representatives.
              </p>
            </Section>

            <Section id="eligibility" title="2. Eligibility">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Refunds are generally considered when a paid service has{" "}
                  <strong>not yet been rendered</strong>.
                </li>
                <li>
                  If a service has begun (e.g., consultation completed, document review commenced),
                  any refund may be partial and reflect work already performed.
                </li>
                <li>
                  Outcomes with government authorities (e.g., visa approvals) are{" "}
                  <strong>not guaranteed</strong> and are not a basis for refunds.
                </li>
              </ul>
            </Section>

            <Section id="nonrefundable" title="3. Non-refundable items">
              <ul className="list-disc pl-5 space-y-1">
                <li>Government filing, embassy, and visa fees.</li>
                <li>Third-party charges (e.g., courier, translation, notary, assessments).</li>
                <li>Bank/payment gateway charges and currency conversion differences.</li>
              </ul>
            </Section>

            <Section id="howto" title="4. How to request a refund">
              <Card>
                <p className="text-sm">
                  Email{" "}
                  <a className="underline" href={`mailto:${company.contact}`}>
                    {company.contact}
                  </a>{" "}
                  with the subject <strong>“Refund Request”</strong>, and include: full name, contact
                  number, payment reference/transaction ID, service purchased, and a short reason for
                  the request.
                </p>
              </Card>
            </Section>

            <Section id="timelines" title="5. Processing timelines">
              <ul className="list-disc pl-5 space-y-1">
                <li>We typically acknowledge requests promptly after verification.</li>
                <li>
                  Approved refunds are usually processed to the original payment method within{" "}
                  <strong>7–14 business days</strong> (bank timelines may vary).
                </li>
              </ul>
            </Section>

            <Section id="cancellations" title="6. Cancellations">
              <p>
                For cancellations before service commencement, a full or partial refund may be
                available depending on the scope and preparatory work already performed. Once
                substantive work has started, cancellations may incur deductions.
              </p>
            </Section>

            <Section id="chargebacks" title="7. Chargebacks">
              <p>
                If you dispute a payment with your bank or card issuer, please notify us so we can
                investigate. Unauthorized or fraudulent transactions will be addressed per issuer
                rules; otherwise, chargebacks may delay resolution.
              </p>
            </Section>

            <Section id="law" title="8. Governing law">
              <p>
                This Refund Policy is governed by the laws of India. Courts in Bengaluru, Karnataka
                shall have exclusive jurisdiction over any disputes arising from or relating to this
                policy.
              </p>
            </Section>

            <Section id="contact" title="9. Contact">
              <p>
                Questions about this policy? Email{" "}
                <a className="underline" href={`mailto:${company.contact}`}>
                  {company.contact}
                </a>{" "}
                or write to {company.name}, {company.city}, {company.state}, {company.country}.
              </p>
            </Section>

            <Section id="changes" title="10. Changes to this policy">
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