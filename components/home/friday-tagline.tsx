"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TAGLINES = [
  "Tout ce qu’il faut pour une belle table de Chabbat",
  "Votre sélection du vendredi, prête à partager",
  "De belles bouteilles pour de beaux moments",
  "Faites de votre table un moment d’exception",
  "Le vendredi commence par une belle sélection",
  "Pour Chabbat, choisissez ce qui rassemble",
  "Une sélection raffinée pour recevoir ceux que vous aimez",
];

const CYCLE_MS = 5000;

export function FridayTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TAGLINES.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="mb-4 h-6 overflow-hidden text-sm font-medium italic text-or-principal/90"
      aria-live="off"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={TAGLINES[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="block"
        >
          {TAGLINES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
