/**
 * Domain types shared by the UI, services and data sources.
 * These are deliberately storage-agnostic: the seed source and the Supabase
 * source both map their rows into these shapes.
 */

export const DIFFICULTIES = ["easy", "medium", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIETS = ["vegetarian", "vegan", "gluten-free", "dairy-free"] as const;
export type Diet = (typeof DIETS)[number];

export const CATEGORY_SLUGS = ["breakfast", "lunch", "dinner", "dessert", "snack", "baking"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** The cuisines that get their own filter. Everything else falls under "other". */
export const CUISINE_FILTERS = ["italian", "mexican", "japanese", "mediterranean", "american", "other"] as const;
export type CuisineFilter = (typeof CUISINE_FILTERS)[number];

export const TIME_BUCKETS = ["under-15", "15-30", "30-60", "over-60"] as const;
export type TimeBucket = (typeof TIME_BUCKETS)[number];

export const SORT_OPTIONS = ["popular", "rating", "quickest", "newest", "for-you"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const INGREDIENT_CATEGORIES = [
  "vegetables",
  "fruits",
  "dairy",
  "meat-fish",
  "grains-flour",
  "spices",
  "pantry-staples",
  "other",
] as const;
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export const SHOPPING_CATEGORIES = ["produce", "dairy", "meat", "dry-goods", "other"] as const;
export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

/** Animal-derived or allergen markers used to derive diet labels. */
export type IngredientMarker = "meat" | "fish" | "dairy" | "egg" | "honey" | "gluten";

export interface Ingredient {
  id: string; // stable slug, e.g. "olive-oil"
  name: string;
  plural?: string;
  category: IngredientCategory;
  markers?: IngredientMarker[];
  /** Assumed to be in every kitchen (salt, water). Ignored by pantry matching. */
  staple?: boolean;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  plural?: string;
  category: IngredientCategory;
  quantity: number | null;
  unit: string | null;
  note?: string;
  optional: boolean;
  staple: boolean;
}

export interface Substitution {
  ingredient: string;
  substitute: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  /** Seed nutrition is estimated from standard ingredient values, never lab-verified. */
  verified: boolean;
}

/** Lightweight shape used by cards, rails, grids and client-side matching. */
export interface RecipeSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  prepTime: number;
  cookTime: number;
  /** Hands-off time: rising, chiling, marinating, resting. */
  restTime: number;
  totalTime: number;
  difficulty: Difficulty;
  cuisine: string;
  servings: number;
  rating: number;
  reviewCount: number;
  popularity: number;
  featured: boolean;
  categories: CategorySlug[];
  diets: Diet[];
  createdAt: string;
  /** Non-staple, non-optional ingredient ids. Used for pantry matching and preferences. */
  ingredientIds: string[];
  ingredientNames: Record<string, string>;
}

export interface Recipe extends RecipeSummary {
  ingredients: RecipeIngredient[];
  steps: string[];
  notes?: string;
  tips: string[];
  substitutions: Substitution[];
  tags: string[];
  nutrition: Nutrition;
}

export interface RecipeQuery {
  q?: string;
  time?: TimeBucket[];
  difficulty?: Difficulty[];
  diet?: Diet[];
  category?: CategorySlug[];
  cuisine?: CuisineFilter[];
  /** Ingredient ids the user wants excluded (from "disliked ingredients"). */
  exclude?: string[];
  sort?: SortOption;
}

/* ---------- user-owned data ---------- */

export interface FavoriteEntry {
  recipeId: string;
  savedAt: string;
}

export interface PantryItem {
  id: string;
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  quantity: number | null;
  unit: string | null;
}

export interface ShoppingItem {
  id: string;
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  completed: boolean;
  /** Recipe titles this line came from, for context in the list. */
  sources: string[];
  createdAt: string;
}

export interface Preferences {
  diets: Diet[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  cuisines: CuisineFilter[];
  maxTime: number | null;
  difficulty: Difficulty | null;
}

export interface Profile {
  name: string;
  avatarUrl: string | null;
}

export interface UserData {
  profile: Profile;
  favorites: FavoriteEntry[];
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  preferences: Preferences;
}

export const EMPTY_PREFERENCES: Preferences = {
  diets: [],
  favoriteIngredients: [],
  dislikedIngredients: [],
  cuisines: [],
  maxTime: null,
  difficulty: null,
};
