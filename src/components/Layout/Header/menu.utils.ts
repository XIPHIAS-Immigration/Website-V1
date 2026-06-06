// --------------------------------------
// 📁 File: src/components/Layout/Header/menu.utils.ts
// --------------------------------------

import type { Badge, MenuNode } from './menu.types';

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  EJ: 'EG',
  SP: 'ES',
  UK: 'GB',
  USA: 'US',
};

/**
 * Split a flat array into `cols` columns in a round-robin (balanced) way.
 * Keeps visual density even when item count isn't divisible by `cols`.
 */
export function chunkIntoColumns<T>(items: T[], cols: number): T[][] {
  const safeCols = Math.max(1, Math.floor(cols || 1));
  const out: T[][] = Array.from({ length: safeCols }, () => []);
  items.forEach((item, i) => out[i % safeCols].push(item));
  return out;
}

/**
 * cx — tiny className combiner
 * Accepts strings, arrays, or {[className]: boolean} maps.
 */
type CXToken =
  | string
  | false
  | null
  | undefined
  | CXToken[]
  | Record<string, boolean | undefined | null>;

export function cx(...tokens: CXToken[]): string {
  const out: string[] = [];
  const push = (t: CXToken) => {
    if (!t) return;
    if (typeof t === 'string') return void out.push(t);
    if (Array.isArray(t)) return void t.forEach(push);
    if (typeof t === 'object') {
      for (const k in t) if (t[k]) out.push(k);
    }
  };
  tokens.forEach(push);
  return out.join(' ');
}

/**
 * badgeTone — returns Tailwind classes for a tiny pill badge.
 */
export const badgeTone = (tone?: Badge['tone']) =>
  cx(
    'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-none border',
    tone === 'success' &&
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40',
    tone === 'warning' &&
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/40',
    tone === 'danger' &&
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700/40',
    (!tone || tone === 'info') &&
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/40'
  );

/* ------------------------------------------------------------------
   Extras used by Header/MegaPanel (non-breaking additions)
------------------------------------------------------------------- */

/** Clamp a number to [min, max]. */
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Heuristic: is a link external (http/https and not same-origin)? */
export function isExternal(href: string) {
  if (!href || href.startsWith('/') || href.startsWith('#')) return false;
  try {
    const u = new URL(href, 'http://localhost'); // base to parse protocol-only
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** CSS selector for focusable elements (used for focus trap / first focus). */
export const FOCUSABLE_SELECTOR =
  'a,button,[href],input,select,textarea,details,[tabindex]:not([tabindex="-1"])';

/** Normalize country codes so menu flags are consistent across data sources. */
export function normalizeMenuCountryCode(code?: string | null): string | null {
  if (!code) return null;
  const cc = code.trim().toUpperCase();
  const normalized = COUNTRY_CODE_ALIASES[cc] ?? cc;
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

/** Convert ISO-2 code to emoji flag (e.g., 'CA' → 🇨🇦). Returns null on bad input. */
export function flagEmojiFromCode(code?: string | null): string | null {
  const cc = normalizeMenuCountryCode(code);
  if (!cc) return null;
  const base = 127397; // regional indicator base
  return String.fromCodePoint(cc.charCodeAt(0) + base) + String.fromCodePoint(cc.charCodeAt(1) + base);
}

/** Build a deterministic image-based flag URL so flags render on systems without emoji-flag support. */
export function flagImageSrcFromCode(code?: string | null): string | null {
  const cc = normalizeMenuCountryCode(code);
  if (!cc) return null;
  return `https://flagcdn.com/24x18/${cc.toLowerCase()}.png`;
}

/** Get a display emoji for a MenuNode via meta (iconEmoji wins, else meta.code). */
export function getMenuFlag(item?: Partial<MenuNode>): string | null {
  const emoji = item?.meta?.iconEmoji;
  if (emoji) return emoji;
  return flagEmojiFromCode(item?.meta?.code ?? undefined);
}
