import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Empty screens point to the next action instead of just saying "nothing here". */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-paper-2 text-sage-ink">
        <Icon className="size-6" strokeWidth={1.6} aria-hidden />
      </span>
      <h2 className="font-display mt-5 text-[1.9rem] leading-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-[0.95rem] text-ink-muted">{description}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
