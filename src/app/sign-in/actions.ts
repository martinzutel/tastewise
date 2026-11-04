"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/schemas";

export interface AuthState {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  message?: string;
}

function parse(formData: FormData) {
  return signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
}

function fieldErrors(error: import("zod").ZodError): AuthState["fieldErrors"] {
  const out: AuthState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as "email" | "password";
    out[key] ??= issue.message;
  }
  return out;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Accounts aren't set up yet. Your data is saved in this browser." };
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "That email and password don't match an account. Check them and try again." };
  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Accounts aren't set up yet. Your data is saved in this browser." };
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: "Check your inbox for a link to confirm your email address." };
  redirect("/");
}

export async function signOut() {
  const supabase = await getServerSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}
