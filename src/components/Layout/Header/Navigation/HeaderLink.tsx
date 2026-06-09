// FILE: src/components/Layout/Header/Navigation/HeaderLink.tsx
// (no functional changes; included here for completeness)
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaPanel from './MegaPanel';
import type { HeaderItem } from '../menu.types';

type Props = { item: HeaderItem };

function usePointerAndMotion() {
  const [state, setState] = React.useState({ reduced: false, enableHover: false });

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      setState({ reduced: false, enableHover: false });
      return;
    }
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqPointer = window.matchMedia('(pointer: fine)');

    const apply = () =>
      setState({
        reduced: mqMotion.matches,
        enableHover: mqPointer.matches,
      });

    const add = (mql: MediaQueryList, cb: () => void) =>
      (mql.addEventListener ? mql.addEventListener('change', cb) : mql.addListener(cb));
    const remove = (mql: MediaQueryList, cb: () => void) =>
      (mql.removeEventListener ? mql.removeEventListener('change', cb) : mql.removeListener(cb));

    apply();
    add(mqMotion, apply);
    add(mqPointer, apply);
    return () => {
      remove(mqMotion, apply);
      remove(mqPointer, apply);
    };
  }, []);

  return state;
}

export default function HeaderLink({ item }: Props) {
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const { enableHover } = usePointerAndMotion();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hoverTimer = React.useRef<number | null>(null);
  const lastTapOrClickRef = React.useRef<number>(0);

  const stableId = React.useMemo(() => {
    const base = (item as any).id ?? item.href ?? item.label ?? Math.random().toString(36).slice(2);
    return String(base).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');
  }, [item]);

  const isActive = !!item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'));
  const hasMenu = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isRealLink = typeof item.href === 'string' && item.href.length > 0;

  React.useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const clearTimer = () => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };
  const openWithIntent = (delay = 60) => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const closeWithIntent = (delay = 120) => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => setOpen(false), delay);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!hasMenu) return;
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      (linkRef.current ?? buttonRef.current)?.focus();
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!hasMenu) return;
    const now = performance.now();
    if (!open || now - lastTapOrClickRef.current > 600) {
      e.preventDefault();
      setOpen(true);
      lastTapOrClickRef.current = now;
    }
  };

  const onMouseEnter = hasMenu && enableHover ? () => openWithIntent() : undefined;
  const onMouseLeave = hasMenu && enableHover ? () => closeWithIntent() : undefined;

  React.useEffect(() => {
    if (!open) return;
    const handle = (ev: MouseEvent) => {
      const el = wrapperRef.current;
      if (el && !el.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  React.useEffect(() => () => clearTimer(), []);

  const basePill =
    'relative inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[14px] font-medium leading-6 outline-none transition-all duration-200 ease-out';
  const colorIdle =
    'text-white/90 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40';
  const colorActive =
    'text-white after:pointer-events-none after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-secondary';
  const pillBg = isActive
    ? ''
    : 'hover:text-white hover:bg-white/10 hover:rounded-xl';

  const shouldInterceptClick = !enableHover;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isRealLink ? (
        <Link
          href={item.href!}
          ref={linkRef}
          className={[basePill, pillBg, isActive ? colorActive : colorIdle].join(' ')}
          aria-haspopup={hasMenu ? 'menu' : undefined}
          aria-expanded={hasMenu ? open : undefined}
          aria-controls={hasMenu ? `mega-${stableId}` : undefined}
          onKeyDown={onKeyDown}
          onTouchStart={hasMenu ? onTouchStart : undefined}
          onClick={
            hasMenu && shouldInterceptClick
              ? (e) => {
                  const now = performance.now();
                  const delta = now - lastTapOrClickRef.current;
                  if (!open || delta > 600) {
                    e.preventDefault();
                    setOpen(true);
                    lastTapOrClickRef.current = now;
                  }
                }
              : undefined
          }
        >
          <span>{item.label}</span>
        </Link>
      ) : (
        <button
          type="button"
          ref={buttonRef}
          className={[basePill, pillBg, isActive ? colorActive : colorIdle].join(' ')}
          aria-haspopup={hasMenu ? 'menu' : undefined}
          aria-expanded={hasMenu ? open : undefined}
          aria-controls={hasMenu ? `mega-${stableId}` : undefined}
          onKeyDown={onKeyDown}
          onTouchStart={hasMenu ? onTouchStart : undefined}
          onClick={hasMenu ? () => setOpen((s) => !s) : undefined}
        >
          <span>{item.label}</span>
        </button>
      )}

      {hasMenu && (
        <div id={`mega-${stableId}`} role="region" aria-label={`${item.label} menu`}>
          <MegaPanel
            rootLabel={item.label}
            columns={item.submenu!}
            open={open}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
