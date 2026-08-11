import type { Metadata } from "next";
import {
  Gift,
  Sparkles,
  Bell,
  Star,
  PackageSearch,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { JoinClubButton } from "@/components/club/join-club-button";

export const metadata: Metadata = {
  title: "Club Terminal 3",
  description:
    "Rejoignez le Club Terminal 3 : réduction de bienvenue, promotions exclusives et avant-premières.",
};

const BENEFITS = [
  {
    icon: Gift,
    title: "Réduction de bienvenue",
    description:
      "Appliquée automatiquement sur votre première commande, aucun code à retenir.",
  },
  {
    icon: Sparkles,
    title: "Promotions exclusives",
    description: "Des offres réservées aux membres, en avant des autres clients.",
  },
  {
    icon: Bell,
    title: "Message de la semaine",
    description: "Les nouveautés et sélections du moment, chaque semaine.",
  },
  {
    icon: Star,
    title: "Sélections réservées",
    description: "Accès prioritaire aux pièces en quantité limitée.",
  },
  {
    icon: PackageSearch,
    title: "Alertes quantités limitées",
    description: "Ne manquez plus les flash-sales sur vos produits préférés.",
  },
  {
    icon: Heart,
    title: "Favoris & suivi",
    description: "Retrouvez vos produits favoris et votre historique de commandes.",
  },
];

export default async function ClubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [settings, membership] = await Promise.all([
    getSiteSettings(),
    user
      ? supabase
          .from("club_memberships")
          .select("joined_at")
          .eq("user_id", user.id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <section className="border-b border-champagne/20 bg-warm-black">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center lg:px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">
            Membership
          </span>
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">
            Club Terminal 3
          </h1>
          <p className="font-serif text-2xl text-champagne">
            -{settings.CLUB_WELCOME_DISCOUNT_PERCENT}% sur votre première
            commande
          </p>
          <p className="max-w-lg text-sm leading-relaxed text-ivory/70">
            Gratuit, sans engagement. La réduction de bienvenue est appliquée
            automatiquement à la caisse dès votre premier achat en ligne —
            aucun code promo à saisir.
          </p>

          {membership ? (
            <p className="font-serif text-lg text-champagne">
              Vous êtes membre depuis le{" "}
              {new Date(membership.joined_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : (
            <JoinClubButton isLoggedIn={Boolean(user)} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <h2 className="text-center font-serif text-2xl text-ivory sm:text-3xl">
          Les avantages membres
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/30 text-champagne">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-serif text-lg text-ivory">{title}</h3>
              <p className="text-sm leading-relaxed text-ivory/70">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
