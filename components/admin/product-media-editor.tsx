"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "./image-uploader";
import { Star, Trash2, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import type { ProductMediaRow, ProductMediaKind } from "@/types/database";

interface ProductMediaEditorProps {
  media: Partial<ProductMediaRow>[];
  onChange: (media: Partial<ProductMediaRow>[]) => void;
}

export function ProductMediaEditor({ media, onChange }: ProductMediaEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addMedia = (url: string) => {
    onChange([
      ...media,
      { url, kind: "GALLERY" as ProductMediaKind, alt: "", display_order: media.length },
    ]);
  };

  const removeMedia = (index: number) => {
    const next = media.filter((_, i) => i !== index);
    onChange(next.map((m, i) => ({ ...m, display_order: i })));
  };

  const setKind = (index: number, kind: ProductMediaKind) => {
    const next = media.map((m, i) => {
      if (kind === "COVER" && i !== index) {
        return { ...m, kind: m.kind === "COVER" ? ("GALLERY" as ProductMediaKind) : m.kind };
      }
      return m;
    });
    next[index] = { ...next[index], kind };
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= media.length) return;
    const next = [...media];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((m, i) => ({ ...m, display_order: i })));
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    move(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="space-y-4">
      <ImageUploader
        bucket="product-images"
        onUploaded={addMedia}
        label="Ajouter une image"
        className="max-w-md"
      />

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-beige-fonce bg-creme p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-gris-chaud" />
          <p className="mt-2 text-sm text-gris-chaud">
            Aucune image. Glissez-déposez ou cliquez pour ajouter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((m, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative rounded-xl border ${
                m.kind === "COVER" ? "border-or-principal ring-1 ring-or-principal" : "border-beige-fonce"
              } bg-white p-2 shadow-sm transition hover:shadow-md`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-creme">
                {m.url ? (
                  <Image src={m.url} alt={m.alt ?? "Image produit"} fill className="object-contain" sizes="160px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gris-chaud">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setKind(i, m.kind === "COVER" ? "GALLERY" : "COVER")}
                  className={`rounded-sm p-1.5 text-xs ${
                    m.kind === "COVER"
                      ? "bg-or-principal/10 text-or-principal"
                      : "text-gris-chaud hover:bg-creme"
                  }`}
                  title={m.kind === "COVER" ? "Couverture" : "Définir comme couverture"}
                >
                  <Star className="h-4 w-4" fill={m.kind === "COVER" ? "currentColor" : "none"} />
                </button>

                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="rounded-sm p-1.5 text-gris-chaud hover:bg-creme disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === media.length - 1}
                  className="rounded-sm p-1.5 text-gris-chaud hover:bg-creme disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="rounded-sm p-1.5 text-bordeaux-principal hover:bg-bordeaux-principal/10"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {m.kind === "COVER" && (
                <span className="absolute left-2 top-2 rounded-sm bg-or-principal px-1.5 py-0.5 text-[10px] font-semibold text-noir-profond">
                  Couverture
                </span>
              )}

              <input
                type="text"
                value={m.alt ?? ""}
                onChange={(e) => {
                  const next = [...media];
                  next[i] = { ...next[i], alt: e.target.value };
                  onChange(next);
                }}
                placeholder="Texte alternatif"
                className="mt-2 w-full rounded-sm border border-beige-fonce bg-creme px-2 py-1 text-xs text-noir-profond focus:border-or-principal focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gris-chaud">
        {media.length} image{media.length > 1 ? "s" : ""}. Une seule image peut être définie comme couverture.
      </p>
    </div>
  );
}
