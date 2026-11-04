"use client";

import { Share2Icon, ShoppingBasketIcon } from "lucide-react";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/recipe/favorite-button";
import { Button } from "@/components/ui/button";
import { fromRecipeIngredient } from "@/lib/services/shopping-list";
import type { RecipeIngredient } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";

export function RecipeActions({
  recipe,
}: {
  recipe: { id: string; title: string; description: string; ingredients: RecipeIngredient[] };
}) {
  const { addToShoppingList } = useUserData();

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, text: recipe.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copied", { description: "Paste it anywhere to share this recipe." });
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // user closed the share sheet
      toast.error("Couldn’t share this recipe", { description: "Copy the address from your browser instead." });
    }
  };

  const addAll = () =>
    addToShoppingList(
      recipe.ingredients.filter((i) => !i.staple && !i.optional).map((i) => fromRecipeIngredient(i, 1, recipe.title)),
      recipe.title,
    );

  return (
    <div className="flex flex-wrap gap-2.5">
      <FavoriteButton recipe={recipe} variant="inline" />
      <Button variant="outline" className="h-11 px-4" onClick={addAll}>
        <ShoppingBasketIcon aria-hidden />
        <span className="hidden sm:inline">Add to shopping list</span>
        <span className="sm:hidden">Shopping list</span>
      </Button>
      <Button variant="ghost" className="h-11 px-4" onClick={share}>
        <Share2Icon aria-hidden />
        Share
      </Button>
    </div>
  );
}
