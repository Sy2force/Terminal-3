import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PreferencesForm } from "@/components/account/preferences-form";

export default async function ComptePametresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/parametres");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- preference columns added in 0025, not yet in generated Database type
    .select("preferred_language, marketing_opt_in, account_deletion_requested_at" as any)
    .eq("id", user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = profile as any;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Paramètres</h1>

      <div className="mt-8">
        <PreferencesForm
          initialLanguage={row?.preferred_language ?? "fr"}
          initialMarketingOptIn={row?.marketing_opt_in ?? false}
          deletionRequestedAt={row?.account_deletion_requested_at ?? null}
        />
      </div>
    </div>
  );
}
