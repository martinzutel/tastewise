import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { formatMinutes } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";

const SUGGESTIONS = [
  { label: "Pasta", href: "/recipes?q=pasta" },
  { label: "Under 30 minutes", href: "/recipes?time=under-15,15-30" },
  { label: "Vegetarian", href: "/recipes?diet=vegetarian" },
  { label: "Chickpeas", href: "/recipes?q=chickpeas" },
  { label: "Something sweet", href: "/recipes?category=dessert" },
];

export function Hero({ cover }: { cover: RecipeSummary }) {
  return (
    <section className="mx-auto grid max-w-[1360px] gap-10 px-5 pt-8 pb-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pt-14 lg:pb-24">
      <div className="max-w-[40rem]">
        <h1 className="font-display text-display text-ink">Find something wonderful to cook.</h1>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-muted">
          Discover recipes, explore new flavors, and make something delicious with what you have.
        </p>

        <form action="/recipes" role="search" className="mt-9">
          <label htmlFor="hero-search" className="sr-only">
            Search recipes by name, ingredient, cuisine or category
          </label>
          <div className="flex items-center rounded-lg border border-line-strong bg-surface p-1.5 shadow-[0_1px_0_rgb(37_39_32/0.04),0_8px_24px_-12px_rgb(37_39_32/0.12)] transition-[border-color,box-shadow] focus-within:border-sage focus-within:shadow-[0_0_0_3px_var(--sage-wash)]">
            <SearchIcon className="ml-3 size-5 shrink-0 text-ink-faint" aria-hidden />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="What are you craving today?"
              autoComplete="off"
              className="h-12 w-full min-w-0 bg-transparent px-3 text-[1.05rem] outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-md bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink/88"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
          <span className="mr-2 text-ink-muted">Try</span>
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-md border border-line px-3 py-1.5 text-ink transition-colors hover:border-line-strong hover:bg-paper-2"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <figure className="relative">
        <Link href={`/recipes/${cover.slug}`} className="group block overflow-hidden rounded-xl">
          <div className="relative aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={cover.imageUrl}
              alt={cover.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]"
            />
          </div>
        </Link>
        <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <Link
            href={`/recipes/${cover.slug}`}
            className="font-display text-[1.6rem] leading-tight text-ink hover:text-sage-ink"
          >
            {cover.title}
          </Link>
          <span className="shrink-0 text-sm text-ink-muted">
            {cover.cuisine}, {formatMinutes(cover.totalTime)}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
