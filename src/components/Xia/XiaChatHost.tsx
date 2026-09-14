"use client";

// src/components/Xia/XiaChatHost.tsx
// -----------------------------------------------------------------------------
// Mounts the chat once, for the whole site, and owns its URL.
//
// Open pushes `?xia=1`, so Back closes the chat instead of leaving the page, and
// a pasted link opens straight into it. The chat component downloads only on
// first open — nobody pays for it by scrolling past the band.
//
// The route is watched as well as the history: a card's "Email me the full
// report" is a client-side navigation, and without this the overlay stayed up
// covering the page it had just moved to, which looked exactly like a dead
// button.
// -----------------------------------------------------------------------------

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { XIA_CHAT_EVENT, closeXiaChat, type XiaChatOpenDetail } from "./xia-chat";

const XiaChat = dynamic(() => import("./XiaChat"), { ssr: false });

const PARAM = "xia";

function hasParam() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(PARAM) === "1";
}

function stripParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PARAM)) return;
  url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, "", url);
}

export default function XiaChatHost() {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState<string | undefined>();
  const pathname = usePathname();
  const openedAt = useRef<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setSeed(undefined);
    stripParam();
    openedAt.current = null;
    // Dismissed without giving details — the contact form gets its one chance.
    closeXiaChat();
  }, []);

  // Any route change closes it. Navigating away is, by definition, done here.
  useEffect(() => {
    if (openedAt.current && openedAt.current !== pathname) {
      setOpen(false);
      setSeed(undefined);
      openedAt.current = null;
      return;
    }
    if (hasParam() && !openedAt.current) {
      openedAt.current = pathname;
      setOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<XiaChatOpenDetail>).detail;
      setSeed(detail?.seed?.trim() || undefined);
      openedAt.current = window.location.pathname;
      setOpen(true);
      if (!hasParam()) {
        const url = new URL(window.location.href);
        url.searchParams.set(PARAM, "1");
        window.history.pushState(window.history.state, "", url);
      }
    };

    const onPop = () => {
      const wanted = hasParam();
      setOpen(wanted);
      openedAt.current = wanted ? window.location.pathname : null;
    };

    window.addEventListener(XIA_CHAT_EVENT, onOpen as EventListener);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(XIA_CHAT_EVENT, onOpen as EventListener);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  if (!open) return null;
  return <XiaChat seed={seed} onClose={close} />;
}
