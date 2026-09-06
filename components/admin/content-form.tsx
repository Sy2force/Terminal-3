"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPostAction,
  updatePostAction,
  type ContentFormData,
} from "@/app/admin/content/actions";
import type { ContentPostRow } from "@/types/database";

interface ContentFormProps {
  initial?: ContentPostRow;
}

export function ContentForm({ initial }: ContentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload: ContentFormData = {
      slug: String(formData.get("slug")),
      title: String(formData.get("title")),
      subtitle: String(formData.get("subtitle") || ""),
      hero_image_url: String(formData.get("hero_image_url") || ""),
      category: String(formData.get("category") || ""),
      body: String(formData.get("body") || ""),
      status: (formData.get("status") as ContentFormData["status"]) ?? "draft",
    };

    setSaving(true);
    const result = initial
      ? await updatePostAction(initial.id, payload)
      : await createPostAction(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/content");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug *" name="slug" defaultValue={initial?.slug} required />
        <Field label="Titre *" name="title" defaultValue={initial?.title} required />
      </div>

      <Field label="Sous-titre" name="subtitle" defaultValue={initial?.subtitle ?? ""} />

      <Field label="URL image principale" name="hero_image_url" defaultValue={initial?.hero_image_url ?? ""} />

      <Field label="Catégorie" name="category" defaultValue={initial?.category ?? ""} />

      <label className="flex flex-col gap-2 text-sm text-noir-profond/80">
        Corps de l&apos;article
        <textarea
          name="body"
          defaultValue={initial?.body ?? ""}
          rows={12}
          className="rounded-sm border border-beige-fonce bg-white px-4 py-3 text-noir-profond outline-none focus:border-or-principal"
          placeholder="Contenu de l'article..."
        />
      </label>

      <Select
        name="status"
        label="Statut"
        defaultValue={initial?.status ?? "draft"}
        options={[
          { value: "draft", label: "Brouillon" },
          { value: "scheduled", label: "Programmé" },
          { value: "published", label: "Publié" },
        ]}
      />

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
          onClick={() => router.push("/admin/content")}
          className="text-sm text-gris-chaud hover:text-noir-profond"
        >
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
    <label className="flex flex-col gap-2 text-sm text-noir-profond/80">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-sm border border-beige-fonce bg-white px-4 py-3 text-noir-profond outline-none focus:border-or-principal"
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
    <label className="flex flex-col gap-2 text-sm text-noir-profond/80">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-sm border border-beige-fonce bg-white px-4 py-3 text-sm text-noir-profond outline-none focus:border-or-principal"
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
