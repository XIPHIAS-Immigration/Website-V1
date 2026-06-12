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
const VisitorAnalyticsTracker = dynamic(() => import("@/components/Analytics/VisitorAnalyticsTracker"), {
  ssr: false,
});

type Props = {
  gaId?: string;
};

export default function DeferredClientWidgets({ gaId }: Props) {
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);
  const [engagementReady, setEngagementReady] = React.useState(false);
  const isIsolatedRoute =
    pathname?.startsWith("/x-hub") ||
    pathname?.startsWith("/content-admin") ||
    pathname?.startsWith("/crm");

  React.useEffect(() => {
    if (isIsolatedRoute) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (win.requestIdleCallback) {
      const fallback = window.setTimeout(() => setReady(true), 2200);
      const handle = win.requestIdleCallback(
        () => {
          window.clearTimeout(fallback);
          setReady(true);
        },
        { timeout: 1600 },
      );
      return () => {
        window.clearTimeout(fallback);
        win.cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [isIsolatedRoute]);

  React.useEffect(() => {
    if (isIsolatedRoute || !ready) return;
    const timer = window.setTimeout(() => setEngagementReady(true), 4200);
    return () => window.clearTimeout(timer);
  }, [isIsolatedRoute, ready]);

  if (isIsolatedRoute || !ready) return null;

  return (
    <>
      <ScrollToTop />
      <ChatWidget />
      {engagementReady ? <QuickEnquiryPopup /> : null}
      {engagementReady ? <GlobalBrochureGate /> : null}
      <CookieConsentManager />
      <VisitorAnalyticsTracker />
      {gaId ? <CookieAwareGA4 gaId={gaId} /> : null}
    </>
  );
}
