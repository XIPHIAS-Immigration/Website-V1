'use client';

import * as React from 'react';
import Link from 'next/link';
import { Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';

export default function TopBar() {
  return (
    <div className="hidden lg:block">
      <div className="mx-auto max-w-screen-2xl px-4">
        <div
          className={[
            'grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2 px-2',
            'text-[13px] leading-6 text-white',
            'rounded-xl ring-1 ring-white/10',
            'bg-white/[0.08] backdrop-blur-md',
          ].join(' ')}
        >
          {/* Contact chips */}
          <div className="flex items-center gap-2 xl:gap-3">
            {/* 🔧 FIXED: tel: now matches the displayed number +91 9021335577 */}
            <Chip
              href="tel:+919021335577"
              label="+91 9021335577"
              ariaLabel="Call +91 9021335577"
            />
            <Chip
              href="mailto:immigration@xiphias.in"
              label="immigration@xiphias.in"
              ariaLabel="Email immigration@xiphias.in"
            />
          </div>

          {/* Center: GlobalSearch trigger (real, pill-style) */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <GlobalSearch placeholder="Search..." />
            </div>
          </div>

          {/* Social + Login */}
          <div className="flex items-center justify-end gap-1.5">
            <CircleLink href="https://www.facebook.com/xiphiasimmigration" label="Facebook">
              <Facebook className="h-4 w-4" aria-hidden />
            </CircleLink>
            <CircleLink href="https://www.instagram.com/xiphias.immigration/" label="Instagram">
              <Instagram className="h-4 w-4" aria-hidden />
            </CircleLink>
            <CircleLink href="https://x.com/XiphiasInfo" label="Twitter">
              <Twitter className="h-4 w-4" aria-hidden />
            </CircleLink>
            <CircleLink href="https://www.youtube.com/@immigrationxiphias5228" label="Youtube">
              <Youtube className="h-4 w-4" aria-hidden />
            </CircleLink>
            <CircleLink
              href="https://www.linkedin.com/company/xiphias-immigration-pvt-limited?trk=prof-following-company-logo"
              label="Linkedin"
            >
              <Linkedin className="h-4 w-4" aria-hidden />
            </CircleLink>
            <Link
              href="https://www.xiphiasimmigration.com/XIPHIAS/Account/Login"
              className="ml-1 inline-flex h-8 items-center justify-center rounded-full bg-primary/45 px-3 text-[12px] text-white ring-1 ring-white/20 hover:bg-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Sub components
---------------------------------------------- */

function Chip({ href, label, ariaLabel }: { href: string; label: string; ariaLabel: string }) {
  const isTel = href.startsWith('tel');
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-primary/45 px-3 py-1.5 text-white ring-1 ring-white/20 hover:bg-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-primary">
        {isTel ? (
          <Phone className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Mail className="h-3.5 w-3.5" aria-hidden />
        )}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}

function CircleLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      title={label}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/45 text-white ring-1 ring-white/20 hover:bg-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {children}
    </a>
  );
}
