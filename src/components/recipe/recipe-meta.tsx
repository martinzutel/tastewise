import { ClockIcon, StarIcon } from "lucide-react";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/types";

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <StarIcon className="size-3.5 fill-clay text-clay" aria-hidden />
      <span className="tabular-nums">{value.toFixed(1)}</span>
      <span className="sr-only"> out of 5 (sample rating)</span>
    </span>
  );
}

/** Three small facts that matter when choosing: time, effort, rating. */
export function RecipeMeta({
  totalTime,
  difficulty,
  rating,
  className,
}: {
  totalTime: number;
  difficulty: Difficulty;
  rating?: number;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-ink-muted", className)}>
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon className="size-3.5" aria-hidden />
        <span className="sr-only">Total time </span>
        {formatMinutes(totalTime)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <DifficultyMark difficulty={difficulty} />
        {DIFFICULTY_LABELS[difficulty]}
      </span>
      {rating !== undefined && <Rating value={rating} />}
    </p>
  );
}

/** Three short bars, filled by level. Reads at a glance without color coding. */
export function DifficultyMark({ difficulty }: { difficulty: Difficulty }) {
  const level = { easy: 1, medium: 2, advanced: 3 }[difficulty];
  return (
    <span className="inline-flex items-end gap-[2px]" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-[1px]", i <= level ? "bg-ink-muted" : "bg-line-strong")}
          style={{ height: 4 + i * 3 }}
        />
      ))}
    </span>
  );
}
