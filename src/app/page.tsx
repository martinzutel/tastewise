import Link from "next/link";
import { CategoryIndex, type CategoryLink } from "@/components/discover/category-index";
import { Featured } from "@/components/discover/featured";
import { ForYou } from "@/components/discover/for-you";
import { Hero } from "@/components/discover/hero";
import { PantryPromo } from "@/components/discover/pantry-promo";
import { PopularList } from "@/components/discover/popular-list";
import { RecentList } from "@/components/discover/recent-list";
import { RecipeRail } from "@/components/recipe/recipe-rail";
import { SectionHeading } from "@/components/common/page-header";
import { listIngredients, listRecipeSummaries } from "@/lib/data/recipes";
import { matchPantry } from "@/lib/services/pantry-matching";
import { sortRecipes } from "@/lib/services/recipe-search";
import type { RecipeSummary } from "@/lib/types";

const SAMPLE_PANTRY = ["eggs", "canned-tomatoes", "onion", "garlic", "feta", "olive-oil", "bell-pepper", "cumin"];

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-sage-ink underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export default async function DiscoverPage() {
  const [recipes, ingredients] = await Promise.all([listRecipeSummaries(), listIngredients()]);
  const bySlug = (slug: string) => recipes.find((r) => r.slug === slug);

  const featured = recipes.filter((r) => r.featured);
  const cover = bySlug("shakshuka-with-feta") ?? featured[0] ?? recipes[0];
  const spread = featured.filter((r) => r.id !== cover.id);
  const lead = spread[0] ?? recipes[1];
  const supporting = spread.slice(1, 3);
  const shown = new Set([cover.id, lead.id, ...supporting.map((r) => r.id)]);

  const popular = sortRecipes(recipes, "popular")
    .filter((r) => !shown.has(r.id))
    .slice(0, 5);
  const quick = sortRecipes(
    recipes.filter((r) => r.totalTime <= 30),
    "quickest",
  ).slice(0, 10);
  const recent = sortRecipes(recipes, "newest").slice(0, 4);

  const ingredientNames = Object.fromEntries(ingredients.map((i) => [i.id, i.plural ?? i.name]));
  const sampleNames = SAMPLE_PANTRY.map((id) => ingredientNames[id]).filter(Boolean);
  const pantryExample = matchPantry(recipes, SAMPLE_PANTRY).slice(0, 3);

  const pick = (list: RecipeSummary[], prefer?: string) => (prefer && list.find((r) => r.slug === prefer)) || list[0];
  const categoryDefs: { label: string; href: string; list: RecipeSummary[]; prefer?: string }[] = [
    {
      label: "Breakfast",
      href: "/recipes?category=breakfast",
      list: recipes.filter((r) => r.categories.includes("breakfast")),
      prefer: "buttermilk-pancakes",
    },
    {
      label: "Lunch",
      href: "/recipes?category=lunch",
      list: recipes.filter((r) => r.categories.includes("lunch")),
      prefer: "salmon-sushi-bowl",
    },
    {
      label: "Dinner",
      href: "/recipes?category=dinner",
      list: recipes.filter((r) => r.categories.includes("dinner")),
      prefer: "chicken-tikka-masala",
    },
    {
      label: "Desserts",
      href: "/recipes?category=dessert",
      list: recipes.filter((r) => r.categories.includes("dessert")),
      prefer: "classic-tiramisu",
    },
    {
      label: "Snacks",
      href: "/recipes?category=snack",
      list: recipes.filter((r) => r.categories.includes("snack")),
      prefer: "tomato-bruschetta",
    },
    {
      label: "Vegetarian",
      href: "/recipes?diet=vegetarian",
      list: recipes.filter((r) => r.diets.includes("vegetarian")),
      prefer: "roasted-chickpea-quinoa-bowl",
    },
    {
      label: "Baking",
      href: "/recipes?category=baking",
      list: recipes.filter((r) => r.categories.includes("baking")),
      prefer: "no-knead-country-loaf",
    },
    {
      label: "Under 30 minutes",
      href: "/recipes?time=under-15,15-30",
      list: recipes.filter((r) => r.totalTime <= 30),
      prefer: "chipotle-chicken-tacos",
    },
  ];
  const categories: CategoryLink[] = categoryDefs
    .filter((c) => c.list.length > 0)
    .map((c) => ({ label: c.label, href: c.href, count: c.list.length, imageUrl: pick(c.list, c.prefer).imageUrl }));

  return (
    <>
      <Hero cover={cover} recipes={recipes} />

      <section className="mx-auto max-w-[1360px] px-5 sm:px-8" aria-labelledby="featured-title">
        <SectionHeading
          id="featured-title"
          title="Featured this week"
          action={<SeeAll href="/recipes">Browse all recipes</SeeAll>}
        />
        <Featured lead={lead} others={supporting} />
      </section>

      <ForYou recipes={recipes} ingredientNames={ingredientNames} />

      <section className="mx-auto max-w-[1360px] px-5 pt-24 sm:px-8" aria-labelledby="popular-title">
        <SectionHeading
          id="popular-title"
          title="Popular right now"
          description="The recipes people are opening most."
          action={<SeeAll href="/recipes?sort=popular">See more</SeeAll>}
        />
        <PopularList recipes={popular} />
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pt-24 sm:px-8" aria-labelledby="quick-title">
        <SectionHeading
          id="quick-title"
          title="Quick and easy"
          description="On the table in 30 minutes or less."
          action={<SeeAll href="/recipes?time=under-15,15-30&sort=quickest">All quick recipes</SeeAll>}
        />
        <RecipeRail recipes={quick} label="Quick and easy recipes" />
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pt-24 pb-24 sm:px-8" aria-labelledby="categories-title">
        <SectionHeading id="categories-title" title="Explore by category" />
        <CategoryIndex categories={categories} />
      </section>

      <PantryPromo sample={sampleNames} matches={pantryExample} />

      <section className="mx-auto max-w-[1360px] px-5 pt-24 sm:px-8" aria-labelledby="recent-title">
        <SectionHeading
          id="recent-title"
          title="Recently added"
          action={<SeeAll href="/recipes?sort=newest">See what’s new</SeeAll>}
        />
        <RecentList recipes={recent} />
      </section>
    </>
  );
}
