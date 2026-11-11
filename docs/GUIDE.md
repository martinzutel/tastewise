# Developer guide

Start here if you're new to the codebase. This guide explains how Tastewise is put together, where things live, and how to make the most common changes without breaking anything.

It takes about 20 minutes to read. The other docs go deeper on one topic each:

| Doc                                      | Read it when                                                  |
| ---------------------------------------- | ------------------------------------------------------------- |
| [PRODUCT.md](../PRODUCT.md)              | You need to know who the app is for and what it must never do |
| [ARCHITECTURE.md](ARCHITECTURE.md)       | You're changing how data flows or adding a backend            |
| [DATABASE.md](DATABASE.md)               | You're touching Supabase, SQL or row level security           |
| [FEATURES.md](FEATURES.md)               | You want the full list of what each page does                 |
| [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) | You're wondering why something was done a certain way         |
| [ROADMAP.md](ROADMAP.md)                 | You're picking what to build next                             |

---

## 1. What the app does

Tastewise helps beginner cooks decide what to make, cook it, and buy only what's missing. Its edge is **cooking from your pantry**: for every recipe it shows how much you can already make and exactly which ingredients are missing.

There are seven screens:

| Route             | Screen                  | What happens there                                                   |
| ----------------- | ----------------------- | -------------------------------------------------------------------- |
| `/`               | Discover                | Search, the four main jobs, featured and popular recipes, categories |
| `/recipes`        | Explore                 | Search, filters (time, diet, meal, difficulty, cuisine) and sorting  |
| `/recipes/[slug]` | Recipe                  | Serving scaling, ingredient checklist, step-by-step method           |
| `/pantry`         | Pantry                  | Your ingredients and the recipes they match                          |
| `/saved`          | Saved                   | Bookmarked recipes                                                   |
| `/shopping-list`  | Shopping list           | Combined ingredients, sorted by aisle                                |
| `/account`        | Profile and preferences | Name, photo, diets, liked and disliked ingredients                   |

There is **no AI** in the app, and none should be added without the owner's explicit approval (see `CLAUDE.md`).

---

## 2. Getting it running

