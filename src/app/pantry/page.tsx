import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/common/page-header";
import { PantryClient } from "@/components/pantry/pantry-client";
import { listIngredients, listRecipeSummaries } from "@/lib/data/recipes";

export const metadata: Metadata = {
  title: "My pantry",
  description: "Keep track of what you have and see which recipes you can make with it.",
};

export default async function PantryPage() {
  const [recipes, ingredients] = await Promise.all([listRecipeSummaries(), listIngredients()]);
  return (
    <Container>
      <PageHeader
        title="My pantry"
        description="Add what’s in your kitchen. We’ll show what you can cook right now, and what you’d need to pick up."
      />
      <PantryClient recipes={recipes} ingredients={ingredients} />
    </Container>
  );
}
