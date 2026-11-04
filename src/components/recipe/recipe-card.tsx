import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RecipeSummary } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";
import { RecipeMeta } from "./recipe-meta";

type Size = "default" | "compact" | "large";

/**
 * The core browsing unit. Deliberately not a boxed card: the photograph
 * carries it, and the text sits directly on the page.
 */
export function RecipeCard({
  recipe,
  size = "default",
  priority = false,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw",
  footer,
  className,
}: {
  recipe: RecipeSummary;
  size?: Size;
  priority?: boolean;
  sizes?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-paper-3",
          size === "large" ? "aspect-[4/3] sm:aspect-[5/4]" : size === "compact" ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        <Image
          src={recipe.imageUrl}
          alt={recipe.imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <FavoriteButton recipe={recipe} className="absolute top-3 right-3 z-10" />
      </div>
      <div className={cn("flex flex-1 flex-col", size === "compact" ? "pt-3" : "pt-4")}>
        <h3
          className={cn(
            "font-display text-ink",
            size === "large" ? "text-title" : size === "compact" ? "text-[1.3rem]" : "text-[1.55rem]",
            "leading-[1.08]",
          )}
        >
          {/* The stretched link makes the whole card clickable while keeping one tab stop. */}
          <Link
            href={`/recipes/${recipe.slug}`}
            className="rounded-sm decoration-sage decoration-2 underline-offset-4 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
          >
            {recipe.title}
          </Link>
        </h3>
        {size !== "compact" && (
          <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-ink-muted">{recipe.description}</p>
        )}
        <RecipeMeta
          totalTime={recipe.totalTime}
          difficulty={recipe.difficulty}
          rating={size === "compact" ? undefined : recipe.rating}
          className={size === "compact" ? "mt-1.5" : "mt-3"}
        />
        {footer && <div className="relative z-10 mt-3">{footer}</div>}
      </div>
    </article>
  );
}
