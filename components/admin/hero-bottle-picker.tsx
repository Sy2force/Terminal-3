"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUp, ArrowDown, X, Plus, Save } from "lucide-react";
import { updateHeroBottlesAction } from "@/app/admin/couvertures/actions";
import { Button } from "@/components/admin/button";

interface PickerProduct {
  id: string;
  name: string;
  brand: string | null;
  coverUrl: string | null;
}

export function HeroBottlePicker({
  products,
  initialSelectedIds,
  demoMode,
}: {
  products: PickerProduct[];
  initialSelectedIds: string[];
  demoMode: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => !selected.includes(p.id))
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term))
      .slice(0, 20);
  }, [products, selected, search]);

  function addBottle(id: string) {
    if (selected.length >= 7) {
      setMessage("Maximum 7 bouteilles dans le carrousel.");
      return;
    }
    setSelected((prev) => [...prev, id]);
    setMessage(null);
  }

  function removeBottle(id: string) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  function moveBottle(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateHeroBottlesAction(selected);
    setSaving(false);
    setMessage(
      result.success
        ? "Carrousel mis à jour. La page d'accueil affichera ces bouteilles après actualisation."
        : result.error === "demo_mode_read_only"
          ? "Mode démo : aucune base de données connectée, la publication est désactivée."
          : "Une erreur est survenue.",
    );
  }

  return (
    <div className="space-y-6">
      {demoMode && (
        <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
          Mode démo actif : la sélection peut être testée mais ne peut pas être enregistrée sans base Supabase connectée.
        </div>
      )}

      <div>
        <h2 className="mb-3 font-serif text-lg text-[#151411]">
          Bouteilles sélectionnées ({selected.length}/7)
        </h2>
        {selected.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[#E7DECE] p-6 text-center text-sm text-[#71695F]">
            Aucune bouteille sélectionnée. Le hero affichera la dernière nouveauté par défaut.
          </p>
        ) : (
          <div className="space-y-2">
            {selected.map((id, index) => {
              const product = byId.get(id);
              if (!product) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-sm border border-[#E7DECE] bg-white p-3 shadow-sm"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#FBF8F1]">
                    {product.coverUrl ? (
                      <Image src={product.coverUrl} alt={product.name} fill className="object-contain" sizes="56px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#B97832]">
                        Pas de photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#151411]">{product.name}</p>
                    {product.brand && <p className="text-xs text-[#71695F]">{product.brand}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBottle(index, -1)}
                      disabled={index === 0}
                      className="rounded-sm p-1.5 text-[#71695F] hover:bg-[#FBF8F1] disabled:opacity-30"
                      aria-label="Monter"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBottle(index, 1)}
                      disabled={index === selected.length - 1}
                      className="rounded-sm p-1.5 text-[#71695F] hover:bg-[#FBF8F1] disabled:opacity-30"
                      aria-label="Descendre"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBottle(id)}
                      className="rounded-sm p-1.5 text-[#9B3444] hover:bg-[#9B3444]/10"
                      aria-label="Retirer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg text-[#151411]">Ajouter un produit</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit ou une marque..."
          className="mb-3 w-full rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
        />
        <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {filteredCandidates.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addBottle(product.id)}
              className="flex items-center gap-3 rounded-sm border border-[#E7DECE] bg-white p-2.5 text-left shadow-sm transition-colors hover:border-[#C6A15B]"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-[#FBF8F1]">
                {product.coverUrl && (
                  <Image src={product.coverUrl} alt={product.name} fill className="object-contain" sizes="40px" />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-[#151411]">{product.name}</span>
              <Plus className="h-4 w-4 shrink-0 text-[#71695F]" />
            </button>
          ))}
          {filteredCandidates.length === 0 && (
            <p className="col-span-2 py-4 text-center text-sm text-[#71695F]">Aucun résultat.</p>
          )}
        </div>
      </div>

      {message && (
        <p className="text-sm text-[#692031]">{message}</p>
      )}

      <Button onClick={handleSave} disabled={saving || demoMode} icon={Save}>
        {saving ? "Publication..." : "Mettre à jour le site"}
      </Button>
    </div>
  );
}
