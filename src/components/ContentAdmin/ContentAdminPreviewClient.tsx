"use client";

import React from "react";
import Link from "next/link";

import MediaHero from "@/components/Insights/MediaHero";
import { Prose } from "@/components/ui/Prose";
import { editorTextToMdx, parseMarkdownTable } from "@/lib/content-admin/content-format";

type PreviewDraft = {
  kind?: "blog" | "articles" | "news";
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  contentText?: string;
  author?: string;
  date?: string;
  updated?: string;
  hero?: string;
  heroAlt?: string;
  heroTitlePlacement?: "overlay" | "below" | "both";
  tags?: string[] | string;
  countries?: string[] | string;
  programs?: string[] | string;
};

type Heading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

function arrayValue(value: PreviewDraft["tags"]) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
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

function formatDateUTC(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function renderInline(value: string) {
  const parts: React.ReactNode[] = [];
  const inlinePattern =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|<u>([^<\n]+)<\/u>|\*([^*\n]+)\*|_([^_\n]+)_/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(value))) {
    if (match.index > lastIndex) parts.push(value.slice(lastIndex, match.index));
    if (match[1] && match[2]) {
      const href = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={href}
          target={href.startsWith("/") || href.startsWith("#") ? undefined : "_blank"}
          rel={href.startsWith("/") || href.startsWith("#") ? undefined : "noopener noreferrer"}
        >
          {match[1]}
        </a>,
      );
    } else if (match[3] || match[4]) {
      parts.push(<strong key={`strong-${match.index}`}>{match[3] || match[4]}</strong>);
    } else if (match[5]) {
      parts.push(<u key={`underline-${match.index}`}>{match[5]}</u>);
    } else {
      parts.push(<em key={`em-${match.index}`}>{match[6] || match[7]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) parts.push(value.slice(lastIndex));
  return parts.length ? parts : value;
}

function extractHeadings(blocks: string[]) {
  const seen = new Set<string>();
  return blocks.reduce<Heading[]>((headings, block) => {
    const match = /^(##|###)\s+(.+)$/.exec(block);
    if (!match) return headings;
    const text = match[2].trim();
    const base = slugify(text) || "section";
    let id = base;
    let index = 2;
    while (seen.has(id)) {
      id = `${base}-${index}`;
      index += 1;
    }
    seen.add(id);
    headings.push({ id, text, depth: match[1] === "###" ? 3 : 2 });
    return headings;
  }, []);
}

function renderBlock(block: string, index: number, headings: Heading[]) {
  const table = parseMarkdownTable(block);

  if (/^##\s+/.test(block) || /^###\s+/.test(block)) {
    const text = block.replace(/^#{2,3}\s+/, "");
    const heading = headings.find((item) => item.text === text);
    if (/^###\s+/.test(block)) {
      return (
        <h3 key={index} id={heading?.id}>
          {text}
        </h3>
      );
    }
    return (
      <h2 key={index} id={heading?.id}>
        {text}
      </h2>
    );
  }

  if (table) {
    return (
      <div key={index} className="my-6 w-full overflow-x-auto rounded-lg border border-black/10">
        <table className="m-0 min-w-full border-collapse text-left">
          <thead>
            <tr>
              {table.headers.map((header, cellIndex) => (
                <th key={`${header}-${cellIndex}`}>{renderInline(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (/^[-*]\s+/m.test(block)) {
    return (
      <ul key={index}>
        {block
          .split("\n")
          .filter((line) => /^[-*]\s+/.test(line.trim()))
          .map((line) => (
            <li key={line}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
          ))}
      </ul>
    );
  }

  if (/^\d+\.\s+/m.test(block)) {
    return (
      <ol key={index}>
        {block
          .split("\n")
          .filter((line) => /^\d+\.\s+/.test(line.trim()))
          .map((line) => (
            <li key={line}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
          ))}
      </ol>
    );
  }

  if (block.startsWith(">")) {
    return <blockquote key={index}>{renderInline(block.replace(/^>\s*/, ""))}</blockquote>;
  }

  if (block.includes("<ButtonLink")) {
    const button = /<ButtonLink\s+href=["']([^"']+)["']>([\s\S]*?)<\/ButtonLink>/.exec(block);
    const href = button?.[1] || "/contact";
    const label = button?.[2]?.trim() || "Button link";
    return (
      <p key={index}>
        <Link href={href} className="inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
          {label}
        </Link>
      </p>
    );
  }

  if (block.includes("<Callout")) {
    const title = /\btitle=["']([^"']+)["']/.exec(block)?.[1];
    const body = block
      .replace(/^<Callout[^>]*>\s*/i, "")
      .replace(/\s*<\/Callout>$/i, "")
      .trim();
    return (
      <blockquote key={index}>
        {title ? <strong>{title}: </strong> : null}
        {renderInline(body)}
      </blockquote>
    );
  }

  return <p key={index}>{renderInline(block)}</p>;
}

export default function ContentAdminPreviewClient() {
  const [draft, setDraft] = React.useState<PreviewDraft | null>(null);
  const [missing, setMissing] = React.useState(false);

  React.useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("draft");
    if (!key) {
      setMissing(true);
      return;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      setDraft(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <main className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">Draft preview unavailable</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Open preview from the CMS editor again.</h1>
          <p className="mt-3 text-slate-700">This preview uses temporary browser storage, so it needs to be opened from the editor tab.</p>
        </div>
      </main>
    );
  }

  if (!draft) {
    return <main className="container mx-auto px-4 py-20 text-sm font-bold text-slate-600">Loading draft preview...</main>;
  }

  const kind = draft.kind || "blog";
  const title = draft.title || "Untitled draft";
  const body = editorTextToMdx(draft.body || draft.contentText || "");
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const headings = extractHeadings(blocks);
  const tags = arrayValue(draft.tags);
  const countries = arrayValue(draft.countries);
  const programs = arrayValue(draft.programs);
  const displayDate = formatDateUTC(draft.updated || draft.date);
  const readingTime = `${Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 225))} min`;

  return (
    <>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-black text-amber-900">
        Draft preview only. This page is not published.
      </div>

      <section className="container mx-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <nav className="mb-4 text-sm font-semibold text-black/55">
          <Link href="/content-admin" className="hover:text-black">
            Content admin
          </Link>{" "}
          / Draft preview / {kind}
        </nav>

        <MediaHero
          title={title}
          subtitle={draft.summary || undefined}
          titlePlacement={draft.heroTitlePlacement || "overlay"}
          imageSrc={draft.hero || undefined}
          imageAlt={draft.heroAlt || undefined}
          actions={[
            { href: "/personal-booking", label: "Book a Paid Consultation", variant: "primary" },
            { href: "/contact", label: "Contact Us", variant: "ghost" },
          ]}
        />
      </section>

      <section className="container mx-auto px-4 pt-2 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-black/5 px-4 py-3 text-sm">
          <span>
            <span className="text-xs uppercase tracking-wide text-black/55">Written by</span>{" "}
            <strong>{draft.author || "XIPHIAS Immigration"}</strong>
          </span>
          <span>
            <span className="text-xs uppercase tracking-wide text-black/55">Last updated</span>{" "}
            <strong>{displayDate || "Draft"}</strong>
          </span>
          <span className="inline-flex rounded-md bg-black/[0.04] px-2 py-0.5 text-xs font-bold">{readingTime}</span>
        </div>
      </section>

      <article className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8 xl:col-span-9">
            <Prose id="article-content" className="prose-headings:scroll-mt-28 md:prose-lg max-w-[72ch]">
              {blocks.length ? blocks.map((block, index) => renderBlock(block, index, headings)) : <p>Start writing to preview the article body.</p>}
            </Prose>

            <div className="mt-10 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {countries.length ? <MetaBox title="Countries" items={countries} /> : null}
              {programs.length ? <MetaBox title="Programs" items={programs} /> : null}
              {tags.length ? <MetaBox title="Tags" items={tags.map((tag) => `#${tag}`)} /> : null}
            </div>
          </div>

          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <p className="text-sm font-black text-black">On this page</p>
                {headings.length ? (
                  <ol className="mt-3 space-y-2 text-sm">
                    {headings.map((heading) => (
                      <li key={heading.id} className={heading.depth === 3 ? "pl-4" : undefined}>
                        <a href={`#${heading.id}`} className="text-black/65 hover:text-black">
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-black/55">Headings will appear here.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

function MetaBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
      <div className="mb-2 text-sm font-semibold text-black">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-black/5 px-2.5 py-0.5 text-black">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
