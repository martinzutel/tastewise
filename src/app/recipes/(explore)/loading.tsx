import { Container } from "@/components/common/page-header";
import { RecipeGridSkeleton } from "@/components/recipe/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <Skeleton className="h-14 w-72 bg-paper-3" />
        <Skeleton className="mt-4 h-5 w-full max-w-lg bg-paper-2" />
      </div>
      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full bg-paper-2" />
          ))}
        </div>
        <div>
          <Skeleton className="mb-12 h-12 w-full bg-paper-2" />
          <RecipeGridSkeleton count={6} />
        </div>
      </div>
    </Container>
  );
}
