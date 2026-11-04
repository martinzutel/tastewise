import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/recipe/favorite-button";
import { RecipeMeta } from "@/components/recipe/recipe-meta";
import type { RecipeSummary } from "@/lib/types";

/** Magazine-style spread: one lead story and two supporting ones. */
export function Featured({ lead, others }: { lead: RecipeSummary; others: RecipeSummary[] }) {
  return (
    <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[1.55fr_1fr]">
      <article className="group relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper-3 lg:aspect-[16/11]">
          <Image
            src={lead.imageUrl}
            alt={lead.imageAlt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          <FavoriteButton recipe={lead} className="absolute top-4 right-4 z-10" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_1fr] md:gap-10">
          <h3 className="font-display text-headline text-ink">
            <Link
              href={`/recipes/${lead.slug}`}
              className="decoration-sage underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline"
            >
              {lead.title}
            </Link>
          </h3>
          <div>
            <p className="text-[1.02rem] leading-relaxed text-ink-muted">{lead.description}</p>
            <RecipeMeta className="mt-4" totalTime={lead.totalTime} difficulty={lead.difficulty} rating={lead.rating} />
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-10 lg:border-l lg:border-line lg:pl-10">
        {others.map((r) => (
          <article key={r.id} className="group relative grid grid-cols-[0.9fr_1fr] gap-5 lg:grid-cols-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-3">
              <Image
                src={r.imageUrl}
                alt={r.imageAlt}
                fill
                sizes="(min-width: 1024px) 30vw, 45vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <FavoriteButton recipe={r} className="absolute top-3 right-3 z-10" />
            </div>
            <div>
              <h3 className="font-display text-[1.7rem] leading-[1.05] text-ink">
                <Link
                  href={`/recipes/${r.slug}`}
                  className="decoration-sage underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline"
                >
                  {r.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 text-[0.92rem] text-ink-muted">{r.description}</p>
              <RecipeMeta className="mt-3" totalTime={r.totalTime} difficulty={r.difficulty} rating={r.rating} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
