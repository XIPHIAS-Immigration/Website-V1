'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
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
  const [failed, setFailed] = React.useState(false);
  if (src && !failed) {
    return (
      <Image
        src={src} alt="" aria-hidden width={18} height={13} unoptimized
        className="mt-px h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10"
        onError={() => setFailed(true)}
      />
    );
  }
  if (!emoji) return null;
  return <span className="text-sm leading-none shrink-0">{emoji}</span>;
}

const MAX_VISIBLE = 5;

export default function MegaPanel({ rootLabel, columns, open, onClose }: MegaPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rafRef   = React.useRef<number | null>(null);

  const [query,    setQuery]    = React.useState('');
  const [panelTop, setPanelTop] = React.useState(84);

  const measureTop = React.useCallback(() => {
    const anchor = document.querySelector('[data-mega-anchor]') as HTMLElement | null;
    if (!anchor) return;
    setPanelTop(Math.round(anchor.getBoundingClientRect().bottom + 8));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    measureTop();
    const tick = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureTop);
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, measureTop]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => { if (!open) setQuery(''); }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return columns;
    return columns
      .map(c => {
        const nameMatch = c.label.toLowerCase().includes(q);
        const matched   = c.submenu?.filter(p => p.label.toLowerCase().includes(q)) ?? [];
        if (!nameMatch && matched.length === 0) return null;
        return nameMatch ? c : { ...c, submenu: matched };
      })
      .filter(Boolean) as SubmenuItem[];
  }, [columns, query]);

  if (!open) return null;

  const PANEL_MAX_H = `calc(100vh - ${panelTop}px - 16px)`;
  const BODY_MAX_H  = `calc(100vh - ${panelTop}px - 16px - 44px - 36px)`;

  return (
    <div
      className="fixed inset-x-0 z-[60] pointer-events-none"
      style={{ top: panelTop }}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-2 sm:px-4 pointer-events-auto">
        <div
          ref={panelRef}
          role="menu"
          aria-label={`${rootLabel} menu`}
          className="mega-panel-enter w-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.20),0_4px_16px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.06] dark:bg-zinc-900 dark:ring-white/10"
          style={{ maxHeight: PANEL_MAX_H }}
        >
          {/* ── Sticky header ── */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-100 bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Explore {rootLabel}
            </span>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 h-3 w-3 text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter country or program…"
                className="w-48 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-7 pr-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              />
            </label>
          </div>

          {/* ── Grid body ── */}
          <div
            className="overflow-y-auto overscroll-contain p-3"
            style={{ maxHeight: BODY_MAX_H, scrollbarGutter: 'stable both-edges' } as React.CSSProperties}
          >
            {filtered.length > 0 ? (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))' }}
              >
                {filtered.map(country => {
                  const any     = country as any;
                  const code    = any.code ?? any?.meta?.code;
                  const emoji   = any?.meta?.iconEmoji ?? (code ? flagEmojiFromCode(code) : null);
                  const progs   = country.submenu ?? [];
                  const visible = progs.slice(0, MAX_VISIBLE);
                  const extra   = progs.length - MAX_VISIBLE;

                  return (
                    <div
                      key={country.label}
                      className={cx(
                        'group relative flex flex-col gap-2 rounded-xl p-3 transition-all duration-150',
                        'ring-1 ring-zinc-100 hover:ring-primary/20 dark:ring-white/[0.07] dark:hover:ring-primary/25',
                        'bg-white hover:bg-primary/[0.03] dark:bg-white/[0.02] dark:hover:bg-primary/[0.08]',
                        'before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-200',
                        'before:bg-[radial-gradient(circle_at_top_left,rgba(28,87,180,0.10),transparent_60%)]',
                        'hover:before:opacity-100'
                      )}
                    >
                      {/* Country name */}
                      <Link
                        href={country.href}
                        onClick={onClose}
                        className="relative flex items-center gap-2 min-w-0"
                      >
                        <MenuFlag code={code} emoji={emoji} />
                        <span className="truncate text-[13px] font-bold text-zinc-800 group-hover:text-primary transition-colors duration-150 dark:text-zinc-200">
                          {country.label}
                        </span>
                      </Link>

                      {/* Programs */}
                      {visible.length > 0 && (
                        <ul className="relative flex flex-col gap-0.5">
                          {visible.map(p => (
                            <li key={p.label}>
                              <Link
                                href={p.href}
                                onClick={onClose}
                                className="flex items-center gap-1.5 rounded-md px-1.5 py-[5px] text-[11.5px] leading-tight text-zinc-500 hover:text-primary hover:bg-primary/[0.06] transition-colors duration-100 dark:text-zinc-400 dark:hover:text-primary dark:hover:bg-primary/[0.12] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                              >
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                <span className="truncate">{p.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* View all remaining */}
                      {extra > 0 && (
                        <Link
                          href={country.href}
                          onClick={onClose}
                          className="relative inline-flex items-center gap-1 pl-1.5 text-[11px] font-semibold text-primary/60 hover:text-primary transition-colors duration-100"
                        >
                          +{extra} more program{extra !== 1 ? 's' : ''} →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-12 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>

          {/* ── Sticky footer ── */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-zinc-100 bg-white/95 px-4 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
            <span className="text-[11px] text-zinc-400">{filtered.length} countr{filtered.length !== 1 ? 'ies' : 'y'}</span>
            <span className="text-[11px] text-zinc-400">
              Press <kbd className="rounded bg-zinc-100 px-1 py-px font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
