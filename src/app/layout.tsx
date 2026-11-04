import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

export const metadata: Metadata = {
  title: {
    default: "Tastewise: find something wonderful to cook",
    template: "%s | Tastewise",
  },
  description:
    "Discover recipes, explore new flavors and cook with what you already have. Save favorites, plan your shopping and tailor recipes to how you eat.",
};

export const viewport: Viewport = {
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
          <main id="main" className="min-h-[70vh] pb-24 lg:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
          <Toaster position="bottom-center" offset={{ bottom: 32 }} mobileOffset={{ bottom: 88 }} />
        </UserDataProvider>
      </body>
    </html>
  );
}
