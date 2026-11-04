import { dimensionOf, normalizeUnit } from "./units";

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

const FRACTIONS: [number, string][] = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [7 / 8, "⅞"],
  [1, ""],
];

/** Units where cooks expect fractions (½ cup) rather than decimals. */
const FRACTION_UNITS = new Set(["cup", "tsp", "tbsp"]);

function asFraction(value: number): string {
  const whole = Math.floor(value);
  const rest = value - whole;
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (!best[1]) return String(w);
  return w === 0 ? best[1] : `${w}${best[1]}`;
}

/**
 * Formats a quantity for display. Metric weights and volumes round to
 * sensible kitchen precision; spoons, cups and counts use fractions.
 */
export function formatQuantity(quantity: number | null, unit: string | null): string {
  if (quantity === null) return "";
  const u = normalizeUnit(unit);
  const dim = dimensionOf(u);
  if ((dim === "mass" || dim === "volume") && !FRACTION_UNITS.has(u ?? "")) {
    if (u === "kg" || u === "l") return trimNumber(Math.round(quantity * 100) / 100);
    if (quantity >= 100) return String(Math.round(quantity / 5) * 5);
    if (quantity >= 10) return String(Math.round(quantity));
    return trimNumber(Math.round(quantity * 2) / 2);
  }
  // Very large counts don't need fractions.
  if (quantity >= 10) return String(Math.round(quantity));
  return asFraction(quantity);
}

function trimNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

const PLURAL_UNITS: Record<string, string> = {
  cup: "cups",
  clove: "cloves",
  slice: "slices",
  can: "cans",
  bunch: "bunches",
  sprig: "sprigs",
  pinch: "pinches",
  handful: "handfuls",
  sheet: "sheets",
  stalk: "stalks",
  piece: "pieces",
  fillet: "fillets",
  jar: "jars",
};

export function formatUnit(unit: string | null, quantity: number | null): string {
  const u = normalizeUnit(unit);
  if (!u) return "";
  if (quantity !== null && quantity > 1 && PLURAL_UNITS[u]) return PLURAL_UNITS[u];
  return u;
}

/** "200 g", "1½ cups", "3 cloves", "2" */
export function formatAmount(quantity: number | null, unit: string | null): string {
  // Scaled-up metric amounts read better in the larger unit: 1600 g -> 1.6 kg.
  const base = normalizeUnit(unit);
  if (quantity !== null && quantity >= 1000 && (base === "g" || base === "ml")) {
    quantity = quantity / 1000;
    unit = base === "g" ? "kg" : "l";
  }
  const q = formatQuantity(quantity, unit);
  const u = formatUnit(unit, quantity);
  return [q, u].filter(Boolean).join(" ");
}

export function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
