// FILE: src/app/(site)/privacy-policy/page.tsx
import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

// ✅ Keep one canonical domain everywhere (matches your layout.tsx metadataBase)
const SITE_URL = "https://www.xiphiasimmigration.com";

// ---------------- SEO METADATA ----------------
export const metadata: Metadata = {
  title: "Privacy Policy · XIPHIAS Immigration Private Limited",
  description:
    "How XIPHIAS Immigration Private Limited collects, uses, shares, and protects your personal data — and how to exercise your privacy rights.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },

  openGraph: {
    title: "Privacy Policy · XIPHIAS Immigration Private Limited",
    description:
      "How we collect, use, share, and protect your personal data — and how to exercise your privacy rights.",
    url: `${SITE_URL}/privacy-policy`,
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
    title: "Privacy Policy · XIPHIAS Immigration Private Limited",
    description:
      "How we collect, use, share, and protect your personal data — and how to exercise your privacy rights.",
    images: ["/xiphias-immigration.png"],
  },
};

// ---------------- SMALL UI HELPERS ----------------
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

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium bg-white border-black/20 text-black dark:bg-black dark:border-white/30 dark:text-white">
    {children}
  </kbd>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium bg-white/70 border-black/10 text-black dark:bg-black/40 dark:border-white/20 dark:text-white">
    {children}
  </span>
);

