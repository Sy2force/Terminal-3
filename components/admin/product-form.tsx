"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductFormData,
} from "@/app/admin/products/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type {
  CategoryRow,
  ProductRow,
  ProductVariantRow,
  ProductMediaRow,
  ProductMediaKind,
} from "@/types/database";

interface ProductFormProps {
  categories: CategoryRow[];
  initial?: ProductRow & { variants: ProductVariantRow[]; media: ProductMediaRow[] };
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [variants, setVariants] = useState<Partial<ProductVariantRow>[]>(
    initial?.variants.length ? initial.variants : [{ label: "Défaut" }],
  );
  const [media, setMedia] = useState<Partial<ProductMediaRow>[]>(
    initial?.media.length ? initial.media : [],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const product: ProductFormData = {
      slug: String(formData.get("slug")),
      category_id: (formData.get("category_id") as string) || null,
      product_type: (formData.get("product_type") as "STANDARD" | "PLATTER") ?? "STANDARD",
      brand: String(formData.get("brand") || "") || null,
      name_he: String(formData.get("name_he")),
      name_fr: String(formData.get("name_fr") || "") || null,
      name_en: String(formData.get("name_en") || "") || null,
      description_he: String(formData.get("description_he") || "") || null,
      description_fr: String(formData.get("description_fr") || "") || null,
      description_en: String(formData.get("description_en") || "") || null,
      origin: String(formData.get("origin") || "") || null,
      tasting_notes: String(formData.get("tasting_notes") || "") || null,
      pairing_notes: String(formData.get("pairing_notes") || "") || null,
      how_to_serve: String(formData.get("how_to_serve") || "") || null,
      storage_info: String(formData.get("storage_info") || "") || null,
      kosher_status: String(formData.get("kosher_status") || "") || null,
      allergen_info: String(formData.get("allergen_info") || "") || null,
      age_restricted: formData.get("age_restricted") === "on",
      status: (formData.get("status") as "draft" | "published" | "archived") ?? "draft",
      is_featured: formData.get("is_featured") === "on",
      availability_status:
        (formData.get("availability_status") as ProductFormData["availability_status"]) ??
        "IN_STOCK",
      base_price_agorot: parseOptionalInt(formData.get("base_price_agorot")),
      compare_at_price_agorot: parseOptionalInt(formData.get("compare_at_price_agorot")),
      meta_title: String(formData.get("meta_title") || "") || null,
      meta_description: String(formData.get("meta_description") || "") || null,
      serves_min: parseOptionalInt(formData.get("serves_min")),
      serves_max: parseOptionalInt(formData.get("serves_max")),
      composition_text: String(formData.get("composition_text") || "") || null,
      advance_order_hours: Number(formData.get("advance_order_hours") || 0),
      customizable: formData.get("customizable") === "on",
      preparation_time_minutes: parseOptionalInt(formData.get("preparation_time_minutes")),
      new_until: (formData.get("new_until") as string) || null,
    };

    const payload = {
      product,
      variants: variants.map((v, index) => ({
        label: v.label || `Variante ${index + 1}`,
        sku: v.sku ?? null,
        weight_g: v.weight_g ?? null,
        volume_ml: v.volume_ml ?? null,
        abv: v.abv ?? null,
        vintage: v.vintage ?? null,
        regular_price_agorot: v.regular_price_agorot ?? null,
        is_default: v.is_default ?? index === 0,
        limited_stock: v.limited_stock ?? false,
        availability_status: v.availability_status ?? "IN_STOCK",
        display_order: v.display_order ?? index,
        status: v.status ?? "published",
      })),
      media: media.map((m, index) => ({
        url: m.url || "",
        alt: m.alt ?? null,
        kind: (m.kind as ProductMediaKind) ?? "GALLERY",
        display_order: m.display_order ?? index,
      })),
    };

    setSaving(true);
    const result = initial
      ? await updateProductAction(initial.id, payload)
      : await createProductAction(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  const coverMedia = media.find((m) => m.kind === "COVER") ?? media[0];
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-sm border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-400">
          {error}
        </div>
      )}

      {/* PHOTO */}
      <Section title="Photo">
        <div className="flex flex-col gap-4">
          {coverMedia?.url ? (
            <div className="relative h-48 w-48 overflow-hidden rounded-sm bg-warm-black">
              <Image src={coverMedia.url} alt={coverMedia.alt ?? "Photo produit"} fill className="object-contain" sizes="192px" />
            </div>
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-sm border border-amber-400/30 bg-amber-400/5 text-center text-xs text-amber-400">
              ⚠ Photo manquante
            </div>
          )}
          <ImageUploader
            bucket="product-images"
            onUploaded={(url) => {
              const existing = media.filter((m) => m.kind !== "COVER");
              setMedia([{ url, kind: "COVER", alt: null, display_order: 0 }, ...existing]);
            }}
            label={coverMedia?.url ? "Remplacer la photo" : "Ajouter une photo"}
          />
          {coverMedia?.url && (
            <button
              type="button"
              onClick={() => {
                setMedia(media.filter((m) => m.kind !== "COVER" && m.url !== coverMedia.url));
              }}
              className="w-fit text-xs text-amber-400 hover:text-amber-300"
            >
              Supprimer la photo
            </button>
          )}
        </div>
      </Section>

