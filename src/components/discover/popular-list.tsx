import Image from "next/image";
import Link from "next/link";
import { formatMinutes } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";
import { Rating } from "@/components/recipe/recipe-meta";

/** A ranked list — the numbers are real rank, so they carry information. */
export function PopularList({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <ol className="rail -mx-5 scroll-px-5 auto-cols-[78%] gap-5 px-5 sm:mx-0 sm:auto-cols-[42%] sm:px-0 lg:grid-flow-row lg:grid-cols-5 lg:gap-6 lg:overflow-visible">
      {recipes.map((r, i) => (
        <li key={r.id} className="group relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-3">
            <Image
              src={r.imageUrl}
              alt={r.imageAlt}
              fill
              sizes="(min-width: 1024px) 18vw, (min-width: 640px) 42vw, 78vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <span className="font-display text-[2.6rem] leading-[0.8] text-sage tabular-nums" aria-hidden>
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-[1.3rem] leading-[1.1] text-ink">
                <Link
                  href={`/recipes/${r.slug}`}
                  className="decoration-sage underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline"
                >
                  <span className="sr-only">Number {i + 1}: </span>
                  {r.title}
                </Link>
              </h3>
              <p className="mt-1.5 flex gap-3 text-[0.8rem] text-ink-muted">
                <span>{formatMinutes(r.totalTime)}</span>
                <Rating value={r.rating} />
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
