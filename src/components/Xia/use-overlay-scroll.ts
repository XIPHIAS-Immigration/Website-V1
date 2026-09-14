"use client";

// src/components/Xia/use-overlay-scroll.ts
// -----------------------------------------------------------------------------
// Making a full-screen overlay scrollable on a site that runs smooth scroll.
//
// The site mounts Lenis (components/motion/SmoothScroll). Lenis listens for
// wheel on the window and calls preventDefault on everything it handles, then
// animates the page itself. An overlay rendered on top therefore receives no
// wheel events at all: the scrollbar works, the trackpad does nothing, and it
// reads as a broken modal.
//
// Three things fix it, and all three are here because any one of them alone has
// a hole:
//
//   1. Pause Lenis while the overlay is open (window.__lenis.stop()).
//   2. Mark the container `data-lenis-prevent`, which Lenis honours before it
//      touches the event — this is what covers touch, and any future instance
//      that is not the one on window.
//   3. Scroll the container ourselves from the wheel event. Belt and braces, and
//      it also means the overlay behaves the same if smooth scroll is ever
//      swapped for something else that grabs the wheel.
//
// It also locks html AND body. Locking only html leaves body scrollable, and the
// page then scrolls behind the overlay.
// -----------------------------------------------------------------------------

import { useEffect, type RefObject } from "react";

type LenisLike = { stop: () => void; start: () => void };
type LenisWindow = Window & { __lenis?: LenisLike };

export function useOverlayScroll(scrollRef: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const { body } = document;

    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingRight,
    };

    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const lenis = (window as LenisWindow).__lenis;
    lenis?.stop();

    const element = scrollRef.current;
    const onWheel = (event: WheelEvent) => {
      const target = scrollRef.current;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      // deltaMode: 0 pixels, 1 lines, 2 pages.
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? target.clientHeight : 1;
      target.scrollTop += event.deltaY * factor;
    };

    element?.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      element?.removeEventListener("wheel", onWheel);
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPadding;
      lenis?.start();
    };
  }, [scrollRef, active]);
}
