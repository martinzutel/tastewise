import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-5 sm:px-8", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6 pt-7 pb-6 sm:pt-14 sm:pb-10", className)}>
      <div className="max-w-2xl">
        <h1 className="font-display text-headline text-ink">{title}</h1>
        {description && <p className="mt-2.5 text-[0.98rem] text-ink-muted sm:mt-3 sm:text-[1.02rem]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  className,
  id,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-7 flex items-end justify-between gap-6", className)}>
      <div>
        <h2 id={id} className="font-display text-title text-ink">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-[0.95rem] text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
