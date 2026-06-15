"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function PortalSignOutButton() {
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut({
      redirect: false,
      callbackUrl: "/x-hub/sign-in?loggedOut=1",
    });
    window.location.replace("/x-hub/sign-in?loggedOut=1");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
