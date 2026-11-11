"use client";

import { useMemo, useState } from "react";
import { PlusIcon, WheatIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { INGREDIENT_CATEGORY_LABELS, shoppingCategoryFor } from "@/lib/constants";
import { filterMatches, matchPantry, type MatchFilter } from "@/lib/services/pantry-matching";
import { cn } from "@/lib/utils";
import { INGREDIENT_CATEGORIES, type Ingredient, type RecipeSummary } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";
import { IngredientPicker } from "@/components/common/ingredient-picker";
import { MatchList } from "./match-list";
import { PantryRow } from "./pantry-row";

const QUICK_ADD = [
  "eggs",
  "onion",
  "garlic",
  "olive-oil",
  "butter",
  "lemon",
  "canned-tomatoes",
  "flour",
  "milk",
  "jasmine-rice",
  "spaghetti",
  "parmesan",
];

const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "complete", label: "Ready to cook" },
  { value: "one-or-two", label: "1–2 missing" },
  { value: "most", label: "Mostly there" },
];

export function PantryClient({ recipes, ingredients }: { recipes: RecipeSummary[]; ingredients: Ingredient[] }) {
  const { data, status, addPantryItems, removePantryItem, updatePantryItem, addToShoppingList } = useUserData();
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [pantrySearch, setPantrySearch] = useState("");
  // Phones show one panel at a time. Once you have ingredients, open on the recipes you can cook.
  const [view, setView] = useState<"pantry" | "cook" | null>(null);
  const byId = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  const pantryIds = useMemo(() => new Set(data.pantry.map((p) => p.ingredientId)), [data.pantry]);
  const matches = useMemo(() => matchPantry(recipes, pantryIds), [recipes, pantryIds]);
  const visible = filterMatches(matches, filter);
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.value, filterMatches(matches, f.value).length])),
    [matches],
  );

  const grouped = useMemo(() => {
    const q = pantrySearch.trim().toLowerCase();
    const items = q ? data.pantry.filter((p) => p.name.toLowerCase().includes(q)) : data.pantry;
    return INGREDIENT_CATEGORIES.map((cat) => ({
      cat,
      items: items.filter((p) => p.category === cat).sort((a, b) => a.name.localeCompare(b.name)),
    })).filter((g) => g.items.length);
  }, [data.pantry, pantrySearch]);

  const quickAdd = QUICK_ADD.map((id) => byId.get(id)).filter((i): i is Ingredient => !!i && !pantryIds.has(i.id));

  const addMissing = (recipe: RecipeSummary, missing: { id: string; name: string }[]) => {
    addToShoppingList(
      missing.map((m) => ({
        ingredientId: m.id,
        name: m.name,
        quantity: null,
        unit: null,
        category: shoppingCategoryFor(byId.get(m.id)?.category ?? "other"),
        source: recipe.title,
      })),
      `Missing ingredients for ${recipe.title}`,
    );
  };

  const activeView = view ?? (data.pantry.length ? "cook" : "pantry");
  const showView = (v: "pantry" | "cook") => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  if (status === "loading") {
    return <div className="h-64 animate-pulse rounded-xl bg-paper-2" role="status" aria-label="Loading your pantry" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-16">
      {/* ------- phone panel switch ------- */}
      <div
        role="group"
        aria-label="Show"
        className="sticky top-[var(--header-h)] z-20 -mx-5 border-b border-line bg-paper/95 px-5 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:hidden"
      >
        <div className="grid grid-cols-2 rounded-md border border-line-strong bg-surface p-1">
          {(
            [
              ["pantry", "Your ingredients", data.pantry.length],
              ["cook", "What you can cook", matches.length],
            ] as const
          ).map(([v, label, count]) => (
            <button
              key={v}
              type="button"
              aria-pressed={activeView === v}
              onClick={() => showView(v)}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-sm text-[0.88rem] font-medium transition-colors",
                activeView === v ? "bg-ink text-paper" : "text-ink-muted",
              )}
            >
              {label}
              <span className={cn("text-xs tabular-nums", activeView === v ? "text-paper/70" : "text-ink-faint")}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ------- the pantry ------- */}
      <section aria-labelledby="pantry-title" className={cn(activeView !== "pantry" && "max-lg:hidden")}>
        <h2 id="pantry-title" className="sr-only">
          Your ingredients
        </h2>
        <IngredientPicker ingredients={ingredients} selectedIds={pantryIds} onSelect={(i) => addPantryItems([i])} />

        {quickAdd.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[0.8rem] text-ink-muted">Common ingredients</p>
            <div className="flex flex-wrap gap-1.5">
              {quickAdd.slice(0, 8).map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => addPantryItems([i])}
                  className="inline-flex h-10 items-center gap-1 rounded-md border border-line px-3 text-[0.85rem] text-ink transition-colors hover:border-line-strong hover:bg-paper-2 sm:h-8 sm:px-2.5 sm:text-[0.82rem]"
                >
                  <PlusIcon className="size-3.5 text-ink-muted" aria-hidden />
                  <span className="inline-block first-letter:uppercase">{i.plural ?? i.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {data.pantry.length === 0 ? (
          <EmptyState
            className="mt-8 py-12"
            icon={WheatIcon}
            title="Your pantry is empty"
            description="Add what you have in your fridge and cupboards. Recipes you can make will appear alongside."
          />
        ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <p className="text-sm font-semibold text-ink">
                {data.pantry.length} {data.pantry.length === 1 ? "ingredient" : "ingredients"}
              </p>
              {data.pantry.length > 6 && (
                <input
                  type="search"
                  value={pantrySearch}
                  onChange={(e) => setPantrySearch(e.target.value)}
                  placeholder="Find in pantry"
                  aria-label="Find an ingredient in your pantry"
                  className="h-10 w-36 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-sage sm:h-9 sm:w-40"
                />
              )}
            </div>
            {grouped.length === 0 && (
              <p className="py-6 text-sm text-ink-muted">Nothing in your pantry matches “{pantrySearch}”.</p>
            )}
            {grouped.map((g) => (
              <div key={g.cat} className="mt-6">
                <h3 className="mb-1 text-[0.78rem] font-semibold text-ink-muted">
                  {INGREDIENT_CATEGORY_LABELS[g.cat]}
                </h3>
                <ul className="divide-y divide-line">
                  {g.items.map((item) => (
                    <PantryRow
                      key={item.id}
                      item={item}
                      onRemove={() => removePantryItem(item.id)}
                      onChange={(patch) => updatePantryItem(item.id, patch)}
                    />
                  ))}
                </ul>
              </div>
            ))}
            {matches.length > 0 && (
              <Button className="mt-8 h-12 w-full lg:hidden" onClick={() => showView("cook")}>
                See {matches.length} {matches.length === 1 ? "recipe" : "recipes"} you can cook
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ------- matching recipes ------- */}
      <section aria-labelledby="matches-title" className={cn("min-w-0", activeView !== "cook" && "max-lg:hidden")}>
        <h2 id="matches-title" className="font-display text-title text-ink">
          What you can cook
        </h2>
        <p className="mt-1.5 text-[0.95rem] text-ink-muted">
          Matched against required ingredients. Salt, pepper, water and optional extras are assumed.
        </p>

        <div role="group" aria-label="Filter matches" className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm whitespace-nowrap transition-colors sm:h-9",
                filter === f.value
                  ? "border-sage bg-sage-wash font-medium text-sage-ink"
                  : "border-line-strong text-ink hover:bg-paper-2",
              )}
            >
              {f.label}
              <span className="text-xs tabular-nums opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>

        {data.pantry.length === 0 ? (
          <div className="mt-10">
            <p className="text-[0.95rem] text-ink-muted">
              Add a few ingredients and matching recipes will appear here, ranked by how much you already have.
            </p>
            <Button className="mt-5 lg:hidden" onClick={() => showView("pantry")}>
              Add ingredients
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-lg bg-paper-2 p-6 text-[0.95rem] text-ink-muted">
            {filter === "complete"
              ? "Nothing is fully covered yet. Check “1–2 missing” for recipes that are one quick shop away."
              : "No recipes in this group. Add more ingredients, or try another filter."}
          </div>
        ) : (
          <MatchList matches={visible} onAddMissing={addMissing} />
        )}
      </section>
    </div>
  );
}
