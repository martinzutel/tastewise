import { RecipeCard } from "@/components/recipe/recipe-card";
import type { RecipeSummary } from "@/lib/types";

/** Horizontal scrolling collection. Native scroll + snap; works with touch, trackpad and keyboard. */
export function RecipeRail({ recipes, label }: { recipes: RecipeSummary[]; label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="rail -mx-5 scroll-px-5 auto-cols-[62%] gap-5 px-5 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-sage sm:-mx-8 sm:scroll-px-8 sm:auto-cols-[34%] sm:px-8 lg:auto-cols-[calc((100%-4*1.5rem)/5)] lg:gap-6"
    >
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          size="compact"
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 34vw, 62vw"
        />
      ))}
    </div>
  );
}
