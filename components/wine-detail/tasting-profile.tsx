interface TastingProfileProps {
  nose: string | null;
  palate: string | null;
  finish: string | null;
}

/**
 * Three-block tasting profile (nose / palate / finish) used for spirits —
 * more granular than the single "Notes de dégustation" block used for
 * wine. Renders nothing if none of the three fields are set, and skips any
 * block that's individually empty (never shows an empty/undefined line).
 */
export function TastingProfile({ nose, palate, finish }: TastingProfileProps) {
  const blocks = [
    { key: "nose", label: "Nez", value: nose },
    { key: "palate", label: "Bouche", value: palate },
    { key: "finish", label: "Finale", value: finish },
  ].filter((b) => b.value);

  if (blocks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {blocks.map((block) => (
        <div key={block.key} className="rounded-sm border border-brun-ambre/25 bg-brun-ambre/5 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-cuivre">{block.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-noir-profond/80">{block.value}</p>
        </div>
      ))}
    </div>
  );
}
