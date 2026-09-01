"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "t3_intro_seen_v1";
const SHOW_MS = 1400;
const MAX_MS = 2500;
const SKIP_PATHS = ["/admin", "/login", "/inscription", "/checkout", "/commande", "/auth"];

function getServerVisible(): boolean {
  return false;
}

function getClientVisible(pathname: string): boolean {
  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function reducedMotionClient(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useIntroVisible(): boolean {
  const pathname = usePathname();
  return useSyncExternalStore(
    () => () => {},
    () => getClientVisible(pathname),
    getServerVisible,
  );
}

function useIntroReduced(): boolean {
  return useSyncExternalStore(
    () => () => {},
    reducedMotionClient,
    () => false,
  );
}

export function IntroSplash() {
  const visible = useIntroVisible();
  const reduced = useIntroReduced();
  const [dismissed, setDismissed] = useState(false);
  const show = visible && !dismissed;

  useEffect(() => {
    if (!show) return;

    const hExit = setTimeout(() => {
      setDismissed(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // rien
      }
    }, SHOW_MS);

    const hGuard = setTimeout(() => {
      setDismissed(true);
    }, MAX_MS);

    return () => {
      clearTimeout(hExit);
      clearTimeout(hGuard);
    };
  }, [show]);

  const onComplete = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // rien
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: "easeInOut" }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center",
            "bg-[#151411]",
          )}
          role="status"
          aria-live="polite"
          aria-label="Chargement de Terminal 3"
        >
          <div className="relative flex h-48 w-48 items-end justify-center">
            <BottleSvg />
            <Corkscrew onComplete={onComplete} reduced={reduced} />
          </div>
          <noscript>
            <style>{"#intro-splash-root{display:none !important}"}</style>
          </noscript>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BottleSvg() {
  return (
    <svg
      viewBox="0 0 120 240"
      className="h-40 w-auto text-ivory/90"
      aria-hidden
    >
      <defs>
        <linearGradient id="bottleGlare" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="35%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="65%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M38,20 L82,20 L82,70 C82,92 95,105 98,128 L98,200 C98,220 92,228 74,230 L46,230 C28,228 22,220 22,200 L22,128 C25,105 38,92 38,70 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M38,20 L82,20 L82,70 C82,92 95,105 98,128 L98,200 C98,220 92,228 74,230 L46,230 C28,228 22,220 22,200 L22,128 C25,105 38,92 38,70 Z"
        fill="url(#bottleGlare)"
        stroke="none"
      />
      <rect x="34" y="14" width="52" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <line x1="44" y1="130" x2="76" y2="130" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="44" y1="160" x2="76" y2="160" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function Corkscrew({ onComplete, reduced }: { onComplete: () => void; reduced: boolean }) {
  return (
    <motion.div
      initial={{ y: -180, opacity: 0 }}
      animate={{
        y: [-180, -95, -95, -70],
        opacity: [0, 1, 1, 1],
        rotate: [0, 0, -720, -720],
      }}
      transition={{
        duration: reduced ? 0.1 : 0.95,
        times: [0, 0.35, 0.55, 1],
        ease: ["easeOut", "linear", "linear", "easeIn"],
      }}
      onAnimationComplete={onComplete}
      className="absolute -top-8 left-1/2 -translate-x-1/2"
    >
      <svg viewBox="0 0 80 160" className="h-28 w-auto text-champagne" aria-hidden>
        <line x1="40" y1="0" x2="40" y2="70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path
          d="M40,70 L40,92 C40,118 20,110 20,128 C20,146 40,150 40,150"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="40" cy="150" rx="10" ry="6" fill="currentColor" />
        <rect x="20" y="0" width="40" height="18" rx="3" fill="currentColor" />
      </svg>
      {reduced && <span className="sr-only">Chargement de Terminal 3</span>}
    </motion.div>
  );
}
