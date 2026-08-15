"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  rating: number;
  message: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    name: "David Cohen",
    rating: 5,
    message: "Une sélection exceptionnelle de vins casher. Le personnel est très connaisseur et les conseils sont toujours parfaits.",
    date: "Janvier 2026",
  },
  {
    name: "Sarah Levy",
    rating: 5,
    message: "Les saumons fumés sont incroyables. Frais et savoureux, parfaits pour nos repas de Shabbat.",
    date: "Décembre 2025",
  },
  {
    name: "Michel Azoulay",
    rating: 5,
    message: "Service impeccable et produits de qualité. Terminal 3 est devenu mon adresse incontournable pour les vins.",
    date: "Novembre 2025",
  },
  {
    name: "Rachel Dahan",
    rating: 5,
    message: "L'ambiance y est unique. On se sent comme dans une vraie cave française mais à Jérusalem.",
    date: "Octobre 2025",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => {
    const newIndex = prev - 1;
    return newIndex < 0 ? testimonials.length - 1 : newIndex;
  });

  return (
    <section 
      className="py-24 bg-fond-papier"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">Témoignages</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-noir-profond mb-4">
            Ce que nos clients disent
          </h2>
          <p className="text-lg text-gris-chaud max-w-2xl mx-auto">
            Des avis authentiques de notre communauté de passionnés.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="relative overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="p-8 bg-white rounded-sm border border-or-principal/20 shadow-lg">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-or-principal fill-current" />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-noir-profond/80 leading-relaxed mb-6 text-center text-lg italic">
                    &ldquo;{testimonial.message}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="text-center">
                    <p className="font-serif text-xl text-noir-profond">{testimonial.name}</p>
                    <p className="text-sm text-gris-chaud">{testimonial.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-or-principal/30 flex items-center justify-center text-or-principal hover:bg-or-principal hover:text-noir-profond transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-or-principal' : 'bg-or-principal/30'
                  }`}
                  aria-label={`Avis ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-or-principal/30 flex items-center justify-center text-or-principal hover:bg-or-principal hover:text-noir-profond transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}