      {/* NOM + CATÉGORIE */}
      <Section title="Informations principales">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="name_fr" label="Nom (français)" defaultValue={initial?.name_fr ?? ""} />
          <Field name="name_he" label="Nom (hébreu) *" defaultValue={initial?.name_he} required />
          <Select
            name="category_id"
            label="Catégorie"
            defaultValue={initial?.category_id ?? ""}
            options={[{ value: "", label: "Aucune" }, ...categories.map((c) => ({ value: c.id, label: c.name_fr || c.name_he }))]}
          />
          <Field name="brand" label="Marque" defaultValue={initial?.brand ?? ""} />
        </div>
      </Section>

      {/* PRIX */}
      <Section title="Prix">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="base_price_agorot" label="Prix de base (agorot)" type="number" defaultValue={initial?.base_price_agorot ?? ""} />
          <Field name="compare_at_price_agorot" label="Prix comparé (agorot)" type="number" defaultValue={initial?.compare_at_price_agorot ?? ""} />
          <Select
            name="availability_status"
            label="Disponibilité"
            defaultValue={initial?.availability_status ?? "IN_STOCK"}
            options={[
              { value: "IN_STOCK", label: "En stock" },
              { value: "LOW_STOCK", label: "Stock faible" },
              { value: "OUT_OF_STOCK", label: "Rupture" },
              { value: "PREORDER", label: "Précommande" },
              { value: "ON_REQUEST", label: "Sur commande" },
            ]}
          />
        </div>
      </Section>

      {/* DESCRIPTION */}
      <Section title="Description">
        <TextArea name="description_fr" label="Description (français)" defaultValue={initial?.description_fr ?? ""} />
        <TextArea name="description_he" label="Description (hébreu)" defaultValue={initial?.description_he ?? ""} />
      </Section>

