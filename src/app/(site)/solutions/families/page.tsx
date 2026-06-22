import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Heart, GraduationCap, ShieldCheck, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration for Families – Second Residency, Citizenship & Relocation | XIPHIAS',
  description:
    'Family immigration solutions — second residency, citizenship by investment, family reunification and multi-generational relocation planning across 35+ countries.',
  alternates: { canonical: '/solutions/families' },
  openGraph: {
    title: 'Immigration for Families – Second Residency, CBI & Family Reunification',
    description: 'Secure a better future for your family. Expert advisory on second residency, CBI programs and multi-generational relocation planning.',
    url: 'https://www.xiphiasimmigration.com/solutions/families',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration for Families – XIPHIAS' }],
  },
};

const PROGRAMS = [
  { title: 'Portugal RBI — Capital Transfer', href: '/residency/portugal/portugal-capital-transfer', tag: 'EU Residency' },
  { title: 'UAE Golden Visa', href: '/residency/uae/uae-golden-visa', tag: 'Golden Visa' },
  { title: 'Dominica CBI — EDF', href: '/citizenship/dominica/economic-diversification-fund', tag: 'CBI' },
  { title: 'Saint Lucia — NEF', href: '/citizenship/saint-lucia/national-economic-fund', tag: 'CBI' },
  { title: 'Greece Real Estate RBI', href: '/residency/greece/greece-real-estate-investment', tag: 'EU Residency' },
  { title: 'Canada Provincial Nominee', href: '/skilled/canada/provincial-nominee-program', tag: 'Skilled PR' },
];

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
        <div className="mx-auto max-w-screen-xl">
          <Link href="/solutions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Solutions
          </Link>
          <div className="mt-4 text-4xl">👨‍👩‍👧</div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Immigration <span className="text-secondary">for Families</span></h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
            Secure a better future for the ones who matter most. Whether you seek a second home,
            better education, healthcare access or a safety net — we handle multi-generational
            planning, dependent applications and family reunification with complete care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors">
              Book Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/eligibility" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
              Check Eligibility
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Heart className="h-5 w-5" />, title: 'Family Included', desc: 'Most programs cover spouse and all dependent children.' },
            { icon: <GraduationCap className="h-5 w-5" />, title: 'Education Access', desc: 'EU, Canada, Australia and UK programs grant school access.' },
            { icon: <ShieldCheck className="h-5 w-5" />, title: 'Plan B Passport', desc: 'A second citizenship gives your family a lifeline in any crisis.' },
            { icon: <Globe className="h-5 w-5" />, title: 'Visa-Free Travel', desc: 'Top CBI passports unlock 140–160+ visa-free destinations.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                {item.icon}
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-white/55">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Popular Family Programs</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Link key={p.href} href={p.href} className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3.5 hover:border-primary/30 hover:shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40 transition-all">
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors text-sm">{p.title}</p>
                <span className="mt-0.5 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{p.tag}</span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Planning your family&apos;s future?</h2>
          <p className="mt-2 text-white/80">We help you choose a destination and program that fits every member of your family — at every life stage.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors">
              Book Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
