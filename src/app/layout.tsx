import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StorageErrorBanner } from "@/components/layout/storage-error-banner";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { UserDataProvider } from "@/lib/user-data/provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Absolute base for link previews. Vercel provides the production domain; locally it's localhost.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Tastewise",
  title: {
    default: "Tastewise: find something wonderful to cook",
    template: "%s | Tastewise",
  },
  description:
    "Discover recipes, explore new flavors and cook with what you already have. Save favorites, plan your shopping and tailor recipes to how you eat.",
  // The preview image itself comes from app/opengraph-image.tsx (and recipes/[slug]/opengraph-image.tsx).
  openGraph: {
    type: "website",
    siteName: "Tastewise",
    title: "Tastewise: find something wonderful to cook",
    description: "Discover recipes, cook from what's in your kitchen, and shop with one combined list.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page (and the bottom tab bar) extend under the iPhone home indicator;
  // safe-area padding keeps content clear of it.
  viewportFit: "cover",
  themeColor: "#f8f7f2",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const sessionUser = user ? { id: user.id, email: user.email ?? null } : null;

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${cormorant.variable} scroll-smooth`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <UserDataProvider user={sessionUser}>
          <SiteHeader authEnabled={isSupabaseConfigured} />
          <StorageErrorBanner />
          <main id="main" className="min-h-[70vh]">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
          <Toaster
            position="bottom-center"
            offset={{ bottom: 32 }}
            mobileOffset={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
          />
        </UserDataProvider>
      </body>
    </html>
  );
}
