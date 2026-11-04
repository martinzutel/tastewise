# Architecture

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui on Radix · Lucide icons · Zod · React Hook Form · Supabase (Postgres, Auth, Storage).

## Layers

```
Pages (src/app)            server components: fetch data, compose the page
  └─ Feature components    client components only where there is interaction
       └─ Services         pure functions: search, matching, merging, ranking
Data (server)              src/lib/data/recipes.ts  →  RecipeSource (seed | Supabase)
User data (client)         UserDataProvider  →  UserDataRepository (localStorage | Supabase)
```

### Two repositories, two directions

**Catalogue data** (recipes, ingredients) is read on the server through `src/lib/data/recipes.ts`. It picks a `RecipeSource` at startup:

- `seedSource`: the bundled TypeScript seed, searched in memory.
- `supabaseSource`: Postgres, with full-text search and filters in the `search_recipes` SQL function.

Both implement the same `RecipeQuery` contract, so pages don't know which one is active. Recipe pages are statically generated with `generateStaticParams`.

**Personal data** (favorites, pantry, shopping list, preferences, profile) is owned by the client-side `UserDataProvider`. It talks to a `UserDataRepository`:

- `createLocalRepository()` for guests, validated with Zod on read so corrupt storage can't crash the app.
- `createSupabaseRepository()` for signed-in users, protected by row level security. It is loaded with a dynamic import, so guests never download the Supabase client.

Updates are optimistic: state changes immediately, persists in the background, and on failure the provider shows a toast and reloads from storage.

### Why personal data lives on the client

The product must be fully usable without credentials (demo mode). Keeping the provider on the client gives one code path for guest and account storage, instant feedback, and no server round trip for checkbox-heavy screens like the shopping list.

## Services (business logic)

All in `src/lib/services/`, all pure and framework-free:

| Module               | Responsibility                                                             |
| -------------------- | -------------------------------------------------------------------------- |
| `recipe-search.ts`   | Weighted text matching, filters, sorting (seed source)                     |
| `pantry-matching.ts` | % of required ingredients available, missing list, match filters           |
| `shopping-list.ts`   | Consolidating items with compatible units, keeping incompatible ones apart |
| `personalization.ts` | Rule-based ranking with human-readable reasons                             |
| `diet.ts`            | Deriving vegetarian/vegan/gluten-free/dairy-free from ingredient markers   |
| `related.ts`         | Related recipes by ingredient overlap, category and cuisine                |

Units and quantity formatting (`units.ts`, `format.ts`) handle mass/volume conversion, kitchen fractions (½, ⅓, ¾) and plurals.

## Server features used

- **Server components** for every page; client components only for interactive parts.
- **Route handlers**: `GET /api/recipes` (search, or `?ids=`) and `GET /api/ingredients`. The header search dialog uses the recipes endpoint.
- **Server actions**: sign in, sign up and sign out (`src/app/sign-in/actions.ts`), validated with Zod.
- **Middleware**: refreshes the Supabase session cookie; no-op in demo mode.

## Future AI integration points

Nothing AI-related is implemented. These are the seams where it will plug in:

- **Conversational discovery**: translate a request into a `RecipeQuery`, then call the existing `searchRecipes` / `/api/recipes`.
- **Ingredient recognition**: produce ingredient ids and call `addPantryItems`. Pantry matching works unchanged.
- **Recipe modification**: operate on the `Recipe` domain type; substitutions already have a structured shape.
- **Recommendations**: replace or extend `rankForPreferences` in `personalization.ts`. Its `{ recipe, score, reasons }` output is already what the UI renders.
- A new `RecipeSource` can wrap an external recipe API or a retrieval service without touching pages.

## Design system

Tokens are defined once in `src/app/globals.css` and exposed as Tailwind utilities:

- Palette from the brief: paper `#F8F7F2`, paper-2 `#F0EEE7`, ink `#252720`, sage `#73846A`, clay `#C47C55`, line `#E5E2D9`. `*-ink` variants are darker versions used wherever a color carries small text, to meet WCAG AA.
- Type: Cormorant Garamond (display, only at large sizes) and Manrope (UI and body), with a 1.25 modular scale (`text-display`, `text-headline`, `text-title`).
- Radius: 6/8/10/12/14 px. No pill shapes.
- The app is light-only for now; the shadcn `dark:` variant is bound to an explicit `.dark` class.
- Motion: short color and transform transitions on interaction only; reduced-motion removes movement but keeps state changes.
