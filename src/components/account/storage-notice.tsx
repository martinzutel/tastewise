"use client";

import Link from "next/link";
import { CloudIcon, MonitorSmartphoneIcon } from "lucide-react";
import { useUserData } from "@/lib/user-data/provider";

export function StorageNotice({ authEnabled }: { authEnabled: boolean }) {
  const { storage, user } = useUserData();

  if (storage === "supabase") {
    return (
      <p className="flex items-start gap-2.5 rounded-lg bg-sage-wash px-4 py-3 text-sm text-sage-ink">
        <CloudIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        Signed in as {user?.email}. Your recipes, pantry and lists sync across devices.
      </p>
    );
  }

  return (
    <p className="flex items-start gap-2.5 rounded-lg bg-paper-2 px-4 py-3 text-sm text-ink-muted">
      <MonitorSmartphoneIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="flex flex-wrap gap-x-2.5 gap-y-1">
        <span>Everything you save is stored in this browser.</span>
        {authEnabled && (
          <Link href="/sign-in" className="font-medium text-sage-ink underline-offset-4 hover:underline">
            Sign in to sync across devices
          </Link>
        )}
      </span>
    </p>
  );
}
