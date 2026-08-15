"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import type { ProductWithMedia } from "@/lib/data/catalog";
import { GlassButton } from "@/components/ui/glass-button";

interface HeroBottleCarouselProps {
  bottles: ProductWithMedia[];
}

const AUTO_INTERVAL_MS = 6000;

export function HeroBottleCarousel({ bottles }: HeroBottleCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottles.length <= 1 || paused) return;
    const id = setInterval(() => {
      goNext();
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [bottles.length, paused, index]);

  const goTo = (i: number, dir = 0) => {
    const next = ((i % bottles.length) + bottles.length) % bottles.length;
    setDirection(dir || (next > index ? 1 : -1));
    setIndex(next);
  };

  const goNext = () => goTo(index + 1, 1);
  const goPrev = () => goTo(index - 1, -1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 60;
    const velocityThreshold = 300;
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      goNext();
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      goPrev();
    }
  };

  if (bottles.length === 0) {
    return (
      <div className="relative flex h-[420px] w-[220px] items-center justify-center rounded-sm border border-or-principal/20 bg-gradient-to-b from-brun-cave to-noir-profond">
        <span className="px-4 text-center font-serif text-texte-clair/40">
          Sélection à venir
        </span>
      </div>
    );
  }

  const bottle = bottles[index];
  const media = bottle.media?.[0]?.url;
  const variant = bottle.variants?.[0];
  const price = variant?.regular_price_agorot ? Math.round(variant.regular_price_agorot / 100) : null;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.92,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.92,
    }),
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Sélection de bouteilles en vedette"
      className="relative flex w-full flex-col items-center outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Halo glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[70%] w-[70%] rounded-full bg-or-principal/10 blur-[80px]" />
      </div>

      {/* 3D bottle stage */}
      <div className="relative flex h-[min(88svh,900px)] w-full items-center justify-center perspective-[1200px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={bottle.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag={bottles.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            className="relative z-10 h-[min(78svh,800px)] w-[92%] max-w-[560px] cursor-grab active:cursor-grabbing md:w-[58%] md:max-w-none"
          >
            {/* Shadow */}
            <div className="absolute -bottom-10 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/40 blur-2xl" />

            {/* Real bottle image */}
            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden">
              {media ? (
                <Image
                  src={media}
                  alt={bottle.name_fr || bottle.name_he || "Bouteille"}
                  fill
                  unoptimized
                  priority
                  className="scale-[1.6] object-contain drop-shadow-2xl"
                  sizes="(max-width: 768px) 80vw, 45vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-sm border border-or-principal/20 bg-gradient-to-b from-brun-cave to-noir-profond">
                  <span className="px-4 text-center font-serif text-texte-clair/40">
                    {bottle.name_fr || bottle.name_he}
                  </span>
                </div>
              )}
            </div>

            {/* Selection badge */}
            <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 bg-bordeaux-principal px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-texte-clair shadow-lg">
              Sélection du vendredi
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product info */}
      <div
        className="mt-6 w-full max-w-md text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="font-serif text-2xl text-texte-clair md:text-3xl">
          {bottle.name_fr || bottle.name_he}
        </h2>
        {bottle.brand && (
          <p className="mt-1 text-sm text-or-principal/90">{bottle.brand}</p>
        )}
        <p className="mt-1 text-sm text-texte-clair/60">
          {bottle.category?.name_fr ?? "Vin"}
          {variant?.vintage ? ` · ${variant.vintage}` : ""}
        </p>
        {price !== null && (
          <p className="mt-2 font-serif text-2xl text-or-principal">{price} ₪</p>
        )}

        <div className="mt-4 flex items-center justify-center gap-3">
          <GlassButton href={`/products/${bottle.slug}`} icon={ArrowRight}>
            Découvrir ce vin
          </GlassButton>
          <button
            type="button"
            aria-label="Ajouter à ma sélection"
            className="rounded-full border border-or-principal/30 p-3 text-or-principal transition-colors hover:bg-or-principal/10"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      {bottles.length > 1 && (
        <div className="mt-8 flex w-full items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Bouteille précédente"
            className="rounded-full border border-or-principal/20 p-2 text-or-principal transition-colors hover:bg-or-principal/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Bouteilles">
            {bottles.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                onClick={() => goTo(i)}
                aria-label={`Voir ${b.name_fr || b.name_he}`}
                aria-selected={i === index}
                className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-or-principal focus-visible:ring-offset-2 focus-visible:ring-offset-noir-profond ${
                  i === index ? "w-6 bg-or-principal" : "w-2 bg-or-principal/30 hover:bg-or-principal/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Bouteille suivante"
            className="rounded-full border border-or-principal/20 p-2 text-or-principal transition-colors hover:bg-or-principal/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
