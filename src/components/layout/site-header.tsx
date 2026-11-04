"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserData } from "@/lib/user-data/provider";
import { AccountMenu } from "./account-menu";
import { NAV_ITEMS, isActive } from "./nav-items";
import { SearchDialog } from "./search-dialog";
import { Wordmark } from "./wordmark";

export function SiteHeader({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();
  const { data } = useUserData();
  const remaining = data.shopping.filter((i) => !i.completed).length;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/92 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1360px] items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0 rounded-sm" aria-label="Tastewise, go to Discover">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-2 rounded-md px-3 text-[0.9rem] text-ink-muted transition-colors hover:text-ink",
                      active && "text-ink",
                    )}
                  >
                    {item.label}
                    {item.href === "/shopping-list" && remaining > 0 && (
                      <span className="rounded-sm bg-clay-wash px-1.5 text-xs font-semibold text-clay-ink tabular-nums">
                        {remaining}
                        <span className="sr-only"> items to buy</span>
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-[calc((var(--header-h)-2.5rem)/2+1px)] h-[2px] origin-left scale-x-0 bg-sage transition-transform duration-300",
                        active && "scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <AccountMenu authEnabled={authEnabled} />
        </div>
      </div>
    </header>
  );
}
