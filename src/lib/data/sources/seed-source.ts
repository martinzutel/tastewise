import { HYDRATED_RECIPES } from "@/data/seed/hydrate";
import { INGREDIENTS } from "@/data/seed/ingredients";
import { searchRecipesInMemory } from "@/lib/services/recipe-search";
import type { Ingredient, Recipe, RecipeQuery } from "@/lib/types";
import type { RecipeSource } from "./types";

export const seedSource: RecipeSource = {
  name: "seed",
  async listRecipes(): Promise<Recipe[]> {
    return HYDRATED_RECIPES;
  },
  async searchRecipes(query: RecipeQuery): Promise<Recipe[]> {
    return searchRecipesInMemory(HYDRATED_RECIPES, query);
  },
  async getRecipeBySlug(slug: string): Promise<Recipe | null> {
    return HYDRATED_RECIPES.find((r) => r.slug === slug) ?? null;
  },
  async listIngredients(): Promise<Ingredient[]> {
    return INGREDIENTS;
  },
};
