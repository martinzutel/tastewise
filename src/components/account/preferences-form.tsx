"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { IngredientPicker } from "@/components/common/ingredient-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUISINE_LABELS, DIET_LABELS, DIFFICULTY_LABELS, MAX_TIME_OPTIONS } from "@/lib/constants";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CUISINE_FILTERS, DIETS, DIFFICULTIES, EMPTY_PREFERENCES, type Ingredient } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";
import { preferencesSchema } from "@/lib/validation/schemas";

type Values = z.infer<typeof preferencesSchema>;

function ToggleChip({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm transition-colors",
        checked ? "border-sage bg-sage-wash font-medium text-sage-ink" : "border-line-strong text-ink hover:bg-paper-2",
      )}
    >
      {checked && <CheckIcon className="size-3.5" strokeWidth={2.5} aria-hidden />}
      {children}
    </button>
  );
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-t border-line py-8 md:grid-cols-[16rem_1fr] md:gap-10">
      <div>
        <legend className="text-[0.95rem] font-semibold text-ink">{title}</legend>
        <p className="mt-1 text-[0.85rem] text-ink-muted">{description}</p>
      </div>
      <div>{children}</div>
    </fieldset>
  );
}

export function PreferencesForm({ ingredients }: { ingredients: Ingredient[] }) {
  const { data, status, savePreferences } = useUserData();
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const nameOf = (id: string) => byId.get(id)?.plural ?? byId.get(id)?.name ?? id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<Values>({ resolver: zodResolver(preferencesSchema), defaultValues: EMPTY_PREFERENCES });

  useEffect(() => {
    if (status === "ready") reset(data.preferences);
  }, [status, data.preferences, reset]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (v) => {
        if (await savePreferences(v)) reset(v);
      })}
    >
      <Section
        title="Dietary needs"
        description="Recipes that don’t meet these are left out when you apply your preferences."
      >
        <Controller
          control={control}
          name="diets"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <ToggleChip
                  key={d}
                  checked={field.value.includes(d)}
                  onClick={() => field.onChange(toggleIn(field.value, d))}
                >
                  {DIET_LABELS[d]}
                </ToggleChip>
              ))}
            </div>
          )}
        />
      </Section>

      <Section title="Favorite cuisines" description="These are ranked higher in your suggestions.">
        <Controller
          control={control}
          name="cuisines"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {CUISINE_FILTERS.map((c) => (
                <ToggleChip
                  key={c}
                  checked={field.value.includes(c)}
                  onClick={() => field.onChange(toggleIn(field.value, c))}
                >
                  {CUISINE_LABELS[c]}
                </ToggleChip>
              ))}
            </div>
          )}
        />
      </Section>

      <Section title="Ingredients you love" description="Recipes that use them get a boost.">
        <Controller
          control={control}
          name="favoriteIngredients"
          render={({ field }) => (
            <IngredientList
              id="fav-ingredients"
              ingredients={ingredients}
              value={field.value}
              onChange={field.onChange}
              nameOf={nameOf}
              tone="sage"
              placeholder="Add a favorite, e.g. garlic"
            />
          )}
        />
        {errors.favoriteIngredients && (
          <p className="mt-2 text-sm text-destructive">{errors.favoriteIngredients.message}</p>
        )}
      </Section>

      <Section
        title="Ingredients to avoid"
        description="Recipes that need these are hidden when you apply your preferences."
      >
        <Controller
          control={control}
          name="dislikedIngredients"
          render={({ field }) => (
            <IngredientList
              id="disliked-ingredients"
              ingredients={ingredients}
              value={field.value}
              onChange={field.onChange}
              nameOf={nameOf}
              tone="clay"
              placeholder="Add one to avoid, e.g. mushrooms"
            />
          )}
        />
        {errors.dislikedIngredients && (
          <p className="mt-2 text-sm text-destructive">{errors.dislikedIngredients.message}</p>
        )}
      </Section>

      <Section title="Cooking time and effort" description="Longer or harder recipes are ranked lower, not hidden.">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm text-ink-muted" id="max-time-label">
              Usually ready within
            </label>
            <Controller
              control={control}
              name="maxTime"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : "any"}
                  onValueChange={(v) => field.onChange(v === "any" ? null : Number(v))}
                >
                  <SelectTrigger className="h-11! w-52 border-line-strong bg-surface" aria-labelledby="max-time-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">No preference</SelectItem>
                    {MAX_TIME_OPTIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {formatMinutes(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-ink-muted" id="difficulty-label">
              Comfortable up to
            </label>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <Select value={field.value ?? "any"} onValueChange={(v) => field.onChange(v === "any" ? null : v)}>
                  <SelectTrigger
                    className="h-11! w-52 border-line-strong bg-surface"
                    aria-labelledby="difficulty-label"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DIFFICULTY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </Section>

      <div className="sticky bottom-20 z-20 flex items-center justify-between gap-4 border-t border-line bg-paper/95 py-4 backdrop-blur lg:bottom-0">
        <p className="text-sm text-ink-muted">
          {isDirty ? "You have unsaved changes." : "Preferences are up to date."}
        </p>
        <div className="flex gap-2">
          {isDirty && (
            <Button type="button" variant="ghost" onClick={() => reset(data.preferences)}>
              Discard
            </Button>
          )}
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function IngredientList({
  id,
  ingredients,
  value,
  onChange,
  nameOf,
  tone,
  placeholder,
}: {
  id: string;
  ingredients: Ingredient[];
  value: string[];
  onChange: (v: string[]) => void;
  nameOf: (id: string) => string;
  tone: "sage" | "clay";
  placeholder: string;
}) {
  return (
    <div>
      <IngredientPicker
        id={id}
        ingredients={ingredients}
        selectedIds={new Set(value)}
        onSelect={(i) => !value.includes(i.id) && onChange([...value, i.id])}
        placeholder={placeholder}
        label={placeholder}
      />
      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((ingredientId) => (
            <li key={ingredientId}>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== ingredientId))}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md pr-2 pl-3 text-[0.85rem] font-medium transition-colors",
                  tone === "sage"
                    ? "bg-sage-wash text-sage-ink hover:bg-sage/20"
                    : "bg-clay-wash text-clay-ink hover:bg-clay/20",
                )}
                aria-label={`Remove ${nameOf(ingredientId)}`}
              >
                {nameOf(ingredientId)}
                <XIcon className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
