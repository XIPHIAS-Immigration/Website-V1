// components/Contact/ContactHero.tsx
import * as React from "react";

type Props = {
  headline: string;
  sub: string;
  phone: string;     // e.g. "+91 9021335577"
  email: string;     // e.g. "immigration@xiphias.in"
  whatsapp?: string;
  responseNote?: string;
  badge?: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  stats?: Array<{ value: string; label: string }>;
};

export default function ContactHero({
  headline,
  sub,
  phone,
  email,
  whatsapp,
  responseNote,
  badge = "Private Client Service",
  ctaHref,
  ctaLabel = "Enquire now",
  className,
  stats,
}: Props) {
  const telHref = `tel:${stripSpaces(phone)}`;
  const mailHref = `mailto:${email}`;
  const waHref = whatsapp ? buildWhatsApp(whatsapp) : undefined;

  const subId = "contact-hero-sub";
  const noteId = "contact-hero-note";

  return (
    <section
      aria-labelledby="contact-hero"
      aria-describedby={[subId, responseNote ? noteId : undefined].filter(Boolean).join(" ") || undefined}
      className={[
        // mobile-first compact layout, generous on larger screens
        "relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        "text-black dark:text-white",
        className,
      ].filter(Boolean).join(" ")}
      role="region"
    >
      <HeroBackdrop />

      <div className="relative">
        {/* Kicker */}
        {badge ? (
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            {badge}
          </span>
        ) : null}

        {/* Headline */}
        <h1
          id="contact-hero"
          className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-tight sm:text-4xl md:text-5xl"
        >
          {headline}
        </h1>

        {/* Subcopy */}
        <p
          id={subId}
          className="mt-2 max-w-prose text-[15px] leading-7 text-black/80 dark:text-white/80 sm:text-[16px]"
        >
          {sub}
        </p>

        {/* CTAs — mobile: full-width grid, desktop: inline row */}
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <ActionButton
              href={telHref}
              intent="primary"
              ariaLabel={`Call ${normalizeDigits(phone)}`}
              className="w-full sm:w-auto"
            >
              <PhoneIcon />
              <span>Call</span>
            </ActionButton>

            <ActionButton
              href={mailHref}
              intent="secondary"
              ariaLabel={`Email ${email}`}
              className="w-full sm:w-auto"
            >
              <OpenIcon />
              <span>Email</span>
            </ActionButton>

            {waHref ? (
              <ActionButton
                href={waHref}
                intent="whatsapp"
                ariaLabel="Chat on WhatsApp"
                className="col-span-2 sm:col-span-1 w-full sm:w-auto"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </ActionButton>
            ) : null}

            {ctaHref ? (
              <ActionButton
                href={ctaHref}
                intent="ghost"
                ariaLabel={ctaLabel}
                className="col-span-2 sm:col-span-1 w-full sm:w-auto"
              >
                <ArrowRight />
                <span>{ctaLabel}</span>
              </ActionButton>
            ) : null}
          </div>

          {responseNote ? (
            <p
              id={noteId}
              className="mt-2 text-xs text-black/70 dark:text-white/70"
            >
              {responseNote}
            </p>
          ) : null}
        </div>

        {/* Stats — swipeable on mobile, grid on md+ */}
        {!!stats?.length && (
          <>
            {/* Mobile: horizontal scroll pills */}
            <ul
              className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden snap-x"
              aria-label="Highlights"
            >
              {stats.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  className="min-w-[9.5rem] snap-start rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100/70 backdrop-blur dark:bg-white/5 dark:ring-blue-900/40"
                >
                  <div className="text-base font-semibold leading-tight">{s.value}</div>
                  <div className="text-xs text-black/70 dark:text-white/70">{s.label}</div>
                </li>
              ))}
            </ul>

            {/* md+: grid */}
            <ul
              className={[
                "mt-5 hidden gap-4 sm:grid",
                stats.length === 2 ? "sm:grid-cols-2" : "",
                stats.length === 3 ? "sm:grid-cols-3" : "",
                stats.length >= 4 ? "sm:grid-cols-4" : "",
              ].join(" ")}
            >
              {stats.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  className="rounded-2xl ring-1 ring-blue-100/70 bg-white/80 px-4 py-3 backdrop-blur dark:bg-white/5 dark:ring-blue-900/40"
                >
                  <div className="text-lg font-semibold leading-tight">{s.value}</div>
                  <div className="text-sm text-black/70 dark:text-white/70">{s.label}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

/* -------------------------- helpers & subcomponents -------------------------- */

function stripSpaces(s: string) {
  return s.replace(/\s+/g, "");
}
function normalizeDigits(s: string) {
  return s.replace(/[^\d+]/g, "");
}
/** wa.me link with a friendly prefill. */
function buildWhatsApp(phone: string) {
  const digits = normalizeDigits(phone);
  const text = encodeURIComponent("Hello! I’d like to talk to an immigration expert.");
  return `https://wa.me/${digits.replace(/^\+/, "")}?text=${text}`;
}

/** Decorative background: lighter on mobile to reduce contrast */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/15 sm:h-64 sm:w-64" />
      <div className="absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/15 sm:h-72 sm:w-72" />
      <div className="absolute inset-0 opacity-35 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:22px_22px]" />
      </div>
    </div>
  );
}

/** Unified action button styles (mobile-friendly hit area) */
function ActionButton({
  href,
  children,
  intent = "primary",
  ariaLabel,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  intent?: "primary" | "secondary" | "ghost" | "whatsapp";
  ariaLabel?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition focus:outline-none focus-visible:ring-2 active:scale-[0.985] min-h-[44px] text-sm";
  const ringCommon = "ring-1";

  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 " + ringCommon + " ring-blue-700/20",
    secondary:
      "bg-white/90 text-blue-700 hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 " +
      ringCommon +
      " ring-blue-300 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 focus-visible:ring-blue-600",
    ghost:
      "bg-white/80 text-black hover:bg-white dark:bg-white/5 dark:text-white " +
      ringCommon +
      " ring-blue-200/50 dark:ring-blue-900/40 focus-visible:ring-blue-600",
    whatsapp:
      "bg-[#25D366] text-black hover:bg-[#1ED760] " +
      ringCommon +
      " ring-black/10 focus-visible:ring-black/40 dark:text-black",
  };

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={[base, variants[intent], className].join(" ")}
      rel="noopener noreferrer"
      {...(intent === "whatsapp" ? { target: "_blank" } : {})}
    >
      {children}
    </a>
  );
}

