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
    // Scroll-spy: the active section is the last one whose top has passed under the sticky bars.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 150;
      let current: string = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
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
