import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/common/page-header";
import { ShoppingClient } from "@/components/shopping/shopping-client";

export const metadata: Metadata = { title: "Shopping list" };

export default function ShoppingListPage() {
  return (
    <Container>
      <PageHeader
        className="mx-auto max-w-3xl"
        title="Shopping list"
        description="Ingredients from your recipes, combined and sorted by aisle."
      />
      <ShoppingClient />
    </Container>
  );
}
