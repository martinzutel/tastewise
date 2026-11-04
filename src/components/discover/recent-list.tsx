import Image from "next/image";
import Link from "next/link";
import { RecipeMeta } from "@/components/recipe/recipe-meta";
import type { RecipeSummary } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "long" });

/** Recently added as a quiet list of entries, like a contents page. */
export function RecentList({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <ul className="grid gap-x-12 md:grid-cols-2">
      {recipes.map((r) => (
        <li key={r.id} className="border-t border-line">
          <article className="group relative flex gap-5 py-6">
            <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-md bg-paper-3 sm:w-32">
              <Image
                src={r.imageUrl}
                alt={r.imageAlt}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 py-1">
              <p className="text-[0.8rem] text-ink-muted">
                Added <time dateTime={r.createdAt}>{dateFmt.format(new Date(r.createdAt))}</time>
              </p>
              <h3 className="font-display mt-1 text-[1.5rem] leading-[1.1] text-ink">
                <Link
                  href={`/recipes/${r.slug}`}
                  className="decoration-sage underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline"
                >
                  {r.title}
                </Link>
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[0.9rem] text-ink-muted">{r.description}</p>
              <RecipeMeta className="mt-2.5" totalTime={r.totalTime} difficulty={r.difficulty} />
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
