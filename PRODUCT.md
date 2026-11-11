# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Phone first: most use happens on a phone, in the kitchen and at the store. Desktop is supported but secondary. (Mobile web, not a native app.)

## Users

**Primary: beginner cooks.** Students and young adults learning to cook. They often have a few ingredients and limited confidence, and want to know what they can realistically make tonight, what to buy, and how to follow a recipe without getting lost.

Their job: go from "what's in my kitchen?" to a finished meal, with as few decisions and as little waste as possible.

## Product Purpose

Tastewise helps people decide what to cook, cook it, and buy only what's missing. Success means a beginner opens the app with a half-empty fridge and leaves with a recipe they can make, a short shopping list, and the confidence to follow it.

The current release is an MVP foundation with no AI features. AI (conversational search, ingredient recognition from photos, recipe modification, a cooking assistant) is planned for a later phase and needs explicit approval before any of it is built.

## Positioning

**Cook from your pantry.** Tastewise starts from what you already have, not from an endless catalogue. For every recipe it shows how much of it you can make right now and exactly which ingredients are missing, then turns the missing ones into a shopping list. Matching is deterministic: required ingredients only, with staples (salt, pepper, water) and optional garnishes assumed.

## Operating Context

- Used one-handed on a phone: standing at the counter while cooking, or walking around a store while shopping.
- Core loop: pantry → matching recipes → recipe detail → shopping list → cooking with steps ticked off.
- Guests can use every feature without an account; data lives in the browser. Signing in (Supabase) syncs it across devices.
- Live at https://tastewise-two.vercel.app (Vercel). Source at github.com/martinzutel/tastewise.

## Capabilities and Constraints

- Implemented: Discover, Explore (search, filters, sort), recipe detail (serving scaling, ingredient and step checklists), pantry matching, saved recipes, a consolidating shopping list, rule-based preferences, optional Supabase accounts. See `docs/FEATURES.md`.
- Stack: Next.js 15 App Router, TypeScript, Tailwind 4, shadcn/ui, Supabase. See `docs/ARCHITECTURE.md`.
- No AI functionality without explicit approval. No fake or non-functional UI.
- Personalization is rule-based and must be described honestly. Never call it intelligent or learned.
- Out of scope for now: grocery integrations, ordering, social features, user-published recipes, payments, meal planning.
- Open: the seed catalogue (33 recipes) includes medium and advanced recipes. Whether to weight it further toward beginner-friendly cooking is undecided.

## Brand Commitments

- Name: Tastewise.
- Voice: plain, warm, encouraging, never condescending. American English, sentence case, verbs that say exactly what happens.
- The original brief pins the palette and type: warm paper `#F8F7F2`, ink `#252720`, sage `#73846A` and terracotta `#C47C55` accents; an editorial serif paired with a clean sans (currently Cormorant Garamond and Manrope). It also asks for an editorial, premium, food-photography-led feel and no generic SaaS or AI-chatbot look.

## Evidence on Hand

- 33 seed recipes and 148 ingredients in `src/data/seed/`, with realistic quantities, steps, tips and substitutions.
- Food photography: Unsplash photos, each matched to its recipe by hand.
- Ratings and review counts are sample data and are labelled as such. There are no real users, reviews, testimonials, press or usage numbers yet. Don't fabricate any.
- Nutrition values are estimates, labelled as estimated.

## Product Principles

1. **Start from the kitchen, not the catalogue.** What you have comes first; discovery serves that.
2. **Always show what's missing.** Never make a beginner guess whether they can cook something.
3. **One hand, one step at a time.** Every cooking and shopping interaction works on a phone, mid-task.
4. **Honest by default.** Sample data is labelled, estimates say so, and rule-based features don't pretend to be smart.
5. **Fewer, clearer choices.** A short, good set of options beats an endless list.

## Accessibility & Inclusion

WCAG 2.1 AA as the floor. Large touch targets (at least 40 px on phones), 16 px form text so iOS doesn't zoom, visible focus, reduced-motion support, and labels that work for people new to cooking terms.
