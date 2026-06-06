import { getDisplayAuthorName, type LegacyReply } from "@/lib/reviews/legacyReviews";
import ReviewMeta from "./ReviewMeta";

type Props = {
  replies: readonly LegacyReply[];
};

export default function ReplyList({ replies }: Props) {
  if (!replies.length) return null;

  return (
    <details className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/40">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden dark:text-white">
        {replies.length} {replies.length === 1 ? "reply" : "replies"}
      </summary>
      <div className="mt-4 space-y-3">
        {replies.map((reply) => {
          const indent = Math.min(Math.max(reply.depth - 1, 0), 4) * 12;

          return (
            <article
              key={reply.postId}
              className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              style={{ marginLeft: `${indent}px` }}
            >
              <h4 className="text-sm font-semibold text-slate-950 dark:text-white">
                {getDisplayAuthorName(reply)}
              </h4>
              <ReviewMeta createdAt={reply.createdAt} likes={reply.likes} compact />
              {reply.message ? (
                <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {reply.message}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </details>
  );
}
