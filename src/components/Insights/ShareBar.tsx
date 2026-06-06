// FILE: src/components/Insights/ShareBar.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Share2, Link as LinkIcon, Check, X as CloseIcon } from "lucide-react";

/**
 * Modern ShareBar
 * - Mobile: navigator.share (native). Desktop or unsupported: elegant modal with platforms.
 * - Copy button always copies absolute URL (origin + path safe).
 * - No extra deps; Tailwind + lucide-react only.
 */

type ShareBarProps = {
  title: string;
  url: string;         // can be absolute or a path like "/insights/post"
  hashtags?: string[]; // used on X
  via?: string;        // used on X (without @)
  className?: string;
  size?: "sm" | "md";
};

export default function ShareBar({
  title,
  url,
  hashtags = [],
  via,
  className = "",
  size = "md",
}: ShareBarProps) {
  const [absoluteUrl, setAbsoluteUrl] = useState<string>(url);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<Element | null>(null);

  // Ensure absolute URL (never just a path)
  useEffect(() => {
    if (/^https?:\/\//i.test(url)) {
      setAbsoluteUrl(url);
    } else if (typeof window !== "undefined") {
      const origin = window.location.origin || "";
      const path = url.startsWith("/") ? url : `/${url}`;
      setAbsoluteUrl(`${origin}${path}`);
    }
  }, [url]);

  // Build platform links
  const platforms = useMemo(() => {
    const encodedUrl = encodeURIComponent(absoluteUrl);
    const encodedTitle = encodeURIComponent(title);

    const xParams = new URLSearchParams();
    xParams.set("url", absoluteUrl);
    xParams.set("text", title);
    if (hashtags.length) xParams.set("hashtags", hashtags.join(","));
    if (via) xParams.set("via", via);

    return [
      {
        name: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: "#1877F2",
        icon: FacebookIcon,
      },
      {
        name: "X",
        href: `https://twitter.com/intent/tweet?${xParams.toString()}`,
        color: "#000000",
        icon: XIconGlyph,
      },
      {
        name: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        color: "#0A66C2",
        icon: LinkedInIcon,
      },
      {
        name: "WhatsApp",
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        color: "#25D366",
        icon: WhatsAppIcon,
      },
      {
        name: "Telegram",
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        color: "#229ED9",
        icon: TelegramIcon,
      },
      {
        name: "Reddit",
        href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        color: "#FF4500",
        icon: RedditIcon,
      },
      {
        name: "Email",
        href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0D%0A${encodedUrl}`,
        color: "#6B7280",
        icon: MailIconGlyph,
      },
    ];
  }, [absoluteUrl, title, hashtags, via]);

  // Native share (mobile) -> if not available, open modal
  const share = useCallback(async () => {
    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share({ title, url: absoluteUrl });
        setStatus("Shared!");
        setTimeout(() => setStatus(""), 1200);
      } else {
        openModal();
      }
    } catch {
      // user canceled: ignore
    }
  }, [absoluteUrl, title]);

  // Copy absolute link
  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
      } else {
        // tiny fallback
        const ta = document.createElement("textarea");
        ta.value = absoluteUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setStatus("Link copied");
      setTimeout(() => setCopied(false), 1200);
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("Copy failed");
      setTimeout(() => setStatus(""), 1500);
    }
  }, [absoluteUrl]);

  // Modal controls (accessible + simple focus management)
  const openModal = useCallback(() => {
    lastActiveRef.current = document.activeElement;
    setOpen(true);
    // focus close after paint
    setTimeout(() => closeBtnRef.current?.focus(), 0);
  }, []);
  const closeModal = useCallback(() => {
    setOpen(false);
    const el = lastActiveRef.current as HTMLElement | null;
    el?.focus();
  }, []);

  // Dismiss on ESC / outside click
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    const onClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, closeModal]);

  const pad = size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2";
  const text = "text-sm";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const gap = size === "sm" ? "gap-1.5" : "gap-2";

  return (
    <>
      <div
        className={`flex flex-wrap items-center ${gap} ${className}`}
        role="group"
        aria-label="Share this page"
      >
        {/* Share (mobile-native, desktop-modal) */}
        <button
          onClick={share}
          className={`${pad} inline-flex items-center ${gap} rounded-full bg-primary text-white ${text} font-medium shadow hover:shadow-md transition
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/80`}
          aria-label="Share"
        >
          <Share2 className={icon} aria-hidden />
          <span>Share</span>
        </button>

        {/* Copy link */}
        <button
          onClick={copy}
          className={`${pad} inline-flex items-center ${gap} rounded-full border border-slate-300/70 dark:border-slate-600/60 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 ${text} shadow-sm hover:bg-white/90 dark:hover:bg-slate-800/90 transition
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300`}
          aria-label="Copy link"
        >
          {copied ? <Check className={icon} aria-hidden /> : <LinkIcon className={icon} aria-hidden />}
          <span>{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="share-title"
        >
          <div className="w-full sm:w-[520px] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 id="share-title" className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Share “{title}”
              </h3>
              <button
                ref={closeBtnRef}
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300"
                aria-label="Close share dialog"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
                {platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300"
                    aria-label={`Share on ${p.name}`}
                    title={`Share on ${p.name}`}
                    onClick={() => setTimeout(closeModal, 50)}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${p.color}1A` }}
                    >
                      <p.icon className="h-5 w-5" style={{ color: p.color }} />
                    </div>
                    <span className="text-[11px] leading-none text-slate-700 dark:text-slate-200">
                      {p.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Copy row inside modal */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 truncate">
                    {absoluteUrl}
                  </div>
                </div>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:opacity-90 dark:bg-white dark:text-slate-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300"
                >
                  {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SR-only status updates */}
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </>
  );
}

/* ---------- Minimal inline brand icons (no extra deps) ---------- */

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.1 5.66 21.23 10.44 22v-6.99H7.9v-2.94h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.94h-2.34V22C18.34 21.23 22 17.1 22 12.07z" />
    </svg>
  );
}
function XIconGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 3H21l-6.52 7.455L22 21h-6.933l-4.33-5.195L5.7 21H3l6.97-7.957L2 3h7.066l3.9 4.677L18.244 3Zm-1.21 16.2h1.86L7.03 4.74H5.07l11.964 14.46Z" />
    </svg>
  );
}
function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.6c0-1.34-.02-3.07-1.87-3.07-1.88 0-2.17 1.47-2.17 2.98v5.7H9.29V9h3.4v1.56h.05c.47-.89 1.62-1.83 3.33-1.83 3.56 0 4.22 2.34 4.22 5.38v6.34ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM6.96 20.45H3.71V9H6.96v11.45Z" />
    </svg>
  );
}
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.52 3.48A11.5 11.5 0 0 0 2.4 18.26L2 22l3.86-.4A11.49 11.49 0 1 0 20.52 3.48Zm-8.01 17.1a9.5 9.5 0 0 1-4.85-1.32l-.35-.2-2.87.3.3-2.8-.22-.36A9.51 9.51 0 1 1 12.51 20.6Z" />
    </svg>
  );
}
function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.04 15.3 8.9 19a1 1 0 0 0 1.63.78l2.34-1.9 3.86 2.84c.73.54 1.78.14 1.98-.78l3.24-14.7c.21-.95-.71-1.75-1.6-1.4L2.6 9.43c-.99.38-.97 1.78.04 2.14l5.2 1.88 9.83-6.2-8.63 8.05Z" />
    </svg>
  );
}
function RedditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10ZM9.52 9.74c.59 0 1.07.48 1.07 1.07s-.48 1.07-1.07 1.07-1.07-.48-1.07-1.07.48-1.07 1.07-1.07Zm4.96 0c.59 0 1.07.48 1.07 1.07s-.48 1.07-1.07 1.07-1.07-.48-1.07-1.07.48-1.07 1.07-1.07ZM7.8 13.65a.75.75 0 0 1 1.05.16c.88 1.2 2.45 1.96 4.12 1.96 1.66 0 3.23-.76 4.11-1.96a.75.75 0 0 1 1.22.89c-1.17 1.6-3.22 2.57-5.33 2.57s-4.17-.97-5.34-2.57a.75.75 0 0 1 .17-1.05ZM14.2 5.4l2.29.47a1.6 1.6 0 1 1-.23 1.23l-1.84-.38-.56 2.7a5.88 5.88 0 0 1 3.97 2.2.74.74 0 1 1-1.15.93 4.4 4.4 0 0 0-7.01 0 .74.74 0 1 1-1.15-.93 5.89 5.89 0 0 1 3.97-2.2L14.2 5.4Z" />
    </svg>
  );
}
function MailIconGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8.24l7.38 5.53a1 1 0 0 0 1.24 0L20 8.24V18H4Z" />
    </svg>
  );
}
