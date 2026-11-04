import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function RecipeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)} aria-hidden>
      <Skeleton className="aspect-[4/3] w-full rounded-lg bg-paper-3" />
      <Skeleton className="mt-4 h-6 w-4/5 bg-paper-3" />
      <Skeleton className="mt-3 h-4 w-full bg-paper-2" />
      <Skeleton className="mt-1.5 h-4 w-2/3 bg-paper-2" />
      <Skeleton className="mt-3 h-3.5 w-1/2 bg-paper-2" />
    </div>
  );
}

export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading recipes">
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
