export const CMS_BLOCK_TYPES = [
  "SECTION",
  "SUBHEADING",
  "LIST",
  "QUOTE",
  "CALLOUT",
  "LINK",
  "BUTTON",
] as const;

export type CmsBlockType = (typeof CMS_BLOCK_TYPES)[number];

type CmsMarkerEdge = "START" | "END";

type EditorSegment = {
  type: CmsBlockType | null;
  lines: string[];
};

const CMS_MARKER_PATTERN =
  /(?:<!--|&lt;!--)\s*CMS\s*:?\s*(SECTION|SUBHEADING|LIST|QUOTE|CALLOUT|LINK|BUTTON)\s+(START|END)\s*(?:-->|--&gt;)/gi;
const CANONICAL_MARKER_PATTERN =
  /^<!-- CMS: (SECTION|SUBHEADING|LIST|QUOTE|CALLOUT|LINK|BUTTON) (START|END) -->$/i;

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function fenceToken(line: string) {
  const match = /^\s*(`{3,}|~{3,})/.exec(line);
  return match?.[1] || null;
}

function isolateCmsMarkers(value: string) {
  const lines = normalizeLineEndings(value).split("\n");
  let activeFence: string | null = null;

  return lines
    .map((line) => {
      const fence = fenceToken(line);
      if (activeFence) {
        if (fence?.[0] === activeFence[0] && fence.length >= activeFence.length) {
          activeFence = null;
        }
        return line;
      }

      if (fence) {
        activeFence = fence;
        return line;
      }

      CMS_MARKER_PATTERN.lastIndex = 0;
      return line.replace(
        CMS_MARKER_PATTERN,
        (_match, type: CmsBlockType, edge: CmsMarkerEdge) =>
          `\n<!-- CMS: ${type.toUpperCase()} ${edge.toUpperCase()} -->\n`,
      );
    })
    .join("\n");
}

function trimBlankLines(lines: string[]) {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;
  return lines.slice(start, end);
}

function parseEditorSegments(value: string) {
  const segments: EditorSegment[] = [];
  let currentType: CmsBlockType | null = null;
  let currentLines: string[] = [];
  let activeFence: string | null = null;

  const flush = () => {
    const lines = trimBlankLines(currentLines);
    if (lines.length) segments.push({ type: currentType, lines });
    currentLines = [];
  };

  for (const line of isolateCmsMarkers(value).split("\n")) {
    const fence = fenceToken(line);
    if (activeFence) {
      currentLines.push(line);
      if (fence?.[0] === activeFence[0] && fence.length >= activeFence.length) {
        activeFence = null;
      }
      continue;
    }

    if (fence) {
      activeFence = fence;
      currentLines.push(line);
      continue;
    }

    const marker = CANONICAL_MARKER_PATTERN.exec(line.trim());
    if (!marker) {
      currentLines.push(line);
      continue;
    }

    const type = marker[1].toUpperCase() as CmsBlockType;
    const edge = marker[2].toUpperCase() as CmsMarkerEdge;
    if (edge === "START") {
      flush();
      currentType = type;
      continue;
    }

    flush();
    currentType = null;
  }

  flush();
  return segments;
}

function normalizeSegmentLines(lines: string[]) {
  return trimBlankLines(lines)
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function convertSegment(segment: EditorSegment) {
  const lines = [...segment.lines];
  if (segment.type === "SECTION" || segment.type === "SUBHEADING") {
    const titleIndex = lines.findIndex((line) => line.trim());
    if (titleIndex >= 0) {
      const level = segment.type === "SECTION" ? "##" : "###";
      const title = lines[titleIndex].trim().replace(/^#{1,6}\s+/, "");
      lines[titleIndex] = `${level} ${title}`;
    }
  }
  return normalizeSegmentLines(lines);
}

/**
 * Converts the CMS editor representation into stable MDX. CMS marker comments
 * are editor-only and never survive this boundary.
 */
export function editorTextToMdx(value: string) {
  return parseEditorSegments(value)
    .map(convertSegment)
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Removes CMS markers without changing their content. This is used as a final
 * defensive boundary for old drafts and malformed inline marker placement.
 */
export function stripCmsMarkers(value: string) {
  return parseEditorSegments(value)
    .map((segment) => normalizeSegmentLines(segment.lines))
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Creates the editor view from stored MDX without stripping Markdown features.
 * Headings receive visible CMS boundaries so editors can see their exact scope.
 */
export function mdxToEditorText(value: string) {
  const body = normalizeLineEndings(value).replace(/^---\n[\s\S]*?\n---\s*/, "");
  const cleanBody = stripCmsMarkers(body);
  const output: string[] = [];
  let activeFence: string | null = null;

  for (const line of cleanBody.split("\n")) {
    const fence = fenceToken(line);
    if (activeFence) {
      output.push(line);
      if (fence?.[0] === activeFence[0] && fence.length >= activeFence.length) {
        activeFence = null;
      }
      continue;
    }

    if (fence) {
      activeFence = fence;
      output.push(line);
      continue;
    }

    const subheading = /^###\s+(.+)$/.exec(line);
    if (subheading) {
      output.push(
        "<!-- CMS: SUBHEADING START -->",
        subheading[1],
        "<!-- CMS: SUBHEADING END -->",
      );
      continue;
    }

    const section = /^##\s+(.+)$/.exec(line);
    if (section) {
      output.push(
        "<!-- CMS: SECTION START -->",
        section[1],
        "<!-- CMS: SECTION END -->",
      );
      continue;
    }

    output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
