# Development log

## 2026-11-04: MVP foundation

**Demo mode first.** No Supabase credentials were available, so the app runs fully without them: the catalogue comes from TypeScript seed data and personal data lives in `localStorage`. Supabase is a drop-in upgrade behind two interfaces (`RecipeSource`, `UserDataRepository`), not a fork of the code.

**One source of truth for seed content.** Recipes are authored once in `src/data/seed/recipes.ts`. The app hydrates them at build time, and `scripts/generate-seed-sql.ts` produces `supabase/seed.sql`. The script runs with Node's native TypeScript support, so there's no extra tooling.

**Diets are derived, not tagged.** Each ingredient carries markers (meat, fish, dairy, egg, honey, gluten); recipe diet labels are computed from required ingredients. This keeps "vegan" honest when a recipe changes. Optional garnishes don't affect the label.

**Search contract shared by both sources.** In memory: weighted substring matching with light stemming. In Postgres: weighted `tsvector` plus a `search_recipes` function. Both honor the same `RecipeQuery`, and URL params are validated with Zod.

**Pantry matching ignores staples and optional extras**, and ranks by % available, then fewest missing. Ranking by fewest missing first surfaced recipes with tiny ingredient lists over genuinely close matches.

**Shopping list consolidation** converts within mass (g/kg) and volume (ml/l/tsp/tbsp/cup). Counted units (clove, can, slice) only merge with themselves. Bought lines are never merged into, so ticking something off and then adding a recipe creates a fresh line.

**Fresh herbs are categorized with vegetables** (and so as produce on the shopping list), since that's where people buy them.

**Typography: Cormorant Garamond + Manrope.** Cormorant gives the editorial voice at display sizes; it's never used below about 20 px. Manrope carries the interface.

**Contrast adjustments to the brief's palette.** `#77766E` secondary text measures about 4.3:1 on `#F8F7F2`, so small text uses `#6C6B63` / `#737269`. Darker `sage-ink` and `clay-ink` variants carry text in those hues. The brief colors are used as given for large elements and accents.

**Light-only.** shadcn's `dark:` utilities were following the OS setting, which turned some controls grey on dark-mode machines. The `dark` variant is now bound to an explicit `.dark` class.

**Photography.** Unsplash photos were picked and checked by eye against each recipe. The ramen recipe was rewritten to prawns to match its photo.

**Bundle.** The Supabase client is dynamically imported only for signed-in users (shared JS dropped from 371 kB to 301 kB).

**Copy.** American English and sentence case, matching the brief.

**Audit.** The impeccable design detector flagged bounce easing on the bookmark animation, which was replaced. The manual audit fixed small-text contrast, badge contrast, a tablist without arrow-key support (now `aria-pressed` buttons), and hover-only controls on touch tablets.

## 2026-11-04: Mobile pass and clearer purpose

**Purpose on the first screen.** Discover now names the four jobs the app does, right under the search, using the navigation's own icons. The tab bar then reads as a map of those jobs. The mobile tab "List" was renamed "Shopping".

**One panel at a time on phones.** The pantry shows either your ingredients or what you can cook, behind a pinned switch. It defaults to recipes once you have ingredients, because that's why people open it. Recipe pages lead with the photo and pin an Ingredients / Method / Nutrition bar for cooking. Explore pins search and filters in a single row and moves sorting into the filter sheet.

**Bugs fixed.** The shopping list scrolled sideways at 375 px (157 px overflow) because a long "For …" line couldn't shrink. Rows now truncate. The new hero briefly overflowed because a scrolling grid child expanded its `auto` column; columns are now `minmax(0, 1fr)`.

**Touch and input.** Phone touch targets are 40–48 px. Form text is 16 px below 640 px so iOS Safari doesn't zoom on focus. Toasts clear the tab bar at all widths below 1024 px.

## 2026-11-11: Product record and polish

**PRODUCT.md.** Primary users are beginner cooks, phone first, and the positioning is "cook from your pantry". Future design work starts there.

**Discover follows the positioning.** The four-cell feature strip became the core loop in order (pantry → matches → shopping → cooking), numbered because it is a real sequence, with live progress.

**Polish.**

- Tips and substitutions dropped their coloured left rules for hairline lists.
- "Added" dates moved below recent-recipe titles instead of sitting above them like a label.
- The display size is capped at 6rem.
- Caret, accent, scrollbar and underline offset are themed.
- The account storage notice keeps its icon inline on phones.
- The Explore filter button always shows its label.
- The recipe jump bar uses a scroll-spy, so it highlights the right section in areas between anchors.

**Ops note.** Running `next build` (or a deploy that builds locally) while `next dev` is running corrupts the dev server's `.next` cache and every page returns 500. Stop the dev server first, or delete `.next` and restart.
