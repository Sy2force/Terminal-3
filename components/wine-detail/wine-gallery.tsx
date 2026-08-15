"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductMediaRow } from "@/types/database";

export function WineGallery({
  images,
  name,
}: {
  images: ProductMediaRow[];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const active = images[activeIndex];

  function goTo(delta: number) {
    setActiveIndex((i) => (i + delta + images.length) % images.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goTo(-1);
    if (e.key === "ArrowRight") goTo(1);
    if (e.key === "Enter" || e.key === " ") setZoomOpen(true);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-sm border border-brun-cave/20 bg-beige-fonce">
        <span className="font-serif text-lg text-brun-cave/50">Terminal 3</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Photo ${activeIndex + 1} sur ${images.length} — appuyez pour zoomer`}
        onClick={() => setZoomOpen(true)}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-sm border border-brun-cave/15 bg-gradient-to-b from-[#F1EADC] to-[#E7DECE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux-principal"
      >
        {/* Halo */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-or-principal/10 blur-3xl" />

        <Image
          src={active.url}
          alt={active.alt ?? name}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          priority
          className="object-contain p-8 drop-shadow-xl transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-noir-profond/70 px-3 py-1.5 text-[11px] text-texte-clair opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden />
          Zoomer
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={(e) => {
                e.stopPropagation();
                goTo(-1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-fond-papier/80 p-2 text-noir-profond opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={(e) => {
                e.stopPropagation();
                goTo(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-fond-papier/80 p-2 text-noir-profond opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Photos du produit">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Voir la photo ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border transition-colors sm:w-20 ${
                i === activeIndex ? "border-bordeaux-principal" : "border-brun-cave/20 hover:border-bordeaux-principal/50"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} — photo ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain bg-[#F1EADC] p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom overlay */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — photo agrandie`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-noir-profond/90 p-6"
          onClick={() => setZoomOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setZoomOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-fond-papier/10 p-2 text-texte-clair hover:bg-fond-papier/20"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
          <div
            className="relative h-full w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt ?? name}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
