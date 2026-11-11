/**
 * Shared pieces for the Open Graph preview images (the cards shown when a
 * link is shared in WhatsApp, iMessage, Slack, X…). Rendered by next/og at
 * build time, so they cost nothing at request time.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  paper: "#f8f7f2",
  paper2: "#f0eee7",
  ink: "#252720",
  inkMuted: "#6c6b63",
  sage: "#4f5e48",
  clay: "#c47c55",
  line: "#e5e2d9",
};

/**
 * Loads a Google Font as TTF for next/og, subset to the characters actually
 * drawn. Without a browser user agent, Google Fonts returns TrueType, which
 * is what the image renderer needs.
 */
export async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`Could not load font ${family} ${weight} for the preview image`);
  const res = await fetch(src[1]);
  if (!res.ok) throw new Error(`Font download failed for ${family}: ${res.status}`);
  return res.arrayBuffer();
}

/** A JPEG version of a recipe photo URL (the image renderer can't decode WebP/AVIF). */
export function ogPhoto(imageUrl: string, width = 900): string {
  return imageUrl.replace("auto=format", "fm=jpg").replace(/w=\d+/, `w=${width}`);
}

/** The Tastewise leaf, as an inline SVG data URL. */
export const LEAF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 19c0-8 5-13.5 14-14-0.3 9-5.6 14-14 14Z" stroke="${OG_COLORS.sage}" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 19 13.5 10.5" stroke="${OG_COLORS.sage}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
)}`;
