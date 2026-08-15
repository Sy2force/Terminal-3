"use client";

import Image from "next/image";
import { ArrowRight, Star, Truck, MessageCircle, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/glass-button";
import { FridayTagline } from "@/components/home/friday-tagline";
import type { SiteSettings } from "@/lib/settings";
import type { ProductWithMedia } from "@/lib/data/catalog";

interface LuxuryHeroSectionProps {
  settings: SiteSettings;
  bottles?: ProductWithMedia[];
  title?: string;
  subtitle?: string;
  backgroundImage?: string | null;
}

const TRUST_PROOFS = [
  { icon: BadgeCheck, label: "200+ références sélectionnées" },
  { icon: Truck, label: "Livraison à Jérusalem" },
  { icon: Star, label: "Conseils personnalisés" },
  { icon: MessageCircle, label: "Commande rapide par WhatsApp" },
];

export function LuxuryHeroSection({
  settings,
  title,
  subtitle,
  backgroundImage,
}: LuxuryHeroSectionProps) {
  const city = settings.STORE_ADDRESS?.includes("Jérusalem") ||
    settings.STORE_ADDRESS?.includes("Jerusalem")
    ? "Jérusalem"
    : "Jérusalem";

  const mainTitle = title ?? (
    <>
      <Image
        src={settings.LOGO_URL}
        alt="Terminal 3"
        width={500}
        height={200}
        unoptimized
        priority
        className="h-16 w-auto object-contain sm:h-20 lg:h-24"
      />
      <br />
      <span className="text-or-principal">Vins, spiritueux et épicerie fine</span>
    </>
  );

  const description =
    subtitle ??
    "La sélection Jérusalem — vins casher, whiskies rares, saumon fumé, charcuterie et plateaux préparés avec soin pour Chabbat, vos réceptions et vos soirées.";

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-noir-profond"
      aria-label="Accueil Terminal 3"
    >
      {/* Cover image with transparent overlay */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        <Image
          src={backgroundImage ?? "/images/terminal-3/couvertures/store.webp"}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover opacity-[0.65]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-profond/80 via-noir-profond/40 to-noir-profond/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-noir-profond/30 via-transparent to-noir-profond/70" />
      </div>

      {/* Animated deep gradient background */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-bordeaux-principal/30 via-brun-cave/40 to-noir-profond" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_40%,_rgba(198,161,91,0.12),_transparent_50%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_80%,_rgba(155,52,68,0.22),_transparent_45%)]" />

      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Fine golden lines */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute left-0 top-1/3 h-px w-1/2 bg-gradient-to-r from-or-principal/40 to-transparent" />
        <div className="absolute bottom-1/4 right-0 h-px w-1/3 bg-gradient-to-l from-or-principal/30 to-transparent" />
        <div className="absolute left-1/3 top-0 h-1/2 w-px bg-gradient-to-b from-or-principal/20 to-transparent" />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(21,20,17,0.65)_100%)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          {/* Editorial content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left"
          >
            <FridayTagline />

            <div className="mb-5 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-or-principal/80 lg:justify-start">
              <span className="h-px w-10 bg-or-principal/60" />
              <span>La sélection du vendredi</span>
            </div>

            <h1 className="max-w-3xl font-serif text-4xl leading-[1.1] text-texte-clair sm:text-5xl md:text-6xl lg:text-7xl">
              {mainTitle}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-texte-clair/80 sm:text-lg md:text-xl">
              {description}
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <GlassButton href="/vins" variant="gold" icon={ArrowRight}>
                Préparer mon vendredi
              </GlassButton>
              <GlassButton href="/promotions" variant="dark">
                Découvrir la sélection
              </GlassButton>
            </div>

            <dl className="mt-10 grid w-full grid-cols-2 gap-x-4 gap-y-4 border-t border-or-principal/15 pt-8 sm:grid-cols-4 lg:max-w-2xl">
              {TRUST_PROOFS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                  <Icon className="h-5 w-5 text-or-principal" aria-hidden />
                  <dt className="text-xs leading-snug text-texte-clair/70">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs text-texte-clair/40">Livraison {city}</p>
          </motion.div>

          {/* 2D bottle stage */}
          <div className="order-1 flex min-h-[55svh] items-center justify-center lg:order-2 lg:min-h-[70svh]">
            <Image
              src="/images/terminal-3/wines/castel/petit-castel-2020.png"
              alt="Bouteille Petit Castel"
              width={500}
              height={900}
              unoptimized
              priority
              className="h-auto w-[70vw] max-w-[420px] object-contain drop-shadow-2xl lg:max-w-[620px]"
            />
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-texte-clair/40">
        <span className="text-[10px] uppercase tracking-wider">Découvrir</span>
        <div className="h-6 w-px bg-gradient-to-b from-or-principal/60 to-transparent" />
      </div>
    </section>
  );
}
