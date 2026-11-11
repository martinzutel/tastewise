"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";
import { Wordmark } from "@/components/layout/wordmark";

const SLIDE_W = 1920;

/**
 * Shows the deck's fixed 1920×1080 slides as a vertical scroll, each scaled
 * to the screen width. "Save as PDF" uses the browser's print dialog, with
 * print styles in globals.css that put one slide on each landscape page.
 */
export function DeckViewer({ slides }: { slides: { id: string; html: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SLIDE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="deck-page min-h-dvh bg-paper-3">
      <header className="deck-chrome sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" aria-label="Open the Tastewise app">
            <Wordmark className="[&_span]:text-[1.4rem]" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-10 items-center rounded-md px-3 text-sm text-ink-muted hover:bg-paper-2 hover:text-ink sm:inline-flex"
            >
              Open the app
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3.5 text-sm font-medium text-paper hover:bg-ink/88"
            >
              <DownloadIcon className="size-4" aria-hidden />
              Save as PDF
            </button>
          </div>
        </div>
      </header>

      <p className="deck-chrome flex items-center justify-center gap-2 px-4 pt-4 text-center text-[0.82rem] text-ink-muted sm:hidden">
        <RotateCcwIcon className="size-3.5 shrink-0" aria-hidden />
        Turn your phone sideways for bigger slides.
      </p>

      <main className="mx-auto max-w-[1280px] px-2 py-4 sm:px-6 sm:py-8">
        <div ref={ref} className="deck-slides flex flex-col gap-3 sm:gap-6">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="deck-frame relative overflow-hidden rounded-md shadow-[0_8px_30px_-12px_rgb(37_39_32/0.25)] sm:rounded-lg"
              style={{ aspectRatio: "16 / 9" }}
              aria-label={`Slide ${i + 1} of ${slides.length}`}
              role="group"
            >
              <div
                className="deck-slide absolute top-0 left-0 origin-top-left"
                style={{ width: SLIDE_W, height: 1080, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
