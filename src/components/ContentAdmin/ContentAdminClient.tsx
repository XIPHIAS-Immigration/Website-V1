"use client";

import React from "react";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, AlertCircle, FileText, Newspaper, Bell } from "lucide-react";
import AuthenticatedPageGuard from "@/components/Security/AuthenticatedPageGuard";

type ContentKind = "blog" | "articles" | "news";

type ContentItem = {
  kind: ContentKind;
  kindLabel: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  date: string;
  updated: string;
  hero: string;
  heroAlt: string;
  tags: string[];
  countries: string[];
  programs: string[];
  seoTitle: string;
  seoDescription: string;
  url: string;
  wordCount: number;
  visibility: "public" | "hidden";
  status: "ready" | "needs-review" | "hidden";
};

type FormState = {
  originalKind: string;
  originalSlug: string;
  kind: ContentKind;
  title: string;
  slug: string;
  summary: string;
  contentText: string;
  author: string;
  date: string;
  updated: string;
  hero: string;
  heroAlt: string;
  tags: string;
  countries: string;
  programs: string;
  seoTitle: string;
  seoDescription: string;
  visibility: "public" | "hidden";
};

type Props = {
  initialItems: ContentItem[];
  isAuthenticated: boolean;
  configReady: boolean;
  username?: string;
};

const KINDS: Array<{ kind: ContentKind; label: string; singular: string; description: string }> = [
  {
    kind: "blog",
    label: "Blog posts",
    singular: "blog post",
    description: "Client-friendly explainers, country guides, and pathway education.",
  },
  {
    kind: "articles",
    label: "Articles",
    singular: "article",
    description: "Long-form advisory, policy interpretation, and programme analysis.",
  },
  {
    kind: "news",
    label: "News",
    singular: "news update",
    description: "Short immigration announcements, alerts, and timely updates.",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function csvToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function wordCount(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function stripMdxToText(value: string) {
  return value
    .replace(/^---[\s\S]*?---\s*/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[>`*_{}[\]]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isHeadingCandidate(line: string) {
  const trimmed = line.trim();
  if (!trimmed || /^[-*]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) return false;
  if (trimmed.length > 80) return false;
  if (trimmed.split(/\s+/).length > 10) return false;
  return /:$/.test(trimmed) || !/[.!?]$/.test(trimmed);
}

function textToMdx(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  return normalized
    .split(/\n{2,}/)
    .map((block) => {
      if (/<\/?[A-Z][A-Za-z0-9]*(\s|>)/.test(block)) return block.trim();
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) return "";

      if (lines.length === 1) {
        const line = lines[0];
        if (/^<\/?[A-Z][A-Za-z0-9]*(\s|>)/.test(line)) return line;
        if (/^#{1,6}\s+/.test(line) || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) return line;
        if (isHeadingCandidate(line)) return `## ${line.replace(/:$/, "")}`;
        return line;
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) return lines.join("\n");
      if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        return lines.map((line) => line.replace(/^(\d+)[.)]\s+/, "$1. ")).join("\n");
      }

      if (isHeadingCandidate(lines[0])) {
        return [`## ${lines[0].replace(/:$/, "")}`, "", lines.slice(1).join(" ")].join("\n");
      }

      return lines.join(" ");
    })
    .filter(Boolean)
    .join("\n\n");
}

function kindMeta(kind: ContentKind) {
  return KINDS.find((item) => item.kind === kind) ?? KINDS[0];
}

function emptyForm(kind: ContentKind): FormState {
  const date = today();
  const label = kindMeta(kind).singular;
  return {
    originalKind: "",
    originalSlug: "",
    kind,
    title: "",
    slug: "",
    summary: "",
    contentText: `Overview\n\nWrite the ${label} in normal text. Use short paragraphs. If you add a short heading on its own line, the system will format it as a section heading.\n\nKey points\n\n- First point\n- Second point\n- Third point\n\nHow XIPHIAS can help\n\n`,
    author: "XIPHIAS Immigration",
    date,
    updated: date,
    hero: "",
    heroAlt: "",
    tags: "",
    countries: "",
    programs: "",
    seoTitle: "",
    seoDescription: "",
    visibility: "public",
  };
}