/* ------------------------------- inline icons ------------------------------- */

function ArrowRight() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function OpenIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 0 0 2h3.586l-7.293 7.293a1 1 0 0 0 1.414 1.414L19 6.414V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4a1 1 0 1 0-2 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2H5z"
      />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.91 15.91 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.49a1 1 0 01-1 1C11.3 22 2 12.7 2 1.99a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.21z"
      />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M19.11 17.36c-.29-.14-1.7-.84-1.96-.93-.26-.1-.44-.14-.63.14-.19.29-.73.93-.9 1.12-.17.2-.33.21-.62.07-.29-.14-1.23-.45-2.34-1.42-.86-.76-1.44-1.7-1.61-1.98-.17-.29-.02-.45.13-.59.14-.14.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.48-.63-.48-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1.01.98-1.01 2.39 0 1.41 1.03 2.77 1.18 2.96.14.19 2.02 3.09 4.89 4.34.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.14-.26-.21-.55-.36z"
      />
      <path
        fill="currentColor"
        d="M26.97 5.03A13.92 13.92 0 0016 .14C7.3.14.2 7.25.2 16c0 2.79.76 5.48 2.21 7.86L.03 31.86l8.18-2.32A15.77 15.77 0 0016 31.86C24.7 31.86 31.8 24.75 31.8 16c-3.75 0-7.26-1.46-9.97-4.03z"
      />
    </svg>
  );
}
