'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { SubmenuItem } from '../menu.types';
import { cx, flagEmojiFromCode, flagImageSrcFromCode } from '../menu.utils';

interface MegaPanelProps {
  rootLabel: string;
  columns: SubmenuItem[];
  open: boolean;
  onClose: () => void;
}

function MenuFlag({ code, emoji }: { code?: string | null; emoji?: string | null }) {
  const src = flagImageSrcFromCode(code);
  const [imageFailed, setImageFailed] = React.useState(false);

  if (src && !imageFailed) {
    return (
      <Image
        src={src}
        alt=""
        aria-hidden
        width={20}
        height={15}
        unoptimized
        className="mt-0.5 h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10"
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (!emoji) return null;

  return <span className="text-base leading-none">{emoji}</span>;
}

export default function MegaPanel({ rootLabel, columns, open, onClose }: MegaPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const firstFocusRef = React.useRef<HTMLAnchorElement>(null);
  const toolsRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);

  const [query, setQuery] = React.useState('');
  const [toolsH, setToolsH] = React.useState(64);
  const [panelTop, setPanelTop] = React.useState<number>(84); // px from viewport top

  // measure nav anchor (rounded nav row) and set panel top = bottom + 10px
  const measureTop = React.useCallback(() => {
    const anchor = document.querySelector('[data-mega-anchor]') as HTMLElement | null;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPanelTop(Math.round(rect.bottom + 10)); // 👈 10px gap from nav row
  }, []);

  // update on open + while visible
  React.useEffect(() => {
    if (!open) return;
    measureTop();

    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureTop);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    const anchor = document.querySelector('[data-mega-anchor]') as HTMLElement | null;
    const ro = anchor ? new ResizeObserver(onScrollOrResize) : null;
    ro?.observe(anchor!);
    const onTransition = () => onScrollOrResize();
    anchor?.addEventListener('transitionend', onTransition);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      anchor?.removeEventListener('transitionend', onTransition);
      ro?.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, measureTop]);

  // Esc / outside
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDoc = (e: MouseEvent) => {
      const el = panelRef.current;
      if (el && !el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, onClose]);

  // focus first link
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFocusRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  // measure tools height so list gets exact height
  React.useEffect(() => {
    if (!open) return;
    const read = () => setToolsH(toolsRef.current?.offsetHeight ?? 64);
    read();
    const ro = new ResizeObserver(read);
    if (toolsRef.current) ro.observe(toolsRef.current);
    window.addEventListener('resize', read);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', read);
    };
  }, [open]);

  // Filter
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.submenu?.some((p) => p.label.toLowerCase().includes(q))
    );
  }, [columns, query]);

  // Heights based on live top value
  const PANEL_MAX_H = `calc(100vh - ${panelTop}px - 12px)`;
  const BODY_MAX_H  = `calc(100vh - ${panelTop}px - 12px - ${toolsH}px)`;

  if (!open) return null;

  return (
    <div
      role="menu"
      aria-label={`${rootLabel} menu`}
      className="fixed inset-x-0 z-[60]"
      style={{ top: panelTop }} // follows the nav row only
    >
          <div className="pointer-events-auto mx-auto w-full max-w-screen-2xl px-3 md:px-5">
            <div
              ref={panelRef}
              className={cx(
                'relative w-full overflow-hidden rounded-2xl ring-1 shadow-2xl backdrop-blur-xl backdrop-saturate-150',
                'ring-black/5 dark:ring-white/15',
                'bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.86)_100%)]',
                'dark:bg-[linear-gradient(180deg,rgba(14,14,14,0.94)_0%,rgba(22,22,22,0.86)_100%)]',
                'supports-[backdrop-filter:none]:bg-white/95 supports-[backdrop-filter:none]:dark:bg-zinc-900/95'
              )}
              style={{ maxHeight: PANEL_MAX_H }}
            >
              {/* Tools row (sticky) */}
              <div
                ref={toolsRef}
                className="sticky top-0 z-10 flex flex-col gap-2.5 border-b border-white/50 bg-white/70 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-3"
              >
                <h2 className="text-[11px] font-semibold tracking-wide uppercase text-zinc-900 dark:text-zinc-100">
                  Explore {rootLabel}
                </h2>
                <label className="relative inline-flex items-center">
                  <span className="sr-only">Filter {rootLabel}</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter by country or program…"
                    className={cx(
                      'w-[min(82vw,360px)] sm:w-80 rounded-lg border px-3 py-2 text-xs shadow-inner',
                      'bg-white/85 backdrop-blur-sm border-black/10 placeholder:text-zinc-500 text-zinc-900',
                      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent',
                      'dark:bg-zinc-900/85 dark:border-white/15 dark:text-zinc-100 dark:placeholder:text-zinc-400'
                    )}
                  />
                </label>
              </div>

              {/* Scrollable body */}
              <div
                className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4"
                style={{ maxHeight: BODY_MAX_H, scrollbarGutter: 'stable both-edges' } as React.CSSProperties}
              >
                <div
                  className={cx(
                    'grid gap-4 sm:gap-5',
                    'grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]'
                  )}
                >
                  {filtered.map((country, idx) => {
                    const any = country as any;
                    const code = any.code ?? any?.meta?.code;
                    const fallbackEmoji = any?.meta?.iconEmoji ?? (code ? flagEmojiFromCode(code) : null);
                    const isFirst = idx === 0;

                    return (
                      <section
                        key={country.label}
                        className={cx(
                          'group relative min-w-0 overflow-hidden rounded-2xl p-3.5 sm:p-4 transition-all duration-200 ease-out',
                          'ring-1 ring-black/5 dark:ring-white/10',
                          'bg-white/60 dark:bg-white/[0.04]',
                          'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-200',
                          'before:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_58%)]',
                          'dark:before:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_58%)]',
                          'hover:-translate-y-0.5 hover:bg-white/88 hover:ring-primary/20 hover:shadow-[0_20px_40px_-24px_rgba(37,99,235,0.45)] hover:before:opacity-100',
                          'dark:hover:bg-white/[0.07]'
                        )}
                      >
                        <Link
                          ref={isFirst ? firstFocusRef : undefined}
                          href={country.href}
                          className="inline-flex items-start gap-1.5 text-[14px] font-semibold text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-zinc-100"
                          onClick={onClose}
                        >
                          {(code || fallbackEmoji) && <MenuFlag code={code} emoji={fallbackEmoji} />}
                          <span className="break-words leading-tight transition-colors duration-200 group-hover:text-primary">
                            {country.label}
                          </span>
                        </Link>

                        {country.submenu && country.submenu.length > 0 && (
                          <ul className="mt-2.5 space-y-1.5">
                            {country.submenu.slice(0, 3).map((p) => (
                              <li key={p.label}>
                                <Link
                                  href={p.href}
                                  className={cx(
                                    'relative flex items-start rounded-lg px-2 py-1.5 text-[13px] text-zinc-800 transition-all duration-200 dark:text-zinc-200',
                                    'before:mr-2 before:mt-[9px] before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-zinc-300 dark:before:bg-zinc-500',
                                    'hover:bg-primary/[0.07] hover:text-primary hover:before:bg-primary/70 hover:shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]',
                                    'dark:hover:bg-primary/[0.14]',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                                  )}
                                  onClick={onClose}
                                >
                                  <span className="truncate">{p.label}</span>
                                </Link>
                              </li>
                            ))}
                            {country.submenu.length > 3 && (
                              <li>
                                <Link
                                  href={country.href}
                                  className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold text-primary transition-all duration-200 hover:bg-primary/[0.08] hover:gap-1.5 hover:shadow-[0_10px_20px_-18px_rgba(37,99,235,0.8)] dark:hover:bg-primary/[0.14]"
                                  onClick={onClose}
                                >
                                  View all {country.submenu.length} programs
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                                  </svg>
                                </Link>
                              </li>
                            )}
                          </ul>
                        )}
                      </section>
                    );
                  })}
                </div>

                {filtered.length === 0 && (
                  <div className="flex items-center justify-center py-14 text-xs text-zinc-700 dark:text-zinc-300">
                    No matches. Try a different term.
                  </div>
                )}
              </div>

              <span className="sr-only">Press Escape to close the {rootLabel} menu.</span>
            </div>
          </div>
    </div>
  );
}
