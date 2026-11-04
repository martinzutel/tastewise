import { shoppingCategoryFor } from "../constants";
import type { RecipeIngredient, ShoppingCategory, ShoppingItem } from "../types";
import { addQuantities, normalizeUnit, unitsCompatible } from "../units";

export interface IncomingItem {
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  source?: string;
}

export function fromRecipeIngredient(ing: RecipeIngredient, scale: number, source: string): IncomingItem {
  return {
    ingredientId: ing.ingredientId,
    name: ing.plural ?? ing.name,
    quantity: ing.quantity === null ? null : ing.quantity * scale,
    unit: normalizeUnit(ing.unit),
    category: shoppingCategoryFor(ing.category),
    source,
  };
}

function sameThing(item: ShoppingItem, incoming: IncomingItem): boolean {
  if (item.completed) return false; // a ticked line is "bought"; start a fresh one
  if (incoming.ingredientId && item.ingredientId) return item.ingredientId === incoming.ingredientId;
  return item.name.trim().toLowerCase() === incoming.name.trim().toLowerCase();
}

export interface MergeResult {
  items: ShoppingItem[];
  /** Ids of items that were created or changed, so storage can persist only those. */
  changedIds: string[];
  added: number;
  merged: number;
}

/**
 * Adds items to a shopping list, consolidating duplicates.
 * - Same ingredient + compatible unit (200 g + 100 g, 1 tbsp + 2 tsp) merge into one line.
 * - Incompatible units (2 cloves vs 30 g) stay as separate lines rather than guessing.
 * - Items without a quantity ("salt, to taste") merge with any line of the same ingredient.
 */
export function mergeIntoList(
  list: ShoppingItem[],
  incoming: IncomingItem[],
  makeId: () => string,
  now = new Date().toISOString(),
): MergeResult {
  const items = list.map((i) => ({ ...i, sources: [...i.sources] }));
  const changed = new Set<string>();
  let added = 0;
  let merged = 0;

  for (const inc of incoming) {
    const target = items.find(
      (i) => sameThing(i, inc) && (i.quantity === null || inc.quantity === null || unitsCompatible(i.unit, inc.unit)),
    );
    if (target) {
      const sum = addQuantities(target, inc);
      target.quantity = sum.quantity;
      target.unit = sum.unit;
      if (inc.source && !target.sources.includes(inc.source)) target.sources.push(inc.source);
      changed.add(target.id);
      merged++;
    } else {
      const id = makeId();
      items.push({
        id,
        ingredientId: inc.ingredientId,
        name: inc.name,
        quantity: inc.quantity,
        unit: normalizeUnit(inc.unit),
        category: inc.category,
        completed: false,
        sources: inc.source ? [inc.source] : [],
        createdAt: now,
      });
      changed.add(id);
      added++;
    }
  }
  return { items, changedIds: [...changed], added, merged };
}
