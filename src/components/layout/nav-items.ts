import { BookmarkIcon, CompassIcon, type LucideIcon, ListChecksIcon, SearchIcon, WheatIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Extra path prefixes that should mark this item active. */
  match?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Discover", short: "Discover", icon: CompassIcon },
  { href: "/recipes", label: "Explore recipes", short: "Explore", icon: SearchIcon },
  { href: "/pantry", label: "My pantry", short: "Pantry", icon: WheatIcon },
  { href: "/saved", label: "Saved", short: "Saved", icon: BookmarkIcon },
  { href: "/shopping-list", label: "Shopping list", short: "List", icon: ListChecksIcon },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
