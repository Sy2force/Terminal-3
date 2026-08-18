"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Check, X } from "lucide-react";
import { useAdminEdit } from "./admin-edit-mode";
import { savePageContentFieldAction } from "@/app/admin/page-content/actions";

interface EditableImageProps {
  slug: string;
  field?: "og_image_url";
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

export function EditableImage({
  slug,
  field = "og_image_url",
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
}: EditableImageProps) {
  const { isEditing } = useAdminEdit();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(src);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await savePageContentFieldAction({
        slug,
        field,
        value,
        pageType: "page",
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const image = value ? (
    fill ? (
      <Image
        src={value}
        alt={alt ?? "Image modifiable"}
        fill
        priority
        loading="eager"
        className={className}
        sizes={sizes}
      />
    ) : (
      <Image
        src={value}
        alt={alt ?? "Image modifiable"}
        width={width ?? 1200}
        height={height ?? 800}
        className={className}
      />
    )
  ) : (
    <div className={`flex items-center justify-center bg-warm-black ${className ?? ""}`}>
      <span className="text-xs text-muted-grey">Image à définir</span>
    </div>
  );

  if (!isEditing) {
    return image;
  }

  return (
    <div className="group relative">
      {image}
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="absolute right-2 top-2 rounded-sm border border-or-principal/50 bg-noir-profond/80 p-1.5 text-or-principal opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir-profond/90 p-4 text-center">
          <p className="mb-2 text-xs text-ivory/70">URL de l&apos;image</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            className="w-full max-w-md rounded-sm border border-or-principal bg-noir-profond px-2 py-1 text-sm text-ivory focus:border-champagne focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-sm bg-green-800 px-3 py-1 text-xs text-ivory hover:bg-green-700"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValue(src);
                setError(null);
              }}
              disabled={saving}
              className="rounded-sm bg-red-900 px-3 py-1 text-xs text-ivory hover:bg-red-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
