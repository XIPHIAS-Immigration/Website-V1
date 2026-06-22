import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration Solutions – For Investors, Entrepreneurs, Professionals, Businesses & Families | XIPHIAS',
  description:
    'Tailored immigration solutions for every audience — investors, entrepreneurs, skilled professionals, businesses and families. Find the right pathway for your specific goals.',
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: 'Immigration Solutions by Audience – XIPHIAS Immigration',
    description:
      'Targeted immigration advisory for investors, entrepreneurs, professionals, businesses and families. Discover your pathway.',
    url: 'https://www.xiphiasimmigration.com/solutions',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'XIPHIAS Immigration Solutions' }],
  },
};

const SOLUTIONS = [
  {
    slug: 'investors',
    title: 'For Investors',
    tagline: 'Preserve and grow wealth while securing global mobility.',
    description:
      'High-net-worth individuals seeking residency or citizenship through qualifying investments in real estate, funds, bonds or businesses. We map your capital to the most strategically aligned program across 30+ destinations.',
    programs: ['Residency by Investment', 'Citizenship by Investment', 'Golden Visa'],
    icon: '💰',
    color: 'from-amber-500/20 to-amber-600/5',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
  },
  {
    slug: 'entrepreneurs',
    title: 'For Entrepreneurs',
    tagline: 'Build your business in the world\'s best ecosystems.',
    description:
      'Founders and business owners looking to launch, expand or relocate their ventures. Startup visas, entrepreneur immigration streams, company formation and self-sponsorship routes across 10+ jurisdictions.',
    programs: ['Startup Visa', 'Corporate Mobility', 'Entrepreneur Programs'],
    icon: '🚀',
    color: 'from-blue-500/20 to-blue-600/5',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
  },
  {
    slug: 'professionals',
    title: 'For Professionals',
    tagline: 'Your skills are your passport. We help you use them.',
    description:
      'Qualified professionals, specialists and global talent seeking permanent residency or work visas through employer sponsorship, points-based systems and extraordinary ability routes.',
    programs: ['Skilled Migration', 'Global Talent Visas', 'Work Permits'],
    icon: '👔',
    color: 'from-emerald-500/20 to-emerald-600/5',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
  },
  {
    slug: 'businesses',
    title: 'For Businesses',
    tagline: 'Move your talent and operations without friction.',
    description:
      'Corporates and enterprises managing international workforce mobility, intra-company transfers, overseas expansions and compliance across multiple jurisdictions.',
    programs: ['Intra-Company Transfers', 'Corporate Setup', 'Workforce Mobility'],
    icon: '🏢',
    color: 'from-sky-500/20 to-sky-600/5',
    borderColor: 'border-sky-200 dark:border-sky-800/40',
  },
  {
    slug: 'families',
    title: 'For Families',
    tagline: 'Secure a better future for the ones who matter most.',
    description:
      'Families seeking a second home, better education, healthcare or safety through residency or citizenship programs. We handle multi-generational planning, dependent applications and family reunification.',
    programs: ['Second Residency', 'Citizenship by Investment', 'Family Reunification'],
    icon: '👨‍👩‍👧',
    color: 'from-rose-500/20 to-rose-600/5',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'XIPHIAS Immigration Solutions',
  description: 'Tailored immigration solutions by audience segment',
  itemListElement: SOLUTIONS.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.title,
    url: `https://www.xiphiasimmigration.com/solutions/${s.slug}`,
  })),
};

export default function SolutionsPage() {
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
            <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90">
              Tailored for Your Goals
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Immigration <span className="text-secondary">Solutions</span> for Every Journey
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
              Whether you are an investor seeking a second passport, an entrepreneur expanding globally,
              or a family planning a safer future — we have a tailored pathway for you.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((sol) => (
              <Link
                key={sol.slug}
                href={`/solutions/${sol.slug}`}
                className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-all hover:shadow-md ${sol.color} ${sol.borderColor}`}
              >
                <div className="mb-3 text-3xl">{sol.icon}</div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{sol.title}</h2>
                <p className="mt-1 text-sm font-semibold text-primary dark:text-secondary">{sol.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-white/65">
                  {sol.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {sol.programs.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-zinc-200 bg-white/60 px-2.5 py-0.5 text-[11px] text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5 flex items-center gap-1 text-sm font-semibold text-primary dark:text-secondary">
                  Explore Solutions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Not sure which solution fits you?</h2>
            <p className="mt-2 text-white/80">
              Speak to an advisor who will assess your profile and recommend the best strategy.
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
                Free Eligibility Check
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
