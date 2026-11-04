import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/common/page-header";
import { SavedClient } from "@/components/saved/saved-client";
import { listRecipeSummaries } from "@/lib/data/recipes";

export const metadata: Metadata = { title: "Saved recipes" };

export default async function SavedPage() {
  const recipes = await listRecipeSummaries();
  return (
    <Container>
      <PageHeader title="Saved recipes" description="Your personal cookbook: everything you’ve bookmarked to cook." />
      <SavedClient recipes={recipes} />
    </Container>
  );
}
