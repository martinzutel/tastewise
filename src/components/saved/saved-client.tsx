"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookmarkIcon, SearchIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { RecipeGridSkeleton } from "@/components/recipe/skeletons";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecipeSummary } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";

type SavedSort = "recent" | "az" | "quickest" | "rating";
const SORTS: Record<SavedSort, string> = {
  recent: "Recently saved",
  az: "A to Z",
  quickest: "Quickest",
  rating: "Highest rated",
};

const dateFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

export function SavedClient({ recipes }: { recipes: RecipeSummary[] }) {
  const { data, status } = useUserData();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SavedSort>("recent");

  const saved = useMemo(() => {
    const byId = new Map(recipes.map((r) => [r.id, r]));
    return data.favorites
      .map((f) => ({ recipe: byId.get(f.recipeId), savedAt: f.savedAt }))
      .filter((x): x is { recipe: RecipeSummary; savedAt: string } => Boolean(x.recipe));
  }, [data.favorites, recipes]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? saved.filter(
          ({ recipe: r }) =>
            r.title.toLowerCase().includes(term) ||
            r.cuisine.toLowerCase().includes(term) ||
            Object.values(r.ingredientNames).some((n) => n.toLowerCase().includes(term)),
        )
      : saved;
    const copy = [...list];
    switch (sort) {
      case "az":
        return copy.sort((a, b) => a.recipe.title.localeCompare(b.recipe.title));
      case "quickest":
        return copy.sort((a, b) => a.recipe.totalTime - b.recipe.totalTime);
      case "rating":
        return copy.sort((a, b) => b.recipe.rating - a.recipe.rating);
      default:
        return copy.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    }
  }, [saved, q, sort]);

  if (status === "loading") return <RecipeGridSkeleton count={4} />;

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={BookmarkIcon}
        title="Your cookbook is empty"
        description="Tap the bookmark on any recipe to keep it here. Saved recipes stay put between visits."
      >
        <Button asChild>
          <Link href="/recipes">Find recipes to save</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your saved recipes"
            aria-label="Search your saved recipes"
            className="h-11 w-full rounded-md border border-line-strong bg-surface pr-3 pl-11 text-[0.95rem] outline-none placeholder:text-ink-faint focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)]"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SavedSort)}>
          <SelectTrigger
            className="h-11! border-line-strong bg-surface sm:ml-auto sm:w-48"
            aria-label="Sort saved recipes"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(SORTS) as SavedSort[]).map((s) => (
              <SelectItem key={s} value={s}>
                {SORTS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-5 text-sm text-ink-muted" aria-live="polite">
        {q
          ? `${shown.length} of ${saved.length} saved recipes`
          : `${saved.length} saved ${saved.length === 1 ? "recipe" : "recipes"}`}
      </p>

      {shown.length === 0 ? (
        <p className="mt-10 rounded-lg bg-paper-2 p-6 text-[0.95rem] text-ink-muted">
          None of your saved recipes match “{q}”. Try an ingredient or cuisine instead.
        </p>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map(({ recipe, savedAt }) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                footer={<p className="text-[0.78rem] text-ink-faint">Saved {dateFmt.format(new Date(savedAt))}</p>}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
