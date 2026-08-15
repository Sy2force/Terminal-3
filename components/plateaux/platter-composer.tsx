"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatUnitPrice } from "@/lib/money";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface SupplementLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export function PlatterComposer({
  platters,
  supplements,
  initialBaseSlug,
}: {
  platters: ProductWithMedia[];
  supplements: ProductWithMedia[];
  initialBaseSlug?: string;
}) {
  const { addItem } = useCart();
  const [baseId, setBaseId] = useState<string>(
    platters.find((p) => p.slug === initialBaseSlug)?.id ?? platters[0]?.id ?? "",
  );
  const base = platters.find((p) => p.id === baseId) ?? null;
  const baseVariants = base?.variants ?? [];
  const [baseVariantId, setBaseVariantId] = useState<string | null>(
    baseVariants.find((v) => v.is_default)?.id ?? baseVariants[0]?.id ?? null,
  );
  const [baseQuantity, setBaseQuantity] = useState(1);
  const [supplementLines, setSupplementLines] = useState<SupplementLine[]>([]);
  const [added, setAdded] = useState(false);

  function handleSelectBase(id: string) {
    setBaseId(id);
    const variants = platters.find((p) => p.id === id)?.variants ?? [];
    setBaseVariantId(variants.find((v) => v.is_default)?.id ?? variants[0]?.id ?? null);
  }

  function toggleSupplement(product: ProductWithMedia) {
    const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
    if (!defaultVariant) return;
    setSupplementLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) return prev.filter((l) => l.productId !== product.id);
      return [...prev, { productId: product.id, variantId: defaultVariant.id, quantity: 1 }];
    });
  }

  function updateSupplementQuantity(productId: string, delta: number) {
    setSupplementLines((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  const baseVariant = baseVariants.find((v) => v.id === baseVariantId);
  const basePrice = baseVariant?.regular_price_agorot ?? 0;

  let totalAgorot = basePrice * baseQuantity;
  for (const line of supplementLines) {
    const product = supplements.find((s) => s.id === line.productId);
    const variant = product?.variants?.find((v) => v.id === line.variantId);
    if (variant?.regular_price_agorot != null) {
      totalAgorot += variant.regular_price_agorot * line.quantity;
    }
  }

  function handleAddToCart() {
    if (!base || !baseVariant) return;
    addItem(
      {
        variantId: baseVariant.id,
        productId: base.id,
        productSlug: base.slug,
        productName: base.name_fr || base.name_he,
        variantLabel: baseVariant.label,
        displayPriceAgorot: baseVariant.regular_price_agorot,
        imageUrl: base.media?.[0]?.url ?? null,
        ageRestricted: false,
      },
      baseQuantity,
    );
    for (const line of supplementLines) {
      const product = supplements.find((s) => s.id === line.productId);
      const variant = product?.variants?.find((v) => v.id === line.variantId);
      if (!product || !variant) continue;
      addItem(
        {
          variantId: variant.id,
          productId: product.id,
          productSlug: product.slug,
          productName: product.name_fr || product.name_he,
          variantLabel: variant.label,
          displayPriceAgorot: variant.regular_price_agorot,
          imageUrl: product.media?.[0]?.url ?? null,
          ageRestricted: product.age_restricted,
        },
        line.quantity,
      );
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (platters.length === 0) {
    return (
      <p className="rounded-sm border border-brun-cave/15 bg-white/40 p-8 text-center text-sm text-gris-chaud">
        Aucun plateau n&rsquo;est disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="font-serif text-xl text-noir-profond">1. Choisissez votre plateau</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {platters.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectBase(p.id)}
                aria-pressed={p.id === baseId}
                className={`flex flex-col items-center gap-2 rounded-sm border p-3 text-center transition-colors ${
                  p.id === baseId
                    ? "border-bordeaux-principal bg-bordeaux-principal/5"
                    : "border-brun-cave/20 hover:border-bordeaux-principal/50"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-[#F1EADC]">
                  {p.media?.[0]?.url && (
                    <Image
                      src={p.media[0].url}
                      alt={p.media[0].alt ?? p.name_fr ?? p.name_he}
                      fill
                      sizes="120px"
                      className="object-contain p-3"
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-noir-profond">{p.name_fr || p.name_he}</span>
              </button>
            ))}
          </div>
        </section>

        {base && baseVariants.length > 1 && (
          <section>
            <h2 className="font-serif text-xl text-noir-profond">2. Choisissez un format</h2>
            <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Choisir un format">
              {baseVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={v.id === baseVariantId}
                  onClick={() => setBaseVariantId(v.id)}
                  className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                    v.id === baseVariantId
                      ? "border-bordeaux-principal bg-bordeaux-principal text-texte-clair"
                      : "border-brun-cave/25 text-noir-profond hover:border-bordeaux-principal/60"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-serif text-xl text-noir-profond">3. Quantité</h2>
          <div className="mt-4 flex items-center rounded-sm border border-brun-cave/25 w-fit">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setBaseQuantity((q) => Math.max(1, q - 1))}
              className="p-3 text-noir-profond/70 hover:text-bordeaux-principal"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className="w-10 text-center text-sm text-noir-profond" aria-live="polite">
              {baseQuantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setBaseQuantity((q) => Math.min(20, q + 1))}
              className="p-3 text-noir-profond/70 hover:text-bordeaux-principal"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>

        {supplements.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-noir-profond">4. Ajoutez des suppléments (facultatif)</h2>
            <div className="mt-4 flex flex-col divide-y divide-brun-cave/10 border-y border-brun-cave/15">
              {supplements.map((product) => {
                const line = supplementLines.find((l) => l.productId === product.id);
                const variant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
                return (
                  <div key={product.id} className="flex items-center gap-4 py-4">
                    <label className="flex flex-1 items-center gap-3 text-sm text-noir-profond">
                      <input
                        type="checkbox"
                        checked={Boolean(line)}
                        onChange={() => toggleSupplement(product)}
                        className="h-4 w-4 rounded-sm border-brun-cave/40 text-bordeaux-principal focus:ring-bordeaux-principal"
                      />
                      {product.name_fr || product.name_he}
                      {variant?.regular_price_agorot != null && (
                        <span className="text-xs text-gris-chaud">
                          {formatUnitPrice(variant.regular_price_agorot, variant.pricing_unit)}
                        </span>
                      )}
                    </label>
                    {line && (
                      <div className="flex items-center rounded-sm border border-brun-cave/25">
                        <button
                          type="button"
                          aria-label={`Diminuer la quantité de ${product.name_fr}`}
                          onClick={() => updateSupplementQuantity(product.id, -1)}
                          className="p-1.5 text-noir-profond/70 hover:text-bordeaux-principal"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <span className="w-6 text-center text-xs">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Augmenter la quantité de ${product.name_fr}`}
                          onClick={() => updateSupplementQuantity(product.id, 1)}
                          className="p-1.5 text-noir-profond/70 hover:text-bordeaux-principal"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <aside className="flex h-fit flex-col gap-5 rounded-sm border border-brun-cave/15 bg-white/50 p-6">
        <h2 className="font-serif text-xl text-noir-profond">Récapitulatif</h2>
        {base && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-noir-profond">
              {baseQuantity} × {base.name_fr || base.name_he}
              {baseVariant ? ` (${baseVariant.label})` : ""}
            </span>
            <span className="text-bordeaux-principal">
              {formatUnitPrice((baseVariant?.regular_price_agorot ?? 0) * baseQuantity, "FIXED")}
            </span>
          </div>
        )}
        {supplementLines.map((line) => {
          const product = supplements.find((s) => s.id === line.productId);
          const variant = product?.variants?.find((v) => v.id === line.variantId);
          if (!product || !variant) return null;
          return (
            <div key={line.productId} className="flex items-center justify-between text-sm">
              <span className="text-noir-profond">
                {line.quantity} × {product.name_fr || product.name_he}
              </span>
              <span className="text-bordeaux-principal">
                {formatUnitPrice((variant.regular_price_agorot ?? 0) * line.quantity, "FIXED")}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-brun-cave/15 pt-4">
          <span className="text-sm text-noir-profond/80">Total estimé</span>
          <span className="font-serif text-2xl text-bordeaux-principal">
            {formatUnitPrice(totalAgorot, "FIXED")}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!base || !baseVariant}
          className="flex items-center justify-center gap-2 rounded-sm bg-bordeaux-principal px-6 py-3.5 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Ajouter au panier
            </>
          )}
        </button>
        <p className="text-xs text-gris-chaud">
          Paiement en espèces au retrait ou à la livraison — cette demande reste soumise à
          confirmation du magasin.
        </p>
      </aside>
    </div>
  );
}
