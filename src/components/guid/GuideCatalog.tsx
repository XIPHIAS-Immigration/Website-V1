"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type ProgramItem = {
  service: "Residency" | "Citizenship" | "Corporate" | "Skilled";
  country: string;
  countryHref: string;
  countryCode?: string;
  program: string;
  href: string;
  brochureUrl?: string | null;
};

type Props = {
  items: ProgramItem[];
  residencyEligibilityHref: string;
  corporateEligibilityHref: string;
  eligibilityHref: string;
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD");
}

export default function GuideCatalog({
  items,
  residencyEligibilityHref,
  corporateEligibilityHref,
  eligibilityHref,
}: Props) {
  const [q, setQ] = useState("");
  const [serviceFilter, setServiceFilter] =
    useState<ProgramItem["service"] | "All">("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [hasBrochureOnly, setHasBrochureOnly] = useState(false);

  const services = useMemo(
    () => Array.from(new Set(items.map((i) => i.service))),
    [items]
  );

  const countries = useMemo(() => {
    const pool =
      serviceFilter === "All" ? items : items.filter((i) => i.service === serviceFilter);
    return ["All", ...Array.from(new Set(pool.map((i) => i.country))).sort()];
  }, [items, serviceFilter]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return items.filter((i) => {
      if (serviceFilter !== "All" && i.service !== serviceFilter) return false;
      if (countryFilter !== "All" && i.country !== countryFilter) return false;
      if (hasBrochureOnly && !i.brochureUrl) return false;
      if (!nq) return true;
      return normalize(`${i.service} ${i.country} ${i.program}`).includes(nq);
    });
  }, [items, q, serviceFilter, countryFilter, hasBrochureOnly]);

  const activeEligibilityHref =
    serviceFilter === "Residency"
      ? residencyEligibilityHref
      : serviceFilter === "Corporate"
      ? corporateEligibilityHref
      : eligibilityHref;

  function downloadCsv() {
    const header = ["Service", "Country", "Program", "Program URL", "Brochure URL"];
    const rows = filtered.map((i) => [
      i.service,
      i.country,
      i.program,
      i.href,
      i.brochureUrl ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "programs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function trackBrochure(eventName: string, item: ProgramItem) {
    try {
      const w = window as any;
      if (w.dataLayer) {
        w.dataLayer.push({
          event: eventName,
          service: item.service,
          country: item.country,
          program: item.program,
          program_url: item.href,
          brochure_url: item.brochureUrl,
        });
      }
    } catch {}
  }

  /* ----- Auto show top scrollbar only when needed ----- */
  const topScrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const syncing = useRef(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [contentWidth, setContentWidth] = useState(980);

  useEffect(() => {
    const measure = () => {
      const scrollWidth = tableRef.current?.scrollWidth ?? 980;
      const clientWidth = wrapRef.current?.clientWidth ?? 0;
      setContentWidth(scrollWidth);
      setNeedsScroll(scrollWidth > clientWidth + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (tableRef.current) ro.observe(tableRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const scrollWidth = tableRef.current?.scrollWidth ?? 980;
    const clientWidth = wrapRef.current?.clientWidth ?? 0;
    setContentWidth(scrollWidth);
    setNeedsScroll(scrollWidth > clientWidth + 1);
  }, [filtered.length, q, serviceFilter, countryFilter, hasBrochureOnly]);

  const onTopScroll = () => {
    if (!topScrollRef.current || !wrapRef.current) return;
    if (syncing.current) return;
    syncing.current = true;
    wrapRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    requestAnimationFrame(() => (syncing.current = false));
  };
  const onTableScroll = () => {
    if (!topScrollRef.current || !wrapRef.current) return;
    if (syncing.current) return;
    syncing.current = true;
    topScrollRef.current.scrollLeft = wrapRef.current.scrollLeft;
    requestAnimationFrame(() => (syncing.current = false));
  };

  return (
    <div className="mt-0">
      {/* Controls — single row, scroll if overflow */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
        <input
          id="q"
          type="search"
          placeholder="Search programs, countries, services"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[220px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as any)}
          className="min-w-[140px] rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm text-black shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          <option value="All">All Services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="min-w-[140px] rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm text-black shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Top scrollbar — only when needed */}
      {needsScroll && (
        <div
          ref={topScrollRef}
          onScroll={onTopScroll}
          className="mt-2 h-3 overflow-x-auto overflow-y-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
          aria-hidden="true"
        >
          <div style={{ width: contentWidth, height: 1 }} />
        </div>
      )}

      {/* Table — one line per row, chips always visible, sticky Actions on right */}
      <div
        ref={wrapRef}
        onScroll={onTableScroll}
        className="mt-2 overflow-auto rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800"
      >
        <table
          ref={tableRef}
          className="table-auto w-full text-[13px] leading-tight"
          style={{ minWidth: 0 }}
        >
          <colgroup>
            <col style={{ width: "14ch" }} />
            <col style={{ width: "18ch" }} />
            <col style={{ width: "auto" }} />
            <col style={{ width: "1%", minWidth: 230 }} />
          </colgroup>

          <thead className="sticky top-0 z-20 bg-white dark:bg-zinc-900">
            <tr>
              <th className="px-2.5 py-2 text-left font-semibold text-black dark:text-white">Service</th>
              <th className="px-2.5 py-2 text-left font-semibold text-black dark:text-white">Country</th>
              <th className="px-2.5 py-2 text-left font-semibold text-black dark:text-white">Program</th>
              <th className="sticky right-0 z-20 bg-white px-2.5 py-2 text-left font-semibold text-black dark:bg-zinc-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {filtered.map((i) => (
              <tr key={i.href} className="align-top">
                <td className="whitespace-nowrap px-2.5 py-1.5 text-black dark:text-white">
                  {i.service}
                </td>

                <td className="whitespace-nowrap px-2.5 py-1.5">
                  <Link href={i.countryHref} className="text-black hover:underline dark:text-white">
                    {i.country}
                  </Link>
                </td>

                <td className="px-2.5 py-1.5">
                  <div className="truncate" title={i.program}>
                    <Link href={i.href} className="font-medium text-black hover:underline dark:text-white">
                      {i.program}
                    </Link>
                  </div>
                </td>

                {/* Sticky right — chip buttons, always visible, one row */}
                <td className="sticky right-0 z-10 bg-white px-2.5 py-1.5 dark:bg-zinc-900">
                  <div className="flex flex-nowrap items-center gap-1.5">
                    <Link
                      href={i.href}
                      className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      aria-label="View Program"
                    >
                      Explore Program
                    </Link>

                    {i.brochureUrl ? (
                      <a
                        href={i.brochureUrl}
                        download
                        onClick={() => trackBrochure("brochure_download", i)}
                        className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-200 dark:ring-blue-800/60"
                        aria-label="Download Brochure"
                      >
                        Brochure
                      </a>
                    ) : (
                      <span
                        className="rounded-md bg-white px-2.5 py-1.5 text-xs text-black/60 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-white/60 dark:ring-zinc-700"
                        aria-hidden="true"
                      >
                        No brochure
                      </span>
                    )}

                    <Link
                      href={eligibilityHref}
                      className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-black ring-1 ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700"
                      aria-label="Check Eligibility"
                    >
                      Eligibility
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="mt-3 text-sm text-black dark:text-white">No programs match your filters.</p>
      )}
    </div>
  );
}
