import Link from "next/link";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line pb-28 lg:pb-0">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm text-ink-muted">
            A recipe companion for everyday cooking. Find something to make, cook from what you have, and keep the
            recipes you love.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <ul className="space-y-2.5">
            <li>
              <Link className="text-ink-muted hover:text-ink" href="/recipes">
                Explore recipes
              </Link>
            </li>
            <li>
              <Link className="text-ink-muted hover:text-ink" href="/pantry">
                Cook from your pantry
              </Link>
            </li>
            <li>
              <Link className="text-ink-muted hover:text-ink" href="/account">
                Preferences
              </Link>
            </li>
          </ul>
        </nav>
        <p className="text-xs leading-relaxed text-ink-muted">
          Ratings shown are sample data for this preview, not real reviews. Nutrition values are estimates. Food
          photography from Unsplash.
        </p>
      </div>
    </footer>
  );
}
