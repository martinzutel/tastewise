import { InfoIcon, LightbulbIcon, RefreshCwIcon } from "lucide-react";
import type { Recipe } from "@/lib/types";

/** "Before you start" note, tips and substitutions. Each part is optional. */
export function RecipeNotes({ recipe }: { recipe: Pick<Recipe, "notes" | "tips" | "substitutions"> }) {
  return (
    <>
      {recipe.notes && (
        <section className="mt-14 rounded-lg bg-paper-2 p-6 sm:p-8" aria-labelledby="notes-title">
          <h2 id="notes-title" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <InfoIcon className="size-4 text-sage-ink" aria-hidden />
            Before you start
          </h2>
          <p className="mt-3 leading-relaxed text-ink">{recipe.notes}</p>
        </section>
      )}

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        {recipe.tips.length > 0 && (
          <section aria-labelledby="tips-title">
            <h2 id="tips-title" className="font-display flex items-center gap-2 text-[1.8rem] leading-none text-ink">
              <LightbulbIcon className="size-5 text-clay" strokeWidth={1.6} aria-hidden />
              Tips
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {recipe.tips.map((tip) => (
                <li key={tip} className="py-3.5 text-[0.95rem] leading-relaxed text-ink">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}
        {recipe.substitutions.length > 0 && (
          <section aria-labelledby="subs-title">
            <h2 id="subs-title" className="font-display flex items-center gap-2 text-[1.8rem] leading-none text-ink">
              <RefreshCwIcon className="size-5 text-sage" strokeWidth={1.6} aria-hidden />
              Substitutions
            </h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {recipe.substitutions.map((s) => (
                <div key={s.ingredient} className="py-3.5">
                  <dt className="text-[0.82rem] font-semibold text-ink">Instead of {s.ingredient}</dt>
                  <dd className="mt-0.5 text-[0.95rem] leading-relaxed text-ink">{s.substitute}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </>
  );
}