You need Node.js 22.18 or newer (the seed script uses Node's built-in TypeScript support).

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed: the app runs in **demo mode**, where recipes come from files in the repo and everything you save lives in your browser's `localStorage`.

To reset your demo data, clear the site's storage in your browser's dev tools (the key is `tastewise:user-data:v1`).

### Scripts

| Command                    | What it does                                                           |
| -------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`              | Dev server with hot reload                                             |
| `npm run check`            | Type check, lint and formatting check. **Run this before every push.** |
| `npm run format`           | Auto-format everything (Prettier, with Tailwind class sorting)         |
| `npm run build`            | Production build. Catches anything `check` misses.                     |
| `npm run unused`           | Finds unused files, exports and dependencies (knip)                    |
| `npm run db:seed:generate` | Rebuilds `supabase/seed.sql` after you edit seed recipes               |

> **Gotcha:** don't run `npm run build` (or a Vercel deploy from your machine) while `npm run dev` is running. Both write to `.next/`, and the dev server starts returning errors on every page. If that happens, stop the dev server, delete `.next/`, and start it again.

---

## The stack in plain words

Nothing exotic. If you've built a modern web app before, you'll recognise all of it.

| Tool             | What it is                            | What we use it for                                                                                                         |
| ---------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**      | The web framework (built on React)    | Pages and routing: every folder in `src/app/` is a URL. Also runs the small bits of server code.                           |
| **React**        | The UI library                        | Everything on screen is a component in `src/components/`.                                                                  |
| **TypeScript**   | JavaScript with types                 | Catches mistakes before the code runs. The data shapes live in `src/lib/types.ts`.                                         |
| **Tailwind CSS** | Styling with class names              | `className="text-ink bg-paper"` instead of separate CSS files. Colors and fonts are defined once in `src/app/globals.css`. |
| **shadcn/ui**    | Copy-in UI building blocks (on Radix) | Dialogs, dropdowns and selects that are accessible by default. They live in `src/components/ui/` and are ours to edit.     |
| **Zod**          | Data checking                         | Validates anything from outside: forms, URL filters, saved data.                                                           |
| **Supabase**     | Database and login (optional)         | Off by default. Without it, recipes come from files in the repo and your saved stuff lives in the browser.                 |
| **Vercel**       | Hosting                               | `npx vercel deploy --prod` puts the site live at tastewise-two.vercel.app.                                                 |
| **lucide-react** | Icons                                 | One consistent icon set.                                                                                                   |

That's the whole list. No separate backend server, no state-management library, no CSS framework beyond Tailwind.

## 3. The mental model

The app has two kinds of data, and they travel in opposite directions.

```
                    CATALOGUE (recipes, ingredients)            YOUR DATA (saved, pantry, list, prefs)
                    read-only, same for everyone                read-write, per person

  where it lives    src/data/seed/*.ts                          browser localStorage
                    or Supabase tables                          or Supabase tables (when signed in)

  who reads it      server components (pages)                   client components (useUserData hook)

  entry point       src/lib/data/recipes.ts                     src/lib/user-data/provider.tsx
                       │                                           │
                       ├─ seed-source.ts      (demo mode)           ├─ local-repository.ts     (guest)
                       └─ supabase-source.ts  (Supabase set up)     └─ supabase-repository.ts  (signed in)
```

Two rules keep this simple:

1. **Pages never talk to a data source directly.** They call functions in `src/lib/data/recipes.ts` (catalogue) or the `useUserData()` hook (personal data). Which backend answers is decided in one place.
2. **Business logic is plain functions** in `src/lib/services/`. Search, pantry matching, shopping-list merging, preference ranking: none of it knows about React or storage, so it's easy to read and test.

---

## 4. Where things live

```
src/
├── app/                      Routes. One folder per URL (Next.js App Router).
│   ├── layout.tsx            Shell: fonts, header, tab bar, toasts, user-data provider
│   ├── globals.css           Design tokens (colors, type scale) and base styles
│   ├── page.tsx              Discover
│   ├── recipes/              Explore (page.tsx) and recipe detail ([slug]/page.tsx)
│   ├── pantry/ saved/ shopping-list/ account/ sign-in/
│   ├── api/                  JSON endpoints: /api/recipes, /api/ingredients
│   └── auth/callback/        Supabase email-confirmation redirect
│
├── components/               UI, grouped by the screen that uses it
│   ├── ui/                   shadcn/ui primitives (button, dialog, select…). Rarely edited.
│   ├── common/               Shared bits: page header, empty state, avatar, ingredient picker
│   ├── layout/               Header, mobile tab bar, search dialog, account menu, footer
│   ├── recipe/               Recipe card, rail, grid, meta line, favorite button, skeletons
│   ├── recipe-detail/        Pieces of the recipe page (ingredients, method, nutrition…)
│   └── discover/ explore/ pantry/ saved/ shopping/ account/
│
├── lib/                      Everything that isn't UI
│   ├── types.ts              The domain types. Start here to understand the data.
│   ├── constants.ts          Labels and option lists (diets, categories, sorts…)
│   ├── format.ts             Minutes, fractions (½ cup), plurals
│   ├── units.ts              Unit conversion for scaling and list merging
│   ├── search-params.ts      URL ⇄ RecipeQuery for the Explore page
│   ├── services/             Business logic (pure functions)
│   ├── data/                 Catalogue access (server side)
│   ├── user-data/            Personal data (client side)
│   ├── supabase/             Supabase client and config
│   └── validation/schemas.ts Zod schemas for forms, URL params and stored data
│
├── data/seed/                The 33 recipes and 148 ingredients
└── middleware.ts             Keeps Supabase sessions fresh (does nothing in demo mode)

supabase/migrations/          Database schema, security policies, search function
supabase/seed.sql             Generated from src/data/seed. Never edit by hand.
scripts/generate-seed-sql.ts  The generator
```

### "Where do I change…?"

| I want to change…                            | Go to                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A color, font size or radius                 | `src/app/globals.css` (tokens at the top)                                                                                |
| Navigation items or their icons              | `src/components/layout/nav-items.ts`                                                                                     |
| Homepage sections                            | `src/app/page.tsx` and `src/components/discover/`                                                                        |
| How recipe cards look everywhere             | `src/components/recipe/recipe-card.tsx`                                                                                  |
| Filter options or their labels               | `src/lib/types.ts` (values) and `src/lib/constants.ts` (labels)                                                          |
| How search ranks results                     | `src/lib/services/recipe-search.ts`                                                                                      |
| How pantry matching works                    | `src/lib/services/pantry-matching.ts`                                                                                    |
| How shopping items merge                     | `src/lib/services/shopping-list.ts` and `src/lib/units.ts`                                                               |
| How quantities are displayed                 | `src/lib/format.ts`                                                                                                      |
| A recipe, its photo or ingredients           | `src/data/seed/recipes.ts`                                                                                               |
| Form validation messages                     | `src/lib/validation/schemas.ts`                                                                                          |
| Toast messages for saves and list changes    | `src/lib/user-data/provider.tsx`                                                                                         |
| The preview card shown when a link is shared | `src/app/opengraph-image.tsx` (site), `src/app/recipes/[slug]/opengraph-image.tsx` (recipes), helpers in `src/lib/og.ts` |
| The shared deck at `/deck`                   | One HTML file per slide in `src/content/deck/`; order and title in `src/content/deck/index.ts`                           |

---

## 5. Common tasks, step by step

### Add or edit a recipe

1. Open `src/data/seed/recipes.ts` and copy an existing entry. The format is explained in the comment at the top of the file.
2. Ingredients are tuples: `[ingredientId, quantity, unit, note?, optional?]`. For example `["olive-oil", 2, "tbsp"]` or `["parmesan", 30, "g", "to serve", true]`. The id must exist in `ingredients.ts`; if it doesn't, the app throws a clear error at startup naming the recipe and the missing id.
3. `image` is an Unsplash photo id: the part after `photo-` in an `images.unsplash.com` URL. **Open the photo and check it actually shows your dish.** One recipe already had to be rewritten because its photo showed something else.
4. Don't set diet labels. Vegetarian, vegan, gluten-free and dairy-free are worked out from the ingredients (see `src/lib/services/diet.ts`).
5. Ratings and review counts are sample data. Keep them plausible and never present them as real.
6. Run `npm run db:seed:generate` so the Supabase seed matches, then `npm run check`.

### Add an ingredient

Add a row to the right category in `src/data/seed/ingredients.ts`: `[id, name, plural, markers?, staple?]`.

- **markers** are what diets are derived from: `"meat"`, `"fish"`, `"dairy"`, `"egg"`, `"honey"`, `"gluten"`. Getting these right is what keeps a "vegan" label honest.
- **staple** (`true`) means pantry matching assumes everyone has it (salt, pepper, water).
- Fresh herbs go under `vegetables`, so they land in "Produce" on the shopping list.

### Add a page

1. Create `src/app/<route>/page.tsx`. Keep it a **server component**: fetch data with `src/lib/data/recipes.ts`, then render.
2. Anything interactive (state, clicks, `useUserData`) goes in a separate component under `src/components/<feature>/` with `"use client"` at the top. The page passes it plain data as props.
3. Use `Container` and `PageHeader` from `src/components/common/page-header.tsx` so spacing matches other pages.
4. If it belongs in the main navigation, add it to `src/components/layout/nav-items.ts`. The mobile tab bar has room for five items, and all five are taken.

### Add a filter to Explore

1. Add the values to `src/lib/types.ts` and add the field to `RecipeQuery`.
2. Add labels to `src/lib/constants.ts`.
3. Accept it in `recipeQuerySchema` (`src/lib/validation/schemas.ts`) and add the key to `LIST_KEYS` in `src/lib/search-params.ts`.
4. Apply it in `matchesFilters` (`src/lib/services/recipe-search.ts`) **and** in the `search_recipes` SQL function (in a new migration), so demo mode and Supabase behave the same.
5. Add a group to `FILTER_GROUPS` in `src/components/explore/filter-panel.tsx`.

### Change the look

All colors, the type scale and the radii are CSS variables at the top of `src/app/globals.css`, exposed as Tailwind classes: `bg-paper`, `text-ink`, `text-ink-muted`, `text-sage-ink`, `bg-clay-wash`, `text-display`, `text-title`, and so on. Use those instead of hex values.

- Colors ending in `-ink` are darker versions used for small text, so it stays readable (WCAG AA).
- The serif (`font-display`) is only for large text: headings and big numbers. Everything else uses the default sans.
- The app is light-only for now.

### Connect Supabase

Follow "Connecting Supabase" in the [README](../README.md). Once the two environment variables are set, the catalogue comes from Postgres and a "Sign in to sync" option appears. Nothing else needs changing.

### Deploy

The app is hosted on Vercel at https://tastewise-two.vercel.app, under the owner's account.

- From your machine: `npx vercel deploy --prod` (stop `npm run dev` first; see the gotcha above).
- If the Vercel project is connected to the GitHub repo, every push to `main` deploys automatically.

No environment variables are needed for demo mode. To use Supabase in production, add the same two variables in the Vercel project settings.

---

## 6. Conventions

**Components**

- Server components by default. Add `"use client"` only for state, effects, event handlers or `useUserData()`.
- One component per file, named after the file (`recipe-card.tsx` → `RecipeCard`).
- Prefer composing existing pieces (`RecipeCard`, `EmptyState`, `PageHeader`) over new one-offs.

**Data**

- Domain types live in `src/lib/types.ts`. Storage formats (SQL rows, localStorage JSON) are converted at the edges, in the sources and repositories, and never leak into components.
- Anything coming from outside (URL params, forms, localStorage) is validated with Zod.
- Personal-data updates are optimistic: the UI changes immediately, and on failure the provider shows a toast and reloads.

**Copy and content**

- American English, sentence case, buttons that say exactly what they do ("Save recipe", not "Submit").
- Never invent reviews, users or numbers. Sample data is labelled as sample data.
- Rule-based personalization is described as rules, never as "smart" or "AI".

**Accessibility (the floor, not a bonus)**

- Every control has a visible label or an `aria-label`.
- Touch targets are at least 40 px on phones; form text is at least 16 px (otherwise iOS zooms in).
- Keep focus visible, and don't put information in color alone.
- Test new screens at 375 px wide. There must never be sideways scrolling.

**Docs**
The rules in `CLAUDE.md` apply to everyone: update `FEATURES.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md` and `DEVELOPMENT_LOG.md` when your change affects them.

---

## 7. Before you push

```bash
npm run check     # types, lint, formatting
npm run build     # the real production build
npm run unused    # optional: catches dead code you left behind
```

Then click through what you changed at phone width (375 px) and at desktop width.

---

## 8. Troubleshooting

| Symptom                                                      | Cause and fix                                                                                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Every page returns 500 with `ENOENT … _buildManifest.js.tmp` | A build ran while the dev server was running. Stop it, `rm -rf .next`, start again.                                               |
| `Recipe "x" references unknown ingredient "y"`               | Add `y` to `src/data/seed/ingredients.ts`, or fix the typo in the recipe.                                                         |
| A shared link shows no preview                               | Chat apps cache previews. Check that `https://<site>/opengraph-image` loads, then re-share or use the platform's link debugger.   |
| A recipe image is grey or blank                              | Check the Unsplash id opens at `https://images.unsplash.com/photo-<id>?w=400`. New image hosts must be added to `next.config.ts`. |
| "Your saved recipes… couldn't be loaded" banner              | Stored data couldn't be read. In demo mode, clear the site's storage; with Supabase, check the network tab.                       |
| Saved items vanished after switching browsers                | Expected in demo mode: data lives in each browser. Sign-in with Supabase syncs it.                                                |
| Supabase search works locally but not in production          | Make sure the migration ran on the production database and the env vars are set in Vercel.                                        |

---

## 9. Glossary

| Term           | Meaning                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| **Catalogue**  | Recipes and ingredients: the same for every user                          |
| **Demo mode**  | Running without Supabase: seed files plus `localStorage`                  |
| **Source**     | A catalogue backend (`seed-source.ts`, `supabase-source.ts`)              |
| **Repository** | A personal-data backend (`local-repository.ts`, `supabase-repository.ts`) |
| **Staple**     | An ingredient assumed to be in every kitchen (salt, water)                |
| **Marker**     | A flag on an ingredient (`dairy`, `gluten`…) used to derive diet labels   |
| **Match**      | How much of a recipe your pantry covers: percent, plus the missing items  |
| **Seed**       | The TypeScript recipe data in `src/data/seed/`                            |
