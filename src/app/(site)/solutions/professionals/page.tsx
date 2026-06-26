import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Award, Briefcase, FileCheck, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Immigration for Professionals – Skilled Migration & Global Talent Visas | XIPHIAS',
  description:
    'Skilled migration solutions for qualified professionals, specialists and global talent. Points-based systems, employer sponsorship and extraordinary ability visas across 7+ countries.',
  alternates: { canonical: '/solutions/professionals' },
  openGraph: {
    title: 'Immigration for Professionals – Skilled Migration, Work Permits & Global Talent',
    description: 'Your skills are your passport. Expert advisory on skilled migration, employer sponsorship and global talent visas.',
    url: 'https://www.xiphiasimmigration.com/solutions/professionals',
    siteName: 'XIPHIAS Immigration',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: 'Immigration for Professionals – XIPHIAS' }],
  },
};

const PROGRAMS = [
  { title: 'Australia Skilled Independent 189', href: '/skilled/australia/skilled-independent-189', tag: 'Points-Based' },
  { title: 'Australia Global Talent 858', href: '/skilled/australia/global-talent-visa-858', tag: 'Global Talent' },
  { title: 'Canada Express Entry', href: '/skilled/canada/express-entry', tag: 'Points-Based' },
  { title: 'UK Global Talent Visa', href: '/skilled/united-kingdom/uk-global-talent-visa', tag: 'Global Talent' },
  { title: 'USA EB-1A Extraordinary Ability', href: '/skilled/usa/eb1a-extraordinary-ability', tag: 'EB Visa' },
  { title: 'USA EB-2 NIW', href: '/skilled/usa/eb2-national-interest-waiver', tag: 'Self-Petition' },
  { title: 'Germany Job Seeker Visa', href: '/skilled/germany/germany-job-seeker-visa', tag: 'EU' },
];

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
        <div className="mx-auto max-w-screen-xl">
          <Link href="/solutions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Solutions
          </Link>
          <div className="mt-4 text-4xl">👔</div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Immigration <span className="text-secondary">for Professionals</span></h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
            Your skills are your passport. We help qualified professionals, specialists and global talent
            secure permanent residency through employer sponsorship, points-based systems and
            extraordinary ability routes across the world&apos;s top destinations.
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
            { icon: <Award className="h-5 w-5" />, title: 'Profile Assessment', desc: 'Points score, EOI ranking and employer sponsorship fit.' },
            { icon: <Briefcase className="h-5 w-5" />, title: 'Resume Review', desc: 'Included with work permit advisory — at no extra cost.' },
            { icon: <FileCheck className="h-5 w-5" />, title: 'Documents', desc: 'End-to-end document preparation and verification.' },
            { icon: <Globe className="h-5 w-5" />, title: '7 Countries', desc: 'Australia, Canada, UK, USA, Germany, Italy, Spain.' },
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

        <h2 className="mt-14 text-2xl font-bold text-zinc-900 dark:text-white">Skilled Migration Programs</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Link key={p.href} href={p.href} className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3.5 hover:border-primary/30 hover:shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40 transition-all">
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors text-sm">{p.title}</p>
                <span className="mt-0.5 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">{p.tag}</span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to move your career global?</h2>
          <p className="mt-2 text-white/80">We assess your profile, score your points and identify the fastest pathway to your target country.</p>
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
