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

import { Menu, X, Moon, Sun, Sparkles } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [hidden, setHidden] = useState(false); // auto-hide on scroll-down

  const headerRef = useRef<HTMLElement>(null);
  const navAnchorRef = useRef<HTMLDivElement>(null); // 👈 anchor = nav row (rounded bar)
  const lastYRef = useRef(0);
  const rAFRef = useRef<number | null>(null);
  const burgerBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

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

    const COMPACT_ON  = 82;   // enter compact (scrolled past this)
    const COMPACT_OFF = 58;   // exit compact (hysteresis — different threshold)
    const HIDE_AT     = 120;  // topbar can only hide past this point
    const HIDE_ACCUM  = 48;   // px of sustained down-scroll to hide topbar
    const SHOW_ACCUM  = 24;   // px of sustained up-scroll to show topbar

    let downAccum = 0;
    let upAccum   = 0;
    // Own RAF ref — never shared with setMegaTop so they can't cancel each other
    let scrollRaf: number | null = null;

    const onScroll = () => {
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const y  = window.scrollY || 0;
        const dy = y - lastYRef.current;

        if (dy === 0) return;
        lastYRef.current = y <= 0 ? 0 : y;

        // Hysteresis on compact: different enter/exit thresholds prevent oscillation
        setCompact(prev => {
          if (!prev && y > COMPACT_ON)  return true;
          if (prev  && y < COMPACT_OFF) return false;
          return prev; // no state change → React bails out, no re-render
        });

        if (dy > 0) {
          downAccum += dy;
          upAccum    = 0;
          if (downAccum >= HIDE_ACCUM && y > HIDE_AT) setShowTopBar(false);
          // Fully retract the header after sustained downward scroll.
          if (downAccum >= 70 && y > 220) setHidden(true);
        } else {
          upAccum   += Math.abs(dy);
          downAccum  = 0;
          if (upAccum >= SHOW_ACCUM) setShowTopBar(true);
          setHidden(false); // any upward scroll brings it back
        }

        // Always visible near the very top of the page.
        if (y < HIDE_AT) setHidden(false);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    setMegaTopImmediate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  // Keep --header-h in sync on resize only — NOT on scroll/transition/ResizeObserver
  // because updating it during TopBar collapse makes the MainPadding spacer jump
  useEffect(() => {
    const onResize = () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(setMegaTopImmediate);
    };
    window.addEventListener('resize', onResize);
    setMegaTopImmediate();
    return () => {
      window.removeEventListener('resize', onResize);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          "fixed top-0 left-0 right-0 w-full z-50 overflow-visible pt-5 pb-3",
          "will-change-transform transition-transform duration-300 ease-out",
          hidden && !drawerOpen ? "-translate-y-[140%]" : "translate-y-0",
        ].join(" ")}
      >
        {/* Floating card — max-w-screen-2xl centered with side gutters */}
        <div className="mx-auto w-full max-w-screen-2xl px-2 sm:px-4">
          <div className={[
            'rounded-2xl ring-1 ring-white/10',
            'transition-[background-color,box-shadow] duration-300 ease-out',
            compact
              ? 'bg-primary/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.20)]'
              : 'bg-primary dark:bg-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.28)]',
          ].join(' ')}>

            {/* TopBar — collapsible, desktop only; slightly darker bg for visual separation */}
            <div
              aria-hidden={!showTopBar}
              className={[
                'topbar-clip',
                'hidden lg:block',
                'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
                showTopBar ? 'max-h-[48px] opacity-100' : 'max-h-0 opacity-0',
              ].join(' ')}
            >
              <div className="bg-black/20 border-b border-white/10">
                <TopBar />
              </div>
            </div>

            {/* Nav row */}
            <div
              ref={navAnchorRef}
              data-mega-anchor
              className={[
                'relative flex items-center justify-between',
                'transition-[padding] duration-300 ease-out',
                compact ? 'px-3 py-2' : 'px-4 py-2.5',
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
                  href="/eligibility#start"
                  className="hidden shrink-0 items-center rounded-xl border border-secondary/70 bg-secondary px-3.5 py-2 text-sm font-bold text-primary shadow-sm shadow-black/10 hover:bg-[#f0cb3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  Start Your Journey
                </Link>

                <Link
                  href="/xia-intelligence"
                  className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-black/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  XIA Intelligence
                </Link>

                <Link
                  href="/x-hub"
                  className="hidden shrink-0 items-center rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-black/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:inline-flex"
                >
                  X-Hub
                </Link>

                {/* Personal booking — avatar button + hover card */}
                <div className="group relative hidden lg:inline-flex shrink-0">
                  <Link
                    href="/personal-booking"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 py-1.5 pl-2 pr-3.5 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors duration-150"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/avtar/varun-singh-md-xiphias.jpg"
                      alt="Varun Singh"
                      className="h-7 w-7 rounded-full object-cover object-top ring-2 ring-white/40 shrink-0"
                    />
                    <span>Book</span>
                  </Link>

                  {/* Hover tooltip card — drops below the button */}
                  <div className="pointer-events-none absolute top-[calc(100%+10px)] right-0 z-[60] w-56 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-200 ease-out">
                    {/* Upward caret */}
                    <div className="absolute -top-[5px] right-5 h-2.5 w-2.5 rotate-45 rounded-sm bg-white ring-1 ring-black/10" />
                    <div className="rounded-xl bg-white p-3.5 shadow-2xl ring-1 ring-black/10">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/avtar/varun-singh-md-xiphias.jpg"
                          alt="Varun Singh"
                          className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-primary/20 shrink-0"
                        />
                        <div>
                          <p className="text-[13px] font-bold text-zinc-900 leading-tight">Varun Singh</p>
                          <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">MD, XIPHIAS Immigration</p>
                        </div>
                      </div>
                      <p className="mt-2.5 text-[12px] leading-snug text-zinc-600">
                        Start your personal booking consultation with Varun Singh
                      </p>
                      <p className="mt-2 text-[11.5px] font-semibold text-primary">
                        Book now →
                      </p>
                    </div>
                  </div>
                </div>

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
                  Start Your Journey
                </Link>
                <Link
                  href="/xia-intelligence"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/15 bg-white px-4 py-3 text-sm font-black text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  XIA Intelligence
                </Link>
                <Link
                  href="/x-hub"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-primary/15 bg-blue-50 px-4 py-3 text-sm font-black text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  X-Hub
                </Link>
                <Link
                  href="/personal-booking"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/avtar/varun-singh-md-xiphias.jpg"
                    alt=""
                    className="h-6 w-6 rounded-full object-cover object-top ring-1 ring-white/50 shrink-0"
                  />
                  Book with Varun Singh
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
