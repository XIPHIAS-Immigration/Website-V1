// Deterministic, safe Markdown -> HTML for the report engine.
//
// Programme MDX *prose bodies* are plain Markdown (no JSX — verified across verticals), so
// we convert them with a small, well-scoped block parser rather than invoking the MDX
// compiler inside the synchronous PDF render path. All text is HTML-escaped; output uses
// the `.prose` classes in theme.ts. Supports: headings, bold/italic/code, links (rendered
// as plain text), unordered/ordered lists, blockquotes, pipe tables, horizontal rules and
// paragraphs. Anything exotic degrades to escaped text.

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Inline formatting on an already-escaped string.
function inline(text: string): string {
  let s = escapeHtml(text);
  // links [label](url) -> label (drop the URL; reports are print)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  // bold then italic then code
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

function isTableSep(line: string): boolean {
  return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}
function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Convert a Markdown string to safe HTML (caller wraps the result in `<div class="prose">`). */
export function mdToHtml(md: string): string {
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }

    // headings: ## -> h3, ### or deeper -> h4 (the page already owns the H2-level title)
    const h = /^(#{2,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      flushPara();
      const tag = h[1].length <= 2 ? "h3" : "h4";
      out.push(`<${tag}>${inline(h[2])}</${tag}>`);
      i++;
      continue;
    }

    // horizontal rule
    if (/^(\*\s*){3,}$/.test(trimmed) || /^(-\s*){3,}$/.test(trimmed) || /^(_\s*){3,}$/.test(trimmed)) {
      flushPara();
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // table: a row with | and a following separator row
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flushPara();
      const head = tableCells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(tableCells(lines[i].trim()));
        i++;
      }
      const thead = `<tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`;
      const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      out.push(`<ol>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }

    // unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i++;
      }
      out.push(`<ul>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }

    // paragraph text
    para.push(trimmed);
    i++;
  }
  flushPara();
  return out.join("\n");
}

export type ProseSection = { title: string; md: string };

/** Approx visible-text length of a Markdown string (for thin-content gating). */
export function proseLength(md: string): number {
  return (md ?? "")
    .replace(/[#>*_`|-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim().length;
}

/**
 * Split a programme prose body into sections by its `##` (H2) headings. Content before the
 * first H2 becomes an "Overview" section. Falls back to a single Overview if there are no H2s.
 */
export function splitProseSections(md: string): ProseSection[] {
  const body = (md ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) return [];
  const lines = body.split("\n");
  const sections: ProseSection[] = [];
  let title = "Overview";
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) sections.push({ title, md: text });
    buf = [];
  };
  for (const line of lines) {
    const m = /^##\s+(?!#)(.*)$/.exec(line.trim());
    if (m) {
      flush();
      title = m[1].trim() || "Overview";
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}
