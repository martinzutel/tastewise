"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SectionHeading } from "@/components/common/page-header";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { hasPreferences, rankForPreferences } from "@/lib/services/personalization";
import type { RecipeSummary } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";

/**
 * Shown only when the person has set preferences. Ranking is rule-based and
 * each card says which preferences it matched.
 */
export function ForYou({
  recipes,
  ingredientNames,
}: {
  recipes: RecipeSummary[];
  ingredientNames: Record<string, string>;
}) {
  const { data, status } = useUserData();
  const prefs = data.preferences;

  const ranked = useMemo(
    () => rankForPreferences(recipes, prefs, (id) => ingredientNames[id] ?? id).slice(0, 4),
    [recipes, prefs, ingredientNames],
  );

  if (status !== "ready" || !hasPreferences(prefs) || ranked.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1360px] px-5 pt-20 sm:px-8" aria-labelledby="for-you-title">
      <SectionHeading
        id="for-you-title"
        title="Matched to your preferences"
        description="Ranked by the diet, cuisines, ingredients and timing you chose."
        action={
          <Link href="/account" className="text-sm font-medium text-sage-ink underline-offset-4 hover:underline">
            Edit preferences
          </Link>
        }
      />
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {ranked.map(({ recipe, reasons }) => (
          <li key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              footer={
                reasons.length > 0 && (
                  <p className="text-[0.8rem] text-sage-ink">Because: {reasons.slice(0, 2).join(", ")}</p>
                )
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
