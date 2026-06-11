"use client";

import * as React from "react";

/* ----------------------------- Strict Types ----------------------------- */

type RegionKey =
  | "india"
  | "canada"
  | "australia"
  | "brazil"
  | "uae"
  | "europe"
  | "newzealand"
  | "unitedkingdom"
  | "usa"
  | "qatar"

type Region = { key: RegionKey; label: string };

type Office = {
  id: string;
  city: string;
  regionKey: RegionKey;
  company?: string;
  address: string[];
  phones?: string[];
  email?: string;
  whatsapp?: string;
  website?: string;
  fax?: string | string[];
  /** Only used to create an external Google Maps link */
  mapQuery?: string;
};

/* ------------------------ Utilities (typed helpers) --------------------- */

function normalizeTel(input: string): string {
  return input.replace(/[^\d+]/g, "");
}

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.03-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.03l-2.2 2.2z"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M20 6H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zm0 2v.01L12 13 4 8.01V8h16zM4 16V9.24l7.4 4.63a1 1 0 001.2 0L20 9.24V16H4z"
      />
    </svg>
  );
}
function WhatsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M20.52 3.48A11.9 11.9 0 0012.01 1C6.49 1 2 5.49 2 11.01c0 1.94.49 3.78 1.44 5.42L2 23l6.77-1.39a10.98 10.98 0 003.24.48C18.52 22.09 23 17.6 23 12.08c0-3.19-1.24-6.19-3.48-8.6zM12 20.09c-1.06 0-2.1-.17-3.08-.5l-.22-.08-4.02.83.83-3.92-.11-.2A8.93 8.93 0 013.91 11C3.91 6.59 7.58 2.92 12 2.92S20.09 6.59 20.09 11 16.42 20.09 12 20.09zm5.12-5.29c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.91 1.08-.17.19-.34.21-.62.07-.28-.14-1.18-.43-2.25-1.38a8.42 8.42 0 01-1.56-1.92c-.17-.28-.02-.43.13-.57.13-.12.28-.31.42-.46.14-.15.19-.25.28-.42.09-.18.05-.33-.02-.46-.07-.14-.64-1.55-.88-2.12-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.46.07-.7.33-.24.28-.92.9-.92 2.18s.95 2.54 1.09 2.72c.14.19 1.87 2.85 4.53 3.88.63.27 1.12.43 1.51.55.63.2 1.2.17 1.65.1.5-.08 1.54-.63 1.76-1.25.21-.62.21-1.15.14-1.26-.07-.1-.26-.17-.54-.31z"
      />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M10.59 13.41a1.996 1.996 0 010-2.83l3.18-3.18a2 2 0 112.83 2.83l-1.41 1.41a1 1 0 11-1.41-1.41l1.41-1.41a.5.5 0 10-.71-.71l-3.18 3.18a.5.5 0 10.71.71l.71-.71a1 1 0 111.41 1.41l-.71.71a1.996 1.996 0 01-2.83 0z"
      />
    </svg>
  );
}
function FaxIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M17 3H7v4H5a3 3 0 00-3 3v7a3 3 0 003 3h14a3 3 0 003-3v-7a3 3 0 00-3-3h-2V3zM9 5h6v2H9V5zm10 6v6H5v-6h14zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z"
      />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 101.06 1.06l5.25-5.25a.75.75 0 000-1.06L13.53 5.97a.75.75 0 10-1.06 1.06l3.72 3.72H5a.75.75 0 000 1.5z"
      />
    </svg>
  );
}
function OpenIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 100 2h3.586l-7.293 7.293a1 1 0 101.414 1.414L19 6.414V10a1 1 0 102 0V4a1 1 0 00-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 00-3 3v9a3 3 0 003 3h9a3 3 0 003-3v-4a1 1 0 10-2 0v4a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h4a1 1 0 100-2H5z"
      />
    </svg>
  );
}

/* ----------------------------- Main Component --------------------------- */