      {/* PUBLICATION */}
      <Section title="Publication">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            name="status"
            label="Statut"
            defaultValue={initial?.status ?? "draft"}
            options={[
              { value: "draft", label: "Brouillon" },
              { value: "published", label: "Publié" },
              { value: "archived", label: "Archivé" },
            ]}
          />
          <Field name="new_until" label="Nouveau jusqu'à" type="datetime-local" defaultValue={initial?.new_until ? initial.new_until.slice(0, 16) : ""} />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-ivory/80">
            <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} className="h-4 w-4 accent-champagne" />
            Mis en avant
          </label>
          <label className="flex items-center gap-2 text-sm text-ivory/80">
            <input type="checkbox" name="age_restricted" defaultChecked={initial?.age_restricted ?? false} className="h-4 w-4 accent-champagne" />
            18+
          </label>
        </div>
      </Section>

      {/* VARIANTES */}
      <Section title="Variantes (poids, formats)">
        <VariantEditor variants={variants} onChange={setVariants} />
      </Section>

      {/* ACTIONS PRINCIPALES */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : initial ? "Enregistrer" : "Créer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-muted-grey hover:text-ivory">
          Annuler
        </button>
      </div>

      {/* OPTIONS AVANCÉES */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm text-champagne hover:text-soft-gold"
        >
          {showAdvanced ? "▾ Options avancées" : "▸ Options avancées"}
        </button>
        {showAdvanced && (
          <div className="mt-4 flex flex-col gap-6">
            <Section title="Médias supplémentaires">
              <MediaEditor media={media} onChange={setMedia} />
            </Section>

            <Section title="Détails produit">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="slug" label="Slug (URL)" defaultValue={initial?.slug} required />
                <Select
                  name="product_type"
                  label="Type"
                  defaultValue={initial?.product_type ?? "STANDARD"}
                  options={[
                    { value: "STANDARD", label: "Standard" },
                    { value: "PLATTER", label: "Plateau" },
                  ]}
                />
                <Field name="origin" label="Origine" defaultValue={initial?.origin ?? ""} />
                <Field name="kosher_status" label="Cacherout" defaultValue={initial?.kosher_status ?? ""} />
              </div>
              <TextArea name="description_en" label="Description (anglais)" defaultValue={initial?.description_en ?? ""} />
              <Field name="name_en" label="Nom (anglais)" defaultValue={initial?.name_en ?? ""} />
            </Section>

            <Section title="Notes de dégustation & service">
              <TextArea name="tasting_notes" label="Notes de dégustation" defaultValue={initial?.tasting_notes ?? ""} />
              <TextArea name="pairing_notes" label="Accords mets" defaultValue={initial?.pairing_notes ?? ""} />
              <TextArea name="how_to_serve" label="Service" defaultValue={initial?.how_to_serve ?? ""} />
              <TextArea name="storage_info" label="Conservation" defaultValue={initial?.storage_info ?? ""} />
              <TextArea name="allergen_info" label="Allergènes" defaultValue={initial?.allergen_info ?? ""} />
            </Section>

            <Section title="Plateau (si type = PLATTER)">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field name="serves_min" label="Convient à partir de" type="number" defaultValue={initial?.serves_min ?? ""} />
                <Field name="serves_max" label="Jusqu'à" type="number" defaultValue={initial?.serves_max ?? ""} />
                <Field name="advance_order_hours" label="Délai commande (heures)" type="number" defaultValue={initial?.advance_order_hours ?? 0} />
                <Field name="preparation_time_minutes" label="Préparation (min)" type="number" defaultValue={initial?.preparation_time_minutes ?? ""} />
              </div>
              <TextArea name="composition_text" label="Composition" defaultValue={initial?.composition_text ?? ""} />
              <label className="flex items-center gap-2 text-sm text-ivory/80">
                <input type="checkbox" name="customizable" defaultChecked={initial?.customizable ?? false} className="h-4 w-4 accent-champagne" />
                Personnalisable
              </label>
            </Section>

            <Section title="SEO">
              <Field name="meta_title" label="Meta titre" defaultValue={initial?.meta_title ?? ""} />
              <TextArea name="meta_description" label="Meta description" defaultValue={initial?.meta_description ?? ""} />
            </Section>
          </div>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-sm border border-white/5 bg-graphite/30 p-5">
      <legend className="px-2 font-serif text-lg text-champagne">{title}</legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
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

function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
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

function VariantEditor({
  variants,
  onChange,
}: {
  variants: Partial<ProductVariantRow>[];
  onChange: (v: Partial<ProductVariantRow>[]) => void;
}) {
  function update(index: number, patch: Partial<ProductVariantRow>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function add() {
    onChange([...variants, { label: "" }]);
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.map((v, i) => (
        <div key={i} className="grid gap-3 rounded-sm border border-white/5 p-3 sm:grid-cols-4">
          <input value={v.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory" />
          <input value={v.sku ?? ""} onChange={(e) => update(i, { sku: e.target.value })} placeholder="SKU" className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory" />
          <input type="number" value={v.regular_price_agorot ?? ""} onChange={(e) => update(i, { regular_price_agorot: e.target.value ? Number(e.target.value) : null })} placeholder="Prix (agorot)" className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory" />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-ivory/70">
              <input type="checkbox" checked={!!v.is_default} onChange={(e) => update(i, { is_default: e.target.checked })} className="accent-champagne" />
              Défaut
            </label>
            <button type="button" onClick={() => remove(i)} className="ml-auto text-xs text-amber-400 hover:text-amber-300">
              Supprimer
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit rounded-full border border-champagne/40 px-4 py-2 text-xs font-medium text-champagne hover:bg-champagne hover:text-obsidian">
        + Ajouter une variante
      </button>
    </div>
  );
}

function MediaEditor({
  media,
  onChange,
}: {
  media: Partial<ProductMediaRow>[];
  onChange: (m: Partial<ProductMediaRow>[]) => void;
}) {
  function update(index: number, patch: Partial<ProductMediaRow>) {
    onChange(media.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function add() {
    onChange([...media, { kind: "GALLERY" }]);
  }

  function remove(index: number) {
    onChange(media.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <ImageUploader
        bucket="product-images"
        onUploaded={(url) => onChange([...media, { url, kind: "GALLERY" }])}
        label="Uploader une image"
      />
      {media.map((m, i) => (
        <div key={i} className="grid gap-3 rounded-sm border border-white/5 p-3 sm:grid-cols-4">
          <input value={m.url ?? ""} onChange={(e) => update(i, { url: e.target.value })} placeholder="URL image" className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory" />
          <input value={(m.alt as string) ?? ""} onChange={(e) => update(i, { alt: e.target.value })} placeholder="Alt text" className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory" />
          <select value={m.kind ?? "GALLERY"} onChange={(e) => update(i, { kind: e.target.value as ProductMediaKind })} className="rounded-sm border border-white/10 bg-graphite px-3 py-2 text-sm text-ivory">
            <option value="COVER">Cover</option>
            <option value="GALLERY">Gallery</option>
            <option value="LIFESTYLE">Lifestyle</option>
            <option value="DETAIL">Detail</option>
            <option value="EDITORIAL">Editorial</option>
          </select>
          <button type="button" onClick={() => remove(i)} className="text-left text-xs text-amber-400 hover:text-amber-300 sm:text-right">
            Supprimer
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit rounded-full border border-champagne/40 px-4 py-2 text-xs font-medium text-champagne hover:bg-champagne hover:text-obsidian">
        + Ajouter une image
      </button>
    </div>
  );
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
