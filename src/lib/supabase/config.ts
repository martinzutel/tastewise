/**
 * Supabase is optional during development. Without these variables the app
 * runs in demo mode: recipes come from the bundled seed data and personal
 * data (favorites, pantry, shopping list, preferences) lives in the browser.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
