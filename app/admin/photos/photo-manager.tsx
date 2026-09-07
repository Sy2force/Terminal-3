"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  updateProductCoverAction,
  updateCategoryCoverAction,
  updateHeroBackgroundAction,
  updateLogoAction,
  updatePromotionImageAction,
} from "./actions";
import type { ProductWithDetails } from "@/lib/data/products";
import type { CategoryRow, PromotionRow } from "@/types/database";
import type { PageContentRow } from "@/types/database";
import type { SiteSettings } from "@/lib/settings";
import type { MediaWithUsage } from "@/lib/data/media";

interface PhotoManagerProps {
  products: ProductWithDetails[];
  categories: CategoryRow[];
  promotions: PromotionRow[];
  homePage: PageContentRow | null;
  settings: SiteSettings;
  media: MediaWithUsage[];
  demoMode: boolean;
}

type Toast = { id: string; text: string; error?: boolean };

export function PhotoManager({
  products,
  categories,
  promotions,
  homePage,
  settings,
  demoMode,
}: PhotoManagerProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  function notify(text: string, error?: boolean) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, error }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  async function wrap<T extends Promise<unknown>>(key: string, label: string, p: T) {
    setPending((s) => ({ ...s, [key]: true }));
    try {
      const result = (await p) as { success: boolean; error?: string } | undefined;
      if (result && "success" in result && !result.success) {
        notify(`${label} : ${result.error ?? "échec"}`, true);
      } else {
        notify(`${label} enregistré.`);
      }
    } catch (err) {
      notify(`${label} : ${err instanceof Error ? err.message : "échec"}`, true);
    } finally {
      setPending((s) => ({ ...s, [key]: false }));
    }
  }

  if (demoMode) {
    return (
      <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
        Mode démo : la base Supabase n&apos;est pas connectée. Les photos ne peuvent pas être enregistrées.
      </div>
    );
  }

  const heroUrl = homePage?.og_image_url ?? null;
  const logoUrl = settings.LOGO_URL ?? null;

  return (
    <div className="space-y-10">
      {toasts.length > 0 && (
        <div className="fixed right-4 top-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-sm px-4 py-2 text-sm shadow ${
                t.error
                  ? "border border-[#9B3444]/30 bg-[#9B3444]/10 text-[#9B3444]"
                  : "border border-[#56705A]/30 bg-[#56705A]/10 text-[#56705A]"
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}

      {/* Logo */}
      <section className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#151411]">Logo du site</h2>
        <p className="text-sm text-[#71695F]">Format conseillé : PNG ou SVG, fond transparent, largeur 200 à 500 px.</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm border border-[#E7DECE] bg-[#FBF8F1]">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo actuel" fill className="object-contain p-2" sizes="160px" unoptimized />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-[#71695F]">Aucun logo</span>
            )}
          </div>
          <ImageUploader
            bucket="brand-assets"
            folder="logo"
            onUploaded={(url) => wrap("logo", "Logo", updateLogoAction(url))}
            label={pending["logo"] ? "Enregistrement..." : "Remplacer le logo"}
          />
        </div>
      </section>

      {/* Hero */}
      <section className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#151411]">Image d&apos;accueil (hero)</h2>
        <p className="text-sm text-[#71695F]">Format paysage, min. 1200 × 800 px, optimisé pour mobile et ordinateur.</p>
        <div className="mt-4 space-y-4">
          <div className="relative aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-sm border border-[#E7DECE] bg-[#FBF8F1]">
            {heroUrl ? (
              <Image src={heroUrl} alt="Hero actuel" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" unoptimized />
            ) : (
              <span className="flex h-full items-center justify-center text-sm text-[#71695F]">Image d&apos;accueil par défaut</span>
            )}
          </div>
          <ImageUploader
            bucket="content-images"
            folder="hero"
            onUploaded={(url) => wrap("hero", "Image d&apos;accueil", updateHeroBackgroundAction(url))}
            label={pending["hero"] ? "Enregistrement..." : "Remplacer l&apos;image d&apos;accueil"}
          />
        </div>
      </section>

      {/* Products */}
      <section className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#151411]">Photos des produits</h2>
        <p className="text-sm text-[#71695F]">Couverture visible sur les fiches et les listes.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const cover = p.media.find((m) => m.kind === "COVER") ?? p.media[0];
            const key = `product-${p.id}`;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-sm border border-[#E7DECE] p-3"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-[#FBF8F1]">
                  {cover?.url ? (
                    <Image src={cover.url} alt={p.name_fr || p.name_he || "Produit"} fill className="object-contain" sizes="300px" unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-[#71695F]">Aucune image</span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-[#151411]" title={p.name_fr || p.name_he}>
                  {p.name_fr || p.name_he}
                </p>
                <ImageUploader
                  bucket="product-images"
                  folder="covers"
                  onUploaded={(url) =>
                    wrap(key, `Couverture ${p.name_fr || p.name_he || "produit"}`, updateProductCoverAction(p.id, url))
                  }
                  label={pending[key] ? "..." : "Remplacer"}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#151411]">Photos des catégories</h2>
        <p className="text-sm text-[#71695F]">Visuel sur les cartes de catégories.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const key = `category-${c.id}`;
            return (
              <div key={c.id} className="flex flex-col gap-3 rounded-sm border border-[#E7DECE] p-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#FBF8F1]">
                  {c.cover_image ? (
                    <Image src={c.cover_image} alt={c.name_fr || c.name_he} fill className="object-cover" sizes="300px" unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-[#71695F]">Aucune image</span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-[#151411]" title={c.name_fr || c.name_he}>
                  {c.name_fr || c.name_he}
                </p>
                <ImageUploader
                    bucket="content-images"
                    folder={`categories/${c.slug}`}
                    onUploaded={(url) =>
                      wrap(key, `Catégorie ${c.name_fr || c.name_he || ""}`, updateCategoryCoverAction(c.id, url))
                    }
                    label={pending[key] ? "..." : "Remplacer"}
                  />
              </div>
            );
          })}
        </div>
      </section>

      {/* Promotions */}
      <section className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#151411]">Photos des promotions</h2>
        <p className="text-sm text-[#71695F]">Image affichée sur la carte de l&apos;offre, prioritaire sur celle du produit lié.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => {
            const key = `promotion-${promo.id}`;
            const cover = promo.image_url;
            return (
              <div key={promo.id} className="flex flex-col gap-3 rounded-sm border border-[#E7DECE] p-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[#FBF8F1]">
                  {cover ? (
                    <Image src={cover} alt={promo.title} fill className="object-cover" sizes="300px" unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-[#71695F]">Aucune image</span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-[#151411]" title={promo.title}>
                  {promo.title}
                </p>
                <ImageUploader
                  bucket="content-images"
                  folder="promotions"
                  onUploaded={(url) =>
                    wrap(key, `Promotion ${promo.title || ""}`, updatePromotionImageAction(promo.id, url))
                  }
                  label={pending[key] ? "..." : "Remplacer"}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
