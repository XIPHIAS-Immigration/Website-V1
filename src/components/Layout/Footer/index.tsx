// ============================
// FILE: src/components/Layout/Footer/index.tsx
// Final compact footer — App QR kept, ONE newsletter, multi-office support
// Tailwind-only, accessible, NO <section> tags
// ============================
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import LogoWhite from "@/components/Layout/Header/LogoWhite/index";

// --------- Groups (landing links only) ----------
const EXPLORE = [
  { label: "Residency", href: "/residency" },
  { label: "Citizenship", href: "/citizenship" },
  { label: "Corporate", href: "/corporate" },
  { label: "Skilled", href: "/skilled" },
];

const RESOURCES = Object.freeze([
  { label: "Eligibility Checker", href: "/eligibility" },
  { label: "Guides & Resources", href: "/guide" },
  { label: "Insights", href: "/insights" },
  { label: "Events", href: "/event" },
  { label: "Awards & Recognition", href: "/awards" },
  { label: 'Partner With Us', href: '/partner-with-us' },
  { label: 'Reviews', href: '/reviews' },
]);


const COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Articles", href: "/articles" },
  { label: "News", href: "/news" },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
];

const LEGAL = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refunds" },
  { label: "Anti-fraud Notice", href: "/anti-fraud" },
  { label: "Cookies Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

// Add as many offices as you want — UI wraps automatically
const OFFICES = [
  {
    name: "Bengaluru HQ",
    street: "Aurbis Prime, 11 Kaveri Regent Coronet, 80 ft Rd, 3rd Blk, Koramangala",
    city: "Bengaluru",
    postal: "560034",
    country: "India",
    hours: "Mon–Sat, 9:30–18:30",
    phone: "+91 9021335577",
    maps: "https://maps.google.com/?q=Aurbis+Prime+Kaveri+Regent+Coronet+Koramangala+Bengaluru+560034",
  },
  {
    name: "Gurugram",
    street: "Augusta Point, Golf Course Rd, near Parsvnath Exotica, DLF Phase 5, Sector 53",
    city: "Gurugram",
    postal: "122002",
    country: "India",
    hours: "Mon–Sat, 9:30–18:30",
    phone: "+91 96675 20211",
    maps: "https://maps.google.com/?q=Augusta+Point+Golf+Course+Road+DLF+Phase+5+Sector+53+Gurugram+122002",
  },
  {
    name: "Dubai",
    street: "Unit 608, Platinum Tower, JLT-PH1-I2, Jumeirah Lakes Towers",
    city: "Dubai",
    postal: "",
    country: "UAE",
    hours: "Sun–Thu, 9:00–18:00",
    phone: "+971-527 275 101",
    maps: "https://maps.google.com/?q=Platinum+Tower+JLT+Dubai",
  },

  {
    name: "Qatar",
    street: "ILC LLC, Office 3402, Al Jazeera Tower, Conference Center Rd, West Bay",
    city: "Doha",
    postal: "",
    country: "Qatar",
    hours: "Sun–Thu, 9:00–18:00",
    phone: "+974 4476 0562",
    maps: "https://maps.google.com/?q=Al+Jazeera+Tower+West+Bay+Doha",
  },
  {
    name: "Australia",
    street: "SSCS-Suite 204, 227 Collins Street, Melbourne, Vic – 3000.",
    city: "",
    postal: "",
    country: "Australia",
    hours: "Mon–Sat, 9:00–17:00",
    phone: "+61 451 239 239",
    maps: "https://maps.google.com/?q=NextGen+Group+Level+2/415+Bourke+St+Melbourne+VIC+3000+Australia",
  },
  {
    name: "Canada (Waterloo)",
    street: "3-133 Weber St N, Suite 514",
    city: "Waterloo, ON",
    postal: "N2J 3G9",
    country: "Canada",
    hours: "Mon–Sat, 9:00–17:00",
    phone: "+1 438 379 9101",
    maps: "https://maps.google.com/?q=3-133+Weber+St+N+Suite+514+Waterloo+ON+N2J+3G9",
  },

];


const PAYMENTS = [
  { src: "/images/footer/PaymentMethod/Amex.png", alt: "Amex" },
  { src: "/images/footer/PaymentMethod/GooglePay.png", alt: "Google Pay" },
  { src: "/images/footer/PaymentMethod/Maestro.png", alt: "Maestro" },
  { src: "/images/footer/PaymentMethod/PayPal.png", alt: "PayPal" },
  { src: "/images/footer/PaymentMethod/Stripe.png", alt: "Stripe" },
];

// ---- Socials data (yours) ----
const SOCIALS = [
  { href: "https://www.youtube.com/@immigrationxiphias5228", label: "YouTube", icon: "mdi:youtube" },
  { href: "https://www.linkedin.com/company/xiphias-immigration-pvt-limited?trk=prof-following-company-logo", label: "LinkedIn", icon: "mdi:linkedin" },
  { href: "https://www.facebook.com/xiphiasimmigration", label: "Facebook", icon: "mdi:facebook" },
  { href: "https://www.instagram.com/xiphias.immigration/", label: "Instagram", icon: "mdi:instagram" },
  { href: "https://x.com/XiphiasInfo", label: "X (Twitter)", icon: "mdi:twitter" },
] as const;

// Hover styles per network (kept from your UI)
const HOVER: Record<string, string> = {
  YouTube: "hover:bg-red-500/15 hover:ring-red-400/40 hover:text-red-300",
  LinkedIn: "hover:bg-sky-500/15 hover:ring-sky-400/40 hover:text-sky-200",
  Facebook: "hover:bg-blue-500/15 hover:ring-blue-400/40 hover:text-blue-200",
  Instagram: "hover:bg-pink-500/15 hover:ring-pink-400/40 hover:text-pink-200",
  "X (Twitter)": "hover:bg-slate-300/15 hover:ring-slate-300/40 hover:text-slate-100",
};

// CTA text per network
const CTA: Record<string, string> = {
  YouTube: "Subscribe",
  Facebook: "Like",
  default: "Follow",
};

const PRESS = [
  "/images/footer/cnm.png",
  "/images/footer/money-control.png",
  "/images/footer/ndtv.png",
  "/images/footer/the-times-of-india.png",
  "/images/footer/the-worlds-times.png",
];

// ---------- Mobile Collapsible (div-only) ----------
function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const panelId = `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/15 md:border-none" aria-label={title}>
      <h3 className="md:mb-2.5 lg:mb-3">
        <button
          type="button"
          className="w-full flex items-center justify-between py-3 md:py-0 text-left text-white font-semibold text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:cursor-default"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{title}</span>
          <Icon
            icon="mdi:chevron-down"
            className={`md:hidden h-5 w-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div id={panelId} className={`md:block ${open ? "block" : "hidden"}`} role="region" aria-label={`${title} links`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  // Newsletter state
  const [email, setEmail] = React.useState("");
  const [honeypot, setHoneypot] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");
      setStatusMessage(null);

      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email,
          source: "footer", // helps you track where it came from
          hp: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setStatusMessage(
        "Thanks for subscribing! Please check your inbox for a confirmation email."
      );
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(
        err?.message || "Unable to subscribe right now. Please try again later."
      );
    }
  };
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.xiphiasimmigration.com#org",
        name: "XIPHIAS Immigration",
        url: "https://www.xiphiasimmigration.com",
        logo: "https://www.xiphiasimmigration.com/images/logo/xiphias-immigration.png",
        sameAs: SOCIALS.map(s => s.href),
        contactPoint: [
          { "@type": "ContactPoint", contactType: "sales", email: "immigration@xiphias.in" },
          { "@type": "ContactPoint", contactType: "support", email: "immigration@xiphias.in" },
        ],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1200" },
      },
      {
        "@type": "WebSite",
        name: "XIPHIAS Immigration",
        url: "https://www.xiphiasimmigration.com",
        potentialAction: {
          "@type": "SubscribeAction",
          target: "https://www.xiphiasimmigration.com/api/newsletter/subscribe",
        },
      },
    ],
  } as const;

  return (
    <footer role="contentinfo" aria-label="Site footer" className="relative text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-900 dark:via-indigo-800 dark:to-black" />

      <div className="relative container mx-auto px-4 md:px-6 lg:max-w-screen-4xl">
        {/* ===== Conversion Bar ===== */}
        <div className="pt-8">
          <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-md p-3.5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Link
                  href="/eligibility"
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-md text-sm font-medium bg-white text-blue-700 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <Icon icon="mdi:clipboard-check-outline" className="h-5 w-5 mr-2" />
                  Free Eligibility Assessment
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-md text-sm font-medium bg-white/15 hover:bg-white/25 border border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <Icon icon="mdi:calendar-clock" className="h-5 w-5 mr-2" />
                  Book free Consultation
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {[
                  { href: "tel:+91-9021335577", icon: "mdi:phone", label: "+91-9021335577" },
                  { href: "https://wa.me/919021335577", icon: "mdi:whatsapp", label: "WhatsApp", ext: true },
                  { href: "mailto:immigration@xiphias.in", icon: "mdi:email-outline", label: "Email" },
                ].map(({ href, icon, label, ext }) => (
                  <Link
                    key={label}
                    href={href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] bg-white/15 hover:bg-white/25 border border-white/20"
                  >
                    <Icon icon={icon} className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Brand + ONE Newsletter ===== */}
        <div className="py-6 border-b border-white/15">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7">
              <LogoWhite />
              <p className="mt-3 text-white/85 text-[13.5px] lg:text-sm max-w-2xl">
                Advisory for global mobility, corporate setup, and skilled migration with transparent
                processes, timelines, and support.
              </p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/90 text-[12px]">
                <li className="inline-flex items-center gap-1">
                  <Icon icon="mdi:star" className="w-4 h-4" />
                  <strong>4.8/5</strong> · 10,000+ reviews{" "}
                  <Link href="https://g.page/r/CTH8DQwm1lYnEAE/review" className="underline underline-offset-4 hover:text-white">
                    (Google)
                  </Link>
                </li>
                <li className="opacity-75">•</li>
                <li className="inline-flex items-center gap-1">
                  <Icon icon="mdi:shield-check" className="w-4 h-4" /> Secure payments
                </li>
              </ul>
            </div>

            {/* Single newsletter (only here) */}
            <div className="md:col-span-5 md:flex md:justify-end">
              <div aria-label="Subscribe" className="w-full md:max-w-sm rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5">
                <h3 className="text-white/95 text-sm font-semibold mb-2">Subscribe</h3>
                <form onSubmit={handleNewsletterSubmit} noValidate>
                  <label htmlFor="footer-email" className="sr-only">
                    Email address
                  </label>

                  <div className="flex items-stretch rounded-full overflow-hidden ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-white/40">
                    <input
                      id="footer-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder="you@email.com"
                      required
                      className="flex-1 min-w-0 px-3 h-10 bg-transparent text-white placeholder-white/70 outline-none"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status !== "idle") {
                          setStatus("idle");
                          setStatusMessage(null);
                        }
                      }}
                      disabled={status === "loading"}
                    />

                    <button
                      type="submit"
                      className="px-4 h-10 text-sm font-medium text-black bg-secondary focus-visible:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={!email || status === "loading"}
                    >
                      {status === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                  </div>

                  <input
                    type="text"
                    name="hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <p className="mt-1.5 text-[11px] text-white/75">
                    Weekly insights. No spam. By subscribing, you consent to our{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>.
                  </p>

                  {statusMessage && (
                    <p
                      className={`mt-1 text-[11px] ${
                        status === "success" ? "text-emerald-200" : "text-red-200"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}
                </form>

              </div>
            </div>
          </div>
        </div>

        {/* ===== Link Columns (Explore + Resources + Company + Legal) ===== */}
        <div className="py-6 border-b border-white/15">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Collapsible title="Explore">
                <ul className="space-y-1.5">
                  {EXPLORE.map((l) => (
                    <li key={l.label}>
                      <Link className="text-[13.5px] lg:text-[14px] text-white/85 hover:text-white underline-offset-4 hover:underline" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </div>

            <div>
              <Collapsible title="Resources">
                <ul className="space-y-1.5">
                  {RESOURCES.map((l) => (
                    <li key={l.href}>
                      <Link
                        className="text-[13.5px] lg:text-[14px] text-white/85 hover:text-white underline-offset-4 hover:underline"
                        href={l.href}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

              </Collapsible>
            </div>

            <div>
              <Collapsible title="Company">
                <ul className="space-y-1.5">
                  {COMPANY.map((l) => (
                    <li key={l.label}>
                      <Link className="text-[13.5px] lg:text-[14px] text-white/85 hover:text-white underline-offset-4 hover:underline" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </div>

            <div>
              <Collapsible title="Legal & Policies">
                <ul className="space-y-1.5">
                  {LEGAL.map((l) => (
                    <li key={l.label}>
                      <Link className="text-[13.5px] lg:text-[14px] text-white/85 hover:text-white underline-offset-4 hover:underline" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapsible>

            </div>
          </div>
        </div>

        {/* ===== Utility Strip: App QR (kept) + Contact ===== */}
        <div className="py-6 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* App QR card (improved links + a11y) */}
            <div
              aria-label="Mobile app"
              className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5"
            >
              <div className="flex items-center gap-3">
                {/* Make QR clickable → app landing */}
                <a
                  href="/contact"
                  className="h-16 w-16 shrink-0 rounded-lg bg-white/20 flex items-center justify-center ring-1 ring-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label="Open the XIPHIAS app landing page"
                  title="Open the XIPHIAS app landing page"
                >
                  <img
                    src="/images/footer/qrcode.webp"
                    alt="QR code: open app landing"
                    width={96}
                    height={96}
                    className="h-12 w-12 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </a>

                <div className="min-w-0">
                  <p className="text-sm text-white/95 font-medium">
                    XIPHIAS App — track docs &amp; case status
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[12px] text-white/90">
                    <Icon icon="mdi:star" className="w-4 h-4" />
                    <strong>4.8</strong>
                    <span className="text-white/70">· 10,000+ reviews</span>
                  </div>

                  {/* Store badges (open in new tab) */}
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download on the App Store"
                      title="Download on the App Store"
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded"
                      data-store="apple"
                    >
                      <img
                        src="/images/footer/appstore.svg"
                        alt="Download on the App Store"
                        width={24}
                        height={24}
                        className="h-8 w-8"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>

                    <a
                      href="/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Get it on Google Play"
                      title="Get it on Google Play"
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded"
                      data-store="google-play"
                    >
                      <img
                        src="/images/footer/playstore.65459def.svg"
                        alt="Get it on Google Play"
                        width={28}
                        height={32}
                        className="h-8 w-7"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </div>

                </div>
              </div>
            </div>


            {/* Contact chips + address (primary contact card) */}
            <div aria-label="Get in touch" className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5">
              <h3 className="text-white/95 text-sm font-semibold mb-2">Get in touch</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { href: "tel:+919021335577", icon: "mdi:phone", label: "Call" },
                  { href: "https://wa.me/919021335577", icon: "mdi:whatsapp", label: "WhatsApp", ext: true },
                  { href: "mailto:immigration@xiphias.in", icon: "mdi:email-outline", label: "Email" },
                  { href: "/personal-booking", icon: "mdi:calendar-clock", label: "Personal Paid Consultation" },
                ].map(({ href, icon, label, ext }) => (
                  <Link
                    key={label}
                    href={href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  >
                    <Icon icon={icon} className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
              <address className="not-italic text-white/85 text-[13px]" itemScope itemType="https://schema.org/PostalAddress">
                <span className="block text-white/70 text-[12px] mt-1">Mon–Sat, 9:30–6:30</span>
              </address>
            </div>
          </div>
        </div>

        {/* ===== Offices (multi) + Trust & Compliance ===== */}
        <div className="py-6 border-b border-white/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Offices — auto-wrap for any number */}
            <div className="lg:col-span-7 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5" aria-label="Offices">
              <h3 className="text-white/95 text-sm font-semibold mb-2">Offices</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {OFFICES.map((o) => (
                  <div key={o.name} className="not-italic rounded-lg border border-white/10 bg-white/5 p-3">
                    <strong className="block text-[13.5px]">{o.name}</strong>
                    <div className="text-[13px] text-white/90">
                      <span className="block">{o.street}</span>
                      <span className="block">{o.city} {o.postal}{o.postal ? ", " : ""}{o.country}</span>
                      <span className="block text-white/70 text-[12px] mt-1">{o.hours}</span>
                      <span className="block text-[13px] mt-1">
                        <Link href={`tel:${o.phone.replace(/\s/g, "")}`} className="underline underline-offset-4 hover:text-white">
                          <Icon icon="mdi:phone" className="inline h-4 w-4 mr-1" />{o.phone}
                        </Link>
                      </span>
                      <span className="block text-[13px] mt-1">
                        <Link href={o.maps} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                          <Icon icon="mdi:map-marker-outline" className="inline h-4 w-4 mr-1" />Open in Maps
                        </Link>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust & Compliance */}
            <div className="lg:col-span-5 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5" aria-label="Trust & compliance">
              <h3 className="text-white/95 text-sm font-semibold mb-2">Trust & Compliance</h3>
              <ul className="grid grid-cols-1 gap-3">
                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start gap-2">
                    <Icon icon="mdi:certificate-outline" className="h-5 w-5 mt-0.5" />
                    <div>
                      <strong className="text-[13.5px]">Accreditations</strong>
                      <p className="text-[13px] text-white/85">RCIC R516194 • MARA 1680615</p>
                    </div>
                  </div>
                </li>

                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start gap-2">
                    <Icon icon="mdi:star-circle-outline" className="h-5 w-5 mt-0.5" />
                    <div>
                      <strong className="text-[13.5px]">Reviews</strong>
                      <p className="text-[13px] text-white/85">4.8/5 on Google • <Link id="reviews" href="https://g.page/r/CTH8DQwm1lYnEAE/review" className="underline">Read reviews</Link></p>
                    </div>
                  </div>
                </li>

                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:lock-check" className="h-5 w-5" />
                    <span className="text-[13.5px]">Secure payments</span>
                    <div aria-label="Payment methods" className="ml-auto flex items-center gap-3 overflow-x-auto pr-1">
                      {PAYMENTS.map((icon) => (
                        <span key={icon.alt} className="bg-white/20 rounded-md p-1.5 shadow-sm">
                          <span className="relative block h-7 w-14 lg:h-8 lg:w-16">
                            <Image src={icon.src} alt={icon.alt} fill sizes="(max-width:768px) 56px, 128px" className="object-contain" loading="lazy" />
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </li>

                <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[12px] text-white/75 leading-relaxed">
                    We provide immigration consulting and documentation support—<strong>not a law firm</strong>.
                    Information is general guidance only and not legal advice. Availability, costs, and timelines may change.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== Awards/Press + Socials (enhanced) ===== */}
        <div className="py-6">
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-3.5 py-4 lg:px-4 lg:py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              {/* Press / awards strip */}
              <div
                aria-label="Awards and press logos"
                className="flex items-center gap-4 overflow-x-auto pr-1 scroll-smooth snap-x snap-mandatory"
              >
                {PRESS.map((src, i) => (
                  <span
                    key={i}
                    className="relative h-22 w-28 shrink-0 snap-start"
                    title="Press logo"
                  >
                    <img
                      src={src}
                      alt="XIPHIAS Immigration press and news"
                      loading="lazy"
                      decoding="async"
                      className="object-contain h-full w-full opacity-90 contrast-125"
                    />
                    {/* soft glow on hover */}
                    <span className="pointer-events-none absolute inset-0 rounded-md ring-0 hover:ring-2 hover:ring-white/20 transition" />
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {SOCIALS.map(({ href, label, icon }) => {
                  const hover = HOVER[label] || "";
                  const cta = CTA[label] || CTA.default;
                  const external = href.startsWith("http");
                  return (
                    <Link
                      key={label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className={[
                        "group relative inline-flex items-center gap-2 rounded-full",
                        "px-3.5 py-2 text-[13px] leading-none",
                        "bg-white/8 ring-1 ring-white/15 text-white/90",
                        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                        hover,
                      ].join(" ")}
                      title={label}
                    >
                      <Icon className="w-5 h-5" icon={icon} aria-hidden="true" />
                      <span className="hidden md:inline">{cta}</span>
                      <span className="sr-only">{`${cta} ${label}`}</span>
                      <span
                        className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition"
                        role="tooltip"
                      >
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>


        {/* ===== Bottom Legal Bar ===== */}
        <div className="py-5 border-t border-white/15">
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11.5px] text-white/80">©2009–{year} XIPHIAS Immigration. All rights reserved.</p>
            <p className="text-[11.5px] text-white/75">
              Registered in India • CIN: U74900KA2015PTC078396 • Jurisdiction: Bengaluru, Karnataka
            </p>
            <Link
              href="/content-admin"
              className="inline-flex w-fit items-center justify-center rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Blog Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </footer>
  );
}
