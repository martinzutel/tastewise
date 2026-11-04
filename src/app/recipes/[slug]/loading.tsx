import { Container } from "@/components/common/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading recipe">
      <Container>
        <Skeleton className="mt-8 h-4 w-40 bg-paper-2" />
        <div className="grid gap-8 pt-8 pb-10 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Skeleton className="h-16 w-full max-w-xl bg-paper-3" />
            <Skeleton className="mt-3 h-16 w-2/3 bg-paper-3" />
            <Skeleton className="mt-6 h-5 w-full max-w-lg bg-paper-2" />
            <Skeleton className="mt-2 h-5 w-3/4 max-w-md bg-paper-2" />
          </div>
          <Skeleton className="h-36 w-full bg-paper-2" />
        </div>
      </Container>
      <div className="mx-auto max-w-[1520px] sm:px-8">
        <Skeleton className="aspect-[4/3] w-full rounded-none bg-paper-3 sm:aspect-[16/9] sm:rounded-xl lg:aspect-[21/9]" />
      </div>
      <Container>
        <div className="grid gap-14 pt-14 lg:grid-cols-[380px_1fr] lg:gap-20">
          <div className="space-y-3">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-full bg-paper-2" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-paper-2" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
