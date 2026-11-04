import { NextResponse, type NextRequest } from "next/server";
import { listRecipeSummaries, searchRecipes } from "@/lib/data/recipes";
import { parseRecipeQuery } from "@/lib/search-params";

/**
 * GET /api/recipes
 *   ?q=tomato&diet=vegan&time=15-30&sort=quickest&limit=6
 *   ?ids=id1,id2   (fetch specific recipes, e.g. for saved lists)
 *
 * Same query contract as the /recipes page. This is the public seam that
 * future clients (mobile app, assistant features) can build on.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 50, 1), 100);

  try {
    const ids = params.get("ids");
    if (ids) {
      const wanted = new Set(ids.split(",").filter(Boolean));
      const recipes = (await listRecipeSummaries()).filter((r) => wanted.has(r.id));
      return NextResponse.json({ recipes: recipes.slice(0, limit), total: recipes.length });
    }
    const query = parseRecipeQuery(params);
    const recipes = await searchRecipes(query);
    return NextResponse.json({ recipes: recipes.slice(0, limit), total: recipes.length, query });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Recipes could not be loaded. Try again shortly." }, { status: 500 });
  }
}
