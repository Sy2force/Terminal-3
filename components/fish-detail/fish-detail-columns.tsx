"use client";

import { useState, type ReactNode } from "react";
import { WineGallery } from "@/components/wine-detail/wine-gallery";
import { WinePurchasePanel, type PurchaseVariantOption } from "@/components/wine-detail/wine-purchase-panel";
import type { ProductMediaRow } from "@/types/database";

/**
 * Two-column fiche layout (gallery left, info right) that keeps the
 * gallery in sync with the selected variant — some fish formats (e.g. a
 * glass jar vs. a bulk pack) have their own photo. Falls back to the
 * shared product photos when the selected variant has none of its own,
 * and to the full product gallery when no variant is selected at all.
 */
export function FishDetailColumns({
  media,
  name,
  beforePanel,
  afterPanel,
  panelProps,
  variants,
}: {
  media: ProductMediaRow[];
  name: string;
  beforePanel: ReactNode;
  afterPanel?: ReactNode;
  panelProps: Omit<
    React.ComponentProps<typeof WinePurchasePanel>,
    "variants" | "onVariantChange"
  >;
  variants?: PurchaseVariantOption[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants?.[0]?.id ?? panelProps.variantId,
  );

  const variantMedia = selectedVariantId
    ? media.filter((m) => m.variant_id === selectedVariantId)
    : [];
  const productMedia = media.filter((m) => !m.variant_id);
  const galleryMedia = variantMedia.length > 0 ? variantMedia : productMedia.length > 0 ? productMedia : media;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="rounded-sm bg-beige-fonce/60 p-4 sm:p-8">
        <WineGallery images={galleryMedia} name={name} />
      </div>

      <div className="flex flex-col gap-6">
        {beforePanel}
        <WinePurchasePanel {...panelProps} variants={variants} onVariantChange={setSelectedVariantId} />
        {afterPanel}
      </div>
    </div>
  );
}
