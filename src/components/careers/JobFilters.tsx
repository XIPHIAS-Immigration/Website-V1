"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = { depts: string[] };

export default function JobFilters({ depts }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [dept, setDept] = useState(sp.get("dept") ?? "all");
  const [remoteOnly, setRemoteOnly] = useState(sp.get("remote") === "1");

  const lastQsRef = useRef<string>(sp.toString());

  const deptOptions = useMemo(() => {
    const uniq = Array.from(new Set(depts.filter(Boolean)));
    return ["all", ...uniq.sort((a, b) => a.localeCompare(b))];
  }, [depts]);

  const apply = useCallback(
    (override?: Partial<{ q: string; dept: string; remoteOnly: boolean }>) => {
      const params = new URLSearchParams(sp.toString()); // preserve UTM etc
      const _q = override?.q ?? q;
      const _dept = override?.dept ?? dept;
      const _remote =
        typeof override?.remoteOnly === "boolean" ? override.remoteOnly : remoteOnly;

      if (_q) params.set("q", _q);
      else params.delete("q");

      if (_dept && _dept !== "all") params.set("dept", _dept);
      else params.delete("dept");

      if (_remote) params.set("remote", "1");
      else params.delete("remote");

      const qs = params.toString();
      // Only replace if something actually changed
      if (qs !== lastQsRef.current) {
        lastQsRef.current = qs;
        router.replace(qs ? `/careers?${qs}` : `/careers`, { scroll: false });
      }
    },
    [router, sp, q, dept, remoteOnly]
  );

  // Debounced URL updates while typing (smooth, no scroll)
  useEffect(() => {
    const t = setTimeout(() => apply({ q }), 350);
    return () => clearTimeout(t);
  }, [q, apply]);

  // Immediate updates for dropdown/checkbox (still no scroll)
  useEffect(() => {
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept, remoteOnly]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    apply();
  }

  function clearAll() {
    setQ("");
    setDept("all");
    setRemoteOnly(false);
    lastQsRef.current = "";
    router.replace("/careers", { scroll: false });
  }

  const hasActive = q.trim() !== "" || dept !== "all" || remoteOnly;

  return (
    <form
      role="search"
      aria-label="Filter jobs"
      onSubmit={onSubmit}
      className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-black/20 bg-white/70 p-3 text-black ring-1 ring-black/5 backdrop-blur dark:border-white/20 dark:bg-white/5 dark:text-white dark:ring-white/5"
    >
      <label htmlFor="jobs-search" className="sr-only">Search jobs</label>
      <input
        id="jobs-search"
        type="search"
        inputMode="search"
        placeholder="Search by title, location..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="min-w-[220px] flex-1 rounded-lg border border-black/20 px-3 py-2 text-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:text-white dark:placeholder-white"
        aria-label="Search jobs by title or location"
      />

      <label htmlFor="jobs-dept" className="sr-only">Filter by department</label>
      <select
        id="jobs-dept"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        aria-label="Filter by department"
        className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-white/20 dark:bg-transparent dark:text-white"
      >
        {deptOptions.map((d) => (
          <option key={d} value={d}>
            {d === "all" ? "All Departments" : d}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={(e) => setRemoteOnly(e.target.checked)}
          className="h-4 w-4 rounded border-black/30 text-blue-600 focus:ring-blue-400"
          aria-label="Remote only"
        />
        <span className="text-black dark:text-white">Remote only</span>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Apply
        </button>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-black/20 bg-white/80 px-3 py-2 text-sm font-semibold text-black hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/20 dark:bg-white/10 dark:text-white"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
