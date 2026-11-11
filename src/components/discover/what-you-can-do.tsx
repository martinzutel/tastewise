"use client";

import Link from "next/link";
import { useMemo } from "react";
import { plural } from "@/lib/format";
import { matchPantry } from "@/lib/services/pantry-matching";
import type { RecipeSummary } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";

interface Step {
  href: string;
  title: string;
  description: string;
  status: string | null;
}

/**
 * The product's core loop, in order: pantry first, then recipes, shopping and
 * cooking. The numbers are a real sequence. Once the visitor has data, each
 * step says where they stand, so the strip doubles as a progress view.
 */
export function WhatYouCanDo({ recipes }: { recipes: RecipeSummary[] }) {
  const { data, status } = useUserData();
  const ready = status === "ready";

  const matchCount = useMemo(
    () => (data.pantry.length ? matchPantry(recipes, new Set(data.pantry.map((p) => p.ingredientId))).length : 0),
    [recipes, data.pantry],
  );
  const toBuy = data.shopping.filter((i) => !i.completed).length;

  const steps: Step[] = [
    {
      href: "/pantry",
      title: "Add what you have",
      description: "List what's in your fridge and cupboards. No exact amounts needed.",
      status: ready && data.pantry.length ? `${plural(data.pantry.length, "ingredient")} so far` : null,
    },
    {
      href: "/pantry",
      title: "See what you can cook",
      description: "Every recipe shows how much you already have and what's missing.",
      status: ready && matchCount ? `${plural(matchCount, "recipe")} use what you have` : null,
    },
    {
      href: "/shopping-list",
      title: "Shop for what's missing",
      description: "Add missing ingredients to one list, combined and sorted by aisle.",
      status: ready && toBuy ? `${plural(toBuy, "item")} to buy` : null,
    },
    {
      href: "/saved",
      title: "Cook step by step",
      description: "Tick off ingredients and steps as you go. Save the ones you love.",
      status: ready && data.favorites.length ? `${plural(data.favorites.length, "recipe")} saved` : null,
    },
  ];

  return (
    <nav aria-labelledby="how-it-works" className="border-y border-line">
      <h2 id="how-it-works" className="sr-only">
        How Tastewise works
      </h2>
      <ol className="grid grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={[
              // Hairline dividers: a 2×2 grid on phones, one row on desktop.
              i % 2 === 0 ? "border-r border-line" : "",
              i < 2 ? "border-b border-line lg:border-b-0" : "",
              i === 1 ? "lg:border-r" : "",
            ].join(" ")}
          >
            <Link
              href={step.href}
              className="group flex h-full flex-col p-4 transition-colors hover:bg-paper-2 sm:p-6 lg:px-7 lg:py-8"
            >
              <span
                aria-hidden
                className="font-display text-[2.4rem] leading-[0.8] text-clay lining-nums transition-colors group-hover:text-clay-ink sm:text-[2.8rem]"
              >
                {i + 1}
              </span>
              <span className="mt-3 text-[0.95rem] leading-snug font-semibold text-ink sm:mt-4 sm:text-base">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </span>
              <span className="mt-1.5 text-[0.82rem] leading-snug text-ink-muted sm:text-[0.9rem]">
                {step.description}
              </span>
              {step.status && (
                <span className="mt-auto pt-3 text-[0.78rem] font-medium text-sage-ink">{step.status}</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
