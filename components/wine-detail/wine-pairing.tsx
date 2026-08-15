import Link from "next/link";

const CATEGORY_HINTS: { keywords: string[]; href: string; label: string }[] = [
  { keywords: ["charcuterie"], href: "/charcuterie", label: "Voir notre charcuterie" },
  { keywords: ["saumon", "poisson"], href: "/poissons", label: "Voir nos poissons fumés" },
];

export function WinePairing({ pairingNotes }: { pairingNotes: string | null }) {
  if (!pairingNotes) return null;

  const parts = pairingNotes
    .split(/[,.]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const lowerText = pairingNotes.toLowerCase();
  const links = CATEGORY_HINTS.filter((hint) => hint.keywords.some((k) => lowerText.includes(k)));

  return (
    <div className="space-y-4">
      {parts.length > 1 ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {parts.map((part) => (
            <li key={part} className="flex items-center gap-2 text-sm text-noir-profond/80">
              <span className="h-1.5 w-1.5 rounded-full bg-or-principal" aria-hidden />
              {part}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-noir-profond/80">{pairingNotes}</p>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-widest text-bordeaux-principal hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
