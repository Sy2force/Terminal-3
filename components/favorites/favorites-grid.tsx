"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { toggleFavorite } from "@/app/favorites/actions";
import { FavoriteCard } from "@/components/favorites/favorite-card";
import type { ProductWithMedia } from "@/lib/data/catalog";

export function FavoritesGrid({ products }: { products: ProductWithMedia[] }) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [isPending, startTransition] = useTransition();

  const visible = products.filter((p) => !removedIds.has(p.id));

  function handleClearAll() {
    startTransition(async () => {
      await Promise.all(visible.map((p) => toggleFavorite(p.id)));
      setRemovedIds(new Set(products.map((p) => p.id)));
      setConfirmingClear(false);
    });
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-sm border border-brun-cave/15 bg-white/40 px-6 py-20 text-center">
        <Heart className="h-8 w-8 text-brun-cave/40" aria-hidden />
        <p className="font-serif text-xl text-noir-profond">
          Votre sélection personnelle est encore vide.
        </p>
        <Link
          href="/vins"
          className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
        >
          Explorer la cave
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-end">
        {confirmingClear ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gris-chaud">Retirer tous les favoris ?</span>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isPending}
              className="font-medium text-bordeaux-principal hover:underline"
            >
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="text-gris-chaud hover:underline"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 text-sm text-gris-chaud hover:text-bordeaux-principal hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Vider les favoris
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((product) => (
          <FavoriteCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
