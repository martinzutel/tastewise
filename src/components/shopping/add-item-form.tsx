"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SHOPPING_CATEGORY_LABELS } from "@/lib/constants";
import { SHOPPING_CATEGORIES, type ShoppingCategory } from "@/lib/types";
import {
  shoppingItemFormSchema,
  type ShoppingItemFormInput,
  type ShoppingItemFormValues,
} from "@/lib/validation/schemas";

export function AddItemForm({ onAdd }: { onAdd: (values: ShoppingItemFormValues) => void }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
    formState: { errors },
  } = useForm<ShoppingItemFormInput, unknown, ShoppingItemFormValues>({
    resolver: zodResolver(shoppingItemFormSchema),
    defaultValues: { name: "", quantity: null, unit: "", category: "other" },
  });

  const category = watch("category");
  // On phones the quantity, unit and aisle fields appear once you start typing, keeping the list in view.
  const hasName = (watch("name") ?? "").trim().length > 0;

  const submit = handleSubmit((values) => {
    onAdd(values);
    reset({ name: "", quantity: null, unit: "", category: values.category });
    setFocus("name");
  });

  return (
    <form onSubmit={submit} noValidate className="rounded-lg border border-line bg-surface p-3">
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_5rem_5rem_11rem_auto]">
        <div className="order-1 sm:order-none">
          <label htmlFor="item-name" className="sr-only">
            Item
          </label>
          <input
            id="item-name"
            {...register("name")}
            placeholder="Add an item"
            enterKeyHint="done"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "item-name-error" : undefined}
            className="h-11 w-full rounded-md border border-line px-3 text-[0.95rem] outline-none placeholder:text-ink-faint focus:border-sage aria-invalid:border-destructive"
          />
        </div>
        <div
          className={cn(
            "order-3 col-span-2 grid grid-cols-[5rem_5rem_1fr] gap-2 sm:order-none sm:col-span-1 sm:contents",
            !hasName && "max-sm:hidden",
          )}
        >
          <div>
            <label htmlFor="item-qty" className="sr-only">
              Quantity
            </label>
            <input
              id="item-qty"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              {...register("quantity", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })}
              placeholder="Qty"
              aria-invalid={!!errors.quantity}
              className="h-11 w-full rounded-md border border-line px-3 text-[0.95rem] tabular-nums outline-none placeholder:text-ink-faint focus:border-sage aria-invalid:border-destructive"
            />
          </div>
          <div>
            <label htmlFor="item-unit" className="sr-only">
              Unit
            </label>
            <input
              id="item-unit"
              {...register("unit")}
              placeholder="Unit"
              className="h-11 w-full rounded-md border border-line px-3 text-[0.95rem] outline-none placeholder:text-ink-faint focus:border-sage"
            />
          </div>
          <Select value={category} onValueChange={(v) => setValue("category", v as ShoppingCategory)}>
            <SelectTrigger className="h-11! w-full border-line" aria-label="Aisle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHOPPING_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {SHOPPING_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="order-2 h-11 sm:order-none">
          <PlusIcon aria-hidden />
          Add
        </Button>
      </div>
      {(errors.name || errors.quantity || errors.unit) && (
        <p id="item-name-error" role="alert" className="mt-2 px-1 text-[0.82rem] text-destructive">
          {errors.name?.message ?? errors.quantity?.message ?? errors.unit?.message}
        </p>
      )}
    </form>
  );
}
