"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PantryItem } from "@/lib/types";

/** One pantry ingredient with an optional, inline-editable quantity and unit. Saves on blur or Enter. */
export function PantryRow({
  item,
  onRemove,
  onChange,
}: {
  item: PantryItem;
  onRemove: () => void;
  onChange: (patch: Partial<Pick<PantryItem, "quantity" | "unit">>) => void;
}) {
  const [qty, setQty] = useState(item.quantity?.toString() ?? "");
  const [unit, setUnit] = useState(item.unit ?? "");

  const commit = () => {
    const n = qty.trim() === "" ? null : Number(qty);
    const quantity = n !== null && Number.isFinite(n) && n > 0 ? n : null;
    if (quantity === null && qty.trim() !== "") setQty("");
    const u = unit.trim() || null;
    if (quantity !== item.quantity || u !== item.unit) onChange({ quantity, unit: u });
  };

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="min-w-0 flex-1 truncate text-[0.95rem] text-ink first-letter:uppercase">{item.name}</span>
      <input
        inputMode="decimal"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        placeholder="Qty"
        aria-label={`Quantity of ${item.name}`}
        className="h-10 w-14 rounded-sm border border-transparent bg-transparent px-2 text-right text-sm tabular-nums transition-colors outline-none placeholder:text-ink-faint hover:border-line focus:border-sage focus:bg-surface sm:h-9"
      />
      <input
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        placeholder="unit"
        aria-label={`Unit for ${item.name}`}
        className="h-10 w-14 rounded-sm border border-transparent bg-transparent px-2 text-sm transition-colors outline-none placeholder:text-ink-faint hover:border-line focus:border-sage focus:bg-surface sm:h-9"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="text-ink-faint hover:text-ink"
      >
        <XIcon className="size-4" />
      </Button>
    </li>
  );
}
