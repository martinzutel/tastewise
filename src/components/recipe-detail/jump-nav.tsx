"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "ingredients", label: "Ingredients" },
  { id: "method", label: "Method" },
  { id: "nutrition", label: "Nutrition" },
] as const;

/**
 * Phone-only bar that stays under the header while cooking, so ingredients
 * and method are always one tap apart. Highlights the section in view.
 */
export function RecipeJumpNav() {
  const [active, setActive] = useState<string>("ingredients");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Recipe sections"
      className="sticky top-[var(--header-h)] z-20 -mx-5 mt-6 border-y border-line bg-paper/95 px-5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:hidden"
    >
      <ul className="grid grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              onClick={() => setActive(s.id)}
              className={cn(
                "relative flex h-12 items-center justify-center text-[0.9rem] transition-colors",
                active === s.id ? "font-semibold text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-6 -bottom-px h-[2px] bg-sage transition-opacity",
                  active === s.id ? "opacity-100" : "opacity-0",
                )}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
