import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";

export default async function ComptePofilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/profil");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Mon profil</h1>
      <p className="mt-2 text-sm text-muted-grey">{user.email}</p>

      <div className="mt-8">
        <ProfileForm
          initialFirstName={profile?.first_name ?? ""}
          initialLastName={profile?.last_name ?? ""}
          initialPhone={profile?.phone ?? ""}
        />
      </div>
    </div>
  );
}
