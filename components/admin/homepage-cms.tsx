"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import type { HomepageSectionRow, HomepageSectionType, CategoryRow } from "@/types/database";
import {
  toggleHomepageSectionAction,
  reorderHomepageSectionAction,
  updateHomepageSectionConfigAction,
  addHomepageSectionAction,
  deleteHomepageSectionAction,
} from "@/app/admin/homepage/actions";

const SECTION_TYPE_LABELS: Record<HomepageSectionType, string> = {
  HERO: "Hero",
  CELLAR_DESCENT: "Descente dans la cave",
  PROMOTIONS: "Promotions actuelles",
  NEW_PRODUCTS: "Nouveautés",
  FEATURED_CATEGORY: "Catégorie en vedette",
  FEATURED_PRODUCTS: "Produits en vedette",
  EDITORIAL_IMAGE_TEXT: "Éditorial image + texte",
  PLATTERS: "Plateaux",
  INSPIRATIONS: "Inspirations",
  MEMBERSHIP: "Club Terminal 3",
  STORE_INFORMATION: "Informations boutique",
  GALLERY: "Galerie",
};

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as HomepageSectionType[];

export function HomepageCMS({
  sections,
  categories,
}: {
  sections: HomepageSectionRow[];
  categories: CategoryRow[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState<HomepageSectionType>("FEATURED_CATEGORY");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, startTransition] = useTransition();

  async function handleToggle(id: string, isEnabled: boolean) {
    startTransition(async () => {
      const result = await toggleHomepageSectionAction(id, isEnabled);
      if (!result.success) setError(result.error ?? "Erreur");
    });
  }

  async function handleReorder(id: string, currentOrder: number, direction: -1 | 1) {
    const newOrder = currentOrder + direction * 10;
    startTransition(async () => {
      const result = await reorderHomepageSectionAction(id, newOrder);
      if (!result.success) setError(result.error ?? "Erreur");
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette section ?")) return;
    startTransition(async () => {
      const result = await deleteHomepageSectionAction(id);
      if (!result.success) setError(result.error ?? "Erreur");
    });
  }

  async function handleAdd() {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order)) : 0;
    startTransition(async () => {
      const config = selectedType === "FEATURED_CATEGORY"
        ? { title: "Nouvelle section", category_slug: categories[0]?.slug ?? "" }
        : {};
      const result = await addHomepageSectionAction(selectedType, maxOrder + 10, config);
      if (!result.success) setError(result.error ?? "Erreur");
      else setShowAdd(false);
    });
  }

  async function handleConfigUpdate(id: string, config: Record<string, unknown>) {
    startTransition(async () => {
      const result = await updateHomepageSectionConfigAction(id, config);
      if (!result.success) setError(result.error ?? "Erreur");
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-sm border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-grey">
          {sections.length} section{sections.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 rounded-full bg-champagne px-4 py-2 text-xs font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          <Plus className="h-4 w-4" /> Ajouter une section
        </button>
      </div>

      {showAdd && (
        <div className="rounded-sm border border-champagne/30 bg-graphite p-4">
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-widest text-champagne">
              Type de section
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as HomepageSectionType)}
              className="rounded-sm border border-white/10 bg-warm-black px-4 py-2 text-sm text-ivory"
            >
              {SECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SECTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={pendingId !== null}
              className="self-start rounded-full bg-champagne px-4 py-2 text-xs font-semibold text-obsidian disabled:opacity-50"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`rounded-sm border bg-graphite p-4 transition-opacity ${
              section.is_enabled ? "border-white/5" : "border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-grey">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="text-sm font-medium text-ivory">
                    {SECTION_TYPE_LABELS[section.section_type]}
                  </span>
                  {typeof section.config.title === "string" && (
                    <span className="ml-2 text-xs text-muted-grey">
                      {section.config.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReorder(section.id, section.sort_order, -1)}
                  disabled={index === 0 || pendingId !== null}
                  className="rounded p-1.5 text-ivory/60 hover:bg-warm-black hover:text-champagne disabled:opacity-30"
                  aria-label="Monter"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleReorder(section.id, section.sort_order, 1)}
                  disabled={index === sections.length - 1 || pendingId !== null}
                  className="rounded p-1.5 text-ivory/60 hover:bg-warm-black hover:text-champagne disabled:opacity-30"
                  aria-label="Descendre"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggle(section.id, !section.is_enabled)}
                  disabled={pendingId !== null}
                  className="rounded p-1.5 text-ivory/60 hover:bg-warm-black hover:text-champagne"
                  aria-label={section.is_enabled ? "Désactiver" : "Activer"}
                >
                  {section.is_enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  disabled={pendingId !== null}
                  className="rounded p-1.5 text-red-400/60 hover:bg-warm-black hover:text-red-400"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {section.is_enabled && section.section_type === "FEATURED_CATEGORY" && (
              <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
                <label className="text-xs text-muted-grey">Titre</label>
                <input
                  type="text"
                  defaultValue={(section.config.title as string) ?? ""}
                  onBlur={(e) =>
                    handleConfigUpdate(section.id, {
                      ...section.config,
                      title: e.target.value,
                    })
                  }
                  className="rounded-sm border border-white/10 bg-warm-black px-3 py-1.5 text-sm text-ivory"
                />
                <label className="mt-1 text-xs text-muted-grey">Catégorie</label>
                <select
                  defaultValue={(section.config.category_slug as string) ?? ""}
                  onChange={(e) =>
                    handleConfigUpdate(section.id, {
                      ...section.config,
                      category_slug: e.target.value,
                    })
                  }
                  className="rounded-sm border border-white/10 bg-warm-black px-3 py-1.5 text-sm text-ivory"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name_fr || cat.name_he}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
