import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, InfoIcon, LightbulbIcon, RefreshCwIcon } from "lucide-react";
import { Container } from "@/components/common/page-header";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { DifficultyMark, Rating } from "@/components/recipe/recipe-meta";
import { IngredientsPanel } from "@/components/recipe-detail/ingredients-panel";
import { MethodSteps } from "@/components/recipe-detail/method-steps";
import { RecipeActions } from "@/components/recipe-detail/recipe-actions";
import { RecipeJumpNav } from "@/components/recipe-detail/jump-nav";
import { CATEGORY_LABELS, DIET_LABELS, DIFFICULTY_LABELS, SERVING_OPTIONS } from "@/lib/constants";
import { getRecipeBySlug, listRecipeSummaries } from "@/lib/data/recipes";
import { formatMinutes } from "@/lib/format";
import { relatedRecipes } from "@/lib/services/related";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await listRecipeSummaries()).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const recipe = await getRecipeBySlug((await params).slug);
  if (!recipe) return { title: "Recipe not found" };
  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: { title: recipe.title, description: recipe.description, images: [recipe.imageUrl] },
  };
}

function servingOptions(base: number): number[] {
  if (base <= 8) return [...new Set([...SERVING_OPTIONS, base])].sort((a, b) => a - b);
  return [Math.round(base / 2), base, base * 2];
}

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [recipe, all] = await Promise.all([getRecipeBySlug(slug), listRecipeSummaries()]);
  if (!recipe) notFound();

  const related = relatedRecipes(recipe, all, 4);
  const isBatch = recipe.servings > 8;
  const primaryCategory = recipe.categories[0];

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
  const factCols = facts.length === 4 ? 2 : 3;
  const lastSpan = facts.length % factCols === 0 ? 1 : factCols - (facts.length % factCols) + 1;

  return (
    // Phones: photo straight after the back link, then the title. Larger screens: title first, wide photo below.
    <article className="flex flex-col">
      <Container className="order-1">
        <nav aria-label="Breadcrumb" className="pt-4 sm:pt-8">
          <ol className="flex items-center gap-1 text-sm text-ink-muted">
            <li>
              <Link href="/recipes" className="inline-flex items-center gap-1 hover:text-ink">
                <ChevronLeftIcon className="size-4" aria-hidden />
                Explore recipes
              </Link>
            </li>
            {primaryCategory && (
              <li className="before:mx-2 before:text-line-strong before:content-['/']">
                <Link href={`/recipes?category=${primaryCategory}`} className="hover:text-ink">
                  {CATEGORY_LABELS[primaryCategory]}
                </Link>
              </li>
            )}
          </ol>
        </nav>
      </Container>

      <Container className="order-3 sm:order-2">
        <header className="grid gap-7 pt-6 pb-4 sm:gap-8 sm:pb-10 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16 lg:pt-8">
          <div>
            <h1 className="font-display text-display text-ink">{recipe.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">{recipe.description}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
              <Rating value={recipe.rating} className="font-semibold text-ink" />
              <span>from {recipe.reviewCount.toLocaleString("en")} sample ratings</span>
            </p>
          </div>
          <div className="lg:pb-2">
            <dl
              className="grid gap-px overflow-hidden rounded-lg border border-line bg-line"
              style={{ gridTemplateColumns: `repeat(${factCols}, minmax(0, 1fr))` }}
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
            <div className="mt-5">
              <RecipeActions
                recipe={{
                  id: recipe.id,
                  title: recipe.title,
                  description: recipe.description,
                  ingredients: recipe.ingredients,
                }}
              />
            </div>
          </div>
        </header>
      </Container>

      <div className="order-2 mx-auto mt-4 w-full max-w-[1520px] sm:order-3 sm:mt-0 sm:px-8">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-3 sm:aspect-[16/9] sm:rounded-xl lg:aspect-[21/9]">
          <Image
            src={recipe.imageUrl.replace("w=1200", "w=2000")}
            alt={recipe.imageAlt}
            fill
            priority
            sizes="(min-width: 1520px) 1460px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <Container className="order-4">
        <RecipeJumpNav />
        <div className="grid gap-14 pt-8 sm:pt-14 lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-20 lg:pt-20">
          <aside
            id="ingredients"
            className="scroll-mt-[calc(var(--header-h)+4.5rem)] lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start"
          >
            <IngredientsPanel
              recipeTitle={recipe.title}
              ingredients={recipe.ingredients}
              baseServings={recipe.servings}
              servingOptions={servingOptions(recipe.servings)}
              servingNoun={isBatch ? "Makes" : "Serves"}
            />
          </aside>

          <div className="max-w-[46rem] min-w-0">
            <div id="method" className="scroll-mt-[calc(var(--header-h)+4.5rem)]">
              <MethodSteps steps={recipe.steps} />
            </div>

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
                  <h2
                    id="tips-title"
                    className="font-display flex items-center gap-2 text-[1.8rem] leading-none text-ink"
                  >
                    <LightbulbIcon className="size-5 text-clay" strokeWidth={1.6} aria-hidden />
                    Tips
                  </h2>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {recipe.tips.map((t) => (
                      <li key={t} className="py-3.5 text-[0.95rem] leading-relaxed text-ink">
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {recipe.substitutions.length > 0 && (
                <section aria-labelledby="subs-title">
                  <h2
                    id="subs-title"
                    className="font-display flex items-center gap-2 text-[1.8rem] leading-none text-ink"
                  >
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
                  {recipe.nutrition.verified ? "Verified values" : "Estimated from standard ingredient values"}
                </p>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
                {[
                  { label: "Calories", value: `${recipe.nutrition.calories}`, unit: "kcal" },
                  { label: "Protein", value: `${recipe.nutrition.protein}`, unit: "g" },
                  { label: "Carbohydrates", value: `${recipe.nutrition.carbohydrates}`, unit: "g" },
                  { label: "Fat", value: `${recipe.nutrition.fat}`, unit: "g" },
                ].map((n) => (
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
                {recipe.tags.map((t) => (
                  <li key={t}>
                    <Link
                      href={`/recipes?q=${encodeURIComponent(t.replace(/-/g, " "))}`}
                      className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[0.82rem] text-ink-muted hover:bg-paper-2 hover:text-ink"
                    >
                      {t.replace(/-/g, " ")}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 border-t border-line pt-14" aria-labelledby="related-title">
            <h2 id="related-title" className="font-display text-title text-ink">
              You might also cook
            </h2>
            <p className="mt-1.5 text-[0.95rem] text-ink-muted">Similar ingredients, meal or cuisine.</p>
            <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.id}>
                  <RecipeCard recipe={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </article>
  );
}
