"use client";

import { useState, useTransition } from "react";
import { setSalmonGalleryImages } from "@/app/admin/store/actions";
import type { SalmonGalleryImage } from "@/lib/settings";

export function SalmonGalleryEditor({
  initialImages,
}: {
  initialImages: SalmonGalleryImage[];
}) {
  const [text, setText] = useState(
    initialImages.map((img) => img.url).join("\n"),
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    const urls = text.split("\n").map((line) => line.trim()).filter(Boolean);
    startTransition(async () => {
      try {
        await setSalmonGalleryImages(urls);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // no-op — button simply stays available to retry
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"https://xxxx.supabase.co/storage/v1/object/public/media/plateau-1.jpg\nhttps://.../plateau-2.jpg\n..."}
        className="rounded-sm border border-white/10 bg-graphite px-4 py-3 font-mono text-xs text-ivory outline-none focus:border-champagne"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-grey">
          Une URL d&rsquo;image par ligne (max 10). Uploadez d&rsquo;abord les
          photos dans Supabase Storage.
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-champagne px-5 py-2 text-xs font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
        >
          {isPending ? "..." : saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
