import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { sortRecipes } from "@/lib/services/recipe-search";
import type {
  CategorySlug,
  Diet,
  Difficulty,
  Ingredient,
  IngredientCategory,
  IngredientMarker,
  Recipe,
  RecipeIngredient,
  RecipeQuery,
} from "@/lib/types";
import type { RecipeSource } from "./types";

/* Row shapes returned by the selects below. Kept local: only this file knows the schema. */
interface IngredientRow {
  id: string;
  name: string;
  plural: string | null;
  category: IngredientCategory;
  is_staple: boolean;
  contains_meat: boolean;
  contains_fish: boolean;
  contains_dairy: boolean;
  contains_egg: boolean;
  contains_honey: boolean;
  contains_gluten: boolean;
}
interface RecipeRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  prep_time: number;
  cook_time: number;
  rest_time: number;
  total_time: number;
  difficulty: Difficulty;
  cuisine: string;
  servings: number;
  rating: number;
  review_count: number;
  popularity: number;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  nutrition_verified: boolean;
  notes: string | null;
  tags: string[];
  created_at: string;
  recipe_categories: { categories: { slug: CategorySlug } | null }[];
  recipe_ingredients: {
    position: number;
    quantity: number | null;
    unit: string | null;
    note: string | null;
    is_optional: boolean;
    ingredients: IngredientRow | null;
  }[];
  recipe_steps: { step_number: number; instruction: string }[];
  recipe_tips: { position: number; tip: string }[];
  recipe_substitutions: { position: number; ingredient: string; substitute: string }[];
}

const RECIPE_SELECT = `
  id, slug, title, description, image_url, image_alt, prep_time, cook_time, rest_time, total_time,
  difficulty, cuisine, servings, rating, review_count, popularity, is_featured,
  is_vegetarian, is_vegan, is_gluten_free, is_dairy_free,
  calories, protein, carbohydrates, fat, nutrition_verified, notes, tags, created_at,
  recipe_categories ( categories ( slug ) ),
  recipe_ingredients ( position, quantity, unit, note, is_optional,
    ingredients ( id, name, plural, category, is_staple ) ),
  recipe_steps ( step_number, instruction ),
  recipe_tips ( position, tip ),
  recipe_substitutions ( position, ingredient, substitute )
`;

function mapRecipe(row: RecipeRow): Recipe {
  const ingredients: RecipeIngredient[] = [...row.recipe_ingredients]
    .sort((a, b) => a.position - b.position)
    .filter((ri) => ri.ingredients)
    .map((ri) => ({
      ingredientId: ri.ingredients!.id,
      name: ri.ingredients!.name,
      ...(ri.ingredients!.plural ? { plural: ri.ingredients!.plural } : {}),
      category: ri.ingredients!.category,
      quantity: ri.quantity === null ? null : Number(ri.quantity),
      unit: ri.unit,
      ...(ri.note ? { note: ri.note } : {}),
      optional: ri.is_optional,
      staple: ri.ingredients!.is_staple,
    }));
  const required = ingredients.filter((i) => !i.optional && !i.staple);
  const diets: Diet[] = [];
  if (row.is_vegetarian) diets.push("vegetarian");
  if (row.is_vegan) diets.push("vegan");
  if (row.is_gluten_free) diets.push("gluten-free");
  if (row.is_dairy_free) diets.push("dairy-free");

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    restTime: row.rest_time,
    totalTime: row.total_time,
    difficulty: row.difficulty,
    cuisine: row.cuisine,
    servings: row.servings,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    popularity: row.popularity,
    featured: row.is_featured,
    categories: row.recipe_categories.map((rc) => rc.categories?.slug).filter(Boolean) as CategorySlug[],
    diets,
    createdAt: row.created_at.slice(0, 10),
    ingredientIds: [...new Set(required.map((i) => i.ingredientId))],
    ingredientNames: Object.fromEntries(required.map((i) => [i.ingredientId, i.plural ?? i.name])),
    ingredients,
    steps: [...row.recipe_steps].sort((a, b) => a.step_number - b.step_number).map((s) => s.instruction),
    ...(row.notes ? { notes: row.notes } : {}),
    tips: [...row.recipe_tips].sort((a, b) => a.position - b.position).map((t) => t.tip),
    substitutions: [...row.recipe_substitutions]
      .sort((a, b) => a.position - b.position)
      .map(({ ingredient, substitute }) => ({ ingredient, substitute })),
    tags: row.tags ?? [],
    nutrition: {
      calories: row.calories,
      protein: Number(row.protein),
      carbohydrates: Number(row.carbohydrates),
      fat: Number(row.fat),
      verified: row.nutrition_verified,
    },
  };
}

function mapIngredient(row: IngredientRow): Ingredient {
  const markers: IngredientMarker[] = [];
  if (row.contains_meat) markers.push("meat");
  if (row.contains_fish) markers.push("fish");
  if (row.contains_dairy) markers.push("dairy");
  if (row.contains_egg) markers.push("egg");
  if (row.contains_honey) markers.push("honey");
  if (row.contains_gluten) markers.push("gluten");
  return {
    id: row.id,
    name: row.name,
    ...(row.plural ? { plural: row.plural } : {}),
    category: row.category,
    ...(markers.length ? { markers } : {}),
    ...(row.is_staple ? { staple: true } : {}),
  };
}

async function client(): Promise<SupabaseClient> {
  const supabase = await getServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export const supabaseSource: RecipeSource = {
  name: "supabase",

  async listRecipes() {
    const supabase = await client();
    const { data, error } = await supabase.from("recipes").select(RECIPE_SELECT);
    if (error) throw new Error(`Could not load recipes: ${error.message}`);
    return (data as unknown as RecipeRow[]).map(mapRecipe);
  },

  /**
   * Filtering and Postgres full-text ranking happen in the `search_recipes`
   * function (see supabase/migrations). It returns recipe rows, so PostgREST
   * can embed the related tables in the same request.
   */
  async searchRecipes(query: RecipeQuery) {
    const supabase = await client();
    const { data, error } = await supabase
      .rpc("search_recipes", {
        p_query: query.q?.trim() || null,
        p_time: query.time?.length ? query.time : null,
        p_difficulty: query.difficulty?.length ? query.difficulty : null,
        p_diets: query.diet?.length ? query.diet : null,
        p_categories: query.category?.length ? query.category : null,
        p_cuisines: query.cuisine?.length ? query.cuisine : null,
        p_exclude: query.exclude?.length ? query.exclude : null,
      })
      .select(RECIPE_SELECT);
    if (error) throw new Error(`Search failed: ${error.message}`);
    const recipes = (data as unknown as RecipeRow[]).map(mapRecipe);
    // The function already orders by relevance for text queries.
    if (query.q && (!query.sort || query.sort === "popular")) return recipes;
    return sortRecipes(recipes, query.sort);
  },

  async getRecipeBySlug(slug: string) {
    const supabase = await client();
    const { data, error } = await supabase.from("recipes").select(RECIPE_SELECT).eq("slug", slug).maybeSingle();
    if (error) throw new Error(`Could not load recipe: ${error.message}`);
    return data ? mapRecipe(data as unknown as RecipeRow) : null;
  },

  async listIngredients() {
    const supabase = await client();
    const { data, error } = await supabase.from("ingredients").select("*").order("name");
    if (error) throw new Error(`Could not load ingredients: ${error.message}`);
    return (data as IngredientRow[]).map(mapIngredient);
  },
};
