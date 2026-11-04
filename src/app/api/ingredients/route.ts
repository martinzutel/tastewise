import { NextResponse, type NextRequest } from "next/server";
import { listIngredients } from "@/lib/data/recipes";

/** GET /api/ingredients?q=tom — the ingredient catalogue, optionally filtered by name. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  try {
    const all = await listIngredients();
    const ingredients = q
      ? all.filter((i) => i.name.toLowerCase().includes(q) || i.plural?.toLowerCase().includes(q))
      : all;
    return NextResponse.json({ ingredients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ingredients could not be loaded." }, { status: 500 });
  }
}
