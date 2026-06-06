"use client";

import React, { useState, useEffect } from "react";

/**
 * GlobalBrochureGate intercepts clicks on any anchor whose href points to a PDF
 * in /brochures/ or /images/. It collects the user’s name, phone, and email before
 * allowing the download.
 */
export default function GlobalBrochureGate() {
  const [open, setOpen] = useState(false);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("xiphias-brochure-gate-state", { detail: { open } }),
    );
  }, [open]);

  useEffect(
    () => () => {
      window.dispatchEvent(
        new CustomEvent("xiphias-brochure-gate-state", {
          detail: { open: false },
        }),
      );
    },
    [],
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open) return;

      const target = (e.target as HTMLElement)?.closest("a");
      if (target instanceof HTMLAnchorElement) {
        try {
          const url = new URL(target.href, window.location.origin);
          const path = url.pathname.toLowerCase();

          const isBrochure =
            path.endsWith(".pdf") &&
            (path.startsWith("/brochures/") || path.startsWith("/images/"));

          if (isBrochure) {
            e.preventDefault();
            e.stopPropagation();
            setBrochureUrl(url.toString());
            setOpen(true);
          }
        } catch {
          /* ignore invalid URLs */
        }
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [open]);

  const nameOk = name.trim().length >= 2;
  const phoneOk = /^[0-9+()\-\s]{7,}$/.test(phone.trim());
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const valid = nameOk && phoneOk && emailOk;

  async function handleSubmit() {
    setTouched(true);
    if (!valid || loading || !brochureUrl) return;

    setLoading(true);
    try {
      try {
        await fetch("/api/brochure-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, brochure: brochureUrl }),
        });
      } catch (err) {
        // swallow network errors; still allow download
      }
    } finally {
      setLoading(false);
      setOpen(false);

      // Download the PDF after the form is submitted
      const link = document.createElement("a");
      link.href = brochureUrl!;
      link.setAttribute("download", "");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setName("");
      setPhone("");
      setEmail("");
      setTouched(false);
      setBrochureUrl(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-neutral-950 p-6 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setBrochureUrl(null);
            setName("");
            setPhone("");
            setEmail("");
            setTouched(false);
          }}
          className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>

        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
          Enter your details to download
        </h3>

        <div className="space-y-4">
          {/* Name field */}
          <div>
            <label
              htmlFor="brochure-name"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="brochure-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {touched && !nameOk && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Please enter at least 2 characters.
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label
              htmlFor="brochure-phone"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Phone
            </label>
            <input
              id="brochure-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched(true)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {touched && !phoneOk && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Enter a valid phone number (digits, +, -, (), spaces allowed).
              </p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="brochure-email"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Email
            </label>
            <input
              id="brochure-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {touched && !emailOk && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Enter a valid email address.
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !valid}
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit & Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
