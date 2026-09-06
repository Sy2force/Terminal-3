"use client";

import { useActionState, useState } from "react";
import { quickAddProductAction } from "@/app/admin/products/quick-add/actions";
import { isValidWoltUrl } from "@/lib/wolt";
import type { CategoryRow } from "@/types/database";

export function QuickAddProductForm({ categories }: { categories: CategoryRow[] }) {
  const [state, submit, isPending] = useActionState(quickAddProductAction, null);
  const [woltUrl, setWoltUrl] = useState("");
  const [woltEnabled, setWoltEnabled] = useState(false);

  return (
    <form action={submit} className="space-y-5 rounded-sm border border-beige-fonce bg-white p-6">
      {state && !state.ok && (
        <div className="rounded-sm border border-bordeaux-principal/30 bg-bordeaux-principal/10 p-3 text-sm text-bordeaux-principal">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name_fr" className="mb-1 block text-sm text-noir-profond/80">
            Nom du produit (FR) *
          </label>
          <input
            id="name_fr"
            name="name_fr"
            required
            className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="name_he" className="mb-1 block text-sm text-noir-profond/80">
            Nom en hébreu
          </label>
          <input
            id="name_he"
            name="name_he"
            dir="rtl"
            className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="brand" className="mb-1 block text-sm text-noir-profond/80">
            Marque
          </label>
          <input
            id="brand"
            name="brand"
            className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="mb-1 block text-sm text-noir-profond/80">
            Catégorie *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
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
          <label htmlFor="sku" className="mb-1 block text-sm text-noir-profond/80">
            Code / SKU *
          </label>
          <input
            id="sku"
            name="sku"
            required
            className={`w-full rounded-sm border bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:outline-none ${
              state && !state.ok && state.field === "sku"
                ? "border-bordeaux-principal"
                : "border-beige-fonce focus:border-or-principal"
            }`}
          />
          <p className="mt-1 text-xs text-noir-profond/50">Vérification d’unicité automatique.</p>
        </div>

        <div>
          <label htmlFor="barcode" className="mb-1 block text-sm text-noir-profond/80">
            Code-barres (EAN/UPC)
          </label>
          <input
            id="barcode"
            name="barcode"
            inputMode="numeric"
            maxLength={40}
            className={`w-full rounded-sm border bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:outline-none ${
              state && !state.ok && state.field === "barcode"
                ? "border-bordeaux-principal"
                : "border-beige-fonce focus:border-or-principal"
            }`}
          />
          <p className="mt-1 text-xs text-noir-profond/50">Optionnel. Distinct du SKU. Les zéros initiaux sont conservés.</p>
        </div>

        <div>
          <label htmlFor="price_agorot" className="mb-1 block text-sm text-noir-profond/80">
            Prix (agorot) *
          </label>
          <input
            id="price_agorot"
            name="price_agorot"
            type="number"
            min={1}
            required
            className="w-full rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
          />
          <p className="mt-1 text-xs text-noir-profond/50">1 ₪ = 100 agorot. Ex: 9900 pour 99 ₪.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm text-noir-profond/80">
            <input
              type="checkbox"
              name="wolt_enabled"
              checked={woltEnabled}
              onChange={(e) => setWoltEnabled(e.target.checked)}
              className="h-4 w-4 accent-or-principal"
            />
            Afficher le bouton Wolt
          </label>
          <div className="flex gap-2">
            <input
              id="wolt_url"
              name="wolt_url"
              type="url"
              value={woltUrl}
              onChange={(e) => setWoltUrl(e.target.value)}
              disabled={!woltEnabled}
              placeholder="https://wolt.com/en/isr/product/..."
              className={`w-full rounded-sm border bg-fond-papier px-3 py-2.5 text-sm text-noir-profond focus:outline-none disabled:opacity-40 ${
                state && !state.ok && state.field === "wolt_url"
                  ? "border-bordeaux-principal"
                  : "border-beige-fonce focus:border-or-principal"
              }`}
            />
            <a
              href={isValidWoltUrl(woltUrl) ? woltUrl : "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isValidWoltUrl(woltUrl)) e.preventDefault();
              }}
              className={`whitespace-nowrap rounded-sm px-3 py-2 text-xs ${isValidWoltUrl(woltUrl) ? "bg-[#009DE0]/10 text-[#009DE0]" : "text-noir-profond/40"}`}
            >
              Tester
            </a>
          </div>
          <p className="mt-1 text-xs text-noir-profond/50">
            URL directe vers cette bouteille / ce format sur Wolt.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-noir-profond/80">
          <input
            type="checkbox"
            name="age_restricted"
            className="h-4 w-4 rounded-sm border-beige-fonce bg-fond-papier text-bordeaux-principal"
          />
          Réservé aux 18+
        </label>

        <label htmlFor="status" className="text-sm text-noir-profond/80">
          Statut
        </label>
        <select
          id="status"
          name="status"
          defaultValue="draft"
          className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair disabled:opacity-60"
        >
          {isPending ? "Création…" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
