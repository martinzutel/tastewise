"use client";

import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Numbered method. Tapping a step marks it done, so you can keep your place while cooking. */
export function MethodSteps({ steps }: { steps: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[2.1rem] leading-none text-ink">Method</h2>
        <p className="text-[0.8rem] text-ink-muted" aria-live="polite">
          {done.size === 0 ? "Tap a step when it’s done" : `${done.size} of ${steps.length} done`}
        </p>
      </div>
      <ol className="mt-8 space-y-2">
        {steps.map((step, i) => {
          const isDone = done.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isDone}
                className={cn(
                  "group grid w-full grid-cols-[3rem_1fr] gap-4 rounded-lg px-3 py-5 text-left transition-colors hover:bg-paper-2 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:px-4",
                )}
              >
                <span
                  className={cn(
                    "font-display text-[2.6rem] leading-[0.85] tabular-nums transition-colors sm:text-[3.2rem]",
                    isDone ? "text-sage" : "text-clay",
                  )}
                >
                  {isDone ? <CheckIcon className="mt-1 size-8 sm:size-10" strokeWidth={1.5} aria-hidden /> : i + 1}
                  <span className="sr-only">{isDone ? `Step ${i + 1}, done` : `Step ${i + 1}`}</span>
                </span>
                <span
                  className={cn(
                    "pt-1 text-[1.05rem] leading-[1.75] text-ink transition-colors sm:text-[1.08rem]",
                    isDone && "text-ink-faint",
                  )}
                >
                  {step}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
