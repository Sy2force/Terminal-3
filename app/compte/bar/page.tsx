import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyBarProfile } from "@/lib/data/bar-profiles";
import { BarProfileForm } from "@/components/account/bar-profile-form";

export const metadata: Metadata = {
  title: "Ma fiche pro | Terminal 3",
  description: "Fiche professionnelle : bar, restaurant, entreprise.",
};

export default async function CompteBarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/bar");

  const barProfile = await getMyBarProfile();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-champagne">
          Compte professionnel
        </p>
        <h1 className="mt-2 font-serif text-3xl text-ivory">
          {barProfile ? "Ma fiche bar / pro" : "Créer ma fiche bar / pro"}
        </h1>
        <p className="mt-3 text-sm text-ivory/70">
          {barProfile
            ? "Modifiez les informations de votre établissement. Le statut de la fiche est géré par notre équipe et ne peut pas être changé ici."
            : "Vous êtes gérant d'un bar, restaurant ou établissement ? Enregistrez votre fiche pour bénéficier des tarifs pro et d'un suivi dédié. Le catalogue reste consultable sans compte pro."}
        </p>
      </div>
      <BarProfileForm initial={barProfile} />
    </div>
  );
}
