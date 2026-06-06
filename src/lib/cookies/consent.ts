"use client";

export const COOKIE_CONSENT_STORAGE_KEY = "xiphias_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "xiphias-cookie-consent-change";

export type CookieConsentPreferences = {
  version: 1;
  updatedAt: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  experience: boolean;
};

export type CookieConsentInput = {
  analytics: boolean;
  marketing: boolean;
  experience: boolean;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isConsentShape(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<CookieConsentPreferences>;
  return (
    c.version === 1 &&
    typeof c.updatedAt === "number" &&
    c.necessary === true &&
    typeof c.analytics === "boolean" &&
    typeof c.marketing === "boolean"
  );
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isConsentShape(parsed)) return null;
    return {
      ...parsed,
      experience:
        typeof (parsed as Partial<CookieConsentPreferences>).experience === "boolean"
          ? Boolean((parsed as Partial<CookieConsentPreferences>).experience)
          : false,
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(
  input: CookieConsentInput,
): CookieConsentPreferences {
  const next: CookieConsentPreferences = {
    version: 1,
    updatedAt: Date.now(),
    necessary: true,
    analytics: Boolean(input.analytics),
    marketing: Boolean(input.marketing),
    experience: Boolean(input.experience),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore storage failures
    }

    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: next }),
    );
  }

  return next;
}

export function cookieConsentToGtagConsent(pref: CookieConsentPreferences) {
  return {
    ad_storage: pref.marketing ? "granted" : "denied",
    analytics_storage: pref.analytics ? "granted" : "denied",
    ad_user_data: pref.marketing ? "granted" : "denied",
    ad_personalization: pref.marketing ? "granted" : "denied",
    personalization_storage: pref.experience ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  } as const;
}
