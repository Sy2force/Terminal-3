export function WineTastingNotes({ notes }: { notes: string | null }) {
  if (!notes) return null;

  // Tasting notes are stored as one free-text field (e.g. "Cassis, cèdre,
  // épices"); split on commas/middle dots into small tags when it reads
  // like a list, otherwise show the sentence as-is.
  const parts = notes
    .split(/[,·•]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return <p className="text-sm leading-relaxed text-noir-profond/80">{notes}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((part) => (
        <span
          key={part}
          className="rounded-full border border-or-principal/30 bg-or-principal/5 px-3.5 py-1.5 text-sm text-noir-profond"
        >
          {part}
        </span>
      ))}
    </div>
  );
}
