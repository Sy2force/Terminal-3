"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, AlertCircle, ImageIcon } from "lucide-react";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface ImageUploaderProps {
  bucket?: "product-images" | "content-images" | "brand-assets" | "media-library";
  folder?: string;
  onUploaded: (url: string) => void;
  onUploading?: (uploading: boolean) => void;
  label?: string;
  className?: string;
  preview?: boolean;
}

export function ImageUploader({
  bucket = "product-images",
  folder,
  onUploaded,
  onUploading,
  label = "Ajouter une image",
  className = "",
  preview = true,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Formats acceptés : JPEG, PNG, WebP, AVIF.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Fichier trop lourd (max ${MAX_SIZE_MB} Mo).`;
    }
    return null;
  }

  async function upload(file: File) {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }

    setUploading(true);
    onUploading?.(true);
    setError(null);
    setProgress(0);

    if (preview) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      setUploading(false);
      onUploading?.(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          onUploaded(json.url as string);
          setPreviewUrl(null);
        } catch {
          setError("Réponse de l'upload invalide.");
        }
      } else {
        try {
          const json = JSON.parse(xhr.responseText);
          setError(json.error ?? "Échec de l'upload");
        } catch {
          setError("Échec de l'upload");
        }
      }
      if (inputRef.current) inputRef.current.value = "";
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      onUploading?.(false);
      setError("Échec de l'upload");
    });

    xhr.send(formData);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        aria-label={label}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-fit inline-flex items-center gap-2 rounded-sm border border-beige-fonce bg-white px-4 py-2 text-sm font-medium text-noir-profond hover:bg-creme disabled:opacity-50"
      >
        <ImageIcon className="h-4 w-4" />
        {uploading ? `Upload ${progress}%` : label}
      </button>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Zone de glisser-déposer d'image"
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? "border-or-principal bg-or-principal/5"
            : "border-beige-fonce bg-creme hover:border-or-principal/60"
        }`}
      >
        <Upload className={`h-8 w-8 ${dragOver ? "text-or-principal" : "text-gris-chaud"}`} />
        <p className="text-center text-sm text-gris-chaud">
          Glissez une image ici, ou cliquez pour choisir
        </p>
        <p className="text-center text-xs text-gris-chaud">
          JPEG, PNG, WebP, AVIF — max {MAX_SIZE_MB} Mo
        </p>

        {uploading && (
          <div className="w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-beige-fonce">
              <div
                className="h-full rounded-full bg-or-principal transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-gris-chaud">{progress}%</p>
          </div>
        )}

        {previewUrl && !uploading && (
          <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-sm border border-beige-fonce">
            <img src={previewUrl} alt="Aperçu" className="h-full w-full object-contain" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-bordeaux-principal">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
