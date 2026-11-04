# Database

Schema: `supabase/migrations/20261104000000_initial_schema.sql`. Data: `supabase/seed.sql`, generated from `src/data/seed/` by `npm run db:seed:generate`.

## Catalogue (public read)

| Table                  | Key columns                                                                                                                                                                                                                                                   | Notes                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ingredients`          | `id` (text slug PK), `name`, `plural`, `category`, `is_staple`, `contains_*` flags                                                                                                                                                                            | Stable slugs are shared by recipes, pantry and shopping list. Staples (salt, pepper, water) are ignored by pantry matching. |
| `categories`           | `id`, `slug`, `name`                                                                                                                                                                                                                                          | breakfast, lunch, dinner, dessert, snack, baking                                                                            |
| `recipes`              | `id` uuid, `slug`, times, `total_time` (generated), `difficulty`, `cuisine`, `cuisine_group` (generated), `servings`, `rating`, `review_count`, `popularity`, `is_featured`, diet booleans, nutrition, `nutrition_verified`, `notes`, `tags`, `search_vector` | Ratings are sample content. Diet booleans are derived from ingredient flags by the seed generator.                          |
| `recipe_categories`    | (`recipe_id`, `category_id`)                                                                                                                                                                                                                                  | many-to-many                                                                                                                |
| `recipe_ingredients`   | `recipe_id`, `ingredient_id`, `position`, `quantity`, `unit`, `note`, `is_optional`                                                                                                                                                                           |                                                                                                                             |
| `recipe_steps`         | (`recipe_id`, `step_number`), `instruction`                                                                                                                                                                                                                   |                                                                                                                             |
| `recipe_tips`          | (`recipe_id`, `position`), `tip`                                                                                                                                                                                                                              |                                                                                                                             |
| `recipe_substitutions` | (`recipe_id`, `position`), `ingredient`, `substitute`                                                                                                                                                                                                         |                                                                                                                             |

## User data (row level security: `auth.uid() = user_id`)

| Table                         | Notes                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `profiles`                    | `id` = `auth.users.id`; created by the `on_auth_user_created` trigger                                                 |
| `user_favorites`              | (`user_id`, `recipe_id`), `created_at`                                                                                |
| `pantry_items`                | unique (`user_id`, `ingredient_id`), optional `quantity` and `unit`                                                   |
| `shopping_list_items`         | `ingredient_id` is nullable for custom items; `category` enum; `is_completed`; `sources` (recipe titles, for context) |
| `user_preferences`            | `diets` (enum array), `preferred_cuisines`, `preferred_max_time`, `preferred_difficulty`                              |
| `user_ingredient_preferences` | (`user_id`, `ingredient_id`), `preference` = favorite or disliked. Kept relational rather than JSON.                  |

All user tables default `user_id` to `auth.uid()` and have one `for all to authenticated` policy with matching `using` and `with check` clauses.

Storage: public `avatars` bucket. Users can only write within a folder named after their own user id.

## Search

`search_vector` is a weighted `tsvector`:

- **A**: title
- **B**: cuisine, category names, ingredient names
- **C**: description and tags

Triggers on `recipes`, `recipe_ingredients` and `recipe_categories` keep it current.

`search_recipes(p_query, p_time, p_difficulty, p_diets, p_categories, p_cuisines, p_exclude)` applies `websearch_to_tsquery` plus every filter. With a query it orders by `ts_rank`, otherwise by popularity. It returns `setof recipes`, so the client embeds related tables in the same request. Diet filters are conjunctive (a recipe must satisfy every selected diet); other filters are OR within a group.

## Verification

The migration and seed were applied to Postgres via PGlite with stand-in `auth` and `storage` schemas. Checked:

- all 33 recipes get a search vector
- text search ranks title matches first
- diet, time, cuisine, category and exclusion filters
- RLS: a user sees only their own rows, and inserting a row for another user is rejected
- the signup trigger creates profiles

Not verified against a live Supabase project: PostgREST embedding on the RPC result, Auth email flows, and storage uploads.

## Changing the schema

Add a new timestamped file in `supabase/migrations/`. Don't edit the initial migration once it has been applied anywhere. Update this document in the same change.
