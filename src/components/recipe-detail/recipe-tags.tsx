import Link from "next/link";
import { CATEGORY_LABELS, DIET_LABELS } from "@/lib/constants";
import type { Recipe } from "@/lib/types";

/** Diet, meal and free-form tags. Each one links to a matching search on Explore. */
export function RecipeTags({ recipe }: { recipe: Pick<Recipe, "diets" | "categories" | "tags"> }) {
  return (
    <section className="mt-10" aria-label="Tags">
      <ul className="flex flex-wrap gap-2">
        {recipe.diets.map((d) => (
          <li key={d}>
            <Link
              href={`/recipes?diet=${d}`}
              className="inline-flex h-8 items-center rounded-md bg-sage-wash px-3 text-[0.82rem] font-medium text-sage-ink hover:bg-sage/20"
            >
              {DIET_LABELS[d]}
            </Link>
          </li>
        ))}
        {recipe.categories.map((c) => (
          <li key={c}>
            <Link
              href={`/recipes?category=${c}`}
              className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[0.82rem] text-ink hover:bg-paper-2"
            >
              {CATEGORY_LABELS[c]}
            </Link>
          </li>
        ))}
        {recipe.tags.map((t) => {
          const label = t.replace(/-/g, " ");
          return (
            <li key={t}>
              <Link
                href={`/recipes?q=${encodeURIComponent(label)}`}
                className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[0.82rem] text-ink-muted hover:bg-paper-2 hover:text-ink"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
