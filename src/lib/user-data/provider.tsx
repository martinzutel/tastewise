"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { mergeIntoList, type IncomingItem } from "@/lib/services/shopping-list";
import { plural } from "@/lib/format";
import type { Ingredient, PantryItem, Preferences, Profile, ShoppingItem, UserData } from "@/lib/types";
import { EMPTY_USER_DATA, createLocalRepository } from "./local-repository";
import type { UserDataRepository } from "./repository";

type Status = "loading" | "ready" | "error";

export interface SessionUser {
  id: string;
  email: string | null;
}

interface UserDataContextValue {
  status: Status;
  storage: "local" | "supabase";
  user: SessionUser | null;
  data: UserData;
  isFavorite(recipeId: string): boolean;
  toggleFavorite(recipe: { id: string; title: string }): void;
  addPantryItems(ingredients: Ingredient[]): void;
  updatePantryItem(id: string, patch: Partial<Pick<PantryItem, "quantity" | "unit">>): void;
  removePantryItem(id: string): void;
  addToShoppingList(items: IncomingItem[], label?: string): void;
  updateShoppingItem(id: string, patch: Partial<Omit<ShoppingItem, "id">>): void;
  removeShoppingItems(ids: string[]): void;
  savePreferences(p: Preferences): Promise<boolean>;
  saveProfile(p: Profile): Promise<boolean>;
  uploadAvatar(file: Blob): Promise<string | null>;
  retry(): void;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

const newId = () => crypto.randomUUID();

const notReady = () => Promise.reject(new Error("Your data is still loading. Try again in a moment."));
/** Stand-in while the account repository is being loaded; actions are disabled until then. */
const PENDING_REPO: UserDataRepository = {
  kind: "supabase",
  load: () => new Promise<never>(() => {}),
  setFavorite: notReady,
  upsertPantryItems: notReady,
  deletePantryItems: notReady,
  upsertShoppingItems: notReady,
  deleteShoppingItems: notReady,
  savePreferences: notReady,
  saveProfile: notReady,
  uploadAvatar: notReady,
};

export function UserDataProvider({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  // Guests use browser storage. The Supabase client is only downloaded for signed-in users.
  const [repoState, setRepo] = useState<UserDataRepository | null>(() => (user ? null : createLocalRepository()));
  useEffect(() => {
    if (!user) {
      setRepo((prev) => (prev?.kind === "local" ? prev : createLocalRepository()));
      return;
    }
    let cancelled = false;
    void Promise.all([import("@/lib/supabase/client"), import("./supabase-repository")]).then(
      ([{ getBrowserSupabase }, { createSupabaseRepository }]) => {
        if (cancelled) return;
        const supabase = getBrowserSupabase();
        setRepo(supabase ? createSupabaseRepository(supabase, user.id) : createLocalRepository());
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user]);
  const repo = repoState ?? PENDING_REPO;

  const [data, setData] = useState<UserData>(EMPTY_USER_DATA);
  const [status, setStatus] = useState<Status>("loading");
  // Latest state for callbacks that need to compute from it synchronously.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const load = useCallback(async () => {
    if (!repoState) return;
    setStatus("loading");
    try {
      const loaded = await repoState.load();
      dataRef.current = loaded;
      setData(loaded);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [repoState]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Optimistic update: apply locally, persist, and roll back by reloading on failure. */
  const commit = useCallback(
    (next: UserData, persist: () => Promise<void>) => {
      dataRef.current = next;
      setData(next);
      persist().catch((err: Error) => {
        console.error(err);
        toast.error("That change wasn't saved", { description: err.message });
        void load();
      });
    },
    [load],
  );

  const isFavorite = useCallback((id: string) => data.favorites.some((f) => f.recipeId === id), [data.favorites]);

  const toggleFavorite = useCallback(
    (recipe: { id: string; title: string }) => {
      const d = dataRef.current;
      const saved = !d.favorites.some((f) => f.recipeId === recipe.id);
      const favorites = saved
        ? [{ recipeId: recipe.id, savedAt: new Date().toISOString() }, ...d.favorites]
        : d.favorites.filter((f) => f.recipeId !== recipe.id);
      commit({ ...d, favorites }, () => repo.setFavorite(recipe.id, saved));
      toast(saved ? "Saved to your recipes" : "Removed from saved recipes", { description: recipe.title });
    },
    [commit, repo],
  );

  const addPantryItems = useCallback(
    (ingredients: Ingredient[]) => {
      const d = dataRef.current;
      const have = new Set(d.pantry.map((p) => p.ingredientId));
      const fresh: PantryItem[] = ingredients
        .filter((i) => !have.has(i.id))
        .map((i) => ({
          id: newId(),
          ingredientId: i.id,
          name: i.plural ?? i.name,
          category: i.category,
          quantity: null,
          unit: null,
        }));
      if (!fresh.length) {
        toast("Already in your pantry");
        return;
      }
      commit({ ...d, pantry: [...d.pantry, ...fresh] }, () => repo.upsertPantryItems(fresh));
      toast(fresh.length === 1 ? `Added ${fresh[0].name} to your pantry` : `Added ${fresh.length} ingredients`);
    },
    [commit, repo],
  );

  const updatePantryItem = useCallback(
    (id: string, patch: Partial<Pick<PantryItem, "quantity" | "unit">>) => {
      const d = dataRef.current;
      const item = d.pantry.find((p) => p.id === id);
      if (!item) return;
      const updated = { ...item, ...patch };
      commit({ ...d, pantry: d.pantry.map((p) => (p.id === id ? updated : p)) }, () =>
        repo.upsertPantryItems([updated]),
      );
    },
    [commit, repo],
  );

  const removePantryItem = useCallback(
    (id: string) => {
      const d = dataRef.current;
      const item = d.pantry.find((p) => p.id === id);
      commit({ ...d, pantry: d.pantry.filter((p) => p.id !== id) }, () => repo.deletePantryItems([id]));
      if (item) toast(`Removed ${item.name}`);
    },
    [commit, repo],
  );

  const addToShoppingList = useCallback(
    (items: IncomingItem[], label?: string) => {
      if (!items.length) return;
      const d = dataRef.current;
      const result = mergeIntoList(d.shopping, items, newId);
      const changed = result.items.filter((i) => result.changedIds.includes(i.id));
      commit({ ...d, shopping: result.items }, () => repo.upsertShoppingItems(changed));
      const parts = [
        result.added ? `${plural(result.added, "new item")}` : null,
        result.merged ? `${plural(result.merged, "item")} combined with what's already there` : null,
      ].filter(Boolean);
      toast(items.length === 1 ? `Added ${items[0].name} to your shopping list` : "Added to your shopping list", {
        description: [label, parts.join(", ")].filter(Boolean).join(". "),
      });
    },
    [commit, repo],
  );

  const updateShoppingItem = useCallback(
    (id: string, patch: Partial<Omit<ShoppingItem, "id">>) => {
      const d = dataRef.current;
      const item = d.shopping.find((s) => s.id === id);
      if (!item) return;
      const updated = { ...item, ...patch };
      commit({ ...d, shopping: d.shopping.map((s) => (s.id === id ? updated : s)) }, () =>
        repo.upsertShoppingItems([updated]),
      );
    },
    [commit, repo],
  );

  const removeShoppingItems = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      const d = dataRef.current;
      commit({ ...d, shopping: d.shopping.filter((s) => !ids.includes(s.id)) }, () => repo.deleteShoppingItems(ids));
    },
    [commit, repo],
  );

  const savePreferences = useCallback(
    async (preferences: Preferences) => {
      try {
        await repo.savePreferences(preferences);
        setData((d) => ({ ...d, preferences }));
        toast("Preferences saved");
        return true;
      } catch (err) {
        toast.error("Preferences weren't saved", { description: (err as Error).message });
        return false;
      }
    },
    [repo],
  );

  const saveProfile = useCallback(
    async (profile: Profile) => {
      try {
        await repo.saveProfile(profile);
        setData((d) => ({ ...d, profile }));
        toast("Profile saved");
        return true;
      } catch (err) {
        toast.error("Your profile wasn't saved", { description: (err as Error).message });
        return false;
      }
    },
    [repo],
  );

  const uploadAvatar = useCallback(
    async (file: Blob) => {
      try {
        return await repo.uploadAvatar(file);
      } catch (err) {
        toast.error("That photo couldn't be used", { description: (err as Error).message });
        return null;
      }
    },
    [repo],
  );

  const value = useMemo<UserDataContextValue>(
    () => ({
      status,
      storage: repo.kind,
      user,
      data,
      isFavorite,
      toggleFavorite,
      addPantryItems,
      updatePantryItem,
      removePantryItem,
      addToShoppingList,
      updateShoppingItem,
      removeShoppingItems,
      savePreferences,
      saveProfile,
      uploadAvatar,
      retry: load,
    }),
    [
      status,
      repo.kind,
      user,
      data,
      isFavorite,
      toggleFavorite,
      addPantryItems,
      updatePantryItem,
      removePantryItem,
      addToShoppingList,
      updateShoppingItem,
      removeShoppingItems,
      savePreferences,
      saveProfile,
      uploadAvatar,
      load,
    ],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used inside <UserDataProvider>");
  return ctx;
}