const DLRow = ({ term, children }: { term: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 py-3 border-t first:border-t-0 border-black/10 dark:border-white/20">
    <dt className="md:col-span-2 text-sm font-semibold text-black dark:text-white">{term}</dt>
    <dd className="md:col-span-3 text-sm text-black dark:text-white">{children}</dd>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm text-black dark:text-white">
    {children}
  </div>
);

const Accordion = ({
  summary,
  children,
  defaultOpen,
}: {
  summary: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => (
  <details
    className="group rounded-lg border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 px-4 py-3 backdrop-blur-sm text-black dark:text-white"
    open={defaultOpen}
  >
    <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-2 text-sm font-semibold">
      <span>{summary}</span>
      <span aria-hidden className="transition-transform group-open:rotate-180">
        ▾
      </span>
    </summary>
    <div className="mt-3 text-sm">{children}</div>
  </details>
);

// --------------- PAGE ---------------
export default function PrivacyPolicyPage() {
  const effectiveDate = "09 Oct 2025"; // keep updated as you version
  const company = {
    name: "XIPHIAS Immigration Private Limited",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    privacyEmail: "immigration@xiphias.in",
    grievanceEmail: "immigration@xiphias.in",
    site: SITE_URL,
  } as const;

  const nav = [
    { id: "overview", label: "Summary" },
    { id: "collection", label: "What we collect" },
    { id: "cookies", label: "Cookies & tracking" },
    { id: "rights", label: "Your rights" },
    { id: "transfers", label: "International transfers" },
    { id: "security", label: "Security" },
    { id: "children", label: "Children" },
    { id: "updates", label: "Updates" },
    { id: "contact", label: "Contact" },
  ];

  // JSON-LD blocks (SEO)
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${company.site}/privacy-policy#webpage`,
    name: "Privacy Policy",
    url: `${company.site}/privacy-policy`,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Privacy Policy",
        item: `${company.site}/privacy-policy`,
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
      <header className="relative border-b border-black/10 dark:border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm/6 opacity-80">Effective: {effectiveDate}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>What personal data we collect and why.</li>
                    <li>How to control cookies and marketing preferences.</li>
                    <li>Your rights under GDPR / CPRA / DPDP.</li>
                    <li>How to contact us or lodge a complaint.</li>
                  </ul>
                </Card>

                <Card>
                  <div className="flex flex-wrap gap-2">
                    <Pill>GDPR / UK GDPR</Pill>
                    <Pill>CCPA / CPRA</Pill>
                    <Pill>India DPDP</Pill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/cookies"
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    >
                      Manage Cookies
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    >
                      Do Not Sell/Share
                    </Link>
                  </div>
                  <p className="mt-2 text-xs opacity-70">
                    Use these links to change your preferences at any time.
                  </p>
                </Card>
              </div>
            </div>

            {/* Right rail (desktop) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav aria-label="On this page" className="sticky top-28">
                <p className="text-xs uppercase tracking-wide opacity-70 mb-2">
                  On this page
                </p>
                <ul className="space-y-1">
                  {nav.map((n) => (
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
            <Section id="overview" title="Who we are">
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard personal data
                when you use our website and services.
              </p>

              <dl className="mt-6">
                <DLRow term="Controller">
                  {company.name}, {company.city}, {company.state}, {company.country}
                </DLRow>
                <DLRow term="Data Protection Officer">
                  Not applicable. Contact our Privacy Team at{" "}
                  <a className="underline" href={`mailto:${company.privacyEmail}`}>
                    {company.privacyEmail}
                  </a>
                  .
                </DLRow>
                <DLRow term="India: Grievance Officer">
                  <a className="underline" href={`mailto:${company.grievanceEmail}`}>
                    {company.grievanceEmail}
                  </a>{" "}
                  (we aim to respond within statutory timelines)
                </DLRow>
              </dl>
            </Section>

            <Section id="collection" title="What we collect & why we collect it">
              <p className="mb-4">
                We collect the following categories of data for the purposes described below.
              </p>

              <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 backdrop-blur-sm">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="p-3 font-semibold">Data category</th>
                      <th className="p-3 font-semibold">Purpose</th>
                      <th className="p-3 font-semibold">Legal basis / CPRA</th>
                      <th className="p-3 font-semibold">Retention</th>
                      <th className="p-3 font-semibold">Recipients</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-3 font-medium">Account & contact</td>
                      <td className="p-3">Create/manage your account; respond to enquiries.</td>
                      <td className="p-3">Contract; legitimate interests (service operations).</td>
                      <td className="p-3">For as long as you have an account + 24 months.</td>
                      <td className="p-3">Hosting, CRM, support vendors.</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-3 font-medium">Usage & device</td>
                      <td className="p-3">Analytics; improve performance and UX.</td>
                      <td className="p-3">
                        Consent (cookies/SDKs) where required; legitimate interests.
                      </td>
                      <td className="p-3">12–24 months aggregated.</td>
                      <td className="p-3">Analytics providers, A/B testing tools.</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-3 font-medium">Marketing preferences</td>
                      <td className="p-3">Send newsletters and offers; measure effectiveness.</td>
                      <td className="p-3">Consent (opt-in); right to withdraw at any time.</td>
                      <td className="p-3">Until you unsubscribe + 24 months logs.</td>
                      <td className="p-3">Email service providers; advertising partners.</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-3 font-medium">Support & chat transcripts</td>
                      <td className="p-3">Troubleshoot issues; quality assurance.</td>
                      <td className="p-3">Legitimate interests; contract.</td>
                      <td className="p-3">Up to 36 months unless required longer.</td>
                      <td className="p-3">Customer support platforms.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-3">
                <Accordion summary="Sensitive personal information (SPI) handling">
                  <p>
                    We do not intentionally collect SPI (e.g., government IDs) unless you provide it
                    for compliance. Where collected, we restrict use, apply additional safeguards,
                    and honor applicable rights to limit use of SPI.
                  </p>
                </Accordion>

                <Accordion summary="International disclosures">
                  <p>
                    If we transfer data outside your jurisdiction, we use appropriate safeguards such
                    as Standard Contractual Clauses or equivalent mechanisms.
                  </p>
                </Accordion>
              </div>
            </Section>

            <Section id="cookies" title="Cookies & tracking">
              <p>
                We use essential cookies to make the site work and optional cookies/SDKs for analytics
                and advertising. You can change your preferences any time via{" "}
                <Link href="/cookies" className="underline">
                  Cookies Policy
                </Link>
                .
              </p>
              <ul className="list-disc pl-5 mt-3">
                <li>
                  <strong>Essential:</strong> security, load balancing, session management.
                </li>
                <li>
                  <strong>Analytics:</strong> page views, feature usage, performance.
                </li>
                <li>
                  <strong>Advertising:</strong> measurement, frequency capping, personalization.
                </li>
              </ul>
            </Section>

            <Section id="rights" title="Your privacy rights">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold mb-2">EU/UK (GDPR)</h3>
                  <p className="text-sm">
                    Access, rectify, erase, restrict, object, and data portability; lodge a complaint
                    with a supervisory authority.
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-2">California (CCPA/CPRA)</h3>
                  <p className="text-sm">
                    Right to know/delete/correct, opt-out of sale/share, and limit use of sensitive
                    personal information.
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-2">India (DPDP)</h3>
                  <p className="text-sm">
                    Withdraw consent, access/correct/erase, grievance redressal; nominate an alternate
                    contact for rights requests.
                  </p>
                </Card>
              </div>
              <p className="text-sm mt-4">
                To exercise your rights, email{" "}
                <a href={`mailto:${company.privacyEmail}`} className="underline">
                  {company.privacyEmail}
                </a>
                . We may request additional information to verify your identity and will respond
                within applicable timelines.
              </p>
            </Section>

            <Section id="transfers" title="International data transfers">
              <p>
                Where we transfer personal data across borders, we implement safeguards such as
                Standard Contractual Clauses, adequacy decisions, or other lawful mechanisms. You can
                request a copy of relevant safeguards by contacting us.
              </p>
            </Section>

            <Section id="security" title="How we secure your data">
              <ul className="list-disc pl-5">
                <li>Encryption in transit; restricted access on a need-to-know basis.</li>
                <li>Vendor due diligence and contractual controls.</li>
                <li>Organizational measures: policies, training, and incident response.</li>
              </ul>
              <p className="mt-3 text-sm opacity-80">
                No method of transmission or storage is 100% secure. We will notify users and/or
                regulators where required by law in the event of a breach.
              </p>
            </Section>

            <Section id="children" title="Children’s privacy">
              <p>
                Our services are not directed to children. If you believe a child provided personal
                data, contact us so we can take appropriate action. Where parental consent is
                required, we will not process a child’s data without verifiable consent.
              </p>
            </Section>

            <Section id="updates" title="Changes to this policy">
              <p>
                We may update this policy from time to time. If we make material changes, we will
                notify you by email and/or a prominent notice on our site. The date at the top
                indicates when this policy was last updated.
              </p>
              <Card>
                <h3 className="text-sm font-semibold mb-2">Version history</h3>
                <ul className="text-sm list-disc pl-5">
                  <li>v1.0 — 09 Oct 2025: Initial publication.</li>
                </ul>
              </Card>
            </Section>

            <Section id="contact" title="Contact us">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold mb-2">General privacy enquiries</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a href={`mailto:${company.privacyEmail}`} className="underline">
                      {company.privacyEmail}
                    </a>
                    <br />
                    Address: {company.name}, {company.city}, {company.state}, {company.country}
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-2">India grievance officer</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a href={`mailto:${company.grievanceEmail}`} className="underline">
                      {company.grievanceEmail}
                    </a>
                    <br />
                    We aim to acknowledge queries promptly and resolve them within statutory timelines.
                  </p>
                </Card>
              </div>
            </Section>

            <div className="pt-6 text-xs opacity-80">
              <p>
                This page is provided for informational purposes and does not constitute legal advice.
                Consult counsel to tailor it to your operations, vendors, and jurisdictions.
              </p>
            </div>
          </div>

          {/* Mobile in-page nav */}
          <div className="lg:col-span-3">
            <div className="lg:hidden sticky top-24 border rounded-xl border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-2">On this page</p>
              <div className="flex flex-wrap gap-2">
                {nav.map((n) => (
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

      {/* Keyboard help */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 text-xs backdrop-blur-sm">
          <p className="mb-1 font-semibold">Pro tip</p>
          <p>
            Use <Kbd>Alt</Kbd> + <Kbd>↑</Kbd>/<Kbd>↓</Kbd> to jump between headings in many browsers, or
            use the right-rail links.
          </p>
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