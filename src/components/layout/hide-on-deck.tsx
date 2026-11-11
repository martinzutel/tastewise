"use client";

import { usePathname } from "next/navigation";

/** The shared deck at /deck is a standalone page: no app header, tab bar or footer. */
export function HideOnDeck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/deck" || pathname?.startsWith("/deck/")) return null;
  return <>{children}</>;
}
