"use client";

import Link from "next/link";
import { CloudIcon, MonitorSmartphoneIcon } from "lucide-react";
import { useUserData } from "@/lib/user-data/provider";

export function StorageNotice({ authEnabled }: { authEnabled: boolean }) {
  const { storage, user } = useUserData();

  if (storage === "supabase") {
    return (
      <p className="flex items-center gap-2.5 rounded-lg bg-sage-wash px-4 py-3 text-sm text-sage-ink">
        <CloudIcon className="size-4 shrink-0" aria-hidden />
        Signed in as {user?.email}. Your recipes, pantry and lists sync across devices.
      </p>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-2.5 rounded-lg bg-paper-2 px-4 py-3 text-sm text-ink-muted">
      <MonitorSmartphoneIcon className="size-4 shrink-0" aria-hidden />
      <span>Everything you save is stored in this browser.</span>
      {authEnabled && (
        <Link href="/sign-in" className="font-medium text-sage-ink underline-offset-4 hover:underline">
          Sign in to sync across devices
        </Link>
      )}
    </p>
  );
}
