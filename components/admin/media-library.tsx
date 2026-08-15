"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Pencil, Film, Search, Check, X } from "lucide-react";
import { updateMediaMetaAction, deleteMediaAction } from "@/app/admin/medias/actions";
import type { MediaWithUsage } from "@/lib/data/media";
import { Button } from "@/components/admin/button";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function MediaLibrary({ initialMedia }: { initialMedia: MediaWithUsage[] }) {
  const [items, setItems] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const folders = useMemo(() => {
    const set = new Set(items.map((m) => m.folder));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (folder !== "all" && m.folder !== folder) return false;
      if (search && !m.filename.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, folder]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "media-library");
    formData.append("folder", "general");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Échec de l'upload");
        return;
      }
      // Optimistic entry — a full refresh (router.refresh in parent) would
      // also work, but this avoids a round trip for immediate feedback.
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          filename: file.name,
          original_url: json.url,
          thumbnail_url: null,
          alt: null,
          kind: file.type.startsWith("video/") ? "video" : "image",
          mime_type: file.type,
          file_size_bytes: file.size,
          width: null,
          height: null,
          duration_seconds: null,
          folder: "general",
          uploaded_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 0,
        },
        ...prev,
      ]);
    } catch {
      setError("Échec de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaWithUsage) {
    if (item.usage_count > 0) {
      setError(`« ${item.filename} » est utilisé à ${item.usage_count} endroit(s) et ne peut pas être supprimé.`);
      return;
    }
    if (!confirm(`Supprimer définitivement « ${item.filename} » ?`)) return;
    const result = await deleteMediaAction(item.id);
    if (!result.success) {
      setError(result.error === "media_in_use" ? "Ce média est utilisé et ne peut pas être supprimé." : "Échec de la suppression.");
      return;
    }
    setItems((prev) => prev.filter((m) => m.id !== item.id));
  }

  async function handleSaveAlt(item: MediaWithUsage, alt: string) {
    const result = await updateMediaMetaAction(item.id, { alt });
    if (result.success) {
      setItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, alt } : m)));
      setEditingId(null);
    } else {
      setError("Échec de l'enregistrement.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} icon={Upload}>
          {uploading ? "Envoi..." : "Importer un média"}
        </Button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71695F]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un fichier..."
            className="w-full rounded-sm border border-[#E7DECE] bg-white py-2 pl-9 pr-3 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
          />
        </div>

        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
        >
          {folders.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "Tous les dossiers" : f}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-sm border border-[#9B3444]/30 bg-[#9B3444]/10 px-4 py-2 text-sm text-[#9B3444]">
          {error}
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-sm border border-[#E7DECE] bg-white shadow-sm">
            <div className="relative aspect-square bg-[#FBF8F1]">
              {item.kind === "video" ? (
                <div className="flex h-full w-full items-center justify-center text-[#71695F]">
                  <Film className="h-8 w-8" />
                </div>
              ) : (
                <Image src={item.original_url} alt={item.alt ?? item.filename} fill className="object-cover" sizes="200px" />
              )}
              {item.usage_count > 0 && (
                <span className="absolute right-2 top-2 rounded-sm bg-[#56705A] px-1.5 py-0.5 text-[10px] text-white">
                  Utilisé ({item.usage_count})
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium text-[#151411]" title={item.filename}>
                {item.filename}
              </p>
              <p className="mt-0.5 text-[10px] text-[#71695F]">{formatSize(item.file_size_bytes)}</p>

              {editingId === item.id ? (
                <AltEditor
                  initial={item.alt ?? ""}
                  onSave={(alt) => handleSaveAlt(item, alt)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    className="rounded-sm p-1 text-[#71695F] hover:bg-[#FBF8F1]"
                    aria-label="Modifier le texte alternatif"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-sm p-1 text-[#9B3444] hover:bg-[#9B3444]/10"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[#71695F]">
            Aucun média. Importez votre première image ou vidéo.
          </p>
        )}
      </div>
    </div>
  );
}

function AltEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="mt-2 flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Texte alternatif"
        className="w-full rounded-sm border border-[#E7DECE] px-2 py-1 text-xs focus:border-[#C6A15B] focus:outline-none"
        autoFocus
      />
      <button type="button" onClick={() => onSave(value)} className="rounded-sm p-1 text-[#56705A] hover:bg-[#56705A]/10">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onCancel} className="rounded-sm p-1 text-[#71695F] hover:bg-[#FBF8F1]">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
