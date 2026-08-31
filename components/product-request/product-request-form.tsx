"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Search, Sparkles, Loader2 } from "lucide-react";
import { createProductRequest } from "@/app/demande-produit/actions";
import { searchProductsAction } from "@/app/recherche/actions";
import { formatAgorot } from "@/lib/money";
import type { ProductWithMedia } from "@/lib/data/catalog";

const inputClass =
  "rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne";

type Mode = "search" | "in_catalog" | "out_of_catalog";

export function ProductRequestForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, startSearching] = useTransition();
  const [results, setResults] = useState<ProductWithMedia[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithMedia | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const [form, setForm] = useState({
    quantity: 1,
    budget: "",
    comment: "",
    photoUrl: "",
    requestedType: "",
    requestedBrand: "",
    requestedName: "",
    requestedVolumeMl: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startSearching(async () => {
      const products = await searchProductsAction(searchQuery);
      setResults(products);
    });
  }

  async function submitInCatalog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    const variant = selectedProduct.variants?.find((v) => v.is_default) ??
      selectedProduct.variants?.[0];

    setMessage(null);
    setSubmitting(true);
    const result = await createProductRequest({
      kind: "in_catalog",
      productId: selectedProduct.id,
      variantId: variant?.id,
      requestedQuantity: form.quantity,
      requestedBudgetAgorot: form.budget
        ? Math.round(Number(form.budget) * 100)
        : null,
      comment: form.comment || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setMessage({ type: "error", text: result.error ?? "Erreur inconnue." });
      return;
    }
    setMessage({
      type: "success",
      text: `Demande enregistrée (réf. ${result.publicReference ?? ""}). Notre équipe revient vers vous rapidement.`,
    });
    setTimeout(() => router.push("/compte/demandes"), 1500);
  }

  async function submitOutOfCatalog(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const result = await createProductRequest({
      kind: "out_of_catalog",
      requestedType: form.requestedType,
      requestedBrand: form.requestedBrand,
      requestedName: form.requestedName,
      requestedVolumeMl: form.requestedVolumeMl
        ? Number(form.requestedVolumeMl)
        : undefined,
      requestedQuantity: form.quantity,
      requestedBudgetAgorot: form.budget
        ? Math.round(Number(form.budget) * 100)
        : null,
      photoUrl: form.photoUrl || undefined,
      comment: form.comment || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setMessage({ type: "error", text: result.error ?? "Erreur inconnue." });
      return;
    }
    setMessage({
      type: "success",
      text: `Demande enregistrée (réf. ${result.publicReference ?? ""}). Notre équipe revient vers vous rapidement.`,
    });
    setTimeout(() => router.push("/compte/demandes"), 1500);
  }

  // Step 1: search or pivot to free-form
  if (mode === "search") {
    return (
      <div className="mt-8 flex flex-col gap-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, marque, type..."
              className={`${inputClass} w-full pl-10`}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="rounded-full bg-champagne px-5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chercher"}
          </button>
        </form>

        {results.length > 0 && (
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-grey">
              Résultats dans le catalogue
            </p>
            <ul className="flex flex-col divide-y divide-white/5 border-y border-white/5">
              {results.map((p) => {
                const cover = p.media?.find((m) => m.kind === "COVER") ?? p.media?.[0];
                const variant = p.variants?.find((v) => v.is_default) ?? p.variants?.[0];
                return (
                  <li key={p.id} className="flex items-center gap-4 py-3">
                    {cover?.url && (
                      <Image
                        src={cover.url}
                        alt={cover.alt ?? p.name_fr ?? p.name_he}
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-sm object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base text-ivory">
                        {p.name_fr || p.name_he}
                      </p>
                      <p className="truncate text-xs text-muted-grey">
                        {p.brand ?? ""}
                        {variant?.regular_price_agorot != null
                          ? ` · ${formatAgorot(variant.regular_price_agorot)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(p);
                          setMode("in_catalog");
                        }}
                        className="rounded-full border border-champagne px-3 py-1.5 text-xs text-champagne transition-colors hover:bg-champagne/10"
                      >
                        Demander ce produit
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {searchQuery.trim() && results.length === 0 && !searching && (
          <div className="rounded-sm border border-champagne/20 bg-champagne/5 p-5">
            <p className="text-sm text-ivory">
              Aucun produit trouvé pour <span className="font-semibold">« {searchQuery} »</span>.
            </p>
            <p className="mt-1 text-sm text-ivory/70">
              Décrivez-nous ce que vous cherchez : nous vérifierons notre stock et vous
              répondrons rapidement.
            </p>
          </div>
        )}

        <div className="rounded-sm border border-white/5 bg-graphite/40 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-ivory">
            <Sparkles className="h-4 w-4 text-champagne" /> Vous ne trouvez pas ce que
            vous cherchez ?
          </p>
          <button
            type="button"
            onClick={() => setMode("out_of_catalog")}
            className="mt-3 rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
          >
            Demander un produit hors catalogue
          </button>
        </div>
      </div>
    );
  }

  // Step 2a: in-catalog request
  if (mode === "in_catalog" && selectedProduct) {
    return (
      <form onSubmit={submitInCatalog} className="mt-8 flex flex-col gap-5">
        <div className="rounded-sm border border-champagne/20 bg-champagne/5 p-4">
          <p className="text-xs uppercase tracking-widest text-champagne">Produit sélectionné</p>
          <p className="mt-1 font-serif text-lg text-ivory">
            {selectedProduct.name_fr || selectedProduct.name_he}
          </p>
          {selectedProduct.brand && (
            <p className="text-xs text-muted-grey">{selectedProduct.brand}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null);
              setMode("search");
            }}
            className="mt-2 text-xs text-champagne hover:underline"
          >
            Choisir un autre produit
          </button>
        </div>

        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Quantité souhaitée
          <input
            required
            type="number"
            min={1}
            max={1000}
            value={form.quantity}
            onChange={(e) => set("quantity", Math.max(1, Number(e.target.value) || 1))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Budget maximum en ₪ (facultatif)
          <input
            type="number"
            min={0}
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Commentaire (facultatif)
          <textarea
            rows={3}
            value={form.comment}
            onChange={(e) => set("comment", e.target.value)}
            className={inputClass}
            placeholder="Précisez votre besoin, l'usage, la date souhaitée..."
          />
        </label>

        {message && (
          <p
            className={`flex items-start gap-2 text-sm ${
              message.type === "success" ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="mt-0.5 h-4 w-4" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4" />
            )}
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50 sm:self-start"
        >
          {submitting ? "Envoi..." : "Envoyer ma demande"}
        </button>
      </form>
    );
  }

  // Step 2b: out-of-catalog request
  return (
    <form onSubmit={submitOutOfCatalog} className="mt-8 flex flex-col gap-5">
      <div className="rounded-sm border border-champagne/20 bg-champagne/5 p-4">
        <p className="text-xs uppercase tracking-widest text-champagne">
          Demande hors catalogue
        </p>
        <p className="mt-1 text-sm text-ivory/80">
          Nous ferons de notre mieux pour trouver le produit demandé. Aucun engagement
          d&rsquo;achat de votre part.
        </p>
        <button
          type="button"
          onClick={() => setMode("search")}
          className="mt-2 text-xs text-champagne hover:underline"
        >
          Retour à la recherche
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Type d&rsquo;alcool
          <select
            required
            value={form.requestedType}
            onChange={(e) => set("requestedType", e.target.value)}
            className={inputClass}
          >
            <option value="">Choisir...</option>
            <option value="wine">Vin</option>
            <option value="whisky">Whisky</option>
            <option value="gin">Gin</option>
            <option value="tequila">Tequila</option>
            <option value="arak">Arak</option>
            <option value="beer">Bière</option>
            <option value="spirit">Autre spiritueux</option>
            <option value="other">Autre</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Marque
          <input
            required
            value={form.requestedBrand}
            onChange={(e) => set("requestedBrand", e.target.value)}
            className={inputClass}
            placeholder="Ex : Domaine de la Romanée-Conti"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80 sm:col-span-2">
          Nom du produit
          <input
            required
            value={form.requestedName}
            onChange={(e) => set("requestedName", e.target.value)}
            className={inputClass}
            placeholder="Ex : La Tâche 2015"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Volume en ml (facultatif)
          <input
            type="number"
            min={50}
            max={20000}
            value={form.requestedVolumeMl}
            onChange={(e) => set("requestedVolumeMl", e.target.value)}
            className={inputClass}
            placeholder="Ex : 750"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ivory/80">
          Quantité
          <input
            required
            type="number"
            min={1}
            max={1000}
            value={form.quantity}
            onChange={(e) => set("quantity", Math.max(1, Number(e.target.value) || 1))}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-ivory/80">
        Budget maximum en ₪ (facultatif)
        <input
          type="number"
          min={0}
          value={form.budget}
          onChange={(e) => set("budget", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-ivory/80">
        Lien vers une photo (facultatif)
        <input
          type="url"
          value={form.photoUrl}
          onChange={(e) => set("photoUrl", e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-ivory/80">
        Commentaire (facultatif)
        <textarea
          rows={3}
          value={form.comment}
          onChange={(e) => set("comment", e.target.value)}
          className={inputClass}
          placeholder="Millésime, provenance, urgence, ..."
        />
      </label>

      {message && (
        <p
          className={`flex items-start gap-2 text-sm ${
            message.type === "success" ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="mt-0.5 h-4 w-4" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4" />
          )}
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Envoyer ma demande"}
        </button>
        <Link
          href="/compte/demandes"
          className="text-sm text-muted-grey hover:text-ivory"
        >
          Voir mes demandes
        </Link>
      </div>
    </form>
  );
}
