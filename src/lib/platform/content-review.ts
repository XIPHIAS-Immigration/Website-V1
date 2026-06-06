import "server-only";

import { getPlatformRepository } from "./repository";

export type ContentReviewInput = {
  title: string;
  sourceUrl: string;
  targetPath?: string;
  changeSummary: string;
  sourceExcerpt?: string;
};

export function createContentReviewDraft(input: ContentReviewInput) {
  const proposedChanges = [
    input.changeSummary,
    input.sourceExcerpt
      ? "Verify the source excerpt and convert it into staff-approved public wording."
      : "Attach official source evidence before approval.",
    "Confirm no public page changes are published until a reviewer approves the task.",
  ];

  return getPlatformRepository().createContentReviewTask({
    title: input.title,
    sourceUrl: input.sourceUrl,
    targetPath: input.targetPath,
    suggestedSummary: input.changeSummary,
    proposedChanges,
  });
}

