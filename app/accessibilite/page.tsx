import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Accessibilité | Terminal 3",
  description: "Notre démarche d'accessibilité numérique sur le site Terminal 3.",
  alternates: { canonical: "/accessibilite" },
};

export default async function AccessibilityPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Informations légales</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            Accessibilité
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-3 rounded-sm border border-or-principal/40 bg-or-principal/5 p-4 text-sm text-noir-profond">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
          <p>
            Cette déclaration décrit notre démarche d&rsquo;accessibilité et doit être relue et
            validée par le responsable du magasin avant publication définitive — notamment le
            niveau de conformité réellement atteint, qui nécessite un audit dédié.
          </p>
        </div>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-noir-profond/85">
          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">1. Notre engagement</h2>
            <p>
              Terminal 3 s&rsquo;efforce de rendre son site accessible au plus grand nombre :
              navigation au clavier, contrastes suffisants, textes alternatifs sur les images de
              produits, libellés explicites sur les formulaires et les boutons.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">2. Fonctionnalités mises en place</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Navigation complète au clavier sur les catalogues, fiches produits et formulaires.</li>
              <li>Contrastes de texte pensés pour rester lisibles sur fond clair comme sur fond sombre.</li>
              <li>Textes alternatifs sur les photographies de produits.</li>
              <li>Respect de la préférence système de réduction des animations.</li>
              <li>Messages d&rsquo;erreur et de confirmation explicites sur les formulaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">3. Limites connues</h2>
            <p>
              Certaines parties du site (notamment l&rsquo;administration) n&rsquo;ont pas
              encore fait l&rsquo;objet d&rsquo;un audit d&rsquo;accessibilité complet. Nous
              travaillons à l&rsquo;amélioration continue de l&rsquo;expérience pour tous les
              visiteurs.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">4. Nous contacter</h2>
            <p>
              Si vous rencontrez une difficulté d&rsquo;accès à une information ou une
              fonctionnalité du site, contactez-nous au {settings.STORE_PHONE} ou par WhatsApp
              au {settings.STORE_WHATSAPP} — nous ferons notre possible pour vous accompagner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
