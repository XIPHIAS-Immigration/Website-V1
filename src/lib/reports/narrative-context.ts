import "server-only";

// src/lib/reports/narrative-context.ts
// -----------------------------------------------------------------------------
// Model-written pages inside a deterministic report.
//
// The templates are 30-to-100KB each and every one of them ends the same way:
// join a list of `.page` strings and hand them to renderReportPdf. Rather than
// thread a narrative argument through eight builders — and through every helper
// between them — the sections are put in an async context before the builder
// runs and spliced in at render time. AsyncLocalStorage keeps that per-request,
// so two reports rendering at once can never take each other's pages.
//
// The rules are the same as everywhere else in XIA:
//   * The deterministic report stands on its own. If the model is off, over
//     budget, or writes a number nobody gave it, nothing is inserted and the
//     report is still complete.
//   * Nothing generated is presented as verified advice. The pages are labelled,
//     and they carry the same disclaimer the rest of the report does.
// -----------------------------------------------------------------------------

import { AsyncLocalStorage } from "node:async_hooks";

import { disclaimer, esc, page, runningFooter } from "./components";
import type { NarrativeSection } from "@/lib/xia/report-narrative";

export type NarrativeContext = {
  sections: NarrativeSection[];
  /** Printed in the running footer so a page can be traced to its order. */
  reference: string;
};

const storage = new AsyncLocalStorage<NarrativeContext>();

export function runWithNarrative<T>(context: NarrativeContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(context, fn);
}

export function currentNarrative(): NarrativeContext | undefined {
  return storage.getStore();
}

/** One printed page per section, in the report's own type scale. */
function narrativePagesHtml(context: NarrativeContext): string {
  if (!context.sections.length) return "";

  return context.sections
    .map((section, index) =>
      page({
        body:
          `<div class="eyebrow">Written analysis${
            context.sections.length > 1 ? ` · ${index + 1} of ${context.sections.length}` : ""
          }</div>` +
          `<h2 class="h-section" style="margin-top:8px;">${esc(section.heading)}</h2>` +
          `<div class="spacer-16"></div>` +
          section.paragraphs
            .map((paragraph) => `<p class="lead" style="margin:0 0 10px;">${esc(paragraph)}</p>`)
            .join("") +
          (index === context.sections.length - 1
            ? `<div class="spacer-24"></div>` +
              disclaimer(
                "This analysis was drafted from the requirement checks and figures set out elsewhere in this report. It introduces no new figures, makes no prediction of outcome, and has not been independently reviewed by an advisor. Confirm every point with a XIPHIAS advisor before filing or paying any government or third-party fee.",
              )
            : ""),
        footer: runningFooter(`Reference ${esc(context.reference)}`, "Written analysis"),
      }),
    )
    .join("");
}

/**
 * Splice the narrative in ahead of the report's closing page, so the analysis
 * reads before the summary rather than after the back cover. Templates that do
 * not end in a `.page` simply get it appended.
 */
export function injectNarrativePages(bodyHtml: string): string {
  const context = currentNarrative();
  if (!context?.sections.length) return bodyHtml;

  const pagesHtml = narrativePagesHtml(context);
  if (!pagesHtml) return bodyHtml;

  const marker = bodyHtml.lastIndexOf('<section class="page');
  if (marker < 0) return bodyHtml + pagesHtml;
  return bodyHtml.slice(0, marker) + pagesHtml + bodyHtml.slice(marker);
}
