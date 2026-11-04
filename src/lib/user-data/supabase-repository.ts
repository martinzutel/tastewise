import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CuisineFilter,
  Diet,
  Difficulty,
  IngredientCategory,
  PantryItem,
  ShoppingCategory,
  ShoppingItem,
  UserData,
} from "@/lib/types";
import type { UserDataRepository } from "./repository";

function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Couldn't ${what}: ${res.error.message}`);
  return res.data;
}

/**
 * Account storage. Every table is protected by row level security
 * (`auth.uid() = user_id`), so these queries can only ever touch the
 * signed-in user's own rows.
 */
export function createSupabaseRepository(supabase: SupabaseClient, userId: string): UserDataRepository {
  return {
    kind: "supabase",

    async load(): Promise<UserData> {
      const [profile, favorites, pantry, shopping, prefs, ingredientPrefs] = await Promise.all([
        supabase.from("profiles").select("name, avatar_url").eq("id", userId).maybeSingle(),
        supabase.from("user_favorites").select("recipe_id, created_at").order("created_at", { ascending: false }),
        supabase.from("pantry_items").select("id, quantity, unit, ingredients ( id, name, plural, category )"),
        supabase.from("shopping_list_items").select("*").order("created_at"),
        supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_ingredient_preferences").select("ingredient_id, preference"),
      ]);

      const p = check(prefs, "load preferences") as {
        diets: Diet[];
        preferred_cuisines: CuisineFilter[];
        preferred_max_time: number | null;
        preferred_difficulty: Difficulty | null;
      } | null;
      const ip = check(ingredientPrefs, "load ingredient preferences") as {
        ingredient_id: string;
        preference: "favorite" | "disliked";
      }[];
      const prof = check(profile, "load profile") as { name: string | null; avatar_url: string | null } | null;

      return {
        profile: { name: prof?.name ?? "", avatarUrl: prof?.avatar_url ?? null },
        favorites: (check(favorites, "load saved recipes") as { recipe_id: string; created_at: string }[]).map((f) => ({
          recipeId: f.recipe_id,
          savedAt: f.created_at,
        })),
        pantry: (
          check(pantry, "load pantry") as unknown as {
            id: string;
            quantity: number | null;
            unit: string | null;
            ingredients: { id: string; name: string; plural: string | null; category: IngredientCategory };
          }[]
        ).map((row) => ({
          id: row.id,
          ingredientId: row.ingredients.id,
          name: row.ingredients.plural ?? row.ingredients.name,
          category: row.ingredients.category,
          quantity: row.quantity === null ? null : Number(row.quantity),
          unit: row.unit,
        })),
        shopping: (
          check(shopping, "load shopping list") as {
            id: string;
            ingredient_id: string | null;
            name: string;
            quantity: number | null;
            unit: string | null;
            category: ShoppingCategory;
            is_completed: boolean;
            sources: string[] | null;
            created_at: string;
          }[]
        ).map((row) => ({
          id: row.id,
          ingredientId: row.ingredient_id,
          name: row.name,
          quantity: row.quantity === null ? null : Number(row.quantity),
          unit: row.unit,
          category: row.category,
          completed: row.is_completed,
          sources: row.sources ?? [],
          createdAt: row.created_at,
        })),
        preferences: {
          diets: p?.diets ?? [],
          cuisines: p?.preferred_cuisines ?? [],
          maxTime: p?.preferred_max_time ?? null,
          difficulty: p?.preferred_difficulty ?? null,
          favoriteIngredients: ip.filter((r) => r.preference === "favorite").map((r) => r.ingredient_id),
          dislikedIngredients: ip.filter((r) => r.preference === "disliked").map((r) => r.ingredient_id),
        },
      };
    },

    async setFavorite(recipeId, saved) {
      if (saved) {
        check(
          await supabase.from("user_favorites").upsert({ user_id: userId, recipe_id: recipeId }),
          "save the recipe",
        );
      } else {
        check(await supabase.from("user_favorites").delete().eq("recipe_id", recipeId), "remove the recipe");
      }
    },

    async upsertPantryItems(items: PantryItem[]) {
      check(
        await supabase.from("pantry_items").upsert(
          items.map((i) => ({
            id: i.id,
            user_id: userId,
            ingredient_id: i.ingredientId,
            quantity: i.quantity,
            unit: i.unit,
          })),
        ),
        "update your pantry",
      );
    },

    async deletePantryItems(ids) {
      check(await supabase.from("pantry_items").delete().in("id", ids), "remove pantry items");
    },

    async upsertShoppingItems(items: ShoppingItem[]) {
      check(
        await supabase.from("shopping_list_items").upsert(
          items.map((i) => ({
            id: i.id,
            user_id: userId,
            ingredient_id: i.ingredientId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            category: i.category,
            is_completed: i.completed,
            sources: i.sources,
            created_at: i.createdAt,
          })),
        ),
        "update your shopping list",
      );
    },

    async deleteShoppingItems(ids) {
      check(await supabase.from("shopping_list_items").delete().in("id", ids), "remove shopping list items");
    },

    async savePreferences(p) {
      check(
        await supabase.from("user_preferences").upsert({
          user_id: userId,
          diets: p.diets,
          preferred_cuisines: p.cuisines,
          preferred_max_time: p.maxTime,
          preferred_difficulty: p.difficulty,
        }),
        "save preferences",
      );
      // Ingredient likes and dislikes are relational rows; replace the set.
      check(
        await supabase.from("user_ingredient_preferences").delete().eq("user_id", userId),
        "save ingredient preferences",
      );
      const rows = [
        ...p.favoriteIngredients.map((id) => ({ user_id: userId, ingredient_id: id, preference: "favorite" })),
        ...p.dislikedIngredients.map((id) => ({ user_id: userId, ingredient_id: id, preference: "disliked" })),
      ];
      if (rows.length) {
        check(await supabase.from("user_ingredient_preferences").insert(rows), "save ingredient preferences");
      }
    },

    async saveProfile(profile) {
      check(
        await supabase.from("profiles").upsert({ id: userId, name: profile.name, avatar_url: profile.avatarUrl }),
        "save your profile",
      );
    },

    async uploadAvatar(file) {
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      check(
        await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type }),
        "upload your photo",
      );
      return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    },
  };
}
