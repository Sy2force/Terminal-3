"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { LoginPanel } from "@/components/auth/login-panel";
import { SignupPanel } from "@/components/auth/signup-panel";

type Mode = "login" | "signup";

const PANELS: { key: Mode; label: string }[] = [
  { key: "login", label: "Se connecter" },
  { key: "signup", label: "Créer un compte" },
];

function AuthCarouselInner({ initialMode }: { initialMode: Mode }) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/compte";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [direction, setDirection] = useState(0);

  function switchTo(next: Mode) {
    if (next === mode) return;
    const nextIndex = PANELS.findIndex((p) => p.key === next);
    const currentIndex = PANELS.findIndex((p) => p.key === mode);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setMode(next);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 80;
    const velocityThreshold = 400;
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      switchTo("signup");
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      switchTo("login");
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      {/* Tabs */}
      <div className="relative flex rounded-full border border-white/10 bg-graphite p-1">
        {PANELS.map((panel) => (
          <button
            key={panel.key}
            type="button"
            onClick={() => switchTo(panel.key)}
            className="relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ color: mode === panel.key ? "#0a0a0a" : undefined }}
          >
            {mode === panel.key && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 -z-10 rounded-full bg-champagne"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={mode === panel.key ? "text-obsidian" : "text-ivory/70"}>
              {panel.label}
            </span>
          </button>
        ))}
      </div>

      {/* Swipeable panel */}
      <div className="relative mt-8 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={mode}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            {mode === "login" ? (
              <LoginPanel redirectTo={redirectTo} />
            ) : (
              <SignupPanel redirectTo={redirectTo} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-xs text-muted-grey">
        Glissez pour basculer entre connexion et inscription.
      </p>
    </div>
  );
}

export function AuthCarousel({ initialMode }: { initialMode: Mode }) {
  return (
    <Suspense fallback={null}>
      <AuthCarouselInner initialMode={initialMode} />
    </Suspense>
  );
}
