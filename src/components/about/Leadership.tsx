// components/about/Leadership.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

type CredentialLogo = {
  name: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
  width: number;
  height: number;
};

const CREDENTIAL_LOGOS: CredentialLogo[] = [
  {
    name: "IMC Fellow Directory",
    href: "https://investmentmigration.org/fellow-members-directory/",
    logoSrc: "/images/personal/credentials/imc-fellow-logo.svg",
    logoAlt: "IMC Fellow members directory logo",
    width: 500,
    height: 200,
  },
  {
    name: "IMI Professionals",
    href: "https://www.imidaily.com/imi-professionals/",
    logoSrc: "/images/personal/credentials/imi-professionals-logo.png",
    logoAlt: "IMI Professionals logo",
    width: 344,
    height: 163,
  },
];

export default function Leadership() {
  const titleId = "leadership-title";

  return (
    <section id="leadership" className="py-6 md:py-6">
      {/* container aligned with hero + overflow safety */}
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">
        {/* gradient, ringed wrapper (hero aesthetic) */}
        <div
          aria-labelledby={titleId}
          className={[
            "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
            "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
            "ring-1 ring-blue-100/80 shadow-sm",
            "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
            "text-black dark:text-white",
          ].join(" ")}
        >
          {/* soft background accents (clipped) */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="hidden sm:block absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="hidden sm:block absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
            <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          </div>

          {/* header */}
          <header className="relative mb-6 md:mb-8">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
              <Dot className="mr-1.5" />
              Leadership
            </span>

            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px] break-words"
            >
              Guided by Experience &amp; Ethics
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
              17+ years of global immigration expertise with an uncompromising stance on integrity and
              compliance.
            </p>
          </header>

          {/* content */}
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            {/* portrait */}
            <div className="relative aspect-[2/2] w-full overflow-hidden rounded-3xl border border-blue-100/70 bg-white/70 ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
              <Image
                src="/images/avtar/varun-singh.png"
                alt="Portrait of Varun Singh, Managing Director at XIPHIAS Immigration"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* bio */}
            <div className="min-w-0">
              <h3 className="text-xl font-semibold leading-tight break-words">Varun Singh</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Managing Director | Fellow, Investment Migration Council | IMI Professional
              </p>

              <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 break-words">
                With over 17 years of expertise in investment migration, resettlement, and international business expansion, Varun Singh is a trusted advisor to global investors, entrepreneurs, and high-net-worth individuals. As Managing Director of XIPHIAS Immigration and XIPHIAS Projects, and a certified IMC Fellow with CPD credentials, he leads award-winning teams delivering compliant, future-ready solutions across citizenship- and residency-by-investment, global real estate, and cross-border business growth-backed by a strong network of government partners, legal specialists, and developers to secure high-impact, high-yield outcomes.
              </p>

              {/* badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>
                  <Shield /> Regulation-first practice
                </Badge>
                <Badge>
                  <Award /> 17+ years leadership
                </Badge>
                <Badge>
                  <Globe /> Multi-jurisdiction programs
                </Badge>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Verified memberships
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CREDENTIAL_LOGOS.map((item: CredentialLogo) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-white/10 dark:bg-white/5"
                      aria-label={`${item.name} (opens in a new tab)`}
                    >
                      <Image
                        src={item.logoSrc}
                        alt={item.logoAlt}
                        width={item.width}
                        height={item.height}
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {item.name}
                      </span>
                      <ExternalLinkIcon />
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA row */}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="https://www.linkedin.com/in/varunxiphias/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label="View XIPHIAS Immigration on LinkedIn"
                >
                  LinkedIn
                  <ArrowRight />
                </Link>
                <Link
                  href="/booking"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                  aria-label="Book a Consultation"
                >
                  Book a Consultation
                </Link>
              </div>

              {/* small fact strip */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <Stat label="Years" value="17+" />
                <Stat label="Countries" value="50+" />
                <Stat label="Programs" value="160+" />
              </div>
              <p className="mt-2 text-center text-[11px] text-zinc-600 dark:text-zinc-400">
                ICCRC | MARA | IMC aligned practices
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* small UI atoms (inline for portability) */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg:white/5 dark:bg-white/5 dark:ring-blue-800">
      {children}
    </span>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-black/30">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`} />
  );
}
function Shield() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-blue-700 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
    </svg>
  );
}
function Award() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-blue-700 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M8 12l-2 8 6-3 6 3-2-8" />
    </svg>
  );
}
function Globe() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-blue-700 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2c3 4 3 14 0 20M12 2c-3 4-3 14 0 20" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-zinc-400 transition group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-300"
    >
      <path
        fill="currentColor"
        d="M14.75 3a.75.75 0 0 0 0 1.5h3.69L10 12.94a.75.75 0 1 0 1.06 1.06L19.5 5.56v3.69a.75.75 0 0 0 1.5 0V3.75A.75.75 0 0 0 20.25 3h-5.5ZM5.5 6A2.5 2.5 0 0 0 3 8.5v10A2.5 2.5 0 0 0 5.5 21h10a2.5 2.5 0 0 0 2.5-2.5v-6a.75.75 0 0 0-1.5 0v6a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h6a.75.75 0 0 0 0-1.5h-6Z"
      />
    </svg>
  );
}