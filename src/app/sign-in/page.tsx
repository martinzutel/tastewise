import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/common/page-header";
import { SignInForm } from "@/components/account/sign-in-form";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <Container className="max-w-md py-16">
      <h1 className="font-display text-headline text-ink">Sign in</h1>
      {isSupabaseConfigured ? (
        <>
          <p className="mt-3 text-ink-muted">
            Keep your saved recipes, pantry and shopping list in sync on every device.
          </p>
          {error === "confirmation" && (
            <p role="alert" className="mt-6 rounded-md bg-clay-wash px-4 py-3 text-sm text-clay-ink">
              That confirmation link has expired or was already used. Sign in, or create your account again.
            </p>
          )}
          <SignInForm />
        </>
      ) : (
        <>
          <p className="mt-3 text-ink-muted">
            Accounts aren’t switched on for this copy of Tastewise yet. Everything you save is kept in this browser, so
            you can use every feature without signing in.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            To enable accounts, add your Supabase project details to{" "}
            <code className="rounded-sm bg-paper-2 px-1">.env.local</code> as described in the README.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Back to Discover</Link>
          </Button>
        </>
      )}
    </Container>
  );
}
