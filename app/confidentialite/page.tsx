import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";
import { PageContentRenderer } from "@/components/public/page-content-renderer";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("confidentialite", {
    title: "Politique de confidentialité | Terminal 3",
    description: "Comment Terminal 3 collecte, utilise et protège vos données personnelles.",
    canonical: "/confidentialite",
  });
}

export default async function PrivacyPage() {
  const [settings, pageContent] = await Promise.all([
    getSiteSettings(),
    getPublishedPageContent("confidentialite"),
  ]);
  const blocks = pageContent?.blocks;

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Informations légales</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            {pageContent?.title ?? "Politique de confidentialité"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-3 rounded-sm border border-or-principal/40 bg-or-principal/5 p-4 text-sm text-noir-profond">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
          <p>
            {pageContent?.description ??
              "Ce texte présente les règles générales de traitement des données personnelles à titre informatif. Il doit être relu et validé par le responsable du magasin et, si nécessaire, par un professionnel du droit avant publication définitive."}
          </p>
        </div>

        {Array.isArray(blocks) && blocks.length > 0 && (
          <div className="mb-10">
            <PageContentRenderer blocks={blocks} />
          </div>
        )}

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-noir-profond/85">
          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">1. Données collectées</h2>
            <p>
              Lors d&rsquo;une commande, d&rsquo;une inscription au Club ou d&rsquo;un message
              via le formulaire de contact, nous collectons uniquement les informations
              nécessaires : nom, prénom, téléphone, e-mail, adresse de livraison le cas échéant,
              et le contenu de votre message ou commande.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">2. Utilisation des données</h2>
            <p>
              Ces informations sont utilisées pour traiter vos commandes, vous contacter au
              sujet de votre commande ou de votre demande, et — uniquement avec votre
              consentement explicite — pour vous envoyer des communications du Club Terminal 3.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">3. Pièce d&rsquo;identité</h2>
            <p>
              Une pièce d&rsquo;identité valide est contrôlée physiquement avant la remise de
              tout produit alcoolisé. Aucune photographie de pièce d&rsquo;identité n&rsquo;est
              demandée ni conservée par ce site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">4. Conservation</h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire au traitement de vos
              commandes et à la relation commerciale, conformément aux obligations légales
              applicables.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">5. Vos droits</h2>
            <p>
              Vous pouvez demander l&rsquo;accès, la correction ou la suppression de vos
              données personnelles, ainsi que le retrait de votre consentement aux
              communications, en nous contactant au {settings.STORE_PHONE} ou par WhatsApp au{" "}
              {settings.STORE_WHATSAPP}.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">6. Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec
              nos prestataires techniques (hébergement, livraison) uniquement dans la mesure
              nécessaire à l&rsquo;exécution de votre commande.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
