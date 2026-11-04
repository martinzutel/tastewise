import type {
  CategorySlug,
  CuisineFilter,
  Diet,
  Difficulty,
  IngredientCategory,
  ShoppingCategory,
  SortOption,
  TimeBucket,
} from "./types";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  advanced: "Advanced",
};

export const DIET_LABELS: Record<Diet, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
};

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  dessert: "Dessert",
  snack: "Snacks",
  baking: "Baking",
};

export const CUISINE_LABELS: Record<CuisineFilter, string> = {
  italian: "Italian",
  mexican: "Mexican",
  japanese: "Japanese",
  mediterranean: "Mediterranean",
  american: "American",
  other: "Other",
};

/** Maps a recipe's free-text cuisine onto the filter buckets. */
export function cuisineToFilter(cuisine: string): CuisineFilter {
  const key = cuisine.trim().toLowerCase();
  if (key === "italian") return "italian";
  if (key === "mexican") return "mexican";
  if (key === "japanese") return "japanese";
  if (key === "american") return "american";
  if (["mediterranean", "greek", "middle eastern"].includes(key)) return "mediterranean";
  return "other";
}

export const TIME_LABELS: Record<TimeBucket, string> = {
  "under-15": "Under 15 min",
  "15-30": "15–30 min",
  "30-60": "30–60 min",
  "over-60": "Over an hour",
};

export const TIME_RANGES: Record<TimeBucket, [number, number]> = {
  "under-15": [0, 14],
  "15-30": [15, 30],
  "30-60": [31, 60],
  "over-60": [61, Number.POSITIVE_INFINITY],
};

export const SORT_LABELS: Record<SortOption, string> = {
  popular: "Most popular",
  rating: "Highest rated",
  quickest: "Quickest",
  newest: "Recently added",
  "for-you": "Your preferences",
};

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  vegetables: "Vegetables & herbs",
  fruits: "Fruits",
  dairy: "Dairy & eggs",
  "meat-fish": "Meat & fish",
  "grains-flour": "Grains & flour",
  spices: "Spices & seeds",
  "pantry-staples": "Pantry staples",
  other: "Other",
};

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  produce: "Produce",
  dairy: "Dairy & eggs",
  meat: "Meat & fish",
  "dry-goods": "Pantry & dry goods",
  other: "Other",
};

export function shoppingCategoryFor(category: IngredientCategory): ShoppingCategory {
  switch (category) {
    case "vegetables":
    case "fruits":
      return "produce";
    case "dairy":
      return "dairy";
    case "meat-fish":
      return "meat";
    case "grains-flour":
    case "spices":
    case "pantry-staples":
      return "dry-goods";
    default:
      return "other";
  }
}

export const SERVING_OPTIONS = [1, 2, 4, 6, 8] as const;

export const MAX_TIME_OPTIONS = [15, 30, 45, 60, 90] as const;
