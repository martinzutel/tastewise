"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SearchIcon, SearchXIcon, SlidersHorizontalIcon, UserCheckIcon, XIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { RecipeGrid } from "@/components/recipe/recipe-grid";
import { RecipeGridSkeleton } from "@/components/recipe/skeletons";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SORT_LABELS } from "@/lib/constants";
import { countActiveFilters, serializeRecipeQuery } from "@/lib/search-params";
import { hasPreferences, rankForPreferences } from "@/lib/services/personalization";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type RecipeQuery, type RecipeSummary, type SortOption } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";
import { FILTER_GROUPS, FilterPanel } from "./filter-panel";

type ListKey = "time" | "difficulty" | "diet" | "category" | "cuisine";

export function ExploreClient({
  query,
  results,
  ingredientNames,
}: {
  query: RecipeQuery;
  results: RecipeSummary[];
  ingredientNames: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data, status } = useUserData();
  const prefs = data.preferences;
  const prefsSet = status === "ready" && hasPreferences(prefs);

  const navigate = (next: RecipeQuery) => {
    const qs = serializeRecipeQuery(next);
    startTransition(() => router.replace(qs ? `/recipes?${qs}` : "/recipes", { scroll: false }));
  };

  // Keep the box in sync when the URL changes from elsewhere (header search, back button).
  useEffect(() => setText(query.q ?? ""), [query.q]);

  // Debounced live search as you type.
  useEffect(() => {
    if (text.trim() === (query.q ?? "")) return;
    const t = setTimeout(() => navigate({ ...query, q: text.trim() || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [text]);

  const toggle = (key: ListKey, value: string) => {
    const current = (query[key] as string[] | undefined) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    navigate({ ...query, [key]: next.length ? next : undefined });
  };

  const reset = () => {
    setText("");
    navigate({ sort: query.sort });
  };

  /** Applies the hard constraints from saved preferences as ordinary, visible filters. */
  const applyPreferences = () => {
    const diet = [...new Set([...(query.diet ?? []), ...prefs.diets])];
    const exclude = [...new Set([...(query.exclude ?? []), ...prefs.dislikedIngredients])];
    navigate({
      ...query,
      diet: diet.length ? diet : undefined,
      exclude: exclude.length ? exclude : undefined,
      sort: "for-you",
    });
  };

  const activeCount = countActiveFilters(query);

  const chips = useMemo(() => {
    const out: { key: ListKey | "exclude"; value: string; label: string }[] = [];
    for (const g of FILTER_GROUPS) {
      for (const v of (query[g.key] as string[] | undefined) ?? [])
        out.push({ key: g.key, value: v, label: g.labels[v] });
    }
    for (const id of query.exclude ?? [])
      out.push({ key: "exclude", value: id, label: `No ${ingredientNames[id] ?? id}` });
    return out;
  }, [query, ingredientNames]);

  const removeChip = (key: ListKey | "exclude", value: string) => {
    if (key === "exclude") {
      const next = (query.exclude ?? []).filter((v) => v !== value);
      navigate({ ...query, exclude: next.length ? next : undefined });
    } else toggle(key, value);
  };

  const shown = useMemo(() => {
    if (query.sort !== "for-you" || !prefsSet) return results;
    return rankForPreferences(
      results,
      { ...prefs, diets: [], dislikedIngredients: [] },
      (id) => ingredientNames[id] ?? id,
    ).map((s) => s.recipe);
  }, [results, query.sort, prefs, prefsSet, ingredientNames]);

  const sortOptions = SORT_OPTIONS.filter((s) => s !== "for-you" || prefsSet);

  const filterPanel = <FilterPanel query={query} onToggle={toggle} />;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto pr-2 pb-8">
          {filterPanel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <label htmlFor="explore-search" className="sr-only">
              Search recipes
            </label>
            <input
              id="explore-search"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search by recipe, ingredient, cuisine or meal"
              className="h-12 w-full rounded-md border border-line-strong bg-surface pr-10 pl-11 text-[0.98rem] transition-[border-color,box-shadow] outline-none placeholder:text-ink-faint focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)]"
            />
            {text && (
              <button
                type="button"
                onClick={() => setText("")}
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-ink-muted hover:bg-paper-2 hover:text-ink"
                aria-label="Clear search"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 flex-1 lg:hidden">
                  <SlidersHorizontalIcon aria-hidden />
                  Filters
                  {activeCount > 0 && (
                    <span className="rounded-sm bg-sage-ink px-1.5 text-xs font-semibold text-white">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 bg-paper p-0">
                <SheetHeader className="border-b border-line px-5 py-4">
                  <SheetTitle className="font-display text-2xl font-medium">Filters</SheetTitle>
                  <SheetDescription>Results update as you choose.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4 py-6">{filterPanel}</div>
                <SheetFooter className="flex-row gap-3 border-t border-line px-5 py-4">
                  <Button variant="ghost" className="flex-1" onClick={reset} disabled={activeCount === 0}>
                    Clear all
                  </Button>
                  <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                    Show {results.length} {results.length === 1 ? "recipe" : "recipes"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Select
              value={query.sort ?? "popular"}
              onValueChange={(v) => navigate({ ...query, sort: v as SortOption })}
            >
              <SelectTrigger
                className="h-12! flex-1 border-line-strong bg-surface px-3.5 sm:w-48"
                aria-label="Sort recipes"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {sortOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SORT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex min-h-9 flex-wrap items-center gap-2">
          <p className="mr-2 text-sm text-ink-muted" aria-live="polite">
            {pending ? "Updating…" : `${results.length} ${results.length === 1 ? "recipe" : "recipes"}`}
            {query.q && !pending && <> for “{query.q}”</>}
          </p>
          {chips.map((c) => (
            <button
              key={`${c.key}-${c.value}`}
              type="button"
              onClick={() => removeChip(c.key, c.value)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-surface pr-2 pl-3 text-[0.82rem] text-ink transition-colors hover:border-ink/30"
              aria-label={`Remove filter: ${c.label}`}
            >
              {c.label}
              <XIcon className="size-3.5 text-ink-muted" aria-hidden />
            </button>
          ))}
          {(chips.length > 0 || query.q) && (
            <button
              type="button"
              onClick={reset}
              className="ml-1 text-[0.82rem] font-medium text-clay-ink underline-offset-4 hover:underline"
            >
              Reset all
            </button>
          )}
          {prefsSet && query.sort !== "for-you" && (
            <button
              type="button"
              onClick={applyPreferences}
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-sage-wash px-3 text-[0.82rem] font-medium text-sage-ink transition-colors hover:bg-sage/20"
            >
              <UserCheckIcon className="size-3.5" aria-hidden />
              Apply my preferences
            </button>
          )}
        </div>

        <div className={cn("mt-8 transition-opacity", pending && "opacity-50")} aria-busy={pending}>
          {pending && results.length === 0 ? (
            <RecipeGridSkeleton count={6} />
          ) : shown.length > 0 ? (
            <RecipeGrid recipes={shown} className="xl:grid-cols-3" priorityCount={3} />
          ) : (
            <EmptyState
              icon={SearchXIcon}
              title="No recipes match yet"
              description={
                query.q
                  ? `Nothing matches “${query.q}” with these filters. Try a broader word, or remove a filter or two.`
                  : "These filters don’t overlap. Remove one or two to widen the search."
              }
            >
              <Button onClick={reset}>Clear search and filters</Button>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
