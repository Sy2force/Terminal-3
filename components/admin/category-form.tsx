"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormData,
} from "@/app/admin/categories/actions";
import type { CategoryRow } from "@/types/database";
import {
  AdminField as Field,
  AdminTextarea as TextArea,
} from "@/components/admin/form-controls";

interface CategoryFormProps {
  categories: CategoryRow[];
  initial?: CategoryRow;
}

function nullIfEmpty(value: string): string | null {
  return value.trim() || null;
}

export function CategoryForm({ categories, initial }: CategoryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload: CategoryFormData = {
      slug: String(formData.get("slug")),
      name_he: String(formData.get("name_he")),
      name_fr: String(formData.get("name_fr") || ""),
      name_en: String(formData.get("name_en") || ""),
      parent_id: (formData.get("parent_id") as string) || null,
      display_order: Number(formData.get("display_order") || 0),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      cover_image: nullIfEmpty(String(formData.get("cover_image") || "")),
      icon: nullIfEmpty(String(formData.get("icon") || "")),
      short_description: nullIfEmpty(String(formData.get("short_description") || "")),
      description: nullIfEmpty(String(formData.get("description") || "")),
      meta_title: nullIfEmpty(String(formData.get("meta_title") || "")),
      meta_description: nullIfEmpty(String(formData.get("meta_description") || "")),
    };

    setSaving(true);
    const result = initial
      ? await updateCategoryAction(initial.id, payload)
      : await createCategoryAction(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  const parentCandidates = initial
    ? categories.filter((c) => c.id !== initial.id)
    : categories;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={initial?.slug} required />
        <Field
          label="Ordre d'affichage"
          name="display_order"
          type="number"
          defaultValue={initial?.display_order ?? 0}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Nom (hébreu)" name="name_he" defaultValue={initial?.name_he} required />
        <Field label="Nom (français)" name="name_fr" defaultValue={initial?.name_fr ?? ""} />
        <Field label="Nom (anglais)" name="name_en" defaultValue={initial?.name_en ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="parent_id" className="text-sm text-noir-profond/80">
            Catégorie parente
          </label>
          <select
            id="parent_id"
            name="parent_id"
            defaultValue={initial?.parent_id ?? ""}
            className="rounded-sm border border-beige-fonce bg-white px-4 py-3 text-sm text-noir-profond outline-none focus:border-or-principal"
          >
            <option value="">Aucune</option>
            {parentCandidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_fr || c.name_he} ({c.slug})
              </option>
            ))}
          </select>
        </div>
        <Field label="Icône" name="icon" defaultValue={initial?.icon ?? ""} />
      </div>

      <Field label="Image de couverture (URL)" name="cover_image" defaultValue={initial?.cover_image ?? ""} />
      <Field label="Description courte" name="short_description" defaultValue={initial?.short_description ?? ""} />
      <TextArea label="Description" name="description" defaultValue={initial?.description ?? ""} rows={5} />

      <div className="rounded-sm border border-beige-fonce bg-creme p-4">
        <h3 className="mb-3 font-serif text-sm text-or-principal">SEO</h3>
        <div className="flex flex-col gap-4">
          <Field label="Meta titre" name="meta_title" defaultValue={initial?.meta_title ?? ""} />
          <TextArea label="Meta description" name="meta_description" defaultValue={initial?.meta_description ?? ""} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-noir-profond/80">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={initial?.is_active ?? true}
            className="h-4 w-4 accent-or-principal"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-noir-profond/80">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={initial?.is_featured ?? false}
            className="h-4 w-4 accent-or-principal"
          />
          Mise en avant
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold tracking-wide text-noir-profond transition-colors hover:bg-or-clair disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : initial ? "Mettre à jour" : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="text-sm text-gris-chaud hover:text-noir-profond"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}


