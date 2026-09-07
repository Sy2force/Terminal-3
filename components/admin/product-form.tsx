"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductFormData,
} from "@/app/admin/products/actions";
import { ProductMediaEditor } from "@/components/admin/product-media-editor";
import {
  AdminField as Field,
  AdminSelect as Select,
  AdminTextarea as TextArea,
  AdminCheckbox,
  FormSection as Section,
} from "@/components/admin/form-controls";
import { formatAgorot, formatUnitPrice } from "@/lib/money";
import { isValidWoltUrl } from "@/lib/wolt";
import type { ProductWithDetails } from "@/lib/data/products";
import type { CategoryRow, ProductMediaKind, ProductMediaRow } from "@/types/database";

interface ProductFormProps {
  categories: CategoryRow[];
  initial?: ProductWithDetails;
}

type VariantFormData = {
  id?: string;
  label: string;
  sku?: string | null;
  barcode?: string | null;
  weight_g?: number | null;
  volume_ml?: number | null;
  abv?: number | null;
  vintage?: number | null;
  regular_price_agorot?: number | null;
  is_default?: boolean;
  limited_stock?: boolean;
  availability_status?:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK"
    | "PREORDER"
    | "ON_REQUEST";
  display_order?: number;
  status?: "draft" | "published" | "archived";
  pricing_unit?: "FIXED" | "PACKAGE" | "PER_100G" | "PER_KG" | "FROM" | null;
  packaging?: string | null;
  wolt_enabled?: boolean;
  wolt_url?: string | null;
  quantity?: number | null;
  low_stock_threshold?: number | null;
};

