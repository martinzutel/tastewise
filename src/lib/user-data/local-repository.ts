import { userDataSchema } from "@/lib/validation/schemas";
import { EMPTY_PREFERENCES, type UserData } from "@/lib/types";
import type { UserDataRepository } from "./repository";

const STORAGE_KEY = "tastewise:user-data:v1";

export const EMPTY_USER_DATA: UserData = {
  profile: { name: "", avatarUrl: null },
  favorites: [],
  pantry: [],
  shopping: [],
  preferences: EMPTY_PREFERENCES,
};

function read(): UserData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_USER_DATA);
    // Validate so a corrupted or outdated payload can't crash the app.
    const parsed = userDataSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as UserData) : structuredClone(EMPTY_USER_DATA);
  } catch {
    return structuredClone(EMPTY_USER_DATA);
  }
}

function write(data: UserData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    throw new Error("Your browser blocked local storage, so changes can't be saved on this device.", {
      cause: err,
    });
  }
}

function upsert<T extends { id: string }>(list: T[], items: T[]): T[] {
  const byId = new Map(list.map((i) => [i.id, i]));
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}

/** Guest storage: everything lives in this browser's localStorage. */
export function createLocalRepository(): UserDataRepository {
  const mutate = async (fn: (d: UserData) => UserData) => write(fn(read()));

  return {
    kind: "local",
    async load() {
      return read();
    },
    setFavorite: (recipeId, saved) =>
      mutate((d) => ({
        ...d,
        favorites: saved
          ? [{ recipeId, savedAt: new Date().toISOString() }, ...d.favorites.filter((f) => f.recipeId !== recipeId)]
          : d.favorites.filter((f) => f.recipeId !== recipeId),
      })),
    upsertPantryItems: (items) => mutate((d) => ({ ...d, pantry: upsert(d.pantry, items) })),
    deletePantryItems: (ids) => mutate((d) => ({ ...d, pantry: d.pantry.filter((p) => !ids.includes(p.id)) })),
    upsertShoppingItems: (items) => mutate((d) => ({ ...d, shopping: upsert(d.shopping, items) })),
    deleteShoppingItems: (ids) => mutate((d) => ({ ...d, shopping: d.shopping.filter((s) => !ids.includes(s.id)) })),
    savePreferences: (preferences) => mutate((d) => ({ ...d, preferences })),
    saveProfile: (profile) => mutate((d) => ({ ...d, profile })),
    async uploadAvatar(file) {
      return resizeToDataUrl(file, 256);
    },
  };
}

/** Downscales an image so it fits comfortably in localStorage. */
async function resizeToDataUrl(file: Blob, size: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}
