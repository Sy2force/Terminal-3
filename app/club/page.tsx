import type { Metadata } from "next";
import {
  Gift,
  Sparkles,
  Bell,
  Star,
  PackageSearch,
  Heart,
  Cake,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { getSiteSettings } from "@/lib/settings";
import { JoinClubForm } from "@/components/club/join-club-form";

export const metadata: Metadata = {
  title: "Club Terminal 3",
  description:
    "Rejoignez le Club Terminal 3 : accès prioritaire, promotions réservées, invitations aux dégustations et conseils personnalisés.",
};

const BENEFITS = [
  {
    icon: Star,
    title: "Accès prioritaire aux nouveautés",
    description: "Découvrez les nouvelles arrivées avant tout le monde.",
  },
  {
    icon: Sparkles,
    title: "Promotions réservées",
    description: "Des offres exclusives, réservées aux membres du Club.",
  },
  {
    icon: MessageCircle,
    title: "Invitations aux dégustations",
    description: "Participez aux événements et dégustations organisés en boutique.",
  },
  {
    icon: Bell,
    title: "Conseils personnalisés",
    description: "Notre équipe vous accompagne selon vos goûts et vos habitudes.",
  },
  {
    icon: Cake,
    title: "Avantage anniversaire",
    description: "Une attention particulière le mois de votre anniversaire.",
  },
  {
    icon: PackageSearch,
    title: "Recommandations adaptées",
    description: "Des suggestions pensées pour vos préférences déclarées.",
  },
  {
    icon: Gift,
    title: "Offre de premier achat",
    description: "Une réduction de bienvenue, appliquée automatiquement si active.",
  },
  {
    icon: Heart,
    title: "Favoris & suivi",
    description: "Retrouvez vos produits favoris et votre historique de commandes.",
  },
];

export default async function ClubPage() {
  const user = await getCurrentUser();

  const [settings, membership] = await Promise.all([
    getSiteSettings(),
    user && !isDemoMode()
      ? createClient().then((supabase) =>
          supabase
            .from("club_memberships")
            .select("joined_at")
            .eq("user_id", user.id)
            .maybeSingle()
            .then((r) => r.data),
        )
      : Promise.resolve(null),
  ]);

  return (
    <div className="bg-noir-profond">
      <section className="border-b border-or-principal/20 bg-noir-chaud">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center lg:px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-or-principal">
            Le cercle Terminal 3
          </span>
          <h1 className="font-serif text-4xl text-texte-clair sm:text-5xl">
            Plus qu&rsquo;un client, un invité.
          </h1>
          <p className="font-serif text-2xl text-or-principal">
            -{settings.CLUB_WELCOME_DISCOUNT_PERCENT}% sur votre première commande
          </p>
          <p className="max-w-lg text-sm leading-relaxed text-texte-clair/70">
            Gratuit, sans engagement. La réduction de bienvenue est appliquée
            automatiquement à la caisse dès votre premier achat en ligne — aucun code
            promo à saisir.
          </p>

          {membership ? (
            <p className="font-serif text-lg text-or-principal">
              Vous êtes membre depuis le{" "}
              {new Date(membership.joined_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : (
            <JoinClubForm isLoggedIn={Boolean(user)} defaultEmail={user?.email} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <h2 className="text-center font-serif text-2xl text-texte-clair sm:text-3xl">
          Les avantages membres
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-or-principal/30 text-or-principal">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-serif text-lg text-texte-clair">{title}</h3>
              <p className="text-sm leading-relaxed text-texte-clair/70">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
