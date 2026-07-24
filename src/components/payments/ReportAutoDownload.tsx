"use client";

import { useEffect, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

type State = "waiting" | "generating" | "downloaded" | "error";

export default function ReportAutoDownload({ downloadUrl }: { downloadUrl: string }) {
  const [state, setState] = useState<State>("waiting");
  const [message, setMessage] = useState("Waiting for the secure payment confirmation.");

  useEffect(() => {
    let cancelled = false;
    const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

    async function downloadWhenReady() {
      for (let attempt = 0; attempt < 40 && !cancelled; attempt += 1) {
        setState(attempt === 0 ? "waiting" : "generating");
        setMessage(
          attempt === 0
            ? "Confirming payment and preparing your personalised PDF…"
            : "Your payment is confirmed. The personalised PDF is being prepared…",
        );
        try {
          const response = await fetch(downloadUrl, { cache: "no-store", credentials: "same-origin" });
          if (response.status === 409) {
            await pause(2500);
            continue;
          }
          if (!response.ok) {
            const data = (await response.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error || "The PDF is not ready yet.");
          }

          const blob = await response.blob();
          const disposition = response.headers.get("content-disposition") || "";
          const filename = disposition.match(/filename="([^"]+)"/i)?.[1] || "XIPHIAS-report.pdf";
          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
          if (!cancelled) {
            setState("downloaded");
            setMessage("Your PDF download has started. It has also been sent to your email.");
          }
          return;
        } catch (error) {
          if (!cancelled) {
            setState("error");
            setMessage(error instanceof Error ? error.message : "The automatic download could not start.");
          }
          return;
        }
      }
      if (!cancelled) {
        setState("error");
        setMessage("The report is taking longer than expected. Use the secure download button to retry.");
      }
    }

    void downloadWhenReady();
    return () => {
      cancelled = true;
    };
  }, [downloadUrl]);

  return (
    <div className="mt-6 rounded-xl border border-[#c8daf0] bg-[#f4f8fd] p-5">
      <div className="flex items-start gap-3">
        {state === "waiting" || state === "generating" ? (
          <LoaderCircle className="mt-0.5 size-5 shrink-0 animate-spin text-[#1f5fbc]" aria-hidden="true" />
        ) : (
          <Download className="mt-0.5 size-5 shrink-0 text-[#1f5fbc]" aria-hidden="true" />
        )}
        <div>
          <p className="text-sm font-semibold text-[#071a3a]">
            {state === "downloaded" ? "Report ready" : "Your paid report"}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#536277]" aria-live="polite">
            {message}
          </p>
          {(state === "downloaded" || state === "error") && (
            <a
              href={downloadUrl}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1f5fbc] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Download className="size-4" aria-hidden="true" />
              Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
