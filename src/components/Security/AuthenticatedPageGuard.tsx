"use client";

import React from "react";

type GuardMode = "next-auth" | "status";

type AuthenticatedPageGuardProps = {
  checkUrl: string;
  redirectTo: string;
  mode?: GuardMode;
};

export default function AuthenticatedPageGuard({
  checkUrl,
  redirectTo,
  mode = "status",
}: AuthenticatedPageGuardProps) {
  const redirect = React.useCallback(() => {
    window.location.replace(redirectTo);
  }, [redirectTo]);

  const verify = React.useCallback(async () => {
    try {
      const response = await fetch(checkUrl, {
        cache: "no-store",
        credentials: "include",
        headers: { "Cache-Control": "no-store" },
      });

      if (!response.ok) {
        redirect();
        return;
      }

      if (mode === "next-auth") {
        const session = await response.json().catch(() => null);
        if (!session?.user?.email) redirect();
      }
    } catch {
      redirect();
    }
  }, [checkUrl, mode, redirect]);

  React.useEffect(() => {
    void verify();

    const onPageShow = () => void verify();
    const onFocus = () => void verify();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void verify();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [verify]);

  return null;
}
