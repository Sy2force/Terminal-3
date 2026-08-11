"use client";

import { useRef, useState } from "react";

interface ImageUploaderProps {
  bucket?: "product-images" | "content-images" | "brand-assets";
  onUploaded: (url: string) => void;
  label?: string;
}

export function ImageUploader({
  bucket = "product-images",
  onUploaded,
  label = "Ajouter une image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Échec de l'upload");
        return;
      }
      onUploaded(json.url as string);
    } catch {
      setError("Échec de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-fit rounded-full border border-champagne/40 px-4 py-2 text-xs font-medium text-champagne transition-colors hover:bg-champagne hover:text-obsidian disabled:opacity-50"
      >
        {uploading ? "Upload..." : label}
      </button>
      {error && <span className="text-xs text-amber-400">{error}</span>}
    </div>
  );
}
