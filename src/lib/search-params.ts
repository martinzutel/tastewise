import { recipeQuerySchema } from "@/lib/validation/schemas";
import type { RecipeQuery } from "@/lib/types";

type ParamSource = Record<string, string | string[] | undefined> | URLSearchParams;

const LIST_KEYS = ["time", "difficulty", "diet", "category", "cuisine", "exclude"] as const;

function getAll(src: ParamSource, key: string): string[] {
  if (src instanceof URLSearchParams) return src.getAll(key).flatMap((v) => v.split(","));
  const v = src[key];
  if (v === undefined) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((x) => x.split(","));
}

function getOne(src: ParamSource, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined;
  const v = src[key];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Parses /recipes URL params into a validated RecipeQuery.
 * Unknown values are dropped rather than failing the whole page.
 */
export function parseRecipeQuery(src: ParamSource): RecipeQuery {
  const raw: Record<string, unknown> = {};
  const q = getOne(src, "q");
  if (q) raw.q = q;
  const sort = getOne(src, "sort");
  if (sort) raw.sort = sort;
  for (const key of LIST_KEYS) {
    const values = getAll(src, key).filter(Boolean);
    if (values.length) raw[key] = values;
  }
  const parsed = recipeQuerySchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // Keep whatever is valid, field by field.
  const shape = recipeQuerySchema.shape;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const field = shape[key as keyof typeof shape];
    if (Array.isArray(value)) {
      const ok = value.filter((v) => field.safeParse([v]).success);
      if (ok.length) safe[key] = ok;
    } else if (field.safeParse(value).success) safe[key] = value;
  }
  return safe as RecipeQuery;
}

export function serializeRecipeQuery(query: RecipeQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  for (const key of LIST_KEYS) {
    const values = query[key];
    if (values?.length) params.set(key, values.join(","));
  }
  if (query.sort && query.sort !== "popular") params.set("sort", query.sort);
  return params.toString();
}

export function countActiveFilters(query: RecipeQuery): number {
  return LIST_KEYS.reduce((n, key) => n + (query[key]?.length ?? 0), 0);
}
