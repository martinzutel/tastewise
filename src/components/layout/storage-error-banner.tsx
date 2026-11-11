"use client";

import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/lib/user-data/provider";

/** Shown when saved recipes, pantry and lists couldn't be loaded, so empty screens aren't mistaken for lost data. */
export function StorageErrorBanner() {
  const { status, retry } = useUserData();
  if (status !== "error") return null;

  return (
    <div role="alert" className="border-b border-clay/30 bg-clay-wash">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm text-clay-ink sm:px-8">
        <TriangleAlertIcon className="size-4 shrink-0" aria-hidden />
        <p className="flex-1">Your saved recipes, pantry and lists couldn’t be loaded. Nothing has been deleted.</p>
        <Button size="sm" variant="outline" className="border-clay/40 bg-surface" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  );
}
