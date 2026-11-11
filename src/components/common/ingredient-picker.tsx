"use client";

import { Command as CommandPrimitive } from "cmdk";
import { CheckIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { INGREDIENT_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/types";

/**
 * Search-as-you-type ingredient selector (cmdk handles keyboard navigation).
 * Shared by the pantry and the favorite/disliked ingredient preferences.
 */
export function IngredientPicker({
  ingredients,
  selectedIds,
  onSelect,
  placeholder = "Add an ingredient, e.g. eggs",
  label = "Search ingredients",
  id = "ingredient-picker",
}: {
  ingredients: Ingredient[];
  selectedIds: Set<string>;
  onSelect: (ingredient: Ingredient) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ingredients
      .filter((i) => !i.staple)
      .map((i) => {
        const name = i.name.toLowerCase();
        const pl = i.plural?.toLowerCase() ?? "";
        const rank = name.startsWith(q) || pl.startsWith(q) ? 0 : name.includes(q) || pl.includes(q) ? 1 : -1;
        return { i, rank };
      })
      .filter((x) => x.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.i.name.localeCompare(b.i.name))
      .slice(0, 8)
      .map((x) => x.i);
  }, [ingredients, query]);

  const choose = (ing: Ingredient) => {
    onSelect(ing);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <CommandPrimitive shouldFilter={false} loop className="relative" label={label}>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <CommandPrimitive.Input
          id={id}
          ref={inputRef}
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          aria-label={label}
          className="h-12 w-full rounded-md border border-line-strong bg-surface pr-4 pl-11 text-[0.98rem] transition-[border-color,box-shadow] outline-none placeholder:text-ink-faint focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)]"
        />
      </div>
      {open && query.trim() && (
        <CommandPrimitive.List className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface p-1.5 shadow-[0_12px_32px_-12px_rgb(37_39_32/0.25)]">
          <CommandPrimitive.Empty className="px-3 py-4 text-sm text-ink-muted">
            No ingredient called “{query.trim()}” yet. Try a simpler name, like “tomato”.
          </CommandPrimitive.Empty>
          {results.map((ing) => {
            const have = selectedIds.has(ing.id);
            return (
              <CommandPrimitive.Item
                key={ing.id}
                value={ing.id}
                onSelect={() => choose(ing)}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-[0.95rem] data-[selected=true]:bg-paper-2",
                )}
              >
                <span className="flex-1">
                  {ing.plural ?? ing.name}
                  <span className="ml-2 text-xs text-ink-faint">{INGREDIENT_CATEGORY_LABELS[ing.category]}</span>
                </span>
                {have ? (
                  <span className="inline-flex items-center gap-1 text-xs text-sage-ink">
                    <CheckIcon className="size-3.5" aria-hidden /> Added
                  </span>
                ) : (
                  <PlusIcon className="size-4 text-ink-muted" aria-hidden />
                )}
              </CommandPrimitive.Item>
            );
          })}
        </CommandPrimitive.List>
      )}
    </CommandPrimitive>
  );
}
