# Tastewise

A recipe discovery and personal cooking companion: find something to cook, cook from what you have, save recipes you love and turn them into a shopping list.

This is the MVP foundation. It deliberately contains **no AI features**; see [docs/ROADMAP.md](docs/ROADMAP.md) for what comes next.

**Live:** https://tastewise-two.vercel.app

**New to the code? Read [docs/GUIDE.md](docs/GUIDE.md) first.** It covers the mental model, where everything lives and how to make common changes.

## Stack

Next.js (React + TypeScript), Tailwind CSS, shadcn/ui, Zod, optional Supabase, hosted on Vercel. Each one is explained in plain words in [docs/GUIDE.md](docs/GUIDE.md#the-stack-in-plain-words).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables the app runs in **demo mode**:

- the 33 seed recipes and 148 ingredients are served from `src/data/seed/`
- saved recipes, pantry, shopping list, profile and preferences are stored in your browser (`localStorage`)

Every feature works in demo mode. Adding Supabase gives you real accounts and cross-device sync.

## Connecting Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema. Either paste `supabase/migrations/20261104000000_initial_schema.sql` into the SQL editor, or with the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Load the catalogue: run `supabase/seed.sql` in the SQL editor (or `psql "$DATABASE_URL" -f supabase/seed.sql`).
4. Copy `.env.example` to `.env.local` and fill in the values from **Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. In **Authentication → URL configuration**, add `http://localhost:3000/auth/callback` (and your production URL) to the redirect URLs.
6. Restart `npm run dev`. A **Sign in to sync** option appears in the account menu.

The migration also creates a public `avatars` storage bucket with per-user write policies.

## Environment variables

| Variable                        | Required | Purpose                                                            |
| ------------------------------- | -------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | No       | Supabase project URL. Enables the database catalogue and accounts. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No       | Supabase anon (public) key. Row level security protects user data. |

Never put the `service_role` key in the app.

## Scripts

| Command                       | What it does                                                 |
| ----------------------------- | ------------------------------------------------------------ |
| `npm run dev`                 | Start the dev server                                         |
| `npm run check`               | Type check, lint and formatting check (run before pushing)   |
| `npm run unused`              | Find unused files, exports and dependencies (knip)           |
| `npm run build` / `npm start` | Production build and server                                  |
| `npm run lint`                | ESLint                                                       |
| `npm run typecheck`           | TypeScript, strict mode                                      |
| `npm run format`              | Prettier (with Tailwind class sorting)                       |
| `npm run db:seed:generate`    | Regenerate `supabase/seed.sql` from the TypeScript seed data |

## Project structure

```
src/app/            routes: Discover, Explore, recipe detail, pantry, saved, shopping list, account
src/components/     UI grouped by screen (plus ui/ primitives, common/, layout/, recipe/)
src/lib/            types, business logic (services/), catalogue access (data/), personal data (user-data/)
src/data/seed/      the 33 recipes and 148 ingredients
supabase/           schema migration and generated seed SQL
docs/               guide, architecture, database, features, roadmap, development log
```

A file-by-file map and a "where do I change…?" table are in [docs/GUIDE.md](docs/GUIDE.md#4-where-things-live).

## Content notes

- Ratings and review counts are **sample data** for the demo and are labelled as such in the UI.
- Nutrition values are estimates, labelled "Estimated from standard ingredient values".
- Food photography is from [Unsplash](https://unsplash.com/license), served from `images.unsplash.com`.

## Documentation

- [docs/GUIDE.md](docs/GUIDE.md): **start here**. Onboarding, folder map, common tasks, conventions
- [PRODUCT.md](PRODUCT.md): who it's for, positioning and product principles
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the pieces fit and why
- [docs/DATABASE.md](docs/DATABASE.md): schema, RLS and search
- [docs/FEATURES.md](docs/FEATURES.md): what is implemented, and how
- [docs/ROADMAP.md](docs/ROADMAP.md): what's next, including AI
- [docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md): decisions and their reasons
