import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, PhoneCall, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Office Locations – XIPHIAS Immigration | India, UAE, Qatar, Australia & Canada',
  description:
    'Find XIPHIAS Immigration offices in Bengaluru, Gurugram, Dubai, Doha, Melbourne and Waterloo. Book an in-person consultation at a location near you.',
  alternates: { canonical: '/about/locations' },
  openGraph: {
    title: 'Office Locations – XIPHIAS Immigration',
    description: 'XIPHIAS Immigration offices in Bengaluru, Gurugram, Dubai, Qatar, Australia and Canada.',
    url: 'https://www.xiphiasimmigration.com/about/locations',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'XIPHIAS Immigration Office Locations' }],
  },
};

const OFFICES = [
  {
    name: 'Bengaluru HQ',
    street: '1st Floor, JK Nirmala Arcade, Plot no. 780, 80 Feet Rd, 4th Block, Koramangala',
    city: 'Bengaluru',
    postal: '560034',
    country: 'India',
    flag: '🇮🇳',
    hours: 'Mon–Sat, 9:30–18:30',
    phone: '+91 9021335577',
    phoneAlt: '+91 08049768088',
    maps: 'https://maps.google.com/?q=JK+Nirmala+Arcade+Plot+780+80+Feet+Road+4th+Block+Koramangala+Bengaluru+560034',
  },
  {
    name: 'Gurugram',
    street: 'Augusta Point, Golf Course Rd, near Parsvnath Exotica, DLF Phase 5, Sector 53',
    city: 'Gurugram',
    postal: '122002',
    country: 'India',
    flag: '🇮🇳',
    hours: 'Mon–Sat, 9:30–18:30',
    phone: '+91 96675 20211',
    phoneAlt: '',
    maps: 'https://maps.google.com/?q=Augusta+Point+Golf+Course+Road+DLF+Phase+5+Sector+53+Gurugram+122002',
  },
  {
    name: 'Dubai',
    street: 'Unit 608, Platinum Tower, JLT-PH1-I2, Jumeirah Lakes Towers',
    city: 'Dubai',
    postal: '',
    country: 'UAE',
    flag: '🇦🇪',
    hours: 'Sun–Thu, 9:00–18:00',
    phone: '+971-527 275 101',
    phoneAlt: '',
    maps: 'https://maps.google.com/?q=Platinum+Tower+JLT+Dubai',
  },
  {
    name: 'Qatar',
    street: 'ILC LLC, Office 3402, Al Jazeera Tower, Conference Center Rd, West Bay',
    city: 'Doha',
    postal: '',
    country: 'Qatar',
    flag: '🇶🇦',
    hours: 'Sun–Thu, 9:00–18:00',
    phone: '+974 4476 0562',
    phoneAlt: '',
    maps: 'https://maps.google.com/?q=Al+Jazeera+Tower+West+Bay+Doha',
  },
  {
    name: 'Australia',
    street: 'SSCS-Suite 204, 227 Collins Street, Melbourne, Vic – 3000',
    city: 'Melbourne',
    postal: '3000',
    country: 'Australia',
    flag: '🇦🇺',
    hours: 'Mon–Sat, 9:00–17:00',
    phone: '+61 451 239 239',
    phoneAlt: '',
    maps: 'https://maps.google.com/?q=227+Collins+Street+Melbourne+VIC+3000+Australia',
  },
  {
    name: 'Canada (Waterloo)',
    street: '3-133 Weber St N, Suite 514',
    city: 'Waterloo, ON',
    postal: 'N2J 3G9',
    country: 'Canada',
    flag: '🇨🇦',
    hours: 'Mon–Sat, 9:00–17:00',
    phone: '+1 438 379 9101',
    phoneAlt: '',
    maps: 'https://maps.google.com/?q=3-133+Weber+St+N+Suite+514+Waterloo+ON+N2J+3G9',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'XIPHIAS Immigration',
  url: 'https://www.xiphiasimmigration.com',
  location: OFFICES.map((o) => ({
    '@type': 'Place',
    name: `XIPHIAS Immigration – ${o.name}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.street,
      addressLocality: o.city,
      postalCode: o.postal,
      addressCountry: o.country,
    },
    telephone: [o.phone, o.phoneAlt].filter(Boolean),
  })),
};

export default function LocationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
          <div className="mx-auto max-w-screen-xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90">
              <MapPin className="h-3.5 w-3.5 text-secondary" /> 6 Offices Worldwide
            </p>
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">
              Our <span className="text-secondary">Office Locations</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
              Visit us in Bengaluru, Gurugram, Dubai, Doha, Melbourne or Waterloo —
              or connect with an advisor remotely from anywhere in the world.
            </p>
          </div>
        </div>

        {/* Offices Grid */}
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICES.map((office) => (
              <div
                key={office.name}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{office.flag}</span>
                  <div>
                    <h2 className="font-bold text-zinc-900 dark:text-white">{office.name}</h2>
                    <p className="text-xs text-zinc-400 dark:text-white/40">{office.country}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm flex-1">
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-white/65">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-secondary" />
                    <span>{office.street}{office.city ? `, ${office.city}` : ''}{office.postal ? ` ${office.postal}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-white/65">
                    <Clock className="h-4 w-4 shrink-0 text-primary dark:text-secondary" />
                    <span>{office.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-white/65">
                    <Phone className="h-4 w-4 shrink-0 text-primary dark:text-secondary" />
                    <div className="flex flex-wrap gap-x-2">
                      {[office.phone, office.phoneAlt].filter(Boolean).map((phone, index) => (
                        <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '').replace(/^\+910/, '+91')}`} title={index === 0 ? "Phone" : "Landline"} className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-secondary transition-colors">
                          {index > 0 && <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={office.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary dark:text-secondary hover:underline"
                >
                  Open in Maps <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Book CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Prefer to meet in person?</h2>
            <p className="mt-2 text-white/80">
              Book an in-person consultation at the office nearest to you, or speak to an advisor remotely.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors"
              >
                Book Free Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/personal-booking"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Book Private Session with MD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
