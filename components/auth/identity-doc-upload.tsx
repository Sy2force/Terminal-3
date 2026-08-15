"use client";

import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerIdentityDocument } from "@/app/inscription/actions";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"];

/**
 * Resizes/re-encodes an image through a canvas before upload. This keeps
 * files small and — as a side effect of the re-encode — strips any EXIF
 * metadata (GPS, device info) the original photo might have carried.
 * HEIC files can't reliably be decoded into a canvas in most browsers; for
 * those we fall back to uploading the original file untouched.
 */
async function compressImage(file: File): Promise<{ blob: Blob; contentType: string }> {
  if (file.type === "image/heic" || file.type === "image/heif") {
    return { blob: file, contentType: file.type };
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { blob: file, contentType: file.type };

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, contentType: file.type };
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) return { blob: file, contentType: file.type };
  return { blob, contentType: "image/jpeg" };
}

export function IdentityDocUpload({
  userId,
  side,
  label,
  onUploaded,
}: {
  userId: string;
  side: "front" | "back";
  label: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formats acceptés : JPG, PNG ou HEIC.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Le fichier dépasse la taille maximale (8 Mo).");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    try {
      const { blob, contentType } = await compressImage(file);
      const path = `${userId}/${side}-${Date.now()}.${contentType === "image/jpeg" ? "jpg" : "bin"}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("identity-docs")
        .upload(path, blob, { contentType, upsert: false });

      if (uploadError) {
        setError("Échec de l'envoi du document. Réessayez.");
        setStatus("error");
        return;
      }

      const result = await registerIdentityDocument({
        storagePath: path,
        fileName: file.name,
        contentType,
        fileSizeBytes: blob.size,
        side,
      });

      if (!result.success) {
        setError(result.error ?? "Échec de l'enregistrement du document.");
        setStatus("error");
        return;
      }

      setPreviewUrl(URL.createObjectURL(blob));
      setStatus("done");
      onUploaded?.();
    } catch {
      setError("Une erreur est survenue pendant le traitement de l'image.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-sm border border-white/10 bg-graphite p-4">
      <p className="text-sm font-medium text-ivory">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        {previewUrl ? (
          // next/image cannot render blob: object URLs — this is a local preview only.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-20 w-20 rounded-sm object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-dashed border-white/15 text-muted-grey">
            <Camera className="h-6 w-6" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
            className="flex items-center gap-2 rounded-full border border-champagne/40 px-4 py-2 text-xs font-medium text-champagne transition-colors hover:bg-champagne/10 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {status === "uploading" ? "Envoi..." : previewUrl ? "Remplacer" : "Photographier / importer"}
          </button>
          {status === "done" && (
            <span className="flex items-center gap-1 text-xs text-champagne">
              <CheckCircle2 className="h-3.5 w-3.5" /> Document envoyé
            </span>
          )}
          {status === "error" && error && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
