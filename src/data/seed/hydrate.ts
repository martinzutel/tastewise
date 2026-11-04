import type { Recipe, RecipeIngredient } from "../../lib/types";
import { deriveDiets } from "../../lib/services/diet.ts";
import { INGREDIENTS_BY_ID } from "./ingredients.ts";
import { SEED_RECIPES, type SeedRecipe } from "./recipes.ts";

export function unsplashUrl(photoId: string, width = 1200): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export function hydrateRecipe(seed: SeedRecipe): Recipe {
  const ingredients: RecipeIngredient[] = seed.ingredients.map(([id, quantity, unit, note, optional]) => {
    const ing = INGREDIENTS_BY_ID[id];
    if (!ing) throw new Error(`Recipe "${seed.slug}" references unknown ingredient "${id}"`);
    return {
      ingredientId: id,
      name: ing.name,
      ...(ing.plural ? { plural: ing.plural } : {}),
      category: ing.category,
      quantity,
      unit,
      ...(note ? { note } : {}),
      optional: Boolean(optional),
      staple: Boolean(ing.staple),
    };
  });

  const required = ingredients.filter((i) => !i.optional && !i.staple);
  const diets = deriveDiets(
    ingredients.filter((i) => !i.optional).map((i) => INGREDIENTS_BY_ID[i.ingredientId].markers ?? []),
  );
  const rest = seed.rest ?? 0;

  return {
    id: seed.slug,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    imageUrl: unsplashUrl(seed.image),
    imageAlt: seed.imageAlt,
    prepTime: seed.prep,
    cookTime: seed.cook,
    restTime: rest,
    totalTime: seed.prep + seed.cook + rest,
    difficulty: seed.difficulty,
    cuisine: seed.cuisine,
    servings: seed.servings,
    rating: seed.rating,
    reviewCount: seed.reviews,
    popularity: seed.popularity,
    featured: Boolean(seed.featured),
    categories: seed.categories,
    diets,
    createdAt: seed.createdAt,
    ingredientIds: [...new Set(required.map((i) => i.ingredientId))],
    ingredientNames: Object.fromEntries(required.map((i) => [i.ingredientId, i.plural ?? i.name])),
    ingredients,
    steps: seed.steps,
    ...(seed.notes ? { notes: seed.notes } : {}),
    tips: seed.tips,
    substitutions: seed.substitutions.map(([ingredient, substitute]) => ({ ingredient, substitute })),
    tags: seed.tags,
    nutrition: {
      calories: seed.nutrition[0],
      protein: seed.nutrition[1],
      carbohydrates: seed.nutrition[2],
      fat: seed.nutrition[3],
      verified: false,
    },
  };
}

export const HYDRATED_RECIPES: Recipe[] = SEED_RECIPES.map(hydrateRecipe);
