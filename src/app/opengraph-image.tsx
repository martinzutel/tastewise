import { ImageResponse } from "next/og";
import { getRecipeBySlug } from "@/lib/data/recipes";
import { LEAF_SVG, OG_COLORS, OG_SIZE, loadGoogleFont, ogPhoto } from "@/lib/og";

export const alt = "Tastewise: find something wonderful to cook";
export const size = OG_SIZE;
export const contentType = "image/png";

const HEADLINE = "Find something wonderful to cook.";
const SUBLINE = "Recipes, cooking from your pantry, and one shopping list.";

/** The preview card for the site itself: promise on the left, a cover photo on the right. */
export default async function OpenGraphImage() {
  const cover = await getRecipeBySlug("shakshuka-with-feta");
  const [serif, sans] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 500, `Tastewise${HEADLINE}`),
    loadGoogleFont("Manrope", 500, `${SUBLINE}tastewise-two.vercel.app`),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: OG_COLORS.paper }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 660,
          padding: "60px 56px 52px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={LEAF_SVG} width={40} height={40} alt="" />
          <span style={{ fontFamily: "Cormorant", fontSize: 44, color: OG_COLORS.ink }}>Tastewise</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Cormorant",
              fontSize: 80,
              lineHeight: 1,
              letterSpacing: "-0.015em",
              color: OG_COLORS.ink,
            }}
          >
            {HEADLINE}
          </span>
          <span
            style={{ marginTop: 24, fontFamily: "Manrope", fontSize: 25, lineHeight: 1.35, color: OG_COLORS.inkMuted }}
          >
            {SUBLINE}
          </span>
        </div>
        <span style={{ fontFamily: "Manrope", fontSize: 20, color: OG_COLORS.sage }}>tastewise-two.vercel.app</span>
      </div>
      {cover && (
        <img
          src={ogPhoto(cover.imageUrl, 1100)}
          alt=""
          width={540}
          height={630}
          style={{ width: 540, height: 630, objectFit: "cover" }}
        />
      )}
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: serif, weight: 500, style: "normal" },
        { name: "Manrope", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
