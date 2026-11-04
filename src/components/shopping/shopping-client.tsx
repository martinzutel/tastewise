"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckIcon, ListChecksIcon, Trash2Icon, XIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHOPPING_CATEGORY_LABELS } from "@/lib/constants";
import { formatAmount, formatList } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SHOPPING_CATEGORIES, type ShoppingItem } from "@/lib/types";
import { useUserData } from "@/lib/user-data/provider";
import { AddItemForm } from "./add-item-form";

export function ShoppingClient() {
  const { data, status, addToShoppingList, updateShoppingItem, removeShoppingItems } = useUserData();
  const [confirmClear, setConfirmClear] = useState(false);
  const items = data.shopping;
  const done = items.filter((i) => i.completed);
  const progress = items.length ? Math.round((done.length / items.length) * 100) : 0;

  const groups = useMemo(
    () =>
      SHOPPING_CATEGORIES.map((cat) => ({
        cat,
        // Bought items sink to the bottom of their aisle.
        items: items
          .filter((i) => i.category === cat)
          .sort((a, b) => Number(a.completed) - Number(b.completed) || a.name.localeCompare(b.name)),
      })).filter((g) => g.items.length),
    [items],
  );

  if (status === "loading") {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-paper-2" role="status" aria-label="Loading your shopping list" />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AddItemForm
        onAdd={(v) =>
          addToShoppingList([
            { ingredientId: null, name: v.name, quantity: v.quantity, unit: v.unit || null, category: v.category },
          ])
        }
      />

      {items.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={ListChecksIcon}
          title="Nothing to buy yet"
          description="Add ingredients from any recipe with one tap, or type items in above. Matching ingredients are combined automatically."
        >
          <Button asChild>
            <Link href="/recipes">Browse recipes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pantry">Check your pantry</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-ink" aria-live="polite">
                <span className="font-semibold tabular-nums">{done.length}</span> of{" "}
                <span className="tabular-nums">{items.length}</span> bought
              </p>
              <div className="flex gap-1">
                {done.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => removeShoppingItems(done.map((i) => i.id))}>
                    <CheckIcon aria-hidden />
                    Clear bought
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-ink-muted">
                  <Trash2Icon aria-hidden />
                  Clear list
                </Button>
              </div>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-3"
              role="progressbar"
              aria-label="Shopping progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-sage transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && <p className="mt-3 text-sm font-medium text-sage-ink">Everything’s in the basket.</p>}
          </div>

          <div className="mt-6 space-y-10">
            {groups.map((g) => (
              <section key={g.cat} aria-labelledby={`aisle-${g.cat}`}>
                <h2 id={`aisle-${g.cat}`} className="flex items-baseline gap-3 border-b border-line pb-2">
                  <span className="font-display text-[1.7rem] leading-none text-ink">
                    {SHOPPING_CATEGORY_LABELS[g.cat]}
                  </span>
                  <span className="text-xs text-ink-faint tabular-nums">
                    {g.items.filter((i) => !i.completed).length} left
                  </span>
                </h2>
                <ul className="divide-y divide-line">
                  {g.items.map((item) => (
                    <ShoppingRow
                      key={item.id}
                      item={item}
                      onToggle={() => updateShoppingItem(item.id, { completed: !item.completed })}
                      onRemove={() => removeShoppingItems([item.id])}
                      onQuantity={(quantity) => updateShoppingItem(item.id, { quantity })}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="font-display text-2xl font-medium">Clear your whole list?</DialogTitle>
          <DialogDescription>
            This removes all {items.length} items, including ones you haven’t bought yet. It can’t be undone.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep list</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                removeShoppingItems(items.map((i) => i.id));
                setConfirmClear(false);
              }}
            >
              Clear list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onRemove,
  onQuantity,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
  onQuantity: (q: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.quantity?.toString() ?? "");
  const amount = formatAmount(item.quantity, item.unit);

  const commit = () => {
    setEditing(false);
    const n = value.trim() === "" ? null : Number(value);
    const q = n !== null && Number.isFinite(n) && n > 0 ? n : null;
    if (q !== item.quantity) onQuantity(q);
  };

  return (
    <li className="group flex items-center gap-3 py-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.completed}
        onClick={onToggle}
        className="flex min-h-14 flex-1 items-center gap-4 rounded-md px-1 text-left"
      >
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors",
            item.completed
              ? "border-sage bg-sage text-white"
              : "border-line-strong bg-surface group-hover:border-ink/40",
          )}
        >
          {item.completed && <CheckIcon className="size-3.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[1rem] text-ink transition-colors first-letter:uppercase",
              item.completed && "text-ink-faint line-through decoration-ink-faint/50",
            )}
          >
            {item.name}
          </span>
          {item.sources.length > 0 && (
            <span className="block truncate text-[0.78rem] text-ink-faint">For {formatList(item.sources)}</span>
          )}
        </span>
      </button>

      {editing ? (
        <span className="flex items-center gap-1">
          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label={`Quantity of ${item.name}`}
            className="h-9 w-20 rounded-sm border border-sage bg-surface px-2 text-right text-sm tabular-nums outline-none"
          />
          {item.unit && <span className="text-sm text-ink-muted">{item.unit}</span>}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setValue(item.quantity?.toString() ?? "");
            setEditing(true);
          }}
          className={cn(
            "h-9 shrink-0 rounded-sm px-2 text-sm tabular-nums transition-colors hover:bg-paper-2",
            amount ? "text-ink-muted" : "text-ink-faint",
            item.completed && "opacity-50",
          )}
          aria-label={amount ? `Edit quantity of ${item.name}, currently ${amount}` : `Add a quantity for ${item.name}`}
        >
          {amount || "Add qty"}
        </button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="text-ink-faint hover:text-ink"
      >
        <XIcon className="size-4" />
      </Button>
    </li>
  );
}
