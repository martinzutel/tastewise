import Link from "next/link";
import { CookingPotIcon } from "lucide-react";
import { Container } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export default function RecipeNotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={CookingPotIcon}
        title="We couldn’t find that recipe"
        description="It may have been renamed or removed. Search for it by name, or browse everything we have."
      >
        <Button asChild>
          <Link href="/recipes">Explore recipes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Discover</Link>
        </Button>
      </EmptyState>
    </Container>
  );
}
