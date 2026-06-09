'use client';

import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/xiphiasimmigration',
    Icon: Facebook,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/xiphias.immigration/',
    Icon: Instagram,
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/XiphiasInfo',
    Icon: Twitter,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@immigrationxiphias5228',
    Icon: Youtube,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/xiphias-immigration-pvt-limited?trk=prof-following-company-logo',
    Icon: Linkedin,
  },
];

export default function SocialSidebar() {
  return (
    <aside
      aria-label="Social media links"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-px"
    >
      {SOCIALS.map(({ label, href, Icon }, i) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={[
            /* Fixed size — never changes, so siblings never jump */
            'group relative flex h-10 w-10 items-center justify-center',
            /* Colours */
            'bg-primary/80 text-white hover:bg-primary',
            /* Only transform + bg transition — no width/layout changes */
            'transition-[background-color,transform,box-shadow] duration-200 ease-out',
            /* Slide 3 px left on hover — smooth, affects only this element */
            'hover:-translate-x-[3px]',
            'shadow-[-2px_2px_8px_rgba(0,0,0,0.18)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset',
            /* Rounded corners only on the exposed edge */
            i === 0 ? 'rounded-tl-lg' : '',
            i === SOCIALS.length - 1 ? 'rounded-bl-lg' : '',
            'border-b border-white/10 last:border-b-0',
          ].join(' ')}
        >
          <Icon
            className="h-[1.05rem] w-[1.05rem] shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
            aria-hidden
          />

          {/* Tooltip — absolute, zero layout impact on siblings */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-md bg-zinc-900/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {label}
          </span>
        </a>
      ))}
    </aside>
  );
}
