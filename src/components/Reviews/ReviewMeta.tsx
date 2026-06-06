import { CalendarDays, ThumbsUp } from "lucide-react";
import { formatReviewDate } from "@/lib/reviews/legacyReviews";

type Props = {
  createdAt: string;
  likes: number;
  compact?: boolean;
};

export default function ReviewMeta({ createdAt, likes, compact = false }: Props) {
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const textClass = compact
    ? "text-[11px] text-slate-500 dark:text-slate-400"
    : "text-xs text-slate-500 dark:text-slate-400";

  return (
    <div className={`mt-2 flex flex-wrap items-center gap-2.5 ${textClass}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className={iconSize} />
        {formatReviewDate(createdAt)}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
        <ThumbsUp className={iconSize} />
        {likes} likes
      </span>
    </div>
  );
}
