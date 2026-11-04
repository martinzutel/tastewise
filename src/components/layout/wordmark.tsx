import { cn } from "@/lib/utils";

/** Serif wordmark with a small leaf mark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 text-ink", className)}>
      <svg viewBox="0 0 24 24" aria-hidden className="size-[22px] text-sage" fill="none">
        <path
          d="M5 19c0-8 5-13.5 14-14-0.3 9-5.6 14-14 14Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M5 19 13.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[1.65rem] leading-none tracking-[-0.01em]">Tastewise</span>
    </span>
  );
}
