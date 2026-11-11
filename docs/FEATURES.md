# Features

Status: **Implemented** = works end to end in demo mode (and is wired to Supabase when configured).

## Discover (`/`): Implemented

- Editorial hero with a search form (submits to Explore) and quick suggestion links (one scrollable row on phones).
- **What you can do**: four entry points (find a recipe, cook from your pantry, keep a cookbook, shop with one list) using the same icons as the navigation. Each shows live status once you have data ("7 ingredients in your pantry", "14 items to buy"). On phones it sits directly under the search, before the cover photo.
- Featured spread: one lead recipe and two supporting ones (`featured` flag).
- **Matched to your preferences**: only shown once preferences are set. Rule-based, and each card shows why it matched.
- Popular right now: top five by popularity, ranked.
- Quick and easy: horizontal rail of recipes ≤ 30 minutes total.
- Explore by category: typographic index (breakfast, lunch, dinner, desserts, snacks, vegetarian, baking, under 30 minutes) with live counts.
- Cook with what you have: pantry entry point, with an example computed by the real matching service on a sample pantry.
- Recently added: newest four, as list rows.

## Explore (`/recipes`): Implemented

- Live text search (debounced) across titles, ingredients, descriptions, cuisine, categories and tags.
- Filters: total time (4 buckets), difficulty, diet (must meet all selected), meal category, cuisine (Italian, Mexican, Japanese, Mediterranean, American, Other).
- Sorting: most popular, highest rated, quickest, recently added, and "your preferences" when preferences exist.
- Active filters as removable chips, plus reset all.
- **Apply my preferences**: adds saved diets and disliked-ingredient exclusions as visible filters.
- State lives in the URL, so results are shareable and survive refresh. Desktop sidebar; on phones, search and a filter button form one row pinned under the header, and sorting lives in the filter sheet.
- Skeleton loading, pending state, empty state with a clear-all action.

## Recipe detail (`/recipes/[slug]`): Implemented

- Title, description, sample rating and count, prep/cook/rest/total time, difficulty, cuisine.
- Actions: save, add ingredients to the shopping list, share (Web Share API, or copy link).
- Servings selector (1, 2, 4, 6, 8; batch bakes offer ½×, 1×, 2×). Quantities scale with kitchen fractions and promote g→kg and ml→l.
- Ingredient checklist, with a per-ingredient add-to-list button.
- Numbered method; tap a step to mark it done.
- Notes, tips, substitutions, tags (diet, meal, and tags that link to a search).
- Nutrition per serving, labelled as estimated.
- Related recipes by shared ingredients, meal and cuisine.
- Phones: the photo comes first, and a sticky Ingredients / Method / Nutrition bar keeps both halves of the recipe one tap apart while cooking.
- Statically generated; not-found and loading states.

## Pantry (`/pantry`): Implemented

- Add ingredients with a search-as-you-type picker (keyboard navigable) or common-ingredient shortcuts.
- Edit quantity and unit inline, remove items, find within the pantry, grouped by category.
- **Matching**: for each recipe, % of required ingredients available, count and list of missing items. Staples (salt, pepper, water) and optional extras are excluded.
- Filters: all, ready to cook, 1–2 missing, mostly there (≥ 50%).
- Add a recipe's missing ingredients to the shopping list in one tap.
- Phones: a pinned switch between "Your ingredients" and "What you can cook" (with counts); it opens on the recipes once you have ingredients.

## Saved recipes (`/saved`): Implemented

- Save/unsave from any card or the detail page, with immediate visual feedback and a toast.
- Search within saved recipes (title, cuisine, ingredients); sort by recently saved, A to Z, quickest, highest rated.
- Empty state linking to Explore. Persists between sessions.

## Shopping list (`/shopping-list`): Implemented

- Add all ingredients from a recipe (at the chosen servings), individual ingredients, or a recipe's missing pantry items.
- Consolidation: same ingredient with compatible units merges (200 g + 100 g = 300 g; 1 tbsp + 2 tsp → ml). Incompatible units stay as separate lines. Bought lines are never merged into.
- Custom items with a validated form (name, quantity, unit, aisle). On phones only the name field shows until you start typing.
- Grouped by aisle (produce, dairy & eggs, meat & fish, pantry & dry goods, other); bought items sink to the bottom.
- Tick off items, edit quantities inline, remove items, clear bought, clear all (with confirmation).
- Progress bar and a count badge in the navigation.

## Profile and preferences (`/account`): Implemented

- Name and optional photo (resized and kept locally, or uploaded to Supabase Storage).
- Diets, favorite cuisines, favorite and disliked ingredients, preferred maximum time and difficulty.
- Preferences feed the Discover section, the "your preferences" sort and the "Apply my preferences" filters.

## Accounts (`/sign-in`): Implemented when Supabase is configured

- Email and password sign in and sign up via server actions; email confirmation callback; sign out.
- Without Supabase, the page explains demo mode instead of showing a form that can't work.

## Cross-cutting

- Header search dialog (⌘K / Ctrl+K) backed by `/api/recipes`.
- Toasts for saves, list changes, and errors. Optimistic updates roll back on failure.
- Accessibility: skip link, landmarks, labelled controls, visible focus rings, `aria-pressed` / `aria-checked` states, live regions for result counts, image alt text, AA contrast tokens.
- Responsive: desktop top navigation; mobile bottom tab bar (Discover, Explore, Pantry, Saved, Shopping); phone-specific layouts on every page; 40–48 px touch targets; 16 px form text so iOS doesn't zoom on focus; no horizontal page scroll at 375 px.
