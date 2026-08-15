import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { getAllHomepageSections } from "@/lib/data/homepage";
import { isDemoMode } from "@/lib/demo-mode";
import { HeroBottlePicker } from "@/components/admin/hero-bottle-picker";

export default async function CouverturesPage() {
  await requireAdminPermission("marketing.content");

  const [products, sections] = await Promise.all([
    getAllProducts(),
    getAllHomepageSections(),
  ]);

  const hero = sections.find((s) => s.section_type === "HERO");
  const bottleIds = Array.isArray(hero?.config?.bottle_ids)
    ? (hero.config.bottle_ids as string[])
    : [];

  const pickerProducts = products
    .filter((p) => p.status === "published")
    .map((p) => ({
      id: p.id,
      name: p.name_fr || p.name_he,
      brand: p.brand,
      coverUrl: (p.media.find((m) => m.kind === "COVER") ?? p.media[0])?.url ?? null,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Hero et couvertures</h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Choisissez jusqu&apos;à 7 bouteilles pour le carrousel de la page d&apos;accueil.
        </p>
      </div>

      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <HeroBottlePicker
          products={pickerProducts}
          initialSelectedIds={bottleIds}
          demoMode={isDemoMode()}
        />
      </div>
    </div>
  );
}
