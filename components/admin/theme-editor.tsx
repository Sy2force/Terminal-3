"use client";

import { useMemo, useState } from "react";
import { saveThemeAction, type ThemeValues } from "@/app/admin/appearance/actions";
import { DESIGN_TOKEN_GROUPS, themeToCssVars } from "@/lib/theme-tokens";

function isTextToken(key: string, value: string): boolean {
  if (key === "headingFont" || key === "bodyFont") return true;
  if (key === "borderRadius" || key === "maxContentWidth") return true;
  if (!value.startsWith("#")) return true;
  return false;
}


export function ThemeEditor({ initial }: { initial: ThemeValues | null }) {
  const base = useMemo(
    () => ({ ...Object.fromEntries(DESIGN_TOKEN_GROUPS.flatMap((g) => g.tokens).map((t) => [t.key, t.defaultValue])), ...(initial ?? {}) }),
    [initial],
  );
  const [values, setValues] = useState<ThemeValues>(base);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const previewCssVars = useMemo(() => themeToCssVars(values), [values]);

  function updateValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

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

  const brandColors = useMemo(() => {
    return [
      { name: "Noir profond", var: "--t3-noir-profond" },
      { name: "Noir chaud", var: "--t3-noir-chaud" },
      { name: "Brun cave", var: "--t3-brun-cave" },
      { name: "Bordeaux", var: "--t3-bordeaux-principal" },
      { name: "Or", var: "--t3-or-principal" },
      { name: "Crème", var: "--t3-creme" },
      { name: "Fond papier", var: "--t3-fond-papier" },
      { name: "Gris chaud", var: "--t3-gris-chaud" },
    ];
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gris-chaud">
          Modifiez les couleurs et les paramètres typographiques. La prévisualisation se met à jour en direct.
        </p>

        {DESIGN_TOKEN_GROUPS.map((group) => (
          <details key={group.label} className="rounded-sm border border-beige-fonce bg-fond-papier" open>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-noir-profond">
              {group.label}
            </summary>
            <div className="space-y-4 border-t border-beige-fonce p-4">
              {group.tokens.map(({ key, label, defaultValue }) => {
                const value = values[key] ?? defaultValue;
                const textLike = isTextToken(key, value);
                return (
                  <label key={key} className="flex flex-col gap-1.5 text-sm text-noir-profond">
                    <span className="text-xs font-medium uppercase tracking-wider text-gris-chaud">{label}</span>
                    {textLike ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profound focus:border-or-principal focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={value.startsWith("#") && value.length === 7 ? value : defaultValue}
                          onChange={(e) => updateValue(key, e.target.value)}
                          className="h-10 w-16 rounded-sm border border-beige-fonce bg-fond-papier"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateValue(key, e.target.value)}
                          className="flex-1 rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
                        />
                        <span className="text-[10px] text-gris-chaud">{defaultValue}</span>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </details>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-bordeaux-principal px-6 py-2.5 text-sm font-semibold text-texte-clair hover:bg-bordeaux-fonce disabled:opacity-50"
          >
            {pending ? "Enregistrement..." : "Enregistrer l'apparence"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {saved && <p className="text-sm text-green-700">Apparence enregistrée.</p>}
        </div>
      </form>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <h2 className="font-serif text-xl text-noir-profond">Prévisualisation</h2>

        <div
          className="rounded-sm p-6 shadow-sm"
          style={{
            ...previewCssVars,
            backgroundColor: previewCssVars["--t3-noir-profond"],
            color: previewCssVars["--t3-texte-clair"],
            fontFamily: previewCssVars["--font-body"],
          }}
        >
          <div className="mb-6 flex flex-wrap gap-3">
            {brandColors.map(({ name, var: variable }) => {
              return (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 rounded-sm border border-white/10 shadow-sm"
                    style={{ backgroundColor: `var(${variable})` }}
                  />
                  <span className="max-w-[5rem] truncate text-[10px] text-center text-[var(--t3-texte-clair)]/80">{name}</span>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-sm p-5"
            style={{
              backgroundColor: previewCssVars["--t3-fond-papier"],
              color: previewCssVars["--t3-noir-profond"],
              borderRadius: previewCssVars["--radius-card"],
            }}
          >
            <h3
              className="font-serif text-2xl"
              style={{ fontFamily: previewCssVars["--font-heading"] }}
            >
              Terminal 3
            </h3>
            <p className="mt-2 text-sm opacity-90" style={{ fontFamily: previewCssVars["--font-body"] }}>
              Cave à vin et épicerie fine à Jérusalem.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-sm px-4 py-2 text-xs font-medium"
                style={{
                  backgroundColor: previewCssVars["--t3-bordeaux-principal"],
                  color: previewCssVars["--t3-texte-clair"],
                  borderRadius: previewCssVars["--radius-button"],
                }}
              >
                Découvrir
              </button>
              <button
                type="button"
                className="rounded-sm border px-4 py-2 text-xs font-medium"
                style={{
                  borderColor: previewCssVars["--t3-bordeaux-principal"],
                  color: previewCssVars["--t3-bordeaux-principal"],
                  borderRadius: previewCssVars["--radius-button"],
                }}
              >
                Ajouter
              </button>
              <span
                className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
                style={{
                  borderColor: previewCssVars["--t3-or-principal"],
                  color: previewCssVars["--t3-or-principal"],
                }}
              >
                Promo
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-xs">
            <div
              className="rounded-sm p-3"
              style={{
                backgroundColor: previewCssVars["--admin-success"],
                color: previewCssVars["--t3-texte-clair"],
              }}
            >
              Message de succès
            </div>
            <div
              className="rounded-sm p-3"
              style={{
                backgroundColor: previewCssVars["--admin-warning"],
                color: previewCssVars["--t3-texte-clair"],
              }}
            >
              Message d&apos;avertissement
            </div>
            <div
              className="rounded-sm p-3"
              style={{
                backgroundColor: previewCssVars["--admin-danger"],
                color: previewCssVars["--t3-texte-clair"],
              }}
            >
              Message d&apos;erreur
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
