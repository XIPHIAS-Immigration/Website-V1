"use client";

import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookingFlowContext } from "./useBookingFlow";
import { TOPMATE_BOOKING_URL } from "./index";

type Props = { children: React.ReactNode };

export default function BookingFlowProvider({ children }: Props) {
  const open = useCallback((_args?: { plan?: unknown }) => {
    window.open(TOPMATE_BOOKING_URL, "_blank", "noopener,noreferrer");
  }, []);

  const close = useCallback(() => {}, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  /* --- auto-open if the URL has ?book=... or #book --- */
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const openedFromUrl = useRef(false);

  useEffect(() => {
    if (openedFromUrl.current) return;

    const param =
      sp?.get("book") ||
      (typeof window !== "undefined" &&
      window.location.hash.startsWith("#book")
        ? window.location.hash.replace("#", "").split("=")[1] ?? "1"
        : null);

    if (param != null) {
      openedFromUrl.current = true;

      // Clean the URL first, then open Topmate
      const url = new URL(window.location.href);
      url.searchParams.delete("book");
      url.hash = "";
      router.replace(
        url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""),
        { scroll: false }
      );

      window.open(TOPMATE_BOOKING_URL, "_blank", "noopener,noreferrer");
    }
  }, [sp, router, pathname]);

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}
