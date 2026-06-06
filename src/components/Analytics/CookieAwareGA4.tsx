"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import {
  COOKIE_CONSENT_EVENT,
  cookieConsentToGtagConsent,
  readCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookies/consent";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type ConsentState = Pick<
  CookieConsentPreferences,
  "analytics" | "marketing" | "experience"
>;

function toConsentState(pref: CookieConsentPreferences | null): ConsentState {
  return {
    analytics: Boolean(pref?.analytics),
    marketing: Boolean(pref?.marketing),
    experience: Boolean(pref?.experience),
  };
}

export default function CookieAwareGA4({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [consent, setConsent] = React.useState<ConsentState>({
    analytics: false,
    marketing: false,
    experience: false,
  });
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const initial = toConsentState(readCookieConsent());
    setConsent(initial);
    if (initial.analytics || initial.marketing) {
      setShouldLoad(true);
    }
  }, []);

  React.useEffect(() => {
    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentPreferences>).detail;
      const next = toConsentState(detail ?? null);
      setConsent(next);
      if (next.analytics || next.marketing) {
        setShouldLoad(true);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange as EventListener);
    return () =>
      window.removeEventListener(
        COOKIE_CONSENT_EVENT,
        onConsentChange as EventListener,
      );
  }, []);

  React.useEffect(() => {
    if (!window.gtag) return;
    const pref: CookieConsentPreferences = {
      version: 1,
      updatedAt: Date.now(),
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      experience: consent.experience,
    };
    window.gtag("consent", "update", cookieConsentToGtagConsent(pref));
  }, [consent.analytics, consent.marketing, consent.experience]);

  React.useEffect(() => {
    if (!consent.analytics) return;

    const qs = searchParams?.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;
    let attempts = 0;

    const sendPageView = () => {
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_path: pagePath,
          page_location: window.location.href,
        });
        return;
      }
      if (attempts >= 20) return;
      attempts += 1;
      window.setTimeout(sendPageView, 150);
    };

    sendPageView();
  }, [pathname, searchParams, consent.analytics]);

  if (!shouldLoad) return null;

  const analyticsMode = consent.analytics ? "granted" : "denied";
  const marketingMode = consent.marketing ? "granted" : "denied";
  const experienceMode = consent.experience ? "granted" : "denied";

  const inlineInit = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    gtag('js', new Date());
    gtag('consent', 'default', {
      ad_storage: '${marketingMode}',
      analytics_storage: '${analyticsMode}',
      ad_user_data: '${marketingMode}',
      ad_personalization: '${marketingMode}',
      personalization_storage: '${experienceMode}',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    gtag('config', '${gaId}', { send_page_view: false });
  `;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-consent-init" strategy="afterInteractive">
        {inlineInit}
      </Script>
    </>
  );
}
