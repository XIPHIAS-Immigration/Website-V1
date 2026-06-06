// ============================
// src/components/Contact/MapCard.tsx
// ============================
"use client";

import * as React from "react";

type MapCardProps = {
  query: string;
  /** Accept readonly so CONTACT.address (declared `as const`) works */
  address?: ReadonlyArray<string>;
  height?: number;
  zoom?: number;
  className?: string;
  title?: string;
  showAppleLink?: boolean;
  disableInteractionGuard?: boolean;
};

export default function MapCard({
  query,
  address = [],
  height = 320,
  zoom = 14,
  className,
  title = "Office map",
  showAppleLink = true,
  disableInteractionGuard = false,
}: MapCardProps) {
  const encoded = encodeURIComponent(query);
  const embedSrc = `https://www.google.com/maps?q=${encoded}&z=${zoom}&output=embed`;
  const mapsLink = `https://www.google.com/maps?q=${encoded}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const appleLink = `https://maps.apple.com/?q=${encoded}`;

  const [loaded, setLoaded] = React.useState(false);
  const [interact, setInteract] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isApple, setIsApple] = React.useState(false);

  React.useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsApple(/iPad|iPhone|iPod|Macintosh/i.test(ua));
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const primaryMapsHref = isApple && showAppleLink ? appleLink : mapsLink;

  return (
    <section
      className={[
        "rounded-3xl overflow-hidden ring-1 ring-blue-100/80",
        "bg-white dark:bg-white/5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={title}
    >
      {/* Map with guard */}
      <div className="relative">
        {!loaded && (
          <div
            className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(0,0,0,0.06)_8%,transparent_18%,rgba(0,0,0,0.06)_33%)] bg-[length:200%_100%]"
            aria-hidden
          />
        )}

        <div className="relative">
          <div className="md:hidden aspect-[4/3]" />
          <iframe
            title={title}
            src={embedSrc}
            width="100%"
            style={{ height: "100%", minHeight: "240px" }}
            height={height}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={[
              "block w-full",
              interact || disableInteractionGuard ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
            onLoad={() => setLoaded(true)}
          />

          {!disableInteractionGuard && !interact && (
            <button
              type="button"
              onClick={() => setInteract(true)}
              className={[
                "absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/35 via-black/10 to-transparent",
                "transition focus:outline-none",
              ].join(" ")}
              aria-label="Enable map interactions"
            >
              <span
                className={[
                  "m-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                  "bg-white text-black text-xs font-medium ring-1 ring-blue-200",
                  "dark:bg-white/10 dark:text-white dark:ring-blue-900/50 backdrop-blur",
                ].join(" ")}
              >
                <HandIcon />
                Tap to interact
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Actions + address */}
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white text-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <DirectionsIcon />
            Get directions
          </a>

        <a
            href={primaryMapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
          >
            <OpenIcon />
            {isApple && showAppleLink ? "Open in Apple Maps" : "Open in Google Maps"}
          </a>

          {address.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address.join(", "));
                  setCopied(true);
                } catch {
                  /* no-op */
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-black ring-1 ring-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-white dark:ring-blue-900/40 dark:hover:bg-blue-950/20"
              aria-live="polite"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy address"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Icons -------------------------------- */

function OpenIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M14 3a1 1 0 000 2h3.586l-7.293 7.293a1 1 0 001.414 1.414L19 6.414V10a1 1 0 102 0V4a1 1 0 00-1-1h-6z" />
      <path fill="currentColor" d="M5 6a3 3 0 00-3 3v9a3 3 0 003 3h9a3 3 0 003-3v-4a1 1 0 10-2 0v4a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h4a1 1 0 100-2H5z" />
    </svg>
  );
}
function DirectionsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M13.172 2.929a3 3 0 00-4.243 0L2.93 8.93a3 3 0 000 4.243l6 6a3 3 0 004.242 0l6-6a3 3 0 000-4.243l-6-6zM12 7a1 1 0 011 1v2h2a1 1 0 010 2h-3a1 1 0 01-1-1V8a1 1 0 011-1z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M8 7a3 3 0 013-3h7a3 3 0 013 3v9a3 3 0 01-3 3h-7a3 3 0 01-3-3V7zm-3 5V6a2 2 0 012-2h8" />
      <rect width="8" height="12" x="4" y="8" rx="2" ry="2" fill="currentColor" opacity=".15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M9 16.17l-3.88-3.88a1 1 0 10-1.41 1.42l4.59 4.58a1 1 0 001.41 0l10-10a1 1 0 10-1.41-1.42L9 16.17z" />
    </svg>
  );
}
function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 2a7 7 0 00-7 7c0 4.2 5.28 10.24 6.32 11.42a1 1 0 001.36 0C13.72 19.24 19 13.2 19 9a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 112.5-2.5 2.5 2.5 0 01-2.5 2.5z" />
    </svg>
  );
}
function HandIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path fill="currentColor" d="M8 13V5a1 1 0 012 0v5h1V3a1 1 0 112 0v7h1V4a1 1 0 112 0v8h1V7a1 1 0 112 0v6.5a5.5 5.5 0 01-5.5 5.5H11A3 3 0 018 16.5V13z" />
    </svg>
  );
}
