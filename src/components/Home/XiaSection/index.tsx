import Link from 'next/link';
import { Sparkles, ArrowRight, MapPin, LayoutGrid, UserCheck } from 'lucide-react';

const FEATURES = [
  { icon: MapPin,      label: 'Route fit',        sub: 'Goals → best-fit paths' },
  { icon: LayoutGrid,  label: '200+ Programs',     sub: 'Matched to your profile' },
  { icon: UserCheck,   label: 'Advisor in 24 hrs', sub: 'Saved to X-Hub for review' },
];

const MATCHES = [
  { code: 'PT', flag: '🇵🇹', name: 'Portugal Golden Visa',  type: 'Residency',   pct: '97%', color: 'text-emerald-600 bg-emerald-50' },
  { code: 'MT', flag: '🇲🇹', name: 'Malta Residency',        type: 'Residency',   pct: '91%', color: 'text-blue-600 bg-blue-50'       },
  { code: 'GD', flag: '🇬🇩', name: 'Grenada Citizenship',    type: 'Citizenship', pct: '88%', color: 'text-violet-600 bg-violet-50'   },
];

export default function XiaSection() {
  return (
    <section className="relative overflow-hidden border-y border-zinc-100 bg-white py-16 lg:py-24">
      {/* Subtle background tint */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_60%_50%,rgba(28,87,180,0.04),transparent)]" aria-hidden />

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── Left ── */}
          <div>
            {/* Overline */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </div>

            <h2 className="text-[2.4rem] font-extrabold leading-[1.1] tracking-tight text-zinc-900 lg:text-[2.75rem]">
              Meet{' '}
              <span className="text-primary">XIA Intelligence</span>
            </h2>

            <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-zinc-500">
              From first question to shortlisted programs — XIA maps your goals, matches programs, and hands off to an advisor automatically.
            </p>

            {/* Feature pills */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {FEATURES.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-zinc-800">{label}</p>
                    <p className="text-[11px] text-zinc-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-extrabold text-primary shadow-[0_4px_14px_rgba(225,185,35,0.35)] transition-all hover:bg-[#f0cb3b] hover:shadow-[0_4px_20px_rgba(225,185,35,0.50)]"
              >
                Buy a report from INR 499
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/xia-intelligence"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/25 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
              >
                Try XIA Intelligence
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/25 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
              >
                Quick route check
              </Link>
            </div>
          </div>

          {/* ── Right: Assessment card ── */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]">

              {/* Card header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[13px] font-bold text-zinc-800">XIA Assessment</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                  3 matches found
                </span>
              </div>

              {/* Profile */}
              <div className="border-b border-zinc-100 px-5 py-4">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Profile</p>
                <div className="flex flex-wrap gap-1.5">
                  {['India · HNI', 'Budget $500K+', 'Family of 4', 'EU preferred', '2yr timeline'].map(t => (
                    <span key={t} className="rounded-md bg-zinc-100 px-2.5 py-1 text-[11.5px] font-medium text-zinc-600">{t}</span>
                  ))}
                </div>
              </div>

              {/* Matches */}
              <div className="px-5 py-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Top matches</p>
                <div className="space-y-2">
                  {MATCHES.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
                      <span className="text-xl leading-none">{m.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-zinc-800">{m.name}</p>
                        <p className="text-[11px] text-zinc-400">{m.type}</p>
                      </div>
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-extrabold ${m.color}`}>
                        {m.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between rounded-b-2xl border-t border-zinc-100 bg-primary px-5 py-3.5">
                <div>
                  <p className="text-[12.5px] font-bold text-white">Save to X-Hub</p>
                  <p className="text-[11px] text-white/60">Advisor review within 24 hrs</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                  <ArrowRight className="h-4 w-4 text-secondary" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
