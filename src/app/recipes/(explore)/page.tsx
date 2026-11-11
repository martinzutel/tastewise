import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/common/page-header";
import { ExploreClient } from "@/components/explore/explore-client";
import { listIngredients, searchRecipes } from "@/lib/data/recipes";
import { parseRecipeQuery } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Explore recipes",
  description: "Search and filter recipes by time, diet, meal, cuisine and difficulty.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseRecipeQuery(await searchParams);
  const [results, ingredients] = await Promise.all([searchRecipes(query), listIngredients()]);
  const ingredientNames = Object.fromEntries(ingredients.map((i) => [i.id, i.plural ?? i.name]));

  return (
    <Container>
      <PageHeader
        title="Explore recipes"
        description="Search by what you’re craving or what you have, then narrow it down by time, diet and meal."
      />
      <ExploreClient query={query} results={results} ingredientNames={ingredientNames} />
    </Container>
  );
}
