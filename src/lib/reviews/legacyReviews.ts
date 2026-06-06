import rawLegacyReviews from "@/data/reviews/xiphias-reviews-disqus.json";

type RawLegacyReviewRow = {
  post_id?: unknown;
  parent_id?: unknown;
  depth?: unknown;
  created_at?: unknown;
  author_name?: unknown;
  author_username?: unknown;
  is_anonymous?: unknown;
  likes?: unknown;
  dislikes?: unknown;
  points?: unknown;
  is_flagged?: unknown;
  is_deleted?: unknown;
  raw_message?: unknown;
};

export type LegacyReviewPost = Readonly<{
  postId: string;
  parentId: string | null;
  depth: number;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  isAnonymous: boolean;
  likes: number;
  dislikes: number;
  points: number;
  isFlagged: boolean;
  isDeleted: boolean;
  message: string;
}>;

export type LegacyTopLevelReview = LegacyReviewPost & {
  depth: 0;
  parentId: null;
};

export type LegacyReply = LegacyReviewPost & {
  depth: number;
  parentId: string;
};

export type LegacyReviewStats = Readonly<{
  totalImportedPosts: number;
  totalTopLevelReviews: number;
  totalReplies: number;
  totalFlagged: number;
  oldestReviewDate: string | null;
  newestReviewDate: string | null;
}>;

const rawRows: RawLegacyReviewRow[] = Array.isArray(rawLegacyReviews)
  ? (rawLegacyReviews as RawLegacyReviewRow[])
  : [];

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function toOptionalString(value: unknown): string | null {
  const next = toTrimmedString(value);
  return next.length > 0 ? next : null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const normalized = toTrimmedString(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function toInteger(value: unknown): number {
  const parsed = Number(toTrimmedString(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMessage(value: unknown): string {
  return toTrimmedString(value).replace(/\r\n?/g, "\n");
}

function normalizeCreatedAt(value: unknown): string {
  const rawValue = toTrimmedString(value);
  if (!rawValue) return "";

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? rawValue : new Date(parsed).toISOString();
}

function getTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(a: T, b: T) {
  return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
}

function sortByCreatedAtAsc<T extends { createdAt: string }>(a: T, b: T) {
  return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
}

function normalizeRow(row: RawLegacyReviewRow): LegacyReviewPost {
  const parentId = toOptionalString(row.parent_id);

  return {
    postId: toTrimmedString(row.post_id),
    parentId,
    depth: Math.max(0, toInteger(row.depth)),
    createdAt: normalizeCreatedAt(row.created_at),
    authorName: toTrimmedString(row.author_name),
    authorUsername: toTrimmedString(row.author_username),
    isAnonymous: toBoolean(row.is_anonymous),
    likes: Math.max(0, toInteger(row.likes)),
    dislikes: Math.max(0, toInteger(row.dislikes)),
    points: toInteger(row.points),
    isFlagged: toBoolean(row.is_flagged),
    isDeleted: toBoolean(row.is_deleted),
    message: normalizeMessage(row.raw_message),
  };
}

function isTopLevelReview(post: LegacyReviewPost): post is LegacyTopLevelReview {
  return post.depth === 0 && post.parentId === null;
}

function isReply(post: LegacyReviewPost): post is LegacyReply {
  return post.depth > 0 && typeof post.parentId === "string" && post.parentId.length > 0;
}

const normalizedPosts = rawRows.map(normalizeRow);

export const allPublicPosts = normalizedPosts.filter((post) => !post.isDeleted);

const postById = new Map(allPublicPosts.map((post) => [post.postId, post] as const));

export const topLevelReviews = allPublicPosts.filter(isTopLevelReview).sort(sortByCreatedAtDesc);

const visibleReplies = allPublicPosts.filter(isReply).sort(sortByCreatedAtAsc);

export const repliesByParentId = visibleReplies.reduce<Record<string, LegacyReply[]>>((acc, reply) => {
  const key = reply.parentId;
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(reply);
  return acc;
}, {});

function findTopLevelParentId(reply: LegacyReply): string | null {
  let currentParentId: string | null = reply.parentId;
  const seen = new Set<string>();

  while (currentParentId) {
    if (seen.has(currentParentId)) break;
    seen.add(currentParentId);

    const parent = postById.get(currentParentId);
    if (!parent) return reply.parentId;
    if (isTopLevelReview(parent)) return parent.postId;

    currentParentId = parent.parentId;
  }

  return reply.parentId;
}

const repliesByTopLevelId = visibleReplies.reduce<Record<string, LegacyReply[]>>((acc, reply) => {
  const topLevelParentId = findTopLevelParentId(reply);
  if (!topLevelParentId) return acc;

  if (!acc[topLevelParentId]) {
    acc[topLevelParentId] = [];
  }

  acc[topLevelParentId].push(reply);
  return acc;
}, {});

export function getRepliesForTopLevelReview(postId: string): LegacyReply[] {
  return repliesByTopLevelId[postId] ?? [];
}

export const featuredReviews = [...topLevelReviews]
  .sort((a, b) => b.likes - a.likes || sortByCreatedAtDesc(a, b))
  .slice(0, 12);

const visibleFlaggedCount = allPublicPosts.filter((post) => post.isFlagged).length;
const visibleDates = allPublicPosts
  .map((post) => post.createdAt)
  .filter((value): value is string => value.length > 0)
  .sort();

export const reviewStats: LegacyReviewStats = {
  totalImportedPosts: normalizedPosts.length,
  totalTopLevelReviews: topLevelReviews.length,
  totalReplies: visibleReplies.length,
  totalFlagged: visibleFlaggedCount,
  oldestReviewDate: visibleDates[0] ?? null,
  newestReviewDate: visibleDates.at(-1) ?? null,
};

export function formatReviewDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", options).format(new Date(parsed));
}

export function getDisplayAuthorName(
  review: Pick<LegacyReviewPost, "authorName" | "authorUsername" | "isAnonymous">,
): string {
  if (review.isAnonymous) return "Anonymous reviewer";
  if (review.authorName) return review.authorName;
  if (review.authorUsername) return review.authorUsername;
  return "Legacy reviewer";
}

export function getReviewExcerpt(
  review: Pick<LegacyReviewPost, "message">,
  maxLength = 180,
): string {
  const plainText = review.message.replace(/\s+/g, " ").trim();
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}
