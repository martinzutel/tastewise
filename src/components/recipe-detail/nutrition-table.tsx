import type { Nutrition } from "@/lib/types";

/** Per-serving nutrition, labelled as estimated unless the data says it was verified. */
export function NutritionTable({ nutrition }: { nutrition: Nutrition }) {
  const rows = [
    { label: "Calories", value: nutrition.calories, unit: "kcal" },
    { label: "Protein", value: nutrition.protein, unit: "g" },
    { label: "Carbohydrates", value: nutrition.carbohydrates, unit: "g" },
    { label: "Fat", value: nutrition.fat, unit: "g" },
  ];

  return (
    <section
      id="nutrition"
      className="mt-14 scroll-mt-[calc(var(--header-h)+4.5rem)] border-t border-line pt-10"
      aria-labelledby="nutrition-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="nutrition-title" className="font-display text-[1.8rem] leading-none text-ink">
          Nutrition per serving
        </h2>
        <p className="text-[0.8rem] text-ink-muted">
          {nutrition.verified ? "Verified values" : "Estimated from standard ingredient values"}
        </p>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {rows.map((n) => (
          <div key={n.label} className="bg-paper px-5 py-4">
            <dt className="text-[0.78rem] text-ink-muted">{n.label}</dt>
            <dd className="font-display mt-1 text-[2rem] leading-none text-ink lining-nums tabular-nums">
              {n.value}
              <span className="ml-1 font-sans text-sm text-ink-muted">{n.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