function agorotFromShekelsInput(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function shekelsFromAgorot(agorot: number | null | undefined): string {
  if (agorot == null) return "";
  return (agorot / 100).toFixed(2);
}

function defaultVariantFromInitial(
  v: ProductWithDetails["variants"][number],
): VariantFormData {
  return {
    ...v,
    quantity: v.quantity ?? null,
    low_stock_threshold: v.low_stock_threshold ?? 3,
  };
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<ProductWithDetails | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [variants, setVariants] = useState<VariantFormData[]>(
    initial?.variants.length
      ? initial.variants.map(defaultVariantFromInitial)
      : [{ label: "Défaut", quantity: null, low_stock_threshold: 3 }],
  );
  const [media, setMedia] = useState<Partial<ProductMediaRow>[]>(
    initial?.media.length ? initial.media : [],
  );

  function getFormProduct(formData: FormData): ProductFormData {
    return {
      slug: (formData.get("slug") as string)?.trim() || null,
      category_id: (formData.get("category_id") as string) || null,
      product_type: (formData.get("product_type") as "STANDARD" | "PLATTER") ?? "STANDARD",
      brand: String(formData.get("brand") || "").trim() || null,
      name_he: String(formData.get("name_he") || "").trim() || null,
      name_fr: String(formData.get("name_fr")).trim(),
      name_en: String(formData.get("name_en") || "").trim() || null,
      description_he: String(formData.get("description_he") || "").trim() || null,
      description_fr: String(formData.get("description_fr") || "").trim() || null,
      description_en: String(formData.get("description_en") || "").trim() || null,
      origin: String(formData.get("origin") || "").trim() || null,
      tasting_notes: String(formData.get("tasting_notes") || "").trim() || null,
      pairing_notes: String(formData.get("pairing_notes") || "").trim() || null,
      how_to_serve: String(formData.get("how_to_serve") || "").trim() || null,
      storage_info: String(formData.get("storage_info") || "").trim() || null,
      kosher_status: String(formData.get("kosher_status") || "").trim() || null,
      allergen_info: String(formData.get("allergen_info") || "").trim() || null,
      age_restricted: formData.get("age_restricted") === "on",
      status: (formData.get("status") as "draft" | "published" | "archived") ?? "draft",
      is_featured: formData.get("is_featured") === "on",
      availability_status:
        (formData.get("availability_status") as ProductFormData["availability_status"]) ??
        "IN_STOCK",
      base_price_agorot: agorotFromShekelsInput(formData.get("base_price")),
      compare_at_price_agorot: agorotFromShekelsInput(formData.get("compare_at_price")),
      meta_title: String(formData.get("meta_title") || "").trim() || null,
      meta_description: String(formData.get("meta_description") || "").trim() || null,
      serves_min: parseOptionalInt(formData.get("serves_min")),
      serves_max: parseOptionalInt(formData.get("serves_max")),
      composition_text: String(formData.get("composition_text") || "").trim() || null,
      advance_order_hours: Number(formData.get("advance_order_hours") || 0),
      customizable: formData.get("customizable") === "on",
      preparation_time_minutes: parseOptionalInt(formData.get("preparation_time_minutes")),
      new_until: (formData.get("new_until") as string) || null,
      wine_type: (formData.get("wine_type") as ProductFormData["wine_type"]) || null,
      region: String(formData.get("region") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
      grape_varieties: String(formData.get("grape_varieties") || "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      rating: parseOptionalFloat(formData.get("rating")),
      review_count: Number(formData.get("review_count") || 0),
      is_best_seller: formData.get("is_best_seller") === "on",
      badge: String(formData.get("badge") || "").trim() || null,
      serving_temperature: String(formData.get("serving_temperature") || "").trim() || null,
      aging_potential: String(formData.get("aging_potential") || "").trim() || null,
      vinification_method: String(formData.get("production_method") || "").trim() || null,
      subcategory: String(formData.get("subcategory") || "").trim() || null,
      age_years: parseOptionalInt(formData.get("age_years")),
      nose_notes: String(formData.get("nose_notes") || "").trim() || null,
      palate_notes: String(formData.get("palate_notes") || "").trim() || null,
      finish_notes: String(formData.get("finish_notes") || "").trim() || null,
      cask_type: String(formData.get("cask_type") || "").trim() || null,
      edition: String(formData.get("edition") || "").trim() || null,
      production_method: String(formData.get("production_method") || "").trim() || null,
      meat_type: String(formData.get("meat_type") || "").trim() || null,
      is_available_for_platter: formData.get("is_available_for_platter") === "on",
      nutrition_info: String(formData.get("nutrition_info") || "").trim() || null,
      expiration_info: String(formData.get("expiration_info") || "").trim() || null,
      fish_type: String(formData.get("fish_type") || "").trim() || null,
      preparation_method: String(formData.get("preparation_method") || "").trim() || null,
      smoked: formData.get("smoked") === "on",
    };
  }

  function buildPreviewProduct() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("status", "published");
    const input = getFormProduct(formData);
    const categoryRow = categories.find((c) => c.id === input.category_id);
    const previewProduct: ProductWithDetails = {
      ...(input as unknown as ProductWithDetails),
      id: initial?.id ?? "preview",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
      category: categoryRow
        ? { name_fr: categoryRow.name_fr, name_he: categoryRow.name_he, slug: categoryRow.slug }
        : null,
      variants: variants.map((v) => ({
        ...(v as unknown as ProductWithDetails["variants"][number]),
        id: v.id ?? "preview-variant",
        product_id: "preview",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      media: media.map((m, i) => ({
        ...(m as ProductWithDetails["media"][number]),
        id: `preview-${i}`,
        product_id: "preview",
        created_at: new Date().toISOString(),
      })),
    };
    setPreview(previewProduct);
    setShowPreview(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value || "draft";
    formData.set("status", intent === "publish" ? "published" : "draft");

    const product = getFormProduct(formData);

    const payload = {
      product,
      variants: variants.map((v, index) => ({
        id: v.id,
        label: v.label || `Variante ${index + 1}`,
        sku: v.sku ?? null,
        barcode: v.barcode ?? null,
        weight_g: v.weight_g ?? null,
        volume_ml: v.volume_ml ?? null,
        abv: v.abv ?? null,
        vintage: v.vintage ?? null,
        regular_price_agorot: v.regular_price_agorot ?? product.base_price_agorot ?? null,
        is_default: v.is_default ?? index === 0,
        limited_stock: v.limited_stock ?? false,
        availability_status: v.availability_status ?? "IN_STOCK",
        display_order: v.display_order ?? index,
        status: v.status ?? "published",
        pricing_unit: v.pricing_unit ?? null,
        packaging: v.packaging ?? null,
        wolt_enabled: v.wolt_enabled ?? false,
        wolt_url: v.wolt_url ?? null,
        quantity: v.quantity ?? null,
        low_stock_threshold: v.low_stock_threshold ?? null,
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

    const successParam = initial ? "updated" : "created";
    router.push(`/admin/products?success=${successParam}`);
    router.refresh();
  }

  const coverMedia = media.find((m) => m.kind === "COVER") ?? media[0];
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* PHOTO */}
      <Section title="Photos du produit">
        {coverMedia?.url ? (
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-or-principal bg-white p-2 shadow-sm">
              <Image
                src={coverMedia.url}
                alt={coverMedia.alt ?? "Couverture produit"}
                fill
                className="object-contain"
                sizes="192px"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-noir-profond">Couverture actuelle</p>
              <p className="text-xs text-gris-chaud">
                L&apos;étoile dans la galerie choisit la nouvelle couverture.
              </p>
            </div>
          </div>
        ) : null}
        <ProductMediaEditor media={media} onChange={setMedia} />
      </Section>

      {/* NOM + CATÉGORIE */}
      <Section title="Informations principales">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="name_fr"
            label="Nom (français)"
            defaultValue={initial?.name_fr ?? ""}
            required
          />
          <Field
            name="name_he"
            label="Nom (hébreu)"
            defaultValue={initial?.name_he ?? ""}
            hint="Si vide, recopie le nom français."
          />
          <Select
            name="category_id"
            label="Catégorie"
            defaultValue={initial?.category_id ?? ""}
            options={[
              { value: "", label: "Aucune" },
              ...categories.map((c) => ({ value: c.id, label: c.name_fr || c.name_he })),
            ]}
          />
          <Field name="brand" label="Marque" defaultValue={initial?.brand ?? ""} />
        </div>
      </Section>

      {/* PRIX */}
      <Section title="Prix">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            name="base_price"
            label="Prix boutique (₪)"
            type="number"
            defaultValue={shekelsFromAgorot(initial?.base_price_agorot)}
            inputProps={{ step: "0.01" }}
            hint="Exemple : 40.00"
          />
          <Field
            name="compare_at_price"
            label="Ancien prix (₪)"
            type="number"
            defaultValue={shekelsFromAgorot(initial?.compare_at_price_agorot)}
            inputProps={{ step: "0.01" }}
            hint="Pour afficher une promotion."
          />
          <Select
            name="availability_status"
            label="Disponibilité par défaut"
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
        <TextArea
          name="description_fr"
          label="Description (français)"
          defaultValue={initial?.description_fr ?? ""}
        />
        <TextArea
          name="description_he"
          label="Description (hébreu)"
          defaultValue={initial?.description_he ?? ""}
        />
      </Section>

      {/* PUBLICATION */}
      <Section title="Publication">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            name="product_type"
            label="Type de produit"
            defaultValue={initial?.product_type ?? "STANDARD"}
            options={[
              { value: "STANDARD", label: "Standard" },
              { value: "PLATTER", label: "Plateau" },
            ]}
          />
          <Field
            name="new_until"
            label="Nouveau jusqu'à"
            type="datetime-local"
            defaultValue={initial?.new_until ? initial.new_until.slice(0, 16) : ""}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <AdminCheckbox
            name="is_featured"
            label="Mis en avant"
            description="Affiche ce produit dans les mises en avant du site."
            defaultChecked={initial?.is_featured ?? false}
          />
          <AdminCheckbox
            name="is_best_seller"
            label="Best-seller"
            description="Marque ce produit comme best-seller."
            defaultChecked={initial?.is_best_seller ?? false}
          />
          <AdminCheckbox
            name="age_restricted"
            label="Produit soumis à la règle 18+"
            description="La vérification d'âge sera demandée lors du retrait en magasin."
            defaultChecked={initial?.age_restricted ?? false}
          />
        </div>
      </Section>

      {/* VARIANTES */}
      <Section title="Variantes (poids, formats, stock)">
        <VariantEditor variants={variants} onChange={setVariants} />
      </Section>

      {/* ACTIONS PRINCIPALES */}
      <div className="sticky bottom-0 z-30 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/95 px-4 py-4 backdrop-blur sm:-mx-0 sm:px-0">
        <button
          type="submit"
          value="publish"
          disabled={saving}
          className="min-h-[44px] rounded-[10px] bg-[var(--admin-burgundy)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-burgundy-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Publication…" : initial ? "Enregistrer les modifications" : "Publier le produit"}
        </button>
        {!initial && (
          <button
            type="submit"
            value="draft"
            disabled={saving}
            className="min-h-[44px] rounded-[10px] border-[1.5px] border-[var(--admin-border-strong)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:border-[var(--admin-gold)] disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
          </button>
        )}
        <button
          type="button"
          onClick={buildPreviewProduct}
          className="min-h-[44px] rounded-[10px] border-[1.5px] border-[var(--admin-border-strong)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:border-[var(--admin-gold)]"
        >
          Prévisualiser
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="min-h-[44px] rounded-[10px] px-4 py-2.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
        >
          Annuler
        </button>
      </div>

      {/* OPTIONS AVANCÉES */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm text-or-principal hover:text-soft-gold"
        >
          {showAdvanced ? "▾ Options avancées" : "▸ Options avancées"}
        </button>
        {showAdvanced && (
          <div className="mt-4 flex flex-col gap-6">
            <Section title="Détails produit">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="slug" label="Slug (URL)" defaultValue={initial?.slug ?? ""} />
                <Field name="origin" label="Origine" defaultValue={initial?.origin ?? ""} />
                <Field name="kosher_status" label="Cacherout" defaultValue={initial?.kosher_status ?? ""} />
                <Field name="name_en" label="Nom (anglais)" defaultValue={initial?.name_en ?? ""} />
              </div>
              <TextArea
                name="description_en"
                label="Description (anglais)"
                defaultValue={initial?.description_en ?? ""}
              />
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
              <label className="flex items-center gap-2 text-sm text-noir-profond/80">
                <input type="checkbox" name="customizable" defaultChecked={initial?.customizable ?? false} className="h-4 w-4 accent-or-principal" />
                Personnalisable
              </label>
            </Section>

            <Section title="Vins & Spiritueux">
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  name="wine_type"
                  label="Type de vin"
                  defaultValue={initial?.wine_type ?? ""}
                  options={[
                    { value: "", label: "Non applicable" },
                    { value: "ROUGE", label: "Rouge" },
                    { value: "BLANC", label: "Blanc" },
                    { value: "ROSE", label: "Rosé" },
                    { value: "EFFERVESCENT", label: "Effervescent" },
                    { value: "DOUX", label: "Doux" },
                  ]}
                />
                <Select
                  name="subcategory"
                  label="Sous-catégorie (spiritueux)"
                  defaultValue={initial?.subcategory ?? ""}
                  options={[
                    { value: "", label: "Non applicable" },
                    { value: "WHISKY", label: "Whisky" },
                    { value: "ARAK", label: "Arak" },
                    { value: "COGNAC", label: "Cognac" },
                    { value: "VODKA", label: "Vodka" },
                    { value: "GIN", label: "Gin" },
                    { value: "RHUM", label: "Rhum" },
                    { value: "TEQUILA", label: "Tequila" },
                    { value: "LIQUEUR", label: "Liqueurs" },
                    { value: "APERITIF", label: "Apéritifs" },
                    { value: "PREMIUM", label: "Spiritueux premium" },
                  ]}
                />
                <Field name="region" label="Région" defaultValue={initial?.region ?? ""} />
                <Field name="country" label="Pays" defaultValue={initial?.country ?? ""} />
                <Field
                  name="grape_varieties"
                  label="Cépages (séparés par des virgules)"
                  defaultValue={(initial?.grape_varieties ?? []).join(", ")}
                />
                <Field name="age_years" label="Âge (ans)" type="number" defaultValue={initial?.age_years ?? ""} />
                <Field name="rating" label="Note (0 à 5)" type="number" defaultValue={initial?.rating ?? ""} />
                <Field name="review_count" label="Nombre d'avis" type="number" defaultValue={initial?.review_count ?? 0} />
                <Field name="badge" label="Badge personnalisé" defaultValue={initial?.badge ?? ""} />
                <Field name="cask_type" label="Type de fût" defaultValue={initial?.cask_type ?? ""} />
                <Field name="edition" label="Édition" defaultValue={initial?.edition ?? ""} />
                <Field name="serving_temperature" label="Température de service" defaultValue={initial?.serving_temperature ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-noir-profond/80">
                <input
                  type="checkbox"
                  name="is_best_seller"
                  defaultChecked={initial?.is_best_seller ?? false}
                  className="h-4 w-4 accent-or-principal"
                />
                Best-seller
              </label>
              <TextArea name="nose_notes" label="Nez (arômes)" defaultValue={initial?.nose_notes ?? ""} />
              <TextArea name="palate_notes" label="Bouche (saveurs)" defaultValue={initial?.palate_notes ?? ""} />
              <TextArea name="finish_notes" label="Finale" defaultValue={initial?.finish_notes ?? ""} />
              <TextArea name="production_method" label="Méthode de fabrication / vinification" defaultValue={initial?.production_method ?? initial?.vinification_method ?? ""} />
              <TextArea name="aging_potential" label="Potentiel de garde (vins)" defaultValue={initial?.aging_potential ?? ""} />
            </Section>

            <Section title="Charcuterie">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="meat_type" label="Type de viande" defaultValue={initial?.meat_type ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-noir-profond/80">
                <input
                  type="checkbox"
                  name="is_available_for_platter"
                  defaultChecked={initial?.is_available_for_platter ?? false}
                  className="h-4 w-4 accent-or-principal"
                />
                Disponible en plateau
              </label>
              <TextArea name="nutrition_info" label="Informations nutritionnelles" defaultValue={initial?.nutrition_info ?? ""} />
              <TextArea name="expiration_info" label="Conservation / date limite" defaultValue={initial?.expiration_info ?? ""} />
            </Section>

            <Section title="Poissons">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="fish_type" label="Type de poisson" defaultValue={initial?.fish_type ?? ""} />
                <Field name="preparation_method" label="Méthode de préparation" defaultValue={initial?.preparation_method ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-noir-profond/80">
                <input type="checkbox" name="smoked" defaultChecked={initial?.smoked ?? false} className="h-4 w-4 accent-or-principal" />
                Fumé
              </label>
            </Section>

            <Section title="SEO">
              <Field name="meta_title" label="Meta titre" defaultValue={initial?.meta_title ?? ""} />
              <TextArea name="meta_description" label="Meta description" defaultValue={initial?.meta_description ?? ""} />
            </Section>
          </div>
        )}
      </div>

      {showPreview && preview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-noir-profond/60 p-4">
          <div className="relative mt-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm border border-beige-fonce bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute right-4 top-4 text-noir-profond/70 hover:text-noir-profond"
              aria-label="Fermer"
            >
              ✕
            </button>
            <h2 className="mb-4 font-serif text-xl text-or-principal">Aperçu fiche produit</h2>
            <ProductPreviewCard product={preview} />
          </div>
        </div>
      )}
    </form>
  );
}

function ProductPreviewCard({ product }: { product: ProductWithDetails }) {
  const cover =
    product.media?.find((m) => m.kind === "COVER")?.url ?? product.media?.[0]?.url;
  const defaultVariant = product.variants?.[0];
  const displayPrice =
    defaultVariant?.regular_price_agorot ?? product.base_price_agorot ?? 0;
  const comparePrice = product.compare_at_price_agorot;
  const savingPercent =
    comparePrice && comparePrice > displayPrice
      ? Math.floor(((comparePrice - displayPrice) / comparePrice) * 100)
      : 0;
  const name = product.name_fr || product.name_he;

  return (
    <div className="space-y-4">
      {cover ? (
        <div className="relative h-64 w-full overflow-hidden rounded-sm bg-creme">
          <Image src={cover} alt={product.name_fr ?? product.name_he ?? ""} fill className="object-contain" sizes="(max-width: 768px) 100vw, 640px" />
        </div>
      ) : (
        <div className="flex h-64 w-full items-center justify-center rounded-sm border border-beige-fonce bg-creme text-sm text-gris-chaud">
          Photo manquante
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-wider text-gris-chaud">
          {product.category?.name_fr ?? "—"}
        </p>
        <h3 className="font-serif text-2xl text-noir-profond">{name}</h3>
        {product.name_he && (
          <p className="text-right text-sm text-gris-chaud" dir="rtl">
            {product.name_he}
          </p>
        )}
        {product.brand && <p className="text-sm text-gris-chaud">{product.brand}</p>}
        {product.age_restricted && (
          <span className="mt-2 inline-block rounded-sm bg-red-100 px-2 py-0.5 text-xs text-red-800">
            18+
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-serif text-2xl text-or-principal">
          {formatUnitPrice(displayPrice, defaultVariant?.pricing_unit)}
        </span>
        {comparePrice && comparePrice > displayPrice ? (
          <>
            <span className="text-sm text-gris-chaud line-through">
              {formatAgorot(comparePrice)}
            </span>
            <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs text-green-800">
              -{savingPercent}%
            </span>
          </>
        ) : null}
      </div>

      <p className="whitespace-pre-line text-sm text-noir-profond/80">
        {product.description_fr ?? product.description_he}
      </p>

      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-or-principal">Variantes</p>
          <ul className="divide-y divide-beige-fonce rounded-sm border border-beige-fonce">
            {product.variants.map((v, i) => (
              <li key={i} className="flex justify-between px-3 py-2 text-sm text-noir-profond/80">
                <span>{v.label}</span>
                <span>{v.regular_price_agorot != null ? formatAgorot(v.regular_price_agorot) : "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-noir-profond/70">
        {product.is_featured && (
          <span className="rounded-full border border-champagne/30 px-2 py-1 text-or-principal">
            Mis en avant
          </span>
        )}
        {product.is_best_seller && (
          <span className="rounded-full border border-amber-300 px-2 py-1 text-amber-700">
            Best-seller
          </span>
        )}
        {product.badge && (
          <span className="rounded-full border border-beige-fonce px-2 py-1">
            {product.badge}
          </span>
        )}
      </div>

      <p className="text-xs text-gris-chaud">
        Statut :{" "}
        {product.status === "published"
          ? "Publié"
          : product.status === "draft"
            ? "Brouillon"
            : "Archivé"}
      </p>
    </div>
  );
}

function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantFormData[];
  onChange: (v: VariantFormData[]) => void;
}) {
  function update(index: number, patch: Partial<VariantFormData>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function add() {
    onChange([
      ...variants,
      { label: "", quantity: null, low_stock_threshold: 3 },
    ]);
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.map((v, i) => (
        <div key={i} className="grid gap-3 rounded-sm border border-beige-fonce p-3 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Label</label>
            <input
              aria-label={`Variante ${i + 1} - Label`}
              value={v.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="ex: 100 g, 200 g"
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">SKU</label>
            <input
              aria-label={`Variante ${i + 1} - SKU`}
              value={v.sku ?? ""}
              onChange={(e) => update(i, { sku: e.target.value || null })}
              placeholder="Référence"
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Code-barres</label>
            <input
              aria-label={`Variante ${i + 1} - Code-barres`}
              value={v.barcode ?? ""}
              onChange={(e) => update(i, { barcode: e.target.value || null })}
              placeholder="EAN/UPC"
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Poids (g)</label>
            <input
              aria-label={`Variante ${i + 1} - Poids (g)`}
              type="number"
              value={v.weight_g ?? ""}
              onChange={(e) =>
                update(i, { weight_g: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Prix (₪)</label>
            <input
              aria-label={`Variante ${i + 1} - Prix`}
              type="number"
              step="0.01"
              value={v.regular_price_agorot != null ? (v.regular_price_agorot / 100).toFixed(2) : ""}
              onChange={(e) =>
                update(i, {
                  regular_price_agorot: e.target.value
                    ? Math.round(Number(e.target.value) * 100)
                    : null,
                })
              }
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Stock</label>
            <input
              aria-label={`Variante ${i + 1} - Stock`}
              type="number"
              min={0}
              value={v.quantity ?? ""}
              onChange={(e) =>
                update(i, { quantity: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-noir-profond/80">Seuil</label>
            <input
              aria-label={`Variante ${i + 1} - Seuil de stock faible`}
              type="number"
              min={0}
              value={v.low_stock_threshold ?? 3}
              onChange={(e) =>
                update(i, { low_stock_threshold: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            />
          </div>

          <div className="col-span-full flex flex-wrap items-center gap-3 border-t border-beige-fonce pt-3">
            <select
              value={v.pricing_unit ?? "FIXED"}
              onChange={(e) => update(i, { pricing_unit: e.target.value as VariantFormData["pricing_unit"] })}
              className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            >
              <option value="FIXED">Prix fixe</option>
              <option value="PACKAGE">Le paquet</option>
              <option value="PER_100G">Pour 100 g</option>
              <option value="PER_KG">Au kg</option>
              <option value="FROM">À partir de</option>
            </select>
            <select
              value={v.packaging ?? ""}
              onChange={(e) => update(i, { packaging: e.target.value || null })}
              className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
            >
              <option value="">Conditionnement</option>
              <option value="GLASS">Verre</option>
              <option value="CAN">Conserve</option>
              <option value="VACUUM">Sous vide</option>
              <option value="BULK">Format professionnel</option>
              <option value="PLASTIC">Plastique</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-noir-profond/70">
              <input
                type="checkbox"
                checked={!!v.is_default}
                onChange={(e) => update(i, { is_default: e.target.checked })}
                className="accent-or-principal"
              />
              Défaut
            </label>
            <label className="flex items-center gap-1 text-xs text-noir-profond/70">
              <input
                type="checkbox"
                checked={!!v.wolt_enabled}
                onChange={(e) => update(i, { wolt_enabled: e.target.checked })}
                className="accent-or-principal"
              />
              Wolt
            </label>
            {v.wolt_enabled && (
              <input
                value={v.wolt_url ?? ""}
                onChange={(e) => update(i, { wolt_url: e.target.value })}
                placeholder="https://wolt.com/..."
                className="flex-1 rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond"
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-xs text-bordeaux-principal hover:text-bordeaux-principal/70"
            >
              Supprimer
            </button>
          </div>
          {v.wolt_enabled && v.wolt_url && !isValidWoltUrl(v.wolt_url) && (
            <p className="col-span-full text-xs text-amber-700">
              Lien invalide. Utilisez une URL https://wolt.com ou https://wolt.co.il.
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-fit rounded-full border border-or-principal/40 px-4 py-2 text-xs font-medium text-or-principal hover:bg-or-principal hover:text-noir-profond"
      >
        + Ajouter une variante
      </button>
    </div>
  );
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
