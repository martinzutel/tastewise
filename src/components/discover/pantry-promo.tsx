import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatList } from "@/lib/format";
import type { PantryMatch } from "@/lib/services/pantry-matching";

/**
 * Entry point to the pantry feature. The example is computed by the real
 * matching service against a small sample pantry, so it shows exactly what
 * the feature does.
 */
export function PantryPromo({ sample, matches }: { sample: string[]; matches: PantryMatch[] }) {
  return (
    <section className="bg-paper-2" aria-labelledby="pantry-promo-title">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20 lg:py-24">
        <div className="max-w-lg">
          <h2 id="pantry-promo-title" className="font-display text-headline text-ink">
            Cook with what you have
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-muted">
            Tell Tastewise what’s in your kitchen. Every recipe shows how much of it you can already make and exactly
            what’s missing, so a half-empty fridge still turns into dinner.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/pantry">Open your pantry</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <p className="text-sm text-ink-muted">
            With <span className="text-ink">{formatList(sample)}</span> you could make:
          </p>
          <ul className="mt-6 divide-y divide-line">
            {matches.map((m) => (
              <li key={m.recipe.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-4">
                  <Link
                    href={`/recipes/${m.recipe.slug}`}
                    className="font-display text-[1.4rem] leading-tight text-ink hover:text-sage-ink"
                  >
                    {m.recipe.title}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold text-sage-ink tabular-nums">{m.percent}%</span>
                </div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${m.percent}%` }} />
                </div>
                <p className="mt-2 text-[0.82rem] text-ink-muted">
                  {m.missing.length === 0
                    ? "You have everything"
                    : `Missing: ${formatList(m.missing.map((x) => x.name))}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
