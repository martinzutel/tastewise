import { cn } from "@/lib/utils";
import type { RecipeSummary } from "@/lib/types";
import { RecipeCard } from "./recipe-card";

export function RecipeGrid({
  recipes,
  className,
  priorityCount = 0,
}: {
  recipes: RecipeSummary[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <ul className={cn("grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {recipes.map((r, i) => (
        <li key={r.id}>
          <RecipeCard recipe={r} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
