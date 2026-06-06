"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Convert HTML to a usable plain-text fallback for clipboard
 * (helps when client strips HTML clipboard formats).
 */
function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(p|div|tr|table|thead|tbody|tfoot|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<\/(td|th)>/gi, "\t")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\t{3,}/g, "\t\t")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Legacy rich-copy fallback using document.execCommand('copy')
 * Helps preserve HTML in some browsers if ClipboardItem is unavailable.
 */
function legacyCopyRichHtml(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  container.style.userSelect = "text";
  document.body.appendChild(container);

  const selection = window.getSelection();
  if (!selection) {
    document.body.removeChild(container);
    throw new Error("Selection API not available.");
  }

  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(container);
  selection.addRange(range);

  const ok = document.execCommand("copy");

  selection.removeAllRanges();
  document.body.removeChild(container);

  if (!ok) throw new Error("Legacy copy failed.");
}

async function copyHtmlToClipboard(html: string) {
  const plain = stripHtml(html);

  // Best: copies BOTH HTML + plain text
  if (
    navigator.clipboard &&
    "write" in navigator.clipboard &&
    typeof (window as any).ClipboardItem !== "undefined"
  ) {
    const htmlBlob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([plain], { type: "text/plain" });
    const ClipboardItemCtor = (window as any).ClipboardItem;

    const item = new ClipboardItemCtor({
      "text/html": htmlBlob,
      "text/plain": textBlob,
    });

    await navigator.clipboard.write([item]);
    return;
  }

  // Next best: tries to preserve HTML (execCommand selection copy)
  try {
    legacyCopyRichHtml(html);
    return;
  } catch {
    // continue
  }

  // Fallback: plain text
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(plain);
    return;
  }

  // Last resort: textarea
  const ta = document.createElement("textarea");
  ta.value = plain;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export default function ReportClient({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [err, setErr] = useState("");

  const reportHtml = useMemo(() => html, [html]);

  const onCopy = useCallback(async () => {
    try {
      setErr("");
      setIsCopying(true);
      await copyHtmlToClipboard(reportHtml);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (e: any) {
      setErr(e?.message || "Copy failed. Please try again.");
    } finally {
      setIsCopying(false);
    }
  }, [reportHtml]);

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {/* Sticky copy toolbar */}
      <div
        style={{
          position: "sticky",
          top: 12,
          zIndex: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: 12,
          background: "#ffffff",
          border: "1px solid #D9DEE8",
          borderRadius: 14,
          boxShadow: "0 8px 20px rgba(16,24,40,0.08)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontFamily: "Arial, sans-serif", minWidth: 240 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "#0E2F6F" }}>
            Australia Assessment Report
          </div>
          <div style={{ fontSize: 12, color: "#445064", marginTop: 3 }}>
            Click <b>Copy for Email</b> → paste into Gmail/Outlook body.
          </div>
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={isCopying}
          style={{
            cursor: isCopying ? "not-allowed" : "pointer",
            border: "1px solid #0E2F6F",
            background: isCopying ? "rgba(14,47,111,0.75)" : "#0E2F6F",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 12,
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
            fontWeight: 900,
            minWidth: 160,
            opacity: isCopying ? 0.9 : 1,
          }}
        >
          {isCopying ? "Copying…" : copied ? "Copied ✅" : "Copy for Email"}
        </button>
      </div>

      {/* Error message */}
      {err ? (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            background: "#fff5f5",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 12,
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
          }}
        >
          {err}
        </div>
      ) : null}

      {/* Preview container */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #D9DEE8",
          boxShadow: "0 12px 32px rgba(16,24,40,0.10)",
          width: "100%",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          dangerouslySetInnerHTML={{ __html: reportHtml }}
        />
      </div>
    </div>
  );
}
