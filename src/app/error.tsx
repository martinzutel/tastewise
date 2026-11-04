"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CloudOffIcon } from "lucide-react";
import { Container } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <EmptyState
        icon={CloudOffIcon}
        title="This page didn’t load"
        description="We couldn’t reach the recipe library. Check your connection and try again. Your saved recipes and lists are safe."
      >
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Discover</Link>
        </Button>
      </EmptyState>
    </Container>
  );
}
