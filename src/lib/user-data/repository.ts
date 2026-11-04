import type { PantryItem, Preferences, Profile, ShoppingItem, UserData } from "@/lib/types";

/**
 * Storage contract for everything a person owns: favorites, pantry,
 * shopping list, preferences and profile. The provider only talks to this
 * interface, so guest (browser) storage and account (Supabase) storage are
 * interchangeable.
 */
export interface UserDataRepository {
  kind: "local" | "supabase";
  load(): Promise<UserData>;
  setFavorite(recipeId: string, saved: boolean): Promise<void>;
  upsertPantryItems(items: PantryItem[]): Promise<void>;
  deletePantryItems(ids: string[]): Promise<void>;
  upsertShoppingItems(items: ShoppingItem[]): Promise<void>;
  deleteShoppingItems(ids: string[]): Promise<void>;
  savePreferences(preferences: Preferences): Promise<void>;
  saveProfile(profile: Profile): Promise<void>;
  /** Stores an avatar image and returns a URL to display it. */
  uploadAvatar(file: Blob): Promise<string>;
}
