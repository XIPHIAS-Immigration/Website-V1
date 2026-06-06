"use client";

import { useState } from "react";

export default function QuickApplyForm({ defaultRole }: { defaultRole?: string }) {
  const [submitting, setSubmitting] = useState(false);

  const [fileError, setFileError] = useState<string | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

  const MAX_BYTES = 5 * 1024 * 1024; // 5MB

  function isValidLinkedInUrl(value: string) {
    const v = value.trim();
    if (!v) return false;

    // Ensure it parses as a URL (allow user to paste without protocol)
    let url: URL;
    try {
      url = new URL(v.startsWith("http") ? v : `https://${v}`);
    } catch {
      return false;
    }

    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "linkedin.com") return false;

    // Accept common profile paths
    const path = url.pathname.toLowerCase();
    const okPath =
      path.startsWith("/in/") ||
      path.startsWith("/company/") ||
      path.startsWith("/pub/") ||
      path.startsWith("/profile/");

    return okPath;
  }

  function handleLinkedInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val.trim()) {
      setLinkedinError("LinkedIn profile link is required.");
      return;
    }
    if (!isValidLinkedInUrl(val)) {
      setLinkedinError("Please enter a valid LinkedIn link (e.g. https://linkedin.com/in/username).");
      return;
    }
    setLinkedinError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setFileError("Please attach your resume (PDF, DOC, or DOCX).");
      return;
    }

    const okType =
      /pdf|msword|officedocument/.test(f.type) || /\.(pdf|docx?)$/i.test(f.name);

    if (!okType) {
      setFileError("Use PDF, DOC, or DOCX files only.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("Max file size is 5MB.");
      return;
    }
    setFileError(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Validate LinkedIn on submit too (in case user never blurred the field)
    const form = e.currentTarget;
    const linkedinValue = (form.elements.namedItem("linkedin") as HTMLInputElement | null)?.value ?? "";

    const linkedOk = isValidLinkedInUrl(linkedinValue);
    if (!linkedOk) {
      setLinkedinError(
        !linkedinValue.trim()
          ? "LinkedIn profile link is required."
          : "Please enter a valid LinkedIn link (e.g. https://linkedin.com/in/username)."
      );
      e.preventDefault();
      return;
    }

    if (fileError) {
      e.preventDefault();
      return;
    }

    setSubmitting(true); // allow browser to submit the form normally
  }

  const disableSubmit = submitting || !!fileError || !!linkedinError;

  return (
    <form
      action="/api/apply"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className="grid gap-4 text-black dark:text-white"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            pattern="[0-9+()\-.\s]{7,}"
            title="Enter a valid phone number (digits, +, -, (), spaces allowed)."
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
            placeholder="+91 9XXXXXXXXX"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role (optional)
          </label>
          <input
            id="role"
            name="role"
            defaultValue={defaultRole}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
            placeholder="e.g., Corporate Immigration Specialist"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium">
            LinkedIn <span className="text-red-500">*</span>
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            required
            onChange={handleLinkedInChange}
            onBlur={handleLinkedInChange}
            placeholder="https://linkedin.com/in/username"
            aria-describedby="linkedin-help linkedin-error"
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
          />
          <p id="linkedin-help" className="mt-1 text-xs opacity-80">
            Please paste your LinkedIn profile link.
          </p>
          {linkedinError && (
            <p id="linkedin-error" role="alert" className="mt-1 text-xs font-semibold">
              {linkedinError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium">
            Resume / CV
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            required
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            aria-describedby="resume-help resume-error"
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
          />
          <p id="resume-help" className="mt-1 text-xs">
            Accepted: PDF, DOC, DOCX. Max 5MB.
          </p>
          {fileError && (
            <p id="resume-error" role="alert" className="mt-1 text-xs font-semibold">
              {fileError}
            </p>
          )}
        </div>
      </div>

      {/* Message box */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message / Cover letter (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1500}
          className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:placeholder-white"
          placeholder="Tell us briefly about your experience, notice period, current location, and why you're applying…"
        />
        <p className="mt-1 text-xs opacity-80">Max 1500 characters.</p>
      </div>

      {/* spam honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={disableSubmit}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
        <p className="text-xs">Having trouble submitting? Please send your resume to hr@xiphias.in</p>
      </div>

      <p className="mt-1 text-[11px] opacity-80">
        By submitting, you agree that we may store and process your data for recruitment purposes
        in accordance with our privacy policy.
      </p>
    </form>
  );
}