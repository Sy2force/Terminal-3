"use client";

import { useState } from "react";
import { Plus, Trash2, Save, UploadCloud, RotateCcw, Eye, Archive, CalendarClock } from "lucide-react";
import {
  savePageDraftAction,
  publishPageContentAction,
  revertPageDraftAction,
  archivePageContentAction,
  schedulePageContentAction,
} from "@/app/admin/contenus/[slug]/actions";
import { Button } from "@/components/admin/button";
import type { PageContentRow } from "@/types/database";
import type { PageBlock, PageBlockType } from "@/lib/data/page-contents";

const BLOCK_LABELS: Record<PageBlockType, string> = {
  hero: "Héro",
  text: "Texte",
  cta: "Appel à l'action",
  image: "Image",
  video: "Vidéo",
};

function newBlock(type: PageBlock["type"]): PageBlock {
  return { id: crypto.randomUUID(), type, visible: true };
}

export function PageContentEditor({
  slug,
  pageType,
  page,
  demoMode,
}: {
  slug: string;
  pageType: string;
  page: PageContentRow | null;
  demoMode: boolean;
}) {
  const [title, setTitle] = useState(page?.title ?? "");
  const [subtitle, setSubtitle] = useState(page?.subtitle ?? "");
  const [description, setDescription] = useState(page?.description ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(page?.og_image_url ?? "");
  const [scheduledAt, setScheduledAt] = useState<string | null>(page?.scheduled_at ? new Date(page.scheduled_at).toISOString().slice(0, 16) : null);
  const [blocks, setBlocks] = useState<PageBlock[]>(
    (page?.draft_blocks as PageBlock[]) ?? (page?.blocks as PageBlock[]) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const hasUnpublished =
    page?.status === "draft" ||
    page?.status === "scheduled" ||
    (page ? JSON.stringify(page.draft_blocks) !== JSON.stringify(page.blocks) : false);

  function markDirty() {
    setDirty(true);
  }

  function updateBlock(id: string, patch: Partial<PageBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    markDirty();
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    markDirty();
  }

  function addBlock(type: PageBlock["type"]) {
    setBlocks((prev) => [...prev, newBlock(type)]);
    markDirty();
  }

  async function handleSaveDraft() {
    setSaving(true);
    setMessage(null);
    const result = await savePageDraftAction(slug, pageType, {
      title,
      subtitle,
      description,
      meta_title: metaTitle,
      meta_description: metaDescription,
      og_image_url: ogImageUrl,
      scheduled_at: scheduledAt,
      blocks,
    });
    setSaving(false);
    setDirty(false);
    setMessage(
      result.success
        ? "Brouillon enregistré. Le site public n'a pas encore changé."
        : result.error === "demo_mode_read_only"
          ? "Mode démo : aucune base connectée, l'enregistrement est désactivé."
          : "Échec de l'enregistrement.",
    );
  }

  async function handlePublish() {
    if (!confirm("Publier ces modifications sur le site public ?")) return;
    setPublishing(true);
    setMessage(null);
    const result = await publishPageContentAction(slug);
    setPublishing(false);
    setMessage(
      result.success
        ? "Publié. Actualisez la page publique pour voir le résultat."
        : "Échec de la publication.",
    );
  }

  async function handleRevert() {
    if (!confirm("Annuler les modifications non publiées ?")) return;
    const result = await revertPageDraftAction(slug);
    if (result.success) {
      setBlocks((page?.blocks as PageBlock[]) ?? []);
      setDirty(false);
      setMessage("Modifications annulées.");
    }
  }

  async function handleArchive() {
    if (!confirm("Archiver cette page ? Le contenu public sera retiré.")) return;
    setArchiving(true);
    setMessage(null);
    const result = await archivePageContentAction(slug);
    setArchiving(false);
    setMessage(result.success ? "Page archivée." : "Échec de l'archivage.");
  }

  async function handleSchedule() {
    if (!scheduledAt) return setMessage("Choisissez une date de programmation.");
    if (!confirm(`Programmer la publication pour le ${new Date(scheduledAt).toLocaleString("fr-FR")} ?`)) return;
    setScheduling(true);
    setMessage(null);
    const result = await schedulePageContentAction(slug, scheduledAt);
    setScheduling(false);
    setMessage(
      result.success
        ? "Publication programmée."
        : result.error === "demo_mode_read_only"
          ? "Mode démo : programmation désactivée."
          : "Échec de la programmation.",
    );
  }

  return (
    <div className="space-y-6">
      {demoMode && (
        <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
          Mode démo actif : édition possible pour prévisualisation, mais l&apos;enregistrement en base est désactivé.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-[#71695F]">
        <span>Statut : <strong className="text-[#151411]">{page?.status ?? "non créé"}</strong></span>
        {page?.published_at && <span>· Dernière publication : {new Date(page.published_at).toLocaleString("fr-FR")}</span>}
        {hasUnpublished && <span className="text-[#B97832]">· Modifications non publiées</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre" value={title} onChange={(v) => { setTitle(v); markDirty(); }} />
        <Field label="Sous-titre" value={subtitle} onChange={(v) => { setSubtitle(v); markDirty(); }} />
      </div>
      <TextAreaField label="Description" value={description} onChange={(v) => { setDescription(v); markDirty(); }} />

      <details className="rounded-sm border border-[#E7DECE] bg-[#FBF8F1] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[#151411]">SEO et publication</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Meta title" value={metaTitle} onChange={(v) => { setMetaTitle(v); markDirty(); }} />
          <Field label="Meta description" value={metaDescription} onChange={(v) => { setMetaDescription(v); markDirty(); }} />
        </div>
        <Field label="Image Open Graph" value={ogImageUrl} onChange={(v) => { setOgImageUrl(v); markDirty(); }} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-[#71695F]">
            Date de publication programmée
            <input
              type="datetime-local"
              value={scheduledAt ?? ""}
              onChange={(e) => { setScheduledAt(e.target.value || null); markDirty(); }}
              className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
            />
          </label>
        </div>
      </details>

      <div className="space-y-3">
        <h3 className="font-serif text-lg text-[#151411]">Sections de contenu</h3>
        {blocks.map((block) => (
          <div key={block.id} className="rounded-sm border border-[#E7DECE] bg-[#FBF8F1] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#71695F]">{BLOCK_LABELS[block.type]}</span>
                <label className="flex items-center gap-1.5 text-xs text-[#71695F]">
                  <input
                    type="checkbox"
                    checked={block.visible !== false}
                    onChange={(e) => updateBlock(block.id, { visible: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-[#E7DECE]"
                  />
                  Visible
                </label>
              </div>
              <button type="button" onClick={() => removeBlock(block.id)} className="text-[#9B3444]">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Titre" value={block.heading ?? ""} onChange={(v) => updateBlock(block.id, { heading: v })} />
              <Field label="Sous-titre" value={block.subheading ?? ""} onChange={(v) => updateBlock(block.id, { subheading: v })} />
            </div>
            <TextAreaField label="Texte" value={block.body ?? ""} onChange={(v) => updateBlock(block.id, { body: v })} />
            {block.type === "cta" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Texte du bouton" value={block.buttonLabel ?? ""} onChange={(v) => updateBlock(block.id, { buttonLabel: v })} />
                <Field label="Lien du bouton" value={block.buttonHref ?? ""} onChange={(v) => updateBlock(block.id, { buttonHref: v })} />
              </div>
            )}
            {(block.type === "image" || block.type === "video") && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="URL du média" value={block.mediaUrl ?? ""} onChange={(v) => updateBlock(block.id, { mediaUrl: v })} />
                <Field label="Texte alternatif" value={block.mediaAlt ?? ""} onChange={(v) => updateBlock(block.id, { mediaAlt: v })} />
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {(["text", "cta", "image", "video"] as PageBlock["type"][]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addBlock(t)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs text-[#151411] hover:border-[#C6A15B]"
            >
              <Plus className="h-3.5 w-3.5" /> {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-[#692031]">{message}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-[#E7DECE] pt-4">
        <Button onClick={handleSaveDraft} disabled={saving || demoMode} icon={Save} variant="outline">
          {saving ? "Enregistrement..." : "Enregistrer le brouillon"}
        </Button>
        <Button onClick={() => setShowPreview((v) => !v)} variant="ghost" icon={Eye}>
          {showPreview ? "Masquer l'aperçu" : "Prévisualiser"}
        </Button>
        <Button onClick={handleRevert} disabled={demoMode} variant="ghost" icon={RotateCcw}>
          Annuler les changements
        </Button>
        <Button onClick={handlePublish} disabled={publishing || demoMode} icon={UploadCloud}>
          {publishing ? "Publication..." : "Mettre à jour le site"}
        </Button>
        <Button onClick={handleSchedule} disabled={scheduling || demoMode || !scheduledAt} icon={CalendarClock} variant="ghost">
          {scheduling ? "Programmation..." : "Programmer"}
        </Button>
        <Button onClick={handleArchive} disabled={archiving || demoMode} icon={Archive} variant="ghost">
          {archiving ? "Archivage..." : "Archiver"}
        </Button>
        {dirty && <span className="text-xs text-[#B97832]">Modifications non enregistrées</span>}
      </div>

      {showPreview && (
        <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
          <p className="mb-4 text-xs uppercase tracking-wider text-[#71695F]">Aperçu</p>
          <h1 className="font-serif text-3xl text-[#151411]">{title || "Titre de la page"}</h1>
          {subtitle && <p className="mt-1 text-lg text-[#71695F]">{subtitle}</p>}
          {description && <p className="mt-4 text-sm text-[#151411]">{description}</p>}
          <div className="mt-6 space-y-4">
            {blocks.map((b) => (
              <div key={b.id} className="border-t border-[#E7DECE] pt-4">
                {b.heading && <h2 className="font-serif text-xl text-[#151411]">{b.heading}</h2>}
                {b.subheading && <p className="text-sm text-[#71695F]">{b.subheading}</p>}
                {b.body && <p className="mt-2 text-sm text-[#151411]">{b.body}</p>}
                {b.type === "cta" && b.buttonLabel && (
                  <span className="mt-3 inline-block rounded-sm bg-[#692031] px-4 py-2 text-xs text-white">
                    {b.buttonLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[#71695F]">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-3 flex flex-col gap-1 text-xs text-[#71695F]">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="rounded-sm border border-[#E7DECE] bg-white px-3 py-2 text-sm text-[#151411] focus:border-[#C6A15B] focus:outline-none"
      />
    </label>
  );
}
