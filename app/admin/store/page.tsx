import { isStoreOnline, getSiteSettings } from "@/lib/settings";
import { requireAdminPermission } from "@/lib/admin/auth";
import { StoreToggle } from "@/components/admin/store-toggle";
import { WeeklyMessageEditor } from "@/components/admin/weekly-message-editor";
import { SalmonGalleryEditor } from "@/components/admin/salmon-gallery-editor";
import { DeliveryFeeEditor } from "@/components/admin/delivery-fee-editor";

export default async function AdminStorePage() {
  await requireAdminPermission("store.settings");

  const [online, settings] = await Promise.all([
    isStoreOnline(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Administration
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory">
          État de la boutique en ligne
        </h1>
        <p className="mt-3 text-sm text-muted-grey">
          Le catalogue reste toujours consultable. Ce bouton active ou bloque
          uniquement le panier et la commande en ligne.
        </p>

        <StoreToggle initialOnline={online} />
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-white/5 pt-10">
        <h2 className="font-serif text-xl text-ivory">
          Frais de livraison
        </h2>
        <p className="text-sm text-muted-grey">
          Montant facturé au client pour la livraison. Retrait en magasin: gratuit.
        </p>
        <DeliveryFeeEditor initialFeeAgorot={settings.DELIVERY_FEE_AGOROT} />
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/5 pt-10">
        <h2 className="font-serif text-xl text-ivory">
          Message de la semaine
        </h2>
        <WeeklyMessageEditor initialMessage={settings.WEEKLY_PROMO_MESSAGE} />
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/5 pt-10">
        <h2 className="font-serif text-xl text-ivory">
          Galerie plateaux de saumon
        </h2>
        <SalmonGalleryEditor initialImages={settings.SALMON_GALLERY_IMAGES} />
      </div>
    </div>
  );
}
