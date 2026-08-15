import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";
import { PageContentRenderer } from "@/components/public/page-content-renderer";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("conditions", {
    title: "Conditions générales | Terminal 3",
    description: "Conditions générales de vente et d'utilisation de Terminal 3.",
    canonical: "/conditions",
  });
}

export default async function TermsPage() {
  const [settings, pageContent] = await Promise.all([
    getSiteSettings(),
    getPublishedPageContent("conditions"),
  ]);
  const blocks = pageContent?.blocks;

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Informations légales</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            {pageContent?.title ?? "Conditions générales"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-3 rounded-sm border border-or-principal/40 bg-or-principal/5 p-4 text-sm text-noir-profond">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-principal" aria-hidden />
          <p>
            {pageContent?.description ??
              "Ce texte présente les règles générales de fonctionnement du site à titre informatif. Il doit être relu et validé par le responsable du magasin et, si nécessaire, par un professionnel du droit avant publication définitive."}
          </p>
        </div>

        {Array.isArray(blocks) && blocks.length > 0 && (
          <div className="mb-10">
            <PageContentRenderer blocks={blocks} />
          </div>
        )}

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-noir-profond/85">
          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">1. Objet</h2>
            <p>
              {settings.STORE_NAME} propose à la vente, via ce site, des vins, spiritueux,
              charcuteries, poissons et plateaux destinés au retrait en boutique ou à la
              livraison à Jérusalem. Ce site ne propose aucun paiement en ligne : le règlement
              s&rsquo;effectue en espèces au retrait ou à la livraison.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">2. Commandes</h2>
            <p>
              Toute commande passée via le site reste soumise à confirmation du magasin. Les
              produits, prix, stocks et promotions affichés sont vérifiés au moment de la
              confirmation ; en cas d&rsquo;indisponibilité, le magasin contacte le client pour
              proposer une alternative ou annuler la ligne concernée.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">3. Vente d&rsquo;alcool et vérification d&rsquo;âge</h2>
            <p>
              La vente de boissons alcoolisées est réservée aux personnes de 18 ans et plus. Une
              pièce d&rsquo;identité valide est systématiquement contrôlée avant la remise de
              tout produit alcoolisé, au retrait comme à la livraison. Aucun alcool n&rsquo;est
              remis à une personne mineure ; la personne majeure doit être présente lors de la
              remise.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">4. Paiement</h2>
            <p>
              Le paiement s&rsquo;effectue en espèces (ou selon les moyens acceptés en boutique)
              lors du retrait ou auprès du livreur. Aucun paiement en ligne n&rsquo;est requis
              pour valider une commande sur ce site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">5. Livraison et retrait</h2>
            <p>
              Les frais de livraison, zones couvertes et délais sont indiqués lors de la
              commande et peuvent être ajustés par le magasin. Le retrait s&rsquo;effectue à
              l&rsquo;adresse {settings.STORE_ADDRESS}, aux horaires d&rsquo;ouverture en
              vigueur.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">6. Annulation</h2>
            <p>
              Une commande peut être annulée par le client ou par le magasin avant sa
              préparation, notamment en cas d&rsquo;indisponibilité d&rsquo;un produit ou de
              doute sur la vérification d&rsquo;âge. Le magasin informe le client par téléphone
              ou WhatsApp de toute annulation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">7. Données personnelles</h2>
            <p>
              Les informations transmises lors d&rsquo;une commande ou d&rsquo;une inscription
              au Club sont utilisées uniquement pour le traitement des commandes et, avec le
              consentement du client, pour l&rsquo;envoi de communications. Voir notre{" "}
              <a href="/confidentialite" className="text-bordeaux-principal underline-offset-2 hover:underline">
                politique de confidentialité
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-noir-profond">8. Contact</h2>
            <p>
              Pour toute question relative à ces conditions, contactez-nous au{" "}
              {settings.STORE_PHONE} ou via WhatsApp au {settings.STORE_WHATSAPP}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