export default function LocationsDirectory({
  className = "",
}: {
  className?: string;
}) {
  /* Regions */
  const REGIONS: Region[] = [
    { key: "india", label: "India" },
    { key: "canada", label: "Canada" },
    { key: "australia", label: "Australia" },
    { key: "brazil", label: "Brazil" },
    { key: "uae", label: "UAE" },
    { key: "europe", label: "Europe" },
    { key: "newzealand", label: "New Zealand" },
    { key: "unitedkingdom", label: "United Kingdom" },
    { key: "usa", label: "USA" },
    { key: "qatar", label: "Qatar" },
  ];

  /* Offices */
  const OFFICES: Office[] = [
    // INDIA
    {
      id: "blr",
      city: "Bengaluru",
      company: "XIPHIAS IMMIGRATION PVT LTD",
      regionKey: "india",
      address: [
        "Aurbis Prime, 11, Kaveri Regent Coronet, 80 Feet Road, 3rd Block, Koramangala",
        "Bengaluru - 560034",
      ],
      phones: ["+91 9021335577"],
      email: "immigration@xiphias.in",
      mapQuery:
        "Aurbis Prime, 80 Feet Road, 3rd Block Koramangala, Bengaluru 560034",
    },
    {
      id: "gurugram",
      city: "Gurugram",
      company: "XIPHIAS IMMIGRATION PVT LTD",
      regionKey: "india",
      address: [
        "Augusta Point, Golf Course Rd, near Parsvnath Exotica, DLF Phase 5, Sector 53",
        "Gurugram, Haryana 122002",
      ],
      phones: ["+91-96675 20211"],
      email: "Gurgaon@xiphias.in",
    },

    // CANADA
    {
      id: "can-waterloo",
      city: "Waterloo, ON",
      company: "XIPHIAS Investment Migration Inc.",
      regionKey: "canada",
      address: ["3-133 Weber Street North, Suite 514, Waterloo, ON N2J 3G9"],
      phones: ["(438) 379-9101"],
      email: "info@xiphiasimmigration.com",
    },
    {
      id: "can-montreal",
      city: "Montreal, QC",
      company: "XIPHIAS Projects Inc.",
      regionKey: "canada",
      address: ["1200 McGill College Avenue, Suite 1100, Montreal QC H3B 4G7"],
      phones: ["+1-438-379-9101"],
      email: "info@xiphiasimmigration.com",
    },

    // AUSTRALIA
    {
      id: "aus-mel",
      city: "Australia",
      company: "XIPHIAS Immigration",
      regionKey: "australia",
      address: ["SSCS-Suite 204, 227 Collins Street, Melbourne, Vic – 3000."],
      phones: ["+61-0451239 239"],
      email: "info@xiphiasimmigration.com",
    },

    // BRAZIL
    {
      id: "bra-sao",
      city: "Brazil",
      company: "HOFF ADVOCACIA",
      regionKey: "brazil",
      address: [
        "Tabapuã Street, No. 594, Room 46 Itaim Bibi, São Paulo Capital, SP – Postal Code: 04533-002 Brasil, CEP: 04533-002",
      ],
      phones: ["(11) 3787-0935", "(11) 98070-8842"],
      email: "info@xiphiasimmigration.com",
    },
    // UAE
    {
      id: "uae-dubai",
      city: "Dubai",
      company: "XIPHIAS IMMIGRATION DMCC",
      regionKey: "uae",
      address: [
        "Unit No: 608, Platinum Tower, Plot No: JLT-PH1-I2",
        "Jumeirah Lakes Towers, Dubai, UAE",
      ],
      phones: ["+971-527 275 101"],
      email: "dubai@xiphiasimmigration.com",
      website: "https://www.xiphiasimmigration.ae",
    },

    // EUROPE
    {
      id: "eu-cyprus",
      city: "Larnaca, Cyprus",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "europe",
      address: [
        "41-43 Spyros Kyprianou Ave., Patroclos Tower, 6th Floor, Larnaca, 6051",
      ],
      phones: ["+357-24-812000"],
      fax: "+357-24-635964",
      email: "info@xiphiasimmigration.com",
    },
    {
      id: "eu-portugal",
      city: "Lisbon, Portugal",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "europe",
      address: ["Rua do Mar Vermelho, nº 2, 2.1, 1990-152 Lisboa"],
      phones: ["+351-218 954 290"],
      fax: "+351-218 943 244",
      email: "info@xiphiasimmigration.com",
    },
    {
      id: "eu-malta",
      city: "Valletta, Malta",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "europe",
      address: ["120, St Ursula Street, Valletta, VLT 1236 AD"],
      phones: ["+356 2205 6611"],
      fax: "+356 2205 6201",
      email: "info@xiphiasimmigration.com",
    },
    {
      id: "eu-spain",
      city: "València, Spain",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "europe",
      address: ["Plaza del Ayuntamiento 19, Office 3G, València"],
      whatsapp: "+34 960 730 029",
      email: "info@xiphiasimmigration.com",
    },

    // NEW ZEALAND
    {
      id: "nz-auckland",
      city: "Auckland",
      company:
        "XIPHIAS IMMIGRATION PVT LTD (Represented by Belinda Wang, LIA #200902240)",
      regionKey: "newzealand",
      address: ["26C Aviemore Drive, Highland Park, Auckland"],
      phones: ["+64 21 269 9692", "+64 9 535 0227"],
      email: "belinda@xiphias.in",
    },

    // UNITED KINGDOM
    {
      id: "uk-leicester",
      city: "Leicester",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "unitedkingdom",
      address: ["5 Upper King Street, Leicester, LE1 6XF"],
      phones: ["+44 (0) 781 392 9395", "+44 (0) 116 319 4884"],
      email: "info@xiphiasimmigration.com",
    },

    // USA
    {
      id: "usa-la",
      city: "Los Angeles, CA",
      company: "XIPHIAS IMMIGRATION PVT LTD (Represented by Partners)",
      regionKey: "usa",
      address: ["1605 North Cahuenga Blvd, Hollywood, CA 90028"],
      phones: ["+1 323 466 1400"],
      email: "info@xiphiasimmigration.com",
    },

    // QATAR
    {
      id: "qa-doha",
      city: "Doha",
      company: "ILC LLC (Represented by Partners)",
      regionKey: "qatar",
      address: [
        "Office #3402, Al Jazeera Tower, Conference Center Road, West Bay, P.O Box 4011, Doha, Qatar",
      ],
      phones: ["+974 4476 0562"],
      fax: "4007 5001",
      email: "info@xiphiasimmigration.com",
      website: "https://www.xiphiasimmigration.ae",
    },
  ];

  /* Group by region (typed Map) */
  const grouped: Map<RegionKey, Office[]> = React.useMemo(() => {
    const m = new Map<RegionKey, Office[]>();
    REGIONS.forEach((r: Region) => m.set(r.key, []));
    OFFICES.forEach((o: Office) =>
      m.set(o.regionKey, [...(m.get(o.regionKey) ?? []), o]),
    );
    return m;
  }, []);

  const count = (key: RegionKey): number => (grouped.get(key) ?? []).length;

  return (
    <section className={["w-full", className].join(" ")}>
      {/* Header */}
      <div className="rounded-2xl ring-1 ring-blue-100/80 bg-white/80 p-4 shadow-sm dark:ring-blue-900/40 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold md:text-xl">Worldwide locations</h2>
        <p className="mt-1 text-xs md:text-sm text-black/70 dark:text-white/70">
          Jump to a region and contact the nearest office. No maps or images—just essentials.
        </p>

        {/* Jump nav */}
        <div className="mt-3 overflow-x-auto">
          <ol className="flex gap-1.5">
            {REGIONS.map((r: Region) => (
              <li key={r.key}>
                <a
                  href={`#region-${r.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:bg-white/5 dark:text-blue-200"
                >
                  <span>{r.label}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 ring-1 ring-blue-200 dark:bg-white/10 dark:text-blue-300 dark:ring-blue-800/60">
                    {count(r.key)}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-8">
        {REGIONS.map((r: Region) => {
          const offices: Office[] = grouped.get(r.key) ?? [];
          return (
            <section
              key={r.key}
              id={`region-${r.key}`}
              className="scroll-mt-24"
              aria-labelledby={`heading-${r.key}`}
            >
              <div className="mb-2 flex items-end justify-between">
                <h3 id={`heading-${r.key}`} className="text-sm font-semibold">
                  {r.label}
                </h3>
                <span className="text-xs text-black/60 dark:text-white/60">
                  {offices.length} {offices.length === 1 ? "office" : "offices"}
                </span>
              </div>

              {offices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-blue-200 p-6 text-center text-sm text-zinc-600 dark:border-blue-900/40">
                  No offices listed.
                </div>
              ) : (
                <div className="rounded-xl ring-1 ring-blue-100/80 bg-white/80 dark:ring-blue-900/40 dark:bg-white/[0.03]">
                  <ul className="divide-y divide-blue-100/70 dark:divide-blue-900/40">
                    {offices.map((o: Office) => (
                      <li key={o.id} className="p-4 sm:p-5">
                        <OfficeRow office={o} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Back to top */}
      <div className="mt-6">
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:bg-white/5 dark:text-blue-200"
        >
          ↑ Back to top
        </a>
      </div>
    </section>
  );
}

/* ------------------------------ Office Row ------------------------------- */

function OfficeRow({ office: o }: { office: Office }) {
  const phones: string[] = (o.phones ?? []).filter(Boolean);
  const faxes: string[] = Array.isArray(o.fax) ? o.fax : o.fax ? [o.fax] : [];

  const tel = (p: string): string => `tel:${normalizeTel(p)}`;
  const wa = (p: string): string =>
    `https://wa.me/${normalizeTel(p).replace(/^\+/, "")}`;
  const mapLink: string | undefined = o.mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(o.mapQuery)}`
    : undefined;

  return (
    <article className="relative grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
      {/* Left: title + address */}
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="truncate text-[15px] font-semibold">{o.city}</h4>
        </div>
        {o.company && (
          <div className="mt-0.5 truncate text-[13px] font-medium text-blue-700 dark:text-blue-300">
            {o.company}
          </div>
        )}
        <div className="mt-1.5 space-y-0.5 text-sm text-zinc-800 dark:text-zinc-300">
          {o.address.map((line: string, i: number) => (
            <div key={i} className="truncate">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Right: meta + actions */}
      <div className="min-w-0 sm:pl-4">
        <dl className="space-y-1 text-sm">
          {phones.map((p: string, i: number) => (
            <div key={`ph-${i}`} className="flex items-center gap-2">
              <PhoneIcon />
              <a
                className="underline decoration-blue-400 hover:decoration-blue-600"
                href={tel(p)}
              >
                {p}
              </a>
            </div>
          ))}
          {o.email && (
            <div className="flex items-center gap-2">
              <MailIcon />
              <a
                className="underline decoration-blue-400 hover:decoration-blue-600"
                href={`mailto:${o.email}`}
              >
                {o.email}
              </a>
            </div>
          )}
          {o.whatsapp && (
            <div className="flex items-center gap-2">
              <WhatsIcon />
              <a
                className="underline decoration-blue-400 hover:decoration-blue-600"
                href={wa(o.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {o.whatsapp}
              </a>
            </div>
          )}
          {faxes.map((f: string, i: number) => (
            <div key={`fax-${i}`} className="flex items-center gap-2">
              <FaxIcon />
              <span>{f}</span>
            </div>
          ))}
          {o.website && (
            <div className="flex items-center gap-2">
              <LinkIcon />
              <a
                className="underline decoration-blue-400 hover:decoration-blue-600"
                href={o.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {o.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </dl>

        <div className="mt-2 flex flex-wrap gap-2">
          {o.email && (
            <a
              href={`mailto:${o.email}`}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs text-white ring-1 ring-blue-700/20 hover:bg-blue-700"
            >
              Email
              <ArrowRight />
            </a>
          )}
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs ring-1 ring-blue-200 text-blue-700 hover:bg-blue-50 dark:ring-blue-800/60 dark:text-blue-200 dark:hover:bg-white/10"
            >
              Directions
              <OpenIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
