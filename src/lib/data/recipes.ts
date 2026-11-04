import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Ingredient, Recipe, RecipeQuery, RecipeSummary } from "@/lib/types";
import { seedSource } from "./sources/seed-source";
import { supabaseSource } from "./sources/supabase-source";
import type { RecipeSource } from "./sources/types";

/**
 * Server-side entry point for catalogue data. Pages call these functions and
 * never talk to a data source directly.
 */
const source: RecipeSource = isSupabaseConfigured ? supabaseSource : seedSource;

export const dataSourceName = source.name;

/** Strips the heavy fields before data crosses into client components. */
export function toSummary(r: Recipe): RecipeSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    imageUrl: r.imageUrl,
    imageAlt: r.imageAlt,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    restTime: r.restTime,
    totalTime: r.totalTime,
    difficulty: r.difficulty,
    cuisine: r.cuisine,
    servings: r.servings,
    rating: r.rating,
    reviewCount: r.reviewCount,
    popularity: r.popularity,
    featured: r.featured,
    categories: r.categories,
    diets: r.diets,
    createdAt: r.createdAt,
    ingredientIds: r.ingredientIds,
    ingredientNames: r.ingredientNames,
  };
}

export const listRecipes = cache(async (): Promise<Recipe[]> => source.listRecipes());

export const listRecipeSummaries = cache(async (): Promise<RecipeSummary[]> => (await listRecipes()).map(toSummary));

export async function searchRecipes(query: RecipeQuery): Promise<RecipeSummary[]> {
  return (await source.searchRecipes(query)).map(toSummary);
}

export const getRecipeBySlug = cache(async (slug: string): Promise<Recipe | null> => source.getRecipeBySlug(slug));

export const listIngredients = cache(async (): Promise<Ingredient[]> => source.listIngredients());
