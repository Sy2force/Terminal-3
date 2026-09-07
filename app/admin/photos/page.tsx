import { requireAdminPermission } from "@/lib/admin/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { getAllProducts } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { getAllPromotions } from "@/lib/data/promotions-admin";
import { getPageContentForAdmin } from "@/lib/data/page-contents";
import { getSiteSettings } from "@/lib/settings";
import { listMedia } from "@/lib/data/media";
import { PhotoManager } from "./photo-manager";

export default async function PhotosPage() {
  await requireAdminPermission("catalog.media");

  const [products, categories, promotions, homePage, settings, media] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllPromotions(),
    getPageContentForAdmin("home"),
    getSiteSettings(),
    listMedia(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Photos du site</h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Choisissez un emplacement, importez ou remplacez la photo. Les changements s&apos;appliquent immédiatement sur la boutique.
        </p>
      </div>
      <PhotoManager
        products={products}
        categories={categories}
        promotions={promotions}
        homePage={homePage}
        settings={settings}
        media={media}
        demoMode={isDemoMode()}
      />
    </div>
  );
}
