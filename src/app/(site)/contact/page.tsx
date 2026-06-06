// src/app/contact/page.tsx
import type { Metadata } from "next";
import Script from "next/script";

import ContactHero from "@/components/Contact/ContactHero";
import LocationsDirectory from "@/components/Contact/LocationsDirectory";
import ContactChannels from "@/components/Contact/ContactChannels";
import LeadTabs from "@/components/Contact/LeadTabs";
import MapCard from "@/components/Contact/MapCard";
import CardSlider from "@/components/Home/Hero/slider";

const CANONICAL = "/contact";
const ABSOLUTE_URL = "https://www.xiphiasimmigration.com/contact";

export const revalidate = 86400; // cache for 1 day

export const metadata: Metadata = {
  title: "Contact XIPHIAS | Speak to an Immigration Expert",
  description:
    "Talk to licensed immigration experts at XIPHIAS. Call, WhatsApp, email, or book a callback. Bengaluru HQ with presence in India, UAE, and Canada.",
  keywords: [
    "XIPHIAS Immigration",
    "Contact XIPHIAS",
    "Immigration consultants",
    "Residency by Investment contact",
    "Citizenship by Investment contact",
    "Golden Visa consultants",
    "Global mobility advisors",
  ],
  alternates: {
    canonical: CANONICAL,
    languages: {
      "en": CANONICAL,
      "en-IN": CANONICAL,
      "x-default": CANONICAL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Contact XIPHIAS | Speak to an Immigration Expert",
    description:
      "Fast, discreet, compliant. Call, WhatsApp, email, or book a callback with XIPHIAS Immigration.",
    url: ABSOLUTE_URL,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png", // reuse a known valid image to avoid 404s
        width: 1200,
        height: 630,
        alt: "Contact XIPHIAS Immigration",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact XIPHIAS | Speak to an Immigration Expert",
    description:
      "Talk to licensed experts. Bengaluru HQ with India, UAE & Canada presence.",
    images: ["/xiphias-immigration.png"],
    creator: "@xiphiasimmig",
  },
};

const CONTACT = {
  headline: "Talk to an Immigration Expert",
  sub: "Fast, discreet, compliant. Choose the channel you prefer.",
  phonePrimary: "+91 9021335577",
  phoneAlt: "",
  email: "immigration@xiphias.in",
  whatsapp: "+91 7406006061",
  address: [
    "XIPHIAS IMMIGRATION PVT LTD",
    "Aurbis Prime, 11, Kaveri Regent Coronet",
    "80 Feet Rd, 3rd Block, Koramangala, Bengaluru 560034",
  ],
  hours: "Mon–Sat • 9:00–18:00 IST",
  responseNote: "No obligation · Response within 24 hours",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/xiphias" },
    { label: "Facebook", href: "https://www.facebook.com/xiphias" },
    { label: "Instagram", href: "https://www.instagram.com/xiphias" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],
} as const;

export default function ContactPage() {
  return (
    <main
      id="main"
      className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4 text-black dark:text-white"
    >
      {/* Hero */}
      <ContactHero
        headline={CONTACT.headline}
        sub={CONTACT.sub}
        phone={CONTACT.phonePrimary}
        email={CONTACT.email}
        whatsapp={CONTACT.whatsapp}
        responseNote={CONTACT.responseNote}
        ctaHref="/personal-booking"
        ctaLabel="Book Paid Expert"
        stats={[
          { value: "24h", label: "Average response" },
          { value: "17+", label: "Years experience" },
          { value: "30K+", label: "Consultations" },
        ]}
      />

      {/* Enquiry + Channels */}
      <div className="py-5 space-y-4">
        {/* Cards row: form + contact options */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
         

          {/* Right: contact options */}
          <div className="md:flex-[0.9] flex-1 flex">
            {/* keep sticky behavior inside, doesn't affect equal height */}
            <aside className="lg:sticky lg:top-4 flex-1">
              <ContactChannels
                phone={CONTACT.phonePrimary}
                altPhone={CONTACT.phoneAlt}
                email={CONTACT.email}
                whatsapp={CONTACT.whatsapp}
                address={[...CONTACT.address]}
                hours={CONTACT.hours}
                socials={[...CONTACT.socials]}
                className="h-full"
              />
            </aside>
          </div>
           {/* Left: contact form */}
           <div className="md:flex-1 bg-none">
            <LeadTabs
              id="enquiry"
              emailTo={CONTACT.email}
              phoneFallback={CONTACT.phonePrimary}
            />
          </div>
        </div>

        {/* Map below, full width */}
        <MapCard
          className="hidden sm:block"
          title="Bengaluru HQ"
          query="Aurbis Prime, 80 Feet Road, 3rd Block Koramangala, Bengaluru 560034"
          address={[...CONTACT.address]}
          height={300}
          zoom={14}
        />
      </div>

      {/* Locations (self-contained) */}
      <LocationsDirectory className="mt-8" />

      {/* Slider */}
      <div className="py-10">
        <CardSlider />
      </div>

      {/* JSON-LD */}
      <Script id="contact-jsonld" type="application/ld+json">
        {JSON.stringify(buildContactJsonLd(CONTACT))}
      </Script>
    </main>
  );
}

function buildContactJsonLd(cfg: typeof CONTACT) {
  const org = {
    "@type": ["Organization", "LegalService"],
    name: "XIPHIAS Immigration",
    url: "https://www.xiphiasimmigration.com",
    logo: "https://www.xiphiasimmigration.com/logo.png",
    sameAs: cfg.socials.map((s) => s.href),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: cfg.phonePrimary,
        email: cfg.email ? `mailto:${cfg.email}` : undefined,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: cfg.address[1],
      addressLocality: "Bengaluru",
      addressRegion: "KA",
      postalCode: "560034",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: "Worldwide",
  };

  const contactPage = {
    "@type": "ContactPage",
    name: "Contact XIPHIAS Immigration",
    url: "https://www.xiphiasimmigration.com/contact",
    inLanguage: "en",
    about: { "@id": "#xiphias-org" },
    breadcrumb: { "@id": "#breadcrumb" },
    mainEntity: { "@id": "#xiphias-org" },
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": "#breadcrumb",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.xiphiasimmigration.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://www.xiphiasimmigration.com/contact",
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@id": "#xiphias-org", ...org },
      contactPage,
      breadcrumb,
    ],
  };
}
