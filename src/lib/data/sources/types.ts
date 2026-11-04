import type { Ingredient, Recipe, RecipeQuery } from "@/lib/types";

/**
 * Contract every recipe catalogue backend implements. Adding a new backend
 * (an external recipe API, a search service, a future AI retrieval layer)
 * means writing another `RecipeSource`; pages and components stay unchanged.
 */
export interface RecipeSource {
  name: string;
  listRecipes(): Promise<Recipe[]>;
  searchRecipes(query: RecipeQuery): Promise<Recipe[]>;
  getRecipeBySlug(slug: string): Promise<Recipe | null>;
  listIngredients(): Promise<Ingredient[]>;
}
