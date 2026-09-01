"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createPromotionAction,
  updatePromotionAction,
  type PromotionFormData,
} from "@/app/admin/promotions/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { PromotionRow } from "@/types/database";
import type { ProductWithDetails } from "@/lib/data/products";

interface PromotionFormProps {
  initial?: PromotionRow;
  products?: ProductWithDetails[];
}

export function PromotionForm({ initial, products = [] }: PromotionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload: PromotionFormData = {
      slug: String(formData.get("slug")),
      title: String(formData.get("title")),
      description: String(formData.get("description") || ""),
      product_id: (formData.get("product_id") as string) || null,
      variant_id: (formData.get("variant_id") as string) || null,
      branch_id: (formData.get("branch_id") as string) || null,
      image_url: imageUrl.trim() || null,
      og_image_url: imageUrl.trim() || null,
      regular_price_agorot: Number(formData.get("regular_price_agorot") || 0),
      promo_price_agorot: Number(formData.get("promo_price_agorot") || 0),
      start_at: new Date(String(formData.get("start_at"))).toISOString(),
      end_at: new Date(String(formData.get("end_at"))).toISOString(),
      quantity_limit: Number(formData.get("quantity_limit")) || null,
      members_only: formData.get("members_only") === "on",
      featured: formData.get("featured") === "on",
      status: (formData.get("status") as PromotionFormData["status"]) ?? "draft",
    };

    setSaving(true);
    const result = initial
      ? await updatePromotionAction(initial.id, payload)
      : await createPromotionAction(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/promotions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-sm border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-400">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug *" name="slug" defaultValue={initial?.slug} required />
        <Field label="Titre *" name="title" defaultValue={initial?.title} required />
      </div>

      <TextArea label="Description" name="description" defaultValue={initial?.description ?? ""} />

      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="og_image_url" value={imageUrl} />

      <div className="space-y-3 rounded-sm border border-white/10 bg-graphite/50 p-4">
        <label className="text-sm text-ivory/80">Image de la promotion</label>
        {imageUrl ? (
          <div className="relative h-40 w-full max-w-md overflow-hidden rounded-sm border border-white/10">
            <Image src={imageUrl} alt="Aperçu promotion" fill className="object-cover" sizes="400px" unoptimized />
          </div>
        ) : (
          <p className="text-xs text-muted-grey">Aucune image. Importez-en une.</p>
        )}
        <ImageUploader
          bucket="content-images"
          folder="promotions"
          onUploaded={(url) => setImageUrl(url)}
          label={imageUrl ? "Remplacer l'image" : "Ajouter une image"}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Prix régulier (agorot) *" name="regular_price_agorot" type="number" defaultValue={initial?.regular_price_agorot ?? 0} required />
        <Field label="Prix promo (agorot) *" name="promo_price_agorot" type="number" defaultValue={initial?.promo_price_agorot ?? 0} required />
        <Field label="Quantité max" name="quantity_limit" type="number" defaultValue={initial?.quantity_limit ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Début *" name="start_at" type="datetime-local" defaultValue={initial ? initial.start_at.slice(0, 16) : ""} required />
        <Field label="Fin *" name="end_at" type="datetime-local" defaultValue={initial ? initial.end_at.slice(0, 16) : ""} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Produit lié
          <select
            name="product_id"
            defaultValue={initial?.product_id ?? ""}
            className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-sm text-ivory outline-none focus:border-champagne"
          >
            <option value="">— Aucun —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_fr || p.name_he}
                {p.category ? ` (${p.category.name_fr ?? p.category.name_he})` : ""}
              </option>
            ))}
          </select>
        </label>
        <Field label="Variante liée (ID)" name="variant_id" defaultValue={initial?.variant_id ?? ""} />
      </div>

      <Field label="Filiale (ID)" name="branch_id" defaultValue={initial?.branch_id ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-ivory/80">
          <input type="checkbox" name="members_only" defaultChecked={initial?.members_only ?? false} className="h-4 w-4 accent-champagne" />
          Membres seulement
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory/80">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="h-4 w-4 accent-champagne" />
          Mise en avant
        </label>
      </div>

      <Select
        name="status"
        label="Statut"
        defaultValue={initial?.status ?? "draft"}
        options={[
          { value: "draft", label: "Brouillon" },
          { value: "scheduled", label: "Programmée" },
          { value: "active", label: "Active" },
          { value: "paused", label: "Pause" },
          { value: "expired", label: "Expirée" },
        ]}
      />

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : initial ? "Mettre à jour" : "Créer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/promotions")} className="text-sm text-muted-grey hover:text-ivory">
          Annuler
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-ivory/80">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-ivory/80">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne"
      />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-ivory/80">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-sm border border-white/10 bg-graphite px-4 py-3 text-sm text-ivory outline-none focus:border-champagne"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
