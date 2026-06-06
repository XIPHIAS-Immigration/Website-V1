// components/Residency/SocialProof.tsx
export default function SocialProof() {
  const items = [
    {
      label: "Designated Incubator",
      icon: IncubatorIcon,
      tint: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      ring: "ring-emerald-200/70 dark:ring-emerald-800/60",
    },
    {
      label: "VC Network",
      icon: NetworkIcon,
      tint: "from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20",
      ring: "ring-indigo-200/70 dark:ring-indigo-800/60",
    },
    {
      label: "XIPHIAS Groups",
      icon: AngelIcon,
      tint: "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
      ring: "ring-cyan-200/70 dark:ring-cyan-800/60",
    },
    {
      label: "Legal Partners",
      icon: ScaleIcon,
      tint: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      ring: "ring-amber-200/70 dark:ring-amber-800/60",
    },
  ];

  return (
    <section aria-labelledby="trust-title" className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-emerald-600/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Trust
        </span>
        <h3 id="trust-title" className="text-lg font-semibold">
          Trusted by founders
        </h3>
      </div>

      {/* Badges */}
      <ul className="grid grid-cols-2 gap-3">
        {items.map(({ label, icon: Icon, tint, ring }) => (
          <li key={label}>
            <div
              className={[
                "group relative overflow-hidden rounded-xl p-3",
                "bg-gradient-to-br",
                tint,
                "ring-1",
                ring,
                "transition-colors",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10">
                  <Icon className="h-4 w-4 opacity-80" />
                </span>
                <span className="text-[14px] font-medium leading-tight">
                  {label}
                </span>
              </div>
              {/* subtle sheen on hover */}
              <span className="pointer-events-none absolute -top-8 right-0 h-24 w-24 rotate-45 bg-white/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </li>
        ))}
      </ul>

      {/* Quote */}
      <figure
        className="
          relative overflow-hidden rounded-2xl p-4
          bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900/60 dark:to-neutral-900/20
          ring-1 ring-slate-200/70 dark:ring-neutral-800/70
        "
      >
        <QuoteMark className="absolute -top-3 -left-2 h-16 w-16 opacity-10 dark:opacity-20" />
        <blockquote className="relative text-[15px] leading-7">
          “We got our Letter of Support in 6 weeks. The team’s guidance was spot
          on.”
        </blockquote>
        <figcaption className="mt-2 flex items-center gap-2 text-[13px] text-black/60 dark:text-gray-300">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            AS
          </span>
          — A. Sharma, SUV Founder
        </figcaption>
      </figure>

      {/* Tiny reassurance row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] opacity-80">
        <span className="inline-flex items-center gap-1">
          <ShieldIcon className="h-3.5 w-3.5" /> Data kept confidential
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" /> Fast response from our team
        </span>
        <span className="inline-flex items-center gap-1">
          <GlobeIcon className="h-3.5 w-3.5" /> Global founder community
        </span>
      </div>
    </section>
  );
}

/* ---------- Inline icons (no external libs) ---------- */
function IncubatorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M9 2h6v2l-1 1v4.2a6.5 6.5 0 1 1-4 0V5L9 4V2zm3 8a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z" />
    </svg>
  );
}
function NetworkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 3a3 3 0 1 1-2.83 4H7a3 3 0 1 1 0-2h2.17A3 3 0 0 1 12 3zm5 8a3 3 0 1 1-2 5.236V17h-6v-0.764A3 3 0 1 1 7 11h10z" />
    </svg>
  );
}
function AngelIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 3c-4.97 0-9 1.12-9 2.5S7.03 8 12 8s9-1.12 9-2.5S16.97 3 12 3zm0 6c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4z" />
    </svg>
  );
}
function ScaleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M11 3h2v3h5l-4 6h4a4 4 0 0 1-8 0h4l-4-6H11V3zM5 21h14v-2H5v2z" />
    </svg>
  );
}
function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M14 22c-2.2 0-4 1.8-4 4v8h8v-8h-4l4-8h-4l-4 8zm18 0c-2.2 0-4 1.8-4 4v8h8v-8h-4l4-8h-4l-4 8z" />
    </svg>
  );
}
function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2l8 4v6c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V6l8-4z" />
    </svg>
  );
}
function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 6h-2v6l5 3 .999-1.732L13 13V8z" />
    </svg>
  );
}
function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.9 0 3.6.66 4.95 1.76L12 9 7.05 5.76A7.96 7.96 0 0 1 12 4z" />
    </svg>
  );
}
