import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, ExternalLink, FileQuestion, Search } from "lucide-react";
import type { CrmFileLink } from "@/lib/crm/india-live";

export function number(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function text(value: unknown, fallback = "Not set") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function compactText(value: unknown, fallback = "-") {
  const content = text(value, fallback);
  return content.length > 160 ? `${content.slice(0, 160)}...` : content;
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "cyan",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "cyan" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
    amber: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
    slate: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
  };

  return (
    <article className={`rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-normal">{typeof value === "number" ? number(value) : value}</p>
      {hint ? <p className="mt-2 text-xs font-semibold opacity-75">{hint}</p> : null}
    </article>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">{eyebrow}</p> : null}
          <h3 className="mt-1 text-lg font-black tracking-normal text-slate-950 dark:text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatusPill({ active, label }: { active?: boolean; label?: string }) {
  const ok = active ?? label?.toLowerCase().includes("active") ?? false;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
      }`}
    >
      {ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
      {label || (ok ? "Active" : "Inactive")}
    </span>
  );
}

export function SearchBox({ q = "", placeholder = "Search" }: { q?: string; placeholder?: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950">
      <p className="font-black text-slate-900 dark:text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{detail}</p>
    </div>
  );
}

export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
      {message}
    </div>
  );
}

export function FileLinks({ links }: { links: CrmFileLink[] }) {
  if (!links.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <FileQuestion className="size-3" />
        No file expected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) =>
        link.exists ? (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
            title={`Available: ${link.fileName}`}
          >
            <ExternalLink className="size-3" />
            <span className="max-w-52 truncate">{link.fileName}</span>
            <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] uppercase dark:bg-black/20">Available</span>
          </Link>
        ) : (
          <span
            key={link.href}
            className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
            title={`Referenced in SQL but not found in the mounted legacy folders: ${link.fileName}`}
          >
            <Clock3 className="size-3" />
            <span className="max-w-52 truncate">{link.fileName}</span>
            <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] uppercase dark:bg-black/20">Pending sync</span>
          </span>
        )
      )}
    </div>
  );
}

export function FileStateSummary({ links }: { links: CrmFileLink[] }) {
  const available = links.filter((link) => link.exists).length;
  const pending = links.length - available;

  if (!links.length) {
    return <StatusPill label="No file expected" />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <StatusPill active={available > 0} label={`${number(available)} available`} />
      {pending ? <StatusPill label={`${number(pending)} pending sync`} /> : null}
    </div>
  );
}

export function Pager({
  page,
  total,
  pageSize,
  basePath,
  query,
  params,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  query?: string;
  params?: Record<string, string | number | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);
  const hrefFor = (pageNumber: number) => {
    const searchParams = new URLSearchParams({ page: String(pageNumber) });
    if (query) searchParams.set("q", query);
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && String(value).trim()) searchParams.set(key, String(value));
    });
    return `${basePath}?${searchParams.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="font-semibold text-slate-600 dark:text-slate-300">
        Page {number(page)} of {number(pages)} / {number(total)} total
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(prev)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="size-4" />
          Prev
        </Link>
        <Link
          href={hrefFor(next)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          Next
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
