import type { Metadata } from "next";
import { DeckViewer } from "@/components/deck/deck-viewer";
import { DECK_DESCRIPTION, DECK_TITLE, loadSlides } from "@/content/deck";

export const metadata: Metadata = {
  title: DECK_TITLE,
  description: DECK_DESCRIPTION,
  // Shared by link only: keep it out of search results.
  robots: { index: false, follow: false },
  openGraph: { type: "article", title: `Tastewise: ${DECK_TITLE}`, description: DECK_DESCRIPTION },
  twitter: { card: "summary_large_image", title: `Tastewise: ${DECK_TITLE}`, description: DECK_DESCRIPTION },
};

export default function DeckPage() {
  return <DeckViewer slides={loadSlides()} />;
}
