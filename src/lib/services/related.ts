import type { RecipeSummary } from "../types";

/**
 * Related recipes by overlap: shared ingredients, categories and cuisine.
 * Ingredient overlap uses Jaccard similarity so long recipes don't dominate.
 */
export function relatedRecipes<T extends RecipeSummary>(target: RecipeSummary, all: T[], limit = 4): T[] {
  const ingredients = new Set(target.ingredientIds);
  return all
    .filter((r) => r.id !== target.id)
    .map((r) => {
      const shared = r.ingredientIds.filter((id) => ingredients.has(id)).length;
      const union = new Set([...r.ingredientIds, ...target.ingredientIds]).size || 1;
      const sharedCategories = r.categories.filter((c) => target.categories.includes(c)).length;
      const score =
        (shared / union) * 10 + sharedCategories * 1.5 + (r.cuisine === target.cuisine ? 2.5 : 0) + r.popularity / 100;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ r }) => r);
}
