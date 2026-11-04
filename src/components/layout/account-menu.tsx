"use client";

import Link from "next/link";
import { LogInIcon, LogOutIcon, SlidersHorizontalIcon } from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserData } from "@/lib/user-data/provider";
import { Avatar } from "@/components/common/avatar";

export function AccountMenu({ authEnabled }: { authEnabled: boolean }) {
  const { data, user, storage } = useUserData();
  const displayName = data.profile.name || user?.email || "Your kitchen";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        aria-label="Account and preferences"
      >
        <Avatar name={data.profile.name} src={data.profile.avatarUrl} size={36} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64">
        <DropdownMenuLabel className="py-2">
          <span className="block truncate text-sm font-semibold text-ink">{displayName}</span>
          <span className="block text-xs font-normal text-ink-muted">
            {storage === "supabase" ? "Synced to your account" : "Saved in this browser"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <SlidersHorizontalIcon aria-hidden />
            Profile and preferences
          </Link>
        </DropdownMenuItem>
        {authEnabled &&
          (user ? (
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOutIcon aria-hidden />
              Sign out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/sign-in">
                <LogInIcon aria-hidden />
                Sign in to sync
              </Link>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
