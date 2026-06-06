"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CarouselRailHandle = {
  prev: () => void;
  next: () => void;
  scrollToStart: () => void;
  scrollToEnd: () => void;
};

type Props = {
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  onEdgeChange?: (s: { canPrev: boolean; canNext: boolean }) => void;
};

const CarouselRail = forwardRef<CarouselRailHandle, Props>(
  ({ children, ariaLabel = "Insights carousel", className = "", onEdgeChange }, ref) => {
    const railRef = useRef<HTMLDivElement | null>(null);

    // local state (but guarded to avoid redundant renders)
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);

    // keep latest onEdgeChange without re-running effects
    const edgeCbRef = useRef<Props["onEdgeChange"]>(onEdgeChange);
    useEffect(() => {
      edgeCbRef.current = onEdgeChange;
    }, [onEdgeChange]);

    const emitEdges = (prevVal: boolean, nextVal: boolean) => {
      // Only emit when something actually changed
      setCanPrev((p) => (p !== prevVal ? prevVal : p));
      setCanNext((n) => (n !== nextVal ? nextVal : n));
      if (edgeCbRef.current) edgeCbRef.current({ canPrev: prevVal, canNext: nextVal });
    };

    // Attach listeners once; use a stable update function
    useEffect(() => {
      const el = railRef.current;
      if (!el) return;

      const update = () => {
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const prev = scrollLeft > 2;
        const next = scrollLeft + clientWidth < scrollWidth - 2;
        emitEdges(prev, next);
      };

      update(); // initial

      el.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);

      // Desktop drag-to-scroll
      let isDown = false;
      let startX = 0;
      let startLeft = 0;

      const onDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.pageX;
        startLeft = el.scrollLeft;
        el.classList.add("cursor-grabbing");
      };
      const onUp = () => {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      };
      const onMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const delta = (e.pageX - startX) * 1.1;
        el.scrollLeft = startLeft - delta;
      };

      el.addEventListener("mousedown", onDown);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("mousemove", onMove);

      // Keyboard support when rail is focused
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollByAmount(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollByAmount(-1);
        }
      };
      el.addEventListener("keydown", onKey);

      return () => {
        el.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        el.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("mousemove", onMove);
        el.removeEventListener("keydown", onKey);
      };
      // ⛔ no deps -> runs exactly once after mount
    }, []);

    // helpers exposed to parent
    const scrollByAmount = (dir: 1 | -1) => {
      const el = railRef.current;
      if (!el) return;
      const amount = Math.round(el.clientWidth * 0.9) * dir;
      el.scrollBy({ left: amount, behavior: "smooth" });
    };

    useImperativeHandle(ref, () => ({
      prev: () => scrollByAmount(-1),
      next: () => scrollByAmount(1),
      scrollToStart: () => railRef.current?.scrollTo({ left: 0, behavior: "smooth" }),
      scrollToEnd: () => {
        const el = railRef.current;
        if (!el) return;
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      },
    }));

    return (
      <div className={`relative ${className}`}>
        <div
          ref={railRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          tabIndex={0}
          className="
            group flex gap-5
            overflow-x-auto
            snap-x snap-mandatory
            scroll-smooth
            pl-1 pr-1 sm:pl-0 sm:pr-0
            cursor-grab
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {children}
        </div>

        {/* decorative fades, behind content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent hidden md:block -z-[1]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent hidden md:block -z-[1]"
        />
      </div>
    );
  }
);

CarouselRail.displayName = "CarouselRail";
export default CarouselRail;
