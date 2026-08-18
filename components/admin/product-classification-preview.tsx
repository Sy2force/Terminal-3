"use client";

import type { ClassificationResult } from "@/lib/classification";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

interface ProductClassificationPreviewProps {
  result: ClassificationResult | null;
  onConfirm?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
}

const confidenceLabels: Record<string, string> = {
  high: "Élevée",
  medium: "Moyenne",
  low: "Faible",
  unknown: "Inconnue",
};

const confidenceStyles: Record<string, string> = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-orange-400",
  unknown: "text-red-400",
};

const confidenceIcons: Record<string, React.ReactNode> = {
  high: <CheckCircle2 className="h-5 w-5 text-green-400" />,
  medium: <AlertCircle className="h-5 w-5 text-yellow-400" />,
  low: <AlertTriangle className="h-5 w-5 text-orange-400" />,
  unknown: <XCircle className="h-5 w-5 text-red-400" />,
};

export function ProductClassificationPreview({
  result,
  onConfirm,
  onReject,
  onEdit,
}: ProductClassificationPreviewProps) {
  if (!result) return null;

  const hasActions = onConfirm || onReject || onEdit;

  return (
    <div className="space-y-4 rounded-xl border border-champagne/20 bg-obsidian/40 p-5">
      <div className="flex items-center gap-3">
        {confidenceIcons[result.confidence]}
        <div>
          <p className={`font-medium ${confidenceStyles[result.confidence]}`}>
            Confiance : {confidenceLabels[result.confidence]}
          </p>
          <p className="text-sm text-ivory/60">Famille : {result.family}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Marque" value={result.brand ?? "—"} />
        <Field label="Catégorie" value={result.category ?? "—"} />
        <Field label="Sous-catégorie" value={result.subcategory ?? "—"} />
        <Field label="Type" value={result.productType ?? "—"} />
        <Field label="Volume" value={result.volume ?? "—"} />
        <Field label="Poids" value={result.weight ?? "—"} />
        <Field label="Millésime" value={result.vintage ?? "—"} />
        <Field label="Âge" value={result.age ?? "—"} />
        <Field label="Slug proposé" value={result.slug} />
        <Field label="SKU proposé" value={result.suggestedSku} />
      </div>

      {result.matchedRules.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-ivory/80">Règles détectées</p>
          <ul className="list-inside list-disc text-sm text-ivory/60">
            {result.matchedRules.slice(0, 6).map((r, i) => (
              <li key={i}>
                {r.keyword} → {r.categorySlug ?? "?"}
                {r.subcategorySlug ? ` / ${r.subcategorySlug}` : ""}
                {r.brand ? ` (marque ${r.brand})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.reasons.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-ivory/80">Raisons</p>
          <ul className="list-inside list-disc text-sm text-green-300/80">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {result.conflicts.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-ivory/80">Conflits</p>
          <ul className="list-inside list-disc text-sm text-red-300/80">
            {result.conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {hasActions && (
        <div className="flex flex-wrap gap-3 pt-2">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="rounded-full bg-champagne px-4 py-2 text-sm font-semibold text-obsidian hover:bg-soft-gold"
            >
              Confirmer
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-full border border-ivory/30 px-4 py-2 text-sm text-ivory hover:bg-ivory/10"
            >
              Modifier
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Refuser
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ivory/50">{label}</p>
      <p className="text-sm font-medium text-ivory">{value}</p>
    </div>
  );
}
