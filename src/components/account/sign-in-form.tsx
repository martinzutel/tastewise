"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {});
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = signingIn || signingUp;

  return (
    <form action={mode === "sign-in" ? signInAction : signUpAction} noValidate className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 outline-none focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)] aria-invalid:border-destructive"
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-[0.85rem] text-destructive">
            {state.fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={8}
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 outline-none focus:border-sage focus:shadow-[0_0_0_3px_var(--sage-wash)] aria-invalid:border-destructive"
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="mt-1.5 text-[0.85rem] text-destructive">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-clay-wash px-4 py-3 text-sm text-clay-ink">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="rounded-md bg-sage-wash px-4 py-3 text-sm text-sage-ink">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "One moment…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        {mode === "sign-in" ? "New to Tastewise?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="font-medium text-sage-ink underline-offset-4 hover:underline"
        >
          {mode === "sign-in" ? "Create an account" : "Sign in instead"}
        </button>
      </p>
    </form>
  );
}
