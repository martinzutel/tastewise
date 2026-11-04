import Image from "next/image";
import Link from "next/link";

export interface CategoryLink {
  label: string;
  href: string;
  count: number;
  imageUrl: string;
}

/** A typographic index rather than another grid of cards. */
export function CategoryIndex({ categories }: { categories: CategoryLink[] }) {
  return (
    <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c) => (
        <li key={c.href} className="border-b border-line sm:odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0">
          <Link
            href={c.href}
            className="group flex items-center gap-5 px-1 py-5 transition-colors hover:bg-paper-2 sm:px-5 lg:py-7"
          >
            <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-paper-3">
              <Image
                src={c.imageUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="min-w-0">
              <span className="font-display block text-[1.75rem] leading-none text-ink">{c.label}</span>
              <span className="mt-1.5 block text-sm text-ink-muted">{c.count} recipes</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
