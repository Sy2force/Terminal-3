"use client";

import { useRef, useState } from "react";
import { importProductsCsvAction, type CsvImportResult } from "@/app/admin/products/import/actions";

export function CsvImportForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Sélectionnez un fichier CSV.");
      return;
    }
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const res = await importProductsCsvAction(text);
      setResult(res);
    } catch {
      setError("Échec de la lecture du fichier.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-beige-fonce bg-creme p-4 text-sm text-noir-profond/70">
        <p className="mb-2 font-medium text-noir-profond">Colonnes attendues (en-tête CSV) :</p>
        <code className="block overflow-x-auto rounded-sm bg-black/40 p-2 text-xs text-or-principal">
          slug,name_he,name_fr,category_slug,base_price_agorot,brand,description_fr,status,age_restricted
        </code>
        <p className="mt-2 text-xs">
          Les colonnes slug, name_he, name_fr, category_slug et base_price_agorot sont obligatoires.
          Chaque produit importé est créé en brouillon par défaut sauf si status=published.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="block w-full text-sm text-noir-profond/70 file:mr-4 file:rounded-full file:border-0 file:bg-or-principal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-noir-profond"
      />

      <button
        type="button"
        onClick={handleImport}
        disabled={importing}
        className="rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair disabled:opacity-50"
      >
        {importing ? "Import en cours..." : "Importer"}
      </button>

      {error && <p className="text-sm text-amber-700">{error}</p>}

      {result && (
        <div className="rounded-sm border border-beige-fonce p-4">
          <p className="text-sm text-noir-profond">
            {result.created} créé(s) sur {result.total}, {result.failed} échec(s).
          </p>
          {result.rows.some((r) => !r.success) && (
            <ul className="mt-3 space-y-1 text-xs text-amber-700">
              {result.rows.filter((r) => !r.success).map((r) => (
                <li key={r.row}>Ligne {r.row} ({r.slug || "sans slug"}) : {r.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
