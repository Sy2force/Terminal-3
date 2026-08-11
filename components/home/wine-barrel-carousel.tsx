"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";

const PREMIUM_WINES = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Margaux, Bordeaux",
    price: "1,200 €",
    description: "Un vin d'exception aux arômes de cassis, de violette et d'épices douces. Tanins soyeux et finale longue.",
    color: "#8B0000",
    rating: 98,
  },
  {
    id: 2,
    name: "Romanée-Conti 2018",
    region: "Burgundy, France",
    price: "15,000 €",
    description: "Le Pinot Noir ultime. Notes de cerise noire, truffe et sous-bois. Complexité inégalée.",
    color: "#722F37",
    rating: 100,
  },
  {
    id: 3,
    name: "Pétrus 2016",
    region: "Pomerol, Bordeaux",
    price: "4,500 €",
    description: "Merlot puissant et élégant. Arômes de prune, chocolat noir et cuir. Texture veloutée.",
    color: "#800020",
    rating: 99,
  },
  {
    id: 4,
    name: "Opus One 2019",
    region: "Napa Valley, USA",
    price: "380 €",
    description: "Cabernet Sauvignon raffiné. Notes de cassis, tabac blond et vanille. Équilibre parfait.",
    color: "#4A0404",
    rating: 96,
  },
  {
    id: 5,
    name: "Sassicaia 2017",
    region: "Tuscany, Italy",
    price: "420 €",
    description: "Super Toscan légendaire. Cassis, eucalyptus et tabac. Structure élégante et persistante.",
    color: "#6B0F1A",
    rating: 97,
  },
  {
    id: 6,
    name: "Penfolds Grange 2017",
    region: "South Australia",
    price: "650 €",
    description: "Shiraz iconique. Fruits noirs, chocolat et épices. Puissance et finesse exceptionnelles.",
    color: "#5C0A0A",
    rating: 98,
  },
];

export function WineBarrelCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PREMIUM_WINES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % PREMIUM_WINES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + PREMIUM_WINES.length) % PREMIUM_WINES.length);
  };

  const currentWine = PREMIUM_WINES[currentIndex];

  return (
    <section 
      className="relative h-screen overflow-hidden bg-obsidian"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${currentWine.color}22, ${currentWine.color}44), url('/images/hero-wine-cellar.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-obsidian" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h2 className="font-serif text-2xl text-ivory">
              Sélection <span className="text-champagne">Premium</span>
            </h2>
            <p className="text-xs text-muted-grey uppercase tracking-[0.3em] mt-1">
              Vins d'exception
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full border border-white/20 bg-white/5 text-ivory hover:border-champagne hover:text-champagne transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full border border-white/20 bg-white/5 text-ivory hover:border-champagne hover:text-champagne transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Wine Info */}
            <div className="space-y-8">
              {/* Rating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-champagne/50 bg-champagne/10">
                <span className="text-champagne font-bold text-xl">{currentWine.rating}</span>
                <span className="text-champagne/80 text-sm">/ 100</span>
              </div>

              {/* Wine Name */}
              <h1 className="font-serif text-5xl lg:text-7xl text-ivory leading-tight">
                {currentWine.name}
              </h1>

              {/* Region */}
              <p className="text-lg text-muted-grey uppercase tracking-[0.2em]">
                {currentWine.region}
              </p>

              {/* Description */}
              <p className="text-lg text-ivory/80 leading-relaxed max-w-xl">
                {currentWine.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-4xl text-champagne">
                  {currentWine.price}
                </span>
                <span className="text-muted-grey">/ bouteille</span>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-champagne text-obsidian font-semibold hover:bg-soft-gold transition-all">
                  <Play className="h-5 w-5" />
                  Voir détails
                </button>
                <button className="flex items-center gap-2 px-8 py-4 rounded-full border border-champagne/50 text-champagne hover:bg-champagne/10 transition-all">
                  <Info className="h-5 w-5" />
                  Plus d'info
                </button>
              </div>
            </div>

            {/* Wine Visual - Large Card */}
            <div className="relative">
              <div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 ease-out"
                style={{
                  background: `linear-gradient(135deg, ${currentWine.color}33, ${currentWine.color}66)`,
                  border: "3px solid rgba(197, 163, 90, 0.4)",
                  boxShadow: `
                    0 25px 50px -12px ${currentWine.color}44,
                    0 0 0 1px rgba(197, 163, 90, 0.2)
                  `,
                  transform: "scale(1.02)",
                }}
              >
                {/* Shine Effect */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                  }}
                />

                {/* Wine Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 px-4 py-2 rounded-full border border-champagne/60 bg-champagne/15">
                    <span className="text-xs uppercase tracking-[0.3em] text-champagne">
                      Premium Selection
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl text-ivory mb-3 leading-tight">
                    {currentWine.name}
                  </h3>

                  <p className="text-sm text-muted-grey mb-6 uppercase tracking-widest">
                    {currentWine.region}
                  </p>

                  <div className="mt-auto">
                    <span className="font-serif text-5xl text-champagne">
                      {currentWine.price}
                    </span>
                  </div>
                </div>

                {/* Reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 pb-8">
          {PREMIUM_WINES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-champagne w-16"
                  : "bg-white/20 w-8 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
