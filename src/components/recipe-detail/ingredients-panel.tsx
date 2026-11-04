"use client";

import { CheckIcon, PlusIcon, ShoppingBasketIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";
import { fromRecipeIngredient } from "@/lib/services/shopping-list";
import { cn } from "@/lib/utils";
import type { RecipeIngredient } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";

function ingredientLabel(ing: RecipeIngredient, quantity: number | null): string {
  if (!ing.plural) return ing.name;
  return !ing.unit && quantity !== null && quantity <= 1 ? ing.name : ing.plural;
}

export function IngredientsPanel({
  recipeTitle,
  ingredients,
  baseServings,
  servingOptions,
  servingNoun,
}: {
  recipeTitle: string;
  ingredients: RecipeIngredient[];
  baseServings: number;
  servingOptions: number[];
  servingNoun: "Serves" | "Makes";
}) {
  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const { addToShoppingList } = useUserData();
  const scale = servings / baseServings;

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const addAll = () => {
    const items = ingredients
      .filter((i) => !i.staple && !i.optional)
      .map((i) => fromRecipeIngredient(i, scale, recipeTitle));
    addToShoppingList(items, `${recipeTitle}, ${servingNoun === "Serves" ? `for ${servings}` : `makes ${servings}`}`);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[2.1rem] leading-none text-ink">Ingredients</h2>
        {checked.size > 0 && (
          <button
            type="button"
            onClick={() => setChecked(new Set())}
            className="text-[0.8rem] text-ink-muted hover:text-ink"
          >
            Uncheck all
          </button>
        )}
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2.5 text-[0.8rem] font-semibold text-ink">{servingNoun}</legend>
        <div
          role="radiogroup"
          aria-label={servingNoun}
          className="flex rounded-md border border-line-strong bg-surface p-1"
        >
          {servingOptions.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={servings === n}
              onClick={() => setServings(n)}
              className={cn(
                "h-9 flex-1 rounded-sm text-sm font-medium tabular-nums transition-colors",
                servings === n ? "bg-ink text-paper" : "text-ink-muted hover:bg-paper-2 hover:text-ink",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        {servings !== baseServings && (
          <p className="mt-2 text-xs text-ink-muted">
            Scaled from the original {baseServings}. Cooking times may need a little adjusting.
          </p>
        )}
      </fieldset>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {ingredients.map((ing, i) => {
          const qty = ing.quantity === null ? null : ing.quantity * scale;
          const amount = formatAmount(qty, ing.unit);
          const isChecked = checked.has(i);
          const id = `ing-${i}`;
          return (
            <li key={`${ing.ingredientId}-${i}`} className="group flex items-start gap-3 py-3">
              <input id={id} type="checkbox" className="peer sr-only" checked={isChecked} onChange={() => toggle(i)} />
              <label
                htmlFor={id}
                className="flex flex-1 cursor-pointer items-start gap-3 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sage"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors",
                    isChecked ? "border-sage bg-sage text-white" : "border-line-strong bg-surface",
                  )}
                >
                  {isChecked && <CheckIcon className="size-3" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "text-[0.95rem] leading-snug transition-colors",
                    isChecked && "text-ink-faint line-through decoration-ink-faint/60",
                  )}
                >
                  {amount && <span className="font-semibold tabular-nums">{amount} </span>}
                  {ingredientLabel(ing, qty)}
                  {ing.note && <span className="text-ink-muted">, {ing.note}</span>}
                  {ing.optional && <span className="ml-1.5 text-[0.75rem] text-clay-ink">optional</span>}
                </span>
              </label>
              {!ing.staple && (
                <button
                  type="button"
                  onClick={() => addToShoppingList([fromRecipeIngredient(ing, scale, recipeTitle)])}
                  className="grid size-8 shrink-0 place-items-center rounded-sm text-ink-faint transition-colors hover:bg-paper-2 hover:text-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                  aria-label={`Add ${ingredientLabel(ing, qty)} to shopping list`}
                >
                  <PlusIcon className="size-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <Button onClick={addAll} variant="outline" className="mt-6 h-11 w-full">
        <ShoppingBasketIcon aria-hidden />
        Add ingredients to shopping list
      </Button>
      <p className="mt-2 text-center text-xs text-ink-muted">Skips salt, pepper, water and optional extras.</p>
    </div>
  );
}
