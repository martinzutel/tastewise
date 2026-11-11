/**
 * Unit handling for scaling and shopping-list consolidation.
 * Units are grouped into dimensions; quantities only merge within a dimension.
 * Count-like units (clove, slice, can…) only merge with the exact same unit.
 */

type Dimension = "mass" | "volume";

const MASS: Record<string, number> = { g: 1, kg: 1000 };
const VOLUME: Record<string, number> = { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240 };

const ALIASES: Record<string, string> = {
  gram: "g",
  grams: "g",
  kilogram: "kg",
  kilograms: "kg",
  millilitre: "ml",
  milliliter: "ml",
  litre: "l",
  liter: "l",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  cups: "cup",
};

export function normalizeUnit(unit: string | null | undefined): string | null {
  if (!unit) return null;
  const u = unit.trim().toLowerCase();
  if (!u) return null;
  return ALIASES[u] ?? u;
}

export function dimensionOf(unit: string | null): Dimension | null {
  const u = normalizeUnit(unit);
  if (!u) return null;
  if (u in MASS) return "mass";
  if (u in VOLUME) return "volume";
  return null;
}

function toBase(quantity: number, unit: string): number {
  const u = normalizeUnit(unit)!;
  return quantity * (MASS[u] ?? VOLUME[u] ?? 1);
}

/** True when two quantities can be summed without lying about the result. */
export function unitsCompatible(a: string | null, b: string | null): boolean {
  const ua = normalizeUnit(a);
  const ub = normalizeUnit(b);
  if (ua === ub) return true;
  const da = dimensionOf(ua);
  return da !== null && da === dimensionOf(ub);
}

/**
 * Adds two quantities. When units differ but share a dimension the result is
 * expressed in the base unit (g or ml), then promoted (kg, l) when large.
 */
export function addQuantities(
  a: { quantity: number | null; unit: string | null },
  b: { quantity: number | null; unit: string | null },
): { quantity: number | null; unit: string | null } {
  const ua = normalizeUnit(a.unit);
  const ub = normalizeUnit(b.unit);
  if (a.quantity === null || b.quantity === null) {
    return { quantity: a.quantity ?? b.quantity, unit: ua ?? ub };
  }
  if (ua === ub) return { quantity: a.quantity + b.quantity, unit: ua };
  const dim = dimensionOf(ua);
  if (!dim || dim !== dimensionOf(ub)) throw new Error(`Cannot add ${ua} and ${ub}`);
  const total = toBase(a.quantity, ua!) + toBase(b.quantity, ub!);
  if (dim === "mass") return total >= 1000 ? { quantity: total / 1000, unit: "kg" } : { quantity: total, unit: "g" };
  return total >= 1000 ? { quantity: total / 1000, unit: "l" } : { quantity: total, unit: "ml" };
}
