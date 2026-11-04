"use client";

import { CheckIcon } from "lucide-react";
import { CATEGORY_LABELS, CUISINE_LABELS, DIET_LABELS, DIFFICULTY_LABELS, TIME_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CATEGORY_SLUGS, CUISINE_FILTERS, DIETS, DIFFICULTIES, TIME_BUCKETS, type RecipeQuery } from "@/lib/types";

type ListKey = "time" | "difficulty" | "diet" | "category" | "cuisine";

export const FILTER_GROUPS: {
  key: ListKey;
  title: string;
  options: readonly string[];
  labels: Record<string, string>;
  hint?: string;
}[] = [
  { key: "time", title: "Total time", options: TIME_BUCKETS, labels: TIME_LABELS },
  {
    key: "diet",
    title: "Dietary",
    options: DIETS,
    labels: DIET_LABELS,
    hint: "Recipes must meet every diet you select.",
  },
  { key: "category", title: "Meal", options: CATEGORY_SLUGS, labels: CATEGORY_LABELS },
  { key: "difficulty", title: "Difficulty", options: DIFFICULTIES, labels: DIFFICULTY_LABELS },
  { key: "cuisine", title: "Cuisine", options: CUISINE_FILTERS, labels: CUISINE_LABELS },
];

export function FilterPanel({
  query,
  onToggle,
  facetCounts,
}: {
  query: RecipeQuery;
  onToggle: (key: ListKey, value: string) => void;
  facetCounts?: Partial<Record<ListKey, Record<string, number>>>;
}) {
  return (
    <div className="space-y-8">
      {FILTER_GROUPS.map((group) => {
        const selected = (query[group.key] as string[] | undefined) ?? [];
        return (
          <fieldset key={group.key}>
            <legend className="mb-3 text-[0.8rem] font-semibold text-ink">{group.title}</legend>
            {group.hint && <p className="-mt-2 mb-3 text-xs text-ink-muted">{group.hint}</p>}
            <div className="flex flex-col gap-0.5">
              {group.options.map((value) => {
                const checked = selected.includes(value);
                const count = facetCounts?.[group.key]?.[value];
                const id = `f-${group.key}-${value}`;
                return (
                  <label
                    key={value}
                    htmlFor={id}
                    className={cn(
                      "group flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-[0.92rem] transition-colors hover:bg-paper-2",
                      checked && "text-ink",
                    )}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      onChange={() => onToggle(group.key, value)}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-sage peer-focus-visible:ring-offset-1",
                        checked ? "border-sage bg-sage text-white" : "border-line-strong bg-surface",
                      )}
                    >
                      {checked && <CheckIcon className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{group.labels[value]}</span>
                    {count !== undefined && <span className="text-xs text-ink-faint tabular-nums">{count}</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
