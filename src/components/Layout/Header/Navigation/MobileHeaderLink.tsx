// FILE: src/components/Layout/Header/Navigation/MobileHeaderLink.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import type { HeaderItem, SubmenuItem } from '../menu.types';

/* -------------------------------------------------
   Utilities
-------------------------------------------------- */

/** Stable, SSR-safe reduced-motion hook (Safari friendly) */
function useReducedMotionStable() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      setReduced(false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);

    const add = (mql: MediaQueryList, cb: () => void) =>
      (mql.addEventListener ? mql.addEventListener('change', cb) : mql.addListener(cb));
    const remove = (mql: MediaQueryList, cb: () => void) =>
      (mql.removeEventListener ? mql.removeEventListener('change', cb) : mql.removeListener(cb));

    apply();
    add(mq, apply);
    return () => remove(mq, apply);
  }, []);
  return reduced;
}

/** Slugify a string for safe IDs */
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* -------------------------------------------------
   Recursive Node
-------------------------------------------------- */

type NodeProps = {
  item: SubmenuItem;
  depth: number;
  path: string; // stable index path from root, e.g., "0-2-1"
  closeMenuAction?: () => void;
  reduced: boolean;
};

const Node = ({ item, depth, path, closeMenuAction, reduced }: NodeProps) => {
  const [open, setOpen] = React.useState(false);
  const hasKids = Array.isArray(item.submenu) && item.submenu.length > 0;

  // Stable base id derived from data + structural path (SSR-safe)
  const baseId = React.useMemo(() => `mh-${path}-${slug(item.label)}`, [path, item.label]);

  const padLeft = Math.min(16 + depth * 14, 48);

  // autofocus first child when expanding
  const firstChildRef = React.useRef<HTMLAnchorElement>(null);
  React.useEffect(() => {
    if (!open || !hasKids) return;
    const t = setTimeout(() => firstChildRef.current?.focus(), reduced ? 0 : 160);
    return () => clearTimeout(t);
  }, [open, hasKids, reduced]);

  const toggle = () => setOpen((s) => !s);
  const collapse = () => setOpen(false);
  const expand = () => setOpen(true);

  const onChevronKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      expand();
    } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault();
      collapse();
    }
  };

  // subtle background bands per level for orientation (no harsh white)
  const levelBg =
    depth % 2 === 0
      ? 'bg-white dark:bg-zinc-900'
      : 'bg-zinc-50/70 dark:bg-zinc-800/50';

  return (
    <li className={`list-none border-b border-zinc-200 last:border-0 dark:border-white/10 ${levelBg}`}>
      <div
        className="flex items-stretch justify-between"
        style={{ paddingLeft: padLeft, paddingRight: 12 }}
      >
        {/* Label link — if leaf, closes menu on click */}
        <Link
          id={`${baseId}-label`}
          href={item.href}
          className="flex min-h-[46px] flex-1 items-center py-2 text-[15px] text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-zinc-100"
          onClick={() => {
            if (!hasKids) closeMenuAction?.();
          }}
        >
          <span className="truncate">{item.label}</span>
        </Link>

        {/* Chevron button — toggles accordion; separate from link */}
        {hasKids && (
          <button
            type="button"
            aria-controls={`${baseId}-panel`}
            aria-expanded={open}
            onClick={toggle}
            onKeyDown={onChevronKey}
            className="ml-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <svg
              className={`h-5 w-5 transition-transform ${reduced ? '' : 'duration-200'} ${open ? '-rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z" />
            </svg>
            <span className="sr-only">{open ? 'Collapse' : 'Expand'}</span>
          </button>
        )}
      </div>

      {/* Nested children */}
      {hasKids && open && (
        <div
          id={`${baseId}-panel`}
          role="region"
          aria-labelledby={`${baseId}-label`}
          className="overflow-hidden"
        >
          <ul className="pb-2">
            {item.submenu!.map((child, i) => (
              <Node
                key={`${child.label}-${i}`}
                item={child}
                depth={depth + 1}
                path={`${path}-${i}`}
                closeMenuAction={closeMenuAction}
                reduced={reduced}
              />
            ))}
          </ul>
          <span aria-live="polite" className="sr-only">
            {item.label} {open ? 'expanded' : 'collapsed'}.
          </span>
        </div>
      )}
    </li>
  );
};

/* -------------------------------------------------
   Public component
-------------------------------------------------- */

export default function MobileHeaderLink({
  item,
  closeMenuAction,
}: {
  item: HeaderItem;
  closeMenuAction?: () => void;
}) {
  const reduced = useReducedMotionStable(); // single call — passed down to all Nodes
  return (
    <ul role="list" className="m-0 p-0">
      <Node item={item} depth={0} path="0" closeMenuAction={closeMenuAction} reduced={reduced} />
    </ul>
  );
}
