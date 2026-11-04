/* eslint-disable @next/next/no-img-element -- avatars may be data URLs or storage URLs */
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src: string | null;
  size?: number;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage-wash text-sage-ink",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : initial ? (
        <span className="font-display leading-none" style={{ fontSize: size * 0.5 }} aria-hidden>
          {initial}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden style={{ width: size * 0.5 }} fill="none" stroke="currentColor">
          <circle cx="12" cy="8.5" r="3.5" strokeWidth="1.6" />
          <path d="M5 19.5c1.4-3.3 4-5 7-5s5.6 1.7 7 5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}