function formFromItem(item: ContentItem): FormState {
  return {
    originalKind: item.kind,
    originalSlug: item.slug,
    kind: item.kind,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    contentText: stripMdxToText(item.body),
    author: item.author,
    date: item.date || today(),
    updated: item.updated || today(),
    hero: item.hero,
    heroAlt: item.heroAlt,
    tags: item.tags.join(", "),
    countries: item.countries.join(", "),
    programs: item.programs.join(", "),
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    visibility: item.visibility,
  };
}

function scoreForm(form: FormState) {
  const checks = [
    Boolean(form.title.trim()),
    form.title.trim().length <= 60,
    Boolean(form.slug.trim()),
    form.summary.trim().length >= 80 && form.summary.trim().length <= 200,
    Boolean(form.hero.trim()),
    Boolean(form.heroAlt.trim()),
    wordCount(form.contentText) >= 250,
    (form.seoTitle || form.title).trim().length <= 60,
    (form.seoDescription || form.summary).trim().length <= 160,
    csvToArray(form.tags).length >= 2,
    Boolean(form.date),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function ContentAdminClient({
  initialItems,
  isAuthenticated,
  configReady,
  username,
}: Props) {
  const [items, setItems] = React.useState(initialItems);
  const [view, setView] = React.useState<"library" | "editor">("library");
  const [activeKind, setActiveKind] = React.useState<ContentKind>("blog");
  const [query, setQuery] = React.useState("");
  const [form, setForm] = React.useState<FormState>(() => emptyForm("blog"));
  const [login, setLogin] = React.useState({ username: "", password: "" });
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showStudioPassword, setShowStudioPassword] = React.useState(false);
  const [loggedOut, setLoggedOut] = React.useState(false);
  const contentRef = React.useRef<HTMLTextAreaElement | null>(null);

  const score = scoreForm(form);

  const filteredItems = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (activeKind !== item.kind) return false;
      if (!needle) return true;
      return [item.title, item.slug, item.summary, item.tags.join(" "), item.countries.join(" "), item.programs.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [activeKind, items, query]);

  React.useEffect(() => {
    setLoggedOut(new URLSearchParams(window.location.search).get("loggedOut") === "1");
  }, []);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const insertContent = (snippet: string, selectText?: string) => {
    const textarea = contentRef.current;
    setForm((current) => {
      const value = current.contentText;
      if (!textarea) return { ...current, contentText: `${value}${value.endsWith("\n") ? "" : "\n\n"}${snippet}` };
      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? start;
      const selected = value.slice(start, end);
      const replacement = selectText && selected ? snippet.replace(selectText, selected) : snippet;
      const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = start + replacement.length;
        textarea.setSelectionRange(cursor, cursor);
      });
      return { ...current, contentText: next };
    });
  };

  const handleDelete = async (item: ContentItem) => {
    const confirmed = window.confirm(`Delete "${item.title}"? This removes the MDX file from content/${item.kind}.`);
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/content-admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, slug: item.slug }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to delete content.");
      await refreshItems();
      setMessage("Deleted content item and refreshed the public cache.");
      if (form.originalKind === item.kind && form.originalSlug === item.slug) {
        setView("library");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete content.");
    } finally {
      setBusy(false);
    }
  };

  const refreshItems = async () => {
    const response = await fetch("/api/content-admin/posts", { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data?.items) setItems(data.items);
  };

  const openNew = (kind: ContentKind) => {
    setActiveKind(kind);
    setForm(emptyForm(kind));
    setMessage(null);
    setView("editor");
  };

  const openExisting = (item: ContentItem) => {
    setActiveKind(item.kind);
    setForm(formFromItem(item));
    setMessage(null);
    setView("editor");
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/content-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Login failed.");
      window.location.replace("/content-admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/content-admin/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    });
    window.location.replace("/content-admin?loggedOut=1");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const payload = {
        ...form,
        title: form.title.slice(0, 60),
        slug: form.slug || slugify(form.title),
        summary: form.summary.slice(0, 200),
        seoTitle: (form.seoTitle || form.title).slice(0, 60),
        seoDescription: (form.seoDescription || form.summary).slice(0, 160),
        body: textToMdx(form.contentText),
        tags: csvToArray(form.tags),
        countries: csvToArray(form.countries),
        programs: csvToArray(form.programs),
      };

      const response = await fetch("/api/content-admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to save content.");

      await refreshItems();
      setForm(formFromItem(data.item));
      setMessage("Saved. Your text was converted into MDX and the content cache was refreshed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save content.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("kind", form.kind);
      body.append("file", file);
      const response = await fetch("/api/content-admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to upload image.");
      updateForm("hero", data.image.url);
      updateForm("heroAlt", form.heroAlt || form.title);
      setMessage("Image uploaded and attached.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (!isAuthenticated) {
    const fieldWrap = "flex items-center rounded-lg border bg-white transition-colors focus-within:ring-2 focus-within:ring-offset-1";
    const inputCls = "block w-full bg-transparent py-2.5 text-[14px] text-[#263238] placeholder-[#b0b7c3] focus:outline-none disabled:opacity-50";

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040f24] px-4 py-12">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b2a6b] via-[#061632] to-[#040f24]" />
          <div className="absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-[#1c57b4]/25 blur-[120px]" />
          <div className="absolute right-[8%] bottom-[15%] h-64 w-64 rounded-full bg-[#e1b923]/12 blur-[100px]" />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10">

          {/* ── Dark branding zone ── */}
          <div className="relative bg-[#071a3a] px-7 pt-6 pb-6">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e1b923]/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e1b923]/40 to-transparent" />
            </div>

            {/* Logo + badge */}
            <div className="relative flex items-start justify-between">
              <Image
                src="/images/logo/xiphias-immigration-white.png"
                alt="XIPHIAS Immigration"
                width={120}
                height={42}
                priority
                className="h-auto w-[100px]"
              />
              <span className="mt-0.5 rounded-full border border-[#e1b923]/35 bg-[#e1b923]/10 px-2.5 py-[3px] text-[9px] font-black uppercase tracking-[0.22em] text-[#e1b923]">
                Studio
              </span>
            </div>

            {/* Description */}
            <div className="relative mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e1b923]/80">
                Content Studio
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.6] text-white/75">
                Publish and manage immigration content without touching code.
              </p>
            </div>

            {/* Feature chips */}
            <div className="relative mt-4 flex flex-wrap gap-2">
              {[
                { label: "Blog", Icon: FileText },
                { label: "Articles", Icon: Newspaper },
                { label: "News", Icon: Bell },
              ].map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11.5px] font-semibold text-white/70"
                >
                  <Icon className="size-3 text-[#e1b923]/80" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── White form zone ── */}
          <form onSubmit={handleLogin} noValidate className="bg-white px-7 pb-7 pt-6">
            <h1 className="text-[1.2rem] font-black leading-tight tracking-tight text-[#263238]">
              Sign in
            </h1>

            {loggedOut ? (
              <div className="mt-4 rounded-lg border border-[#dce6f7] bg-[#f4f8ff] px-3.5 py-3 text-[12.5px] font-semibold leading-5 text-[#24466f]">
                You have been signed out securely.
                <a href="/" className="ml-2 font-black text-[#1c57b4] underline underline-offset-4">
                  Return to website
                </a>
              </div>
            ) : null}

            {!configReady && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-[#e1b923]/50 bg-[#e1b923]/10 px-3.5 py-2.5 text-[12px] font-semibold leading-5 text-[#7a5f00]"
              >
                Add CONTENT_ADMIN_USERNAME, CONTENT_ADMIN_PASSWORD, and CONTENT_ADMIN_SECRET before logging in.
              </p>
            )}

            <div className="mt-5 space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="content-admin-username"
                  className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#505050]"
                >
                  Username
                </label>
                <div className={`${fieldWrap} border-[#E1E1E1] hover:border-[#1c57b4]/60 focus-within:ring-[#1c57b4]`}>
                  <User className="ml-3 mr-2.5 size-[15px] shrink-0 text-[#1c57b4]/60" aria-hidden="true" />
                  <input
                    id="content-admin-username"
                    className={`${inputCls} pr-3.5`}
                    value={login.username}
                    onChange={(e) => setLogin((c) => ({ ...c, username: e.target.value }))}
                    autoComplete="username"
                    placeholder="contentadmin"
                    disabled={busy}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="content-admin-password"
                  className="mb-1.5 block text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#505050]"
                >
                  Password
                </label>
                <div className={`${fieldWrap} border-[#E1E1E1] hover:border-[#1c57b4]/60 focus-within:ring-[#1c57b4]`}>
                  <Lock className="ml-3 mr-2.5 size-[15px] shrink-0 text-[#1c57b4]/60" aria-hidden="true" />
                  <input
                    id="content-admin-password"
                    type={showStudioPassword ? "text" : "password"}
                    className={`${inputCls} flex-1`}
                    value={login.password}
                    onChange={(e) => setLogin((c) => ({ ...c, password: e.target.value }))}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudioPassword((v) => !v)}
                    aria-label={showStudioPassword ? "Hide password" : "Show password"}
                    aria-pressed={showStudioPassword}
                    className="mr-3 ml-1 shrink-0 rounded text-[#9ca3af] transition-colors hover:text-[#1c57b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c57b4] focus-visible:ring-offset-1"
                  >
                    {showStudioPassword
                      ? <EyeOff className="size-[15px]" aria-hidden="true" />
                      : <Eye className="size-[15px]" aria-hidden="true" />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {message && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#CF3127]"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {message}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy || !configReady}
                aria-busy={busy}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c57b4] px-4 py-2.5 text-[13.5px] font-bold tracking-wide text-white transition-colors hover:bg-[#1648a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c57b4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                    Checking…
                  </>
                ) : "Enter studio"}
              </button>
              {!loggedOut ? (
                <a
                  href="/"
                  className="inline-flex text-[12.5px] font-bold text-[#1c57b4] underline underline-offset-4"
                >
                  Return to website
                </a>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "library") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950">
        <AuthenticatedPageGuard checkUrl="/api/content-admin/posts" redirectTo="/content-admin?loggedOut=1" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">XIPHIAS Content Studio</p>
              <h1 className="mt-1 text-3xl font-black">Content administration</h1>
              <p className="mt-1 text-sm text-slate-600">
                Create or edit content. Writing opens in a focused full-page editor.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                {username || "content admin"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {KINDS.map((entry) => {
              const count = items.filter((item) => item.kind === entry.kind).length;
              return (
                <button
                  key={entry.kind}
                  type="button"
                  onClick={() => {
                    setActiveKind(entry.kind);
                    openNew(entry.kind);
                  }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#b58a08]">
                        Add
                      </span>
                      <span className="mt-1 block text-2xl font-black text-slate-950">
                        {entry.singular}
                      </span>
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {count} live
                    </span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-slate-600">{entry.description}</span>
                  <span className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-black text-white transition group-hover:bg-blue-800">
                    Start writing
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black">Content library</h2>
                <p className="mt-1 text-sm text-slate-600">Search existing MDX content and open any entry for editing.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm font-bold outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  value={activeKind}
                  onChange={(event) => setActiveKind(event.target.value as ContentKind)}
                >
                  {KINDS.map((entry) => (
                    <option key={entry.kind} value={entry.kind}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <input
                  className="h-11 min-w-[280px] rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="Search title, slug, country, tag"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[72px_1.25fr_0.75fr_0.48fr_0.48fr_0.48fr_150px] gap-3 bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
                <span>Image</span>
                <span>Title</span>
                <span>SEO</span>
                <span>Status</span>
                <span>Date</span>
                <span>Words</span>
                <span>Action</span>
              </div>

              {filteredItems.map((item) => (
                <div
                  key={`${item.kind}-${item.slug}`}
                  className="grid grid-cols-[72px_1.25fr_0.75fr_0.48fr_0.48fr_0.48fr_150px] items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm"
                >
                  <span className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                    {item.hero ? (
                      <img src={item.hero} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-black text-blue-700">
                        {item.kindLabel.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-1 font-black text-slate-950">{item.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{item.url}</span>
                  </span>
                  <span className="text-xs text-slate-600">
                    {(item.seoTitle || item.title).length}/60 title, {(item.seoDescription || item.summary).length}/160 meta
                  </span>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
                      item.visibility === "hidden"
                        ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {item.visibility}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{item.updated || item.date || "-"}</span>
                  <span className="text-xs font-semibold text-slate-600">{item.wordCount}</span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openExisting(item)}
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}

              {!filteredItems.length ? (
                <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  No content found for this selection.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950">
      <AuthenticatedPageGuard checkUrl="/api/content-admin/posts" redirectTo="/content-admin?loggedOut=1" />
      <form onSubmit={handleSave} className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  setView("library");
                  setMessage(null);
                }}
                className="mb-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                Back to library
              </button>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b58a08]">
                {form.originalSlug ? `Editing ${kindMeta(form.kind).singular}` : `New ${kindMeta(form.kind).singular}`}
              </p>
              <h1 className="mt-1 text-3xl font-black">{form.title || "Untitled draft"}</h1>
              <p className="mt-1 text-sm text-slate-600">
                Write in normal text. The system converts headings, paragraphs, and lists into MDX when you save.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="min-w-[150px] text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                Visibility
                <select
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-black normal-case tracking-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  value={form.visibility}
                  onChange={(event) => updateForm("visibility", event.target.value as FormState["visibility"])}
                >
                  <option value="public">Public</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <div className="min-w-[240px] rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm font-black">
                  <span>Readiness</span>
                  <span className={score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-700" : "text-red-700"}>
                    {score}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-blue-700 to-[#e4b321] transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-12 rounded-xl bg-blue-700 px-6 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save content"}
              </button>
              {form.originalSlug ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void handleDelete({
                      kind: form.originalKind as ContentKind,
                      kindLabel: kindMeta(form.kind).label,
                      slug: form.originalSlug,
                      title: form.title || form.originalSlug,
                      summary: form.summary,
                      body: form.contentText,
                      author: form.author,
                      date: form.date,
                      updated: form.updated,
                      hero: form.hero,
                      heroAlt: form.heroAlt,
                      tags: csvToArray(form.tags),
                      countries: csvToArray(form.countries),
                      programs: csvToArray(form.programs),
                      seoTitle: form.seoTitle,
                      seoDescription: form.seoDescription,
                      url: "",
                      wordCount: wordCount(form.contentText),
                      visibility: form.visibility,
                      status: form.visibility === "hidden" ? "hidden" : "ready",
                    })
                  }
                  className="h-12 rounded-xl border border-red-200 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
              {message}
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <div>
                  <label className="block text-sm font-black" htmlFor="content-title">
                    Title
                  </label>
                  <input
                    id="content-title"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g., Portugal Golden Visa: 2026 investor route guide"
                    maxLength={60}
                    value={form.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setForm((current) => ({
                        ...current,
                        title,
                        slug: current.originalSlug || current.slug ? current.slug : slugify(title),
                        seoTitle: current.seoTitle || title.slice(0, 60),
                        heroAlt: current.heroAlt || title,
                      }));
                    }}
                  />
                  <p className="mt-1 text-xs text-slate-500">{form.title.length} of 60 characters used</p>
                </div>
                <div>
                  <label className="block text-sm font-black" htmlFor="content-kind">
                    Type
                  </label>
                  <select
                    id="content-kind"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.kind}
                    onChange={(event) => updateForm("kind", event.target.value as ContentKind)}
                  >
                    {KINDS.map((entry) => (
                      <option key={entry.kind} value={entry.kind}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
                <div>
                  <label className="block text-sm font-black" htmlFor="content-slug">
                    URL handle
                  </label>
                  <input
                    id="content-slug"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.slug}
                    onChange={(event) => updateForm("slug", slugify(event.target.value))}
                  />
                  <p className="mt-1 text-xs text-slate-500">/{form.kind === "blog" ? "blog" : form.kind}/{form.slug || "new-post"}</p>
                </div>
                <div>
                  <label className="block text-sm font-black" htmlFor="author">
                    Author
                  </label>
                  <input
                    id="author"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.author}
                    onChange={(event) => updateForm("author", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="block text-sm font-black" htmlFor="content-summary">
                Short excerpt
              </label>
              <textarea
                id="content-summary"
                className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Summary shown on listing pages and used for meta descriptions."
                maxLength={200}
                value={form.summary}
                onChange={(event) => {
                  const summary = event.target.value;
                  setForm((current) => ({
                    ...current,
                    summary,
                    seoDescription: current.seoDescription || summary.slice(0, 160),
                  }));
                }}
              />
              <p className="mt-1 text-xs text-slate-500">{form.summary.length} of 200 characters. Ideal: 80-200.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="block text-sm font-black" htmlFor="content-body">
                Content
              </label>
              <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                {[
                  ["Title", "\n\n## Section title\n\n"],
                  ["Subtitle", "\n\n### Subsection title\n\n"],
                  ["Bullet list", "\n\n- First point\n- Second point\n- Third point\n\n"],
                  ["Numbered", "\n\n1. First step\n2. Second step\n3. Third step\n\n"],
                  ["Quote", "\n\n> Add a client-friendly insight or quoted note here.\n\n"],
                  ["Callout", "\n\n<Callout tone=\"info\" title=\"Advisor note\">\nAdd the important advisory note here.\n</Callout>\n\n"],
                  ["Button", "\n\n<ButtonLink href=\"/contact\">Book a consultation</ButtonLink>\n\n"],
                ].map(([label, snippet]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => insertContent(snippet)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    {label}
                  </button>
                ))}
                {[
                  ["B", "**selected text**", "selected text"],
                  ["I", "*selected text*", "selected text"],
                  ["U", "<u>selected text</u>", "selected text"],
                ].map(([label, snippet, selected]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => insertContent(snippet, selected)}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                id="content-body"
                ref={contentRef}
                className="mt-2 min-h-[640px] w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-base leading-8 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                value={form.contentText}
                onChange={(event) => updateForm("contentText", event.target.value)}
                placeholder="Paste or write the full content here in normal text."
              />
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                <span>{wordCount(form.contentText)} words</span>
                <span>Short standalone lines become section headings.</span>
                <span>Lines starting with - stay as bullet points.</span>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Hero image</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {form.hero ? (
                  <img src={form.hero} alt={form.heroAlt || ""} className="h-52 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm font-bold text-slate-500">
                    No image attached
                  </div>
                )}
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-4 text-sm font-black text-blue-800 transition hover:border-blue-400 hover:bg-blue-50">
                {uploading ? "Uploading..." : "Upload image"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={handleUpload} disabled={uploading} />
              </label>
              <label className="mt-4 block text-sm font-black" htmlFor="hero-url">
                Image URL
              </label>
              <input
                id="hero-url"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                value={form.hero}
                onChange={(event) => updateForm("hero", event.target.value)}
              />
              <label className="mt-4 block text-sm font-black" htmlFor="hero-alt">
                Alt text
              </label>
              <input
                id="hero-alt"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                maxLength={140}
                value={form.heroAlt}
                onChange={(event) => updateForm("heroAlt", event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">{form.heroAlt.length} of 140 characters used</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Classification</h2>
              <label className="mt-4 block text-sm font-black" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Canada PR, Express Entry, IRCC"
                value={form.tags}
                onChange={(event) => updateForm("tags", event.target.value)}
              />
              <label className="mt-4 block text-sm font-black" htmlFor="countries">
                Countries
              </label>
              <input
                id="countries"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Canada, Portugal"
                value={form.countries}
                onChange={(event) => updateForm("countries", event.target.value)}
              />
              <label className="mt-4 block text-sm font-black" htmlFor="programs">
                Programmes
              </label>
              <input
                id="programs"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Express Entry, Golden Visa"
                value={form.programs}
                onChange={(event) => updateForm("programs", event.target.value)}
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-black" htmlFor="date">
                    Publish date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.date}
                    onChange={(event) => updateForm("date", event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black" htmlFor="updated">
                    Updated
                  </label>
                  <input
                    id="updated"
                    type="date"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.updated}
                    onChange={(event) => updateForm("updated", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Search preview</h2>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-base font-semibold text-blue-800">{form.seoTitle || form.title || "SEO title"}</p>
                <p className="mt-1 text-xs text-emerald-700">
                  www.xiphiasimmigration.com/{form.kind === "blog" ? "blog" : form.kind}/{form.slug || "new-post"}
                </p>
                <p className="mt-2 text-sm text-slate-600">{form.seoDescription || form.summary || "Meta description preview"}</p>
              </div>
              <label className="mt-4 block text-sm font-black" htmlFor="seo-title">
                Page title
              </label>
              <input
                id="seo-title"
                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                maxLength={60}
                value={form.seoTitle}
                onChange={(event) => updateForm("seoTitle", event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">{(form.seoTitle || form.title).length} of 60 characters used</p>

              <label className="mt-4 block text-sm font-black" htmlFor="seo-description">
                Meta description
              </label>
              <textarea
                id="seo-description"
                className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                maxLength={160}
                value={form.seoDescription}
                onChange={(event) => updateForm("seoDescription", event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">{(form.seoDescription || form.summary).length} of 160 characters used</p>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}
