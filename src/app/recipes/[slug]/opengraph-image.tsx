import { ImageResponse } from "next/og";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { getRecipeBySlug, listRecipeSummaries } from "@/lib/data/recipes";
import { formatMinutes } from "@/lib/format";
import { LEAF_SVG, OG_COLORS, OG_SIZE, loadGoogleFont, ogPhoto } from "@/lib/og";

export const alt = "A recipe on Tastewise";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await listRecipeSummaries()).map((r) => ({ slug: r.slug }));
}

/** Per-recipe preview card: the dish photo, its title and the facts that decide "can I make this tonight?". */
export default async function RecipeOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const recipe = await getRecipeBySlug((await params).slug);
  if (!recipe) return new Response("Not found", { status: 404 });

  const facts = [formatMinutes(recipe.totalTime), DIFFICULTY_LABELS[recipe.difficulty], recipe.cuisine];
  const description =
    recipe.description.length > 120 ? `${recipe.description.slice(0, 117).trimEnd()}…` : recipe.description;
  // Long titles step down a size so they never run past three lines.
  const titleSize = recipe.title.length > 34 ? 64 : recipe.title.length > 22 ? 74 : 84;

  const [serif, sans, sansBold] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 500, `Tastewise${recipe.title}`),
    loadGoogleFont("Manrope", 500, `${description}A recipe on Tastewise`),
    loadGoogleFont("Manrope", 600, facts.join("")),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: OG_COLORS.paper }}>
      <img
        src={ogPhoto(recipe.imageUrl, 1000)}
        alt=""
        width={560}
        height={630}
        style={{ width: 560, height: 630, objectFit: "cover" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 640,
          padding: "56px 64px 56px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LEAF_SVG} width={34} height={34} alt="" />
          <span style={{ fontFamily: "Cormorant", fontSize: 38, color: OG_COLORS.ink }}>Tastewise</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Cormorant",
              fontSize: titleSize,
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: OG_COLORS.ink,
            }}
          >
            {recipe.title}
          </span>
          <span
            style={{
              marginTop: 24,
              fontFamily: "Manrope",
              fontSize: 24,
              lineHeight: 1.4,
              color: OG_COLORS.inkMuted,
            }}
          >
            {description}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {facts.map((fact) => (
            <span
              key={fact}
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 8,
                border: `1.5px solid ${OG_COLORS.line}`,
                background: "#ffffff",
                fontFamily: "ManropeBold",
                fontSize: 22,
                color: OG_COLORS.ink,
              }}
            >
              {fact}
            </span>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: serif, weight: 500, style: "normal" },
        { name: "Manrope", data: sans, weight: 500, style: "normal" },
        { name: "ManropeBold", data: sansBold, weight: 600, style: "normal" },
      ],
    },
  );
}
