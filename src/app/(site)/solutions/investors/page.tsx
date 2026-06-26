import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ShieldCheck, TrendingUp, Globe, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration for Investors – Residency & Citizenship by Investment | XIPHIAS',
  description:
    'Tailored immigration solutions for high-net-worth investors. Residency by Investment, Citizenship by Investment and Golden Visa programs across 30+ countries — with full concierge advisory.',
  alternates: { canonical: '/solutions/investors' },
  openGraph: {
    title: 'Immigration for Investors – RBI, CBI & Golden Visa Advisory',
    description: 'Secure global residency or citizenship through qualifying investment. Expert advisory for HNIs across 30+ programs.',
    url: 'https://www.xiphiasimmigration.com/solutions/investors',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration for Investors – XIPHIAS' }],
  },
};

const PROGRAMS = [
  { title: 'Residency by Investment (RBI)', href: '/residency', desc: '20+ countries from USD 200K — real estate, funds, bonds.' },
  { title: 'Citizenship by Investment (CBI)', href: '/citizenship', desc: '11+ jurisdictions — full second passport rights.' },
  { title: 'Golden Visa', href: '/residency?category=golden-visa', desc: 'UAE, Greece, Hungary, Portugal and more.' },
];

const TOP_PICKS = [
  { country: 'UAE Golden Visa', href: '/residency/uae/uae-golden-visa', tag: 'AED 2M+' },
  { country: 'Greece RBI', href: '/residency/greece/greece-real-estate-investment', tag: 'EUR 250K+' },
  { country: 'Portugal RBI', href: '/residency/portugal/portugal-business-investment', tag: 'EUR 500K+' },
  { country: 'Turkey CBI', href: '/citizenship/turkey/real-estate', tag: 'USD 400K' },
  { country: 'Vanuatu CBI', href: '/citizenship/vanuatu/vdsp-donation', tag: 'USD 130K' },
  { country: 'Singapore GIP', href: '/residency/singapore/singapore-gip-business-investment', tag: 'SGD 10M+' },
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
        <div className="mx-auto max-w-screen-xl">
          <Link href="/solutions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Solutions
          </Link>
          <div className="mt-4 text-4xl">💰</div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Immigration <span className="text-secondary">for Investors</span></h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
            Preserve and grow your wealth while securing global mobility. We align your capital with
            the most strategic residency or citizenship program across 30+ countries — based on your
            timeline, investment capacity and long-term goals.
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
        {/* Why Investors Choose XIPHIAS */}
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Why Investors Choose XIPHIAS</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, title: 'Confidential Advisory', desc: 'Full NDA-backed confidentiality for HNI clients.' },
            { icon: <TrendingUp className="h-5 w-5" />, title: 'ROI-Aligned Strategy', desc: 'We match investment routes to your financial objectives.' },
            { icon: <Globe className="h-5 w-5" />, title: '30+ Programs', desc: 'Widest selection of RBI, CBI and Golden Visa options.' },
            { icon: <Briefcase className="h-5 w-5" />, title: 'End-to-End Management', desc: 'From program selection to passport delivery.' },
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

        {/* Programs */}
        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Relevant Programs</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Link key={p.href} href={p.href} className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40 transition-all">
              <h3 className="font-bold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors">{p.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-white/55">{p.desc}</p>
              <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary dark:text-secondary">
                Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Top Picks */}
        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Top Investor Programs</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_PICKS.map((p) => (
            <Link key={p.href} href={p.href} className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3.5 hover:border-primary/30 hover:shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40 transition-all">
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors">{p.country}</p>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-white/40">Min. investment: {p.tag}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to invest in your global future?</h2>
          <p className="mt-2 text-white/80">Schedule a confidential advisory call. We assess your goals, recommend programs and manage the entire process.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors">
              Book Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/personal-booking" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors">
              Book Private Session with MD
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
