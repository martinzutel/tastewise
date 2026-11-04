import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { formatMinutes } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";
import { WhatYouCanDo } from "./what-you-can-do";

const SUGGESTIONS = [
  { label: "Pasta", href: "/recipes?q=pasta" },
  { label: "Under 30 minutes", href: "/recipes?time=under-15,15-30" },
  { label: "Vegetarian", href: "/recipes?diet=vegetarian" },
  { label: "Chickpeas", href: "/recipes?q=chickpeas" },
  { label: "Something sweet", href: "/recipes?category=dessert" },
];

/**
 * Order on phones: promise and search, then the four things the app does,
 * then the cover photo. On desktop the photo sits beside the promise and
 * the four jobs run full width underneath.
 */
export function Hero({ cover, recipeCount }: { cover: RecipeSummary; recipeCount: number }) {
  return (
    <section className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-8 px-5 pt-7 pb-14 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-x-16 lg:gap-y-14 lg:pt-14 lg:pb-20">
      <div className="max-w-[40rem] min-w-0">
        <h1 className="font-display text-display text-ink">Find something wonderful to cook.</h1>
        <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-ink-muted sm:mt-6 sm:text-lg">
          Discover recipes, explore new flavors, and make something delicious with what you have.
        </p>

        <form action="/recipes" role="search" className="mt-7 sm:mt-9">
          <label htmlFor="hero-search" className="sr-only">
            Search recipes by name, ingredient, cuisine or category
          </label>
          <div className="flex items-center rounded-lg border border-line-strong bg-surface p-1.5 shadow-[0_1px_0_rgb(37_39_32/0.04),0_8px_24px_-12px_rgb(37_39_32/0.12)] transition-[border-color,box-shadow] focus-within:border-sage focus-within:shadow-[0_0_0_3px_var(--sage-wash)]">
            <SearchIcon className="ml-2.5 size-5 shrink-0 text-ink-faint sm:ml-3" aria-hidden />
            <input
              id="hero-search"
              name="q"
              type="search"
              enterKeyHint="search"
              placeholder="What are you craving today?"
              autoComplete="off"
              className="h-12 w-full min-w-0 bg-transparent px-2.5 text-base outline-none placeholder:text-ink-faint sm:px-3 sm:text-[1.05rem]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-12 shrink-0 place-items-center rounded-md bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-ink/88 sm:px-5"
            >
              <SearchIcon className="size-[18px] sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* One scrollable row on phones, wrapping on larger screens. */}
        <div className="rail -mx-5 mt-4 scroll-px-5 auto-cols-max items-center gap-1.5 px-5 text-sm sm:mx-0 sm:mt-5 sm:flex sm:flex-wrap sm:gap-x-1 sm:gap-y-2 sm:px-0">
          <span className="mr-1.5 text-ink-muted">Try</span>
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="inline-flex h-10 items-center rounded-md border border-line px-3 whitespace-nowrap text-ink transition-colors hover:border-line-strong hover:bg-paper-2 sm:h-9"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <figure className="relative order-3 lg:order-none">
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
        <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-4">
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

      <div className="order-2 -mx-5 sm:mx-0 lg:order-none lg:col-span-2">
        <WhatYouCanDo recipeCount={recipeCount} />
      </div>
    </section>
  );
}
