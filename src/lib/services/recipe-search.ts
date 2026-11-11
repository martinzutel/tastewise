import { CATEGORY_LABELS, TIME_RANGES, cuisineToFilter } from "../constants";
import type { Recipe, RecipeQuery, RecipeSummary, SortOption } from "../types";

/**
 * In-memory search used by the seed data source. The Supabase source runs the
 * equivalent query in Postgres (full-text search + column filters); both
 * honour the same `RecipeQuery` contract.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Weighted text index: title > ingredients/cuisine/category > description. */
function searchDocument(r: Recipe) {
  return {
    title: normalize(r.title),
    strong: normalize(
      [
        r.cuisine,
        ...r.categories.map((c) => CATEGORY_LABELS[c]),
        ...r.ingredients.map((i) => `${i.name} ${i.plural ?? ""}`),
        ...r.diets,
      ].join(" "),
    ),
    weak: normalize([r.description, ...r.tags].join(" ")),
  };
}

/** Returns a relevance score, or 0 when any query term is missing. */
function scoreText(r: Recipe, q: string): number {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  const doc = searchDocument(r);
  let score = 0;
  for (const raw of terms) {
    // Very light stemming so "tomatoes" finds "tomato" and vice versa.
    const t = raw.length > 4 ? raw.replace(/(es|s)$/, "") : raw;
    if (doc.title.includes(t)) score += 5;
    else if (doc.strong.includes(t)) score += 3;
    else if (doc.weak.includes(t)) score += 1;
    else return 0;
  }
  return score;
}

function matchesFilters(r: RecipeSummary, query: RecipeQuery): boolean {
  if (query.time?.length) {
    const ok = query.time.some((b) => {
      const [min, max] = TIME_RANGES[b];
      return r.totalTime >= min && r.totalTime <= max;
    });
    if (!ok) return false;
  }
  if (query.difficulty?.length && !query.difficulty.includes(r.difficulty)) return false;
  // Diets are restrictions, so every selected diet must apply.
  if (query.diet?.length && !query.diet.every((d) => r.diets.includes(d))) return false;
  if (query.category?.length && !query.category.some((c) => r.categories.includes(c))) return false;
  if (query.cuisine?.length && !query.cuisine.includes(cuisineToFilter(r.cuisine))) return false;
  if (query.exclude?.length && query.exclude.some((id) => r.ingredientIds.includes(id))) return false;
  return true;
}

export function sortRecipes<T extends RecipeSummary>(list: T[], sort: SortOption = "popular"): T[] {
  const copy = [...list];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "quickest":
      return copy.sort((a, b) => a.totalTime - b.totalTime || b.popularity - a.popularity);
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
    case "for-you": // personal ranking is applied client-side on top of popularity
    default:
      return copy.sort((a, b) => b.popularity - a.popularity);
  }
}

export function searchRecipesInMemory(recipes: Recipe[], query: RecipeQuery): Recipe[] {
  const q = query.q?.trim() ?? "";
  const scored = recipes
    .filter((r) => matchesFilters(r, query))
    .map((r) => ({ r, s: q ? scoreText(r, q) : 1 }))
    .filter(({ s }) => s > 0);

  // With a text query and the default sort, relevance leads and popularity breaks ties.
  if (q && (!query.sort || query.sort === "popular")) {
    return scored.sort((a, b) => b.s - a.s || b.r.popularity - a.r.popularity).map(({ r }) => r);
  }
  return sortRecipes(
    scored.map(({ r }) => r),
    query.sort,
  );
}
