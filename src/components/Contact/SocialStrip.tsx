// src/components/Contact/SocialStrip.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

/* --------------------------------- Types --------------------------------- */
type Social = { label: string; href: string };
type Props = {
  phone?: string;
  altPhone?: string;
  email?: string;
  whatsapp?: string;
  address?: string[];
  hours?: string;
  socials?: Social[];
  className?: string;

  /** Anchor or route to your enquiry form, e.g. "#general-enquiry" */
  enquireHref?: string;

  /** Show inline quick actions row above the grid (mobile). Default: true */
  showInlineQuickActions?: boolean;

  /** Show sticky bottom CTA bar on mobile (like your SkilledHero). Default: true */
  showStickyBar?: boolean;

  /** Prefer these labels in sticky bar (we pick the first 2 available). */
  stickyBarPriority?: Array<"Call" | "WhatsApp" | "Email" | "Enquire">;
};

/* ------------------------------- Component ------------------------------- */

export default function SocialStrip({
  phone,
  altPhone,
  email,
  whatsapp,
  address = [],
  hours,
  socials = [],
  className = "",
  enquireHref,
  showInlineQuickActions = true,
  showStickyBar = true,
  stickyBarPriority = ["Enquire", "WhatsApp", "Call", "Email"],
}: Props) {
  const telHref = phone ? telLink(phone) : undefined;
  const altTelHref = altPhone ? telLink(altPhone) : undefined;
  const waHref = whatsapp ? buildWhatsApp(whatsapp) : undefined;
  const mapQuery = address?.length ? encodeURIComponent(address.join(", ")) : undefined;
  const mapHref = mapQuery ? `https://www.google.com/maps?q=${mapQuery}` : undefined;

  const actions = useMemo(() => {
    const base = [
      telHref ? { label: "Call" as const, href: telHref } : null,
      waHref ? { label: "WhatsApp" as const, href: waHref, external: true } : null,
      email ? { label: "Email" as const, href: `mailto:${email}` } : null,
      enquireHref ? { label: "Enquire" as const, href: enquireHref } : null,
    ].filter(Boolean) as { label: "Call" | "WhatsApp" | "Email" | "Enquire"; href: string; external?: boolean }[];

    // order by stickyBarPriority
    return [...base].sort(
      (a, b) => stickyBarPriority.indexOf(a.label) - stickyBarPriority.indexOf(b.label),
    );
  }, [telHref, waHref, email, enquireHref, stickyBarPriority]);

  return (
    <section
      aria-labelledby="contact-strip"
      className={[
        "rounded-3xl bg-white ring-1 ring-blue-100/80 p-6",
        "dark:bg-white/5 dark:ring-blue-900/30",
        "text-black dark:text-white",
        className,
      ].join(" ")}
    >
      <h2 id="contact-strip" className="sr-only">Contact options</h2>

      {/* ---------- mobile inline quick actions (large tap targets) ---------- */}
      {showInlineQuickActions && (
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-2">
            {actions
              .filter((a) => ["Call", "WhatsApp", "Email"].includes(a.label))
              .slice(0, 3)
              .map((a) => (
                <QuickAction
                  key={`qa-${a.label}`}
                  href={a.href}
                  external={a.external}
                  ariaLabel={a.label}
                >
                  {a.label === "Call" && <PhoneIcon />}
                  {a.label === "WhatsApp" && <WhatsAppIcon />}
                  {a.label === "Email" && <MailIcon />}
                  <span className="text-xs font-medium">{a.label}</span>
                </QuickAction>
              ))}
          </div>
        </div>
      )}

      {/* ------------------------------ main grid ----------------------------- */}
      <div className="mt-4 grid gap-6 md:mt-0 md:grid-cols-3">
        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {phone && (
              <li className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4" />
                <div>
                  <span className="font-medium">Phone: </span>
                  <a
                    className="underline decoration-blue-400 underline-offset-2 hover:decoration-blue-600"
                    href={telHref}
                    aria-label={`Call ${normalizeDigits(phone)}`}
                  >
                    {phone}
                  </a>
                  {altPhone ? (
                    <>
                      {" "}/{" "}
                      <a
                        className="underline decoration-blue-400 underline-offset-2 hover:decoration-blue-600"
                        href={altTelHref}
                        aria-label={`Call ${normalizeDigits(altPhone)}`}
                      >
                        {altPhone}
                      </a>
                    </>
                  ) : null}
                </div>
              </li>
            )}
            {email && (
              <li className="flex items-start gap-2">
                <MailIcon className="mt-0.5 h-4 w-4" />
                <div>
                  <span className="font-medium">Email: </span>
                  <a
                    className="underline decoration-blue-400 underline-offset-2 hover:decoration-blue-600"
                    href={`mailto:${email}`}
                    aria-label={`Email ${email}`}
                  >
                    {email}
                  </a>
                </div>
              </li>
            )}
            {whatsapp && (
              <li className="flex items-start gap-2">
                <WhatsAppIcon className="mt-0.5 h-4 w-4" />
                <div>
                  <span className="font-medium">WhatsApp: </span>
                  <a
                    className="underline decoration-green-400 underline-offset-2 hover:decoration-green-600"
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {whatsapp}
                  </a>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Address & hours */}
        <div>
          <h3 className="text-lg font-semibold">Head office</h3>
          <address className="mt-3 not-italic text-sm text-black/80 dark:text-white/80">
            {address.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </address>

          {hours ? (
            <div className="mt-2 flex items-start gap-2 text-sm text-black/80 dark:text-white/80">
              <ClockIcon className="mt-0.5 h-4 w-4" />
              <div>
                <span className="font-medium">Hours: </span>
                {hours}
              </div>
            </div>
          ) : null}

          {mapHref ? (
            <div className="mt-3">
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline decoration-blue-400 underline-offset-2 hover:decoration-blue-600"
                aria-label="Open address in Google Maps"
              >
                <ExternalIcon />
                Open in Google Maps
              </a>
            </div>
          ) : null}
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold">Connect</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm ring-1 ring-blue-200 backdrop-blur transition hover:bg-blue-50 dark:bg-white/5 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                aria-label={`Open ${s.label}`}
              >
                <SocialDot />
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------- sticky bottom CTA (mobile) --------------------- */}
      {showStickyBar && <StickyMobileBar actions={actions} />}
    </section>
  );
}

/* ------------------------------ Sticky bar ------------------------------ */

function StickyMobileBar({
  actions,
}: {
  actions: { label: "Call" | "WhatsApp" | "Email" | "Enquire"; href: string; external?: boolean }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Pick the first 2 actions
  const barActions = actions.slice(0, 2);
  if (!barActions.length) return null;

  return createPortal(
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-[999]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="mx-auto max-w-screen-sm px-3">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-2">
          {barActions.map((a) => (
            <Link
              key={`cta-${a.label}`}
              href={a.href}
              prefetch={false}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noopener noreferrer" : undefined}
              className={[
                "inline-flex flex-1 basis-1/2 items-center justify-center rounded-xl h-12 px-4 text-sm font-semibold transition",
                a.label === "Enquire"
                  ? "bg-gradient-to-r from-blue-500 via-purple-600 to-fuchsia-600 text-white shadow-lg hover:brightness-110"
                  : "bg-white text-black ring-1 ring-blue-200 hover:bg-blue-50",
              ].join(" ")}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ UI bits ------------------------------ */

function QuickAction({
  href,
  children,
  ariaLabel,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={[
        "flex h-12 items-center justify-center gap-2 rounded-xl",
        "bg-white text-black ring-1 ring-blue-200 hover:bg-blue-50",
        "dark:bg-white/5 dark:text-white dark:ring-blue-800/60 dark:hover:bg-blue-950/20",
        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.985]",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

/* ------------------------------- Helpers ------------------------------- */

function telLink(n: string) {
  return `tel:${stripSpaces(n)}`;
}
function stripSpaces(s: string) {
  return s.replace(/\s+/g, "");
}
function normalizeDigits(s: string) {
  return s.replace(/[^\d+]/g, "");
}
function buildWhatsApp(n: string) {
  const digits = normalizeDigits(n).replace(/^\+/, "");
  const text = encodeURIComponent("Hello! I’d like to talk to an immigration expert.");
  return `https://wa.me/${digits}?text=${text}`;
}

/* -------------------------------- Icons -------------------------------- */

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.91 15.91 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.49a1 1 0 01-1 1C11.3 22 2 12.7 2 1.99a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.21z"
      />
    </svg>
  );
}
function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8.24l7.4 6.17a1 1 0 001.2 0L20 8.24V18H4z"
      />
    </svg>
  );
}
function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      <path
        fill="currentColor"
        d="M19.11 17.36c-.29-.14-1.7-.84-1.96-.93-.26-.1-.44-.14-.63.14-.19.29-.73.93-.9 1.12-.17.2-.33.21-.62.07-.29-.14-1.23-.45-2.34-1.42-.86-.76-1.44-1.7-1.61-1.98-.17-.29-.02-.45.13-.59.14-.14.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.48-.63-.48-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1.01.98-1.01 2.39 0 1.41 1.03 2.77 1.18 2.96.14.19 2.02 3.09 4.89 4.34.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.14-.26-.21-.55-.36z"
      />
      <path
        fill="currentColor"
        d="M26.97 5.03A13.92 13.92 0 0016 .14C7.3.14.2 7.25.2 16c0 2.79.76 5.48 2.21 7.86L.03 31.86l8.18-2.32A15.77 15.77 0 0016 31.86C24.7 31.86 31.8 24.75 31.8 16c0-3.75-1.46-7.26-4.03-9.97zm-10.97 24.2c-2.54 0-5.02-.68-7.2-1.98l-.52-.31-4.85 1.38 1.37-4.72-.34-.53A12.88 12.88 0 013.12 16c0-7.09 5.78-12.88 12.88-12.88S28.88 8.91 28.88 16 23.09 29.23 16 29.23z"
      />
    </svg>
  );
}
function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm.75 10.44V7a.75.75 0 00-1.5 0v6a.75.75 0 00.22.53l3 3a.75.75 0 001.06-1.06z"
      />
    </svg>
  );
}
function ExternalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M14 3a1 1 0 000 2h3.586l-7.293 7.293a1 1 0 001.414 1.414L19 6.414V10a1 1 0 102 0V4a1 1 0 00-1-1h-6z" />
      <path fill="currentColor" d="M5 6a3 3 0 00-3 3v9a3 3 0 003 3h9a3 3 0 003-3v-4a1 1 0 10-2 0v4a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h4a1 1 0 100-2H5z" />
    </svg>
  );
}
function SocialDot({ className = "h-2 w-2" }: { className?: string }) {
  return <span aria-hidden className={`inline-block rounded-full bg-blue-500 ${className}`} />;
}
