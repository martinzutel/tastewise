import { DifficultyMark } from "@/components/recipe/recipe-meta";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { formatMinutes } from "@/lib/format";
import type { Recipe } from "@/lib/types";

/** Prep / cook / resting / total time, difficulty and cuisine, as a hairline grid. */
export function RecipeFacts({ recipe }: { recipe: Recipe }) {
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Prep", value: formatMinutes(recipe.prepTime) },
    ...(recipe.cookTime ? [{ label: "Cook", value: formatMinutes(recipe.cookTime) }] : []),
    ...(recipe.restTime ? [{ label: "Resting", value: formatMinutes(recipe.restTime) }] : []),
    { label: "Total", value: formatMinutes(recipe.totalTime) },
    {
      label: "Difficulty",
      value: (
        <span className="inline-flex items-center gap-2">
          <DifficultyMark difficulty={recipe.difficulty} />
          {DIFFICULTY_LABELS[recipe.difficulty]}
        </span>
      ),
    },
    { label: "Cuisine", value: recipe.cuisine },
  ];

  // Fill the grid exactly: 4 facts in 2 columns, otherwise 3 columns with the last fact widened.
  const cols = facts.length === 4 ? 2 : 3;
  const lastSpan = facts.length % cols === 0 ? 1 : cols - (facts.length % cols) + 1;

  return (
    <dl
      className="grid gap-px overflow-hidden rounded-lg border border-line bg-line"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {facts.map((f, i) => (
        <div
          key={f.label}
          className="bg-paper px-4 py-3"
          style={i === facts.length - 1 && lastSpan > 1 ? { gridColumn: `span ${lastSpan}` } : undefined}
        >
          <dt className="text-[0.75rem] text-ink-muted">{f.label}</dt>
          <dd className="mt-0.5 text-[0.95rem] font-medium text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
