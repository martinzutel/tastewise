import type { Diet, IngredientMarker } from "../types";

/**
 * Derives diet labels from the markers of a recipe's required ingredients.
 * Optional ingredients are ignored: a recipe with "parmesan, to serve
 * (optional)" is still vegan if everything else is.
 */
export function deriveDiets(markerSets: IngredientMarker[][]): Diet[] {
  const all = new Set(markerSets.flat());
  const diets: Diet[] = [];
  const vegetarian = !all.has("meat") && !all.has("fish");
  if (vegetarian) diets.push("vegetarian");
  if (vegetarian && !all.has("dairy") && !all.has("egg") && !all.has("honey")) diets.push("vegan");
  if (!all.has("gluten")) diets.push("gluten-free");
  if (!all.has("dairy")) diets.push("dairy-free");
  return diets;
}
