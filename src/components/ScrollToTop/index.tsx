"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const scrollToTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let rafId: number | null = null;

    const toggleVisibility = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setIsVisible(scrollTop > 320);
      });
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const onChatState = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setIsChatOpen(Boolean(detail?.open));
    };

    window.addEventListener("xiphias-chat-state", onChatState as EventListener);
    return () =>
      window.removeEventListener(
        "xiphias-chat-state",
        onChatState as EventListener,
      );
  }, []);

  return (
    <div
      className="fixed transition-all duration-200"
      style={{
        right: "var(--floating-chat-right, 16px)",
        bottom:
          "calc(var(--floating-chat-bottom, calc(16px + env(safe-area-inset-bottom, 0px))) + var(--floating-chat-size, 56px) + var(--floating-chat-gap, 12px))",
        zIndex: 2147482500,
        opacity: isVisible && !isChatOpen ? 1 : 0,
        transform: isVisible && !isChatOpen ? "translateY(0)" : "translateY(6px)",
        pointerEvents: isVisible && !isChatOpen ? "auto" : "none",
      }}
    >
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white ring-1 ring-white/25 shadow-[0_10px_24px_rgba(12,36,90,0.35)] transition hover:bg-[#184c9f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 14 6-6 6 6" />
          <path d="M12 8v10" />
        </svg>
      </button>
    </div>
  );
}
