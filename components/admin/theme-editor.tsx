"use client";

import { useState } from "react";
import { saveThemeAction, type ThemeValue } from "@/app/admin/appearance/actions";

const FIELDS: { key: keyof ThemeValue; label: string; type: "color" | "text" }[] = [
  { key: "primaryColor", label: "Couleur principale", type: "color" },
  { key: "secondaryColor", label: "Couleur secondaire", type: "color" },
  { key: "accentColor", label: "Couleur d'accent", type: "color" },
  { key: "bgDark", label: "Fond sombre", type: "color" },
  { key: "bgLight", label: "Fond clair", type: "color" },
  { key: "textLight", label: "Texte clair", type: "color" },
  { key: "textDark", label: "Texte foncé", type: "color" },
  { key: "headingFont", label: "Police des titres", type: "text" },
  { key: "bodyFont", label: "Police des paragraphes", type: "text" },
  { key: "borderRadius", label: "Rayon des bordures", type: "text" },
  { key: "maxContentWidth", label: "Largeur max. du contenu", type: "text" },
];

export function ThemeEditor({ initial }: { initial: ThemeValue | null }) {
  const [values, setValues] = useState<ThemeValue>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    const result = await saveThemeAction(values);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-beige-fonce bg-white p-6">
      {FIELDS.map(({ key, label, type }) => (
        <label key={key} className="flex flex-col gap-1.5 text-sm text-noir-profond">
          {label}
          {type === "color" ? (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={values[key] || "#000000"}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="h-10 w-16 rounded-sm border border-beige-fonce bg-fond-papier"
              />
              <input
                type="text"
                value={values[key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="flex-1 rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
              />
            </div>
          ) : (
            <input
              type="text"
              value={values[key] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond"
            />
          )}
        </label>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond hover:bg-or-clair disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Enregistrer l'apparence"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Apparence enregistrée.</p>}
    </form>
  );
}
