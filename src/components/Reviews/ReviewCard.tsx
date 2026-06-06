import { getDisplayAuthorName, type LegacyReply, type LegacyTopLevelReview } from "@/lib/reviews/legacyReviews";
import ReplyList from "./ReplyList";
import ReviewMeta from "./ReviewMeta";

type Props = {
  review: LegacyTopLevelReview;
  replies: readonly LegacyReply[];
};

export default function ReviewCard({ review, replies }: Props) {
  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <header>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
          {getDisplayAuthorName(review)}
        </h3>
        <ReviewMeta createdAt={review.createdAt} likes={review.likes} />
      </header>

      {review.message ? (
        <div className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
          {review.message}
        </div>
      ) : null}

      <ReplyList replies={replies} />
    </article>
  );
}
