"use client";

import Link from "next/link";
import { BookmarkIcon, ListChecksIcon, SearchIcon, WheatIcon, type LucideIcon } from "lucide-react";
import { plural } from "@/lib/format";
import { useUserData } from "@/lib/user-data/provider";

interface Job {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  status?: string | null;
}

/**
 * States plainly what the product does, using the same icons as the
 * navigation so the tab bar reads as a map of these four jobs. Once the
 * visitor has data, each entry also shows where they stand.
 */
export function WhatYouCanDo({ recipeCount }: { recipeCount: number }) {
  const { data, status } = useUserData();
  const ready = status === "ready";
  const toBuy = data.shopping.filter((i) => !i.completed).length;

  const jobs: Job[] = [
    {
      href: "/recipes",
      icon: SearchIcon,
      title: "Find a recipe",
      description: `Search ${recipeCount} recipes by craving, ingredient, diet or time.`,
    },
    {
      href: "/pantry",
      icon: WheatIcon,
      title: "Cook from your pantry",
      description: "Add what you have and see what you can make right now.",
      status: ready && data.pantry.length ? `${plural(data.pantry.length, "ingredient")} in your pantry` : null,
    },
    {
      href: "/saved",
      icon: BookmarkIcon,
      title: "Keep a cookbook",
      description: "Save the recipes you love and find them again in seconds.",
      status: ready && data.favorites.length ? `${plural(data.favorites.length, "recipe")} saved` : null,
    },
    {
      href: "/shopping-list",
      icon: ListChecksIcon,
      title: "Shop with one list",
      description: "Add ingredients from any recipe. Duplicates are combined by aisle.",
      status: ready && toBuy ? `${plural(toBuy, "item")} to buy` : null,
    },
  ];

  return (
    <nav aria-label="What you can do with Tastewise" className="border-y border-line">
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {jobs.map((job, i) => {
          const Icon = job.icon;
          return (
            <li
              key={job.href}
              className={
                // Hairline dividers between cells, in a 2×2 grid on phones and one row on desktop.
                [
                  i % 2 === 0 ? "border-r border-line" : "",
                  i < 2 ? "border-b border-line lg:border-b-0" : "",
                  i === 1 ? "lg:border-r" : "",
                ].join(" ")
              }
            >
              <Link
                href={job.href}
                className="group flex h-full flex-col gap-2 p-4 transition-colors hover:bg-paper-2 sm:p-6 lg:gap-3 lg:px-7 lg:py-8"
              >
                <Icon className="size-5 text-sage-ink" strokeWidth={1.7} aria-hidden />
                <span className="text-[0.95rem] leading-snug font-semibold text-ink sm:text-base">{job.title}</span>
                <span className="text-[0.82rem] leading-snug text-ink-muted sm:text-[0.9rem]">{job.description}</span>
                {job.status && (
                  <span className="mt-auto pt-1 text-[0.78rem] font-medium text-clay-ink">{job.status}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
