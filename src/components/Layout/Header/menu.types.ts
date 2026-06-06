// --------------------------------------
// 📁 File: src/components/Layout/Header/menu.types.ts
// --------------------------------------

/**
 * Visual badge shown next to a label (used across desktop/mobile).
 */
export interface Badge {
  text: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}

/**
 * Optional extra metadata for rendering/UX.
 * - `code` is an ISO-2 country code used to render an emoji flag in MegaPanel.
 * - `iconEmoji` lets you override the flag with any emoji.
 */
export interface MenuMeta {
  /** ISO-2 country code, e.g. 'CA', 'US', 'PT' */
  code?: string;
  /** Optional explicit emoji, e.g. '🇸🇬' or '🏝️' */
  iconEmoji?: string;
}

/**
 * Core node for the navigation tree.
 * Recursive via `submenu`.
 */
export interface MenuNode {
  /** Visible label */
  label: string;
  /** Href for navigation */
  href: string;

  /** Short helper text (optional; not always rendered) */
  description?: string;

  /** Optional visual badge */
  badge?: Badge;

  /** Optional extra metadata (flags/icons) */
  meta?: MenuMeta;

  /** Optional accessible label override */
  ariaLabel?: string;

  /** Nested items (recursive) */
  submenu?: MenuNode[];
}

export type HeaderItem = MenuNode;
export type SubmenuItem = MenuNode;
