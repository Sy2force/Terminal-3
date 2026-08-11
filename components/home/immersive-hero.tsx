"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function ImmersiveHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1) as hero moves through viewport
      const progress = Math.max(0, Math.min(1, -rect.top / windowHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scale = prefersReducedMotion ? 1 : 1 + scrollProgress * 0.18;
  const translateY = prefersReducedMotion ? 0 : scrollProgress * 80;
  const contentOpacity = 1 - scrollProgress * 1.2;
  const overlayOpacity = 0.3 + scrollProgress * 0.4;

  return (
    <div 
      ref={heroRef}
      className="relative h-screen overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Parallax Background Image */}
      <div
        ref={imageRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transition: prefersReducedMotion ? "none" : "transform 0.05s ease-out",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-wine-cellar.jpg')",
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        />
        {/* Dark overlay for text readability */}
        <div 
          className="absolute inset-0 bg-black"
          style={{
            opacity: overlayOpacity,
            transition: prefersReducedMotion ? "none" : "opacity 0.05s ease-out",
          }}
        />
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
            opacity: 0.5 + scrollProgress * 0.3,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="max-w-4xl space-y-8"
          style={{
            transform: prefersReducedMotion ? "none" : `translateY(${scrollProgress * 60}px)`,
            opacity: Math.max(0, contentOpacity),
            transition: prefersReducedMotion ? "none" : "transform 0.05s ease-out, opacity 0.05s ease-out",
          }}
        >
          {/* Logo/Brand */}
          <span className="inline-block text-xs uppercase tracking-[0.4em] text-champagne/90">
            Terminal 3
          </span>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-grey uppercase tracking-[0.2em]">
            Cave à vins et spiritueux casher
          </p>
          
          {/* Main Title */}
          <h1 className="font-serif text-5xl text-ivory sm:text-6xl lg:text-7xl xl:text-8xl leading-tight">
            Entrez dans l'univers<br />
            <span className="text-champagne">Terminal 3</span>
          </h1>
          
          {/* Description */}
          <p className="max-w-2xl text-lg text-ivory/80 sm:text-xl lg:text-2xl leading-relaxed">
            Une expérience sensorielle au cœur de Jérusalem. Sélection premium de vins, 
            plateaux raffinés et produits d'exception.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
            <Link
              href="#carousel"
              className="group relative inline-flex items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 px-8 py-4 text-sm font-medium tracking-wider text-champagne transition-all hover:bg-champagne hover:text-obsidian"
            >
              Découvrir la cave
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transition: prefersReducedMotion ? "none" : "opacity 0.05s ease-out",
        }}
      >
        <span className="text-xs uppercase tracking-widest text-ivory/60">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-champagne/60 to-transparent" />
      </div>
    </div>
  );
}
