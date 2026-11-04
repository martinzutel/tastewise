# Project Instructions

Before making changes:

1. Read the relevant documentation in /docs.
2. Understand the existing architecture.
3. Inspect related components before modifying them.

## Documentation Rules

- Keep documentation synchronized with the codebase.
- Update FEATURES.md when implementing or changing features.
- Update ARCHITECTURE.md when making architectural decisions.
- Update DATABASE.md when modifying database structures.
- Record important decisions in DEVELOPMENT_LOG.md.
- Update ROADMAP.md when priorities change.

## Development Principles

- Follow the established design system.
- Maintain responsive behavior.
- Avoid unnecessary dependencies.
- Write modular, maintainable TypeScript.
- Never introduce AI functionality without explicit approval.
- Never implement fake or non-functional UI elements.
- Preserve existing functionality when modifying components.

## Project-specific notes

- Seed recipes live in `src/data/seed/`. After editing them, run `npm run db:seed:generate` to regenerate `supabase/seed.sql`.
- Diet labels are derived from ingredient markers (`src/lib/services/diet.ts`), never hand-tagged on recipes.
- Copy uses American English and sentence case. No all-caps labels.
- Design tokens are defined once in `src/app/globals.css`. Use the token utilities (`bg-paper`, `text-ink-muted`, `text-sage-ink`…) rather than raw hex values.
