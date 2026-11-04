"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserData } from "@/lib/user-data/provider";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Bottom tab bar for phones and small tablets, within thumb reach. */
export function MobileNav() {
  const pathname = usePathname();
  const { data } = useUserData();
  const remaining = data.shopping.filter((i) => !i.completed).length;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-ink-muted transition-colors",
                  active && "text-ink",
                )}
              >
                <span className="relative">
                  <Icon className={cn("size-[22px]", active ? "stroke-[2]" : "stroke-[1.6]")} aria-hidden />
                  {item.href === "/shopping-list" && remaining > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] rounded-sm bg-clay-ink px-1 text-center text-[0.65rem] leading-[18px] font-semibold text-white tabular-nums">
                      {remaining}
                      <span className="sr-only"> items to buy</span>
                    </span>
                  )}
                </span>
                {item.short}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-[2px] w-8 bg-sage transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
