import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration by Country – 35+ Destinations | XIPHIAS Immigration',
  description:
    'Explore all immigration programs by destination. Residency, Citizenship, Skilled Migration, Work Permits and Corporate Mobility across 35+ countries.',
  alternates: { canonical: '/countries' },
  openGraph: {
    title: 'Immigration by Country – 35+ Destinations',
    description:
      'Find every immigration pathway available in your target country — residency, citizenship, skilled migration, work permits and corporate routes.',
    url: 'https://www.xiphiasimmigration.com/countries',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration by Country – XIPHIAS' }],
  },
};

const COUNTRIES = [
  { name: 'Antigua & Barbuda', slug: 'antigua-barbuda', code: 'AG', programs: ['CBI'] },
  { name: 'Australia',          slug: 'australia',          code: 'AU', programs: ['Skilled', 'Work Permits'] },
  { name: 'Bulgaria',           slug: 'bulgaria',           code: 'BG', programs: ['RBI'] },
  { name: 'Canada',             slug: 'canada',             code: 'CA', programs: ['RBI', 'Skilled', 'Corporate', 'Work Permits'] },
  { name: 'Curacao',            slug: 'curacao',            code: 'CW', programs: ['RBI'] },
  { name: 'Cyprus',             slug: 'cyprus',             code: 'CY', programs: ['RBI', 'Corporate'] },
  { name: 'Dominica',           slug: 'dominica',           code: 'DM', programs: ['CBI'] },
  { name: 'Egypt',              slug: 'egypt',              code: 'EG', programs: ['CBI'] },
  { name: 'Germany',            slug: 'germany',            code: 'DE', programs: ['Skilled', 'Work Permits'] },
  { name: 'Greece',             slug: 'greece',             code: 'GR', programs: ['RBI', 'Golden Visa'] },
  { name: 'Grenada',            slug: 'grenada',            code: 'GD', programs: ['CBI'] },
  { name: 'Hong Kong',          slug: 'hong-kong',          code: 'HK', programs: ['RBI'] },
  { name: 'Hungary',            slug: 'hungary',            code: 'HU', programs: ['RBI', 'Golden Visa'] },
  { name: 'Italy',              slug: 'italy',              code: 'IT', programs: ['Skilled'] },
  { name: 'Latvia',             slug: 'latvia',             code: 'LV', programs: ['RBI'] },
  { name: 'Malaysia',           slug: 'malaysia',           code: 'MY', programs: ['RBI'] },
  { name: 'Malta',              slug: 'malta',              code: 'MT', programs: ['RBI'] },
  { name: 'Mauritius',          slug: 'mauritius',          code: 'MU', programs: ['RBI'] },
  { name: 'Monaco',             slug: 'monaco',             code: 'MC', programs: ['RBI'] },
  { name: 'Nauru',              slug: 'nauru',              code: 'NR', programs: ['CBI'] },
  { name: 'New Zealand',        slug: 'new-zealand',        code: 'NZ', programs: ['RBI'] },
  { name: 'Panama',             slug: 'panama',             code: 'PA', programs: ['RBI'] },
  { name: 'Portugal',           slug: 'portugal',           code: 'PT', programs: ['RBI', 'Golden Visa', 'Corporate', 'Work Permits'] },
  { name: 'Saint Kitts',        slug: 'saint-kitts',        code: 'KN', programs: ['CBI'] },
  { name: 'Saint Lucia',        slug: 'saint-lucia',        code: 'LC', programs: ['CBI'] },
  { name: 'Sao Tome',           slug: 'saotome',            code: 'ST', programs: ['CBI'] },
  { name: 'Singapore',          slug: 'singapore',          code: 'SG', programs: ['RBI'] },
  { name: 'Spain',              slug: 'spain',              code: 'ES', programs: ['Skilled', 'Corporate', 'Work Permits'] },
  { name: 'Switzerland',        slug: 'switzerland',        code: 'CH', programs: ['RBI'] },
  { name: 'Turkey',             slug: 'turkey',             code: 'TR', programs: ['CBI'] },
  { name: 'UAE',                slug: 'uae',                code: 'AE', programs: ['RBI', 'Golden Visa', 'Corporate', 'Work Permits'] },
  { name: 'United Kingdom',     slug: 'united-kingdom',     code: 'GB', programs: ['Skilled', 'Corporate', 'Work Permits'] },
  { name: 'Uruguay',            slug: 'uruguay',            code: 'UY', programs: ['RBI'] },
  { name: 'USA',                slug: 'usa',                code: 'US', programs: ['RBI', 'Skilled', 'Corporate', 'Work Permits'] },
  { name: 'Vanuatu',            slug: 'vanuatu',            code: 'VU', programs: ['CBI'] },
];

const FLAG_BASE = 'https://flagcdn.com/w40';

const BADGE_COLORS: Record<string, string> = {
  RBI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CBI: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Golden Visa': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Skilled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  Corporate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Work Permits': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Immigration Destinations – XIPHIAS',
  description: '35+ immigration destinations with programs available through XIPHIAS Immigration',
  itemListElement: COUNTRIES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    url: `https://www.xiphiasimmigration.com/countries/${c.slug}`,
  })),
};

export default function CountriesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] py-24 px-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
          <div className="mx-auto max-w-screen-xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90">
              <Globe className="h-3.5 w-3.5 text-secondary" /> 35+ Destinations
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Explore Immigration by <span className="text-secondary">Country</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
              Select any destination to see every program available — residency, citizenship,
              skilled migration, corporate mobility and work permits in one place.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COUNTRIES.map((country) => (
              <Link
                key={country.slug}
                href={`/countries/${country.slug}`}
                className="group flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40"
              >
                {/* Flag */}
                <img
                  src={`${FLAG_BASE}/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  width={40}
                  height={28}
                  className="mt-0.5 h-7 w-10 rounded object-cover shadow-sm shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors leading-tight">
                    {country.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {country.programs.map((prog) => (
                      <span
                        key={prog}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_COLORS[prog] ?? BADGE_COLORS['Work Permits']}`}
                      >
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:group-hover:text-secondary" />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Need expert guidance on your destination?</h2>
            <p className="mt-2 text-white/80">
              Our advisors compare multiple countries and programs based on your profile, timeline and goals.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors"
              >
                Book Free Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Check Eligibility Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
