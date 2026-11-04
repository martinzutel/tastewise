import type { RecipeSummary } from "../types";

/**
 * Deterministic pantry matching. Compares a recipe's required ingredients
 * (staples like salt and water, and optional garnishes, are excluded upstream
 * via `ingredientIds`) against the ingredient ids in the user's pantry.
 */

export interface PantryMatch {
  recipe: RecipeSummary;
  total: number;
  available: number;
  percent: number;
  missing: { id: string; name: string }[];
}

export type MatchFilter = "all" | "complete" | "one-or-two" | "most";

export function matchRecipe(recipe: RecipeSummary, pantryIds: Set<string>): PantryMatch {
  const total = recipe.ingredientIds.length;
  const missing = recipe.ingredientIds
    .filter((id) => !pantryIds.has(id))
    .map((id) => ({ id, name: recipe.ingredientNames[id] ?? id }));
  const available = total - missing.length;
  return {
    recipe,
    total,
    available,
    percent: total === 0 ? 100 : Math.round((available / total) * 100),
    missing,
  };
}

export function matchPantry(recipes: RecipeSummary[], pantryIds: Iterable<string>): PantryMatch[] {
  const ids = new Set(pantryIds);
  return (
    recipes
      .map((r) => matchRecipe(r, ids))
      .filter((m) => m.available > 0)
      // Share of the recipe you already have leads; fewer missing items breaks ties.
      .sort(
        (a, b) =>
          b.percent - a.percent || a.missing.length - b.missing.length || b.recipe.popularity - a.recipe.popularity,
      )
  );
}

export function filterMatches(matches: PantryMatch[], filter: MatchFilter): PantryMatch[] {
  switch (filter) {
    case "complete":
      return matches.filter((m) => m.missing.length === 0);
    case "one-or-two":
      return matches.filter((m) => m.missing.length >= 1 && m.missing.length <= 2);
    case "most":
      return matches.filter((m) => m.percent >= 50);
    default:
      return matches;
  }
}
