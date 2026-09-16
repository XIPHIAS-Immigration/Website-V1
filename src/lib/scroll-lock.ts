// src/lib/scroll-lock.ts
// -----------------------------------------------------------------------------
// One scroll lock for the whole site, counted.
//
// WHY THIS EXISTS
// Several overlays each used to do their own version of this:
//
//     const previous = root.style.overflow;
//     root.style.overflow = "hidden";
//     return () => { root.style.overflow = previous; };
//
// Read on its own that is correct. Run two of them at once and it is not. The
// second overlay opens while the first still has the page locked, so it records
// "hidden" as the value to go back to — and when it closes, it puts "hidden"
// back. The page is then locked forever, with no overlay on screen to explain
// why. On this site the quick-enquiry popup fires on every page load and the XIA
// greeter can appear over it, so the two collided constantly: every page ended
// up with an inline `overflow: hidden` on <html> that nothing ever cleared.
//
// It hid behind Lenis. Smooth scroll moves the page with its own scroll calls,
// which still work on a clipped document, so most visitors never noticed. The
// moment Lenis was paused — any overlay — or switched off — reduced motion — the
// page simply would not move.
//
// So: one module, one counter. The first lock records the real values, the last
// unlock restores them, and anything in between is a no-op. A stranded "hidden"
// is never recorded as a value worth restoring, so one bad state cannot outlive
// the overlay that caused it.
// -----------------------------------------------------------------------------

type Saved = { rootOverflow: string; bodyOverflow: string; bodyPadding: string };

let depth = 0;
let saved: Saved | null = null;

/** Never hand back a lock as if it were the page's resting state. */
function restingValue(value: string) {
  return value === "hidden" ? "" : value;
}

export function lockScroll() {
  if (typeof document === "undefined") return;

  depth += 1;
  if (depth > 1) return; // somebody already has it

  const root = document.documentElement;
  const { body } = document;

  saved = {
    rootOverflow: restingValue(root.style.overflow),
    bodyOverflow: restingValue(body.style.overflow),
    bodyPadding: body.style.paddingRight,
  };

  // Compensate for the scrollbar so the page does not jump sideways.
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll() {
  if (typeof document === "undefined") return;
  if (depth === 0) return;

  depth -= 1;
  if (depth > 0) return; // someone else still needs it

  const root = document.documentElement;
  const { body } = document;

  root.style.overflow = saved?.rootOverflow ?? "";
  body.style.overflow = saved?.bodyOverflow ?? "";
  body.style.paddingRight = saved?.bodyPadding ?? "";
  saved = null;
}

/**
 * Drop every lock and unlock the page.
 *
 * For a route change: an overlay that was open when the visitor navigated is
 * gone from the screen either way, and a leaked count would otherwise keep the
 * new page locked.
 */
export function releaseScrollLocks() {
  if (typeof document === "undefined") return;
  if (depth === 0) return;
  depth = 1;
  unlockScroll();
}
