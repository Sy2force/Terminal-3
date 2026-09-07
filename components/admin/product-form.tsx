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
import { formatAgorot } from "@/lib/money";
import { isValidWoltUrl } from "@/lib/wolt";
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

interface ProductPreview extends ProductRow {
  category: { name_fr: string | null; name_he: string; slug: string } | null;
  variants: ProductVariantRow[];
  media: ProductMediaRow[];
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<ProductPreview | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [variants, setVariants] = useState<Partial<ProductVariantRow>[]>(
    initial?.variants.length ? initial.variants : [{ label: "Défaut" }],
  );
  const [media, setMedia] = useState<Partial<ProductMediaRow>[]>(
    initial?.media.length ? initial.media : [],
  );

  function getFormProduct(formData: FormData): ProductFormData {
    return {
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
      wine_type: (formData.get("wine_type") as ProductFormData["wine_type"]) || null,
      region: String(formData.get("region") || "") || null,
      country: String(formData.get("country") || "") || null,
      grape_varieties: String(formData.get("grape_varieties") || "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      rating: parseOptionalFloat(formData.get("rating")),
      review_count: Number(formData.get("review_count") || 0),
      is_best_seller: formData.get("is_best_seller") === "on",
      badge: String(formData.get("badge") || "") || null,
      serving_temperature: String(formData.get("serving_temperature") || "") || null,
      aging_potential: String(formData.get("aging_potential") || "") || null,
      vinification_method: String(formData.get("production_method") || "") || null,
      subcategory: String(formData.get("subcategory") || "") || null,
      age_years: parseOptionalInt(formData.get("age_years")),
      nose_notes: String(formData.get("nose_notes") || "") || null,
      palate_notes: String(formData.get("palate_notes") || "") || null,
      finish_notes: String(formData.get("finish_notes") || "") || null,
      cask_type: String(formData.get("cask_type") || "") || null,
      edition: String(formData.get("edition") || "") || null,
      production_method: String(formData.get("production_method") || "") || null,
      meat_type: String(formData.get("meat_type") || "") || null,
      is_available_for_platter: formData.get("is_available_for_platter") === "on",
      nutrition_info: String(formData.get("nutrition_info") || "") || null,
      expiration_info: String(formData.get("expiration_info") || "") || null,
      fish_type: String(formData.get("fish_type") || "") || null,
      preparation_method: String(formData.get("preparation_method") || "") || null,
      smoked: formData.get("smoked") === "on",
    };
  }

  function buildPreviewProduct() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const input = getFormProduct(formData);
    const categoryRow = categories.find((c) => c.id === input.category_id);
    const previewProduct: ProductPreview = {
      ...input,
      id: initial?.id ?? "preview",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
      category: categoryRow
        ? { name_fr: categoryRow.name_fr, name_he: categoryRow.name_he, slug: categoryRow.slug }
        : null,
      variants: variants as ProductVariantRow[],
      media: media as ProductMediaRow[],
    } as unknown as ProductPreview;
    setPreview(previewProduct);
    setShowPreview(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const product = getFormProduct(formData);

    const payload = {
      product,
      variants: variants.map((v, index) => ({
        label: v.label || `Variante ${index + 1}`,
        sku: v.sku ?? null,
        barcode: v.barcode ?? null,
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
        pricing_unit: v.pricing_unit ?? null,
        packaging: v.packaging ?? null,
        wolt_enabled: v.wolt_enabled ?? false,
        wolt_url: v.wolt_url ?? null,
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
              <p className="text-xs text-gris-chaud">L&apos;étoile dans la galerie choisit la nouvelle couverture.</p>
            </div>
          </div>
        ) : null}
        <ProductMediaEditor media={media} onChange={setMedia} />
      </Section>

      {/* NOM + CATÉGORIE */}
      <Section title="Informations principales">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="name_fr" label="Nom (français)" defaultValue={initial?.name_fr ?? ""} />
          <Field name="name_he" label="Nom (hébreu)" defaultValue={initial?.name_he} required />
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
          <AdminCheckbox
            name="is_featured"
            label="Mis en avant"
            description="Affiche ce produit dans les mises en avant du site."
            defaultChecked={initial?.is_featured ?? false}
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
      <Section title="Variantes (poids, formats)">
        <VariantEditor variants={variants} onChange={setVariants} />
      </Section>

      {/* ACTIONS PRINCIPALES */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--admin-border)] pt-4">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-[10px] bg-[var(--admin-burgundy)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-burgundy-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : initial ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={buildPreviewProduct}
          className="min-h-[44px] rounded-[10px] border-[1.5px] border-[var(--admin-border-strong)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--admin-text)] transition-colors hover:border-[var(--admin-gold)]"
        >
          Aperçu
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
                <Field
                  name="serving_temperature"
                  label="Température de service"
                  defaultValue={initial?.serving_temperature ?? ""}
                />
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
                <input
                  type="checkbox"
                  name="smoked"
                  defaultChecked={initial?.smoked ?? false}
                  className="h-4 w-4 accent-or-principal"
                />
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

function ProductPreviewCard({ product }: { product: ProductPreview }) {
  const cover =
    product.media?.find((m) => m.kind === "COVER")?.url ??
    product.media?.[0]?.url;
  const savingPercent =
    product.compare_at_price_agorot && product.base_price_agorot
      ? Math.round(
          ((product.compare_at_price_agorot - product.base_price_agorot) /
            product.compare_at_price_agorot) *
            100,
        )
      : 0;

  return (
    <div className="space-y-4">
      {cover ? (
        <div className="relative h-64 w-full overflow-hidden rounded-sm bg-creme">
          <Image
            src={cover}
            alt={product.name_fr ?? product.name_he ?? ""}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 640px"
          />
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
        <h3 className="font-serif text-2xl text-noir-profond">
          {product.name_fr ?? product.name_he}
        </h3>
        {product.name_he && (
          <p className="text-right text-sm text-gris-chaud" dir="rtl">
            {product.name_he}
          </p>
        )}
        {product.age_restricted && (
          <span className="mt-2 inline-block rounded-sm bg-red-100 px-2 py-0.5 text-xs text-red-800">
            18+
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-serif text-2xl text-or-principal">
          {formatAgorot(product.base_price_agorot ?? 0)}
        </span>
        {product.compare_at_price_agorot ? (
          <>
            <span className="text-sm text-gris-chaud line-through">
              {formatAgorot(product.compare_at_price_agorot)}
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
              <li
                key={i}
                className="flex justify-between px-3 py-2 text-sm text-noir-profond/80"
              >
                <span>{v.label}</span>
                <span>
                  {v.regular_price_agorot != null
                    ? formatAgorot(v.regular_price_agorot)
                    : "—"}
                </span>
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
        <div key={i} className="grid gap-3 rounded-sm border border-beige-fonce p-3 sm:grid-cols-7">
          <input value={v.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label (ex: 200g, Entier)" className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond" />
          <input value={v.sku ?? ""} onChange={(e) => update(i, { sku: e.target.value })} placeholder="SKU" className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond" />
          <input value={v.barcode ?? ""} onChange={(e) => update(i, { barcode: e.target.value })} placeholder="Code-barres" className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond" />
          <input type="number" value={v.weight_g ?? ""} onChange={(e) => update(i, { weight_g: e.target.value ? Number(e.target.value) : null })} placeholder="Poids (g)" className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond" />
          <input type="number" value={v.regular_price_agorot ?? ""} onChange={(e) => update(i, { regular_price_agorot: e.target.value ? Number(e.target.value) : null })} placeholder="Prix (agorot)" className="rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond" />
          <select
            value={v.pricing_unit ?? "FIXED"}
            onChange={(e) => update(i, { pricing_unit: e.target.value as ProductVariantRow["pricing_unit"] })}
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
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-noir-profond/70">
              <input type="checkbox" checked={!!v.is_default} onChange={(e) => update(i, { is_default: e.target.checked })} className="accent-or-principal" />
              Défaut
            </label>
            <button type="button" onClick={() => remove(i)} className="ml-auto text-xs text-amber-700 hover:text-amber-300">
              Supprimer
            </button>
          </div>

          <div className="col-span-full grid gap-3 border-t border-beige-fonce pt-3 sm:grid-cols-12">
            <label className="flex items-center gap-2 text-sm text-noir-profond/80 sm:col-span-3">
              <input
                type="checkbox"
                checked={!!v.wolt_enabled}
                onChange={(e) => update(i, { wolt_enabled: e.target.checked })}
                className="accent-or-principal"
              />
              Afficher le bouton Wolt
            </label>
            <input
              value={v.wolt_url ?? ""}
              onChange={(e) => update(i, { wolt_url: e.target.value })}
              placeholder="https://wolt.com/en/isr/product/..."
              disabled={!v.wolt_enabled}
              className="sm:col-span-6 rounded-sm border border-beige-fonce bg-white px-3 py-2 text-sm text-noir-profond disabled:opacity-40"
            />
            <a
              href={isValidWoltUrl(v.wolt_url ?? "") ? v.wolt_url! : "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isValidWoltUrl(v.wolt_url ?? "")) e.preventDefault();
              }}
              className={`sm:col-span-3 rounded-sm px-3 py-2 text-center text-xs ${isValidWoltUrl(v.wolt_url ?? "") ? "bg-[#009DE0]/10 text-[#009DE0]" : "text-noir-profond/40"}`}
            >
              Tester le lien
            </a>
            {v.wolt_enabled && v.wolt_url && !isValidWoltUrl(v.wolt_url) && (
              <p className="col-span-full text-xs text-amber-700">
                Lien invalide. Utilisez une URL https://wolt.com ou https://wolt.co.il.
              </p>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit rounded-full border border-or-principal/40 px-4 py-2 text-xs font-medium text-or-principal hover:bg-or-principal hover:text-noir-profond">
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
