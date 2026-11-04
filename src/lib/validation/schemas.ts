import { z } from "zod";
import { CUISINE_FILTERS, DIETS, DIFFICULTIES, INGREDIENT_CATEGORIES, SHOPPING_CATEGORIES } from "@/lib/types";

/* ---------- forms ---------- */

const quantity = z
  .union([z.number(), z.nan(), z.null()])
  .transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : null))
  .refine((v) => v === null || (v > 0 && v < 100000), "Enter an amount above zero");

export const shoppingItemFormSchema = z.object({
  name: z.string().trim().min(1, "Add the item's name").max(80, "Keep the name under 80 characters"),
  quantity,
  unit: z.string().trim().max(16, "Keep the unit short, like g or cups").optional().default(""),
  category: z.enum(SHOPPING_CATEGORIES),
});
export type ShoppingItemFormInput = z.input<typeof shoppingItemFormSchema>;
export type ShoppingItemFormValues = z.output<typeof shoppingItemFormSchema>;

export const profileFormSchema = z.object({
  name: z.string().trim().max(60, "Keep your name under 60 characters"),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const preferencesSchema = z.object({
  diets: z.array(z.enum(DIETS)),
  favoriteIngredients: z.array(z.string()).max(30, "Choose up to 30 favorite ingredients"),
  dislikedIngredients: z.array(z.string()).max(30, "Choose up to 30 ingredients to avoid"),
  cuisines: z.array(z.enum(CUISINE_FILTERS)),
  maxTime: z.number().int().positive().nullable(),
  difficulty: z.enum(DIFFICULTIES).nullable(),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});
export type SignInValues = z.infer<typeof signInSchema>;

/* ---------- persisted guest data ---------- */

export const userDataSchema = z.object({
  profile: z.object({ name: z.string(), avatarUrl: z.string().nullable() }),
  favorites: z.array(z.object({ recipeId: z.string(), savedAt: z.string() })),
  pantry: z.array(
    z.object({
      id: z.string(),
      ingredientId: z.string(),
      name: z.string(),
      category: z.enum(INGREDIENT_CATEGORIES),
      quantity: z.number().nullable(),
      unit: z.string().nullable(),
    }),
  ),
  shopping: z.array(
    z.object({
      id: z.string(),
      ingredientId: z.string().nullable(),
      name: z.string(),
      quantity: z.number().nullable(),
      unit: z.string().nullable(),
      category: z.enum(SHOPPING_CATEGORIES),
      completed: z.boolean(),
      sources: z.array(z.string()),
      createdAt: z.string(),
    }),
  ),
  preferences: preferencesSchema,
});

/* ---------- URL search params for /recipes and /api/recipes ---------- */

export const recipeQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  time: z.array(z.enum(["under-15", "15-30", "30-60", "over-60"])).optional(),
  difficulty: z.array(z.enum(DIFFICULTIES)).optional(),
  diet: z.array(z.enum(DIETS)).optional(),
  category: z.array(z.enum(["breakfast", "lunch", "dinner", "dessert", "snack", "baking"])).optional(),
  cuisine: z.array(z.enum(CUISINE_FILTERS)).optional(),
  exclude: z.array(z.string().max(40)).max(30).optional(),
  sort: z.enum(["popular", "rating", "quickest", "newest", "for-you"]).optional(),
});
