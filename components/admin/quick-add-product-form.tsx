"use client";

import { useActionState } from "react";
import { quickAddProductAction } from "@/app/admin/products/quick-add/actions";
import type { CategoryRow } from "@/types/database";

export function QuickAddProductForm({ categories }: { categories: CategoryRow[] }) {
  const [state, submit, isPending] = useActionState(quickAddProductAction, null);

  return (
    <form action={submit} className="space-y-5 rounded-sm border border-white/5 bg-graphite p-6">
      {state && !state.ok && (
        <div className="rounded-sm border border-bordeaux-principal/30 bg-bordeaux-principal/10 p-3 text-sm text-bordeaux-principal">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name_fr" className="mb-1 block text-sm text-ivory/80">
            Nom du produit (FR) *
          </label>
          <input
            id="name_fr"
            name="name_fr"
            required
            className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="name_he" className="mb-1 block text-sm text-ivory/80">
            Nom en hébreu
          </label>
          <input
            id="name_he"
            name="name_he"
            dir="rtl"
            className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="brand" className="mb-1 block text-sm text-ivory/80">
            Marque
          </label>
          <input
            id="brand"
            name="brand"
            className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="mb-1 block text-sm text-ivory/80">
            Catégorie *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne focus:outline-none"
          >
            <option value="">Sélectionner…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_fr || c.name_he}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sku" className="mb-1 block text-sm text-ivory/80">
            Code / SKU *
          </label>
          <input
            id="sku"
            name="sku"
            required
            className={`w-full rounded-sm border bg-obsidian px-3 py-2.5 text-sm text-ivory focus:outline-none ${
              state && !state.ok && state.field === "sku"
                ? "border-bordeaux-principal"
                : "border-white/10 focus:border-champagne"
            }`}
          />
          <p className="mt-1 text-xs text-ivory/50">Vérification d’unicité automatique.</p>
        </div>

        <div>
          <label htmlFor="price_agorot" className="mb-1 block text-sm text-ivory/80">
            Prix (agorot) *
          </label>
          <input
            id="price_agorot"
            name="price_agorot"
            type="number"
            min={1}
            required
            className="w-full rounded-sm border border-white/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne focus:outline-none"
          />
          <p className="mt-1 text-xs text-ivory/50">1 ₪ = 100 agorot. Ex: 9900 pour 99 ₪.</p>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-ivory/80">
          <input
            type="checkbox"
            name="age_restricted"
            className="h-4 w-4 rounded-sm border-white/10 bg-obsidian text-bordeaux-principal"
          />
          Réservé aux 18+
        </label>

        <label htmlFor="status" className="text-sm text-ivory/80">
          Statut
        </label>
        <select
          id="status"
          name="status"
          defaultValue="draft"
          className="rounded-sm border border-white/10 bg-obsidian px-3 py-2 text-sm text-ivory"
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-champagne px-6 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-60"
        >
          {isPending ? "Création…" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
