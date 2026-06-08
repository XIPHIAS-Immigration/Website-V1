"use client";

import dynamic from "next/dynamic";
import React from "react";
import { usePathname } from "next/navigation";

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const QuickEnquiryPopup = dynamic(() => import("@/components/QuickEnquiryPopup"), { ssr: false });
const GlobalBrochureGate = dynamic(
  () => import("@/components/GlobalBrochureGate/GlobalBrochureGate"),
  { ssr: false },
);
const CookieConsentManager = dynamic(() => import("@/components/CookieConsentManager"), {
  ssr: false,
});
const CookieAwareGA4 = dynamic(() => import("@/components/Analytics/CookieAwareGA4"), {
  ssr: false,
});

type Props = {
  gaId?: string;
};

export default function DeferredClientWidgets({ gaId }: Props) {
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);
  const isPortal = pathname?.startsWith("/x-hub");

  React.useEffect(() => {
    if (isPortal) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (win.requestIdleCallback) {
      const handle = win.requestIdleCallback(() => setReady(true), { timeout: 1600 });
      return () => win.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [isPortal]);

  if (isPortal || !ready) return null;

  return (
    <>
      <ScrollToTop />
      <ChatWidget />
      <QuickEnquiryPopup />
      <GlobalBrochureGate />
      <CookieConsentManager />
      {gaId ? <CookieAwareGA4 gaId={gaId} /> : null}
    </>
  );
}
