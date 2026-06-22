import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Building2, Users, Globe, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration for Businesses – Corporate Mobility & Workforce Advisory | XIPHIAS',
  description:
    'Corporate immigration solutions for enterprises — intra-company transfers, overseas expansion, workforce mobility and compliance across multiple jurisdictions.',
  alternates: { canonical: '/solutions/businesses' },
  openGraph: {
    title: 'Immigration for Businesses – Corporate Mobility, ICT & Enterprise Expansion',
    description: 'Move your talent and operations without friction. Expert corporate immigration advisory for enterprises managing global workforce mobility.',
    url: 'https://www.xiphiasimmigration.com/solutions/businesses',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration for Businesses – XIPHIAS' }],
  },
};

const PROGRAMS = [
  { title: 'Canada Intra-Company Transfer', href: '/corporate/canada/intra-company-transfer', tag: 'ICT' },
  { title: 'USA L-1 Corporate Transfer', href: '/corporate/usa/l1-corporate-transfer-visa', tag: 'ICT' },
  { title: 'UK Expansion Worker Visa', href: '/corporate/united-kingdom/expansion-worker-visa', tag: 'Expansion' },
  { title: 'UAE Dubai Mainland Employment Visa', href: '/corporate/uae/dubai-mainland-employment-visa', tag: 'Employment' },
  { title: 'UAE Dubai Freezone Visa', href: '/corporate/uae/dubai-freezone-visa', tag: 'Setup' },
  { title: 'Cyprus Company Setup', href: '/corporate/cyprus/company-setup', tag: 'Formation' },
];

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
        <div className="mx-auto max-w-screen-xl">
          <Link href="/solutions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Solutions
          </Link>
          <div className="mt-4 text-4xl">🏢</div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Immigration <span className="text-secondary">for Businesses</span></h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
            Move your talent and operations without friction. We provide end-to-end corporate immigration
            advisory for enterprises managing intra-company transfers, overseas expansions and
            multi-jurisdiction workforce mobility.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors">
              Book Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Building2 className="h-5 w-5" />, title: 'Corporate Setup', desc: 'Company formation in UAE, Cyprus, UK, Portugal and more.' },
            { icon: <Users className="h-5 w-5" />, title: 'Workforce Mobility', desc: 'ICT, sponsored work permits and L-1/L-2 management.' },
            { icon: <Globe className="h-5 w-5" />, title: 'Multi-Jurisdiction', desc: 'Coordinated advisory across all active business jurisdictions.' },
            { icon: <Shield className="h-5 w-5" />, title: 'Compliance', desc: 'Immigration compliance reviews and risk management.' },
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

        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Corporate Immigration Programs</h2>
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

        <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Planning a global expansion?</h2>
          <p className="mt-2 text-white/80">Our corporate mobility team manages the entire immigration process — from strategy to visa approval.</p>
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
