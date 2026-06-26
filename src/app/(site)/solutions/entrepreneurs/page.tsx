import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Zap, Globe, Users, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration for Entrepreneurs – Startup Visa & Business Formation | XIPHIAS',
  description:
    'Immigration solutions for entrepreneurs and founders — startup visas, entrepreneur immigration streams, company formation and self-sponsorship routes across 10+ countries.',
  alternates: { canonical: '/solutions/entrepreneurs' },
  openGraph: {
    title: 'Immigration for Entrepreneurs – Startup Visa, Business Formation & Self-Sponsorship',
    description: 'Launch and expand your business globally. Expert advisory for founders on startup visas, corporate formation and entrepreneur immigration programs.',
    url: 'https://www.xiphiasimmigration.com/solutions/entrepreneurs',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration for Entrepreneurs – XIPHIAS' }],
  },
};

const PROGRAMS = [
  { title: 'Canada Federal Start-Up Visa', href: '/residency/canada/federal-start-up-visa', tag: 'Startup Visa' },
  { title: 'Canada BC Entrepreneur', href: '/residency/canada/british-columbia-entrepreneur-base', tag: 'RBI' },
  { title: 'UK Self-Sponsorship Visa', href: '/corporate/united-kingdom/self-sponsorship-visa', tag: 'Corporate' },
  { title: 'Portugal D2 Visa', href: '/corporate/portugal/portugal-d2-visa', tag: 'Corporate' },
  { title: 'Spain Entrepreneur Formation', href: '/corporate/spain/entrepreneur-company-formation', tag: 'Corporate' },
  { title: 'UAE Dubai Freezone Visa', href: '/corporate/uae/dubai-freezone-visa', tag: 'Corporate' },
  { title: 'USA O-1 Entrepreneur Visa', href: '/corporate/usa/o1-entrepreneur-visa', tag: 'Skilled' },
];

export default function EntrepreneursPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
        <div className="mx-auto max-w-screen-xl">
          <Link href="/solutions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Solutions
          </Link>
          <div className="mt-4 text-4xl">🚀</div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Immigration <span className="text-secondary">for Entrepreneurs</span></h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
            Build your business in the world&apos;s best ecosystems. Startup visas, entrepreneur immigration
            streams, corporate formation and self-sponsorship routes across 10+ countries — tailored for founders.
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
        {/* Value Props */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Zap className="h-5 w-5" />, title: 'Fast-Track Routes', desc: 'Startup visas with accelerated processing for backed founders.' },
            { icon: <Globe className="h-5 w-5" />, title: '10+ Destinations', desc: 'Canada, UK, UAE, Portugal, Spain, USA and more.' },
            { icon: <Users className="h-5 w-5" />, title: 'Family Included', desc: 'Most entrepreneur programs extend to spouse and dependents.' },
            { icon: <FileCheck className="h-5 w-5" />, title: 'PR Pathway', desc: 'Structured routes from work permit to permanent residency.' },
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
        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Entrepreneur Immigration Programs</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Link key={p.href} href={p.href} className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3.5 hover:border-primary/30 hover:shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40 transition-all">
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors text-sm">{p.title}</p>
                <span className="mt-0.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{p.tag}</span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to build your global business?</h2>
          <p className="mt-2 text-white/80">Our advisors match your business model and stage with the right startup visa or entrepreneur program.</p>
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
