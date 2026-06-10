// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Inter, Sora } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import MDXProviders from "@/components/MDX/MDXProviders";
import SiteChrome from "@/components/Layout/SiteChrome";
// Import dynamic to load client‑only components
// The GlobalBrochureGate component is a client component. We import it
// directly here — Next.js will treat it as a client boundary.

// ✅ GA4 components


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.xiphiasimmigration.com"),
  applicationName: "XIPHIAS Immigration",
  generator: "Next.js",

  // ✅ Correct manifest link (Next serves src/app/manifest.ts as /manifest.webmanifest)
  manifest: "/manifest.webmanifest",

  title: {
    default: "XIPHIAS Immigration – Residency, Citizenship & Global Mobility",
    template: "%s | XIPHIAS Immigration",
  },
  description:
    "Trusted advisors for Residency by Investment, Citizenship by Investment, Skilled Immigration, and Corporate Mobility across 25+ countries.",

  referrer: "strict-origin-when-cross-origin",

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

  formatDetection: { telephone: false, email: false, address: false },

  // ✅ IMPORTANT:
  // Do NOT set canonical: "/" globally in layout.
  // Each page should set its own canonical (or omit and let Google decide).
  alternates: {
    languages: { en: "/", "en-IN": "/" },
  },

  openGraph: {
    title: "XIPHIAS Immigration",
    description:
      "Residency & Citizenship solutions for high-net-worth individuals and global enterprises.",
    url: "https://www.xiphiasimmigration.com",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "XIPHIAS Immigration – Residency & Citizenship by Investment",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "XIPHIAS Immigration",
    description:
      "Residency & Citizenship solutions for HNWIs and enterprises.",
    images: ["/xiphias-immigration.png"],
    creator: "@xiphiasimmig",
  },

  icons: {
    icon: [
      // ✅ Correct sizes + types
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      // ✅ mask-icon must be an SVG and must exist in /public, otherwise remove it.
      {
        url: "/xiphias-immigration.svg",
        rel: "mask-icon",
        color: "#0f3a84",
      },
    ],
  },

  appleWebApp: {
    title: "XIPHIAS Immigration",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

// Safer JSON stringify for embedding inside <script> tags.
// Escapes "<" to avoid any chance of closing the script tag via string content.
function safeJsonStringify(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\u003c");
}

// Global JSON-LD (site-wide)
const SITE = "https://www.xiphiasimmigration.com";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE}/#organization`,
  name: "XIPHIAS Immigration",
  url: SITE,
  logo: `${SITE}/images/logo/xiphias-immigration.png`,
  image: `${SITE}/xiphias-immigration.png`,
  sameAs: [
    "https://www.linkedin.com/company/xiphias-immigration/",
    "https://www.facebook.com/xiphias",
    "https://www.instagram.com/xiphias",
    "https://twitter.com/xiphiasimmig",
  ],
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Aurbis Prime, 11, Kaveri Regent Coronet, 80 Feet Road, 3rd Block, Koramangala",
    addressLocality: "Bengaluru",
    addressRegion: "KA",
    postalCode: "560034",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+919021335577",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  ],
  knowsAbout: ["Residency by Investment", "Citizenship by Investment", "Skilled Immigration", "Corporate Mobility"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "XIPHIAS Immigration",
  publisher: { "@id": `${SITE}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${lato.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-black focus:text-white focus:px-3 focus:py-2"
        >
          Skip to main content
        </a>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <MDXProviders>
              <SiteChrome gaId={GA_ID}>
                {children}
              </SiteChrome>
            </MDXProviders>
        </ThemeProvider>

        {/* ✅ GA4 */}

        {/* JSON-LD */}
        <script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(orgJsonLd) }}
        />
        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
