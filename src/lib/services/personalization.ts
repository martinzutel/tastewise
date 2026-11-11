import { cuisineToFilter } from "../constants";
import type { Preferences, RecipeSummary } from "../types";

/**
 * Deterministic, rule-based personalization. No learning, no model: each
 * preference adds or removes a fixed number of points, and the reasons are
 * kept so the UI can explain why a recipe was suggested.
 *
 * This module is the seam where a future recommendation service can plug in.
 */

export function hasPreferences(p: Preferences): boolean {
  return Boolean(
    p.diets.length ||
    p.favoriteIngredients.length ||
    p.dislikedIngredients.length ||
    p.cuisines.length ||
    p.maxTime ||
    p.difficulty,
  );
}

/** Hard constraints: dietary needs and disliked ingredients exclude a recipe. */
function satisfiesPreferences(r: RecipeSummary, p: Preferences): boolean {
  if (!p.diets.every((d) => r.diets.includes(d))) return false;
  if (p.dislikedIngredients.some((id) => r.ingredientIds.includes(id))) return false;
  return true;
}

export interface ScoredRecipe<T extends RecipeSummary = RecipeSummary> {
  recipe: T;
  score: number;
  reasons: string[];
}

const DIFFICULTY_RANK = { easy: 0, medium: 1, advanced: 2 } as const;

function scoreRecipe<T extends RecipeSummary>(
  r: T,
  p: Preferences,
  ingredientName: (id: string) => string,
): ScoredRecipe<T> {
  const reasons: string[] = [];
  let score = r.popularity / 20; // gentle popularity prior, 0–5

  if (p.cuisines.includes(cuisineToFilter(r.cuisine))) {
    score += 4;
    reasons.push(`${r.cuisine} cooking`);
  }
  const liked = p.favoriteIngredients.filter((id) => r.ingredientIds.includes(id));
  if (liked.length) {
    score += 3 * Math.min(liked.length, 2);
    reasons.push(`uses ${liked.slice(0, 2).map(ingredientName).join(" and ")}`);
  }
  if (p.maxTime) {
    if (r.totalTime <= p.maxTime) {
      score += 2;
      reasons.push(`ready in ${r.totalTime} min`);
    } else score -= 3;
  }
  if (p.difficulty) {
    const gap = DIFFICULTY_RANK[r.difficulty] - DIFFICULTY_RANK[p.difficulty];
    if (gap <= 0) score += 1.5;
    else score -= 2 * gap;
  }
  return { recipe: r, score, reasons };
}

export function rankForPreferences<T extends RecipeSummary>(
  recipes: T[],
  p: Preferences,
  ingredientName: (id: string) => string = (id) => id,
): ScoredRecipe<T>[] {
  return recipes
    .filter((r) => satisfiesPreferences(r, p))
    .map((r) => scoreRecipe(r, p, ingredientName))
    .sort((a, b) => b.score - a.score);
}
