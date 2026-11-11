import Image from "next/image";
import Link from "next/link";
import { ShoppingBasketIcon } from "lucide-react";
import { formatList } from "@/lib/format";
import type { PantryMatch } from "@/lib/services/pantry-matching";
import { cn } from "@/lib/utils";
import type { RecipeSummary } from "@/lib/types";

/** Recipes ranked by how much of them the pantry covers, with what's missing and a one-tap "add to list". */
export function MatchList({
  matches,
  onAddMissing,
}: {
  matches: PantryMatch[];
  onAddMissing: (recipe: RecipeSummary, missing: PantryMatch["missing"]) => void;
}) {
  return (
    <ul className="mt-2 divide-y divide-line">
      {matches.map((m) => (
        <li
          key={m.recipe.id}
          className="group relative grid grid-cols-[76px_1fr] gap-4 py-5 sm:grid-cols-[120px_1fr] sm:gap-5 sm:py-6"
        >
          <div className="relative aspect-square overflow-hidden rounded-md bg-paper-3">
            <Image src={m.recipe.imageUrl} alt={m.recipe.imageAlt} fill sizes="120px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-[1.3rem] leading-[1.1] text-ink sm:text-[1.5rem]">
                <Link href={`/recipes/${m.recipe.slug}`} className="hover:text-sage-ink">
                  {m.recipe.title}
                </Link>
              </h3>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  m.missing.length === 0 ? "text-sage-ink" : "text-ink",
                )}
              >
                {m.percent}%
              </span>
            </div>
            <div
              className="mt-2.5 h-1 overflow-hidden rounded-full bg-paper-2"
              role="progressbar"
              aria-valuenow={m.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${m.percent}% of ingredients available`}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  m.missing.length === 0 ? "bg-sage" : "bg-sage/70",
                )}
                style={{ width: `${m.percent}%` }}
              />
            </div>
            <p className="mt-2 text-[0.85rem] text-ink-muted">
              {m.percent}% of ingredients available ({m.available} of {m.total})
            </p>
            {m.missing.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-[0.88rem] text-ink">
                  <span className="text-clay-ink">Missing:</span> {formatList(m.missing.map((x) => x.name))}
                </p>
                <button
                  type="button"
                  onClick={() => onAddMissing(m.recipe, m.missing)}
                  className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-sage-ink underline-offset-4 hover:underline"
                >
                  <ShoppingBasketIcon className="size-3.5" aria-hidden />
                  Add missing to list
                </button>
              </div>
            ) : (
              <p className="mt-1.5 text-[0.88rem] font-medium text-sage-ink">You have everything you need</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
