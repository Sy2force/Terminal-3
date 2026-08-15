"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Percent, Truck, Wine, Fish, GlassWater } from "lucide-react";

const PROMO_MESSAGES = [
  { icon: Percent, text: "Cette semaine : -15% sur les vins rouges israéliens" },
  { icon: Fish, text: "Saumon fumé : 2 achetés = 10% de remise" },
  { icon: GlassWater, text: "Whisky Chivas 12 en promotion" },
  { icon: Truck, text: "Livraison offerte à Jérusalem dès 250₪" },
  { icon: Sparkles, text: "Nouveautés casher mehadrin, découvrir vite" },
  { icon: Wine, text: "Domaine du Castel : sélection prestige en ligne" },
];

export function PromoMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    let pos = 0;
    const speed = 0.6;

    function step() {
      if (!track) return;
      pos += speed;
      if (pos >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-or-principal/20 bg-gradient-to-r from-bordeaux-principal via-bordeaux-fonce to-bordeaux-principal py-3">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-bordeaux-principal to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-bordeaux-principal to-transparent" />
      <div ref={trackRef} className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
        {[...PROMO_MESSAGES, ...PROMO_MESSAGES].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4">
            <item.icon className="h-4 w-4 text-or-principal" aria-hidden />
            <span className="text-sm font-medium uppercase tracking-wider text-ivory">
              {item.text}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-or-principal" aria-hidden />
          </div>
        ))}
      </div>
    </section>
  );
}
