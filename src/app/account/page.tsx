import type { Metadata } from "next";
import { PreferencesForm } from "@/components/account/preferences-form";
import { ProfileForm } from "@/components/account/profile-form";
import { StorageNotice } from "@/components/account/storage-notice";
import { Container, PageHeader } from "@/components/common/page-header";
import { listIngredients } from "@/lib/data/recipes";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Profile and preferences" };

export default async function AccountPage() {
  const ingredients = await listIngredients();
  return (
    <Container className="max-w-5xl">
      <PageHeader
        title="Profile and preferences"
        description="Tell us how you like to eat. Your choices shape suggestions on Discover and can be applied as filters when exploring."
      />
      <StorageNotice authEnabled={isSupabaseConfigured} />

      <section aria-labelledby="profile-title" className="mt-10">
        <h2 id="profile-title" className="font-display text-title text-ink">
          Profile
        </h2>
        <div className="mt-6">
          <ProfileForm />
        </div>
      </section>

      <section aria-labelledby="prefs-title" className="mt-16">
        <h2 id="prefs-title" className="font-display text-title text-ink">
          Cooking preferences
        </h2>
        <p className="mt-1.5 mb-4 max-w-2xl text-[0.95rem] text-ink-muted">
          Suggestions follow simple, transparent rules based on these settings: nothing is learned in the background.
        </p>
        <PreferencesForm ingredients={ingredients} />
      </section>
    </Container>
  );
}
