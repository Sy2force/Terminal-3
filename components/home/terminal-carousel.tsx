"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { HeroSlide } from "@/types/database";
import { HERO_SLIDES } from "@/lib/data/hero-slides";

export function TerminalCarousel() {
  const slides = HERO_SLIDES.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play with progress bar
  useEffect(() => {
    if (!isVisible || isTransitioning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const startTime = Date.now();
    const duration = 6000; // 6 seconds per slide

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progressRef.current = Math.min(elapsed / duration, 1);

      if (progressRef.current >= 1) {
        nextSlide();
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, isTransitioning, currentIndex]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    progressRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    progressRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    progressRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, prevSlide, nextSlide]);

  // Touch/swipe support
  const touchStartRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <section
      id="carousel"
      ref={containerRef}
      className="relative w-full overflow-hidden bg-obsidian"
      role="region"
      aria-label="Carrousel Terminal 3"
      aria-roledescription="carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url('${currentSlide.imageDesktop}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: isTransitioning ? "scale(1.06)" : "scale(1)",
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Category */}
            <div
              className="inline-block"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                transition: "all 0.5s ease-out 0.1s",
              }}
            >
              <span className="text-xs lg:text-sm uppercase tracking-[0.3em] text-champagne">
                {currentSlide.category}
              </span>
            </div>

            {/* Badge */}
            {currentSlide.badge && (
              <div
                className="inline-block"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                  transition: "all 0.5s ease-out 0.15s",
                }}
              >
                <span className="px-3 py-1 rounded-full border border-champagne/50 bg-champagne/10 text-[10px] lg:text-xs uppercase tracking-[0.2em] text-champagne">
                  {currentSlide.badge}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-ivory leading-tight"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                transition: "all 0.5s ease-out 0.2s",
              }}
            >
              {currentSlide.title}
            </h1>

            {/* Description */}
            <p
              className="text-sm sm:text-base lg:text-lg text-ivory/80 leading-relaxed max-w-xl"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                transition: "all 0.5s ease-out 0.25s",
              }}
            >
              {currentSlide.description}
            </p>

            {/* Metadata */}
            {currentSlide.metadata && currentSlide.metadata.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                  transition: "all 0.5s ease-out 0.3s",
                }}
              >
                {currentSlide.metadata.map((item, index) => (
                  <span key={index} className="text-xs text-muted-grey">
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? "translateY(-20px)" : "translateY(0)",
                transition: "all 0.5s ease-out 0.35s",
              }}
            >
              <Link
                href={currentSlide.primaryButtonLink}
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-champagne text-obsidian font-semibold text-sm sm:text-base hover:bg-soft-gold transition-all"
              >
                {currentSlide.primaryButtonLabel}
              </Link>
              {currentSlide.secondaryButtonLabel && currentSlide.secondaryButtonLink && (
                <Link
                  href={currentSlide.secondaryButtonLink}
                  className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-full border border-white/20 text-ivory text-sm sm:text-base hover:border-champagne hover:text-champagne transition-all"
                >
                  {currentSlide.secondaryButtonLabel}
                </Link>
              )}
            </div>
          </div>

          {/* Right - Thumbnails */}
          <div className="hidden lg:flex flex-col items-end justify-end space-y-3">
            {slides.slice(0, 5).map((slide, index) => {
              const isActive = index === currentIndex;
              const isNext = index === (currentIndex + 1) % slides.length;
              const isPrev = index === (currentIndex - 1 + slides.length) % slides.length;

              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`relative flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-white/10 border border-champagne/50"
                      : isNext || isPrev
                      ? "bg-white/5 border border-white/10 hover:bg-white/10"
                      : "bg-transparent border border-transparent opacity-40"
                  }`}
                  style={{
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {/* Thumbnail Image */}
                  <div
                    className="relative w-20 h-14 rounded overflow-hidden"
                    style={{
                      backgroundImage: `url('${slide.imageDesktop}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Thumbnail Info */}
                  <div className="text-left flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-champagne">
                      {slide.category}
                    </p>
                    <p className="text-xs text-ivory truncate">{slide.title}</p>
                  </div>

                  {/* Progress Bar for Active Slide */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-champagne/30">
                      <div
                        className="h-full bg-champagne transition-all duration-100"
                        style={{ width: `${progressRef.current * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full border border-white/20 bg-black/30 text-ivory hover:border-champagne hover:text-champagne transition-all"
          aria-label="Diapositive précédente"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full border border-white/20 bg-black/30 text-ivory hover:border-champagne hover:text-champagne transition-all"
          aria-label="Diapositive suivante"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Thumbnails */}
      <div className="lg:hidden absolute bottom-4 left-0 right-0 flex gap-2 px-4 overflow-x-auto">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all ${
              index === currentIndex
                ? "ring-2 ring-champagne"
                : "opacity-60"
            }`}
            style={{
              backgroundImage: `url('${slide.imageDesktop}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label={`Aller à ${slide.title}`}
          />
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-4 right-4 lg:right-8 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex
                ? "bg-champagne w-8"
                : "bg-white/20 w-2 hover:bg-white/40"
            }`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
