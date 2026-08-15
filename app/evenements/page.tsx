import type { Metadata } from "next";
import { Sparkles, Truck, Clock, Star } from "lucide-react";
import { CategoryCover } from "@/components/catalog/category-cover";
import { GlassButton } from "@/components/ui/glass-button";
import { buildPageMetadata } from "@/lib/data/page-contents";
import { EventOrderForm } from "@/components/evenements/event-order-form";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("evenements", {
    title: "Mariages & Fêtes | Terminal 3",
    description:
      "Mariages, fêtes privées, réceptions et grandes commandes : composez une sélection de vins, spiritueux et produits fins adaptée à votre événement.",
    canonical: "/evenements",
  });
}

const ADVANTAGES = [
  { icon: Sparkles, label: "Sélection personnalisée" },
  { icon: Star, label: "Produits casher" },
  { icon: Truck, label: "Livraison à Jérusalem" },
  { icon: Clock, label: "Réponse rapide du magasin" },
];

export default function EvenementsPage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <CategoryCover
        imageUrl="/images/terminal-3/couvertures/plateaux.webp"
        pretitle="Terminal 3 pour vos événements"
        title={
          <>
            Le goût des grands moments
            <br />
            <span className="text-or-principal">pour votre réception.</span>
          </>
        }
        subtitle="Mariages, fêtes privées, réceptions et grandes commandes : composez une sélection de vins, spiritueux et produits fins adaptée à votre événement."
      >
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <GlassButton href="#configurateur" variant="gold">
            Préparer ma commande
          </GlassButton>
          <GlassButton href="#contact" variant="dark">
            Demander conseil
          </GlassButton>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ADVANTAGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-ivory/70">
              <Icon className="h-4 w-4 text-or-principal" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </CategoryCover>

      <section id="configurateur" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ivory">Préparez votre commande</h2>
            <p className="mt-4 text-ivory/70">
              Quelques informations suffisent. Notre équipe vérifiera les produits, les quantités et les conditions de livraison avant confirmation.
            </p>
          </div>
          <EventOrderForm />
        </div>
      </section>
    </main>
  );
}
