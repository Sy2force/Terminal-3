const WINE_TYPE_LABELS: Record<string, string> = {
  ROUGE: "Rouge",
  BLANC: "Blanc",
  ROSE: "Rosé",
  EFFERVESCENT: "Effervescent",
  DOUX: "Doux",
};

interface Spec {
  label: string;
  value: string;
}

export function WineSpecs({ specs }: { specs: Spec[] }) {
  const visible = specs.filter((s) => s.value);
  if (visible.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {visible.map((spec) => (
        <div key={spec.label} className="flex justify-between gap-4 border-b border-brun-cave/10 pb-3">
          <dt className="text-sm text-gris-chaud">{spec.label}</dt>
          <dd className="text-sm font-medium text-noir-profond">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { WINE_TYPE_LABELS };
