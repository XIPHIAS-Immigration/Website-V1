// FILE: src/components/Layout/Header/index.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import { headerMenu } from './Navigation/menu.data';
import Logo from './LogoWhite';
import HeaderLink from './Navigation/HeaderLink';
import MobileHeaderLink from './Navigation/MobileHeaderLink';
import TopBar from './Navigation/TopBar';
import GlobalSearch from '@/components/GlobalSearch';

import { Menu, X, Moon, Sun, LogIn } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const navAnchorRef = useRef<HTMLDivElement>(null); // 👈 anchor = nav row (rounded bar)
  const lastYRef = useRef(0);
  const rAFRef = useRef<number | null>(null);
  const burgerBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const colorMode = useMemo(() => (resolvedTheme || theme) ?? 'light', [resolvedTheme, theme]);
  const isDark = colorMode === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Write CSS var used by MegaPanel: ALWAYS 10px under nav row bottom
  const setMegaTopImmediate = () => {
    const rect = navAnchorRef.current?.getBoundingClientRect();
    const topPx = Math.round((rect?.bottom ?? 74) + 10); // 10px desired gap
    document.documentElement.style.setProperty('--nav-mega-top', `${topPx}px`);
    const headerHeight = Math.round(headerRef.current?.getBoundingClientRect().height ?? 72);
    document.documentElement.style.setProperty('--header-h', `${headerHeight}px`);
  };
  const setMegaTop = () => {
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(setMegaTopImmediate);
  };

  // Direction-aware scroll + keep CSS var in sync while scrolling
  useEffect(() => {
    lastYRef.current = window.scrollY || 0;
    const DELTA = 12;
    const HIDE_AT = 140;
    const SHOW_AT = 40;
    const COMPACT_AT = 80;

    const onScroll = () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const dy = y - lastYRef.current;

        if (Math.abs(dy) >= DELTA) {
          const goingDown = dy > 0;
          const goingUp = dy < 0;
          setCompact(y > COMPACT_AT);
          if (goingDown && y > HIDE_AT) setShowTopBar(false);
          if (goingUp && y < SHOW_AT) setShowTopBar(true);
          lastYRef.current = y <= 0 ? 0 : y;
        }
        setMegaTopImmediate(); // keep anchor -> panel gap correct
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    setMegaTopImmediate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  // Recompute CSS var on layout changes / transitions (TopBar expand/collapse) + anchor resizes
  useEffect(() => {
    const onResize = () => setMegaTop();
    const onHeaderTransitionEnd = (e: TransitionEvent) => {
      if (
        typeof e.propertyName === 'string' &&
        (e.propertyName.includes('height') ||
          e.propertyName.includes('padding') ||
          e.propertyName.includes('max-height') ||
          e.propertyName.includes('transform'))
      ) {
        setMegaTop();
      }
    };
    const onAnchorTransitionEnd = onHeaderTransitionEnd;

    window.addEventListener('resize', onResize);
    headerRef.current?.addEventListener('transitionend', onHeaderTransitionEnd as any);
    navAnchorRef.current?.addEventListener('transitionend', onAnchorTransitionEnd as any);

    // Observe anchor size changes (safer than relying only on transitionend)
    if (navAnchorRef.current) {
      roRef.current = new ResizeObserver(() => setMegaTop());
      roRef.current.observe(navAnchorRef.current);
    }

    setMegaTopImmediate();

    return () => {
      window.removeEventListener('resize', onResize);
      headerRef.current?.removeEventListener('transitionend', onHeaderTransitionEnd as any);
      navAnchorRef.current?.removeEventListener('transitionend', onAnchorTransitionEnd as any);
      roRef.current?.disconnect();
      roRef.current = null;
    };
  }, [showTopBar, compact]);

  // Close drawer on route change
  useEffect(() => {
    if (drawerOpen) setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Body lock + focus trap for drawer
  useEffect(() => {
    const docEl = document.documentElement;
    const prevOverflow = docEl.style.overflow;
    const prevPadRight = docEl.style.paddingRight;

    if (drawerOpen) {
      const sw = window.innerWidth - docEl.clientWidth;
      docEl.style.overflow = 'hidden';
      if (sw > 0) docEl.style.paddingRight = `${sw}px`;

      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a,button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        firstFocusableRef.current = focusables[0];
        lastFocusableRef.current = focusables[focusables.length - 1];
        setTimeout(() => firstFocusableRef.current?.focus(), 10);
      }

      return () => {
        docEl.style.overflow = prevOverflow;
        docEl.style.paddingRight = prevPadRight;
        burgerBtnRef.current?.focus();
      };
    }
  }, [drawerOpen]);

  // Esc + Tab cycle (drawer)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!drawerOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerOpen(false);
      } else if (e.key === 'Tab') {
        const first = firstFocusableRef.current;
        const last = lastFocusableRef.current;
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Reduced motion
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(m.matches);
    apply();
    m.addEventListener?.('change', apply);
    return () => m.removeEventListener?.('change', apply);
  }, []);

  // Swipe-to-close (mobile)
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    let startX = 0,
      currentX = 0,
      dragging = false;

    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      currentX = startX;
      dragging = true;
      drawer.style.transition = 'none';
    };
    const onMove = (e: TouchEvent) => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;
      const dx = Math.max(0, currentX - startX);
      drawer.style.transform = `translateX(${dx}px)`;
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const dx = Math.max(0, currentX - startX);
      drawer.style.transition = '';
      drawer.style.transform = '';
      if (dx > 60) setDrawerOpen(false);
    };

    drawer.addEventListener('touchstart', onStart, { passive: true });
    drawer.addEventListener('touchmove', onMove, { passive: true });
    drawer.addEventListener('touchend', onEnd);
    drawer.addEventListener('touchcancel', onEnd);

    return () => {
      drawer.removeEventListener('touchstart', onStart);
      drawer.removeEventListener('touchmove', onMove);
      drawer.removeEventListener('touchend', onEnd);
      drawer.removeEventListener('touchcancel', onEnd);
    };
  }, [drawerOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-lg focus:bg-black/80 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className={[
          'sticky top-0 z-50 w-full overflow-visible',
          'will-change-transform [transform:translateZ(0)]',
          'transition-[background-color,backdrop-filter,box-shadow,padding] ease-out',
          'bg-primary/95 dark:bg-zinc-950',
          'backdrop-blur-md',
          compact ? 'shadow-lg' : 'shadow-md',
        ].join(' ')}
      >
        {/* TopBar */}
        <div
          aria-hidden={!showTopBar}
          className={[
            'topbar-clip',
            'hidden lg:block',
            'overflow-hidden transition-[max-height,opacity] ease-out',
            showTopBar ? 'max-h-[55px] opacity-100' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <TopBar />
        </div>

        {/* Main row */}
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="my-0">
            <div
              ref={navAnchorRef}
              data-mega-anchor
              className={[
                'relative flex items-center justify-between rounded-2xl ring-1 ring-white/10',
                'bg-white/[0.06] dark:bg-white/5',
                'before:absolute before:inset-0 before:-z-10 before:rounded-2xl',
                'before:bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]',
                'dark:before:bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]',
                compact ? 'px-3 py-2' : 'px-4 py-2.5',
                'transition-[padding,ring-color,transform,box-shadow] ease-out',
                'hover:ring-white/20',
              ].join(' ')}
            >
              <Logo />

              {/* Center search (mobile) */}
              <div className="absolute inset-x-0 flex justify-center lg:hidden px-12 pointer-events-none">
                <GlobalSearch
                  className="pointer-events-auto max-w-[520px]"
                  placeholder="Search..."
                />
              </div>

              {/* Desktop nav */}
              <nav
                className="hidden lg:flex flex-grow items-center justify-center gap-1 xl:gap-2"
                aria-label="Main navigation"
              >
                {headerMenu.map((item, i) => (
                  <HeaderLink key={i} item={item} />
                ))}
              </nav>

              {/* Right actions */}
              <div className="ml-3 flex items-center gap-1 sm:gap-2">
                <button
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <Moon className="h-5 w-5 dark:hidden" />
                  <Sun className="h-5 w-5 hidden dark:inline" />
                </button>

                <Link
                  href="/x-hub/sign-in"
                  className="hidden shrink-0 items-center rounded-xl border border-white/20 bg-white px-3.5 py-2 text-sm font-bold text-primary hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  XIPHIAS Hub
                </Link>

                <Link
                  href="/eligibility#start"
                  className="hidden shrink-0 items-center rounded-xl border border-secondary/70 bg-secondary px-3.5 py-2 text-sm font-bold text-primary shadow-sm shadow-black/10 hover:bg-[#f0cb3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  Get Started
                </Link>

                <Link
                  href="/personal-booking"
                  className="hidden shrink-0 items-center rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  Book Consultation
                </Link>

                <button
                  ref={burgerBtnRef}
                  onClick={() => setDrawerOpen((s) => !s)}
                  aria-label="Toggle mobile menu"
                  aria-expanded={drawerOpen}
                  aria-controls="mobile-menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
                >
                  {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop — click outside to close (mobile only) */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-[49] bg-black/50 backdrop-blur-[2px] lg:hidden"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div
          id="mobile-menu"
          ref={drawerRef}
          data-state={drawerOpen ? 'open' : 'closed'}
          className={[
            'fixed right-0 top-0 z-[50] h-dvh w-[88%] max-w-[420px] rounded-l-2xl outline-none lg:hidden',
            'transition-transform',
            drawerOpen ? 'translate-x-0' : 'translate-x-full',
            'bg-white dark:bg-zinc-900',
            'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
          tabIndex={-1}
        >
          <div className="flex h-full flex-col min-h-0 overscroll-y-none">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900">
              <Logo />
              <div className="flex items-center gap-1.5">
                <Link
                  href="/x-hub/sign-in"
                  aria-label="XIPHIAS Hub login"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-800 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white dark:hover:bg-white/10"
                >
                  <LogIn className="h-5 w-5" />
                </Link>

                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-800 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white dark:hover:bg-white/10"
                >
                  <Moon className="h-5 w-5 dark:hidden" />
                  <Sun className="h-5 w-5 hidden dark:inline" />
                </button>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-800 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white dark:hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Scrollable MENU area */}
            <nav
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-none px-4 py-3 bg-white dark:bg-zinc-900"
              aria-label="Mobile navigation"
            >
              <div className="rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800">
                {headerMenu.map((item, i) => (
                  <MobileHeaderLink
                    key={i}
                    item={item}
                    closeMenuAction={() => setDrawerOpen(false)}
                  />
                ))}
              </div>

              <div className="mt-3 grid gap-2">
                <Link
                  href="/eligibility#start"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-3 text-sm font-black text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Get Started
                </Link>
                <Link
                  href="/personal-booking"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Book Consultation
                </Link>
              </div>

              <div className="pb-28" />
              <div className="h-[env(safe-area-inset-bottom)]" />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
