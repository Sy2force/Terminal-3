"use client";

import { useActionState, useState } from "react";
import { quickAddProductAction } from "@/app/admin/products/quick-add/actions";
import { isValidWoltUrl } from "@/lib/wolt";
import {
  AdminField,
  AdminSelect,
  AdminCheckbox,
  InlineAlert,
} from "@/components/admin/form-controls";
import type { CategoryRow } from "@/types/database";

export function QuickAddProductForm({ categories }: { categories: CategoryRow[] }) {
  const [state, submit, isPending] = useActionState(quickAddProductAction, null);
  const [woltUrl, setWoltUrl] = useState("");
  const [woltEnabled, setWoltEnabled] = useState(false);

  const fieldInvalid = (field: string) =>
    state != null && !state.ok && state.field === field;

  return (
    <form action={submit} className="space-y-5 rounded-[12px] border border-[var(--admin-border)] bg-white p-6 shadow-sm">
      {state && !state.ok && (
        <InlineAlert kind="error" title="Création impossible">
          {state.error}
        </InlineAlert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField name="name_fr" label="Nom du produit (FR)" required />
        <AdminField name="name_he" label="Nom en hébreu" inputProps={{ dir: "rtl" }} />
        <AdminField name="brand" label="Marque" />
        <AdminSelect
          name="category_id"
          label="Catégorie"
          required
          options={[
            { value: "", label: "Sélectionner…" },
            ...categories.map((c) => ({ value: c.id, label: c.name_fr || c.name_he })),
          ]}
        />
        <AdminField
          name="sku"
          label="Code / SKU"
          required
          invalid={fieldInvalid("sku")}
          hint="Vérification d'unicité automatique."
        />
        <AdminField
          name="barcode"
          label="Code-barres (EAN/UPC)"
          inputMode="numeric"
          invalid={fieldInvalid("barcode")}
          hint="Optionnel. Distinct du SKU. Les zéros initiaux sont conservés."
          inputProps={{ maxLength: 40 }}
        />
        <AdminField
          name="price_agorot"
          label="Prix (agorot)"
          type="number"
          required
          hint="1 ₪ = 100 agorot. Ex : 9900 pour 99 ₪."
          inputProps={{ min: 1 }}
        />

        <div className="sm:col-span-2">
          <AdminCheckbox
            name="wolt_enabled"
            label="Afficher le bouton Wolt"
            description="Ajoute un lien « Commander sur Wolt » sur la fiche produit publique."
            inputProps={{ checked: woltEnabled, onChange: (e) => setWoltEnabled(e.target.checked) }}
          />
          <div className="mt-2 flex gap-2">
            <div className="flex-1">
              <AdminField
                name="wolt_url"
                label="Lien Wolt du produit"
                type="url"
                placeholder="https://wolt.com/en/isr/product/..."
                disabled={!woltEnabled}
                invalid={fieldInvalid("wolt_url")}
                inputProps={{ value: woltUrl, onChange: (e) => setWoltUrl(e.target.value) }}
              />
            </div>
            <a
              href={isValidWoltUrl(woltUrl) ? woltUrl : "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isValidWoltUrl(woltUrl)) e.preventDefault();
              }}
              aria-disabled={!isValidWoltUrl(woltUrl)}
              className={`mt-6 flex min-h-[44px] items-center whitespace-nowrap rounded-[10px] border-[1.5px] px-4 text-xs font-medium ${
                isValidWoltUrl(woltUrl)
                  ? "border-[#009DE0]/40 bg-[#009DE0]/10 text-[#009DE0]"
                  : "border-[var(--admin-border)] text-[var(--admin-text-muted)]/40"
              }`}
            >
              Tester le lien
            </a>
          </div>
          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
            URL directe vers cette bouteille / ce format sur Wolt.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-[var(--admin-border)] pt-4">
        <AdminCheckbox
          name="age_restricted"
          label="Réservé aux 18+"
          description="La vérification d'âge sera demandée lors du retrait en magasin."
        />
        <div className="min-w-[220px]">
          <AdminSelect
            name="status"
            label="Statut"
            options={[
              { value: "draft", label: "Brouillon" },
              { value: "published", label: "Publié" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] rounded-[10px] bg-[var(--admin-burgundy)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-burgundy-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Création…" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
