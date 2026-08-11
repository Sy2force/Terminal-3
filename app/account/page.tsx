import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/account/logout-button";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">
        Mon compte
      </span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">
        Bonjour{profile?.first_name ? `, ${profile.first_name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted-grey">{user.email}</p>

      <div className="mt-10 flex flex-col gap-3">
        <Link
          href="/account/orders"
          className="flex items-center justify-between rounded-sm border border-white/5 bg-graphite px-5 py-4 text-sm text-ivory transition-colors hover:border-champagne/30"
        >
          Mes commandes
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/account/favorites"
          className="flex items-center justify-between rounded-sm border border-white/5 bg-graphite px-5 py-4 text-sm text-ivory transition-colors hover:border-champagne/30"
        >
          Mes favoris
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/cart"
          className="flex items-center justify-between rounded-sm border border-white/5 bg-graphite px-5 py-4 text-sm text-ivory transition-colors hover:border-champagne/30"
        >
          Mon panier
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/club"
          className="flex items-center justify-between rounded-sm border border-champagne/30 bg-champagne/5 px-5 py-4 text-sm text-champagne transition-colors hover:border-champagne/60"
        >
          Club Terminal 3
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-12 border-t border-white/5 pt-10">
        <h2 className="font-serif text-lg text-ivory">Mes informations</h2>
        <p className="mt-1 text-sm text-muted-grey">
          Utilisées pour préremplir vos commandes.
        </p>
        <div className="mt-6">
          <ProfileForm
            initialFirstName={profile?.first_name ?? ""}
            initialLastName={profile?.last_name ?? ""}
            initialPhone={profile?.phone ?? ""}
          />
        </div>
      </div>

      <div className="mt-10">
        <LogoutButton />
      </div>
    </div>
  );
}
