"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatDateUSShort } from "@/lib/format";

export type Job = {
  id: string;
  title: string;
  slug: string;
  dept?: string;
  location: string;
  employmentType?: string;
  postedAt?: string;
  summary?: string;
  remote?: boolean;
};

function fmtDate(iso?: string) {
  if (!iso) return "";
  return formatDateUSShort(iso); // ✅ deterministic US date, UTC
}

/** normalize string: lowercase, strip diacritics & punctuation */
function norm(s = "") {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** tiny levenshtein for typos (fast enough for small lists) */
function lev(a: string, b: string) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      prev = tmp;
    }
  }
  return dp[n];
}

/** synonyms & common variants (extend as needed) */
const SYN = new Map<string, string>([
  ["bangalore", "bengaluru"],
  ["bengalore", "bengaluru"], // common misspelling
  ["blr", "bengaluru"],
  ["uae", "united arab emirates"],
  ["dubai", "united arab emirates"],
  ["ua", "united arab emirates"],
]);

function expandQueryTokens(q: string): string[] {
  const tokens = norm(q).split(" ").filter(Boolean);
  const out = new Set<string>();
  tokens.forEach((t) => {
    out.add(t);
    const syn = SYN.get(t);
    if (syn) {
      syn.split(" ").forEach((x) => out.add(x));
      out.add(syn);
    }
  });
  return Array.from(out);
}

function textBank(job: Job) {
  const fields = [
    job.title,
    job.summary ?? "",
    job.location,
    job.dept ?? "",
  ]
    .map(norm)
    .join(" ");
  return fields.split(" ").filter(Boolean);
}

function matchesJob(job: Job, q: string, dept: string, remoteOnly: boolean) {
  // department & remote checks
  if (!(dept === "all" || job.dept === dept)) return false;
  const isRemote = job.remote || /remote/i.test(job.location);
  if (remoteOnly && !isRemote) return false;

  // query check (forgiving)
  const nq = norm(q);
  if (!nq) return true;

  const tokens = expandQueryTokens(nq);
  const bankTokens = textBank(job);

  // direct includes on concatenated string (fast path)
  const allText = bankTokens.join(" ");
  const direct = tokens.every((t) => allText.includes(t));
  if (direct) return true;

  // fuzzy: if any token is within edit distance <= 2 of any bank token
  return tokens.every((t) => {
    for (const b of bankTokens) {
      if (b.includes(t)) return true;
      if (Math.abs(b.length - t.length) <= 2 && lev(t, b) <= 2) return true;
    }
    return false;
  });
}

export default function JobList({ jobs }: { jobs: Job[] }) {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const dept = sp.get("dept") || "all";
  const remoteOnly = sp.get("remote") === "1";

  const filtered = useMemo(
    () => jobs.filter((j) => matchesJob(j, q, dept, remoteOnly)),
    [jobs, q, dept, remoteOnly]
  );

  if (filtered.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-black dark:border-white/20 dark:bg-white/5 dark:text-white">
        <h3 className="text-base font-semibold">No roles found</h3>
        <p className="mt-1 text-sm">
          Try different keywords (e.g., <strong>Bengaluru</strong>, <strong>Remote</strong>, <strong>Sales</strong>) or{" "}
          <a href="/careers#apply" className="font-semibold underline decoration-2 underline-offset-2">
            send your resume
          </a>.
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((job) => (
        <li key={job.id}>
          <article
            className={[
              "h-full rounded-3xl p-4 sm:p-5",
              "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
              "hover:bg-white transition",
              "text-black dark:text-white",
              "dark:from-blue-950/30 dark:to-indigo-950/20 dark:ring-blue-900/40",
            ].join(" ")}
          >
            <h3 className="text-base font-extrabold leading-6">{job.title}</h3>
            <p className="mt-1 text-sm">
              {job.location}
              {job.employmentType ? ` • ${job.employmentType}` : ""}
              {job.postedAt ? ` • ${fmtDate(job.postedAt)}` : ""}
            </p>

            {job.summary && <p className="mt-2 line-clamp-2 text-sm">{job.summary}</p>}

            <div className="mt-4 flex items-center gap-3">
              <Link
                href={`/careers/${job.slug}`}
                prefetch={false}
                className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`View details for ${job.title}`}
              >
                View & Apply
              </Link>
              <a href="/careers#apply" className="text-sm font-semibold underline decoration-2 underline-offset-2">
                Quick apply
              </a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}