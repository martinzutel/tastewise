"use client";

/* eslint-disable @next/next/no-img-element -- tiny thumbnails, already sized by the CDN */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatMinutes } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";

/** Quick search from anywhere (also opened with ⌘K / Ctrl+K). Uses the /api/recipes route handler. */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setState("idle");
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch(`/api/recipes?q=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { recipes: RecipeSummary[] };
        setResults(body.recipes);
        setState("done");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setState("error");
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/recipes?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-md px-2.5 text-sm text-ink-muted transition-colors hover:bg-paper-2 hover:text-ink sm:border sm:border-line sm:bg-surface/60 sm:pr-2 sm:pl-3"
        aria-label="Search recipes"
      >
        <SearchIcon className="size-[18px]" aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-3 hidden rounded-sm border border-line bg-paper px-1.5 font-sans text-[0.7rem] text-ink-faint md:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Search recipes</DialogTitle>
          <DialogDescription className="sr-only">
            Search by recipe name, ingredient, cuisine or category.
          </DialogDescription>
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-5">
            <SearchIcon className="size-5 shrink-0 text-ink-faint" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  listRef.current?.querySelector("a")?.focus();
                }
              }}
              placeholder="Recipe, ingredient or cuisine"
              aria-label="Search recipes"
              className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-ink-faint"
            />
            {state === "loading" && <Loader2Icon className="size-4 animate-spin text-ink-faint" aria-hidden />}
          </form>

          <div className="max-h-[60vh] overflow-y-auto" aria-live="polite">
            {state === "idle" && (
              <p className="px-5 py-6 text-sm text-ink-muted">
                Try “tomato”, “quick dinner” or “Japanese”. Press Enter to see every match.
              </p>
            )}
            {state === "error" && (
              <p className="px-5 py-6 text-sm text-destructive">Search isn’t responding. Try again in a moment.</p>
            )}
            {state === "done" && results.length === 0 && (
              <p className="px-5 py-6 text-sm text-ink-muted">
                No recipes match “{q.trim()}”. Try a single ingredient.
              </p>
            )}
            {results.length > 0 && (
              <ul
                ref={listRef}
                className="p-2"
                onKeyDown={(e) => {
                  const links = [...(listRef.current?.querySelectorAll("a") ?? [])];
                  const i = links.indexOf(document.activeElement as HTMLAnchorElement);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    links[Math.min(i + 1, links.length - 1)]?.focus();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (i <= 0)
                      (e.currentTarget.closest("[role=dialog]")?.querySelector("input") as HTMLElement)?.focus();
                    else links[i - 1]?.focus();
                  }
                }}
              >
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/recipes/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 rounded-md p-2 outline-none hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
                    >
                      <img
                        src={r.imageUrl.replace("w=1200", "w=120")}
                        alt=""
                        className="size-12 shrink-0 rounded-sm object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="block text-sm text-ink-muted">
                          {r.cuisine}, {formatMinutes(r.totalTime)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/recipes?q=${encodeURIComponent(q.trim())}`}
                    onClick={() => setOpen(false)}
                    className="mt-1 block rounded-md px-2 py-3 text-sm font-medium text-sage-ink outline-none hover:bg-paper-2 focus-visible:bg-paper-2"
                  >
                    See all results for “{q.trim()}”
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
