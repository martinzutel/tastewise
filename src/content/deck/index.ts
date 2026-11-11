import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The "where we are" deck shared at /deck. Each slide is a 1920×1080 HTML
 * section authored in the Slides format (inline styles only), kept as one
 * file per slide in this folder. To edit a slide, edit its .html file; to
 * reorder or add one, change SLIDE_ORDER.
 */
export const DECK_TITLE = "Where we are, and what we’re still figuring out";
export const DECK_DESCRIPTION =
  "A candid look at Tastewise: the app, where we want to take it, and the questions we’d love help with.";

export const SLIDE_ORDER = [
  "cover",
  "why",
  "problem",
  "product",
  "ideas",
  "today",
  "direction",
  "questions",
  "q-focus",
  "q-chatbot",
  "q-reach",
  "q-relevance",
  "q-money",
  "q-ai",
  "q-recipes",
  "ask",
] as const;

// Slides name the brand fonts directly; the site loads them through next/font, which exposes CSS variables.
// Matches 'Name', "Name" or &quot;Name&quot; so a reformatted file can't silently fall back to system fonts.
const FONT_SWAPS: [RegExp, string][] = [
  [/(?:'|"|&quot;)Cormorant Garamond(?:'|"|&quot;)/g, "var(--font-cormorant)"],
  [/(?:'|"|&quot;)Manrope(?:'|"|&quot;)/g, "var(--font-manrope)"],
];

export function loadSlides(): { id: string; html: string }[] {
  const dir = join(process.cwd(), "src/content/deck");
  return SLIDE_ORDER.map((id) => {
    let html = readFileSync(join(dir, `${id}.html`), "utf8");
    for (const [pattern, replacement] of FONT_SWAPS) html = html.replace(pattern, replacement);
    return { id, html };
  });
}
