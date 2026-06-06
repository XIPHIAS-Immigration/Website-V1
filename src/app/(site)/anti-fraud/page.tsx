// FILE: src/app/(site)/anti-fraud/page.tsx
import type { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React from "react";

// ✅ Keep one canonical domain everywhere
const SITE_URL = "https://www.xiphiasimmigration.com";

// ───────────────── SEO METADATA ─────────────────
export const metadata: Metadata = {
  title: "Anti-fraud Notice · XIPHIAS Immigration Private Limited",
  description:
    "Protect yourself from scams. Learn how to verify genuine communication from XIPHIAS Immigration Private Limited and report suspected fraud.",
  alternates: { canonical: "/anti-fraud" },
  robots: { index: true, follow: true },

  // ✅ Add OG image here so this page doesn't lose the global OG image
  openGraph: {
    title: "Anti-fraud Notice · XIPHIAS Immigration Private Limited",
    description:
      "How to identify scams, what we never ask for, and how to verify official contact from XIPHIAS Immigration Private Limited.",
    url: `${SITE_URL}/anti-fraud`,
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
    title: "Anti-fraud Notice · XIPHIAS Immigration Private Limited",
    description:
      "How to identify scams, what we never ask for, and how to verify official contact from XIPHIAS Immigration Private Limited.",
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
export default function AntiFraudPage() {
  const effectiveDate = "09 Oct 2025";

  const company = {
    name: "XIPHIAS Immigration Private Limited",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    site: SITE_URL,
    contact: "immigration@xiphias.in",
    report: "immigration@xiphias.in",
    domain: "xiphiasimmigration.com",
  } as const;

  const toc = [
    { id: "overview", label: "Overview" },
    { id: "scams", label: "Common scam patterns" },
    { id: "verify", label: "How to verify us" },
    { id: "never", label: "What we never do" },
    { id: "report", label: "Report suspected fraud" },
    { id: "evidence", label: "Collecting evidence" },
    { id: "legal", label: "Legal disclaimer" },
    { id: "contact", label: "Contact" },
    { id: "updates", label: "Updates" },
  ];

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${company.site}/anti-fraud#webpage`,
    name: "Anti-fraud Notice",
    url: `${company.site}/anti-fraud`,
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
        name: "Anti-fraud Notice",
        item: `${company.site}/anti-fraud`,
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
                Anti-fraud Notice
              </h1>
              <p className="mt-2 text-sm/6 opacity-80">Effective: {effectiveDate}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Identify common scam patterns targeting immigration aspirants.</li>
                    <li>Verify genuine communication from {company.name}.</li>
                    <li>Report suspicious activity to our team.</li>
                  </ul>
                </Card>

                <Card>
                  <p className="text-sm">
                    Related policies:{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>{" "}
                    ·{" "}
                    <Link href="/terms" className="underline">
                      Terms of Use
                    </Link>{" "}
                    ·{" "}
                    <Link href="/contact" className="underline">
                      Disclaimer
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
            <Section id="overview" title="1. Overview">
              <p>
                Fraudsters may impersonate {company.name} or claim affiliation to solicit money,
                personal information, or documents. This page explains how to protect yourself and how
                to confirm that a message is genuinely from us.
              </p>
            </Section>

            <Section id="scams" title="2. Common scam patterns">
              <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/40 p-4 backdrop-blur-sm">
                <table className="min-w-[800px] w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-semibold">Pattern</th>
                      <th className="p-2 text-left font-semibold">Red flags</th>
                      <th className="p-2 text-left font-semibold">What to do</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Unsolicited job offers / visa guarantees</td>
                      <td className="p-2">
                        “Guaranteed visa/job”, pressure to pay immediately, unrealistic salary
                      </td>
                      <td className="p-2">Do not pay. Verify sender domain and contact us.</td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Payments to personal accounts or wallets</td>
                      <td className="p-2">UPI/crypto/personal bank details shared on chat apps</td>
                      <td className="p-2">
                        We accept payments only via official company accounts and invoices.
                      </td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">WhatsApp/Telegram impersonation</td>
                      <td className="p-2">
                        Display names without our domain email, blurry IDs, no company signature
                      </td>
                      <td className="p-2">
                        Ask for a confirmation email from <strong>@{company.domain}</strong>.
                      </td>
                    </tr>
                    <tr className="border-t border-black/10 dark:border-white/20">
                      <td className="p-2">Document forgery offers</td>
                      <td className="p-2">“We can expedite / influence decisions”</td>
                      <td className="p-2">Report immediately. We never engage in such practices.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="verify" title="3. How to verify you’re dealing with us">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Email domain:</strong> Official emails come from{" "}
                  <strong>@{company.domain}</strong>. If in doubt, forward to{" "}
                  <a className="underline" href={`mailto:${company.report}`}>
                    {company.report}
                  </a>{" "}
                  for verification.
                </li>
                <li>
                  <strong>Invoices & receipts:</strong> Issued on {company.name} letterhead only;
                  payments are accepted to company bank accounts—never personal accounts or wallets.
                </li>
                <li>
                  <strong>Website:</strong> Confirm links resolve to{" "}
                  <a className="underline" href={company.site}>
                    {company.site.replace("https://", "")}
                  </a>
                  .
                </li>
                <li>
                  <strong>Call-back:</strong> If contacted on chat apps, request a confirmation email and
                  a scheduled call via official channels.
                </li>
              </ul>
            </Section>

            <Section id="never" title="4. What we will never do">
              <ul className="list-disc pl-5 space-y-1">
                <li>Guarantee a visa, job placement, or government outcome.</li>
                <li>Ask you to pay to a private/personal account or via anonymous wallets.</li>
                <li>Request your full card PIN, one-time passwords, or banking passwords.</li>
                <li>Offer to alter or forge documents.</li>
              </ul>
            </Section>

            <Section id="report" title="5. Report suspected fraud">
              <Card>
                <p className="text-sm">
                  Email{" "}
                  <a className="underline" href={`mailto:${company.report}`}>
                    {company.report}
                  </a>{" "}
                  with the subject <strong>“Suspected Fraud”</strong>. Include the sender
                  address/phone, screenshots, payment instructions received, and any links or
                  attachments you were sent.
                </p>
              </Card>
              <p className="mt-3 text-sm">
                If you have already paid, also contact your bank/payment provider immediately to try to
                stop or dispute the transaction.
              </p>
            </Section>

            <Section id="evidence" title="6. Collecting useful evidence">
              <ul className="list-disc pl-5 space-y-1">
                <li>Full email headers or chat exports (showing addresses, timestamps, and IDs).</li>
                <li>Screenshots of conversations and payment requests.</li>
                <li>Account details to which payment was requested (bank name, UPI ID, wallet).</li>
                <li>Any files or links sent by the suspected fraudster.</li>
              </ul>
            </Section>

            <Section id="legal" title="7. Legal disclaimer">
              <p>
                {company.name} is not responsible for losses arising from dealings with unaffiliated
                third parties or impersonators. We will cooperate with authorities where appropriate and
                may provide information to aid investigations.
              </p>
            </Section>

            <Section id="contact" title="8. Contact">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold mb-2">Report fraud</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a className="underline" href={`mailto:${company.report}`}>
                      {company.report}
                    </a>
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-2">Privacy enquiries</h3>
                  <p className="text-sm">
                    Email:{" "}
                    <a className="underline" href={`mailto:${company.contact}`}>
                      {company.contact}
                    </a>
                  </p>
                </Card>
              </div>
            </Section>

            <Section id="updates" title="9. Updates to this notice">
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