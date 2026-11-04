"use client";

import { BookmarkIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUserData } from "@/lib/user-data/provider";

export function FavoriteButton({
  recipe,
  variant = "overlay",
  className,
}: {
  recipe: { id: string; title: string };
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const { isFavorite, toggleFavorite, status } = useUserData();
  const saved = isFavorite(recipe.id);
  const [pulse, setPulse] = useState(false);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPulse(true);
    toggleFavorite(recipe);
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={status === "loading"}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors disabled:opacity-60",
          saved
            ? "border-sage bg-sage-wash text-sage-ink"
            : "border-line-strong text-ink hover:border-ink/40 hover:bg-paper-2",
          className,
        )}
      >
        <BookmarkIcon
          className={cn("size-[18px]", saved && "fill-current", pulse && "animate-pop")}
          onAnimationEnd={() => setPulse(false)}
          aria-hidden
        />
        {saved ? "Saved" : "Save recipe"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "loading"}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${recipe.title} from saved recipes` : `Save ${recipe.title}`}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-[0_1px_2px_rgb(37_39_32/0.12)] backdrop-blur-sm transition-[background-color,transform] hover:bg-surface active:scale-95 disabled:opacity-60",
        className,
      )}
    >
      <BookmarkIcon
        className={cn("size-[18px] transition-colors", saved && "fill-sage text-sage", pulse && "animate-pop")}
        onAnimationEnd={() => setPulse(false)}
        aria-hidden
      />
    </button>
  );
}
