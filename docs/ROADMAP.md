# Roadmap

## Now: MVP foundation (done)

Discovery, search and filters, recipe detail with scaling, pantry matching, saved recipes, shopping list, preferences, optional Supabase accounts.

## Next: finish the foundation

1. **Verify against a live Supabase project**: run the migration and seed, confirm RPC embedding, the auth email flow and avatar upload. Add generated database types (`supabase gen types`).
2. **Guest to account migration**: when a guest signs in, offer to copy their browser data into the account.
3. **Automated tests**: unit tests for `services/` and `format.ts` (pure, easy wins), and Playwright smoke tests per page.
4. **Pantry quantity awareness**: today matching is by presence only. Use quantities where both sides have compatible units.
5. **Collections** for saved recipes.
6. **Recipe images in Supabase Storage** or an image CDN with stable URLs, instead of Unsplash hotlinks.

## Later: AI phase (requires explicit approval)

See the integration seams in [ARCHITECTURE.md](ARCHITECTURE.md#future-ai-integration-points).

- Conversational recipe discovery ("something sweet, easy, no oven") → `RecipeQuery`.
- Image-based ingredient recognition → pantry items.
- Recipe modification (higher protein, vegetarian, swap butter for olive oil).
- Learned recommendations from saves, cooking history and ratings.
- In-recipe cooking assistant.

## Explicitly out of scope for now

Grocery integrations and price comparison, maps, ordering, social features, public profiles, user-published recipes, subscriptions and payments, advanced meal planning.
