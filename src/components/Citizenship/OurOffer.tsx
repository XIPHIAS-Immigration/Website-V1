// src/components/Citizenship/OurOffer.tsx
import React from "react";
import Link from "next/link";
import Script from "next/script";

type Props = {
  /** Bulleted value props shown in the list */
  bullets?: string[];
  /** Primary CTA */
  primaryHref?: string;
  primaryText?: string;
  /** Secondary CTA (pdf supported) */
  secondaryHref?: string;
  secondaryText?: string;
  /** Optional title (defaults to "Why work with us") */
  title?: string;
  /** Optional short blurb under the title for context (SEO + UX) */
  subtitle?: string;
  /** Visual tweaks */
  className?: string;
  align?: "left" | "center";
  /** Optional SEO overrides */
  seo?: {
    serviceName?: string;
    serviceDescription?: string;
    priceCurrency?: string; // default USD
    offerPrice?: number; // default 0 for free consult
    brandName?: string; // your firm name for Service.brand
  };
};

export default function OurOffer({
  bullets = [
    "Dedicated due-diligence desk and source-of-funds guidance.",
    "Government-approved project vetting and exit planning.",
    "End-to-end execution: strategy, documentation, submission, oath & passports.",
    "Confidential handling and white-glove concierge for families.",
  ],
  primaryHref = "/personal-booking",
  primaryText = "Speak to an Advisor",
  secondaryHref = "/images/residency/xiphias-corporate-mobility.pdf",
  secondaryText = "Download Checklist",
  title = "Why work with us",
  subtitle = "A private-client approach to second citizenship: transparent costs, rigorous compliance, and execution without friction.",
  className = "",
  align = "left",
  seo = {},
}: Props) {
  const isPdf =
    typeof secondaryHref === "string" &&
    secondaryHref.toLowerCase().endsWith(".pdf");
  const headingId = "our-offer-heading";

  // --- SEO defaults ---
  const serviceName = seo.serviceName ?? "Citizenship by Investment Advisory";
  const serviceDescription =
    seo.serviceDescription ??
    "Concierge guidance across donation, real-estate, and bond routes with transparent costs, compliance, and end-to-end execution.";
  const priceCurrency = seo.priceCurrency ?? "USD";
  const offerPrice = typeof seo.offerPrice === "number" ? seo.offerPrice : 0;
  const brandName = seo.brandName ?? "Our Advisory";

  // JSON-LD (Service + Offer + ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: serviceDescription,
    brand: { "@type": "Brand", name: brandName },
    areaServed: "Worldwide",
    offers: {
      "@type": "Offer",
      name: primaryText,
      url: primaryHref,
      price: offerPrice,
      priceCurrency,
      availability: "https://schema.org/InStock",
      category: "Consultation",
    },
    hasPart: {
      "@type": "ItemList",
      itemListElement: bullets.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b,
      })),
    },
  };

  const alignCls =
    align === "center" ? "text-center md:max-w-3xl mx-auto" : "text-left";

  return (
    <section
      aria-labelledby={headingId}
      className={[
        "relative overflow-hidden rounded-3xl p-6 md:p-8",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        "text-black dark:text-white",
        className,
      ].join(" ")}
      itemScope
      itemType="https://schema.org/Service"
    >
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <Script
        id="our-offer-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <meta itemProp="name" content={serviceName} />
      <meta itemProp="serviceType" content="ProfessionalService" />
      <meta itemProp="areaServed" content="Worldwide" />
      <meta itemProp="brand" content={brandName} />
      <meta itemProp="description" content={serviceDescription} />

      <div className={`relative ${alignCls}`}>
        <h2
          id={headingId}
          className="text-xl md:text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>

        {subtitle ? (
          <p
            className="mt-2 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300"
            itemProp="description"
          >
            {subtitle}
          </p>
        ) : null}

        {/* Benefits list (ItemList microdata) */}
        <ol
          className="mt-4 grid gap-2.5 sm:grid-cols-2"
          itemScope
          itemType="https://schema.org/ItemList"
          aria-label="Key benefits"
        >
          {bullets.map((b, i) => (
            <li
              key={b}
              className="flex items-start gap-2 rounded-xl bg-white/85 dark:bg-white/5 ring-1 ring-blue-100/80 dark:ring-blue-900/40 px-3 py-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(i + 1)} />
              <CheckIcon />
              <span className="text-sm leading-6" itemProp="name">
                {b}
              </span>
            </li>
          ))}
        </ol>

        {/* CTAs */}
        <div
          className={`mt-5 flex flex-wrap items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
        >
          <Link
            href={primaryHref}
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
            aria-label={primaryText}
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content={priceCurrency} />
            <meta itemProp="price" content={String(offerPrice)} />
            <meta
              itemProp="availability"
              content="https://schema.org/InStock"
            />
            {primaryText}
            <ArrowRight />
          </Link>

          {isPdf ? (
            <a
              href={secondaryHref}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
              aria-label={secondaryText}
              rel="noopener"
            >
              <Download />
              {secondaryText}
            </a>
          ) : (
            <Link
              href={secondaryHref}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
              aria-label={secondaryText}
            >
              <Open />
              {secondaryText}
            </Link>
          )}

          <span className="ml-0 md:ml-2 text-xs text-zinc-500 dark:text-zinc-400">
            No obligation · Response within 24 hours
          </span>
        </div>

        {/* Trust chips (optional, subtle credibility cues) */}
        <ul
          className={`mt-4 flex flex-wrap gap-2 ${align === "center" ? "justify-center" : ""}`}
        >
          <Chip>Licensed local agents</Chip>
          <Chip>KYC/AML workflows</Chip>
          <Chip>Transparent fee schedule</Chip>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- UI bits ------------------------------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full bg-white/80 dark:bg-white/5 px-3 py-1 text-xs ring-1 ring-blue-200 dark:ring-blue-800/60">
      {children}
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-1 h-4 w-4 shrink-0 fill-blue-600 dark:fill-blue-400"
    >
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function Download() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M12 3.75a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L6.97 11.03a.75.75 0 0 1 1.06-1.06l2.72 2.72V4.5A.75.75 0 0 1 12 3.75zM4.5 18a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2a.75.75 0 0 1 1.5 0v2A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3v-2a.75.75 0 0 1 1.5 0v2z"
      />
    </svg>
  );
}
function Open() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 0 0 2h3.586l-7.293 7.293a1 1 0 0 0 1.414 1.414L19 6.414V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4a1 1 0 1 0-2 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2H5z"
      />
    </svg>
  );
}
