"use client";

import dynamic from "next/dynamic";
import React from "react";
import { usePathname } from "next/navigation";

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });
// One assistant, not two: the concierge dock replaces the old canned-reply
// ChatWidget. ChatWidget.tsx is left in place but is no longer mounted.
const XiaConciergeDock = dynamic(() => import("@/components/Xia/XiaConciergeDock"), { ssr: false });
// Mounted on every page so "Ask XIA" works from the hero, the nav, the dock and
// from a pasted ?xia=1 link. The chat itself only downloads when it is opened.
const XiaChatHost = dynamic(() => import("@/components/Xia/XiaChatHost"), { ssr: false });
// Only ever appears after XIA has been closed, and never on a XIA page.
const XiaExitForm = dynamic(() => import("@/components/Xia/XiaExitForm"), { ssr: false });
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

  if (isIsolatedRoute) return null;

  return (
    <>
      <QuickEnquiryPopup />
      <CookieConsentManager />
      <XiaChatHost />
      <XiaExitForm />
      {ready ? (
        <>
          <ScrollToTop />
          <XiaConciergeDock />
          {engagementReady ? <GlobalBrochureGate /> : null}
          <VisitorAnalyticsTracker />
          {gaId ? <CookieAwareGA4 gaId={gaId} /> : null}
        </>
      ) : null}
    </>
  );
}
