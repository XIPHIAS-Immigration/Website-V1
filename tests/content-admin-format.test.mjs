import assert from "node:assert/strict";
import test from "node:test";

import {
  editorTextToMdx,
  mdxToEditorText,
  stripCmsMarkers,
} from "../src/lib/content-admin/content-format.ts";

const allToolbarBlocks = `<!-- CMS: SECTION START -->
Overview

Intro with **bold**, *italic*, and <u>underlined</u> text.
<!-- CMS: SECTION END -->

<!-- CMS: SUBHEADING START -->
Eligibility details
<!-- CMS: SUBHEADING END -->

<!-- CMS: LIST START -->
- First point
- Second point
<!-- CMS: LIST END -->

<!-- CMS: LIST START -->
1. First step
2. Second step
<!-- CMS: LIST END -->

<!-- CMS: QUOTE START -->
> A client-friendly note.
<!-- CMS: QUOTE END -->

<!-- CMS: LINK START -->
[Contact XIPHIAS](/contact)
<!-- CMS: LINK END -->

<!-- CMS: CALLOUT START -->
<Callout tone="info" title="Advisor note">
Important advice.
</Callout>
<!-- CMS: CALLOUT END -->

<!-- CMS: BUTTON START -->
<ButtonLink href="/contact">Book a consultation</ButtonLink>
<!-- CMS: BUTTON END -->`;

test("converts every editor toolbar block without leaking CMS tags", () => {
  const result = editorTextToMdx(allToolbarBlocks);

  assert.doesNotMatch(result, /<!--\s*CMS:/i);
  assert.match(result, /^## Overview/m);
  assert.match(result, /^### Eligibility details/m);
  assert.match(result, /^- First point/m);
  assert.match(result, /^1\. First step/m);
  assert.match(result, /^> A client-friendly note\./m);
  assert.match(result, /\[Contact XIPHIAS\]\(\/contact\)/);
  assert.match(result, /<Callout tone="info" title="Advisor note">/);
  assert.match(result, /<ButtonLink href="\/contact">Book a consultation<\/ButtonLink>/);
  assert.match(result, /\*\*bold\*\*/);
  assert.match(result, /\*italic\*/);
  assert.match(result, /<u>underlined<\/u>/);
});

test("removes inline, escaped, and unmatched CMS markers safely", () => {
  const result = editorTextToMdx(
    `Before <!-- CMS: LINK START -->[Contact](/contact)<!-- CMS: LINK END --> after

&lt;!-- CMS: SECTION START --&gt;
Escaped title
&lt;!-- CMS: SECTION END --&gt;

<!-- CMS: SUBHEADING START -->
Unclosed subheading`,
  );

  assert.doesNotMatch(result, /CMS:/i);
  assert.match(result, /Before/);
  assert.match(result, /\[Contact\]\(\/contact\)/);
  assert.match(result, /after/);
  assert.match(result, /^## Escaped title/m);
  assert.match(result, /^### Unclosed subheading/m);
});

test("does not guess that untagged short text is a heading", () => {
  const result = editorTextToMdx("Canada immigration options\n\nThis remains a normal paragraph.");

  assert.equal(result, "Canada immigration options\n\nThis remains a normal paragraph.");
  assert.doesNotMatch(result, /^##/m);
});

test("preserves Markdown and MDX through save and reopen round trips", () => {
  const source = `## Main section

Paragraph with **bold**, *italic*, [a link](/contact), and ![alt](/images/example.png).

### Details

1. First step
2. Second step

> Quoted guidance.

\`\`\`html
<!-- CMS: SECTION START -->
<div>{value}</div>
<!-- CMS: SECTION END -->
\`\`\`

<Callout tone="warning" title="Check">
Keep this component content.
</Callout>`;

  const editor = mdxToEditorText(source);
  const saved = editorTextToMdx(editor);

  assert.match(editor, /CMS: SECTION START/);
  assert.match(editor, /CMS: SUBHEADING START/);
  assert.equal(saved, source);
});

test("stripCmsMarkers preserves content while removing only real editor tags", () => {
  const source = `Text before
<!-- CMS: LIST START -->
- One
- Two
<!-- CMS: LIST END -->

\`\`\`md
<!-- CMS: LIST START -->
\`\`\``;
  const result = stripCmsMarkers(source);

  assert.match(result, /Text before/);
  assert.match(result, /- One/);
  assert.match(result, /- Two/);
  assert.match(result, /```md\n<!-- CMS: LIST START -->\n```/);
  assert.equal((result.match(/CMS: LIST START/g) || []).length, 1);
});

test("conversion is idempotent for already-clean stored MDX", () => {
  const source = `## Overview

Normal paragraph.

- First
- Second`;

  assert.equal(editorTextToMdx(source), source);
  assert.equal(editorTextToMdx(editorTextToMdx(source)), source);
});
