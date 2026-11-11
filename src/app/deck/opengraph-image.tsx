import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DECK_TITLE } from "@/content/deck";
import { LEAF_SVG, OG_COLORS, OG_SIZE, loadGoogleFont } from "@/lib/og";

export const alt = `Tastewise: ${DECK_TITLE}`;
export const size = OG_SIZE;
export const contentType = "image/png";

const SUBLINE = "A candid look at the app, and the questions we’d love help with.";

/** Preview card for the shared deck: its title beside a phone screenshot of the app. */
export default async function DeckOpenGraphImage() {
  const [serif, sans, phone] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 500, `Tastewise${DECK_TITLE}`),
    loadGoogleFont("Manrope", 500, `${SUBLINE}A short deck`),
    readFile(join(process.cwd(), "public/deck/discover.jpg")),
  ]);
  const phoneSrc = `data:image/jpeg;base64,${phone.toString("base64")}`;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: OG_COLORS.paper }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 760,
          padding: "60px 40px 56px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={LEAF_SVG} width={38} height={38} alt="" />
          <span style={{ fontFamily: "Cormorant", fontSize: 42, color: OG_COLORS.ink }}>Tastewise</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Cormorant",
              fontSize: 76,
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
              color: OG_COLORS.ink,
            }}
          >
            {DECK_TITLE}
          </span>
          <span
            style={{ marginTop: 26, fontFamily: "Manrope", fontSize: 26, lineHeight: 1.4, color: OG_COLORS.inkMuted }}
          >
            {SUBLINE}
          </span>
        </div>
        <span style={{ fontFamily: "Manrope", fontSize: 21, color: OG_COLORS.sage }}>A short deck</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: 440,
          height: 630,
          background: OG_COLORS.paper2,
          overflow: "hidden",
        }}
      >
        <img
          src={phoneSrc}
          alt=""
          width={300}
          height={650}
          style={{
            width: 300,
            height: 650,
            marginBottom: -110,
            borderRadius: 36,
            border: `1px solid ${OG_COLORS.line}`,
            boxShadow: "0 24px 60px rgba(37,39,32,0.22)",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>
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
