"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import type { ClientDocument } from "@/lib/platform/types";

type Props = {
  document: ClientDocument;
};

export default function DocumentUploadForm({ document }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus("Choose a file first.");
      return;
    }

    setBusy(true);
    setStatus("Uploading...");
    const formData = new FormData();
    formData.set("documentId", document.id);
    formData.set("file", file);

    const response = await fetch("/api/platform/documents/upload", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setStatus(data.error || "Upload failed.");
      return;
    }

    setStatus("Uploaded. Staff review pending.");
    event.currentTarget.reset();
    setTimeout(() => window.location.reload(), 700);
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
      <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500" htmlFor={`upload-${document.id}`}>
        Secure upload
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          id={`upload-${document.id}`}
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold dark:border-slate-700 dark:bg-slate-900 dark:file:bg-slate-800"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadCloud className="size-4" />
          {busy ? "Uploading" : "Upload"}
        </button>
      </div>
      {status ? <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{status}</p> : null}
    </form>
  );
}
