import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration Programs – Residency, Citizenship, Skilled & Corporate | XIPHIAS',
  description:
    'Explore all XIPHIAS immigration programs: Residency by Investment, Citizenship by Investment, Golden Visa, Skilled Migration, Corporate Mobility and Work Permits across 50+ countries.',
  alternates: { canonical: '/programs' },
  openGraph: {
    title: 'Immigration Programs – RBI, CBI, Golden Visa, Skilled & Corporate',
    description:
      'Find the right immigration program across Residency by Investment, Citizenship by Investment, Skilled Migration, Corporate Mobility and Work Permits.',
    url: 'https://www.xiphiasimmigration.com/programs',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'XIPHIAS Immigration Programs' }],
  },
};

const PROGRAMS = [
  {
    title: 'Residency by Investment',
    abbr: 'RBI',
    href: '/residency',
    description:
      'Secure legal residency in 20+ countries through qualifying investments in real estate, funds, government bonds or business ventures.',
    stats: '20+ Countries · From USD 200K',
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    highlights: ['Portugal Golden Visa', 'UAE Golden Visa', 'Greece RBI', 'Singapore GIP', 'USA EB-5'],
  },
  {
    title: 'Citizenship by Investment',
    abbr: 'CBI',
    href: '/citizenship',
    description:
      'Obtain a second passport through government-approved investment programs — real estate, national development funds or donation routes.',
    stats: '11+ Countries · From USD 100K',
    badge: null,
    badgeColor: '',
    highlights: ['Caribbean Passports', 'Vanuatu CBI', 'Turkey CBI', 'Egypt CBI'],
  },
  {
    title: 'Golden Visa',
    abbr: 'GV',
    href: '/residency?category=golden-visa',
    description:
      'Fast-track residency programs in premium destinations for investors seeking visa-free travel, tax planning and asset protection.',
    stats: '8+ Destinations · EUR 250K+',
    badge: 'Fast Track',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    highlights: ['UAE', 'Greece', 'Portugal', 'Hungary'],
  },
  {
    title: 'Skilled Migration',
    abbr: 'SM',
    href: '/skilled',
    description:
      'Points-based and employer-sponsored pathways for qualified professionals, specialists, and global talent seeking PR and citizenship.',
    stats: '7 Countries · EOI & Sponsorship',
    badge: null,
    badgeColor: '',
    highlights: ['Australia Skilled 189/190', 'Canada Express Entry', 'UK Global Talent', 'USA EB-1/EB-2'],
  },
  {
    title: 'Corporate Mobility',
    abbr: 'CM',
    href: '/corporate',
    description:
      'Business expansion, company formation, intra-company transfers and self-sponsorship routes for founders and enterprise leaders.',
    stats: '7 Countries · ICT & Setup',
    badge: null,
    badgeColor: '',
    highlights: ['UAE Company Setup', 'UK Self-Sponsorship', 'USA L-1', 'Portugal D2'],
  },
  {
    title: 'Work Permits',
    abbr: 'WP',
    href: '/work-permits',
    description:
      'Employment-based visa advisory for skilled professionals relocating with job offers, covering LMIA, sponsorship and nomad routes.',
    stats: '8 Countries · Employer-based',
    badge: 'Resume Review',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    highlights: ['Canada LMIA', 'Germany Opportunity Card', 'UAE Employment', 'Australia ENS'],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'XIPHIAS Immigration Programs',
  description: 'All immigration programs offered by XIPHIAS Immigration',
  itemListElement: PROGRAMS.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.title,
    url: `https://www.xiphiasimmigration.com${p.href}`,
  })),
};

export default function ProgramsPage() {
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
              All Immigration Programs
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Find Your Path to <span className="text-secondary">Global Mobility</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
              Six distinct program categories. 50+ countries. One trusted advisory partner.
              Choose the pathway that fits your goals, timeline and investment capacity.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors"
              >
                Check Eligibility <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Program Cards */}
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((prog) => (
              <Link
                key={prog.abbr}
                href={prog.href}
                className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40"
              >
                {prog.badge && (
                  <span className={`mb-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                )}
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/50 dark:text-white/40">
                    {prog.abbr}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors">
                  {prog.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-white/65">
                  {prog.description}
                </p>
                <p className="mt-3 text-xs font-semibold text-primary dark:text-secondary">
                  {prog.stats}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {prog.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5 flex items-center gap-1 text-sm font-semibold text-primary dark:text-secondary">
                  Explore {prog.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Not sure which program suits you?</h2>
            <p className="mt-2 text-white/80">
              Our advisors assess your profile, goals and financials — then recommend the best pathway.
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
                Free Eligibility Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
