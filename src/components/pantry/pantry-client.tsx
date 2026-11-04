"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon, ShoppingBasketIcon, WheatIcon, XIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { INGREDIENT_CATEGORY_LABELS, shoppingCategoryFor } from "@/lib/constants";
import { formatList } from "@/lib/format";
import { filterMatches, matchPantry, type MatchFilter } from "@/lib/services/pantry-matching";
import { cn } from "@/lib/utils";
import { INGREDIENT_CATEGORIES, type Ingredient, type PantryItem, type RecipeSummary } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";
import { IngredientPicker } from "./ingredient-picker";

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

  if (status === "loading") {
    return <div className="h-64 animate-pulse rounded-xl bg-paper-2" role="status" aria-label="Loading your pantry" />;
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-16">
      {/* ------- the pantry ------- */}
      <section aria-labelledby="pantry-title">
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
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2.5 text-[0.82rem] text-ink transition-colors hover:border-line-strong hover:bg-paper-2"
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
                  className="h-9 w-40 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-sage"
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
          </div>
        )}
      </section>

      {/* ------- matching recipes ------- */}
      <section aria-labelledby="matches-title" className="min-w-0">
        <h2 id="matches-title" className="font-display text-title text-ink">
          What you can cook
        </h2>
        <p className="mt-1.5 text-[0.95rem] text-ink-muted">
          Matched against required ingredients. Salt, pepper, water and optional extras are assumed.
        </p>

        <div role="group" aria-label="Filter matches" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "relative h-11 shrink-0 px-3 text-sm whitespace-nowrap transition-colors",
                filter === f.value ? "font-medium text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs text-ink-faint tabular-nums">{counts[f.value]}</span>
              {filter === f.value && <span className="absolute inset-x-3 -bottom-px h-[2px] bg-sage" aria-hidden />}
            </button>
          ))}
        </div>

        {data.pantry.length === 0 ? (
          <p className="mt-10 text-[0.95rem] text-ink-muted">
            Add a few ingredients and matching recipes will appear here, ranked by how little you’re missing.
          </p>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-lg bg-paper-2 p-6 text-[0.95rem] text-ink-muted">
            {filter === "complete"
              ? "Nothing is fully covered yet. Check “1–2 missing” for recipes that are one quick shop away."
              : "No recipes in this group. Add more ingredients, or try another filter."}
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {visible.map((m) => (
              <li
                key={m.recipe.id}
                className="group relative grid grid-cols-[88px_1fr] gap-5 py-6 sm:grid-cols-[120px_1fr]"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-paper-3">
                  <Image src={m.recipe.imageUrl} alt={m.recipe.imageAlt} fill sizes="120px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[1.5rem] leading-[1.1] text-ink">
                      <Link href={`/recipes/${m.recipe.slug}`} className="hover:text-sage-ink">
                        {m.recipe.title}
                      </Link>
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        m.missing.length === 0 ? "text-sage-ink" : "text-ink",
                      )}
                    >
                      {m.percent}%
                    </span>
                  </div>
                  <div
                    className="mt-2.5 h-1 overflow-hidden rounded-full bg-paper-2"
                    role="progressbar"
                    aria-valuenow={m.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${m.percent}% of ingredients available`}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500",
                        m.missing.length === 0 ? "bg-sage" : "bg-sage/70",
                      )}
                      style={{ width: `${m.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[0.85rem] text-ink-muted">
                    {m.percent}% of ingredients available ({m.available} of {m.total})
                  </p>
                  {m.missing.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="text-[0.88rem] text-ink">
                        <span className="text-clay-ink">Missing:</span> {formatList(m.missing.map((x) => x.name))}
                      </p>
                      <button
                        type="button"
                        onClick={() => addMissing(m.recipe, m.missing)}
                        className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-sage-ink underline-offset-4 hover:underline"
                      >
                        <ShoppingBasketIcon className="size-3.5" aria-hidden />
                        Add missing to list
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[0.88rem] font-medium text-sage-ink">You have everything you need</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PantryRow({
  item,
  onRemove,
  onChange,
}: {
  item: PantryItem;
  onRemove: () => void;
  onChange: (patch: Partial<Pick<PantryItem, "quantity" | "unit">>) => void;
}) {
  const [qty, setQty] = useState(item.quantity?.toString() ?? "");
  const [unit, setUnit] = useState(item.unit ?? "");

  const commit = () => {
    const n = qty.trim() === "" ? null : Number(qty);
    const quantity = n !== null && Number.isFinite(n) && n > 0 ? n : null;
    if (quantity === null && qty.trim() !== "") setQty("");
    const u = unit.trim() || null;
    if (quantity !== item.quantity || u !== item.unit) onChange({ quantity, unit: u });
  };

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="min-w-0 flex-1 truncate text-[0.95rem] text-ink first-letter:uppercase">{item.name}</span>
      <input
        inputMode="decimal"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        placeholder="Qty"
        aria-label={`Quantity of ${item.name}`}
        className="h-9 w-14 rounded-sm border border-transparent bg-transparent px-2 text-right text-sm tabular-nums transition-colors outline-none placeholder:text-ink-faint hover:border-line focus:border-sage focus:bg-surface"
      />
      <input
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        placeholder="unit"
        aria-label={`Unit for ${item.name}`}
        className="h-9 w-14 rounded-sm border border-transparent bg-transparent px-2 text-sm transition-colors outline-none placeholder:text-ink-faint hover:border-line focus:border-sage focus:bg-surface"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="text-ink-faint hover:text-ink"
      >
        <XIcon className="size-4" />
      </Button>
    </li>
  );
}
