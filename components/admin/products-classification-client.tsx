"use client";

import { useState, useCallback, useTransition } from "react";
import { classifyProductAction } from "@/lib/classification/server";
import { ProductClassificationPreview } from "./product-classification-preview";
import type { ClassificationResult } from "@/lib/classification";
import { Search } from "lucide-react";

export function ProductsClassificationClient() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runClassification = useCallback((value: string) => {
    if (!value.trim()) {
      setResult(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await classifyProductAction(value);
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors du classement.");
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim().length > 2) {
      runClassification(value);
    }
  };

  const handleBlur = () => {
    runClassification(name);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-champagne/20 bg-obsidian/40 p-6">
        <h2 className="mb-4 font-serif text-xl text-ivory">Testeur de classement</h2>
        <p className="mb-4 text-sm text-ivory/70">
          Saisis un nom de produit pour voir la classification automatique proposée. Aucune donnée n’est modifiée.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/50" />
          <input
            type="text"
            value={name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ex: Glenfiddich 12 ans 700 ml"
            className="w-full rounded-full border border-ivory/20 bg-noir-profond py-2.5 pl-10 pr-4 text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne focus:outline-none"
          />
        </div>
        {isPending && <p className="mt-2 text-xs text-ivory/50">Analyse en cours…</p>}
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>

      <ProductClassificationPreview result={result} />

      <div className="rounded-xl border border-champagne/20 bg-obsidian/40 p-6">
        <h2 className="mb-4 font-serif text-xl text-ivory">Règles intégrées actives</h2>
        <p className="text-sm text-ivory/70">
          {isPending
            ? "Chargement…"
            : "Les règles seront administrables ici après application de la migration 0040_classification_rules."}
        </p>
      </div>
    </div>
  );
}
