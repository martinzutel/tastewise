import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Container } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={CompassIcon}
        title="This page doesn’t exist"
        description="The link may be out of date. Head back to Discover, or search for a recipe."
      >
        <Button asChild>
          <Link href="/">Back to Discover</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/recipes">Explore recipes</Link>
        </Button>
      </EmptyState>
    </Container>
  );
}
